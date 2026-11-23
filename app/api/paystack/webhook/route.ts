import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { markPaymentPaid } from "@/lib/mark-payment-paid";

export const runtime = "nodejs";

function safeEqualHex(expected: string, received: string) {
  if (!/^[0-9a-f]{128}$/i.test(received)) return false;
  const expectedBytes = Buffer.from(expected, "hex");
  const receivedBytes = Buffer.from(received, "hex");
  return expectedBytes.length === receivedBytes.length && timingSafeEqual(expectedBytes, receivedBytes);
}

function verifyModernSignature(rawBody: Buffer, header: string, secret: string) {
  let timestamp: number | null = null;
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key === "t") {
      if (timestamp !== null || !/^\d+$/.test(value)) return false;
      timestamp = Number(value);
    } else if (key === "v1") {
      const colon = value.indexOf(":");
      if (colon >= 0) signatures.push(value.slice(colon + 1));
    }
  }
  if (timestamp === null || Math.abs(Math.floor(Date.now() / 1000) - timestamp) > 300) return false;
  const expected = createHmac("sha512", secret).update(`${timestamp}.`).update(rawBody).digest("hex");
  return signatures.some((signature) => safeEqualHex(expected, signature));
}

function verifyLegacySignature(rawBody: Buffer, header: string, secret: string) {
  if (!/^[0-9a-f]{128}$/i.test(header)) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest();
  const received = Buffer.from(header, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = Buffer.from(await request.arrayBuffer());
    if (rawBody.length > 1_000_000) return NextResponse.json({ error: "Payload too large." }, { status: 413 });

    const modernSignature = request.headers.get("paystack-signature");
    const legacySignature = request.headers.get("x-paystack-signature");
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const signatureValid = modernSignature && webhookSecret
      ? verifyModernSignature(rawBody, modernSignature, webhookSecret)
      : legacySignature && secretKey
        ? verifyLegacySignature(rawBody, legacySignature, secretKey)
        : false;

    if (!signatureValid) return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });

    const event = JSON.parse(rawBody.toString("utf8"));
    if (event?.event !== "charge.success") return NextResponse.json({ received: true });

    const data = event?.data;
    const reference = typeof data?.reference === "string" ? data.reference : "";
    if (!/^ADS-[A-Za-z0-9-]{20,80}$/.test(reference)) return NextResponse.json({ received: true });

    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment) return NextResponse.json({ received: true });

    if (data?.status !== "success" || data?.currency !== payment.currency || Number(data?.amount) !== payment.amountNgnKobo) {
      return NextResponse.json({ error: "Payment details do not match the booking." }, { status: 400 });
    }

    // Conditional update keeps payment fulfilment idempotent. If event-log persistence fails,
    // Paystack can retry; the payment status prevents a duplicate paid notification.
    await markPaymentPaid(reference);

    try {
      await prisma.webhookEvent.create({
        data: { eventKey: `charge.success:${reference}`, eventType: event.event, reference },
      });
    } catch (error) {
      if ((error as { code?: string })?.code === "P2002") return NextResponse.json({ received: true, duplicate: true });
      throw error;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook processing error", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
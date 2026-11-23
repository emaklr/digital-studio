import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { markPaymentPaid } from "@/lib/mark-payment-paid";
import { readRawBody } from "@/lib/request-security";

export const runtime = "nodejs";

function safeEqualHex(expected: string, received: string) {
  if (!/^[0-9a-f]{128}$/i.test(received)) return false;
  const expectedBytes = Buffer.from(expected, "hex");
  const receivedBytes = Buffer.from(received, "hex");
  return expectedBytes.length === receivedBytes.length && timingSafeEqual(expectedBytes, receivedBytes);
}

function verifyModernSignature(rawBody: Buffer, header: string, secrets: string[]) {
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
      if (colon < 0) continue;
      const keyId = value.slice(0, colon);
      const signature = value.slice(colon + 1);
      if (/^whk_[A-Za-z0-9_-]+$/.test(keyId) && /^[0-9a-f]{128}$/i.test(signature)) {
        signatures.push(signature);
      }
    }
  }

  if (
    timestamp === null ||
    !Number.isSafeInteger(timestamp) ||
    Math.abs(Math.floor(Date.now() / 1000) - timestamp) > 300 ||
    signatures.length === 0
  ) {
    return false;
  }

  return secrets.some((secret) => {
    const expected = createHmac("sha512", secret)
      .update(String(timestamp) + ".")
      .update(rawBody)
      .digest("hex");
    return signatures.some((signature) => safeEqualHex(expected, signature));
  });
}

function verifyLegacySignature(rawBody: Buffer, header: string, secret: string) {
  if (!/^[0-9a-f]{128}$/i.test(header)) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest();
  const received = Buffer.from(header, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function POST(request: NextRequest) {
  try {
    const raw = await readRawBody(request, 1_000_000);
    if (!raw.ok) return raw.response;
    const rawBody = raw.value;

    const modernSignature = request.headers.get("paystack-signature");
    const legacySignature = request.headers.get("x-paystack-signature");
    const webhookSecrets = [
      process.env.PAYSTACK_WEBHOOK_SECRET,
      process.env.PAYSTACK_WEBHOOK_SECRET_PREVIOUS,
    ].map((value) => value?.trim() ?? "").filter(Boolean);
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    let signatureValid = false;
    if (modernSignature && webhookSecrets.length > 0) {
      signatureValid = verifyModernSignature(rawBody, modernSignature, webhookSecrets);
    } else if (legacySignature && secretKey) {
      signatureValid = verifyLegacySignature(rawBody, legacySignature, secretKey);
    }

    if (!signatureValid) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    let event: unknown;
    try {
      event = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return NextResponse.json({ error: "Invalid webhook JSON." }, { status: 400 });
    }
    if (typeof event !== "object" || event === null || Array.isArray(event)) {
      return NextResponse.json({ error: "Invalid webhook event." }, { status: 400 });
    }

    const eventRecord = event as Record<string, unknown>;
    if (eventRecord.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const data = eventRecord.data;
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid payment event data." }, { status: 400 });
    }
    const paymentData = data as Record<string, unknown>;
    const reference = typeof paymentData.reference === "string" ? paymentData.reference : "";
    if (!/^ADS-[A-Za-z0-9-]{20,80}$/.test(reference)) {
      return NextResponse.json({ received: true });
    }

    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment) return NextResponse.json({ received: true });

    if (
      paymentData.status !== "success" ||
      paymentData.currency !== payment.currency ||
      Number(paymentData.amount) !== payment.amountNgnKobo
    ) {
      return NextResponse.json({ error: "Payment details do not match the booking." }, { status: 400 });
    }

    await markPaymentPaid(reference);

    try {
      await prisma.webhookEvent.create({
        data: { eventKey: "charge.success:" + reference, eventType: "charge.success", reference },
      });
    } catch (error) {
      if ((error as { code?: string })?.code === "P2002") {
        return NextResponse.json({ received: true, duplicate: true });
      }
      throw error;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook processing error", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}

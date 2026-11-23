import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { markPaymentPaid } from "@/lib/mark-payment-paid";
import {
  isAllowedBrowserOrigin,
  readJsonObject,
} from "@/lib/request-security";
import { enforceRateLimit } from "@/lib/rate-limit";

const REFERENCE_PATTERN = /^ADS-[A-Za-z0-9-]{20,80}$/;

function successResponse(payment: {
  packageName: string | null;
  depositUsd: number;
  amountNgnKobo: number;
}) {
  return NextResponse.json(
    {
      status: "success",
      packageName: payment.packageName,
      depositUsd: payment.depositUsd,
      amountNgnKobo: payment.amountNgnKobo,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedBrowserOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    const limited = await enforceRateLimit(request, "payment-verification", { limit: 12, windowSeconds: 300 });
    if (limited) return limited;
    if (!process.env.PAYSTACK_SECRET_KEY || !process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Payment verification is not configured." }, { status: 503 });
    }

    const parsed = await readJsonObject(request, 2_048);
    if (!parsed.ok) return parsed.response;
    if (Object.keys(parsed.value).some((key) => key !== "reference")) {
      return NextResponse.json({ error: "Request contains unsupported fields." }, { status: 400 });
    }
    const reference = typeof parsed.value.reference === "string" ? parsed.value.reference.trim() : "";
    if (!REFERENCE_PATTERN.test(reference)) {
      return NextResponse.json({ error: "Invalid payment reference." }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment) {
      return NextResponse.json({ error: "We could not find this booking." }, { status: 404 });
    }

    // A previously verified payment does not need another provider API call.
    if (payment.status === "PAID") return successResponse(payment);

    const response = await fetch(
      "https://api.paystack.co/transaction/verify/" + encodeURIComponent(reference),
      {
        headers: { Authorization: "Bearer " + process.env.PAYSTACK_SECRET_KEY },
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      },
    );
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.status !== true || !result?.data) {
      return NextResponse.json({ error: "We could not verify this payment yet. Please refresh in a moment." }, { status: 502 });
    }

    const data = result.data;
    if (data.status !== "success") {
      return NextResponse.json(
        { status: "pending", message: "Payment has not been confirmed yet." },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (
      data.reference !== reference ||
      data.currency !== payment.currency ||
      Number(data.amount) !== payment.amountNgnKobo
    ) {
      return NextResponse.json({ error: "The payment details did not match this booking. Please contact the studio." }, { status: 409 });
    }

    await markPaymentPaid(reference);
    const updated = await prisma.payment.findUnique({ where: { reference } });
    if (!updated || updated.status !== "PAID") {
      return NextResponse.json({ error: "Payment confirmation is still processing. Please retry shortly." }, { status: 503 });
    }

    return successResponse(updated);
  } catch (error) {
    console.error("Payment verification error", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "We could not verify your payment right now." }, { status: 500 });
  }
}

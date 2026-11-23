import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { markPaymentPaid } from "@/lib/mark-payment-paid";

export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get("reference")?.trim() ?? "";
    if (!/^ADS-[A-Za-z0-9-]{20,80}$/.test(reference)) {
      return NextResponse.json({ error: "Invalid payment reference." }, { status: 400 });
    }
    if (!process.env.PAYSTACK_SECRET_KEY || !process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Payment verification is not configured." }, { status: 503 });
    }

    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { inquiry: true },
    });
    if (!payment) return NextResponse.json({ error: "We could not find this booking." }, { status: 404 });

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      cache: "no-store",
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.status !== true || !result?.data) {
      return NextResponse.json({ error: "We could not verify this payment yet. Please refresh in a moment." }, { status: 502 });
    }

    const data = result.data;
    if (data.status !== "success") {
      return NextResponse.json({ status: "pending", message: "Payment has not been confirmed yet." });
    }
    if (
      data.reference !== reference ||
      data.currency !== payment.currency ||
      Number(data.amount) !== payment.amountNgnKobo
    ) {
      return NextResponse.json({ error: "The payment details did not match this booking. Please contact the studio." }, { status: 409 });
    }

    await markPaymentPaid(reference);
    const updated = await prisma.payment.findUnique({ where: { reference }, include: { inquiry: true } });
    if (!updated) return NextResponse.json({ error: "Payment record unavailable." }, { status: 404 });

    return NextResponse.json({
      status: "success",
      customerName: updated.inquiry.name,
      serviceSlug: updated.inquiry.serviceSlug,
      packageName: updated.inquiry.packageName,
      depositUsd: updated.depositUsd,
      amountNgnKobo: updated.amountNgnKobo,
    });
  } catch (error) {
    console.error("Payment verification error", error);
    return NextResponse.json({ error: "We could not verify your payment right now." }, { status: 500 });
  }
}

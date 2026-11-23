import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { calculateDeposit, depositPercentByService, getPackage, getUsdNgnRate } from "@/lib/payment-config";
import { sendStudioEmail, escapeHtml } from "@/lib/notifications";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value: unknown, max = 300) =>
  typeof value === "string" ? value.trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, max) : "";

export async function POST(request: NextRequest) {
  try {
    if (process.env.PAYMENTS_ENABLED !== "true") {
      return NextResponse.json({ error: "Online checkout is not enabled yet. Please submit a booking request instead." }, { status: 503 });
    }
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Booking storage is not configured yet." }, { status: 503 });
    }
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const usdNgnRate = getUsdNgnRate();
    if (!secretKey || !usdNgnRate) {
      return NextResponse.json({ error: "Checkout configuration is incomplete. Please contact the studio." }, { status: 503 });
    }

    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 12000) return NextResponse.json({ error: "Request is too large." }, { status: 413 });

    const payload = await request.json();
    if (clean(payload.company_website, 200)) return NextResponse.json({ ok: true });

    const name = clean(payload.name, 100);
    const email = clean(payload.email, 180).toLowerCase();
    const company = clean(payload.company, 140);
    const website = clean(payload.website, 250);
    const details = clean(payload.details, 4000);
    const timeline = clean(payload.timeline, 80);
    const serviceSlug = clean(payload.service, 80);
    const packageName = clean(payload.package, 120);

    if (!name || !EMAIL_PATTERN.test(email) || details.length < 20) {
      return NextResponse.json({ error: "Please provide a valid name, email and project description." }, { status: 400 });
    }

    const selection = getPackage(serviceSlug, packageName);
    const depositPercent = depositPercentByService[serviceSlug];
    if (!selection || !depositPercent) {
      return NextResponse.json({ error: "Choose a valid service and package before continuing." }, { status: 400 });
    }

    const { service, selectedPackage } = selection;
    const { depositUsd, amountNgnKobo } = calculateDeposit(selectedPackage.price, depositPercent, usdNgnRate);
    if (!Number.isSafeInteger(amountNgnKobo) || amountNgnKobo < 5000) {
      return NextResponse.json({ error: "The calculated deposit is outside Paystack's supported NGN range." }, { status: 400 });
    }

    const reference = `ADS-${randomUUID().replace(/-/g, "")}`;
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, "");

    const inquiry = await prisma.inquiry.create({
      data: {
        name, email, company: company || null, website: website || null,
        kind: "SERVICE_BOOKING", serviceSlug, packageName,
        timeline: timeline || null, details,
      },
    });

    const payment = await prisma.payment.create({
      data: {
        inquiryId: inquiry.id, reference, amountNgnKobo, currency: "NGN",
        packagePriceUsd: selectedPackage.price, depositPercent, depositUsd,
        usdNgnRate, status: "INITIALIZING",
      },
    });

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        amount: amountNgnKobo,
        currency: "NGN",
        reference,
        callback_url: `${siteUrl}/payment/callback`,
        metadata: {
          source: "abeeb-digital-studio",
          inquiryId: inquiry.id,
          serviceSlug,
          serviceName: service.title,
          packageName,
          packagePriceUsd: selectedPackage.price,
          depositPercent,
          depositUsd,
          usdNgnRate: usdNgnRate.toFixed(4),
          amountNgnKobo,
        },
      }),
      cache: "no-store",
    });

    const result = await paystackResponse.json().catch(() => null);
    const authorizationUrl = result?.data?.authorization_url;
    if (!paystackResponse.ok || result?.status !== true || typeof authorizationUrl !== "string") {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "INITIALIZATION_FAILED" } });
      return NextResponse.json({ error: "Paystack could not start checkout. Your booking details have been saved; please contact the studio." }, { status: 502 });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PENDING", authorizationUrl },
    });

    const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(amountNgnKobo / 100);
    await sendStudioEmail({
      subject: `[Abeeb Studio] Checkout started: ${service.title} — ${packageName}`,
      replyTo: email,
      html: `<h2>New service booking checkout</h2><p><b>${escapeHtml(name)}</b> (${escapeHtml(email)}) selected <b>${escapeHtml(service.title)} / ${escapeHtml(packageName)}</b>.</p><p>Package: $${selectedPackage.price} USD<br/>Deposit: $${depositUsd} USD (${depositPercent}%)<br/>FX rate: ₦${usdNgnRate.toLocaleString("en-NG")} per USD<br/>Checkout amount: ${naira}</p><p>${escapeHtml(details)}</p><p>Reference: ${reference}</p>`,
    });

    return NextResponse.json({
      ok: true,
      authorizationUrl,
      reference,
      quote: { packagePriceUsd: selectedPackage.price, depositPercent, depositUsd, usdNgnRate, amountNgnKobo },
    });
  } catch (error) {
    console.error("Checkout initialization error", error);
    return NextResponse.json({ error: "We could not start checkout. Please try again or contact the studio." }, { status: 500 });
  }
}

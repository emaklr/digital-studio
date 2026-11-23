import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { calculateDeposit, depositPercentByService, getPackage, getUsdNgnRate } from "@/lib/payment-config";
import { sendStudioEmail, escapeHtml } from "@/lib/notifications";
import {
  cleanText,
  getTrustedSiteUrl,
  isAllowedBrowserOrigin,
  isOptionalHttpUrl,
  isValidEmail,
  readJsonObject,
} from "@/lib/request-security";
import { enforceRateLimit } from "@/lib/rate-limit";

const ALLOWED_FIELDS = new Set([
  "name", "email", "company", "website", "kind", "service", "package",
  "timeline", "details", "company_website",
]);
const ALLOWED_TIMELINES = new Set(["", "asap", "2-4-weeks", "1-3-months", "flexible"]);

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedBrowserOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    const limited = await enforceRateLimit(request, "checkout-initialize", { limit: 5, windowSeconds: 600 });
    if (limited) return limited;
    if (process.env.PAYMENTS_ENABLED !== "true") {
      return NextResponse.json({ error: "Online checkout is not enabled yet. Please submit a booking request instead." }, { status: 503 });
    }
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Booking storage is not configured yet." }, { status: 503 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const usdNgnRate = getUsdNgnRate();
    const siteUrl = getTrustedSiteUrl(request);
    if (!secretKey || !usdNgnRate || !siteUrl) {
      return NextResponse.json({ error: "Checkout configuration is incomplete. Please contact the studio." }, { status: 503 });
    }

    const parsed = await readJsonObject(request, 12_000);
    if (!parsed.ok) return parsed.response;
    const payload = parsed.value;
    const unknownFields = Object.keys(payload).filter((key) => !ALLOWED_FIELDS.has(key));
    if (unknownFields.length > 0) {
      return NextResponse.json({ error: "Request contains unsupported fields." }, { status: 400 });
    }
    if (cleanText(payload.company_website, 200)) return NextResponse.json({ ok: true });

    const name = cleanText(payload.name, 100);
    const email = cleanText(payload.email, 180).toLowerCase();
    const company = cleanText(payload.company, 140);
    const website = cleanText(payload.website, 250);
    const details = cleanText(payload.details, 4000);
    const timeline = cleanText(payload.timeline, 80);
    const serviceSlug = cleanText(payload.service, 80);
    const packageName = cleanText(payload.package, 120);

    if (payload.kind !== "booking" || !name || !isValidEmail(email) || details.length < 20) {
      return NextResponse.json({ error: "Please provide a valid booking name, email and project description." }, { status: 400 });
    }
    if (!isOptionalHttpUrl(website)) {
      return NextResponse.json({ error: "Enter a valid website URL using HTTP or HTTPS." }, { status: 400 });
    }
    if (!ALLOWED_TIMELINES.has(timeline)) {
      return NextResponse.json({ error: "Choose a valid project timeline." }, { status: 400 });
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
      signal: AbortSignal.timeout(10_000),
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

    return NextResponse.json(
      { ok: true, authorizationUrl, reference },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Checkout initialization error", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "We could not start checkout. Please try again or contact the studio." }, { status: 500 });
  }
}

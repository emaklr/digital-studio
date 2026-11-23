import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendStudioEmail, escapeHtml } from "@/lib/notifications";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function clean(value: unknown, max = 300) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, max);
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 12000) return NextResponse.json({ error: "Request is too large." }, { status: 413 });

    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Enquiry storage is not configured yet." }, { status: 503 });
    if (!process.env.RESEND_API_KEY || !process.env.LEAD_NOTIFICATION_EMAIL || !process.env.LEAD_FROM_EMAIL) {
      return NextResponse.json({ error: "The enquiry inbox is not connected yet. Please try again later." }, { status: 503 });
    }

    const payload = await request.json();
    if (clean(payload.company_website, 200)) return NextResponse.json({ ok: true });

    const name = clean(payload.name, 100);
    const email = clean(payload.email, 180).toLowerCase();
    const details = clean(payload.details, 4000);
    if (!name || !EMAIL_PATTERN.test(email) || details.length < 20) {
      return NextResponse.json({ error: "Please provide a valid name, email and project description." }, { status: 400 });
    }

    const kind = payload.kind === "booking" ? "SERVICE_BOOKING" : "CUSTOM_PROJECT";
    const serviceSlug = clean(payload.service, 80);
    const packageName = clean(payload.package, 120);
    const company = clean(payload.company, 140);
    const website = clean(payload.website, 250);
    const budget = clean(payload.budget, 60);
    const timeline = clean(payload.timeline, 80);

    const inquiry = await prisma.inquiry.create({
      data: {
        name, email, details, kind,
        company: company || null, website: website || null,
        serviceSlug: serviceSlug || null, packageName: packageName || null,
        budget: budget || null, timeline: timeline || null,
      },
    });

    const sent = await sendStudioEmail({
      subject: `[Abeeb Studio] ${kind === "SERVICE_BOOKING" ? "Booking request" : "Custom project enquiry"}: ${name}`,
      replyTo: email,
      html: `<h2>${kind === "SERVICE_BOOKING" ? "New service booking request" : "New custom project enquiry"}</h2><p><b>${escapeHtml(name)}</b> (${escapeHtml(email)})</p><p>Company: ${escapeHtml(company || "Not supplied")}<br/>Service: ${escapeHtml(serviceSlug || "Not specified")}<br/>Package: ${escapeHtml(packageName || "Not specified")}<br/>Budget: ${escapeHtml(budget || "Not specified")}<br/>Timeline: ${escapeHtml(timeline || "Not specified")}</p><p>${escapeHtml(details)}</p><p>Inquiry ID: ${inquiry.id}</p>`,
    });
    if (!sent) return NextResponse.json({ error: "Your request was saved, but we could not notify the studio. Please contact us directly." }, { status: 502 });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Inquiry submission error", error);
    return NextResponse.json({ error: "We could not send your request. Please try again." }, { status: 500 });
  }
}

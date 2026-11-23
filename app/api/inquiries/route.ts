import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendStudioEmail, escapeHtml } from "@/lib/notifications";
import { services } from "@/lib/services";
import {
  cleanText,
  isAllowedBrowserOrigin,
  isOptionalHttpUrl,
  isValidEmail,
  readJsonObject,
} from "@/lib/request-security";
import { enforceRateLimit } from "@/lib/rate-limit";

const ALLOWED_FIELDS = new Set([
  "name", "email", "company", "website", "kind", "service", "package",
  "budget", "timeline", "details", "company_website",
]);
const ALLOWED_TIMELINES = new Set(["", "asap", "2-4-weeks", "1-3-months", "flexible"]);
const ALLOWED_BUDGETS = new Set(["", "under-500", "500-1500", "1500-5000", "5000-plus", "not-sure"]);
const CUSTOM_SERVICE_AREAS = new Set(["website", "application", "automation", "ai", "other"]);

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedBrowserOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    const limited = await enforceRateLimit(request, "inquiries", { limit: 5, windowSeconds: 900 });
    if (limited) return limited;

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Enquiry storage is not configured yet." }, { status: 503 });
    }
    if (!process.env.RESEND_API_KEY || !process.env.LEAD_NOTIFICATION_EMAIL || !process.env.LEAD_FROM_EMAIL) {
      return NextResponse.json({ error: "The enquiry inbox is not connected yet. Please try again later." }, { status: 503 });
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
    const budget = cleanText(payload.budget, 60);
    const kindInput = payload.kind;

    if (kindInput !== "booking" && kindInput !== "custom") {
      return NextResponse.json({ error: "Choose a valid enquiry type." }, { status: 400 });
    }
    if (!name || !isValidEmail(email) || details.length < 20) {
      return NextResponse.json({ error: "Please provide a valid name, email and project description." }, { status: 400 });
    }
    if (!isOptionalHttpUrl(website)) {
      return NextResponse.json({ error: "Enter a valid website URL using HTTP or HTTPS." }, { status: 400 });
    }
    if (!ALLOWED_TIMELINES.has(timeline)) {
      return NextResponse.json({ error: "Choose a valid project timeline." }, { status: 400 });
    }
    if (!ALLOWED_BUDGETS.has(budget)) {
      return NextResponse.json({ error: "Choose a valid budget range." }, { status: 400 });
    }

    if (kindInput === "booking") {
      const service = services.find((item) => item.slug === serviceSlug);
      const selectedPackage = service?.packages.find((item) => item.name === packageName);
      if (!service || !selectedPackage) {
        return NextResponse.json({ error: "Choose a valid service and package." }, { status: 400 });
      }
    } else if (!CUSTOM_SERVICE_AREAS.has(serviceSlug) || packageName) {
      return NextResponse.json({ error: "Choose a valid custom solution area." }, { status: 400 });
    }

    const kind = kindInput === "booking" ? "SERVICE_BOOKING" : "CUSTOM_PROJECT";
    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        details,
        kind,
        company: company || null,
        website: website || null,
        serviceSlug: serviceSlug || null,
        packageName: packageName || null,
        budget: budget || null,
        timeline: timeline || null,
      },
    });

    const sent = await sendStudioEmail({
      subject: `[Abeeb Studio] ${kind === "SERVICE_BOOKING" ? "Booking request" : "Custom project enquiry"}: ${name}`,
      replyTo: email,
      html: `<h2>${kind === "SERVICE_BOOKING" ? "New service booking request" : "New custom project enquiry"}</h2><p><b>${escapeHtml(name)}</b> (${escapeHtml(email)})</p><p>Company: ${escapeHtml(company || "Not supplied")}<br/>Service: ${escapeHtml(serviceSlug || "Not specified")}<br/>Package: ${escapeHtml(packageName || "Not specified")}<br/>Budget: ${escapeHtml(budget || "Not specified")}<br/>Timeline: ${escapeHtml(timeline || "Not specified")}</p><p>${escapeHtml(details)}</p><p>Inquiry ID: ${inquiry.id}</p>`,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "Your request was saved, but we could not notify the studio. Please contact us directly." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Inquiry submission error", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "We could not send your request. Please try again." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Minimal runtime health endpoint.
 * Executes a read-only SELECT 1 to confirm that the deployed app can connect
 * to PostgreSQL. It does not expose connection details or database contents.
 */
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        status: "degraded",
        checks: { database: "not_configured" },
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        checks: { database: "ok" },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch {
    // Do not return database URLs, credentials, hostnames or raw driver errors.
    console.error("Database health check failed");

    return NextResponse.json(
      {
        status: "degraded",
        checks: { database: "unavailable" },
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}

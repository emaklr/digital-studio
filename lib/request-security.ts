import "server-only";
import { NextRequest, NextResponse } from "next/server";

export type JsonObject = Record<string, unknown>;
export type JsonReadResult =
  | { ok: true; value: JsonObject }
  | { ok: false; response: NextResponse };

export async function readJsonObject(
  request: NextRequest,
  maxBytes = 12_000,
): Promise<JsonReadResult> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 }),
    };
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null) {
    if (!/^\d+$/.test(declaredLength)) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Invalid Content-Length header." }, { status: 400 }),
      };
    }
    if (Number(declaredLength) > maxBytes) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Request is too large." }, { status: 413 }),
      };
    }
  }

  if (!request.body) {
    return {
      ok: false,
      response: NextResponse.json({ error: "A JSON request body is required." }, { status: 400 }),
    };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        return {
          ok: false,
          response: NextResponse.json({ error: "Request is too large." }, { status: 413 }),
        };
      }
      chunks.push(value);
    }
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unable to read request body." }, { status: 400 }),
    };
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Request body must contain valid JSON." }, { status: 400 }),
    };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 }),
    };
  }

  return { ok: true, value: parsed as JsonObject };
}

export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(0, maxLength);
}

export function isValidEmail(value: string): boolean {
  return value.length <= 180 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isOptionalHttpUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password;
  } catch {
    return false;
  }
}

function configuredOrigins(): Set<string> {
  const values = [
    process.env.NEXT_PUBLIC_SITE_URL ?? "",
    process.env.TRUSTED_ORIGINS ?? "",
  ].flatMap((value) => value.split(",")).map((value) => value.trim()).filter(Boolean);

  const origins = new Set<string>();
  for (const value of values) {
    try {
      const url = new URL(value);
      if (url.protocol === "https:" || process.env.NODE_ENV !== "production") origins.add(url.origin);
    } catch {
      // Ignore malformed origin configuration rather than trusting it.
    }
  }
  return origins;
}

export function isAllowedBrowserOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";

  let parsedOrigin: string;
  try {
    parsedOrigin = new URL(origin).origin;
  } catch {
    return false;
  }

  if (process.env.NODE_ENV !== "production" && parsedOrigin === request.nextUrl.origin) return true;
  return configuredOrigins().has(parsedOrigin);
}

export function getTrustedSiteUrl(request: NextRequest): string | null {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) {
    return process.env.NODE_ENV === "production" ? null : request.nextUrl.origin;
  }

  try {
    const url = new URL(configured);
    if (url.username || url.password) return null;
    if (process.env.NODE_ENV === "production" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

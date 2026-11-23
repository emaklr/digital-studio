import "server-only";
import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT_SCRIPT = [
  "local current = redis.call('INCR', KEYS[1])",
  "if current == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end",
  "local ttl = redis.call('TTL', KEYS[1])",
  "return {current, ttl}",
].join("\n");

type RateLimitOptions = {
  limit: number;
  windowSeconds: number;
};

type UpstashResponse = {
  result?: unknown;
  error?: string;
};

function getClientAddress(request: NextRequest): string | null {
  const direct = request.headers.get("x-real-ip")?.trim();
  if (direct) return direct.slice(0, 100);

  const forwarded = request.headers.get("x-forwarded-for");
  const lastAddress = forwarded?.split(",").at(-1)?.trim();
  return lastAddress ? lastAddress.slice(0, 100) : null;
}

/**
 * Distributed fixed-window rate limit using Upstash Redis REST and one atomic Lua script.
 * Production requests fail closed when the shared store is unavailable or not configured.
 * Local development can run without Redis; production must configure both Upstash variables.
 */
export async function enforceRateLimit(
  request: NextRequest,
  bucket: string,
  options: RateLimitOptions,
): Promise<NextResponse | null> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const production = process.env.NODE_ENV === "production";

  if (!redisUrl || !redisToken) {
    if (!production) return null;
    return NextResponse.json(
      { error: "This service is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const address = getClientAddress(request);
  if (!address) {
    if (!production) return null;
    return NextResponse.json(
      { error: "This service is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  let endpoint: URL;
  try {
    endpoint = new URL(redisUrl);
    if (endpoint.protocol !== "https:") throw new Error("Redis REST endpoint must use HTTPS.");
  } catch {
    return NextResponse.json(
      { error: "Rate-limiting service is misconfigured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const addressHash = createHash("sha256").update(address).digest("hex").slice(0, 32);
  const key = `abeeb:rate-limit:v1:${bucket}:${addressHash}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["EVAL", RATE_LIMIT_SCRIPT, 1, key, options.windowSeconds]),
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });

    const payload = await response.json() as UpstashResponse;
    if (!response.ok || payload.error || !Array.isArray(payload.result) || payload.result.length !== 2) {
      throw new Error("Rate-limit store returned an invalid response.");
    }

    const count = Number(payload.result[0]);
    const ttl = Number(payload.result[1]);
    if (!Number.isSafeInteger(count) || !Number.isFinite(ttl)) {
      throw new Error("Rate-limit store returned invalid counters.");
    }

    if (count > options.limit) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Cache-Control": "no-store",
            "Retry-After": String(Math.max(1, ttl)),
            "X-RateLimit-Limit": String(options.limit),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    return null;
  } catch (error) {
    console.error("Rate-limit service unavailable", error instanceof Error ? error.message : "Unknown error");
    if (!production) return null;
    return NextResponse.json(
      { error: "This service is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

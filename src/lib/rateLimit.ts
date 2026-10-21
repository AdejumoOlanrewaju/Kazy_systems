import { NextRequest, NextResponse } from "next/server";

const buckets = new Map<string, { count: number; resetAt: number }>();

export const clientIp = (req: NextRequest) =>
  req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";

// Returns a 429 response if the caller is over the limit, otherwise null.
export function rateLimit(req: NextRequest, name: string, limit: number, windowMs: number): NextResponse | null {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);

  const key = `${name}:${clientIp(req)}`;
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  if (++b.count > limit) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a bit and try again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((b.resetAt - now) / 1000)) } }
    );
  }
  return null;
}
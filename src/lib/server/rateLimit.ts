import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const hashKey = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex").slice(0, 32);

// Vercel puts the caller's address first in x-forwarded-for.
export function clientKey(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return hashKey(ip);
}

// Fixed-window limiter. Fails OPEN on a database error: a Firestore hiccup
// must not stop real customers from buying.
export async function rateLimit(
  scope: string,
  key: string,
  limit: number,
  windowSec: number
): Promise<{ ok: boolean; retryAfter: number }> {
  const ref = adminDb.collection("rateLimits").doc(`${scope}_${key}`);
  const now = Date.now();
  const windowMs = windowSec * 1000;

  try {
    return await adminDb.runTransaction(async (t) => {
      const snap = await t.get(ref);
      const data = snap.data();

      if (!data || now - data.windowStart >= windowMs) {
        t.set(ref, { count: 1, windowStart: now, expireAt: new Date(now + windowMs * 2) });
        return { ok: true, retryAfter: 0 };
      }
      if (data.count >= limit) {
        return { ok: false, retryAfter: Math.max(1, Math.ceil((data.windowStart + windowMs - now) / 1000)) };
      }
      t.update(ref, { count: data.count + 1 });
      return { ok: true, retryAfter: 0 };
    });
  } catch (error) {
    console.error("Rate limiter error (allowing request):", error);
    return { ok: true, retryAfter: 0 };
  }
}

const formatWait = (s: number) => (s < 90 ? `${s} seconds` : `${Math.ceil(s / 60)} minutes`);

export const tooMany = (retryAfter: number, message?: string) =>
  NextResponse.json(
    { error: message ?? `Too many requests. Please try again in ${formatWait(retryAfter)}.` },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
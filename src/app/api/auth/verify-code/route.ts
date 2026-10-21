import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { clientKey, hashKey, rateLimit, tooMany } from "@/lib/server/rateLimit";
import {
  HOUR_MS, MAX_ATTEMPTS_PER_CODE, MAX_FAILED_PER_HOUR, hashCode, safeEqual, validEmail,
} from "@/lib/server/otp";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();
    const code = String(body?.code ?? "").trim();
    if (!validEmail(email) || !/^\d{6}$/.test(code)) return fail("Enter the 6-digit code from your email.");

    const byIp = await rateLimit("verifycode-ip", clientKey(req), 30, 3600);
    if (!byIp.ok) return tooMany(byIp.retryAfter);

    const ref = adminDb.collection("otpCodes").doc(hashKey(email));
    const now = Date.now();

    // Every guess is counted inside the transaction BEFORE it is judged, so
    // parallel requests can't squeeze in extra tries.
    const outcome = await adminDb.runTransaction(async (t) => {
      const snap = await t.get(ref);
      const d = snap.data();
      if (!d || !d.codeHash) return { kind: "invalid" as const };

      if (d.lockedUntil && d.lockedUntil > now) {
        return { kind: "locked" as const, retryAfter: Math.ceil((d.lockedUntil - now) / 1000) };
      }
      if (now > d.expiresAt) {
        t.update(ref, { codeHash: null });
        return { kind: "expired" as const };
      }
      if (d.attempts >= MAX_ATTEMPTS_PER_CODE) {
        t.update(ref, { codeHash: null });
        return { kind: "invalid" as const };
      }

      if (safeEqual(d.codeHash, hashCode(email, code))) {
        // Single use, and a successful sign-in clears the failure count.
        t.update(ref, { codeHash: null, attempts: 0, failedInWindow: 0 });
        return { kind: "ok" as const };
      }

      const attempts = d.attempts + 1;
      const failWindowStart = d.failWindowStart && now - d.failWindowStart < HOUR_MS ? d.failWindowStart : now;
      const failedInWindow = (failWindowStart === d.failWindowStart ? d.failedInWindow ?? 0 : 0) + 1;
      const locked = failedInWindow >= MAX_FAILED_PER_HOUR;

      t.update(ref, {
        attempts,
        failWindowStart,
        failedInWindow,
        ...(locked ? { lockedUntil: now + HOUR_MS, codeHash: null } : {}),
        ...(attempts >= MAX_ATTEMPTS_PER_CODE ? { codeHash: null } : {}),
      });
      return { kind: locked ? ("locked" as const) : ("wrong" as const), retryAfter: locked ? 3600 : 0 };
    });

    if (outcome.kind === "locked") {
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please try again later or use Google." },
        { status: 429, headers: { "Retry-After": String(outcome.retryAfter) } }
      );
    }
    if (outcome.kind === "expired") return fail("That code has expired. Please request a new one.");
    if (outcome.kind === "invalid") return fail("That code isn't valid. Please request a new one.");
    if (outcome.kind === "wrong") return fail("Incorrect code. Please try again.");

    // ---- code accepted: find or create the customer's account ----
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch {
      userRecord = await adminAuth.createUser({ email, emailVerified: true });
    }

    // The customer email-code flow must never be able to sign in as the admin.
    if (userRecord.customClaims?.admin) {
      return fail("This email belongs to the admin account. Please sign in with your password.", 403);
    }

    const token = await adminAuth.createCustomToken(userRecord.uid);
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Code verification failed:", error);
    return fail("Something went wrong. Please try again.", 500);
  }
}
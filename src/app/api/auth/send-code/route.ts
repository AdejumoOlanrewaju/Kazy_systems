import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";
import { clientKey, hashKey, rateLimit, tooMany } from "@/lib/server/rateLimit";
import { customerEmailEnabled, sendCustomerEmail } from "@/lib/server/mailer";
import {
  CODE_TTL_MS, HOUR_MS, MAX_SENDS_PER_HOUR, RESEND_COOLDOWN_MS, hashCode, validEmail,
} from "@/lib/server/otp";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();
    if (!validEmail(email)) return fail("Please enter a valid email address.");

    // Until a domain is verified, Resend can't deliver to customers at all.
    if (!customerEmailEnabled()) {
      return fail("Email sign-in isn't available yet. Please continue with Google.", 503);
    }

    const byIp = await rateLimit("sendcode-ip", clientKey(req), 10, 3600);
    if (!byIp.ok) return tooMany(byIp.retryAfter);

    const code = crypto.randomInt(100000, 1000000).toString();
    const ref = adminDb.collection("otpCodes").doc(hashKey(email));
    const now = Date.now();

    const outcome = await adminDb.runTransaction(async (t) => {
      const snap = await t.get(ref);
      const d = snap.data();

      if (d?.lockedUntil && d.lockedUntil > now) {
        return { error: "locked" as const, retryAfter: Math.ceil((d.lockedUntil - now) / 1000) };
      }
      if (d?.lastSentAt && now - d.lastSentAt < RESEND_COOLDOWN_MS) {
        return { error: "cooldown" as const, retryAfter: Math.ceil((RESEND_COOLDOWN_MS - (now - d.lastSentAt)) / 1000) };
      }

      const sendWindowStart = d?.sendWindowStart && now - d.sendWindowStart < HOUR_MS ? d.sendWindowStart : now;
      const sendCount = sendWindowStart === d?.sendWindowStart ? d?.sendCount ?? 0 : 0;
      if (sendCount >= MAX_SENDS_PER_HOUR) {
        return { error: "limit" as const, retryAfter: Math.ceil((sendWindowStart + HOUR_MS - now) / 1000) };
      }

      // Failed guesses are tracked per hour, NOT per code. Issuing a new code
      // must never hand an attacker a fresh set of guesses.
      const failWindowStart = d?.failWindowStart && now - d.failWindowStart < HOUR_MS ? d.failWindowStart : now;
      const failedInWindow = failWindowStart === d?.failWindowStart ? d?.failedInWindow ?? 0 : 0;

      t.set(ref, {
        codeHash: hashCode(email, code),
        expiresAt: now + CODE_TTL_MS,
        attempts: 0, // guesses against THIS code only
        failWindowStart,
        failedInWindow,
        lockedUntil: d?.lockedUntil ?? 0,
        lastSentAt: now,
        sendWindowStart,
        sendCount: sendCount + 1,
      });
      return { ok: true as const };
    });

    if ("error" in outcome) {
      const message =
        outcome.error === "locked"
          ? "Too many incorrect attempts. Please try again later or use Google."
          : outcome.error === "cooldown"
            ? `Please wait ${outcome.retryAfter} seconds before requesting another code.`
            : "You've requested too many codes. Please try again later.";
      return NextResponse.json({ error: message }, { status: 429, headers: { "Retry-After": String(outcome.retryAfter) } });
    }

    try {
      await sendCustomerEmail(
        email,
        `Your sign-in code: ${code}`,
        `Your verification code is: ${code}\n\nThis code expires in 10 minutes. If you didn't request it, you can ignore this email.`
      );
    } catch (error) {
      console.error("Sign-in code email failed:", error);
      await ref.update({ lastSentAt: 0 }); // don't make them wait for our failure
      return fail("We couldn't send the code. Please try again, or continue with Google.", 503);
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Failed to send sign-in code:", error);
    return fail("Failed to send code. Please try again.", 500);
  }
}
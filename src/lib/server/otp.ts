import crypto from "crypto";

export const CODE_TTL_MS = 10 * 60 * 1000;
export const RESEND_COOLDOWN_MS = 60 * 1000;
export const HOUR_MS = 60 * 60 * 1000;
export const MAX_SENDS_PER_HOUR = 5;
export const MAX_ATTEMPTS_PER_CODE = 5;
export const MAX_FAILED_PER_HOUR = 10; // across ALL codes for this email

const secret = () => process.env.OTP_SECRET || process.env.FIREBASE_ADMIN_PRIVATE_KEY || "";

// Codes are stored as keyed hashes, never in plain text.
export const hashCode = (email: string, code: string) =>
  crypto.createHmac("sha256", secret()).update(`${email}:${code}`).digest("hex");

export const safeEqual = (a: string, b: string) => {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && crypto.timingSafeEqual(A, B);
};

export const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 120;
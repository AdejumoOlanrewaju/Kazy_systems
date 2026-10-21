import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { rateLimit } from "@/lib/rateLimit";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "request-cancel", 5, 60 * 60_000);
  if (limited) return limited;

  try {
    const body = await req.json();
    const orderId = String(body.orderId || "").trim();
    const reason = String(body.reason || "").trim().slice(0, 300);
    if (!orderId || orderId.includes("/")) return fail("Missing order ID.");
    if (reason.length < 5) return fail("Please tell us why you want to cancel.");

    let email = String(body.email || "").trim().toLowerCase();
    const header = req.headers.get("authorization");
    if (header?.startsWith("Bearer ")) {
      try {
        email = ((await adminAuth.verifyIdToken(header.slice(7))).email || "").toLowerCase();
      } catch {
        return fail("Your session expired. Please sign in again.", 401);
      }
    }

    const ref = adminDb.collection("orders").doc(orderId);
    const snap = await ref.get();
    const o = snap.data();
    if (!snap.exists || !o || String(o.email || "").toLowerCase().trim() !== email) {
      return fail("We couldn't match that order and email.", 404);
    }
    if (o.status !== "paid") {
      return fail("Only paid orders that haven't shipped can be cancelled online. Please contact us on WhatsApp.", 409);
    }
    if (o.cancelRequest) return fail("You've already requested a cancellation. We'll be in touch.", 409);

    await ref.update({ cancelRequest: { reason, requestedAt: FieldValue.serverTimestamp() } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Cancel request failed:", e);
    return fail("Something went wrong. Please try again.", 500);
  }
}
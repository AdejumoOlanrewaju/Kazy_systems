import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/server/requireAdmin";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
const REFUNDABLE = ["paid", "shipped", "delivered"];
const LOCK_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) return fail(admin.error, admin.status);

    const { orderId, amount, reason } = await req.json();
    const why = String(reason || "").trim().slice(0, 200);
    if (!orderId) return fail("orderId is required.");
    if (!why) return fail("Please give a reason for the refund.");

    const ref = adminDb.collection("orders").doc(String(orderId));

    // 1. Claim the amount inside a transaction, so a double-click (or two
    //    admins) can't refund the same money twice.
    const claim = await adminDb.runTransaction(async (t) => {
      const snap = await t.get(ref);
      if (!snap.exists) return { error: "Order not found." };
      const o = snap.data()!;

      if (!REFUNDABLE.includes(o.status)) return { error: "This order can't be refunded." };
      if (!o.paystackRef) return { error: "This order has no payment reference." };
      if (o.refundPending && Date.now() - (o.refundPendingAt || 0) < LOCK_MS) {
        return { error: "A refund for this order is already in progress." };
      }

      const refunded: number = o.refundedTotal || 0;
      const refundable: number = o.total - refunded;
      const naira = amount === undefined || amount === null || amount === "" ? refundable : Number(amount);

      if (!Number.isFinite(naira) || naira <= 0) return { error: "Enter a valid refund amount." };
      if (naira > refundable) return { error: `You can refund at most ₦${refundable.toLocaleString()} on this order.` };

      t.update(ref, { refundPending: naira, refundPendingAt: Date.now() });
      return { naira, reference: o.paystackRef as string, orderTotal: o.total as number, refunded };
    });
    if ("error" in claim) return fail(claim.error as string, 409);

    // 2. Ask Paystack to refund the transaction (amount is in kobo).
    const res = await fetch("https://api.paystack.co/refund", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction: claim.reference,
        amount: Math.round(claim.naira * 100),
        currency: "NGN",
        customer_note: "Refund from Kayzee Global Computer Networks",
        merchant_note: `Order ${orderId}: ${why}`,
      }),
    });
    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.status) {
      await ref.update({ refundPending: FieldValue.delete(), refundPendingAt: FieldValue.delete() });
      return fail(json?.message || "Paystack couldn't process the refund.", 502);
    }

    // 3. Record it. Fully refunded orders become "refunded".
    const refundedTotal = claim.refunded + claim.naira;
    const full = refundedTotal >= claim.orderTotal;
    await ref.update({
      refundedTotal,
      refunds: FieldValue.arrayUnion({
        amount: claim.naira,
        reason: why,
        at: Date.now(),
        status: String(json.data?.status ?? "pending"),
      }),
      ...(full ? { status: "refunded" } : {}),
      refundPending: FieldValue.delete(),
      refundPendingAt: FieldValue.delete(),
    });

    return NextResponse.json({ ok: true, refundStatus: json.data?.status ?? "pending", full });
  } catch (error) {
    console.error("Refund failed:", error);
    return fail("Refund failed. Check Paystack before trying again.", 500);
  }
}
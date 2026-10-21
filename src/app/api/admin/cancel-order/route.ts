import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/server/requireAdmin";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return fail(admin.error, admin.status);

  const { orderId, reason } = await req.json().catch(() => ({}));
  const id = String(orderId || "").trim();
  if (!id || id.includes("/")) return fail("orderId is required.");

  const ref = adminDb.collection("orders").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return fail("Order not found.", 404);
  const o = snap.data()!;

  if (!["pending", "failed"].includes(o.status)) {
    return fail("Only unpaid orders can be cancelled here. For paid orders, use Refund.", 409);
  }

  // Never cancel an order the customer actually paid for.
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(o.reference || "")}`,
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }, cache: "no-store" }
  );
  const json = await res.json().catch(() => null);
  if (json?.data?.status === "success") {
    return fail("Paystack shows this order WAS paid. Use 'Recover payment' to complete it first.", 409);
  }

  await ref.update({
    status: "cancelled",
    cancelledAt: FieldValue.serverTimestamp(),
    cancelReason: String(reason || "").trim().slice(0, 300),
  });
  return NextResponse.json({ ok: true });
}
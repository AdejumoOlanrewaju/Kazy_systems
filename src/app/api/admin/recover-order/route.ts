import { NextRequest, NextResponse } from "next/server";
// import { adminAuth } from "@/lib/firebaseAdmin";
import { finalizeOrder } from "@/lib/server/finalizeOrder";
import { requireAdmin } from "@/lib/server/requireAdmin";

// const ADMIN_EMAIL = "admin_ademola@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const { orderId, reference } = await req.json();
    if (!orderId || !reference) {
      return NextResponse.json({ error: "orderId and reference are required" }, { status: 400 });
    }

    // Same verification as a normal checkout: Paystack must confirm the payment,
    // the amount must equal the order total, and the email must match.
    const result = await finalizeOrder(orderId, String(reference).trim());
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ ok: true, alreadyPaid: result.alreadyPaid });
  } catch (error) {
    console.error("Recover order failed:", error);
    return NextResponse.json({ error: "Recovery failed" }, { status: 500 });
  }
}
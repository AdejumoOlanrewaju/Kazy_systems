import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { finalizeOrder } from "@/lib/server/finalizeOrder";

const ADMIN_EMAIL = "admin_kayzee@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded.email !== ADMIN_EMAIL) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
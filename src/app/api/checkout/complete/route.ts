import { NextRequest, NextResponse } from "next/server";
import { finalizeOrder } from "@/lib/server/finalizeOrder";
import { clientKey, rateLimit, tooMany } from "@/lib/server/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit("checkout-complete", clientKey(req), 60, 600);
    if (!limited.ok) return tooMany(limited.retryAfter);

    const { orderId, reference } = await req.json();
    if (!orderId || !reference) {
      return NextResponse.json({ error: "orderId and reference are required" }, { status: 400 });
    }

    const result = await finalizeOrder(orderId, reference);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, paymentStatus: result.paymentStatus },
        { status: result.status }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Checkout complete failed:", error);
    return NextResponse.json({ error: "Could not confirm the order" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { finalizeOrder } from "@/lib/server/finalizeOrder";

export async function POST(req: NextRequest) {
  try {
    const { orderId, reference } = await req.json();
    if (!orderId || !reference) {
      return NextResponse.json({ error: "orderId and reference are required" }, { status: 400 });
    }
    const result = await finalizeOrder(orderId, reference);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Checkout complete failed:", error);
    return NextResponse.json({ error: "Could not confirm the order" }, { status: 500 });
  }
}
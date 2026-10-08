import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { orderId, email } = await req.json();
    if (!orderId || !email) {
      return NextResponse.json({ error: "Order ID and email are required" }, { status: 400 });
    }

    const snap = await adminDb.collection("orders").doc(orderId.trim()).get();

    const notFoundResponse = NextResponse.json(
      { error: "No matching order found. Check your order ID and email." },
      { status: 404 }
    );

    if (!snap.exists) return notFoundResponse;

    const data = snap.data()!;
    if (data.email?.toLowerCase().trim() !== email.toLowerCase().trim()) {
      return notFoundResponse;
    }

    return NextResponse.json({
      order: {
        id: snap.id,
        status: data.status,
        total: data.total,
        items: data.items,
        customerName: data.customerName,
        address: data.address,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : null,
      },
    });
  } catch (error) {
    console.error("Order tracking lookup failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
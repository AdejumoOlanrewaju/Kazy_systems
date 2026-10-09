import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";
import { finalizeOrder } from "@/lib/server/finalizeOrder";

export async function POST(req: NextRequest) {
  // Raw body is required — the signature is computed over the exact bytes sent.
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature") || "";
  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
    .update(body)
    .digest("hex");

  if (signature.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const reference: string = event.data?.reference;
      const match = await adminDb.collection("orders").where("reference", "==", reference).limit(1).get();

      if (match.empty) {
        console.warn("Webhook: no order for reference", reference);
      } else {
        const result = await finalizeOrder(match.docs[0].id, reference);
        if (!result.ok) console.error("Webhook finalize rejected:", result.error);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    // 500 makes Paystack retry later
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
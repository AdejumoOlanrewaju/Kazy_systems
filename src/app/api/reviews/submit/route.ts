import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { Resend } from "resend";
import { adminDb } from "@/lib/firebaseAdmin";
import { REVIEWABLE_STATUSES, toDisplayName } from "@/lib/server/reviews";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "olanrewajuadejumo56@gmail.com";
const SITE_URL = "https://kazy-systems.vercel.app";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productId = String(body.productId || "").trim();
    const orderId = String(body.orderId || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const rating = Number(body.rating);
    const title = String(body.title || "").trim().slice(0, 80);
    const comment = String(body.comment || "").trim();

    if (!productId || !orderId || !email) return fail("Please fill in your order ID and email.");
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail("Please choose a rating from 1 to 5 stars.");
    if (comment.length < 10) return fail("Please write at least a short sentence (10 characters).");
    if (comment.length > 1000) return fail("Please keep your review under 1000 characters.");

    // Same generic message for "no such order" and "wrong email" on purpose.
    const noMatch = () => fail("We couldn't match that order ID and email. Check them and try again.", 404);

    // Firestore document ids can't contain "/" — reject early.
    if (orderId.includes("/") || productId.includes("/")) return noMatch();

    const orderSnap = await adminDb.collection("orders").doc(orderId).get();
    if (!orderSnap.exists) return noMatch();
    const order = orderSnap.data()!;
    if (String(order.email || "").toLowerCase().trim() !== email) return noMatch();

    if (!REVIEWABLE_STATUSES.includes(order.status)) {
      return fail("You can review a product once your order has been delivered.", 403);
    }

    // Did this order actually contain this product? (older orders may lack productId)
    const purchased = (order.items || []).some(
      (i: any) => i.productId === productId || i.id === productId || String(i.id || "").startsWith(`${productId}_`)
    );
    if (!purchased) return fail("That order doesn't include this product.", 400);

    const productSnap = await adminDb.collection("products").doc(productId).get();
    const productName = productSnap.exists ? productSnap.data()!.name : "Product";

    try {
      await adminDb.collection("reviews").doc(`${orderId}_${productId}`).create({
        productId,
        productName,
        rating,
        title,
        comment,
        authorName: toDisplayName(order.customerName),
        orderId,
        email,
        verified: true,
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (e: any) {
      if (e?.code === 6 || /already exists/i.test(e?.message || "")) {
        return fail("You've already reviewed this item. Thank you!", 409);
      }
      throw e;
    }

    resend.emails
      .send({
        from: "Kayzee Reviews <onboarding@resend.dev>",
        to: ADMIN_EMAIL,
        subject: `New ${rating}★ review awaiting approval — ${productName}`,
        text: `A verified buyer left a review for ${productName}.\n\nRating: ${rating}/5\n${title ? `Title: ${title}\n` : ""}Comment: ${comment}\n\nApprove or reject it: ${SITE_URL}/admin/reviews`,
      })
      .catch((e) => console.error("Review email failed:", e));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Submit review failed:", error);
    return fail("Something went wrong. Please try again.", 500);
  }
}
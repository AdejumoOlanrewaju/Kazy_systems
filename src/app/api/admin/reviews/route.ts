import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { recalcProductRating } from "@/lib/server/reviews";
import { requireAdmin } from "@/lib/server/requireAdmin";

// const ADMIN_EMAIL = "admin_ademola@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const { action, reviewId } = await req.json();
    console.log(action)
    // Recompute every product's rating from approved reviews. Products with no
    // approved reviews go to 0 — this clears any hand-typed numbers.
    if (action === "recalculateAll") {
      const products = await adminDb.collection("products").get();
      for (const p of products.docs) await recalcProductRating(p.id);
      return NextResponse.json({ ok: true, products: products.size });
    }

    if (!reviewId) return NextResponse.json({ error: "reviewId is required" }, { status: 400 });
    const ref = adminDb.collection("reviews").doc(reviewId);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Review not found" }, { status: 404 });
    const productId = snap.data()!.productId as string;

    if (action === "approve" || action === "reject") {
      await ref.update({
        status: action === "approve" ? "approved" : "rejected",
        moderatedAt: FieldValue.serverTimestamp(),
      });
    } else if (action === "delete") {
      await ref.delete();
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const summary = await recalcProductRating(productId);
    return NextResponse.json({ ok: true, ...summary });
  } catch (error) {
    console.error("Admin review action failed:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
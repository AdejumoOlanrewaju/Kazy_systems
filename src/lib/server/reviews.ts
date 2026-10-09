import { adminDb } from "@/lib/firebaseAdmin";

// Orders in these statuses can be reviewed. "delivered" means the customer
// actually has the laptop. Add "shipped" here if you don't always update orders.
export const REVIEWABLE_STATUSES = ["delivered"];

// "John Michael Doe" -> "John D."
export function toDisplayName(fullName: string): string {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Customer";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

// Recomputes a product's rating + review count from its APPROVED reviews.
export async function recalcProductRating(productId: string) {
  const snap = await adminDb
    .collection("reviews")
    .where("productId", "==", productId)
    .where("status", "==", "approved")
    .get();

  const count = snap.size;
  const sum = snap.docs.reduce((s, d) => s + (d.data().rating || 0), 0);
  const average = count ? Math.round((sum / count) * 10) / 10 : 0;

  const ref = adminDb.collection("products").doc(productId);
  if ((await ref.get()).exists) {
    await ref.update({ rating: average, reviews: count });
  }
  return { average, count };
}
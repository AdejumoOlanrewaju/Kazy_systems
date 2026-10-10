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

// Did this order contain the product? (older orders may lack productId)
export function orderHasProduct(order: any, productId: string): boolean {
  return (order.items || []).some(
    (i: any) => i.productId === productId || i.id === productId || String(i.id || "").startsWith(`${productId}_`)
  );
}

// Where does this customer stand with this product?
export async function findReviewState(email: string, productId: string) {
  const orders = await adminDb.collection("orders").where("email", "==", email).get();
  const relevant = orders.docs.filter((d) => orderHasProduct(d.data(), productId));
  if (relevant.length === 0) return { state: "no_order" as const };

  const delivered = relevant.filter((d) => REVIEWABLE_STATUSES.includes(d.data().status));
  if (delivered.length === 0) {
    const inProgress = relevant.some((d) => ["paid", "shipped"].includes(d.data().status));
    return { state: inProgress ? ("awaiting_delivery" as const) : ("no_order" as const) };
  }

  const reviewDocs = await adminDb.getAll(
    ...delivered.map((d) => adminDb.collection("reviews").doc(`${d.id}_${productId}`))
  );
  const open = delivered.find((_, i) => !reviewDocs[i].exists);
  return open
    ? { state: "can_review" as const, orderId: open.id }
    : { state: "already_reviewed" as const };
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
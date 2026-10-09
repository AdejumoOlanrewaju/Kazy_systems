import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type Review = {
  id: string;
  productId: string;
  productName: string;
  rating: number;
  title?: string;
  comment: string;
  authorName: string;
  orderId: string;
  email: string;
  status: ReviewStatus;
  createdAt?: { seconds: number };
};

// Admin only — Firestore rules allow reading reviews for the admin account.
export const getAllReviews = (callback: (reviews: Review[]) => void) => {
  const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review)));
  });
};
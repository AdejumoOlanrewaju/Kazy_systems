import { collection, doc, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Orders are created and paid ONLY by the server (/api/checkout/*). The browser
// can read orders (admin: all, customer: their own) and the admin can update
// status and shipping. Nothing else belongs here.

export type OrderStatus = "pending" | "paid" | "failed" | "shipped" | "delivered" | "refunded";

export type OrderItem = {
  id: string;
  productId?: string;
  configurationId?: string;
  configurationLabel?: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

export type OrderDelivery = {
  method: "pickup" | "delivery";
  fee: number;
  eta: string;
  label: string;
  state?: string;
  zoneName?: string;
  pickupAddress?: string;
};

export type OrderShipping = {
  courier?: string;
  trackingNumber?: string;
  expectedDate?: string; // "YYYY-MM-DD"
};

export type OrderRefund = { amount: number; reason: string; at: number; status: string };

export type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  itemsTotal?: number;
  delivery?: OrderDelivery;
  shipping?: OrderShipping;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  status: OrderStatus;
  paystackRef?: string;
  userId?: string;
  stockShortage?: string[];
  refundedTotal?: number;
  refunds?: OrderRefund[];
  createdAt?: { seconds: number };
};

// Admin only (Firestore rules).
export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  await updateDoc(doc(db, "orders", orderId), { status });
};

export const updateOrderShipping = async (
  orderId: string,
  shipping: { courier: string; trackingNumber: string; expectedDate: string }
) => {
  await updateDoc(doc(db, "orders", orderId), { shipping });
};

export const getOrders = (callback: (orders: Order[]) => void) => {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
  });
};

// A customer's own orders (My Orders).
export const getOrdersByEmail = (email: string, callback: (orders: Order[]) => void) => {
  const q = query(collection(db, "orders"), where("email", "==", email), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
  });
};
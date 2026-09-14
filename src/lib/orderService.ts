import { addDoc, collection, serverTimestamp, onSnapshot, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CartItem } from "@/store/cartStore";

export type OrderStatus = "pending" | "paid" | "failed" | "shipped" | "delivered";

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  status: OrderStatus;
  paystackRef?: string;
  createdAt?: { seconds: number };
};

export const createOrder = async (data: {
  items: CartItem[];
  total: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
}) => {
  const docRef = await addDoc(collection(db, "orders"), {
    ...data,
    status: "pending" as OrderStatus,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const markOrderPaid = async (orderId: string, paystackRef: string) => {
  await updateDoc(doc(db, "orders", orderId), {
    status: "paid",
    paystackRef,
  });
};

export const markOrderFailed = async (orderId: string) => {
  await updateDoc(doc(db, "orders", orderId), { status: "failed" });
};

// For admin use — moving a paid order through shipped/delivered.
export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  await updateDoc(doc(db, "orders", orderId), { status });
};

export const getOrders = (callback: (orders: Order[]) => void) => {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order));
    callback(orders);
  });
};
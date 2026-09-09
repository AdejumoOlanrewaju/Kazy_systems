import { addDoc, collection, serverTimestamp, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type LeadType = "repair" | "contact";

export type Lead = {
  id: string;
  type: LeadType;
  createdAt?: { seconds: number };
  [key: string]: any;
};

// Writes a lead to Firestore so it's never lost even if WhatsApp fails.
export const submitLead = async (type: LeadType, data: Record<string, string>) => {
  await addDoc(collection(db, "leads"), {
    type,
    ...data,
    createdAt: serverTimestamp(),
  });
};

// Live-subscribes to all leads, newest first. Returns an unsubscribe function.
export const getLeads = (callback: (leads: Lead[]) => void) => {
  const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const leads = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Lead));
    callback(leads);
  });
};
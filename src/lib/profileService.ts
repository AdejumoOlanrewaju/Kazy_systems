import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export type Profile = { name: string; phone: string; state: string; address: string }

export const getProfile = async (uid: string): Promise<Profile | null> => {
  const snap = await getDoc(doc(db, "profiles", uid))
  if (!snap.exists()) return null
  const d = snap.data()
  return { name: d.name ?? "", phone: d.phone ?? "", state: d.state ?? "", address: d.address ?? "" }
}

// Merges, so saving a pickup order (no address) never wipes a saved address.
export const saveProfile = async (uid: string, data: Partial<Profile>) => {
  const defined = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined))
  await setDoc(doc(db, "profiles", uid), { ...defined, updatedAt: serverTimestamp() }, { merge: true })
}
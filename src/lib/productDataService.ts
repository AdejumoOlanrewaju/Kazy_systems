import { db, auth } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, deleteField, doc, onSnapshot, arrayRemove } from "firebase/firestore";
import { LaptopType } from "./types";
import { getPublicIdFromUrl } from "@/lib/cloudinary";

// Write functions THROW on failure so the caller can tell the admin.

export const addProduct = async (data: LaptopType): Promise<string> => {
  // dbID must only ever come from Firestore's document id, never be stored inside the document.
  const { dbID, ...dataToSave } = data;
  const docRef = await addDoc(collection(db, "products"), dataToSave);
  return docRef.id;
};

export const getProducts = (
  callback: (products: any[]) => void,
  onError?: (error: Error) => void
) =>
  onSnapshot(
    collection(db, "products"),
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ ...d.data(), dbID: d.id })));
    },
    (error) => {
      console.error("Products listener failed:", error);
      onError?.(error);
    }
  );

export const updateProduct = async (id: string, data: LaptopType) => {
  // rating/reviews are maintained by the reviews system, so an edit must never overwrite them.
  const { dbID, rating, reviews, ...dataToSave } = data;

  // The admin form leaves these keys out when empty, and an update that merely
  // omits a field does NOT remove it. Delete explicitly, or removed
  // configurations/specs would linger on the product forever.
  const payload: Record<string, unknown> = { ...dataToSave };
  if (!("configurations" in payload)) payload.configurations = deleteField();
  if (!("specSheet" in payload)) payload.specSheet = deleteField();

  await updateDoc(doc(db, "products", id), payload);
};

export const deleteProduct = async (id: string) => {
  await deleteDoc(doc(db, "products", id));
};

export const deleteProductImage = async (productId: string, imageUrl: string) => {
  const publicId = getPublicIdFromUrl(imageUrl);
  if (publicId) {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("Not signed in");

    const res = await fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ publicId }),
    });
    if (!res.ok) throw new Error("Could not delete the image file");
  }
  await updateDoc(doc(db, "products", productId), { images: arrayRemove(imageUrl) });
};
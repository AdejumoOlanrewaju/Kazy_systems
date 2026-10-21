import { db, auth } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, deleteField, doc, onSnapshot, arrayRemove } from "firebase/firestore";
import { LaptopType } from "./types";
import { getPublicIdFromUrl } from "@/lib/cloudinary";

// The write functions below THROW on failure so the caller can tell the admin.

export const addProduct = async (data: LaptopType): Promise<string> => {
    // Never persist dbID as a stored field — it must only ever come from
    // Firestore's real document id (doc.id), never from data inside the doc.
    const { dbID, ...dataToSave } = data;
    const docRef = await addDoc(collection(db, "products"), dataToSave);
    return docRef.id;
};

export const getProducts = (
    callback: (products: any[]) => void,
    onError?: (error: Error) => void
) => {
    const unsubscribe = onSnapshot(
        collection(db, "products"),
        (snapshot) => {
            const products = snapshot.docs.map((doc) => ({
                ...doc.data(),
                dbID: doc.id, // spread first, then override — the real id always wins
            }));
            callback(products);
        },
        (error) => {
            console.error("Products listener failed:", error);
            onError?.(error);
        }
    );
    return unsubscribe;
};

// Expects the FULL product, as the admin form sends it. For a partial change,
// call updateDoc directly (like endDeal below), or this would delete
// configurations/specSheet.
export const updateProduct = async (id: string, data: LaptopType) => {
    // rating/reviews belong to the reviews system — an edit must never overwrite them.
    const { dbID, rating, reviews, ...dataToSave } = data;

    // The admin form leaves these keys out when they're empty, and an update that
    // merely omits a field does NOT remove it. Delete explicitly, or removed
    // configurations/specs would linger on the product forever.
    const payload: Record<string, any> = { ...dataToSave };
    if (!("configurations" in payload)) payload.configurations = deleteField();
    if (!("specSheet" in payload)) payload.specSheet = deleteField();

    await updateDoc(doc(db, "products", id), payload);
};

export const deleteProduct = async (id: string) => {
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
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
    await updateDoc(doc(db, "products", productId), {
        images: arrayRemove(imageUrl),
    });
};

// Ends a deal immediately: the product returns to its regular price.
// Discount and badge are kept so the deal is easy to re-run from the product form.
export const endDeal = async (id: string) => {
    await updateDoc(doc(db, "products", id), { isDeal: false, dealEndsAt: null });
};
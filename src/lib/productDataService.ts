import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, arrayRemove, getDoc, increment } from "firebase/firestore";
import { LaptopType } from "./types";
import { getPublicIdFromUrl } from "@/lib/cloudinary";
import { laptops } from "./data";
import { auth } from "@/lib/firebase";
export const addProduct = async (data: LaptopType) => {
    try {
        const docRef = await addDoc(collection(db, "products"), data);
        console.log("Product added with ID:", docRef.id);
    } catch (error) {
        console.error("Error adding product:", error);
    }
};

export const getProducts = (callback: (products: any[]) => void) => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
        const products = snapshot.docs.map((doc) => ({
            dbID: doc.id,
            ...doc.data(),
        }));
        const productsArr = [...products]
        callback(productsArr);
    });
    return unsubscribe;
};

export const updateProduct = async (id: string, data: LaptopType) => {
    try {
        const docRef = doc(db, 'products', id);
        await updateDoc(docRef, data);
        console.log(data)
    } catch (err) {
        console.log(err)
    }
};

export const deleteProduct = async (id: string) => {
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
};

export const deleteProductImage = async (productId: string, imageUrl: string) => {
    try {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) {
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                console.error("No authenticated user — cannot delete image");
                return;
            }

            await fetch("/api/cloudinary/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ publicId }),
            });
        }

        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, {
            images: arrayRemove(imageUrl),
        });
    } catch (error) {
        console.error("Error deleting image:", error);
    }
};

// Checks that requested quantities don't exceed what's actually left in stock —
// used right before payment starts, to catch stock someone else already bought.
export const checkProductsInStock = async (
    items: { id: string; quantity: number }[]
): Promise<{ allInStock: boolean; soldOutIds: string[] }> => {
    const soldOutIds: string[] = [];

    for (const item of items) {
        const snap = await getDoc(doc(db, "products", item.id));
        const available = snap.exists() ? (snap.data().stockQuantity ?? 0) : 0;
        if (available < item.quantity) {
            soldOutIds.push(item.id);
        }
    }

    return { allInStock: soldOutIds.length === 0, soldOutIds };
};

// Deducts purchased quantities from stock. Called only after payment is verified.
// Uses Firestore's atomic `increment` (negative) so concurrent orders can't
// both read the same stale count and oversell.
export const decrementStock = async (items: { id: string; quantity: number }[]) => {
    await Promise.all(
        items.map((item) =>
            updateDoc(doc(db, "products", item.id), {
                stockQuantity: increment(-item.quantity),
            })
        )
    );
};
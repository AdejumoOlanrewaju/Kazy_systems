import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, arrayRemove, getDoc, increment, runTransaction } from "firebase/firestore";
import { LaptopType } from "./types";
import { getPublicIdFromUrl } from "@/lib/cloudinary";

export const addProduct = async (data: LaptopType) => {
    try {
        // Never persist dbID as a stored field — it must only ever come from
        // Firestore's real document id (doc.id), never from data inside the doc.
        const { dbID, ...dataToSave } = data;
        const docRef = await addDoc(collection(db, "products"), dataToSave);
        console.log("Product added with ID:", docRef.id);
    } catch (error) {
        console.error("Error adding product:", error);
    }
};

export const getProducts = (callback: (products: any[]) => void) => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
        const products = snapshot.docs.map((doc) => ({
            ...doc.data(),
            dbID: doc.id, // spread first, then override — the real id always wins
        }));
        callback(products);
    });
    return unsubscribe;
};

export const updateProduct = async (id: string, data: LaptopType) => {
    try {
        const { dbID, ...dataToSave } = data;
        const docRef = doc(db, 'products', id);
        await updateDoc(docRef, dataToSave);
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
            const { auth } = await import("@/lib/firebase");
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                console.error("No authenticated user — cannot delete image");
                return;
            }
            await fetch("/api/cloudinary/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

type StockCheckItem = { cartId: string; productId: string; configurationId?: string; quantity: number };

export const checkProductsInStock = async (
    items: StockCheckItem[]
): Promise<{ allInStock: boolean; soldOutCartIds: string[] }> => {
    const soldOutCartIds: string[] = [];

    for (const item of items) {
        const snap = await getDoc(doc(db, "products", item.productId));
        if (!snap.exists()) {
            soldOutCartIds.push(item.cartId);
            continue;
        }
        const data = snap.data();

        if (item.configurationId) {
            const config = (data.configurations || []).find((c: any) => c.id === item.configurationId);
            const available = config?.stockQuantity ?? 0;
            if (available < item.quantity) soldOutCartIds.push(item.cartId);
        } else {
            const available = data.stockQuantity ?? 0;
            if (available < item.quantity) soldOutCartIds.push(item.cartId);
        }
    }

    return { allInStock: soldOutCartIds.length === 0, soldOutCartIds };
};

type DecrementItem = { productId: string; configurationId?: string; quantity: number };

export const decrementStock = async (items: DecrementItem[]) => {
    await Promise.all(
        items.map(async (item) => {
            if (item.configurationId) {
                await runTransaction(db, async (transaction) => {
                    const ref = doc(db, "products", item.productId);
                    const snap = await transaction.get(ref);
                    if (!snap.exists()) return;
                    const data = snap.data();
                    const configurations = (data.configurations || []).map((c: any) =>
                        c.id === item.configurationId
                            ? { ...c, stockQuantity: Math.max(0, c.stockQuantity - item.quantity) }
                            : c
                    );
                    transaction.update(ref, { configurations });
                });
            } else {
                await updateDoc(doc(db, "products", item.productId), {
                    stockQuantity: increment(-item.quantity),
                });
            }
        })
    );
};
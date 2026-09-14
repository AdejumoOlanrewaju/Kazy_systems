// lib/products.ts
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, arrayRemove, getDoc } from "firebase/firestore";
import { LaptopType } from "./types";
import { getPublicIdFromUrl } from "@/lib/cloudinary";

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
        callback(products);
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
            await fetch("/api/cloudinary/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicId }),
            });
        }

        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, {
            images: arrayRemove(imageUrl),
        });

        console.log("Image reference removed from Firestore");
    } catch (error) {
        console.error("Error deleting image:", error);
    }
};

// Checks whether a set of products is still marked inStock — used right
// before payment starts, to catch a laptop someone else already bought.
export const checkProductsInStock = async (
    productIds: string[]
): Promise<{ allInStock: boolean; soldOutIds: string[] }> => {
    const soldOutIds: string[] = [];

    for (const id of productIds) {
        const snap = await getDoc(doc(db, "products", id));
        if (!snap.exists() || snap.data().inStock === false) {
            soldOutIds.push(id);
        }
    }

    return { allInStock: soldOutIds.length === 0, soldOutIds };
};

// Marks each purchased laptop as sold out. Called only after payment is verified.
export const markProductsSoldOut = async (productIds: string[]) => {
    await Promise.all(
        productIds.map((id) => updateDoc(doc(db, "products", id), { inStock: false }))
    );
};
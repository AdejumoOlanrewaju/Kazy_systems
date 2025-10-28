// lib/products.ts
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, arrayRemove } from "firebase/firestore";
import { LaptopType } from "./types";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";

// Add new product
export const addProduct = async (data: LaptopType) => {
    try {
        const docRef = await addDoc(collection(db, "products"), data);
        console.log("Product added with ID:", docRef.id);
    } catch (error) {
        console.error("Error adding product:", error);
    }
};

// Get all products
export const getProducts = (callback: (products: any[]) => void) => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {

        const products = snapshot.docs.map((doc) => ({
            dbID: doc.id,
            ...doc.data(),
        }));
        callback(products);
    });
    // Return unsubscribe function so you can stop listening later
    return unsubscribe;
};

// Update product
export const updateProduct = async (id: string, data: LaptopType) => {
    try {
        const docRef = doc(db, 'products', id);
        await updateDoc(docRef, data);
        console.log(data)
    } catch (err) {
        console.log(err)
    }
};

// Delete product
export const deleteProduct = async (id: string) => {
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
};

export const deleteProductImage = async (productId: string, imageUrl: string) => {
    try {
        // 1️⃣ Create a storage reference from the image URL
        const imageRef = ref(storage, imageUrl);

        // 2️⃣ Delete the image file from Firebase Storage
        await deleteObject(imageRef);
        console.log("Image deleted from storage");

        // 3️⃣ Remove the image URL from Firestore document
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, {
            images: arrayRemove(imageUrl),
        });

        console.log("Image reference removed from Firestore");
    } catch (error) {
        console.error("Error deleting image:", error);
    }
};

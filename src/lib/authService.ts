import { signInWithEmailAndPassword, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
export const adminLogin = async (email: string, password: string): Promise<{ user: User, isAdmin: boolean } | null> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Option A: Simple check by email
    if (user.email === "admin_kayzee@gmail.com") {
        return { user, isAdmin: true };
    }

    return null

};
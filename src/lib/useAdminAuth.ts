"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";

const ADMIN_EMAIL = "admin_kayzee@gmail.com";

export const isAdminUser = async (user: User): Promise<boolean> => {
  if (user.email === ADMIN_EMAIL) return true;
  const docSnap = await getDoc(doc(db, "users", user.uid));
  return docSnap.exists() && docSnap.data().role === "admin";
};

// Guards any admin page. Redirects non-admins away.
export const useAdminAuth = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/admin/login");
        return;
      }
      const admin = await isAdminUser(currentUser);
      if (!admin) {
        router.push("/");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  return { loading, user };
};
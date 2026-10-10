"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

// Admin = a Firebase account carrying the `admin` custom claim (set once with
// scripts/set-admin-claim.mjs). The claim is inside the signed ID token, so it
// can't be faked from the browser.
export const isAdminUser = async (user: User): Promise<boolean> => {
  const token = await user.getIdTokenResult();
  return token.claims.admin === true;
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
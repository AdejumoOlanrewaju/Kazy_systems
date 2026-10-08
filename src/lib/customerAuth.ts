import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithCustomToken,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const signInWithFacebook = async () => {
  const provider = new FacebookAuthProvider();
  return signInWithPopup(auth, provider);
};

export const sendSignInCode = async (email: string) => {
  const res = await fetch("/api/auth/send-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to send code");
  return data;
};

export const verifySignInCode = async (email: string, code: string) => {
  const res = await fetch("/api/auth/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Invalid code");

  // Exchange the custom token for a real signed-in client session.
  await signInWithCustomToken(auth, data.token);
};

export const signOutCustomer = async () => {
  await signOut(auth);
};
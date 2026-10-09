import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithCustomToken,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ApiError, postJson } from "@/lib/apiClient";

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const signInWithFacebook = async () => {
  const provider = new FacebookAuthProvider();
  return signInWithPopup(auth, provider);
};

export const sendSignInCode = async (email: string) => {
  await postJson("/api/auth/send-code", { email });
};

export const verifySignInCode = async (email: string, code: string) => {
  const data = await postJson<{ token: string }>("/api/auth/verify-code", { email, code });
  // Exchange the custom token for a real signed-in client session.
  await signInWithCustomToken(auth, data.token);
};

export const signOutCustomer = async () => {
  await signOut(auth);
};

// Closing the popup isn't an error, so the page shouldn't show one.
export const isAuthCancelled = (err: any) =>
  ["auth/popup-closed-by-user", "auth/cancelled-popup-request"].includes(err?.code);

// Turns technical errors into something a customer can act on.
export const friendlyAuthError = (err: any): string => {
  if (err instanceof ApiError) return err.message;

  switch (err?.code) {
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in window. Allow pop-ups for this site and try again.";
    case "auth/network-request-failed":
      return "Network problem. Check your connection and try again.";
    case "auth/account-exists-with-different-credential":
      return "An account with this email already exists using a different sign-in method. Try Google or the email code instead.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/unauthorized-domain":
      return "Sign-in isn't available on this website address yet. Please contact us.";
    default:
      return "Something went wrong signing you in. Please try again.";
  }
};
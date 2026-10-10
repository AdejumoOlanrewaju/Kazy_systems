import { signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const adminLogin = async (
  email: string,
  password: string
): Promise<{ user: User; isAdmin: boolean } | null> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  // Force a fresh token so a newly granted admin claim is picked up.
  const token = await credential.user.getIdTokenResult(true);
  if (token.claims.admin === true) return { user: credential.user, isAdmin: true };

  await signOut(auth); // not an admin: don't leave a session behind
  return null;
};
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const docRef = adminDb.collection("otpCodes").doc(normalizedEmail);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Code not found or expired. Request a new one." }, { status: 400 });
    }

    const data = snap.data()!;

    if (Date.now() > data.expiresAt) {
      await docRef.delete();
      return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 });
    }

    if (data.attempts >= MAX_ATTEMPTS) {
      await docRef.delete();
      return NextResponse.json({ error: "Too many attempts. Request a new code." }, { status: 429 });
    }

    if (data.code !== code.toString().trim()) {
      await docRef.update({ attempts: data.attempts + 1 });
      return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
    }

    // Code correct — invalidate it immediately so it can't be reused.
    await docRef.delete();

    // Get or create the Firebase user for this email.
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(normalizedEmail);
    } catch {
      userRecord = await adminAuth.createUser({ email: normalizedEmail, emailVerified: true });
    }

    if (userRecord.customClaims?.admin) {
      return NextResponse.json(
        { error: "This email belongs to the admin account. Please sign in with your password." },
        { status: 403 }
      );
    }

    // Mint a custom token — the client exchanges this for a real signed-in session.
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return NextResponse.json({ token: customToken });
  } catch (error) {
    console.error("Code verification failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
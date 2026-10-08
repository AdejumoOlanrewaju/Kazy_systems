import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { adminDb } from "@/lib/firebaseAdmin";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    await adminDb.collection("otpCodes").doc(normalizedEmail).set({
      code,
      expiresAt,
      attempts: 0,
    });

    await resend.emails.send({
      from: "Kayzee Global Computer Networks <onboarding@resend.dev>",
      to: normalizedEmail,
      subject: `Your sign-in code: ${code}`,
      text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes. If you didn't request this, you can ignore this email.`,
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Failed to send sign-in code:", error);
    return NextResponse.json({ error: "Failed to send code. Please try again." }, { status: 500 });
  }
}
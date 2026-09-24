import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { adminAuth } from "@/lib/firebaseAdmin";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ADMIN_EMAIL = "admin_kayzee@gmail.com"; // same admin identity used elsewhere in the app

export async function POST(req: NextRequest) {
  try {
    // 1. Require a valid Firebase ID token in the Authorization header.
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify the token is real and not expired/tampered — this is the part
    // that can't be faked by a client, unlike a check that just trusts a header value.
    const decoded = await adminAuth.verifyIdToken(token);

    // 3. Confirm the verified user is actually the admin.
    if (decoded.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4. Only now proceed with the delete.
    const { publicId } = await req.json();
    if (!publicId) {
      return NextResponse.json({ error: "publicId is required" }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Cloudinary delete failed:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
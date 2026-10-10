import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { findReviewState } from "@/lib/server/reviews";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!productId || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let email: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    email = (decoded.email || "").toLowerCase();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!email) return NextResponse.json({ state: "no_order" });

  try {
    const result = await findReviewState(email, productId);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Review eligibility failed:", error);
    return NextResponse.json({ error: "Could not check review eligibility" }, { status: 500 });
  }
}
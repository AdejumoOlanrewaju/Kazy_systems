import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

// Never cache: a newly approved review must show up immediately.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get("productId");
    if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

    const snap = await adminDb
      .collection("reviews")
      .where("productId", "==", productId)
      .where("status", "==", "approved")
      .limit(100)
      .get();

    // Sorted in memory — avoids needing a composite Firestore index.
    const reviews = snap.docs
      .map((d) => {
        const r = d.data();
        const ms = r.createdAt?.toMillis?.() ?? 0;
        return {
          id: d.id,
          authorName: r.authorName,
          rating: r.rating,
          title: r.title || "",
          comment: r.comment,
          createdAt: ms ? new Date(ms).toISOString() : null,
          _ms: ms,
        };
      })
      .sort((a, b) => b._ms - a._ms)
      .map(({ _ms, ...rest }) => rest);

    const distribution = [0, 0, 0, 0, 0]; // index 0 = 5 stars ... index 4 = 1 star
    let sum = 0;
    reviews.forEach((r) => {
      sum += r.rating;
      distribution[5 - r.rating]++;
    });
    const count = reviews.length;
    const average = count ? Math.round((sum / count) * 10) / 10 : 0;

    return NextResponse.json(
      { reviews, summary: { average, count, distribution } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Fetch reviews failed:", error);
    return NextResponse.json({ error: "Could not load reviews" }, { status: 500 });
  }
}
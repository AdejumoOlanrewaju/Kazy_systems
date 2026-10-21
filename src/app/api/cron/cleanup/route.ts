import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { finalizeOrder, verifyPaystackTransaction } from "@/lib/server/finalizeOrder";

export const dynamic = "force-dynamic";

const DAY = 24 * 60 * 60 * 1000;

function chunks<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// Safe to run twice: every step is idempotent.
export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const report = { recovered: 0, deletedUnpaid: 0, keptUnsure: 0, otpDeleted: 0, rateLimitsDeleted: 0, dealsTidied: 0 };

  // 1. Pending orders older than a day
  const pending = await adminDb.collection("orders").where("status", "==", "pending").limit(200).get();
  const stale = pending.docs
    .filter((d) => (d.data().createdAt?.toMillis?.() ?? now) < now - DAY)
    .slice(0, 40);

  for (const group of chunks(stale, 8)) {
    await Promise.all(
      group.map(async (doc) => {
        const order = doc.data();
        if (!order.reference) {
          await doc.ref.delete();
          report.deletedUnpaid++;
          return;
        }

        const check = await verifyPaystackTransaction(order.reference);
        if (check.kind === "success") {
          // Paid, but we never heard about it: complete the order now.
          const result = await finalizeOrder(doc.id, order.reference);
          if (result.ok) report.recovered++;
          else report.keptUnsure++; // e.g. amount mismatch: leave it for a human
        } else if (check.kind === "not_success") {
          await doc.ref.delete();
          report.deletedUnpaid++;
        } else {
          report.keptUnsure++; // Paystack unreachable: never delete on a maybe
        }
      })
    );
  }

  // 2. Expired sign-in codes (keep anything still locked)
  const oldCodes = await adminDb.collection("otpCodes").where("expiresAt", "<", now - 2 * DAY).limit(300).get();
  const otpBatch = adminDb.batch();
  oldCodes.docs.forEach((d) => {
    if ((d.data().lockedUntil || 0) < now) {
      otpBatch.delete(d.ref);
      report.otpDeleted++;
    }
  });
  await otpBatch.commit();

  // 3. Expired rate-limit counters
  const oldLimits = await adminDb.collection("rateLimits").where("expireAt", "<", new Date()).limit(300).get();
  const limitBatch = adminDb.batch();
  oldLimits.docs.forEach((d) => limitBatch.delete(d.ref));
  await limitBatch.commit();
  report.rateLimitsDeleted = oldLimits.size;

  // 4. Tidy deals whose time has passed. Prices already follow the clock, so
  //    this is housekeeping, not correctness.
  const deals = await adminDb.collection("products").where("isDeal", "==", true).get();
  for (const d of deals.docs) {
    const endsAt = d.data().dealEndsAt;
    if (endsAt && endsAt <= now) {
      await d.ref.update({ isDeal: false, dealEndsAt: null });
      report.dealsTidied++;
    }
  }

  return NextResponse.json({ ok: true, ...report });
}
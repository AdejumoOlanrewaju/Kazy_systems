import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "olanrewajuadejumo56@gmail.com";
const SITE_URL = "https://kazy-systems.vercel.app";

export type FinalizeResult =
  | { ok: true; alreadyPaid: boolean }
  | { ok: false; error: string; status: number };

const DONE_STATUSES = ["paid", "shipped", "delivered"];

async function fetchPaystackTransaction(reference: string) {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      cache: "no-store",
    }
  );
  const json = await res.json().catch(() => null);
  return json?.data ?? null;
}

// Verifies a payment with Paystack and completes the order: marks it paid,
// decrements stock atomically, and notifies the admin. Safe to call more than
// once for the same order (the browser callback and the webhook both do).
export async function finalizeOrder(orderId: string, reference: string): Promise<FinalizeResult> {
  const orderRef = adminDb.collection("orders").doc(orderId);
  const snap = await orderRef.get();
  if (!snap.exists) return { ok: false, error: "Order not found", status: 404 };

  const order = snap.data()!;
  if (DONE_STATUSES.includes(order.status)) return { ok: true, alreadyPaid: true };

  if (order.reference && order.reference !== reference) {
    return { ok: false, error: "Payment reference does not match this order", status: 400 };
  }

  // One payment can only ever complete one order.
  const dup = await adminDb.collection("orders").where("paystackRef", "==", reference).limit(1).get();
  if (!dup.empty && dup.docs[0].id !== orderId) {
    return { ok: false, error: "This payment is already linked to another order", status: 409 };
  }

  // Ask Paystack directly — never trust anything the browser says.
  const tx = await fetchPaystackTransaction(reference);
  if (!tx || tx.status !== "success") {
    return { ok: false, error: "Payment not successful", status: 402 };
  }
  if (tx.amount !== Math.round(order.total * 100) || tx.currency !== "NGN") {
    console.error("Amount mismatch", { orderId, paid: tx.amount, expected: order.total * 100 });
    return { ok: false, error: "Amount paid does not match the order total", status: 400 };
  }
  if (tx.customer?.email?.toLowerCase() !== String(order.email).toLowerCase()) {
    return { ok: false, error: "Payment email does not match the order", status: 400 };
  }

  let newlyPaid = false;
  const shortages: string[] = [];

  await adminDb.runTransaction(async (t) => {
    newlyPaid = false;
    shortages.length = 0;

    const fresh = await t.get(orderRef);
    if (DONE_STATUSES.includes(fresh.data()?.status)) return;

    const items: any[] = fresh.data()!.items;
    const productIds = [...new Set(items.map((i) => i.productId as string))];
    const productRefs = productIds.map((id) => adminDb.collection("products").doc(id));
    const productSnaps = await t.getAll(...productRefs);

    // Mutate in memory first (two lines may hit the same product), then write once.
    const products = new Map<string, any>();
    productSnaps.forEach((s) => s.exists && products.set(s.id, { ...s.data() }));

    for (const item of items) {
      const p = products.get(item.productId);
      if (!p) continue;

      if (item.configurationId) {
        const cfg = (p.configurations || []).find((c: any) => c.id === item.configurationId);
        if (!cfg) continue;
        if (cfg.stockQuantity < item.quantity) shortages.push(`${item.name} (${item.configurationLabel || "config"})`);
        cfg.stockQuantity = Math.max(0, cfg.stockQuantity - item.quantity);
      } else {
        if ((p.stockQuantity ?? 0) < item.quantity) shortages.push(item.name);
        p.stockQuantity = Math.max(0, (p.stockQuantity ?? 0) - item.quantity);
      }
    }

    for (const [id, p] of products) {
      const ref = adminDb.collection("products").doc(id);
      const touchesConfigs = items.some((i) => i.productId === id && i.configurationId);
      t.update(ref, touchesConfigs ? { configurations: p.configurations } : { stockQuantity: p.stockQuantity });
    }

    t.update(orderRef, {
      status: "paid",
      paystackRef: reference,
      paidAt: FieldValue.serverTimestamp(),
      ...(shortages.length ? { stockShortage: shortages } : {}),
    });
    newlyPaid = true;
  });

  if (newlyPaid) {
    await notifyAdmin(orderId, order, shortages).catch((e) => console.error("Admin email failed:", e));
  }

  return { ok: true, alreadyPaid: !newlyPaid };
}

async function notifyAdmin(orderId: string, order: any, shortages: string[]) {
  const itemsList = (order.items as any[])
    .map((i) => {
      const cfg = i.configurationLabel ? ` (${i.configurationLabel})` : "";
      return `- ${i.name}${cfg} × ${i.quantity} — ₦${(i.price * i.quantity).toLocaleString()}`;
    })
    .join("\n");

  const d = order.delivery;
  const deliveryBlock = !d
    ? `Delivery address: ${order.address}`
    : d.method === "pickup"
      ? `HOW: PICKUP from the shop (no delivery fee)`
      : `HOW: DELIVERY to ${d.state} — fee ₦${(d.fee || 0).toLocaleString()} (${d.eta || "no estimate"})\nDelivery address: ${order.address}`;

  const warning = shortages.length
    ? `\n⚠️ STOCK PROBLEM: this order was paid but stock was already short for:\n${shortages.join("\n")}\nContact the customer or refund via Paystack.\n`
    : "";

  await resend.emails.send({
    from: "Kayzee Orders <onboarding@resend.dev>",
    to: ADMIN_EMAIL,
    subject: `New Order — ₦${order.total.toLocaleString()} from ${order.customerName}`,
    text: `New paid order received.
${warning}
Order ID: ${orderId}
Customer: ${order.customerName}
Phone: ${order.phone}
Email: ${order.email}
${deliveryBlock}

Items:
${itemsList}

Items total: ₦${(order.itemsTotal ?? order.total).toLocaleString()}
Delivery fee: ₦${(d?.fee ?? 0).toLocaleString()}
TOTAL PAID: ₦${order.total.toLocaleString()}

View in admin: ${SITE_URL}/admin/orders`,
  });
}
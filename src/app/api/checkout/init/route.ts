import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { getEffectivePrice, getConfigurationLabel } from "@/lib/productDisplay";

type InItem = { productId: string; configurationId?: string; quantity: number };

const fail = (error: string, status = 400, code?: string) =>
  NextResponse.json({ error, ...(code ? { code } : {}) }, { status });

export async function POST(req: NextRequest) {
  try {
    const { items, customer, expectedTotal } = await req.json();

    // ---- validate input shape ----
    if (!Array.isArray(items) || items.length === 0 || items.length > 20) return fail("Your cart is empty.");
    const name = String(customer?.customerName || "").trim();
    const email = String(customer?.email || "").trim().toLowerCase();
    const phone = String(customer?.phone || "").trim();
    const address = String(customer?.address || "").trim();
    if (!name || !phone || !address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail("Please fill in all your details correctly.");
    }

    // Merge duplicate lines
    const lines = new Map<string, InItem>();
    for (const raw of items as InItem[]) {
      const qty = Number(raw?.quantity);
      if (!raw?.productId || !Number.isInteger(qty) || qty < 1 || qty > 20) return fail("Invalid cart item.");
      const key = `${raw.productId}_${raw.configurationId || ""}`;
      const existing = lines.get(key);
      if (existing) existing.quantity += qty;
      else lines.set(key, { productId: raw.productId, configurationId: raw.configurationId, quantity: qty });
    }

    // ---- load real products & price everything on the server ----
    const productIds = [...new Set([...lines.values()].map((l) => l.productId))];
    const snaps = await adminDb.getAll(...productIds.map((id) => adminDb.collection("products").doc(id)));
    const products = new Map(snaps.filter((s) => s.exists).map((s) => [s.id, s.data() as any]));

    const orderItems: any[] = [];
    let total = 0;

    for (const line of lines.values()) {
      const p = products.get(line.productId);
      if (!p) return fail("An item in your cart is no longer available.", 409, "UNAVAILABLE");

      const hasConfigs = (p.configurations?.length ?? 0) > 0;
      let config: any = undefined;

      if (hasConfigs) {
        if (!line.configurationId) return fail("Please choose a configuration.");
        config = p.configurations.find((c: any) => c.id === line.configurationId);
        if (!config) return fail(`A configuration of ${p.name} is no longer available.`, 409, "UNAVAILABLE");
      } else if (line.configurationId) {
        return fail("Invalid cart item.");
      }

      const stock = config ? config.stockQuantity : p.stockQuantity ?? 0;
      if (stock < line.quantity) {
        return fail(`${p.name} doesn't have enough stock (${stock} left).`, 409, "NO_STOCK");
      }

      const price = getEffectivePrice(p, config).price;
      if (!(price > 0)) return fail("This item can't be purchased right now.", 409, "UNAVAILABLE");

      total += price * line.quantity;
      orderItems.push({
        id: config ? `${line.productId}_${config.id}` : line.productId,
        productId: line.productId,
        ...(config ? { configurationId: config.id, configurationLabel: getConfigurationLabel(config) } : {}),
        name: p.name,
        price,
        image: p.images?.[0] || "",
        quantity: line.quantity,
      });
    }

    // The customer saw a total on screen — if the real total differs
    // (a deal ended, a price changed), make them confirm the new price.
    if (typeof expectedTotal === "number" && expectedTotal !== total) {
      return fail("Prices were updated. Please review your cart and try again.", 409, "PRICE_CHANGED");
    }

    // ---- create the pending order ----
    const orderRef = adminDb.collection("orders").doc();
    const reference = `kazy-${orderRef.id}`;

    await orderRef.set({
      items: orderItems,
      total,
      customerName: name,
      email,
      phone,
      address,
      status: "pending",
      reference,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      orderId: orderRef.id,
      reference,
      amountKobo: Math.round(total * 100),
      email,
    });
  } catch (error) {
    console.error("Checkout init failed:", error);
    return fail("Something went wrong. Please try again.", 500);
  }
}
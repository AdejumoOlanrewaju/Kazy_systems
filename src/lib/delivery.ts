export const NIGERIAN_STATES: string[] = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
]

export type DeliveryMethod = "pickup" | "delivery"

export type DeliveryZone = {
  id: string
  name: string
  fee: number
  eta: string
  states: string[]
}

export type DeliverySettings = {
  pickup: { enabled: boolean; address: string; eta: string }
  zones: DeliveryZone[]
  fallback: { name: string; fee: number; eta: string } // every state not in a zone
  freeDeliveryThreshold: number | null // items total at/above which delivery is free
}

// Starting values for the admin form only. Delivery stays switched off for
// customers until the admin saves real settings (see `configured`).
export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  pickup: { enabled: true, address: "", eta: "Ready within 24 hours of payment" },
  zones: [{ id: "lagos", name: "Lagos", fee: 0, eta: "1–2 business days", states: ["Lagos"] }],
  fallback: { name: "Other states", fee: 0, eta: "3–5 business days" },
  freeDeliveryThreshold: null,
}

// Defensive: whatever is stored in Firestore, always return a complete object.
export function normalizeDeliverySettings(raw: any): DeliverySettings {
  const d = DEFAULT_DELIVERY_SETTINGS
  const threshold = Number(raw?.freeDeliveryThreshold)
  return {
    pickup: {
      enabled: raw?.pickup?.enabled ?? d.pickup.enabled,
      address: String(raw?.pickup?.address ?? d.pickup.address),
      eta: String(raw?.pickup?.eta ?? d.pickup.eta),
    },
    zones: Array.isArray(raw?.zones)
      ? raw.zones.map((z: any, i: number) => ({
          id: String(z?.id ?? `zone_${i}`),
          name: String(z?.name ?? ""),
          fee: Number(z?.fee) || 0,
          eta: String(z?.eta ?? ""),
          states: Array.isArray(z?.states) ? z.states.map(String) : [],
        }))
      : d.zones,
    fallback: {
      name: String(raw?.fallback?.name ?? d.fallback.name),
      fee: Number(raw?.fallback?.fee) || 0,
      eta: String(raw?.fallback?.eta ?? d.fallback.eta),
    },
    freeDeliveryThreshold: threshold > 0 ? threshold : null,
  }
}

export type DeliveryQuote =
  | {
      ok: true
      method: DeliveryMethod
      fee: number
      eta: string
      label: string
      free: boolean
      state?: string
      zoneName?: string
    }
  | { ok: false; error: string }

// The single source of truth for what delivery costs.
export function computeDelivery(
  settings: DeliverySettings,
  itemsTotal: number,
  method: DeliveryMethod,
  state?: string
): DeliveryQuote {
  if (method === "pickup") {
    if (!settings.pickup.enabled) return { ok: false, error: "Pickup isn't available right now." }
    return { ok: true, method: "pickup", fee: 0, eta: settings.pickup.eta, label: "Pickup from our shop", free: true }
  }

  if (method !== "delivery") return { ok: false, error: "Please choose how you want to receive your order." }
  if (!state || !NIGERIAN_STATES.includes(state)) return { ok: false, error: "Please choose your state." }

  const zone = settings.zones.find((z) => z.states.includes(state))
  const rate = zone ?? settings.fallback
  const free = !!settings.freeDeliveryThreshold && itemsTotal >= settings.freeDeliveryThreshold

  return {
    ok: true,
    method: "delivery",
    fee: free ? 0 : rate.fee,
    eta: rate.eta,
    label: `Delivery to ${state}`,
    free,
    state,
    zoneName: rate.name,
  }
}

// Pickup orders read "Ready for pickup" / "Collected" instead of shipped/delivered.
export function orderStatusLabel(status: string, method?: DeliveryMethod): string {
  const pickup = method === "pickup"
  switch (status) {
    case "pending": return "Payment pending"
    case "paid": return "Order confirmed"
    case "shipped": return pickup ? "Ready for pickup" : "Shipped"
    case "delivered": return pickup ? "Collected" : "Delivered"
    case "failed": return "Payment failed"
    default: return status
  }
}

// One sentence describing delivery, built from the live settings, so the FAQ
// can't contradict the checkout.
export function describeDelivery(s: DeliverySettings): string {
  const money = (n: number) => (n > 0 ? `₦${n.toLocaleString()}` : "free")
  const rates = [
    ...s.zones.filter((z) => z.states.length > 0).map((z) => ({ name: z.name, fee: z.fee, eta: z.eta })),
    s.fallback,
  ].map((r) => `${r.name}: ${money(r.fee)}${r.eta ? ` (${r.eta})` : ""}`)

  let text = `We deliver to all states in Nigeria. ${rates.join("; ")}.`
  if (s.freeDeliveryThreshold) {
    text += ` Delivery is free on orders of ₦${s.freeDeliveryThreshold.toLocaleString()} and above.`
  }
  if (s.pickup.enabled) {
    text += ` You can also pick up from our shop at no charge${s.pickup.address ? ` (${s.pickup.address})` : ""}.`
  }
  return text
}
export const PENDING_KEY = "kazy-pending-checkout"
const MAX_AGE_MS = 24 * 60 * 60 * 1000
const STILL_PROCESSING = ["ongoing", "pending", "processing", "queued", "unknown"]

type Pending = { orderId: string; reference: string; at: number }

export const savePendingCheckout = (orderId: string, reference: string) =>
  localStorage.setItem(PENDING_KEY, JSON.stringify({ orderId, reference, at: Date.now() }))

export const clearPendingCheckout = () => localStorage.removeItem(PENDING_KEY)

export const readPendingCheckout = (): Pending | null => {
  const raw = localStorage.getItem(PENDING_KEY)
  if (!raw) return null
  try {
    const p = JSON.parse(raw) as Pending
    if (!p.orderId || !p.reference || Date.now() - p.at > MAX_AGE_MS) throw new Error("stale")
    return p
  } catch {
    localStorage.removeItem(PENDING_KEY)
    return null
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export type PaymentOutcome = "paid" | "unpaid" | "unknown"

// Asks the server (which asks Paystack) whether this payment really went through.
export async function confirmPayment(orderId: string, reference: string, attempts = 5): Promise<PaymentOutcome> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch("/api/checkout/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reference }),
      })
      if (res.ok) return "paid"

      const data = await res.json().catch(() => ({}))
      if (res.status === 402 && !STILL_PROCESSING.includes(data.paymentStatus)) return "unpaid"
      // Other 4xx errors (bad reference, amount mismatch...) can't be fixed by retrying.
      if (res.status >= 400 && res.status < 500 && res.status !== 402 && res.status !== 429) return "unknown"
    } catch {
      // network blip: try again
    }
    await sleep(2500)
  }
  return "unknown"
}
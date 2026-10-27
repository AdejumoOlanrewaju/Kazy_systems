"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useCartStore } from "@/store/cartStore"
import { clearPendingCheckout, confirmPayment, readPendingCheckout } from "@/lib/checkoutClient"

// If someone paid but closed the popup, the tab or the browser before we showed
// their order, pick it up on the next page load and take them to their confirmation.
const PendingCheckoutWatcher = () => {
  const router = useRouter()

  useEffect(() => {
    const pending = readPendingCheckout()
    if (!pending) return

    let cancelled = false
    confirmPayment(pending.orderId, pending.reference, 4).then((outcome) => {
      if (cancelled) return
      if (outcome === "paid") {
        clearPendingCheckout()
        useCartStore.getState().clearCart()
        toast.success("Your payment went through — here's your order.")
        router.push(`/order-confirmation?orderId=${pending.orderId}`)
      } else if (outcome === "unpaid") {
        clearPendingCheckout() // they never paid
      }
    })

    return () => {
      cancelled = true
    }
  }, [router])

  return null
}

export default PendingCheckoutWatcher
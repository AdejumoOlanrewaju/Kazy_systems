"use client"
import React, { useEffect, useRef, useState } from "react"
import Script from "next/script"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/cartStore"
import { useLaptopStore } from "@/store/laptopStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ArrowLeft, Lock, ShieldCheck, User, MapPin } from "lucide-react"

declare global {
  interface Window {
    PaystackPop: any
  }
}

const CheckoutPage = () => {
  const router = useRouter()
  const { items, totalPrice, clearCart, syncPrices } = useCartStore()
  const { laptopStoreData, loadingStore } = useLaptopStore()

  const [form, setForm] = useState({ customerName: "", email: "", phone: "", address: "" })
  const [processing, setProcessing] = useState(false)
  const paidRef = useRef(false) // Paystack fires onClose after a successful payment too

  // Re-price the cart from live product data (deals may have started/ended).
  useEffect(() => {
    if (!loadingStore && laptopStoreData.length > 0) syncPrices(laptopStoreData)
  }, [laptopStoreData, loadingStore, syncPrices])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Runs after Paystack reports success. The server re-verifies everything
  // with Paystack; the browser's word is never trusted.
  const finishPayment = async (orderId: string, reference: string) => {
    try {
      const res = await fetch("/api/checkout/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reference }),
      })
      if (!res.ok) throw new Error("not confirmed")

      clearCart()
      toast.success("Payment successful!")
      router.push(`/order-confirmation?orderId=${orderId}`)
    } catch {
      toast.error(
        `We received your payment (ref: ${reference}) but couldn't confirm your order yet. Please don't pay again — contact us with this reference.`,
        { duration: 15000 }
      )
      setProcessing(false)
    }
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.customerName || !form.email || !form.phone || !form.address) {
      toast.error("Please fill in all fields.")
      return
    }
    if (items.length === 0) {
      toast.error("Your cart is empty.")
      return
    }
    if (!window.PaystackPop) {
      toast.error("Payment system is still loading, try again in a moment.")
      return
    }

    setProcessing(true)
    paidRef.current = false

    // The server prices the cart, checks stock, and creates the order.
    let init: { orderId: string; reference: string; amountKobo: number; email: string }
    try {
      const res = await fetch("/api/checkout/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            configurationId: i.configurationId,
            quantity: i.quantity,
          })),
          customer: form,
          expectedTotal: totalPrice(),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.code === "PRICE_CHANGED" || data.code === "UNAVAILABLE" || data.code === "NO_STOCK") {
          syncPrices(laptopStoreData)
        }
        toast.error(data.error || "Couldn't start checkout.")
        setProcessing(false)
        return
      }
      init = data
    } catch {
      toast.error("Network problem. Please try again.")
      setProcessing(false)
      return
    }

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: init.email,
      amount: init.amountKobo,
      currency: "NGN",
      ref: init.reference,
      callback: (response: any) => {
        paidRef.current = true
        finishPayment(init.orderId, response.reference)
      },
      onClose: () => {
        if (paidRef.current) return
        setProcessing(false)
        toast.info("Payment cancelled.")
      },
    })
    handler.openIframe()
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <p className="text-gray-500">Your cart is empty — nothing to check out.</p>
      </div>
    )
  }

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-slate-900 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

          <div className="lg:grid lg:grid-cols-3 gap-8 items-start">
            <form onSubmit={handleCheckout} className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  Contact Information
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name *</label>
                  <Input name="customerName" value={form.customerName} onChange={handleChange} placeholder="John Doe" required className="h-11" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Email *</label>
                    <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required className="h-11" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Phone Number *</label>
                    <Input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+234 XXX XXX XXXX" required className="h-11" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Delivery Address
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Address *</label>
                  <Input name="address" value={form.address} onChange={handleChange} placeholder="Street, City, State" required className="h-11" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={processing}
                size="lg"
                className="w-full lg:hidden bg-slate-900 hover:bg-slate-800 text-white font-semibold h-12 rounded-xl disabled:opacity-60"
              >
                {processing ? "Processing..." : `Pay ₦${totalPrice().toLocaleString()}`}
              </Button>
            </form>

            <div className="lg:sticky lg:top-24 lg:mt-0 mt-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                <h2 className="font-bold text-slate-900 text-lg">Order Summary</h2>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-gray-100 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                        {item.configurationLabel && (
                          <p className="text-xs text-gray-500 truncate">{item.configurationLabel}</p>
                        )}
                        <p className="text-xs text-gray-400">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-slate-900">₦{totalPrice().toLocaleString()}</span>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={processing}
                  size="lg"
                  className="hidden lg:flex w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-12 rounded-xl disabled:opacity-60 items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {processing ? "Processing..." : `Pay ₦${totalPrice().toLocaleString()}`}
                </Button>

                <div className="flex items-center gap-2.5 text-xs text-gray-500 pt-1">
                  <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>Payments are encrypted and secured by Paystack</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CheckoutPage
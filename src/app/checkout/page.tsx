"use client"
import React, { useState } from "react"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/cartStore"
import { createOrder, markOrderPaid, markOrderFailed } from "@/lib/orderService"
import { checkProductsInStock, markProductsSoldOut } from "@/lib/productDataService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

declare global {
  interface Window {
    PaystackPop: any
  }
}

const CheckoutPage = () => {
  const router = useRouter()
  const { items, totalPrice, clearCart, removeItem } = useCartStore()

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
  })
  const [processing, setProcessing] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentResult = async (reference: string) => {
    try {
      const orderId = await createOrder({
        items,
        total: totalPrice(),
        ...form,
      })

      const verifyRes = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      })
      const verifyData = await verifyRes.json()

      if (verifyData.verified) {
        await markOrderPaid(orderId, reference)
        // Flip each purchased laptop to sold out now that payment is confirmed.
        await markProductsSoldOut(items.map((i) => i.id))
        clearCart()
        toast.success("Payment successful!")
        router.push(`/order-confirmation?orderId=${orderId}`)
      } else {
        await markOrderFailed(orderId)
        toast.error("Payment could not be verified. Contact support.")
      }
    } catch (err) {
      console.error("Checkout error:", err)
      toast.error("Something went wrong. Please contact support.")
    } finally {
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

    const { allInStock, soldOutIds } = await checkProductsInStock(items.map((i) => i.id))
    if (!allInStock) {
      soldOutIds.forEach((id) => removeItem(id))
      toast.error("One or more items in your cart just sold out and were removed. Please review your cart.")
      setProcessing(false)
      return
    }

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: form.email,
      amount: totalPrice() * 100,
      ref: `kazy_${Date.now()}`,
      callback: (response: any) => {
        handlePaymentResult(response.reference)
      },
      onClose: () => {
        setProcessing(false)
        toast.info("Payment cancelled.")
      },
    })
    handler.openIframe()
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-600">Your cart is empty — nothing to check out.</p>
      </div>
    )
  }

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-slate-900 mb-3">Order Summary</h2>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-gray-700 mb-1">
              <span>{item.name} × {item.quantity}</span>
              <span>₦{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-slate-900 border-t border-gray-200 mt-3 pt-3">
            <span>Total</span>
            <span>₦{totalPrice().toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Full Name *</label>
            <Input name="customerName" value={form.customerName} onChange={handleChange} placeholder="John Doe" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Email *</label>
            <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Phone Number *</label>
            <Input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+234 XXX XXX XXXX" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Delivery Address *</label>
            <Input name="address" value={form.address} onChange={handleChange} placeholder="Street, City, State" required />
          </div>

          <Button
            type="submit"
            disabled={processing}
            size="lg"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-12 disabled:opacity-60"
          >
            {processing ? "Processing..." : `Pay ₦${totalPrice().toLocaleString()}`}
          </Button>
        </form>
      </div>
    </>
  )
}

export default CheckoutPage
"use client"
import React, { useEffect, useRef, useState } from "react"
import Script from "next/script"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/cartStore"
import { useLaptopStore } from "@/store/laptopStore"
import { useDeliverySettings } from "@/lib/deliveryService"
import { computeDelivery, DeliveryMethod, NIGERIAN_STATES } from "@/lib/delivery"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ArrowLeft, Lock, ShieldCheck, User, MapPin, Truck, Store } from "lucide-react"
import { useCustomerAuth } from "@/lib/useCustomerAuth"
import { getProfile, saveProfile } from "@/lib/profileService"
declare global {
  interface Window {
    PaystackPop: any
  }
}

const OptionCard = ({
  active,
  disabled,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  subtitle: string
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`text-left rounded-xl border-2 p-4 transition-colors ${active ? "border-slate-900 bg-slate-50" : "border-gray-200 hover:border-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    <div className="flex items-center gap-2 font-semibold text-slate-900">
      {icon}
      {title}
    </div>
    <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
  </button>
)

const CheckoutPage = () => {
  const router = useRouter()
  const { items, totalPrice, clearCart, syncPrices } = useCartStore()
  const { laptopStoreData, loadingStore } = useLaptopStore()
  const { settings, configured, loading: settingsLoading, error: settingsError } = useDeliverySettings()

  const [form, setForm] = useState({ customerName: "", email: "", phone: "", address: "" })
  const [method, setMethod] = useState<DeliveryMethod>("delivery")
  const [state, setState] = useState("")
  const [processing, setProcessing] = useState(false)
  const paidRef = useRef(false) // Paystack fires onClose after a successful payment too

  // Re-price the cart from live product data (deals may have started/ended).
  useEffect(() => {
    if (!loadingStore && laptopStoreData.length > 0) syncPrices(laptopStoreData)
  }, [laptopStoreData, loadingStore, syncPrices])

  // Start on whichever option is actually available.
  useEffect(() => {
    if (settingsLoading) return
    if (!configured && settings.pickup.enabled) setMethod("pickup")
    else if (configured && !settings.pickup.enabled) setMethod("delivery")
  }, [settingsLoading, configured, settings.pickup.enabled])

  const { user, loading: authLoading } = useCustomerAuth()
  const prefilled = useRef(false)

  // Signed-in customers: fill in what we already know.
  useEffect(() => {
    if (!user) {
      prefilled.current = false
      return
    }
    if (prefilled.current) return
    prefilled.current = true

    setForm((f) => ({
      ...f,
      email: user.email ?? f.email,
      customerName: f.customerName || user.displayName || "",
    }))
    getProfile(user.uid)
      .then((p) => {
        if (!p) return
        setForm((f) => ({
          ...f,
          customerName: p.name || f.customerName,
          phone: p.phone || f.phone,
          address: p.address || f.address,
        }))
        if (p.state) setState((s) => s || p.state)
      })
      .catch(() => { })
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // What the customer sees. The server recomputes this independently and is
  // the only one that decides what is charged.
  const subtotal = totalPrice()
  const quote = settingsLoading ? null : computeDelivery(settings, subtotal, method, state || undefined)
  const deliveryFee = quote && quote.ok ? quote.fee : 0
  const grandTotal = subtotal + deliveryFee
  const canPay = !processing && !settingsLoading && !!quote && quote.ok

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
      router.push(`/order-Confirmation?orderId=${orderId}`)
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

    if (!form.customerName || !form.email || !form.phone) {
      toast.error("Please fill in your name, email and phone number.")
      return
    }
    if (items.length === 0) {
      toast.error("Your cart is empty.")
      return
    }
    if (!quote || !quote.ok) {
      toast.error(quote && !quote.ok ? quote.error : "Please choose how you want to receive your order.")
      return
    }
    if (method === "delivery" && !form.address.trim()) {
      toast.error("Please enter your delivery address.")
      return
    }
    if (!window.PaystackPop) {
      toast.error("Payment system is still loading, try again in a moment.")
      return
    }

    setProcessing(true)
    paidRef.current = false

    // The server prices the items AND delivery, checks stock, and creates the order.
    let init: { orderId: string; reference: string; amountKobo: number; email: string }
    try {
      const token = user ? await user.getIdToken() : null
      const res = await fetch("/api/checkout/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            configurationId: i.configurationId,
            quantity: i.quantity,
          })),
          customer: { ...form, address: method === "delivery" ? form.address : "" },
          delivery: { method, state: method === "delivery" ? state : undefined },
          expectedTotal: grandTotal,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (["PRICE_CHANGED", "UNAVAILABLE", "NO_STOCK"].includes(data.code)) syncPrices(laptopStoreData)
        toast.error(data.error || "Couldn't start checkout.")
        setProcessing(false)
        return
      }
      init = data
      if (user) {
        saveProfile(user.uid, {
          name: form.customerName,
          phone: form.phone,
          ...(method === "delivery" ? { state, address: form.address } : {}),
        }).catch(() => { })
      }
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

          {!authLoading && !user && (
            <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900">
              <span>Have an account? Sign in to fill in your details and track this order in My Orders.</span>
              <Link href="/sign-in?next=/checkout" className="font-semibold underline whitespace-nowrap">Sign in</Link>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8 items-start">
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
                    <Input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      readOnly={!!user}
                      placeholder="john@example.com"
                      required
                      className={`h-11 ${user ? "bg-gray-50 text-gray-500" : ""}`}
                    />
                    {user && (
                      <p className="text-xs text-gray-400 mt-1">Your account email, so this order shows up in My Orders.</p>
                    )}                   </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Phone Number *</label>
                    <Input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+234 XXX XXX XXXX" required className="h-11" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  How do you want to receive it?
                </h2>

                {settingsError && (
                  <p className="text-sm text-red-600">
                    We couldn't load delivery options. Please refresh the page.
                  </p>
                )}

                <div className="grid sm:grid-cols-2 gap-3">
                  <OptionCard
                    active={method === "delivery"}
                    disabled={!configured}
                    onClick={() => setMethod("delivery")}
                    icon={<Truck className="w-4 h-4" />}
                    title="Delivery"
                    subtitle={configured ? "We bring it to you" : "Not available right now"}
                  />
                  <OptionCard
                    active={method === "pickup"}
                    disabled={!settings.pickup.enabled}
                    onClick={() => setMethod("pickup")}
                    icon={<Store className="w-4 h-4" />}
                    title="Pickup"
                    subtitle={settings.pickup.enabled ? "Free — collect from our shop" : "Not available right now"}
                  />
                </div>

                {method === "delivery" && configured && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">State *</label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full h-11 px-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="">Select your state</option>
                        {NIGERIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">Delivery address *</label>
                      <Input name="address" value={form.address} onChange={handleChange} placeholder="House number, street, area, city" className="h-11" />
                    </div>
                    {quote && quote.ok && (
                      <div className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700">
                        <span className="font-semibold text-slate-900">{quote.label}:</span>{" "}
                        {quote.fee > 0 ? `₦${quote.fee.toLocaleString()}` : "Free"}
                        {quote.free && " — your order qualifies for free delivery"}
                        {quote.eta && <span className="text-gray-500"> · {quote.eta}</span>}
                      </div>
                    )}
                  </div>
                )}

                {method === "pickup" && settings.pickup.enabled && (
                  <div className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 space-y-1">
                    <p className="font-semibold text-slate-900">Pick up from our shop</p>
                    {settings.pickup.address && <p>{settings.pickup.address}</p>}
                    {settings.pickup.eta && <p className="text-gray-500">{settings.pickup.eta}</p>}
                  </div>
                )}

                {!settingsLoading && !configured && !settings.pickup.enabled && (
                  <p className="text-sm text-gray-600">
                    Online ordering isn't available right now. Please <Link href="/contact" className="underline">contact us</Link> to order.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={!canPay}
                size="lg"
                className="w-full lg:hidden bg-slate-900 hover:bg-slate-800 text-white font-semibold h-12 rounded-xl disabled:opacity-60"
              >
                {processing ? "Processing..." : `Pay ₦${grandTotal.toLocaleString()}`}
              </Button>
            </form>

            <div className="lg:sticky lg:top-24">
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

                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{method === "pickup" ? "Pickup" : "Delivery"}</span>
                    <span>
                      {quote && quote.ok
                        ? quote.fee > 0 ? `₦${quote.fee.toLocaleString()}` : "Free"
                        : "Choose your state"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-gray-100">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-slate-900">₦{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={!canPay}
                  size="lg"
                  className="hidden lg:flex w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-12 rounded-xl disabled:opacity-60 items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {processing ? "Processing..." : `Pay ₦${grandTotal.toLocaleString()}`}
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
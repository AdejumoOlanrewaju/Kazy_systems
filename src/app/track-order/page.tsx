"use client"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Search, CheckCircle2, Truck, Clock, XCircle } from "lucide-react"
import { orderStatusLabel } from "@/lib/delivery"
import { useCustomerAuth } from "@/lib/useCustomerAuth"
import Link from "next/link"

type TrackedOrder = {
  id: string
  status: string
  total: number
  items: { id: string; name: string; quantity: number; price: number; configurationLabel?: string }[]
  itemsTotal: number | null
  delivery: { method: "pickup" | "delivery"; state?: string; fee: number; eta: string; label: string; pickupAddress?: string } | null
  shipping: { courier?: string; trackingNumber?: string; expectedDate?: string } | null
  customerName: string
  address: string
  createdAt: string | null
}

const STATUS_STEPS = ["paid", "shipped", "delivered"]

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: "Payment Pending", icon: Clock, color: "text-yellow-600" },
  paid: { label: "Order Confirmed", icon: CheckCircle2, color: "text-green-600" },
  shipped: { label: "Shipped", icon: Truck, color: "text-blue-600" },
  delivered: { label: "Delivered", icon: CheckCircle2, color: "text-purple-600" },
  failed: { label: "Payment Failed", icon: XCircle, color: "text-red-600" },
}

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [order, setOrder] = useState<TrackedOrder | null>(null)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setOrder(null)

    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong.")
        return
      }

      setOrder(data.order)
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const currentStepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1
  const { user } = useCustomerAuth()

  useEffect(() => {
    const fromLink = new URLSearchParams(window.location.search).get("orderId")
    if (fromLink) setOrderId(fromLink)
  }, [])

  useEffect(() => {
    if (user?.email) setEmail((e) => e || user.email!)
  }, [user])

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <Package className="w-12 h-12 mx-auto text-slate-900 mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Track Your Order</h1>
          <p className="text-gray-500">Enter your order ID and the email you used at checkout.</p>
        </div>

        {user && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 mb-6">
            You're signed in — all your orders, with delivery details, are in{" "}
            <Link href="/my-orders" className="font-semibold underline">My Orders</Link>.
          </div>
        )}

        <form onSubmit={handleTrack} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Order ID</label>
            <Input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="From your confirmation email" required className="h-11" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Email used at checkout</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required className="h-11" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-12 disabled:opacity-60">
            <Search className="w-4 h-4 mr-2" />
            {loading ? "Searching..." : "Track Order"}
          </Button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-8">
            {error}
          </div>
        )}

        {order && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Order</p>
                <p className="font-mono text-sm text-slate-900">{order.id}</p>
              </div>
              {(() => {
                const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                const Icon = config.icon
                return (
                  <div className={`flex items-center gap-1.5 text-sm font-semibold ${config.color}`}>
                    <Icon className="w-4 h-4" />
                    {orderStatusLabel(order.status, order.delivery?.method)}
                  </div>
                )
              })()}
            </div>

            {currentStepIndex >= 0 && (
              <div className="flex items-center">
                {STATUS_STEPS.map((step, i) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-3 h-3 rounded-full ${i <= currentStepIndex ? "bg-slate-900" : "bg-gray-200"}`} />
                      <span className={`text-xs capitalize ${i <= currentStepIndex ? "text-slate-900 font-medium" : "text-gray-400"}`}>
                        {orderStatusLabel(step, order.delivery?.method)}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 ${i < currentStepIndex ? "bg-slate-900" : "bg-gray-200"}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            <div className="border-t border-gray-100 pt-4 space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-700">
                  <div>
                    <span>{item.name} × {item.quantity}</span>
                    {item.configurationLabel && (
                      <p className="text-xs text-gray-400">{item.configurationLabel}</p>
                    )}
                  </div>
                  <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-1.5">
              {order.delivery && order.itemsTotal !== null && (
                <>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Items</span>
                    <span>₦{order.itemsTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      {order.delivery.method === "pickup"
                        ? "Pickup"
                        : `Delivery${order.delivery.state ? ` (${order.delivery.state})` : ""}`}
                    </span>
                    <span>{order.delivery.fee > 0 ? `₦${order.delivery.fee.toLocaleString()}` : "Free"}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-bold text-slate-900 pt-1">
                <span>Total</span>
                <span>₦{order.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-1.5">
              {order.delivery?.method === "pickup" ? (
                <>
                  <p className="font-semibold text-slate-900">Pickup from our shop</p>
                  {order.delivery?.pickupAddress && <p>{order.delivery.pickupAddress}</p>}
                  <p className="text-gray-500">{order.delivery?.eta}</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-900">Delivering to</p>
                  <p>{order.address}</p>
                  {order.delivery?.eta && <p className="text-gray-500">Estimated: {order.delivery.eta}</p>}
                </>
              )}
              {(order.shipping?.courier || order.shipping?.trackingNumber || order.shipping?.expectedDate) && (
                <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                  {order.shipping?.courier && (
                    <p>Courier: <span className="font-medium">{order.shipping.courier}</span></p>
                  )}
                  {order.shipping?.trackingNumber && (
                    <p>Tracking / waybill: <span className="font-mono font-medium">{order.shipping.trackingNumber}</span></p>
                  )}
                  {order.shipping?.expectedDate && (
                    <p>
                      Expected:{" "}
                      <span className="font-medium">
                        {new Date(order.shipping.expectedDate).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackOrderPage
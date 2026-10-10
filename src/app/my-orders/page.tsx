"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCustomerAuth } from "@/lib/useCustomerAuth"
import { getOrdersByEmail, Order } from "@/lib/orderService"
import { orderStatusLabel } from "@/lib/delivery"
import { buildProductUrl } from "@/lib/slug"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, Package, Store, Truck, XCircle } from "lucide-react"

type FullOrder = Order & {
  itemsTotal?: number
  delivery?: { method: "pickup" | "delivery"; fee: number; eta: string; state?: string; pickupAddress?: string }
  shipping?: { courier?: string; trackingNumber?: string; expectedDate?: string }
}

const STATUS_STYLE: Record<string, { icon: any; color: string }> = {
  pending: { icon: Clock, color: "text-yellow-600" },
  paid: { icon: CheckCircle2, color: "text-green-600" },
  shipped: { icon: Truck, color: "text-blue-600" },
  delivered: { icon: CheckCircle2, color: "text-purple-600" },
  failed: { icon: XCircle, color: "text-red-600" },
}

const TWO_HOURS = 2 * 60 * 60 * 1000

const MyOrdersPage = () => {
  const router = useRouter()
  const { user, loading: authLoading } = useCustomerAuth()
  const [orders, setOrders] = useState<FullOrder[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user?.email) {
      setLoadingOrders(false)
      return
    }
    const unsubscribe = getOrdersByEmail(user.email, (data) => {
      setOrders(data as FullOrder[])
      setLoadingOrders(false)
    })
    return () => unsubscribe()
  }, [user, authLoading])

  const createdMs = (o: FullOrder) => (o.createdAt?.seconds ? o.createdAt.seconds * 1000 : Date.now())

  // Abandoned checkouts stay "pending" forever, so only show a pending order
  // while a payment could still be confirming.
  const visible = orders.filter(
    (o) => o.status !== "failed" && (o.status !== "pending" || Date.now() - createdMs(o) < TWO_HOURS)
  )

  const formatDate = (o: FullOrder) =>
    o.createdAt?.seconds
      ? new Date(o.createdAt.seconds * 1000).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })
      : ""

  if (authLoading) return null

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 text-center">
        <div>
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign in to view your orders</h1>
          <p className="text-gray-500 mb-6">Your orders, delivery updates and reviews all live here.</p>
          <Button onClick={() => router.push("/sign-in?next=/my-orders")} className="bg-slate-900 hover:bg-slate-800 text-white">
            Sign In
          </Button>
          <p className="text-xs text-gray-400 mt-4">
            Ordered as a guest? <Link href="/track-order" className="underline">Track it with your order ID</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Orders</h1>

        {loadingOrders ? (
          <p className="text-gray-500">Loading your orders...</p>
        ) : visible.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <Package className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">No orders yet.</p>
            <Link href="/shop">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white">Browse Laptops</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map((order) => {
              const style = STATUS_STYLE[order.status] || STATUS_STYLE.pending
              const Icon = style.icon
              const method = order.delivery?.method
              const s = order.shipping
              const hasShipping = !!s && !!(s.courier || s.trackingNumber || s.expectedDate)

              return (
                <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">Order ID</p>
                      <p className="font-mono text-xs text-slate-900 break-all select-all">{order.id}</p>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(order)}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap ${style.color}`}>
                      <Icon className="w-4 h-4" />
                      {order.status === "pending" ? "Confirming payment" : orderStatusLabel(order.status, method)}
                    </div>
                  </div>

                  {order.delivery && (
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-1 mb-4">
                      <p className="flex items-center gap-2 font-semibold text-slate-900">
                        {method === "pickup" ? <Store className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                        {method === "pickup" ? "Pickup from our shop" : `Delivery to ${order.delivery.state}`}
                      </p>
                      {method === "pickup"
                        ? order.delivery.pickupAddress && <p>{order.delivery.pickupAddress}</p>
                        : <p>{order.address}</p>}
                      {order.delivery.eta && order.status !== "delivered" && (
                        <p className="text-gray-500">Estimated: {order.delivery.eta}</p>
                      )}
                      {hasShipping && (
                        <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                          {s?.courier && <p>Courier: <span className="font-medium">{s.courier}</span></p>}
                          {s?.trackingNumber && (
                            <p>Tracking / waybill: <span className="font-mono font-medium select-all">{s.trackingNumber}</span></p>
                          )}
                          {s?.expectedDate && (
                            <p>
                              Expected:{" "}
                              <span className="font-medium">
                                {new Date(s.expectedDate).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                              </span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between gap-3 text-sm text-gray-700">
                        <div>
                          <span>{item.name} × {item.quantity}</span>
                          {item.configurationLabel && <p className="text-xs text-gray-400">{item.configurationLabel}</p>}
                          {order.status === "delivered" && (
                            <Link
                              href={`${buildProductUrl(item.name, item.productId || String(item.id).split("_")[0])}#reviews`}
                              className="text-xs text-amber-600 underline"
                            >
                              Write a review
                            </Link>
                          )}
                        </div>
                        <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-3 space-y-1">
                    {order.delivery && order.itemsTotal !== undefined && (
                      <>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Items</span>
                          <span>₦{order.itemsTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{method === "pickup" ? "Pickup" : "Delivery"}</span>
                          <span>{order.delivery.fee > 0 ? `₦${order.delivery.fee.toLocaleString()}` : "Free"}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Total</span>
                      <span>₦{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyOrdersPage
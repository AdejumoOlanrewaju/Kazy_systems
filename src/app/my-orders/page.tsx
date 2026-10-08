"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCustomerAuth } from "@/lib/useCustomerAuth"
import { getOrdersByEmail, Order } from "@/lib/orderService"
import { Package, CheckCircle2, Truck, Clock, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: "Payment Pending", icon: Clock, color: "text-yellow-600" },
  paid: { label: "Order Confirmed", icon: CheckCircle2, color: "text-green-600" },
  shipped: { label: "Shipped", icon: Truck, color: "text-blue-600" },
  delivered: { label: "Delivered", icon: CheckCircle2, color: "text-purple-600" },
  failed: { label: "Payment Failed", icon: XCircle, color: "text-red-600" },
}

const MyOrdersPage = () => {
  const router = useRouter()
  const { user, loading: authLoading } = useCustomerAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user?.email) {
      setLoadingOrders(false)
      return
    }
    const unsubscribe = getOrdersByEmail(user.email, (data) => {
      setOrders(data)
      setLoadingOrders(false)
    })
    return () => unsubscribe()
  }, [user, authLoading])

  const formatDate = (order: Order) => {
    if (!order.createdAt?.seconds) return ""
    return new Date(order.createdAt.seconds * 1000).toLocaleDateString("en-NG", {
      year: "numeric", month: "long", day: "numeric",
    })
  }

  if (authLoading) return null

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 text-center">
        <div>
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign in to view your orders</h1>
          <p className="text-gray-500 mb-6">Your order history is tied to your account.</p>
          <Button onClick={() => router.push("/sign-in")} className="bg-slate-900 hover:bg-slate-800 text-white">
            Sign In
          </Button>
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
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <Package className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">No orders yet.</p>
            <Link href="/shop">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white">Browse Laptops</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              const Icon = config.icon
              return (
                <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-400 font-mono">{order.id}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{formatDate(order)}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 text-sm font-semibold ${config.color}`}>
                      <Icon className="w-4 h-4" />
                      {config.label}
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-gray-700">
                        <span>{item.name} × {item.quantity}</span>
                        {item.configurationLabel && (
                          <p className="text-xs text-gray-400">{item.configurationLabel}</p>
                        )}
                        <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-slate-900">
                    <span>Total</span>
                    <span>₦{order.total.toLocaleString()}</span>
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
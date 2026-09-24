"use client"
import React, { useEffect, useState } from "react"
import { getOrders, updateOrderStatus, Order, OrderStatus } from "@/lib/orderService"
import { Menu, Package, MapPin, Phone, Mail } from "lucide-react"
import { useSidebarStore } from "@/store/sidebarStore"

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-purple-100 text-purple-700",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | OrderStatus>("all")
  const { toggleSidebar } = useSidebarStore()

  useEffect(() => {
    const unsubscribe = getOrders((data) => {
      setOrders(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const filteredOrders = orders.filter((o) => filter === "all" || o.status === filter)

  const formatDate = (order: Order) => {
    if (!order.createdAt?.seconds) return "Just now"
    return new Date(order.createdAt.seconds * 1000).toLocaleString()
  }

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status)
  }

  const tabs = ["all", "pending", "paid", "shipped", "delivered", "failed"] as const
  const counts = Object.fromEntries(
    tabs.map((t) => [t, t === "all" ? orders.length : orders.filter((o) => o.status === t).length])
  ) as Record<(typeof tabs)[number], number>

  return (
    <main className="min-h-screen bg-gray-50 flex-1 overflow-y-auto">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-4 py-2.5 sm:px-6 sm:py-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleSidebar()}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-[18px] sm:text-2xl font-bold text-gray-900">Orders</h2>
          </div>
        </div>
      </header>
      <div className="px-3 sm:px-6 py-4">
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${filter === f
                ? "bg-amber-500 text-neutral-950"
                : "bg-white border border-gray-200 text-gray-600 hover:border-amber-300"
                }`}
            >
              {f}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f ? "bg-neutral-950/15" : "bg-gray-100 text-gray-500"
                  }`}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl py-16 text-center text-gray-400">
            No orders yet.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Package className="w-4 h-4 text-amber-600" />
                    </span>
                    <div>
                      <span className="font-bold text-gray-900 block">
                        ₦{order.total.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(order)}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm mb-4 text-gray-600">
                  <p><span className="font-semibold text-gray-900">Customer:</span> {order.customerName}</p>
                  <p className="flex items-center gap-1.5"><Mail size={13} className="text-gray-400" /> {order.email}</p>
                  <p className="flex items-center gap-1.5"><Phone size={13} className="text-gray-400" /> {order.phone}</p>
                  <p className="flex items-center gap-1.5"><MapPin size={13} className="text-gray-400" /> {order.address}</p>
                  {order.paystackRef && (
                    <p><span className="font-semibold text-gray-900">Ref:</span> {order.paystackRef}</p>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-3 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600 py-0.5">
                      <span className="text-gray-900">{item.name} × {item.quantity}</span>
                      <span className="text-gray-900 font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {order.status !== "pending" && order.status !== "failed" && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-500">Update status:</label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-900 focus:border-amber-400 focus:outline-none"
                    >
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
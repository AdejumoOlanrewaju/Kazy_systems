"use client"
import React, { useEffect, useState } from "react"
import { getOrders, updateOrderStatus, Order, OrderStatus } from "@/lib/orderService"
import { Package } from "lucide-react"

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-purple-100 text-purple-700",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | OrderStatus>("all")

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

  return (
    <main className="min-h-screen bg-gray-50 flex-1 overflow-y-auto p-6">
      <h1 className="text-2xl font-bold text-black mb-6">Orders</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "paid", "shipped", "delivered", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize ${
              filter === f ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-700" />
                  <span className="font-semibold text-slate-900">
                    ₦{order.total.toLocaleString()}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{formatDate(order)}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm mb-3">
                <p><span className="font-semibold">Customer:</span> {order.customerName}</p>
                <p><span className="font-semibold">Email:</span> {order.email}</p>
                <p><span className="font-semibold">Phone:</span> {order.phone}</p>
                <p><span className="font-semibold">Address:</span> {order.address}</p>
                {order.paystackRef && (
                  <p><span className="font-semibold">Ref:</span> {order.paystackRef}</p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3 mb-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {order.status !== "pending" && order.status !== "failed" && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-gray-500">Update status:</label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1"
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
    </main>
  )
}
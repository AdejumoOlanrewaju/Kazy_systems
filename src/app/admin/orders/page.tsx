"use client"
import React, { useEffect, useState } from "react"
import { getOrders, updateOrderStatus, updateOrderShipping, Order, OrderStatus } from "@/lib/orderService"
import { orderStatusLabel } from "@/lib/delivery"
import RecoverPayment from "@/app/components/RecoverPayment"
import { MessageCircle, Package, Store, Truck } from "lucide-react"
import { toast } from "sonner"
import { buildProductUrl } from "@/lib/slug"
const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-purple-100 text-purple-700",
}

// 0803 123 4567 / +234 803 123 4567 -> 2348031234567 (what wa.me expects)
const toWhatsAppNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("234")) return digits
  if (digits.startsWith("0")) return `234${digits.slice(1)}`
  return digits
}

const ShippingPanel = ({ order }: { order: Order }) => {
  const isPickup = order.delivery?.method === "pickup"
  const [courier, setCourier] = useState(order.shipping?.courier || "")
  const [trackingNumber, setTrackingNumber] = useState(order.shipping?.trackingNumber || "")
  const [expectedDate, setExpectedDate] = useState(order.shipping?.expectedDate || "")
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await updateOrderShipping(order.id, {
        courier: courier.trim(),
        trackingNumber: trackingNumber.trim(),
        expectedDate,
      })
      toast.success("Shipping details saved")
    } catch {
      toast.error("Couldn't save shipping details")
    } finally {
      setSaving(false)
    }
  }

  const buildMessage = () => {
    if (order.status === "delivered") {
      const firstItem = order.items[0]
      const link = firstItem
        ? `${window.location.origin}${buildProductUrl(firstItem.name, firstItem.productId)}#reviews`
        : window.location.origin
      return `Hi ${order.customerName.split(" ")[0]}, thank you for shopping with Kayzee Global! We hope you're enjoying your order. If you have a minute, a quick review helps other buyers: ${link}`
    }
    const first = order.customerName.split(" ")[0]
    const track = `Track your order any time: ${window.location.origin}/track-order (Order ID: ${order.id})`
    if (order.status === "paid") {
      return `Hi ${first}, we've received your payment and we're preparing your order. ${track}`
    }
    if (isPickup) {
      const where = order.delivery?.pickupAddress ? ` at ${order.delivery.pickupAddress}` : ""
      return `Hi ${first}, good news — your order is ready for pickup${where}. Please bring your order ID: ${order.id}. Thank you for shopping with Kayzee Global!`
    }
    const date = expectedDate
      ? new Date(expectedDate).toLocaleDateString("en-NG", { dateStyle: "medium" })
      : ""
    return `Hi ${first}, your order has been shipped${courier ? ` via ${courier}` : ""}.${trackingNumber ? ` Tracking/waybill: ${trackingNumber}.` : ""
      }${date ? ` Expected delivery: ${date}.` : ""} ${track}`
  }

  const messageCustomer = () =>
    window.open(
      `https://wa.me/${toWhatsAppNumber(order.phone)}?text=${encodeURIComponent(buildMessage())}`,
      "_blank",
      "noopener,noreferrer"
    )

  return (
    <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
      {!isPickup && (
        <>
          <p className="text-xs font-semibold text-gray-500">Shipping details (shown to the customer)</p>
          <div className="grid sm:grid-cols-3 gap-2">
            <input
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              placeholder="Courier / rider"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2"
            />
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Tracking / waybill no."
              className="text-sm border border-gray-200 rounded-lg px-3 py-2"
            />
            <input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>
        </>
      )}
      <div className="flex gap-2 flex-wrap">
        {!isPickup && (
          <button
            onClick={save}
            disabled={saving}
            className="text-sm font-semibold bg-slate-900 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save shipping details"}
          </button>
        )}
        <button
          onClick={messageCustomer}
          className="flex items-center gap-1.5 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          <MessageCircle size={15} /> Message customer
        </button>
      </div>
    </div>
  )
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
    try {
      await updateOrderStatus(orderId, status)
    } catch {
      toast.error("Couldn't update the status")
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex-1 overflow-y-auto p-6">
      <h1 className="text-2xl font-bold text-black mb-6">Orders</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "paid", "shipped", "delivered", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize ${filter === f ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-700"
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
          {filteredOrders.map((order) => {
            const method = order.delivery?.method
            const canShip = order.status !== "pending" && order.status !== "failed"

            return (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-700" />
                    <span className="font-semibold text-slate-900">₦{order.total.toLocaleString()}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                      {orderStatusLabel(order.status, method)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(order)}</span>
                </div>

                {order.delivery && (
                  <div className="flex items-center gap-2 text-sm mb-3 bg-gray-50 rounded-lg px-3 py-2 text-gray-700">
                    {method === "pickup" ? <Store size={15} /> : <Truck size={15} />}
                    <span className="font-medium">
                      {method === "pickup" ? "Pickup from shop" : `Delivery to ${order.delivery.state}`}
                    </span>
                    <span className="text-gray-500">
                      · {order.delivery.fee > 0 ? `₦${order.delivery.fee.toLocaleString()}` : "no fee"}
                      {order.delivery.eta ? ` · ${order.delivery.eta}` : ""}
                    </span>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm mb-3">
                  <p><span className="font-semibold">Customer:</span> {order.customerName}</p>
                  <p><span className="font-semibold">Email:</span> {order.email}</p>
                  <p><span className="font-semibold">Phone:</span> {order.phone}</p>
                  <p><span className="font-semibold">Address:</span> {order.address}</p>
                  {order.paystackRef && (
                    <p><span className="font-semibold">Ref:</span> {order.paystackRef}</p>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-3 mb-3 space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600">
                      <div>
                        <span>{item.name} × {item.quantity}</span>
                        {item.configurationLabel && (
                          <p className="text-xs text-gray-400">{item.configurationLabel}</p>
                        )}
                      </div>
                      <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  {order.delivery && (
                    <div className="flex justify-between text-sm text-gray-500 pt-1">
                      <span>{method === "pickup" ? "Pickup" : "Delivery"}</span>
                      <span>{order.delivery.fee > 0 ? `₦${order.delivery.fee.toLocaleString()}` : "Free"}</span>
                    </div>
                  )}
                </div>

                {canShip && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-500">Update status:</label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                    >
                      <option value="paid">{orderStatusLabel("paid", method)}</option>
                      <option value="shipped">{orderStatusLabel("shipped", method)}</option>
                      <option value="delivered">{orderStatusLabel("delivered", method)}</option>
                    </select>
                  </div>
                )}

                {canShip && <ShippingPanel order={order} />}

                {order.status === "pending" && <RecoverPayment orderId={order.id} />}

                {order.stockShortage && order.stockShortage.length > 0 && (
                  <p className="mt-3 text-xs font-semibold text-red-600 bg-red-50 rounded-lg px-3 py-2">
                    Paid, but stock was short for: {order.stockShortage.join(", ")}. Contact the customer or refund via Paystack.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
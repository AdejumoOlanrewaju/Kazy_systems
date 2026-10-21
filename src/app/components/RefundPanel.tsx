"use client"
import React, { useState } from "react"
import { toast } from "sonner"
import { auth } from "@/lib/firebase"
import { ApiError, postJson } from "@/lib/apiClient"
import { Order } from "@/lib/orderService"

const RefundPanel = ({ order }: { order: Order }) => {
  const remaining = order.total - (order.refundedTotal || 0)
  const canRefund = ["paid", "shipped", "delivered"].includes(order.status) && remaining > 0

  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState(order.stockShortage?.length ? "Item out of stock" : "")
  const [loading, setLoading] = useState(false)

  const handleRefund = async () => {
    const naira = amount ? Number(amount) : remaining
    if (!reason.trim()) {
      toast.error("Please enter a reason.")
      return
    }
    if (!window.confirm(`Refund ₦${naira.toLocaleString()} to this customer through Paystack?`)) return

    setLoading(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      await postJson(
        "/api/admin/refund-order",
        { orderId: order.id, amount: amount ? Number(amount) : undefined, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success("Refund started. Paystack will process it.")
      setAmount("")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Refund failed")
    } finally {
      setLoading(false)
    }
  }

  if (!canRefund && !order.refunds?.length) return null

  return (
    <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
      {order.refunds && order.refunds.length > 0 && (
        <div className="text-sm text-gray-600 space-y-1">
          <p className="text-xs font-semibold text-gray-500">Refunds</p>
          {order.refunds.map((r, i) => (
            <p key={i}>
              ₦{r.amount.toLocaleString()} — {r.reason}{" "}
              <span className="text-gray-400">({new Date(r.at).toLocaleDateString("en-NG")}, {r.status})</span>
            </p>
          ))}
        </div>
      )}

      {canRefund && (
        <>
          <p className="text-xs font-semibold text-gray-500">
            Refund this customer (up to ₦{remaining.toLocaleString()})
          </p>
          <div className="grid sm:grid-cols-[140px_1fr_auto] gap-2">
            <input
              type="number"
              min="1"
              max={remaining}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Full (₦${remaining.toLocaleString()})`}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2"
            />
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (required)"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2"
            />
            <button
              onClick={handleRefund}
              disabled={loading}
              className="text-sm font-semibold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? "Refunding..." : "Refund"}
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Leave the amount empty to refund everything. Refunds don't change stock, so adjust it in Products if the laptop is back with you.
          </p>
        </>
      )}
    </div>
  )
}

export default RefundPanel
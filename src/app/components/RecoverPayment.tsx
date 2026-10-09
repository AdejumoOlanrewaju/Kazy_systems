"use client"
import React, { useState } from "react"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"

// For orders stuck on "pending" whose customer actually paid. Paste the
// transaction reference from the Paystack dashboard; the server verifies it
// with Paystack and checks amount + email before marking the order paid.
const RecoverPayment = ({ orderId }: { orderId: string }) => {
  const [reference, setReference] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRecover = async () => {
    if (!reference.trim()) return
    setLoading(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch("/api/admin/recover-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId, reference }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Could not verify this payment")
      } else {
        toast.success("Payment verified — order marked paid and stock updated")
        setReference("")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <p className="text-xs text-gray-500 mb-2">
        Customer paid but this is still pending? Paste the Paystack reference to verify and complete it.
      </p>
      <div className="flex gap-2">
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Paystack reference"
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5"
        />
        <button
          onClick={handleRecover}
          disabled={loading || !reference.trim()}
          className="text-sm font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  )
}

export default RecoverPayment
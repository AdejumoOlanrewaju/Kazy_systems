"use client"
import { useState } from "react"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"

const RequestCancel = ({ orderId, email }: { orderId: string; email?: string }) => {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch("/api/orders/request-cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ orderId, email, reason }),
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error || "Couldn't send the request")
      setSent(true)
      toast.success("Request sent. We'll contact you shortly.")
    } catch {
      toast.error("Network problem. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (sent) return <p className="text-sm text-amber-700">Cancellation requested. We'll be in touch.</p>
  if (!open) return <button onClick={() => setOpen(true)} className="text-sm underline text-gray-600">Request cancellation</button>

  return (
    <div className="space-y-2">
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why do you want to cancel?"
        className="w-full text-sm border border-gray-200 rounded-lg p-2" rows={2} />
      <button onClick={submit} disabled={loading || reason.trim().length < 5}
        className="text-sm font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg disabled:opacity-50">
        {loading ? "Sending..." : "Send request"}
      </button>
    </div>
  )
}
export default RequestCancel
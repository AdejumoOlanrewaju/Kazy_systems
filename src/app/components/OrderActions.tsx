// "use client"
// import { useState } from "react"
// import { auth } from "@/lib/firebase"
// import { toast } from "sonner"
// import type { Order } from "@/lib/orderService"

// const call = async (path: string, payload: object) => {
//   const token = await auth.currentUser?.getIdToken()
//   const res = await fetch(path, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//     body: JSON.stringify(payload),
//   })
//   const data = await res.json().catch(() => ({}))
//   if (!res.ok) throw new Error(data.error || "Request failed")
//   return data
// }

// const OrderActions = ({ order }: { order: Order }) => {
//   const [open, setOpen] = useState(false)
//   const [reason, setReason] = useState(order.cancelRequest?.reason ?? "")
//   const [restock, setRestock] = useState(order.status !== "delivered")
//   const [loading, setLoading] = useState(false)

//   const unpaid = order.status === "pending" || order.status === "failed"
//   const refundable = ["paid", "shipped", "delivered"].includes(order.status) && !order.refund?.state

//   const run = async (fn: () => Promise<any>, ok: string) => {
//     setLoading(true)
//     try { await fn(); toast.success(ok); setOpen(false) }
//     catch (e: any) { toast.error(e.message || "Something went wrong") }
//     finally { setLoading(false) }
//   }

//   const cancelUnpaid = () => {
//     if (!confirm("Cancel this unpaid order?")) return
//     run(() => call("/api/admin/cancel-order", { orderId: order.id, reason }), "Order cancelled")
//   }

//   const refund = () => {
//     if (!reason.trim()) return toast.error("Add a reason first")
//     if (!confirm(`Refund ₦${order.total.toLocaleString()} to ${order.email}? This can't be undone.`)) return
//     run(() => call("/api/admin/refund-order", { orderId: order.id, reason, restock }), "Refund sent to Paystack")
//   }

//   return (
//     <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
//       {order.cancelRequest && order.status === "paid" && (
//         <p className="text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
//           Customer asked to cancel: "{order.cancelRequest.reason}"
//         </p>
//       )}
//       {order.refund?.state === "processing" && (
//         <p className="text-xs text-gray-600">Refund processing. If this stays stuck, check the Paystack dashboard.</p>
//       )}
//       {order.status === "refunded" && (
//         <p className="text-xs text-orange-700">
//           Refunded ₦{(order.refund?.amount ?? order.total).toLocaleString()}
//           {order.refund?.restocked ? " · stock restored" : " · stock NOT restored"}
//         </p>
//       )}

//       {unpaid && (
//         <button onClick={cancelUnpaid} disabled={loading}
//           className="text-sm font-semibold border border-gray-300 px-3 py-1.5 rounded-lg disabled:opacity-50">
//           Cancel order
//         </button>
//       )}

//       {refundable && !open && (
//         <button onClick={() => setOpen(true)} className="text-sm font-semibold text-red-600 underline">
//           Cancel & refund
//         </button>
//       )}

//       {refundable && open && (
//         <div className="space-y-2">
//           <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required)"
//             className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
//           <label className="flex items-center gap-2 text-xs text-gray-600">
//             <input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} />
//             Put the laptop(s) back in stock (untick if returned damaged or not yet inspected)
//           </label>
//           <div className="flex gap-2">
//             <button onClick={refund} disabled={loading}
//               className="text-sm font-semibold bg-red-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-50">
//               {loading ? "Refunding..." : `Refund ₦${order.total.toLocaleString()}`}
//             </button>
//             <button onClick={() => setOpen(false)} className="text-sm text-gray-500">Close</button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
// export default OrderActions
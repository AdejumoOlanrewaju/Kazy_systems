"use client"
import React, { useEffect, useMemo, useState } from "react"
import { Menu, Star, BadgeCheck } from "lucide-react"
import { toast } from "sonner"
import { auth } from "@/lib/firebase"
import { getAllReviews, Review, ReviewStatus } from "@/lib/reviewService"
import { useSidebarStore } from "@/store/sidebarStore"

type Filter = ReviewStatus | "all"

const STATUS_STYLE: Record<ReviewStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
}

export default function ReviewsAdminPage() {
  const { toggleSidebar } = useSidebarStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>("pending")
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = getAllReviews((data) => {
      setReviews(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const counts = useMemo(
    () => ({
      pending: reviews.filter((r) => r.status === "pending").length,
      approved: reviews.filter((r) => r.status === "approved").length,
      rejected: reviews.filter((r) => r.status === "rejected").length,
      all: reviews.length,
    }),
    [reviews]
  )

  const visible = filter === "all" ? reviews : reviews.filter((r) => r.status === filter)

  const callApi = async (action: string, reviewId?: string) => {
    setBusy(reviewId || action)
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, reviewId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Action failed")
      return data
    } finally {
      setBusy(null)
    }
  }

  const moderate = async (review: Review, action: "approve" | "reject" | "delete") => {
    if (action === "delete" && !window.confirm("Delete this review permanently?")) return
    try {
      await callApi(action, review.id)
      toast.success(action === "approve" ? "Review approved" : action === "reject" ? "Review rejected" : "Review deleted")
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const recalculateAll = async () => {
    if (!window.confirm("Recalculate every product's rating from approved reviews? Any hand-typed ratings from before will be reset to 0.")) return
    try {
      const data = await callApi("recalculateAll")
      toast.success(`Recalculated ${data.products} products`)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const formatDate = (r: Review) =>
    r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleString() : "Just now"

  return (
    <main className="min-h-screen bg-gray-50 flex-1 overflow-y-auto">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-4 py-2.5 sm:px-6 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleSidebar()}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-[18px] sm:text-2xl font-bold text-gray-900">Reviews</h2>
          </div>
          <button
            onClick={recalculateAll}
            disabled={busy === "recalculateAll"}
            className="text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl disabled:opacity-50"
          >
            {busy === "recalculateAll" ? "Working..." : "Recalculate ratings"}
          </button>
        </div>
      </header>

      <div className="px-3 sm:px-6 py-6">
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["pending", "approved", "rejected", "all"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize ${
                filter === f ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-700"
              }`}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading reviews...</p>
        ) : visible.length === 0 ? (
          <p className="text-gray-500">
            {filter === "pending" ? "Nothing waiting for approval." : "No reviews here yet."}
          </p>
        ) : (
          <div className="space-y-4">
            {visible.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{r.productName}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-4 h-4 ${n <= r.rating ? "fill-amber-500 text-amber-500" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_STYLE[r.status]}`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(r)}</span>
                  </div>
                </div>

                {r.title && <p className="font-semibold text-gray-900 mb-1">{r.title}</p>}
                <p className="text-sm text-gray-700 whitespace-pre-line">{r.comment}</p>

                <div className="mt-3 text-xs text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <BadgeCheck className="w-3.5 h-3.5" /> Verified purchase
                  </span>
                  <span>By {r.authorName}</span>
                  <span>{r.email}</span>
                  <span className="font-mono">Order {r.orderId}</span>
                </div>

                <div className="flex gap-2 mt-4">
                  {r.status !== "approved" && (
                    <button
                      onClick={() => moderate(r, "approve")}
                      disabled={busy === r.id}
                      className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button
                      onClick={() => moderate(r, "reject")}
                      disabled={busy === r.id}
                      className="text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => moderate(r, "delete")}
                    disabled={busy === r.id}
                    className="text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
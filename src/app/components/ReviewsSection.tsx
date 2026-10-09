"use client"
import React, { useCallback, useEffect, useState } from "react"
import { BadgeCheck, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useCustomerAuth } from "@/lib/useCustomerAuth"

type PublicReview = {
  id: string
  authorName: string
  rating: number
  title?: string
  comment: string
  createdAt: string | null
}
type Summary = { average: number; count: number; distribution: number[] } // index 0 = 5 stars

const Stars = ({ value, className = "w-4 h-4" }: { value: number; className?: string }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`${className} ${n <= Math.round(value) ? "fill-amber-500 text-amber-500" : "text-gray-300"}`}
      />
    ))}
  </div>
)

const ReviewsSection = ({ productId }: { productId: string }) => {
  const { user } = useCustomerAuth()
  const [reviews, setReviews] = useState<PublicReview[]>([])
  const [summary, setSummary] = useState<Summary>({ average: 0, count: 0, distribution: [0, 0, 0, 0, 0] })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [form, setForm] = useState({ orderId: "", email: "", rating: 0, title: "", comment: "" })

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)
      const data = await res.json()
      setReviews(data.reviews || [])
      if (data.summary) setSummary(data.summary)
    } catch (err) {
      console.error("Could not load reviews", err)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    load()
  }, [load])

  // Coming from "My Orders" (?order=ID) opens the form with the order filled in.
  useEffect(() => {
    const orderFromLink = new URLSearchParams(window.location.search).get("order")
    if (orderFromLink) {
      setForm((f) => ({ ...f, orderId: orderFromLink }))
      setShowForm(true)
    }
  }, [])

  // Signed-in customers get their email filled in.
  useEffect(() => {
    if (user?.email) setForm((f) => (f.email ? f : { ...f, email: user.email! }))
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.rating < 1) {
      toast.error("Please choose a star rating.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...form }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Couldn't submit your review.")
        return
      }
      setSubmitted(true)
      setShowForm(false)
    } catch {
      toast.error("Network problem. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" }) : ""

  const shownRating = hoverRating || form.rating

  return (
    <section id="reviews" className="mt-16 pt-10 border-t border-gray-200">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Customer reviews</h2>
          {summary.count > 0 ? (
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-slate-900">{summary.average}</span>
              <div>
                <Stars value={summary.average} className="w-5 h-5" />
                <p className="text-sm text-gray-500 mt-1">
                  Based on {summary.count} verified {summary.count === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet — be the first after you've received your order.</p>
          )}
        </div>

        {!showForm && !submitted && (
          <Button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-slate-800 text-white">
            Write a review
          </Button>
        )}
      </div>

      {summary.count > 0 && (
        <div className="max-w-sm space-y-1.5 mb-8">
          {[5, 4, 3, 2, 1].map((star) => {
            const n = summary.distribution[5 - star]
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-8 text-gray-600">{star}★</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(n / summary.count) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-gray-400">{n}</span>
              </div>
            )
          })}
        </div>
      )}

      {submitted && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-sm mb-8">
          Thank you! Your review has been received and will appear here once it's approved.
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4 mb-10 max-w-2xl">
          <div>
            <h3 className="font-bold text-slate-900">Write your review</h3>
            <p className="text-sm text-gray-500 mt-1">
              To keep reviews honest, we check your order. Use the order ID from your confirmation page or{" "}
              <a href="/my-orders" className="underline">My Orders</a>, and the email you used at checkout. Orders can be
              reviewed once delivered.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Order ID *</label>
              <Input
                value={form.orderId}
                onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                required
                className="h-11 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Checkout email *</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="h-11 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Your rating *</label>
            <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHoverRating(n)}
                  onClick={() => setForm({ ...form, rating: n })}
                  className="p-0.5"
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      n <= shownRating ? "fill-amber-500 text-amber-500" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Title (optional)</label>
            <Input
              value={form.title}
              maxLength={80}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Sum it up in a few words"
              className="h-11 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Your review *</label>
            <Textarea
              value={form.comment}
              maxLength={1000}
              rows={4}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="How is the laptop? Battery, screen, speed, condition..."
              required
              className="bg-white"
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting} className="bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-60">
              {submitting ? "Submitting..." : "Submit review"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading reviews...</p>
      ) : (
        <div className="space-y-6 max-w-3xl">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-gray-100 pb-6">
              <div className="flex items-center gap-3 mb-2">
                <Stars value={r.rating} />
                {r.title && <span className="font-semibold text-slate-900">{r.title}</span>}
              </div>
              <p className="text-gray-700 whitespace-pre-line">{r.comment}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                <span className="font-medium text-gray-600">{r.authorName}</span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <BadgeCheck className="w-3.5 h-3.5" /> Verified purchase
                </span>
                <span>{formatDate(r.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default ReviewsSection
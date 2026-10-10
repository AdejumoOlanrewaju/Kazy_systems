"use client"
import React, { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BadgeCheck, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useCustomerAuth } from "@/lib/useCustomerAuth"
import { ApiError, getJson, postJson } from "@/lib/apiClient"

type PublicReview = {
  id: string
  authorName: string
  rating: number
  title?: string
  comment: string
  createdAt: string | null
}
type Summary = { average: number; count: number; distribution: number[] } // index 0 = 5 stars
type Eligibility = { state: "can_review" | "already_reviewed" | "awaiting_delivery" | "no_order"; orderId?: string }

const EMPTY_SUMMARY: Summary = { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] }

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
  const pathname = usePathname()
  const { user, loading: authLoading } = useCustomerAuth()

  const [reviews, setReviews] = useState<PublicReview[]>([])
  const [summary, setSummary] = useState<Summary>(EMPTY_SUMMARY)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [eligibility, setEligibility] = useState<Eligibility | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [manualMode, setManualMode] = useState(false) // review using an order ID instead
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [form, setForm] = useState({ orderId: "", email: "", rating: 0, title: "", comment: "" })

  const load = useCallback(async () => {
    setLoadError("")
    try {
      const data = await getJson<{ reviews: PublicReview[]; summary: Summary }>(
        `/api/reviews?productId=${encodeURIComponent(productId)}`
      )
      setReviews(data.reviews || [])
      if (data.summary) setSummary(data.summary)
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Couldn't load reviews.")
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    load()
  }, [load])

  // Coming from a link with ?order=ID opens the form with the order filled in.
  useEffect(() => {
    const orderFromLink = new URLSearchParams(window.location.search).get("order")
    if (orderFromLink) {
      setForm((f) => ({ ...f, orderId: orderFromLink }))
      setShowForm(true)
    }
  }, [])

  // Signed-in customers: ask the server whether they can review this product.
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setEligibility(null)
      return
    }
    let active = true
    user
      .getIdToken()
      .then((token) =>
        getJson<Eligibility>(`/api/reviews/eligible?productId=${encodeURIComponent(productId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then((e) => active && setEligibility(e))
      .catch(() => active && setEligibility(null))
    return () => {
      active = false
    }
  }, [user, authLoading, productId, submitted])

  useEffect(() => {
    if (user?.email) setForm((f) => (f.email ? f : { ...f, email: user.email! }))
  }, [user])

  const state = eligibility?.state
  const oneTap = !!user && state === "can_review" && !manualMode
  const guestFormOpen = showForm && !oneTap

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.rating < 1) {
      toast.error("Please choose a star rating.")
      return
    }
    setSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        productId,
        rating: form.rating,
        title: form.title,
        comment: form.comment,
      }
      const headers: Record<string, string> = {}
      if (oneTap && user) {
        headers.Authorization = `Bearer ${await user.getIdToken()}`
      } else {
        body.orderId = form.orderId
        body.email = form.email
      }
      await postJson("/api/reviews/submit", body, { headers })
      setSubmitted(true)
      setShowForm(false)
      setForm((f) => ({ ...f, rating: 0, title: "", comment: "" }))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't submit your review.")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" }) : ""

  const shownRating = hoverRating || form.rating

  const RatingInput = (
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
            <Star className={`w-8 h-8 transition-colors ${n <= shownRating ? "fill-amber-500 text-amber-500" : "text-gray-300"}`} />
          </button>
        ))}
      </div>
    </div>
  )

  const TextInputs = (
    <>
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
    </>
  )

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
            !loadError &&
            !loading && <p className="text-gray-500">No reviews yet.</p>
          )}
        </div>

        {/* Call to action, depending on who is looking */}
        {!submitted && !showForm && (
          <div className="text-right max-w-xs">
            {user && state === "already_reviewed" && (
              <p className="text-sm text-gray-500">You've reviewed this laptop. Thank you!</p>
            )}
            {user && state === "awaiting_delivery" && (
              <p className="text-sm text-gray-500">You can review this laptop once your order has been delivered.</p>
            )}
            {user && state === "no_order" && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Only customers who bought this laptop can review it.</p>
                <button
                  onClick={() => {
                    setManualMode(true)
                    setShowForm(true)
                  }}
                  className="text-sm underline text-gray-600"
                >
                  Bought as a guest? Use your order ID
                </button>
              </div>
            )}
            {(!user || state === "can_review" || state === undefined) && (
              <div className="space-y-2">
                <Button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-slate-800 text-white">
                  Write a review
                </Button>
                {!user && !authLoading && (
                  <p className="text-xs text-gray-400">
                    <Link href={`/sign-in?next=${encodeURIComponent(pathname)}`} className="underline">
                      Sign in
                    </Link>{" "}
                    to review in one tap
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6 flex items-center justify-between gap-3">
          <span>{loadError}</span>
          <Button size="sm" variant="outline" onClick={load}>Try again</Button>
        </div>
      )}

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

      {/* One-tap form for signed-in verified buyers */}
      {showForm && oneTap && (
        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4 mb-10 max-w-2xl">
          <div>
            <h3 className="font-bold text-slate-900">Write your review</h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <BadgeCheck className="w-4 h-4 text-emerald-600" /> We've matched this to your delivered order.
            </p>
          </div>
          {RatingInput}
          {TextInputs}
          <div className="flex gap-3">
            <Button type="submit" disabled={submitting} className="bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-60">
              {submitting ? "Submitting..." : "Submit review"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Order ID form for guests */}
      {guestFormOpen && (
        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4 mb-10 max-w-2xl">
          <div>
            <h3 className="font-bold text-slate-900">Write your review</h3>
            <p className="text-sm text-gray-500 mt-1">
              To keep reviews honest, we check your order. Use the order ID from your confirmation page and the email you
              used at checkout. Orders can be reviewed once delivered.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Order ID *</label>
              <Input value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} required className="h-11 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Checkout email *</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="h-11 bg-white" />
            </div>
          </div>
          {RatingInput}
          {TextInputs}
          <div className="flex gap-3">
            <Button type="submit" disabled={submitting} className="bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-60">
              {submitting ? "Submitting..." : "Submit review"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
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
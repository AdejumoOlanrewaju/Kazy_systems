"use client"
import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { useCustomerAuth } from "@/lib/useCustomerAuth"

const ConfirmationContent = () => {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const { user, loading } = useCustomerAuth()

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
      <p className="text-gray-600 mb-6">
        Thank you for your purchase. We'll reach out with delivery or pickup details shortly.
      </p>

      {orderId && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-amber-700 font-semibold mb-1">Your Order ID</p>
          <p className="font-mono text-sm text-slate-900 break-all select-all">{orderId}</p>
          <p className="text-xs text-amber-700 mt-2">Save it — you'll need it to track a guest order.</p>
        </div>
      )}

      {!loading && user && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-sm text-emerald-900">
          This order is saved in your account. You'll see delivery updates and can review it once it arrives.
        </div>
      )}

      {!loading && !user && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 text-left">
          <p className="font-semibold text-slate-900 mb-1">Keep track of this order</p>
          <p className="text-sm text-gray-600 mb-3">
            Sign in with the email you just used to see this order, follow delivery, review your laptop in one tap and
            check out faster next time. It's free and takes seconds.
          </p>
          <Link href="/sign-in?next=/my-orders">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">Sign in to see my orders</Button>
          </Link>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {user ? (
          <Link href="/my-orders"><Button variant="outline">View My Orders</Button></Link>
        ) : (
          <Link href={orderId ? `/trackOrder?orderId=${orderId}` : "/trackOrder"}>
            <Button variant="outline">Track this order</Button>
          </Link>
        )}
        <Link href="/shop"><Button className="bg-slate-900 hover:bg-slate-800 text-white">Continue Shopping</Button></Link>
      </div>
    </div>
  )
}

const OrderConfirmationPage = () => (
  <Suspense fallback={null}>
    <ConfirmationContent />
  </Suspense>
)

export default OrderConfirmationPage
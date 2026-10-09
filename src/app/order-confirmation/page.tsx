"use client"
import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

const ConfirmationContent = () => {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
      <p className="text-gray-600 mb-2">
        Thank you for your purchase. We'll reach out with delivery details shortly.
      </p>
      {orderId && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-amber-700 font-semibold mb-1">⚠️ Save this Order ID — you'll need it to track your order</p>
          <p className="font-mono text-sm text-slate-900 select-all">{orderId}</p>
          <Link href="/track-order" className="text-xs text-amber-700 underline mt-2 inline-block">
            Track your order status anytime
          </Link>
        </div>
      )}
      <Link href="/shop">
        <Button className="bg-slate-900 hover:bg-slate-800 text-white">Continue Shopping</Button>
      </Link>
    </div>
  )
}

const OrderConfirmationPage = () => (
  <Suspense fallback={null}>
    <ConfirmationContent />
  </Suspense>
)

export default OrderConfirmationPage
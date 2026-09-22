"use client"
import React from "react"
import Link from "next/link"
import { useCartStore } from "@/store/cartStore"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react"

const CartPage = () => {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
            <ShoppingBag className="w-9 h-9 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Browse our laptops and add something you like.</p>
          <Link href="/shop">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8">
              Browse Laptops
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/shop" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-slate-900 transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">
              Your Cart
              <span className="text-gray-400 font-medium text-xl ml-2">
                ({totalItems()} {totalItems() === 1 ? "item" : "items"})
              </span>
            </h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl bg-gray-100 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{item.name}</h3>
                        <p className="text-sm text-gray-400 mt-0.5">{item.stockQuantity} available</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-gray-50 rounded-l-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stockQuantity}
                          className="p-2 hover:bg-gray-50 rounded-r-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400">₦{item.price.toLocaleString()} each</p>
                        )}
                        <p className="font-bold text-slate-900">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
              <h2 className="font-bold text-slate-900 text-lg">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₦{totalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="text-green-600 font-medium">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-2xl font-bold text-slate-900">₦{totalPrice().toLocaleString()}</span>
              </div>

              <Link href="/checkout">
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-12 rounded-xl">
                  Proceed to Checkout
                </Button>
              </Link>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>Secure checkout powered by Paystack</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-500">
                  <Truck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>Nationwide delivery across Nigeria</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
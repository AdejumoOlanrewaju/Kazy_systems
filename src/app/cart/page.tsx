"use client"
import React from "react"
import Link from "next/link"
import { useCartStore } from "@/store/cartStore"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Trash2 } from "lucide-react"

const CartPage = () => {
  const { items, removeItem, totalPrice } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-600 mb-6">Browse our laptops and add something you like.</p>
        <Link href="/shop">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">Go to Shop</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Your Cart</h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-lg bg-gray-100"
            />

            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{item.name}</h3>
              <p className="text-slate-900 font-bold">₦{item.price.toLocaleString()}</p>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              title="Remove"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <div className="w-full sm:w-80 bg-gray-50 rounded-xl p-6 space-y-4">
          <div className="flex justify-between text-lg font-bold text-slate-900">
            <span>Total</span>
            <span>₦{totalPrice().toLocaleString()}</span>
          </div>
          <Link href="/checkout">
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-12">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CartPage
"use client"
import { useEffect, useRef } from "react"
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useCustomerAuth } from "@/lib/useCustomerAuth"
import { CartItem, useCartStore } from "@/store/cartStore"

// Carts are compared by what the customer chose (line + quantity). Firestore can
// return fields in a different order, so comparing raw JSON would never match.
const signature = (items: CartItem[]) =>
  items.map((i) => `${i.id}:${i.quantity}`).sort().join("|")

// Firestore rejects `undefined` values, and simple products have no configuration fields.
const clean = (items: CartItem[]): CartItem[] => JSON.parse(JSON.stringify(items))

// Same laptop in both carts: keep the larger quantity, never above stock.
const mergeCarts = (remote: CartItem[], local: CartItem[]): CartItem[] => {
  const merged = new Map<string, CartItem>()
  remote.forEach((i) => merged.set(i.id, i))
  local.forEach((i) => {
    const existing = merged.get(i.id)
    if (!existing) {
      merged.set(i.id, i)
      return
    }
    const cap = existing.stockQuantity || i.stockQuantity || Infinity
    merged.set(i.id, { ...existing, quantity: Math.min(Math.max(existing.quantity, i.quantity), cap) })
  })
  return [...merged.values()]
}

const CartSync = () => {
  const { user, loading } = useCustomerAuth()
  const uid = user?.uid ?? null
  const hadUser = useRef(false)
  const ready = useRef(false)
  const remoteSig = useRef("")

  // Sign-in / sign-out
  useEffect(() => {
    if (loading) return

    if (!uid) {
      // Signed out: the account's cart must not stay on this device.
      if (hadUser.current) useCartStore.getState().clearCart()
      hadUser.current = false
      ready.current = false
      remoteSig.current = ""
      return
    }

    hadUser.current = true
    ready.current = false
    let cancelled = false
    let unsubscribe: (() => void) | undefined
    const ref = doc(db, "carts", uid)

    ;(async () => {
      const snap = await getDoc(ref)
      if (cancelled) return

      const remote: CartItem[] = snap.exists() ? snap.data().items ?? [] : []
      const merged = mergeCarts(remote, useCartStore.getState().items)
      useCartStore.getState().setItems(merged)

      remoteSig.current = signature(remote)
      if (signature(merged) !== signature(remote)) {
        remoteSig.current = signature(merged)
        await setDoc(ref, { items: clean(merged), updatedAt: serverTimestamp() })
      }
      if (cancelled) return
      ready.current = true

      // Changes made on another device appear here live.
      unsubscribe = onSnapshot(ref, (s) => {
        if (!s.exists()) return
        const items: CartItem[] = s.data().items ?? []
        remoteSig.current = signature(items)
        if (signature(items) !== signature(useCartStore.getState().items)) {
          useCartStore.getState().setItems(items)
        }
      })
    })().catch((err) => console.error("Cart sync failed:", err))

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [uid, loading])

  // Push local changes to the account (debounced)
  useEffect(() => {
    if (!uid) return
    let timer: ReturnType<typeof setTimeout> | undefined

    const unsubscribe = useCartStore.subscribe((state) => {
      if (!ready.current || signature(state.items) === remoteSig.current) return
      clearTimeout(timer)
      timer = setTimeout(() => {
        const items = useCartStore.getState().items
        remoteSig.current = signature(items)
        setDoc(doc(db, "carts", uid), { items: clean(items), updatedAt: serverTimestamp() }).catch((err) =>
          console.error("Cart save failed:", err)
        )
      }, 500)
    })

    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [uid])

  return null
}

export default CartSync
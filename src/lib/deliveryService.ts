"use client"
import { useEffect, useState } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { DEFAULT_DELIVERY_SETTINGS, DeliverySettings, normalizeDeliverySettings } from "@/lib/delivery"

export async function fetchDeliverySettings(): Promise<{ settings: DeliverySettings; configured: boolean }> {
  const snap = await getDoc(doc(db, "settings", "delivery"))
  if (!snap.exists()) return { settings: DEFAULT_DELIVERY_SETTINGS, configured: false }
  return { settings: normalizeDeliverySettings(snap.data()), configured: true }
}

// Admin only — Firestore rules allow this write for the admin account.
export async function saveDeliverySettings(settings: DeliverySettings) {
  await setDoc(doc(db, "settings", "delivery"), normalizeDeliverySettings(settings))
}

export function useDeliverySettings() {
  const [state, setState] = useState<{
    settings: DeliverySettings
    configured: boolean
    loading: boolean
    error: boolean
  }>({ settings: DEFAULT_DELIVERY_SETTINGS, configured: false, loading: true, error: false })

  useEffect(() => {
    let active = true
    fetchDeliverySettings()
      .then((r) => active && setState({ ...r, loading: false, error: false }))
      .catch(() => active && setState((s) => ({ ...s, loading: false, error: true })))
    return () => {
      active = false
    }
  }, [])

  return state
}
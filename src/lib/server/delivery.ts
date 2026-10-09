import { adminDb } from "@/lib/firebaseAdmin"
import { DEFAULT_DELIVERY_SETTINGS, DeliverySettings, normalizeDeliverySettings } from "@/lib/delivery"

export async function loadDeliverySettings(): Promise<{ settings: DeliverySettings; configured: boolean }> {
  const snap = await adminDb.collection("settings").doc("delivery").get()
  if (!snap.exists) return { settings: DEFAULT_DELIVERY_SETTINGS, configured: false }
  return { settings: normalizeDeliverySettings(snap.data()), configured: true }
}
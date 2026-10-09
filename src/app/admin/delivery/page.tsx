"use client"
import React, { useEffect, useState } from "react"
import { AlertTriangle, ChevronDown, Menu, Plus, Store, Trash2, Truck } from "lucide-react"
import { toast } from "sonner"
import { useSidebarStore } from "@/store/sidebarStore"
import { fetchDeliverySettings, saveDeliverySettings } from "@/lib/deliveryService"
import { DEFAULT_DELIVERY_SETTINGS, DeliverySettings, DeliveryZone, NIGERIAN_STATES } from "@/lib/delivery"

const inputClass =
  "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-300 focus:outline-none"

export default function DeliveryAdminPage() {
  const { toggleSidebar } = useSidebarStore()
  const [settings, setSettings] = useState<DeliverySettings>(DEFAULT_DELIVERY_SETTINGS)
  const [configured, setConfigured] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [openZone, setOpenZone] = useState<string | null>(null)

  useEffect(() => {
    fetchDeliverySettings()
      .then((r) => {
        setSettings(r.settings)
        setConfigured(r.configured)
      })
      .catch(() => toast.error("Couldn't load delivery settings"))
      .finally(() => setLoading(false))
  }, [])

  const updateZone = (id: string, patch: Partial<DeliveryZone>) =>
    setSettings((s) => ({ ...s, zones: s.zones.map((z) => (z.id === id ? { ...z, ...patch } : z)) }))

  const addZone = () => {
    const id = `zone_${Date.now()}`
    setSettings((s) => ({ ...s, zones: [...s.zones, { id, name: "", fee: 0, eta: "", states: [] }] }))
    setOpenZone(id)
  }

  const removeZone = (id: string) =>
    setSettings((s) => ({ ...s, zones: s.zones.filter((z) => z.id !== id) }))

  // A state can only belong to one zone, so picking it here removes it elsewhere.
  const toggleState = (zoneId: string, state: string) =>
    setSettings((s) => ({
      ...s,
      zones: s.zones.map((z) => {
        if (z.id === zoneId) {
          return {
            ...z,
            states: z.states.includes(state) ? z.states.filter((x) => x !== state) : [...z.states, state],
          }
        }
        return { ...z, states: z.states.filter((x) => x !== state) }
      }),
    }))

  const zoneOf = (state: string) => settings.zones.find((z) => z.states.includes(state))

  const handleSave = async () => {
    if (settings.pickup.enabled && !settings.pickup.address.trim()) {
      toast.error("Add your shop's pickup address, or switch pickup off.")
      return
    }
    if (settings.zones.some((z) => !z.name.trim())) {
      toast.error("Every zone needs a name.")
      return
    }
    setSaving(true)
    try {
      await saveDeliverySettings(settings)
      setConfigured(true)
      toast.success("Delivery settings saved")
    } catch (err) {
      console.error(err)
      toast.error("Couldn't save. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

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
            <h2 className="text-[18px] sm:text-2xl font-bold text-gray-900">Delivery</h2>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold text-sm px-5 py-2.5 rounded-xl disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </header>

      <div className="px-3 sm:px-6 py-6 max-w-3xl space-y-6 mx-auto">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <>
            {!configured && (
              <div className="flex gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p>
                  Delivery isn't set up yet, so customers can only choose pickup. Fill this in and press
                  <strong> Save settings</strong> to switch delivery on.
                </p>
              </div>
            )}

            {/* Pickup */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Store className="w-4 h-4 text-gray-400" /> Pickup from your shop
                </h3>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pickup.enabled}
                    onChange={(e) => setSettings((s) => ({ ...s, pickup: { ...s.pickup, enabled: e.target.checked } }))}
                    className="w-4 h-4"
                  />
                  Offer pickup
                </label>
              </div>
              {settings.pickup.enabled && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Shop address</label>
                    <input
                      className={inputClass}
                      value={settings.pickup.address}
                      onChange={(e) => setSettings((s) => ({ ...s, pickup: { ...s.pickup, address: e.target.value } }))}
                      placeholder="Street, area, city"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Ready in</label>
                    <input
                      className={inputClass}
                      value={settings.pickup.eta}
                      onChange={(e) => setSettings((s) => ({ ...s, pickup: { ...s.pickup, eta: e.target.value } }))}
                      placeholder="Ready within 24 hours of payment"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Delivery zones */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-400" /> Delivery zones
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Group states that share a price. Any state you don't place in a zone uses "All other states" below.
                    A fee of 0 means free delivery.
                  </p>
                </div>
                <button
                  onClick={addZone}
                  className="flex items-center gap-1 text-sm font-semibold bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg whitespace-nowrap"
                >
                  <Plus size={14} /> Add zone
                </button>
              </div>

              {settings.zones.map((zone) => (
                <div key={zone.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-12 sm:col-span-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Zone name</label>
                      <input
                        className={inputClass}
                        value={zone.name}
                        onChange={(e) => updateZone(zone.id, { name: e.target.value })}
                        placeholder="e.g. Lagos"
                      />
                    </div>
                    <div className="col-span-5 sm:col-span-3">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Fee (₦)</label>
                      <input
                        type="number"
                        min="0"
                        className={inputClass}
                        value={zone.fee || ""}
                        onChange={(e) => updateZone(zone.id, { fee: Number(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Delivery time</label>
                      <input
                        className={inputClass}
                        value={zone.eta}
                        onChange={(e) => updateZone(zone.id, { eta: e.target.value })}
                        placeholder="1–2 business days"
                      />
                    </div>
                    <button
                      onClick={() => removeZone(zone.id)}
                      className="col-span-1 flex items-center justify-center py-2.5 text-red-500 hover:text-red-600"
                      title="Remove zone"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <button
                    onClick={() => setOpenZone(openZone === zone.id ? null : zone.id)}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-700"
                  >
                    {zone.states.length} state{zone.states.length === 1 ? "" : "s"} selected
                    <ChevronDown size={14} className={openZone === zone.id ? "rotate-180" : ""} />
                  </button>

                  {openZone === zone.id && (
                    <div className="flex flex-wrap gap-1.5">
                      {NIGERIAN_STATES.map((st) => {
                        const inThis = zone.states.includes(st)
                        const other = !inThis ? zoneOf(st) : undefined
                        return (
                          <button
                            key={st}
                            onClick={() => toggleState(zone.id, st)}
                            title={other ? `Currently in "${other.name || "another zone"}" — click to move it here` : ""}
                            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                              inThis
                                ? "bg-neutral-950 text-white border-neutral-950"
                                : other
                                  ? "bg-gray-100 text-gray-400 border-gray-200"
                                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                            }`}
                          >
                            {st}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Fallback */}
              <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3 bg-gray-50">
                <p className="text-sm font-semibold text-gray-900">All other states</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Fee (₦)</label>
                    <input
                      type="number"
                      min="0"
                      className={inputClass}
                      value={settings.fallback.fee || ""}
                      onChange={(e) => setSettings((s) => ({ ...s, fallback: { ...s.fallback, fee: Number(e.target.value) || 0 } }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Delivery time</label>
                    <input
                      className={inputClass}
                      value={settings.fallback.eta}
                      onChange={(e) => setSettings((s) => ({ ...s, fallback: { ...s.fallback, eta: e.target.value } }))}
                      placeholder="3–5 business days"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Free delivery */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-gray-900">Free delivery (optional)</h3>
              <div className="max-w-xs">
                <label className="block text-xs font-medium text-gray-500 mb-1">Free when the items total is at least (₦)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={settings.freeDeliveryThreshold ?? ""}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, freeDeliveryThreshold: e.target.value ? Number(e.target.value) : null }))
                  }
                  placeholder="Leave empty for no free delivery"
                />
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
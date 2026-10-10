"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Package } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCustomerAuth } from "@/lib/useCustomerAuth"
import { getProfile, saveProfile } from "@/lib/profileService"
import { signOutCustomer } from "@/lib/customerAuth"
import { NIGERIAN_STATES } from "@/lib/delivery"

const AccountPage = () => {
  const router = useRouter()
  const { user, loading } = useCustomerAuth()
  const [form, setForm] = useState({ name: "", phone: "", state: "", address: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/sign-in?next=/account")
      return
    }
    getProfile(user.uid)
      .then((p) =>
        setForm({
          name: p?.name || user.displayName || "",
          phone: p?.phone || "",
          state: p?.state || "",
          address: p?.address || "",
        })
      )
      .catch(() => toast.error("Couldn't load your saved details"))
  }, [user, loading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      await saveProfile(user.uid, form)
      toast.success("Details saved")
    } catch {
      toast.error("Couldn't save. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOutCustomer()
    router.push("/")
  }

  if (loading || !user) return null

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">My Account</h1>

        <Link
          href="/my-orders"
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl p-5 hover:border-slate-900 transition-colors"
        >
          <Package className="w-5 h-5 text-slate-900" />
          <div>
            <p className="font-semibold text-slate-900">My Orders</p>
            <p className="text-sm text-gray-500">Track deliveries and review what you've bought</p>
          </div>
        </Link>

        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="font-bold text-slate-900">Saved details</h2>
            <p className="text-sm text-gray-500">Used to fill in checkout for you.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
            <Input value={user.email ?? ""} readOnly className="h-11 bg-gray-50 text-gray-500" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Full name</label>
              <Input name="name" value={form.name} onChange={handleChange} className="h-11" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Phone</label>
              <Input name="phone" type="tel" value={form.phone} onChange={handleChange} className="h-11" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">State</label>
            <select
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full h-11 px-3 border border-gray-300 rounded-md bg-white text-sm"
            >
              <option value="">Select your state</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Delivery address</label>
            <Input name="address" value={form.address} onChange={handleChange} className="h-11" />
          </div>
          <Button type="submit" disabled={saving} className="bg-slate-900 hover:bg-slate-800 text-white">
            {saving ? "Saving..." : "Save details"}
          </Button>
        </form>

        <button onClick={handleSignOut} className="text-sm text-red-600 hover:underline">
          Sign out
        </button>
      </div>
    </div>
  )
}

export default AccountPage
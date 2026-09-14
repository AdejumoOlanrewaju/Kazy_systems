"use client"
import React, { useEffect, useState } from "react"
import { getLeads, Lead } from "@/lib/leadService"
import { Wrench, Mail } from "lucide-react"

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "repair" | "contact">("all")

  useEffect(() => {
    const unsubscribe = getLeads((data) => {
      setLeads(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const filteredLeads = leads.filter((l) => filter === "all" || l.type === filter)

  const formatDate = (lead: Lead) => {
    if (!lead.createdAt?.seconds) return "Just now"
    return new Date(lead.createdAt.seconds * 1000).toLocaleString()
  }

  return (
    <main className="min-h-screen bg-gray-50 flex-1 overflow-y-auto p-6">
      <h1 className="text-2xl font-bold text-black mb-6">Leads</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "repair", "contact"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize ${
              filter === f ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading leads...</p>
      ) : filteredLeads.length === 0 ? (
        <p className="text-gray-500">No leads yet.</p>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {lead.type === "repair" ? (
                    <Wrench className="w-4 h-4 text-orange-500" />
                  ) : (
                    <Mail className="w-4 h-4 text-blue-500" />
                  )}
                  <span className="text-xs font-semibold uppercase text-gray-500">
                    {lead.type}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{formatDate(lead)}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                {lead.name && <p><span className="font-semibold">Name:</span> {lead.name}</p>}
                {lead.firstName && (
                  <p><span className="font-semibold">Name:</span> {lead.firstName} {lead.lastName}</p>
                )}
                {lead.email && <p><span className="font-semibold">Email:</span> {lead.email}</p>}
                {lead.phone && <p><span className="font-semibold">Phone:</span> {lead.phone}</p>}
                {lead.laptopBrand && <p><span className="font-semibold">Laptop:</span> {lead.laptopBrand}</p>}
                {lead.issue && <p><span className="font-semibold">Issue:</span> {lead.issue}</p>}
                {lead.subject && <p><span className="font-semibold">Subject:</span> {lead.subject}</p>}
              </div>

              {(lead.description || lead.message) && (
                <p className="text-sm text-gray-600 mt-3 border-t border-gray-100 pt-3">
                  {lead.description || lead.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
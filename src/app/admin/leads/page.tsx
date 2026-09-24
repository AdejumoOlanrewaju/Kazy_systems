"use client"
import React, { useEffect, useState } from "react"
import { getLeads, Lead } from "@/lib/leadService"
import { Wrench, Mail, Menu, Phone, Laptop2 } from "lucide-react"
import { useSidebarStore } from "@/store/sidebarStore"

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "repair" | "contact">("all")
  const { toggleSidebar } = useSidebarStore()

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

  const counts = {
    all: leads.length,
    repair: leads.filter((l) => l.type === "repair").length,
    contact: leads.filter((l) => l.type === "contact").length,
  }

  return (
    <main className="min-h-screen bg-gray-50 flex-1 overflow-y-auto">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-4 py-2.5 sm:px-6 sm:py-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleSidebar()}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-[18px] sm:text-2xl font-bold text-gray-900">Leads</h2>
          </div>
        </div>
      </header>
      <div className="px-3 sm:px-6 py-4">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "repair", "contact"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${filter === f
                ? "bg-amber-500 text-neutral-950"
                : "bg-white border border-gray-200 text-gray-600 hover:border-amber-300"
                }`}
            >
              {f}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f ? "bg-neutral-950/15" : "bg-gray-100 text-gray-500"
                  }`}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading leads...</p>
        ) : filteredLeads.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl py-16 text-center text-gray-400">
            No leads yet.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-amber-200 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${lead.type === "repair" ? "bg-amber-50" : "bg-blue-50"
                        }`}
                    >
                      {lead.type === "repair" ? (
                        <Wrench className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </span>
                    <span className="text-xs font-semibold uppercase text-gray-500 tracking-wide">
                      {lead.type}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(lead)}</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm mb-1">
                  {(lead.name || lead.firstName) && (
                    <p style = {{wordBreak : "break-word"}} className="flex flex-wrap items-center gap-1.5 text-gray-700">
                      <span className="font-semibold text-gray-900">
                        {lead.name || `${lead.firstName} ${lead.lastName || ""}`.trim()}
                      </span>
                    </p>
                  )}
                  {lead.email && (
                    <p style = {{wordBreak : "break-word"}} className="flex flex-wrap items-center gap-1.5 text-gray-600">
                      <Mail size={13} className="text-gray-400" /> {lead.email}
                    </p>
                  )}
                  {lead.phone && (
                    <p style = {{wordBreak : "break-word"}} className="flex flex-wrap items-center gap-1.5 text-gray-600">
                      <Phone size={13} className="text-gray-400" /> {lead.phone}
                    </p>
                  )}
                  {lead.laptopBrand && (
                    <p style = {{wordBreak : "break-word"}} className="flex flex-wrap items-center gap-1.5 text-gray-600">
                      <Laptop2 size={13} className="text-gray-400" /> {lead.laptopBrand}
                    </p>
                  )}
                  {lead.issue && <p style = {{wordBreak : "break-word"}}><span className="font-semibold text-gray-900">Issue:</span> <span className="text-gray-600">{lead.issue}</span></p>}
                  {lead.subject && <p style = {{wordBreak : "break-word"}}><span className="font-semibold text-gray-900">Subject:</span> <span className="text-gray-600">{lead.subject}</span></p>}
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
      </div>
    </main>
  )
}
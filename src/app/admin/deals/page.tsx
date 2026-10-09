"use client"
import ProductDeal from '@/app/components/ProductDeal'
import { useLaptopStore } from '@/store/laptopStore'
import { useSidebarStore } from '@/store/sidebarStore'
import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { categories } from '@/lib/data'
import { endDeal } from '@/lib/productDataService'
import { isDealLive } from '@/lib/productDisplay'
import { LaptopType } from '@/lib/types'
import { ChevronDown, Filter, Menu, Search, Tag } from 'lucide-react'
import { toast } from 'sonner'

// Everything searchable about a product, including configuration specs.
const searchableText = (l: LaptopType): string =>
  [
    l.name,
    ...(l.configurations || []).flatMap((c) => [c.processor, c.ram, c.storage, c.customLabel]),
    ...(l.specSheet || []).map((s) => s.value),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const formatDateTime = (ms: number) =>
  new Date(ms).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })

const page = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [endingId, setEndingId] = useState<string | null>(null)
  const { toggleSidebar } = useSidebarStore()
  const { laptopStoreData, loadingStore } = useLaptopStore()

  const dealProducts = useMemo(
    () => laptopStoreData.filter((l) => l.isDeal),
    [laptopStoreData]
  )

  const liveCount = dealProducts.filter((l) => isDealLive(l)).length
  const endedCount = dealProducts.length - liveCount

  const filteredLaptops = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()

    return dealProducts
      .filter((laptop) => {
        const matchesSearch = !q || searchableText(laptop).includes(q)
        const matchesCategory = filterCategory === "all" || laptop.category === filterCategory
        return matchesSearch && matchesCategory
      })
      // Live deals first, soonest-ending first; ended ones sink to the bottom.
      .sort((a, b) => {
        const aLive = isDealLive(a) ? 0 : 1
        const bLive = isDealLive(b) ? 0 : 1
        if (aLive !== bLive) return aLive - bLive
        return (a.dealEndsAt ?? Number.MAX_SAFE_INTEGER) - (b.dealEndsAt ?? Number.MAX_SAFE_INTEGER)
      })
  }, [dealProducts, searchTerm, filterCategory])

  const handleEndDeal = async (laptop: LaptopType) => {
    if (!window.confirm(`End the deal on "${laptop.name}" now? It returns to its regular price immediately.`)) return
    setEndingId(laptop.dbID)
    try {
      await endDeal(laptop.dbID)
      toast.success(`Deal ended — ${laptop.name} is back to regular price`)
    } catch (err) {
      console.error(err)
      toast.error("Couldn't end the deal. Please try again.")
    } finally {
      setEndingId(null)
    }
  }

  return (
    <>
      <main className='min-h-screen bg-gray-50 flex-1 overflow-y-auto'>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="px-4 py-2.5 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleSidebar()}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900"
                >
                  <Menu size={20} />
                </button>
                <h2 className="text-[18px] sm:text-2xl font-bold text-gray-900">All Deals</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
                  <Tag size={13} />
                  {liveCount} live
                </span>
                {endedCount > 0 && (
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                    {endedCount} ended
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="mt-2 py-4 px-3 sm:p-8">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search deals by name, processor, RAM..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-300 focus:outline-none transition-colors"
                />
              </div>
              <div className="relative">
                <Filter
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-300 focus:outline-none appearance-none cursor-pointer min-w-[200px]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={18}
                />
              </div>
            </div>
          </div>

          {/* Deals Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loadingStore ? (
              <div className="text-center text-gray-500 py-10 col-span-full">Loading...</div>
            ) : filteredLaptops.length === 0 ? (
              <div className="text-center text-gray-500 py-10 col-span-full">
                No deals found. Tick "Is Deal" on a product (with a Discount %) from the Products page to see it here.
              </div>
            ) : (
              filteredLaptops.map((laptop) => {
                const live = isDealLive(laptop)
                const noDiscount = !laptop.discount || laptop.discount <= 0

                return (
                  <div key={laptop.dbID} className="flex flex-col gap-2">
                    <ProductDeal product={laptop} />

                    {/* Admin controls — kept outside the card, which is a link */}
                    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm min-w-0">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${live ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          <span className="font-semibold text-gray-800">{live ? 'Live' : 'Ended'}</span>
                          <span className="text-gray-500 truncate">
                            {laptop.dealEndsAt
                              ? `${live ? 'ends' : 'ended'} ${formatDateTime(laptop.dealEndsAt)}`
                              : 'no end date'}
                            {laptop.discount ? ` · ${laptop.discount}% off` : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link
                            href="/admin/product"
                            className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleEndDeal(laptop)}
                            disabled={endingId === laptop.dbID}
                            className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {endingId === laptop.dbID ? 'Ending...' : live ? 'End now' : 'Clear'}
                          </button>
                        </div>
                      </div>

                      {noDiscount && (
                        <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                          No discount set, so the price isn't reduced. Edit the product and add a Discount %.
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default page
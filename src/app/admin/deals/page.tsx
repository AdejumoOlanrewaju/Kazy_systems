"use client"
import ProductDeal from '@/app/components/ProductDeal'
import { useLaptopStore } from '@/store/laptopStore'
import { useSidebarStore } from '@/store/sidebarStore'
import React, { useMemo, useState } from 'react'
import { categories } from '@/lib/data'
import { ChevronDown, Filter, Menu, Search } from 'lucide-react'

const page = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const { toggleSidebar, isOpen } = useSidebarStore()
  const { laptopStoreData, loadingStore } = useLaptopStore()
  const dealLaptops = laptopStoreData.filter(laptop => laptop.isDeal)
  const filteredLaptops = useMemo(() => {
    if (dealLaptops.length === 0) return [];

    return dealLaptops.filter((laptop) => {
      const name = laptop?.name?.toLowerCase() || "";
      const specs = laptop?.specs?.toLowerCase() || "";

      const matchesSearch =
        name.includes(searchTerm.toLowerCase()) ||
        specs.includes(searchTerm.toLowerCase());

      const matchesCategory =
        filterCategory === "all" || laptop?.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [laptopStoreData, searchTerm, filterCategory]);

  return (
    <>
      <main className='min-h-screen bg-gray-50  flex-1 overflow-y-auto'>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className=" px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleSidebar()}
                    className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-700 hover:text-white"
                  >
                    <Menu size={20} />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-black">All Deals</h2>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </header>
        <div className="mt-6 p-8">
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
                  placeholder="Search products by name or specs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-300 focus:outline-none transition-colors"
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
                  className="pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-300 focus:outline-none appearance-none cursor-pointer min-w-[200px]"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 ">
            {loadingStore ? (
              <div className="text-center text-gray-500 py-10">Loading...</div>
            ) : filteredLaptops.length === 0 ? (
              <div className="text-center text-gray-500 py-10">No laptops found.</div>
            ) : (
              filteredLaptops.map((laptop, index) => (
                <ProductDeal product={laptop} key={index} />
              ))
            )}
          </div>

        </div>
      </main>
    </>
  )
}

export default page

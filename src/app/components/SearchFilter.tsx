"use client"
import React, { useMemo, useState } from 'react'
import { categories } from '@/lib/data';
import { ChevronDown, Filter, Menu, Search } from 'lucide-react'

const SearchFilter = (prop: any) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    return (
        <div>
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
        </div>
    )
}

export default SearchFilter

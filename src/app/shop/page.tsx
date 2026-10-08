"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Laptop, Search, SlidersHorizontal, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import { Input } from '@/components/ui/input';
import { useLaptopStore } from '@/store/laptopStore';
import LoadingProduct from '../components/LoadingProduct';
import { LaptopType } from '@/lib/types';
import { getProductStock, getProductPrice, getPricing, getEffectivePrice } from '@/lib/productDisplay';
const CATEGORIES = [
    { value: 'all', label: 'All Laptops' },
    { value: 'premium', label: 'Premium' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'business', label: 'Business' },
    { value: 'budget', label: 'Budget Friendly' },
];

const CONDITIONS = [
    { value: 'all', label: 'Any condition' },
    { value: 'new', label: 'New' },
    { value: 'refurbished', label: 'Refurbished' },
    { value: 'used', label: 'Used' },
];

// Each range is [min, max)
const PRICE_RANGES = [
    { value: 'all', label: 'All Prices', min: 0, max: Infinity },
    { value: 'under300', label: 'Under ₦300,000', min: 0, max: 300000 },
    { value: '300-500', label: '₦300,000 - ₦500,000', min: 300000, max: 500000 },
    { value: '500-750', label: '₦500,000 - ₦750,000', min: 500000, max: 750000 },
    { value: '750-1000', label: '₦750,000 - ₦1,000,000', min: 750000, max: 1000000 },
    { value: 'over1000', label: 'Over ₦1,000,000', min: 1000000, max: Infinity },
];

const filterButtonClass = (active: boolean) =>
    `w-full text-left px-4 py-2 rounded-lg transition-colors ${active ? 'bg-slate-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`;

// Every price a customer could actually pay for this product.
const pricesOf = (l: LaptopType): number[] =>
    l.configurations?.length
        ? l.configurations.map((c) => getEffectivePrice(l, c).price)
        : [getEffectivePrice(l).price];

// Everything searchable about a product, including its configurations'
// processor/RAM/storage and spec sheet, so "i7" or "16GB" finds the right laptops.
const searchableText = (l: LaptopType): string =>
    [
        l.name,
        l.category,
        ...(l.configurations || []).flatMap((c) => [c.processor, c.ram, c.storage, c.customLabel]),
        ...(l.specSheet || []).map((s) => s.value),
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

const page = () => {
    const [sortBy, setSortBy] = useState('featured');
    const [priceRange, setPriceRange] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedCondition, setSelectedCondition] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [inStockOnly, setInStockOnly] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const { laptopStoreData, loadingStore } = useLaptopStore()

    const getFilteredAndSortedLaptops = () => {
        let filtered = [...laptopStoreData];

        // Search
        const q = searchQuery.trim().toLowerCase();
        if (q) {
            filtered = filtered.filter((laptop) => searchableText(laptop).includes(q));
        }

        // Category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter((laptop) => laptop.category === selectedCategory);
        }

        // Condition (products saved before this field existed count as "used",
        // matching what their badge already shows)
        if (selectedCondition !== 'all') {
            filtered = filtered.filter((laptop) => (laptop.condition || 'used') === selectedCondition);
        }

        // Stock — configured products count the sum of their configurations
        if (inStockOnly) {
            filtered = filtered.filter((laptop) => getProductStock(laptop) > 0);
        }

        // Price — a configured product matches if ANY of its configurations
        // falls in the range, so a laptop with ₦245k and ₦310k options shows
        // up under both "Under ₦300,000" and "₦300,000 - ₦500,000".
        const range = PRICE_RANGES.find((r) => r.value === priceRange);
        if (range && range.value !== 'all') {
            filtered = filtered.filter((laptop) =>
                pricesOf(laptop).some((p) => p >= range.min && p < range.max)
            );
        }

        // Sort — by the price a customer starts from
        if (sortBy === 'price-low') {
            filtered.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        } else if (sortBy === 'price-high') {
            filtered.sort((a, b) => getProductPrice(b) - getProductPrice(a));
        } else if (sortBy === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'popular') {
            filtered.sort((a, b) => b.reviews - a.reviews);
        }

        return filtered;
    };

    const displayLaptops = getFilteredAndSortedLaptops();

    const activeFilterCount = [
        selectedCategory !== 'all',
        selectedCondition !== 'all',
        priceRange !== 'all',
        inStockOnly,
        searchQuery.trim() !== '',
    ].filter(Boolean).length;

    // "Save up to X%" is computed from real live deals instead of a hardcoded number.
    const maxDealPercent = laptopStoreData
        .filter((l) => l.isDeal && (!l.dealEndsAt || l.dealEndsAt > Date.now()))
        .reduce((max, l) => Math.max(max, getPricing(l).percent), 0);

    const clearAllFilters = () => {
        setSelectedCategory('all');
        setSelectedCondition('all');
        setPriceRange('all');
        setSearchQuery('');
        setSortBy('featured');
        setInStockOnly(false);
    };

    return (
        <div>
            {/* Shop Hero */}
            <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold mb-3">Shop All Laptops</h1>
                            <p className="text-xl text-gray-300">Browse our complete collection of premium laptops</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Badge className="border-2 border-amber-500 text-amber-500 px-4 py-2 text-lg font-bold">
                                {displayLaptops.length} Products
                            </Badge>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters and Products */}
            <section className="py-12">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden mb-6">
                        <Button
                            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                            variant="outline"
                            className="w-full justify-between border-2"
                        >
                            <span className="flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <Badge className="bg-slate-900 text-white ml-1">{activeFilterCount}</Badge>
                                )}
                            </span>
                            {mobileFiltersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Sidebar Filters */}
                        <div className={`lg:col-span-1 ${mobileFiltersOpen ? 'block' : 'hidden'} lg:block`}>
                            <div className="sticky top-24 space-y-6 h-screen overflow-y-scroll">
                                {/* Search */}
                                <Card className="border-2 ">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Search Products</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                type="text"
                                                placeholder="Name, i7, 16GB, SSD..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 pr-10"
                                            />
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Category */}
                                <Card className="border-2">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Category</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {CATEGORIES.map((c) => (
                                            <button
                                                key={c.value}
                                                onClick={() => setSelectedCategory(c.value)}
                                                className={filterButtonClass(selectedCategory === c.value)}
                                            >
                                                {c.label}
                                            </button>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Condition */}
                                <Card className="border-2">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Condition</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {CONDITIONS.map((c) => (
                                            <button
                                                key={c.value}
                                                onClick={() => setSelectedCondition(c.value)}
                                                className={filterButtonClass(selectedCondition === c.value)}
                                            >
                                                {c.label}
                                            </button>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Price Range */}
                                <Card className="border-2">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Price Range</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {PRICE_RANGES.map((r) => (
                                            <button
                                                key={r.value}
                                                onClick={() => setPriceRange(r.value)}
                                                className={filterButtonClass(priceRange === r.value)}
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Stock Filter */}
                                <Card className="border-2">
                                    <CardContent className="pt-6">
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-sm font-semibold text-slate-900">In Stock Only</span>
                                            <button
                                                onClick={() => setInStockOnly(!inStockOnly)}
                                                className={`relative w-11 h-6 rounded-full transition-colors ${inStockOnly ? 'bg-slate-900' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${inStockOnly ? 'translate-x-5' : 'translate-x-0'
                                                        }`}
                                                />
                                            </button>
                                        </label>
                                    </CardContent>
                                </Card>

                                {/* Special Offers */}
                                <Card className="border-2 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center">
                                            <TrendingUp className="w-5 h-5 mr-2 text-amber-600" />
                                            Special Offers
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 mb-4">
                                            {maxDealPercent > 0
                                                ? `Check out our exclusive deals and save up to ${maxDealPercent}%!`
                                                : 'Check out our latest deals and special offers.'}
                                        </p>
                                        <Link href={"/deals"}>
                                            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold">
                                                View Deals
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="lg:col-span-3">
                            {/* Sort and View Options */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <p className="text-gray-600">
                                    Showing <span className="font-semibold">{displayLaptops.length}</span> of <span className="font-semibold">{laptopStoreData.length}</span> products
                                </p>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-600">Sort by:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    >
                                        <option value="featured">Featured</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="rating">Highest Rated</option>
                                        <option value="popular">Most Popular</option>
                                    </select>
                                </div>
                            </div>

                            {/* Products Grid */}
                            {
                                loadingStore ? (<LoadingProduct />) : displayLaptops.length > 0 ? (
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {displayLaptops.map((laptop) => (
                                            <ProductCard laptop={laptop} key={laptop.dbID} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                                            <Laptop className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No Products Found</h3>
                                        <p className="text-gray-600 mb-6">Try adjusting your filters to see more results</p>
                                        <Button
                                            onClick={clearAllFilters}
                                            className="bg-slate-900 hover:bg-slate-800 text-white"
                                        >
                                            Clear All Filters
                                        </Button>
                                    </div>
                                )
                            }

                        </div>
                    </div>
                </div>
            </section>

        </div>
    )
}

export default page
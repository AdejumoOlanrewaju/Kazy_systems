"use client"
import React, { useState } from 'react'
import { laptops } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Heart, Laptop, Search, Star, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import { Input } from '@/components/ui/input';
import { useLaptopStore } from '@/store/laptopStore';
import { Skeleton } from '@/components/ui/skeleton';
import LoadingProduct from '../components/LoadingProduct';
const page = () => {
    const [sortBy, setSortBy] = useState('featured');
    const [priceRange, setPriceRange] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { laptopStoreData, loadingStore } = useLaptopStore()

    console.log(laptopStoreData)
    // Filter and sort laptops for shop page
    const getFilteredAndSortedLaptops = () => {
        let filtered = [...laptopStoreData];

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(laptop =>
                laptop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                laptop.specs.toLowerCase().includes(searchQuery.toLowerCase()) ||
                laptop.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(laptop => laptop.category === selectedCategory);
        }

        // Filter by price range
        if (priceRange === 'under300') {
            filtered = filtered.filter(laptop => laptop.price < 300000);

        } else if (priceRange === '300-500') {
            filtered = filtered.filter(
                laptop => laptop.price >= 300000 && laptop.price < 500000
            );

        } else if (priceRange === '500-750') {
            filtered = filtered.filter(
                laptop => laptop.price >= 500000 && laptop.price < 750000
            );

        } else if (priceRange === '750-1000') {
            filtered = filtered.filter(
                laptop => laptop.price >= 750000 && laptop.price < 1000000
            );

        } else if (priceRange === 'over1000') {
            filtered = filtered.filter(laptop => laptop.price >= 1000000);
        }

        // Sort
        if (sortBy === 'price-low') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'popular') {
            filtered.sort((a, b) => b.reviews - a.reviews);
        }

        return filtered;
    };

    const displayLaptops = getFilteredAndSortedLaptops();
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
                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Sidebar Filters */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6 h-screen overflow-y-scroll">
                                {/* Search Box - Mobile/Tablet */}
                                <Card className="border-2 ">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Search Products</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                type="text"
                                                placeholder="Search laptops..."
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
                                {/* Category Filter */}
                                <Card className="border-2">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Category</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <button
                                            onClick={() => setSelectedCategory('all')}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedCategory === 'all'
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            All Laptops
                                        </button>
                                        <button
                                            onClick={() => setSelectedCategory('premium')}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedCategory === 'premium'
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            Premium
                                        </button>
                                        <button
                                            onClick={() => setSelectedCategory('gaming')}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedCategory === 'gaming'
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            Gaming
                                        </button>
                                        <button
                                            onClick={() => setSelectedCategory('business')}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedCategory === 'business'
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            Business
                                        </button>
                                        <button
                                            onClick={() => setSelectedCategory('budget')}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedCategory === 'budget'
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            Budget Friendly
                                        </button>
                                    </CardContent>
                                </Card>

                                {/* Price Range Filter */}
                                <Card className="border-2">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Price Range</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <button
                                            onClick={() => setPriceRange('all')}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${priceRange === 'all'
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            All Prices
                                        </button>
                                        <button
                                            onClick={() => setPriceRange('under300')}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${priceRange === 'under300'
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            Under ₦300,000
                                        </button>

                                        <button
                                            onClick={() => setPriceRange('300-500')}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${priceRange === '300-500'
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            ₦300,000 - ₦500,000
                                        </button>

                                        <button
                                            onClick={() => setPriceRange('500-750')}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${priceRange === '500-750'
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            ₦500,000 - ₦750,000
                                        </button>

                                        <button
                                            onClick={() => setPriceRange('750-1000')}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${priceRange === '750-1000'
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            ₦750,000 - ₦1,000,000
                                        </button>

                                        <button
                                            onClick={() => setPriceRange('over1000')}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${priceRange === 'over1000'
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            Over ₦1,000,000
                                        </button>
                                    </CardContent>
                                </Card>

                                {/* Brands Filter */}
                                {/* <Card className="border-2">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Popular Brands</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <input type="checkbox" id="apple" className="w-4 h-4" />
                                            <label htmlFor="apple" className="text-sm cursor-pointer">Apple</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input type="checkbox" id="dell" className="w-4 h-4" />
                                            <label htmlFor="dell" className="text-sm cursor-pointer">Dell</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input type="checkbox" id="hp" className="w-4 h-4" />
                                            <label htmlFor="hp" className="text-sm cursor-pointer">HP</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input type="checkbox" id="lenovo" className="w-4 h-4" />
                                            <label htmlFor="lenovo" className="text-sm cursor-pointer">Lenovo</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input type="checkbox" id="asus" className="w-4 h-4" />
                                            <label htmlFor="asus" className="text-sm cursor-pointer">ASUS</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input type="checkbox" id="acer" className="w-4 h-4" />
                                            <label htmlFor="acer" className="text-sm cursor-pointer">Acer</label>
                                        </div>
                                    </CardContent>
                                </Card> */}

                                {/* Special Offers */}
                                <Card className="border-2 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center">
                                            <TrendingUp className="w-5 h-5 mr-2 text-amber-600" />
                                            Special Offers
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 mb-4">Check out our exclusive deals and save up to 21%!</p>
                                        <Link href={"/deals"}>
                                            <Button
                                                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"

                                            >
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
                                            onClick={() => {
                                                setSelectedCategory('all');
                                                setPriceRange('all');
                                            }}
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

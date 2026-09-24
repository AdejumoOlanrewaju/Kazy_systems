"use client"
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Heart, ShoppingCart, Star } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import ProductCard from './ProductCard';
import { laptops } from '@/lib/data'
import { useLaptopStore } from '@/store/laptopStore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import LoadingProduct from './LoadingProduct';
const ShopSection = () => {
    const { laptopStoreData, loadingStore, fetchLaptops } = useLaptopStore()
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [cart, setCart] = useState(0);

    const addToCart = (laptop: any) => {
        setCart(cart + 1);
    };
    const listedProducts = laptopStoreData.slice(0, 5)
    const filteredProducts = selectedCategory === 'all'
        ? listedProducts
        : listedProducts.filter(laptop => laptop.category === selectedCategory);
    return (
        <>

            {/* Shop Section */}
            <section id="shop" className="py-16 bg-white">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-4xl font-bold text-slate-900 mb-2">Shop Laptops</h2>
                            <p className="text-lg text-gray-600">Discover our collection of premium laptops</p>
                        </div>
                        <div className="hidden md:flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Sort by:</span>
                            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900">
                                <option>Featured</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Best Selling</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                        <Button
                            variant={selectedCategory === 'all' ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory('all')}
                            className={selectedCategory === 'all' ? 'bg-slate-900 hover:bg-slate-800' : 'border-2 hover:border-slate-900'}
                        >
                            All Laptops
                        </Button>
                        <Button
                            variant={selectedCategory === 'premium' ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory('premium')}
                            className={selectedCategory === 'premium' ? 'bg-slate-900 hover:bg-slate-800' : 'border-2 hover:border-slate-900'}
                        >
                            Premium
                        </Button>
                        <Button
                            variant={selectedCategory === 'gaming' ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory('gaming')}
                            className={selectedCategory === 'gaming' ? 'bg-slate-900 hover:bg-slate-800' : 'border-2 hover:border-slate-900'}
                        >
                            Gaming
                        </Button>
                        <Button
                            variant={selectedCategory === 'business' ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory('business')}
                            className={selectedCategory === 'business' ? 'bg-slate-900 hover:bg-slate-800' : 'border-2 hover:border-slate-900'}
                        >
                            Business
                        </Button>
                        <Button
                            variant={selectedCategory === 'budget' ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory('budget')}
                            className={selectedCategory === 'budget' ? 'bg-slate-900 hover:bg-slate-800' : 'border-2 hover:border-slate-900'}
                        >
                            Budget Friendly
                        </Button>
                    </div>

                    <div className="">
                        {loadingStore ? (<LoadingProduct/>) : (
                            <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {
                                    filteredProducts.map((laptop) => (
                                        <ProductCard laptop={laptop} key={laptop.dbID} />
                                    ))
                                }
                            </div>
                        )
                        }
                    </div>

                    <div className='mt-10'>
                        <Link className='mx-auto block w-fit' href={"/shop"}>
                            <Button className='py-6 px-8 text-xl'>View All</Button>
                        </Link>

                    </div>
                </div>
            </section>

        </>
    )
}

export default ShopSection

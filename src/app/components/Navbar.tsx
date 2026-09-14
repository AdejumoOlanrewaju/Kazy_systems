"use client"
import { Button } from '@/components/ui/button';
import { Heart, Laptop, Menu, Search, ShoppingCart, X } from 'lucide-react'
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cartStore';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const totalItems = useCartStore((state) => state.totalItems());
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <>
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white shadow-md">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="bg-slate-900 p-2 rounded-lg">
                                <Laptop className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <div className='leading-tight'>
                                    <span className="text-sm font-bold text-slate-900">Kayzee Global </span>
                                    <span className="text-sm font-bold text-slate-900 block">Computer Networks</span>

                                </div>
                            </div>
                        </Link>

                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/shop" className="text-gray-700 hover:text-slate-900 font-medium transition-colors">Shop</Link>
                            <Link href="/repair" className="text-gray-700 hover:text-slate-900 font-medium transition-colors">Repair PC</Link>
                            <Link href="/deals" className="text-gray-700 hover:text-slate-900 font-medium transition-colors">Deals</Link>
                            <Link href="/contact" className="text-gray-700 hover:text-slate-900 font-medium transition-colors">Contact</Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link href="/cart">
                                <Button variant="ghost" size="icon" className="relative">
                                    <ShoppingCart className="w-5 h-5" />
                                    {mounted && totalItems > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {totalItems}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                            <button
                                className="md:hidden p-2"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 space-y-2 border-t">
                            <Link href="/shop" className="block py-2 text-gray-700 hover:text-slate-900">Shop</Link>
                            <Link href="/repair" className="block py-2 text-gray-700 hover:text-slate-900">Repair PC</Link>
                            <Link href="/deals" className="block py-2 text-gray-700 hover:text-slate-900">Deals</Link>
                            <Link href="/contact" className="block py-2 text-gray-700 hover:text-slate-900">Contact</Link>
                        </div>
                    )}
                </div>
            </nav>

        </>
    )
}

export default Navbar
"use client"
import { Button } from '@/components/ui/button';
import { Heart, Laptop, Menu, Search, ShoppingCart, X } from 'lucide-react'
import Link from 'next/link';
import React, { useState } from 'react'

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cart, setCart] = useState(0);

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
                                {/* <p className="text-xs text-gray-500">Laptops & Repairs</p> */}
                            </div>
                        </Link>

                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/shop" className="text-gray-700 hover:text-slate-900 font-medium transition-colors">Shop</Link>
                            <Link href="/repair" className="text-gray-700 hover:text-slate-900 font-medium transition-colors">Repair PC</Link>
                            <Link href="/deals" className="text-gray-700 hover:text-slate-900 font-medium transition-colors">Deals</Link>
                            <Link href="/contact" className="text-gray-700 hover:text-slate-900 font-medium transition-colors">Contact</Link>
                        </div>

                        <div className="flex items-center space-x-4 md:hidden">
                            {/* <Button variant="ghost" size="icon" className="hidden md:flex">
                                <Search className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="hidden md:flex">
                                <Heart className="w-5 h-5" />
                            </Button> */}
                            {/* <Button variant="ghost" size="icon" className="relative">
                                <ShoppingCart className="w-5 h-5" />
                                {cart > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {cart}
                                    </span>
                                )}
                            </Button> */}
                            {/* <Button className="hidden md:inline-flex bg-slate-900 hover:bg-slate-800 text-white">
                                Sign In
                            </Button> */}
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
                            <a href="#shop" className="block py-2 text-gray-700 hover:text-slate-900">Shop</a>
                            <a href="#repairs" className="block py-2 text-gray-700 hover:text-slate-900">Repair PC</a>
                            <a href="#deals" className="block py-2 text-gray-700 hover:text-slate-900">Deals</a>
                            <a href="#contact" className="block py-2 text-gray-700 hover:text-slate-900">Contact</a>
                        </div>
                    )}
                </div>
            </nav>

        </>
    )
}

export default Navbar

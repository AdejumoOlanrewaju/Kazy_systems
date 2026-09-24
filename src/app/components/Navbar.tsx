"use client"

import { Button } from '@/components/ui/button';
import { Laptop, Menu, ShoppingCart, X } from 'lucide-react'
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const totalItems = useCartStore((state) => state.totalItems());
    const [mounted, setMounted] = useState(false);

    const pathname = usePathname();

    useEffect(() => setMounted(true), []);

    const navLinks = [
        { name: 'Shop', href: '/shop' },
        { name: 'Repair PC', href: '/repair' },
        { name: 'Deals', href: '/deals' },
        { name: 'Contact', href: '/contact' },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-md">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3">
                        <div className="bg-slate-900 p-2 rounded-lg">
                            <Laptop className="w-8 h-8 text-white" />
                        </div>

                        <div className="leading-tight">
                            <span className="text-sm font-bold text-slate-900">
                                Kayzee Global
                            </span>
                            <span className="text-sm font-bold text-slate-900 block">
                                Computer Networks
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`
                                    relative py-2 font-medium transition-colors
                                    ${isActive(link.href)
                                        ? 'text-slate-900'
                                        : 'text-gray-700 hover:text-slate-900'
                                    }

                                    after:absolute
                                    after:left-0
                                    after:bottom-0
                                    after:h-[2px]
                                    after:bg-slate-900
                                    after:transition-all
                                    after:duration-300
                                    after:ease-out

                                    ${isActive(link.href)
                                        ? 'after:w-full'
                                        : 'after:w-0 hover:after:w-full'
                                    }
                                `}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-1">

                        {/* Cart */}
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

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen
                                ? <X className="w-6 h-6" />
                                : <Menu className="w-6 h-6" />
                            }
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 space-y-2 border-t">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`
                                    relative block py-2 font-medium w-fit
                                    ${isActive(link.href)
                                        ? 'text-slate-900'
                                        : 'text-gray-700 hover:text-slate-900'
                                    }
                                    after:absolute
                                    after:left-0
                                    after:bottom-0
                                    after:h-[2px]
                                    after:bg-slate-900
                                    after:transition-all
                                    after:duration-300
                                    after:ease-out
                                

                                    ${isActive(link.href)
                                        ? 'after:w-full'
                                        : 'after:w-0 hover:after:w-full'
                                    }
                                `}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar


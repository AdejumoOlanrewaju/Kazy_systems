"use client"

import { Button } from '@/components/ui/button';
import { Laptop, Menu, Package, ShoppingCart, User, X, LogOut } from 'lucide-react'
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useCustomerAuth } from '@/lib/useCustomerAuth';
import { signOutCustomer } from '@/lib/customerAuth';

const Navbar = () => {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const totalItems = useCartStore((state) => state.totalItems());
    const [mounted, setMounted] = useState(false);
    const { user, loading: authLoading } = useCustomerAuth();

    const pathname = usePathname();

    useEffect(() => setMounted(true), []);

    const navLinks = [
        { name: 'Shop', href: '/shop' },
        { name: 'Repair PC', href: '/repair' },
        { name: 'Deals', href: '/deals' },
        { name: 'Contact', href: '/contact' },
    ];

    const isActive = (href: string) => pathname === href;

    const handleSignOut = async () => {
        await signOutCustomer();
        setAccountMenuOpen(false);
        router.push("/");
    };

    const initial = (user?.displayName?.[0] || user?.email?.[0] || "?").toUpperCase();

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

                        {/* Account — only render once auth state is known, avoids a flash */}
                        {mounted && !authLoading && (
                            user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                                        className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-[12px] hover:bg-slate-800 transition-colors"
                                    >
                                        {initial}
                                    </button>

                                    {accountMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setAccountMenuOpen(false)} />
                                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
                                                <p className="px-4 py-2 text-xs text-gray-400 truncate border-b border-gray-100">{user.email}</p>
                                                <Link
                                                    href="/my-orders"
                                                    onClick={() => setAccountMenuOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    <Package className="w-4 h-4" />
                                                    My Orders
                                                </Link>
                                                <button
                                                    onClick={handleSignOut}
                                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <Link href="/sign-in">
                                    <Button variant="ghost" size="icon">
                                        <User className="w-5 h-5" />
                                    </Button>
                                </Link>
                            )
                        )}

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

                        {mounted && !authLoading && (
                            user ? (
                                <>
                                    <Link
                                        href="/my-orders"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block py-2 font-medium text-gray-700 hover:text-slate-900 w-fit"
                                    >
                                        My Orders
                                    </Link>
                                    <button
                                        onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                                        className="block py-2 font-medium text-red-600 w-fit"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/sign-in"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-2 font-medium text-gray-700 hover:text-slate-900 w-fit"
                                >
                                    Sign In
                                </Link>
                            )
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar


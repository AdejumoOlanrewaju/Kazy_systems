"use client"

import { usePathname } from 'next/navigation';
import React, { useState } from 'react'
import {
    Package,
    LayoutDashboard,
    LogOut,
    ShoppingBag,
    BarChart3,
    Tag,
    Settings,
} from "lucide-react";
import Link from 'next/link';
import { useLaptopStore } from '@/store/laptopStore';
import { useSidebarStore } from '@/store/sidebarStore';
const SidebarAdmin = () => {
    const {laptopStoreData} = useLaptopStore()
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const pathname = usePathname();
    const {isOpen} = useSidebarStore()
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', active: false, link: "/admin" },
        { icon: Package, label: 'Products', active: true, badge: laptopStoreData.length, link: "/admin/product" },
        { icon: ShoppingBag, label: 'Deals', active: false, badge: '0', link: "/admin/deals" },
        { icon: Settings, label: 'Settings', active: false, link: "/admin/settings" },
    ];
    return (
        <div>
            {/* Sidebar */}
            <aside
                className={`${isOpen ? "w-64" : "w-20"
                    } bg-neutral-950 border-r border-neutral-800 transition-all duration-300 flex flex-col min-h-screen sticky top-0`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <LayoutDashboard className="text-white" size={20} />
                        </div>
                        {isOpen && (
                            <div>
                                <h1 className="text-lg font-bold text-white">Laptop CMS</h1>
                                <p className="text-xs text-neutral-500">Admin Panel</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item, idx) => {
                        const isActive =
                            pathname === item.link ||
                            (pathname.startsWith(item.link) && item.link !== "/admin");

                        return (
                            <Link key={idx} href={item.link}>
                                <button
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? "bg-white text-black font-semibold"
                                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                                        }`}
                                >
                                    <item.icon size={20} className="flex-shrink-0" />
                                    {isOpen && (
                                        <>
                                            <span className="flex-1 text-left text-sm">{item.label}</span>
                                            {item.badge && (
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isActive
                                                        ? "bg-black text-white"
                                                        : "bg-neutral-800 text-neutral-400"
                                                        }`}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </button>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-neutral-800">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                            JD
                        </div>
                        {isOpen && (
                            <div className="flex-1 text-left">
                                <p className="text-sm font-semibold text-white">John Doe</p>
                                <p className="text-xs text-neutral-500">Admin</p>
                            </div>
                        )}
                    </button>
                    {isOpen && (
                        <button className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-neutral-900 transition-all">
                            <LogOut size={20} />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    )}
                </div>
            </aside>
        </div>
    )
}

export default SidebarAdmin

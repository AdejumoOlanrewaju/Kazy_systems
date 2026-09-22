import { usePathname, useRouter } from 'next/navigation';
import React from 'react'
import {
    Package,
    LayoutDashboard,
    LogOut,
    ShoppingBag,
    User,
} from "lucide-react";
import Link from 'next/link';
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLaptopStore } from '@/store/laptopStore';
import { useSidebarStore } from '@/store/sidebarStore';
import { useAdminAuth } from '@/lib/useAdminAuth';

const SidebarAdmin = () => {
    const { laptopStoreData } = useLaptopStore()
    const pathname = usePathname();
    const router = useRouter();
    const { isOpen } = useSidebarStore()
    const { user } = useAdminAuth() // same hook that already guards this page — just reusing its user

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', active: false, link: "/admin" },
        { icon: Package, label: 'Products', active: true, badge: laptopStoreData.length, link: "/admin/product" },
        { icon: ShoppingBag, label: 'Deals', active: false, link: "/admin/deals" },
        { icon: User, label: 'Leads', active: false, link: "/admin/leads" },
        { icon: ShoppingBag, label: 'Orders', active: false, link: "/admin/order" },
    ];

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/admin/login");
    };

    // Turns "admin_kayzee@gmail.com" into "AK" for the avatar circle
    const initials = user?.email
        ? user.email.split("@")[0].slice(0, 2).toUpperCase()
        : "AD";

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
                    <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                            {initials}
                        </div>
                        {isOpen && (
                            <div className="flex-1 text-left overflow-hidden">
                                <p className="text-sm font-semibold text-white truncate">{user?.email || "Admin"}</p>
                                <p className="text-xs text-neutral-500">Admin</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-neutral-900 transition-all"
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        {isOpen && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </aside>
        </div>
    )
}

export default SidebarAdmin
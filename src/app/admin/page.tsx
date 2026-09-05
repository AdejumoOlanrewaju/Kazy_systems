"use client";
import React, { useState, ChangeEvent, useEffect, useMemo } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Check,
    Package,
    DollarSign,
    TrendingUp,
    LayoutDashboard,
    ChevronDown,
    Filter,
    LogOut,
    ShoppingBag,
    Users,
    BarChart3,
    Tag,
    Settings,
    Menu,
} from "lucide-react";
import { LaptopType, FormState } from "@/lib/types";
import { laptops as laptopData, categories, tags, dealBadges } from "@/lib/data";
import Link from "next/link";
import { addProduct, deleteProduct, getProducts, updateProduct } from "@/lib/productDataService";
import { Button } from "@/components/ui/button";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import LoadingOverlay from "../components/LoadingOVerlay";

export default function KazyAdmin() {
    const [laptops, setLaptops] = useState<LaptopType[]>([]);
    const [loading, setLoading] = useState<boolean>(true)
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const router = useRouter()
    const [authLoading, setAuthLoading] = useState<boolean>()
    useEffect(() => {
        const unsubscribe = getProducts((data) => {
            setLaptops(data)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/admin/login");
                return;
            }

            // check role or email
            const docSnap = await getDoc(doc(db, "users", user.uid));
            const isAdmin =
                user.email === "admin_kayzee@gmail.com" ||
                (docSnap.exists() && docSnap.data().role === "admin");

            if (!isAdmin) {
                router.push("/"); // redirect if not admin
            } else {
                setAuthLoading(false);

            }
        });

        return () => unsubscribe();
    }, [router]);

    const stats = [
        {
            label: "Total Products",
            value: laptops?.length,
            icon: Package,
            gradient: "from-emerald-400 to-emerald-600",
            change: "+12%",
        },
        {
            label: "In Stock",
            value: laptops.filter((l) => l.inStock).length,
            icon: Check,
            gradient: "from-blue-400 to-blue-600",
            change: "+8%",
        },
        {
            label: "Active Deals",
            value: laptops.filter((l) => l.isDeal).length,
            icon: TrendingUp,
            gradient: "from-purple-400 to-purple-600",
            change: "+23%",
        },
        {
            label: "Total Value",
            value: `$${laptops.reduce((sum, l) => sum + l.price, 0).toLocaleString()}`,
            icon: DollarSign,
            gradient: "from-orange-400 to-orange-600",
            change: "+15%",
        },
    ];

    if(authLoading) {
        return <LoadingOverlay/>
    }

    return (
        <>

            <main className="min-h-screen bg-gray-50  flex-1 overflow-y-auto">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
                    <div className=" px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setSidebarOpen(!sidebarOpen)}
                                        className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-700 hover:text-white"
                                    >
                                        <Menu size={20} />
                                    </button>
                                    <div>
                                        <h2 className="text-2xl font-bold text-black">Dashboard</h2>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </header>

                <div className="px-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 mt-4">
                        {stats.map((stat, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-xl shadow`}
                                    >
                                        <stat.icon className="text-white" size={20} />
                                    </div>
                                    <span className="text-xs font-semibold text-green-600">
                                        {stat.change}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 mb-1">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-6 mt-5">
                        <Link href="/admin/product">
                            <div className="w-full text-lg flex flex-col items-center justify-center gap-2 bg-black rounded-md px-8 py-14">
                                <Package className="w-12 h-12" />
                                <span>Manage Products</span>
                            </div>
                        </Link>
                        <Link href="/admin/deals">
                            <div className="w-full  text-lg flex flex-col items-center justify-center gap-2 bg-black rounded-md px-8 py-14">
                                <Tag className="w-12 h-12" />
                                <span>Manage Deals</span>
                            </div>
                        </Link>
                    </div>

                </div>
            </main>


        </>
    )
}

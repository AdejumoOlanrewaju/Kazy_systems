"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
    Package,
    DollarSign,
    TrendingUp,
    LayoutDashboard,
    Menu,
    Tag,
    Users,
    ShoppingBag,
    AlertTriangle,
    ArrowUpRight,
    Wrench,
    Mail,
} from "lucide-react";
import Link from "next/link";
import { useSidebarStore } from "@/store/sidebarStore";
import { useLaptopStore } from "@/store/laptopStore";
import { getOrders, Order, OrderStatus } from "@/lib/orderService";
import { getLeads, Lead } from "@/lib/leadService";

const STATUS_ORDER: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "failed"];
const STATUS_BAR_COLOR: Record<OrderStatus, string> = {
    pending: "bg-amber-400",
    paid: "bg-emerald-500",
    shipped: "bg-blue-500",
    delivered: "bg-purple-500",
    failed: "bg-red-500",
};
const REVENUE_STATUSES: OrderStatus[] = ["paid", "shipped", "delivered"];

const tsToDate = (ts?: { seconds: number }) => (ts?.seconds ? new Date(ts.seconds * 1000) : null);

// ₦14,550,000 -> "₦14.6M", ₦2,000 -> "₦2k", ₦850 -> "₦850"
const formatCompactNaira = (value: number) => {
    if (value <= 0) return "";
    const formatted = new Intl.NumberFormat("en-NG", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
    return `₦${formatted}`;
};

export default function KazyAdminDashboard() {
    const { laptopStoreData, loadingStore } = useLaptopStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [leadsLoading, setLeadsLoading] = useState(true);
    const { toggleSidebar } = useSidebarStore();

    useEffect(() => {
        const unsubscribe = getOrders((data) => {
            setOrders(data);
            setOrdersLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribe = getLeads((data) => {
            setLeads(data);
            setLeadsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const laptops = laptopStoreData;

    // ---------- derived analytics (all computed from real data, no placeholders) ----------
    const inStockCount = useMemo(() => laptops.filter((l) => l.stockQuantity > 0).length, [laptops]);
    const outOfStockCount = laptops.length - inStockCount;
    const lowStock = useMemo(
        () => laptops.filter((l) => l.stockQuantity > 0 && l.stockQuantity <= 3),
        [laptops]
    );
    const activeDeals = useMemo(() => laptops.filter((l) => l.isDeal).length, [laptops]);
    const inventoryValue = useMemo(
        () => laptops.reduce((sum, l) => sum + l.price * (l.stockQuantity || 0), 0),
        [laptops]
    );

    const totalRevenue = useMemo(
        () => orders.filter((o) => REVENUE_STATUSES.includes(o.status)).reduce((sum, o) => sum + o.total, 0),
        [orders]
    );
    const pendingOrdersCount = useMemo(() => orders.filter((o) => o.status === "pending").length, [orders]);

    const ordersByStatus = useMemo(() => {
        const counts = STATUS_ORDER.map((status) => ({
            status,
            count: orders.filter((o) => o.status === status).length,
        }));
        const max = Math.max(1, ...counts.map((c) => c.count));
        return { counts, max };
    }, [orders]);

    const last7Days = useMemo(() => {
        const days: { label: string; total: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            const nextDay = new Date(d);
            nextDay.setDate(d.getDate() + 1);

            const total = orders
                .filter((o) => REVENUE_STATUSES.includes(o.status))
                .filter((o) => {
                    const created = tsToDate(o.createdAt as any);
                    return created && created >= d && created < nextDay;
                })
                .reduce((sum, o) => sum + o.total, 0);

            days.push({ label: d.toLocaleDateString("en-NG", { weekday: "short" }), total });
        }
        return days;
    }, [orders]);
    const maxDayRevenue = Math.max(1, ...last7Days.map((d) => d.total));

    const recentLeads = useMemo(() => {
        return [...leads]
            .sort((a, b) => (tsToDate(b.createdAt as any)?.getTime() || 0) - (tsToDate(a.createdAt as any)?.getTime() || 0))
            .slice(0, 5);
    }, [leads]);

    const stats = [
        {
            label: "Total Revenue",
            value: `₦${totalRevenue.toLocaleString()}`,
            sub: `${orders.length} orders total`,
            icon: DollarSign,
        },
        {
            label: "Pending Orders",
            value: pendingOrdersCount,
            sub: pendingOrdersCount > 0 ? "Needs attention" : "All caught up",
            icon: ShoppingBag,
            warn: pendingOrdersCount > 0,
        },
        {
            label: "Products in Stock",
            value: `${inStockCount}/${laptops.length}`,
            sub: `${outOfStockCount} out of stock`,
            icon: Package,
            warn: outOfStockCount > 0,
        },
        {
            label: "Active Deals",
            value: activeDeals,
            sub: `₦${inventoryValue.toLocaleString()} inventory value`,
            icon: Tag,
        },
    ];

    const quickLinks = [
        { href: "/admin/product", icon: Package, label: "Manage Products" },
        { href: "/admin/deals", icon: Tag, label: "Manage Deals" },
        { href: "/admin/leads", icon: Users, label: "View Leads" },
        { href: "/admin/order", icon: ShoppingBag, label: "View Orders" },
    ];

    const loading = loadingStore || ordersLoading || leadsLoading;

    return (
        <main className="min-h-screen bg-gray-50 flex-1 overflow-y-auto">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
                <div className="px-4 py-2.5 sm:px-6 sm:py-4">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => toggleSidebar()}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h2 className="text-[18px] sm:text-2xl font-bold text-gray-900">Dashboard</h2>
                        </div>
                    </div>
                </div>
            </header>

            <div className="px-3 py-4 sm:p-6">
                {loading ? (
                    <div className="text-center text-gray-500 py-16">Loading dashboard...</div>
                ) : (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {stats.map((stat, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-amber-50 p-3 rounded-xl">
                                            <stat.icon className="text-amber-600" size={20} />
                                        </div>
                                        {stat.warn && (
                                            <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                                                <AlertTriangle size={12} />
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                    <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* Charts row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Orders by status */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-gray-900">Orders by status</h3>
                                    <span className="text-xs text-gray-400">{orders.length} total</span>
                                </div>
                                {orders.length === 0 ? (
                                    <p className="text-sm text-gray-400 py-6 text-center">No orders yet</p>
                                ) : (
                                    <div className="space-y-4">
                                        {ordersByStatus.counts.map(({ status, count }) => (
                                            <div key={status}>
                                                <div className="flex items-center justify-between text-sm mb-1.5">
                                                    <span className="capitalize text-gray-600 font-medium">{status}</span>
                                                    <span className="text-gray-900 font-semibold">{count}</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${STATUS_BAR_COLOR[status]}`}
                                                        style={{ width: `${(count / ordersByStatus.max) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Revenue last 7 days */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-gray-900">Revenue — last 7 days</h3>
                                    <ArrowUpRight size={16} className="text-amber-500" />
                                </div>
                                <div className="flex items-end justify-between gap-2 h-40">
                                    {last7Days.map((d, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {formatCompactNaira(d.total)}
                                            </span>
                                            <div
                                                className="w-full bg-amber-500 rounded-t-md min-h-[4px] transition-all"
                                                style={{ height: `${(d.total / maxDayRevenue) * 100}%` }}
                                            />
                                            <span className="text-xs text-gray-500">{d.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Low stock + recent leads */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900">Low stock alerts</h3>
                                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                        {lowStock.length}
                                    </span>
                                </div>
                                {lowStock.length === 0 ? (
                                    <p className="text-sm text-gray-400 py-6 text-center">Nothing low on stock right now</p>
                                ) : (
                                    <div className="space-y-3">
                                        {lowStock.slice(0, 5).map((l) => (
                                            <div key={l.dbID || l.id} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-700 truncate pr-2">{l.name}</span>
                                                <span className="text-amber-600 font-semibold whitespace-nowrap">
                                                    {l.stockQuantity} left
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900">Recent leads</h3>
                                    <Link href="/admin/leads" className="text-xs font-semibold text-amber-600 hover:text-amber-700">
                                        View all
                                    </Link>
                                </div>
                                {recentLeads.length === 0 ? (
                                    <p className="text-sm text-gray-400 py-6 text-center">No leads yet</p>
                                ) : (
                                    <div className="space-y-3">
                                        {recentLeads.map((lead) => (
                                            <div key={lead.id} className="flex items-center gap-3 text-sm">
                                                {lead.type === "repair" ? (
                                                    <Wrench size={14} className="text-amber-500 flex-shrink-0" />
                                                ) : (
                                                    <Mail size={14} className="text-amber-500 flex-shrink-0" />
                                                )}
                                                <span className="text-gray-700 truncate flex-1">
                                                    {lead.name || `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || lead.email}
                                                </span>
                                                <span className="text-xs text-gray-400 capitalize">{lead.type}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,_minmax(220px,_1fr))] gap-4">
                            {quickLinks.map(({ href, icon: Icon, label }) => (
                                <Link key={href} href={href}>
                                    <div className="w-full flex flex-col items-center justify-center gap-3 bg-neutral-950 hover:bg-neutral-900 rounded-2xl px-6 py-10 transition-colors group">
                                        <div className="bg-amber-500 group-hover:bg-amber-400 p-3 rounded-xl transition-colors">
                                            <Icon className="w-6 h-6 text-neutral-950" />
                                        </div>
                                        <span className="text-white font-semibold text-sm">{label}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
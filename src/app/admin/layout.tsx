import { LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import SidebarAdmin from "../components/SidebarAdmin";
import FetchDataStore from "../components/FetchDataStore";

// src/app/admin/layout.tsx
export default function KazyAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-gray-950 text-white min-h-screen flex">
            <FetchDataStore />
            {/* You can add a sidebar or admin navbar here if needed */}
            <SidebarAdmin/>
            {children}
        </div>
    );
}

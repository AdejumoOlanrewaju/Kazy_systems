import FetchDataStore from "../components/FetchDataStore";
import AdminPathWrapper from "../components/AdminPathWrapper";

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
            <AdminPathWrapper>
                {children}
            </AdminPathWrapper>
        </div>
    );
}

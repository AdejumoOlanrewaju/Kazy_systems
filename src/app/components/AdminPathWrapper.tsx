"use client"
import { usePathname } from 'next/navigation';
import React from 'react'
import SidebarAdmin from './SidebarAdmin';
import { useAdminAuth } from '@/lib/useAdminAuth';
import LoadingOverlay from './LoadingOVerlay';

const AdminPathWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const isLogin = pathname.startsWith("/admin/login");

  // Login page has no user yet — don't guard it, or no one could log in.
  if (isLogin) {
    return <>{children}</>;
  }

  return <ProtectedAdmin>{children}</ProtectedAdmin>;
}

// Runs the auth check for every non-login admin route.
const ProtectedAdmin = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAdminAuth();

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <>
      <SidebarAdmin />
      {children}
    </>
  );
}

export default AdminPathWrapper
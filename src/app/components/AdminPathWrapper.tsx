"use client"
import { usePathname } from 'next/navigation';
import React from 'react'
import SidebarAdmin from './SidebarAdmin';

const AdminPathWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const isLogin = pathname.startsWith("/admin/login");
  
  return (
    <>
      {!isLogin && <SidebarAdmin />}
      {children}

    </>
  );
}

export default AdminPathWrapper


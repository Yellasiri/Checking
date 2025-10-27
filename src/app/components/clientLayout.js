"use client"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import React from "react";
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const hideSidebar = pathname?.includes("login") || pathname?.includes("register");
  
  // useEffect(() => {
  //   const hasToken = document.cookie.includes("token=")
  //   const isLogin = pathname.startsWith("/login")

  //   if (!hasToken && !isLogin) {
  //     router.replace("/login")
  //   }
    
  // }, [pathname])
  return (
      <div className="flex min-h-screen">
        {!hideSidebar && <Sidebar />}
        <main className="flex-1">
          {children}
        </main>
      </div>
  );
};


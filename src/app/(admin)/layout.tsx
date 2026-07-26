"use client";

import React, { useEffect } from "react";
import { useRole } from "@/context/RoleContext";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/navigation/AdminSidebar";
import { AdminHeader } from "@/components/navigation/AdminHeader";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isLoading, signOut } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role !== "admin") {
      router.push("/login");
    }
  }, [role, isLoading, router]);

  // 15-minute Inactivity Session Timeout
  useEffect(() => {
    if (role !== "admin") return;

    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        console.log("Admin inactive for 15 minutes. Automatic logout triggered.");
        signOut().then(() => {
          router.push("/login?timeout=true");
        });
      }, 15 * 60 * 1000); // 15 minutes
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    
    events.forEach((event) => {
      window.addEventListener(event, resetTimeout);
    });

    // Start timer on load
    resetTimeout();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, [role, signOut, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] dark:bg-[#070a09] font-sans transition-colors duration-300">
        <div className="text-center space-y-3.5">
          <Loader2 className="w-8 h-8 animate-spin text-red-800 dark:text-[#D4AF37] mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Verifying Administrator Authorization...</p>
        </div>
      </div>
    );
  }

  if (role !== "admin") {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#fbfbf9] dark:bg-[#070a09] font-sans text-slate-700 dark:text-slate-250 transition-colors duration-300">
      <AdminSidebar />
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        <AdminHeader />
        <main className="flex-grow p-6 md:p-8 overflow-y-auto bg-slate-50/50 dark:bg-[#080c0a]/50">
          {children}
        </main>
      </div>
    </div>
  );
}

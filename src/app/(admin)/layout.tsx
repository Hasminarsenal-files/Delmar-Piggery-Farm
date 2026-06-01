"use client";

import React, { useEffect } from "react";
import { useRole } from "@/context/RoleContext";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/navigation/AdminSidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isLoading } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role !== "admin") {
      router.push("/login");
    }
  }, [role, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] font-sans">
        <div className="text-center space-y-3.5">
          <Loader2 className="w-8 h-8 animate-spin text-red-800 mx-auto" />
          <p className="text-xs text-slate-500 font-bold">Verifying Administrator Authorization...</p>
        </div>
      </div>
    );
  }

  if (role !== "admin") {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#fafaf9] font-sans">
      <AdminSidebar />
      <main className="flex-grow flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}

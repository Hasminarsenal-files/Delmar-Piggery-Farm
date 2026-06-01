"use client";

import React, { useEffect } from "react";
import { useRole } from "@/context/RoleContext";
import { useRouter } from "next/navigation";
import { CustomerSidebar } from "@/components/navigation/CustomerSidebar";
import { Loader2 } from "lucide-react";
import { AIChatWidget } from "@/components/ui/AIChatWidget";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isLoading } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role === "guest") {
      router.push("/login");
    }
  }, [role, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f6] font-sans">
        <div className="text-center space-y-3.5">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
          <p className="text-xs text-slate-500 font-bold">Synchronizing Client Portal...</p>
        </div>
      </div>
    );
  }

  if (role === "guest") {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f7f8f6] font-sans">
      <CustomerSidebar />
      <main className="flex-grow flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        {children}
      </main>
      <AIChatWidget />
    </div>
  );
}

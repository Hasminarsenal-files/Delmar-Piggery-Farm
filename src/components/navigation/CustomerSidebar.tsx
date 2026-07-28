"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import {
  LayoutDashboard,
  ShoppingBag,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  PiggyBank,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

export const CustomerSidebar: React.FC = () => {
  const pathname = usePathname();
  const { setRole, userName, userEmail, notifications } = useRole();
  const [isOpen, setIsOpen] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const links = [
    { name: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
    { name: "My Orders", href: "/customer/orders", icon: ShoppingBag },
    { name: "My Paluwagan", href: "/customer/paluwagan", icon: PiggyBank },
    { name: "Paluwagan Membership", href: "/customer/paluwagan-membership", icon: ShieldCheck },
    { name: "Payment Methods", href: "/customer/payment-methods", icon: CreditCard },
    {
      name: "Notifications",
      href: "/customer/notifications",
      icon: Bell,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
    },
    { name: "Profile", href: "/customer/profile", icon: User },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-primary-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 font-sans">
        <Link href="/" className="flex items-center bg-white px-2 py-1 rounded-lg">
          <img src="/logo.jpg" alt="Delmar Piggery Farm Logo" className="h-8 w-auto object-contain" />
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-primary-700 rounded-lg transition-colors cursor-pointer"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-35 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white border-r border-[#e6e8e6] w-64 flex flex-col z-40 transition-transform duration-300 md:translate-x-0 md:static md:h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="h-20 border-b border-[#e6e8e6] px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo.jpg" alt="Delmar Piggery Farm Logo" className="h-12 w-auto object-contain" />
          </Link>
          <span className="text-[9px] font-bold text-primary-650 bg-primary-50 px-2 py-0.5 rounded-full uppercase tracking-wider font-sans">Portal</span>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-50 font-sans">
          <div className="bg-primary-50/50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold font-heading text-sm">
              {userName ? userName.split(" ").map(n => n[0]).join("") : "U"}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-800 truncate">{userName}</h4>
              <p className="text-[10px] font-medium text-slate-500 truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto font-sans">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? "bg-[#1B4332] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Sign Out */}
        <div className="p-4 border-t border-[#e6e8e6] font-sans">
          <button
            onClick={() => setRole("guest")}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

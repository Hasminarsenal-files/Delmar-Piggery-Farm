"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import {
  LayoutDashboard,
  ShoppingBag,
  CalendarCheck,
  Bell,
  User,
  LogOut,
  PiggyBank,
  Menu,
  X,
} from "lucide-react";

export const CustomerSidebar: React.FC = () => {
  const pathname = usePathname();
  const { setRole, userName, userEmail, notifications } = useRole();
  const [isOpen, setIsOpen] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const links = [
    { name: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
    { name: "My Orders", href: "/customer/orders", icon: ShoppingBag },
    { name: "My Reservations", href: "/customer/reservations", icon: CalendarCheck },
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
      <div className="md:hidden bg-primary-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-accent-light" />
          <span className="font-heading font-bold text-xs tracking-wide">Delmar Piggery Farm</span>
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
        <div className="h-20 border-b border-[#e6e8e6] px-6 flex items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary-600 text-white p-2 rounded-xl">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading text-xs font-bold text-primary-800 tracking-tight block">DELMAR PIGGERY FARM</span>
              <span className="text-[9px] font-bold text-accent-light uppercase tracking-wider block">Customer Space</span>
            </div>
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-50">
          <div className="bg-primary-50/50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold font-heading text-sm">
              {userName.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-800 truncate">{userName}</h4>
              <p className="text-[10px] font-medium text-slate-500 truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive(link.href)
                    ? "bg-primary-600 text-white shadow-md shadow-primary-600/10"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive(link.href) ? "text-white" : "text-slate-400"}`} />
                  {link.name}
                </span>
                {link.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    isActive(link.href) ? "bg-white text-primary-600" : "bg-red-50 text-red-600"
                  }`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#e6e8e6]">
          <button
            onClick={() => {
              setRole("guest");
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

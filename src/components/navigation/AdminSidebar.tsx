"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import {
  LayoutDashboard,
  ClipboardList,
  Heart,
  TrendingUp,
  DollarSign,
  BarChart3,
  ClipboardCheck,
  Truck,
  Utensils,
  Users,
  CreditCard,
  Landmark,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Coins,
  Bell,
  Layers,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { setRole, userName, userEmail, orders } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Submenu states
  const [isPiggeryExpanded, setIsPiggeryExpanded] = useState(true);
  const [isFoodServicesExpanded, setIsFoodServicesExpanded] = useState(true);
  const [isPaluwaganExpanded, setIsPaluwaganExpanded] = useState(true);
  const [isCustomerExpanded, setIsCustomerExpanded] = useState(true);
  const [isAccountingExpanded, setIsAccountingExpanded] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCollapsed = localStorage.getItem("admin_sidebar_collapsed");
      if (savedCollapsed) {
        setIsCollapsed(savedCollapsed === "true");
      }
    }
  }, []);

  const handleCollapseToggle = () => {
    const nextCollapsedState = !isCollapsed;
    setIsCollapsed(nextCollapsedState);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_sidebar_collapsed", String(nextCollapsedState));
    }
  };

  // Pending counts for badges
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "Pending" || o.status === "Processing"
  ).length;

  const piggeryLinks = [
    { name: "Pig Inventory", href: "/admin/piggery/inventory", icon: ClipboardList },
    { name: "Breeding", href: "/admin/piggery/breeding", icon: Heart },
    { name: "Piglet Sales", href: "/admin/piggery/piglet-sales", icon: TrendingUp },
    { name: "Expenses", href: "/admin/piggery/expenses", icon: DollarSign },
    { name: "Reports", href: "/admin/piggery/reports", icon: BarChart3 },
  ];

  const foodServicesLinks = [
    { 
      name: "Orders", 
      href: "/admin/food-services/orders", 
      icon: ClipboardCheck,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    { name: "Reservations", href: "/admin/reservations", icon: Calendar },
    { name: "Catering", href: "/admin/food-services/catering", icon: Utensils },
    { name: "Deliveries", href: "/admin/food-services/deliveries", icon: Truck },
    { name: "Sales Reports", href: "/admin/food-services/reports", icon: BarChart3 },
  ];

  const paluwaganLinks = [
    { name: "Applications", href: "/admin/paluwagan-applications", icon: ClipboardCheck },
    { name: "Members", href: "/admin/paluwagan-members", icon: Users },
    { name: "Batches", href: "/admin/batches", icon: Layers },
    { name: "Orders", href: "/admin/food-services/orders", icon: ClipboardList },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Collection Ledger", href: "/admin/paluwagan-ledger", icon: Coins },
  ];

  const customerLinks = [
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
  ];

  const accountingLinks = [
    { name: "Income", href: "/admin/payments", icon: DollarSign },
    { name: "Expenses", href: "/admin/accounting", icon: DollarSign },
    { name: "Financial Reports", href: "/admin/accounting", icon: BarChart3 },
  ];

  const isActive = (href: string) => pathname === href;
  const isParentActive = (links: { href: string }[]) => links.some(link => pathname === link.href);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white text-slate-800 px-4 py-3.5 flex items-center justify-between sticky top-0 z-35 border-b border-emerald-100 shadow-sm">
        <Link href="/" className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl border border-emerald-200 transition-colors duration-200">
          <img src="/logo.jpg" alt="SFS Logo" className="h-7 w-auto object-contain rounded-md" />
          <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase text-emerald-800">SFS Admin</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer"
        >
          {isOpen ? <X className="w-5 h-5 text-emerald-700" /> : <Menu className="w-5 h-5 text-emerald-700" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <motion.aside
        animate={{ width: isCollapsed ? 76 : 260 }}
        transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
        className={`fixed inset-y-0 left-0 bg-white border-r border-emerald-100 flex flex-col z-45 transition-transform duration-300 md:translate-x-0 md:static md:h-screen text-slate-800 shadow-lg shadow-emerald-900/5 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className={`h-20 border-b border-emerald-100 px-4 flex items-center justify-between gap-3 shrink-0 bg-gradient-to-r from-emerald-50 to-white ${isCollapsed ? "justify-center" : ""}`}>
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex items-center justify-center bg-white p-1 rounded-xl shadow-sm border border-emerald-100 shrink-0">
              <img src="/logo.jpg" alt="Delmar Logo" className="h-9 w-auto object-contain rounded-md" />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="text-left font-heading text-[10px] tracking-widest text-emerald-950 font-extrabold uppercase"
              >
                BUSINESS <span className="text-emerald-600 block text-[9px] tracking-normal font-semibold">Management System</span>
              </motion.div>
            )}
          </Link>

          {!isCollapsed && (
            <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 font-mono">
              ERP
            </span>
          )}
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-emerald-100 shrink-0">
          <div className={`bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 rounded-2xl p-3 flex items-center gap-3 ${isCollapsed ? "justify-center p-2.5" : ""}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white flex items-center justify-center font-heading font-extrabold text-xs shrink-0 shadow-sm">
              {userName.split(" ").map(n => n[0]).join("")}
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="overflow-hidden"
              >
                <h4 className="text-xs font-bold text-slate-800 truncate">{userName}</h4>
                <p className="text-[9px] font-semibold text-emerald-600 truncate">{userEmail}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-grow px-3 py-4 space-y-3 overflow-y-auto font-sans scrollbar-thin">
          
          {/* 1. Dashboard */}
          <Link
            href="/admin/dashboard"
            onClick={() => setIsOpen(false)}
            className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              isActive("/admin/dashboard")
                ? "bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white shadow-md shadow-emerald-950/20"
                : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"
            }`}
          >
            {isActive("/admin/dashboard") && (
              <motion.div
                layoutId="sidebarActiveIndicator"
                className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white/60 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="flex items-center gap-3">
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${isActive("/admin/dashboard") ? "text-white" : "text-emerald-600 group-hover:text-emerald-700"}`} />
              {!isCollapsed && <span>Dashboard</span>}
            </span>
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none shadow-xl z-50 whitespace-nowrap">
                Dashboard
              </div>
            )}
          </Link>

          <hr className="border-emerald-100/60 my-2" />

          {/* DELMAR PIGGERY FARM */}
          <div className="space-y-1">
            {!isCollapsed ? (
              <button
                onClick={() => setIsPiggeryExpanded(!isPiggeryExpanded)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors ${
                  isParentActive(piggeryLinks) ? "text-emerald-800" : ""
                }`}
              >
                <span>DELMAR PIGGERY FARM</span>
                {isPiggeryExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            ) : (
              <div className="flex justify-center text-[8px] font-bold text-slate-350 select-none pb-1">PIG</div>
            )}
            <AnimatePresence initial={false}>
              {(isPiggeryExpanded || isCollapsed) && (
                <motion.div
                  initial={isCollapsed ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`space-y-1 overflow-hidden ${!isCollapsed ? "pl-2.5" : ""}`}
                >
                  {piggeryLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-[11.5px] font-bold transition-all relative ${
                          active
                            ? "bg-emerald-50 text-emerald-900 shadow-xs border-l-3 border-[#1B4332]"
                            : "text-slate-600 hover:bg-emerald-50/40 hover:text-emerald-900"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-[#1B4332]" : "text-emerald-600/75 group-hover:text-emerald-700"}`} />
                          {!isCollapsed && <span>{link.name}</span>}
                        </span>
                        {isCollapsed && (
                          <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none shadow-xl z-50 whitespace-nowrap">
                            {link.name}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <hr className="border-emerald-100/60 my-2" />

          {/* SAVORLICIOUS FOOD SERVICES */}
          <div className="space-y-1">
            {!isCollapsed ? (
              <button
                onClick={() => setIsFoodServicesExpanded(!isFoodServicesExpanded)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors ${
                  isParentActive(foodServicesLinks) ? "text-emerald-800" : ""
                }`}
              >
                <span>SAVORLICIOUS FOOD SERVICES</span>
                {isFoodServicesExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            ) : (
              <div className="flex justify-center text-[8px] font-bold text-slate-350 select-none pb-1">SFS</div>
            )}
            <AnimatePresence initial={false}>
              {(isFoodServicesExpanded || isCollapsed) && (
                <motion.div
                  initial={isCollapsed ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`space-y-1 overflow-hidden ${!isCollapsed ? "pl-2.5" : ""}`}
                >
                  {foodServicesLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-[11.5px] font-bold transition-all relative ${
                          active
                            ? "bg-emerald-50 text-emerald-900 shadow-xs border-l-3 border-[#1B4332]"
                            : "text-slate-600 hover:bg-emerald-50/40 hover:text-emerald-900"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-[#1B4332]" : "text-emerald-600/75 group-hover:text-emerald-700"}`} />
                          {!isCollapsed && <span>{link.name}</span>}
                        </span>
                        {link.badge !== undefined && !isCollapsed && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#1B4332] text-white">
                            {link.badge}
                          </span>
                        )}
                        {isCollapsed && (
                          <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none shadow-xl z-50 whitespace-nowrap">
                            {link.name}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <hr className="border-emerald-100/60 my-2" />

          {/* PALUWAGAN MANAGEMENT */}
          <div className="space-y-1">
            {!isCollapsed ? (
              <button
                onClick={() => setIsPaluwaganExpanded(!isPaluwaganExpanded)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors ${
                  isParentActive(paluwaganLinks) ? "text-emerald-800" : ""
                }`}
              >
                <span>PALUWAGAN MANAGEMENT</span>
                {isPaluwaganExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            ) : (
              <div className="flex justify-center text-[8px] font-bold text-slate-350 select-none pb-1">PAL</div>
            )}
            <AnimatePresence initial={false}>
              {(isPaluwaganExpanded || isCollapsed) && (
                <motion.div
                  initial={isCollapsed ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`space-y-1 overflow-hidden ${!isCollapsed ? "pl-2.5" : ""}`}
                >
                  {paluwaganLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-[11.5px] font-bold transition-all relative ${
                          active
                            ? "bg-emerald-50 text-emerald-900 shadow-xs border-l-3 border-[#1B4332]"
                            : "text-slate-600 hover:bg-emerald-50/40 hover:text-emerald-900"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-[#1B4332]" : "text-emerald-600/75 group-hover:text-emerald-700"}`} />
                          {!isCollapsed && <span>{link.name}</span>}
                        </span>
                        {isCollapsed && (
                          <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none shadow-xl z-50 whitespace-nowrap">
                            {link.name}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <hr className="border-emerald-100/60 my-2" />

          {/* CUSTOMER MANAGEMENT */}
          <div className="space-y-1">
            {!isCollapsed ? (
              <button
                onClick={() => setIsCustomerExpanded(!isCustomerExpanded)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors ${
                  isParentActive(customerLinks) ? "text-emerald-800" : ""
                }`}
              >
                <span>CUSTOMER MANAGEMENT</span>
                {isCustomerExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            ) : (
              <div className="flex justify-center text-[8px] font-bold text-slate-350 select-none pb-1">CUST</div>
            )}
            <AnimatePresence initial={false}>
              {(isCustomerExpanded || isCollapsed) && (
                <motion.div
                  initial={isCollapsed ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`space-y-1 overflow-hidden ${!isCollapsed ? "pl-2.5" : ""}`}
                >
                  {customerLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-[11.5px] font-bold transition-all relative ${
                          active
                            ? "bg-emerald-50 text-emerald-900 shadow-xs border-l-3 border-[#1B4332]"
                            : "text-slate-600 hover:bg-emerald-50/40 hover:text-emerald-900"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-[#1B4332]" : "text-emerald-600/75 group-hover:text-emerald-700"}`} />
                          {!isCollapsed && <span>{link.name}</span>}
                        </span>
                        {isCollapsed && (
                          <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none shadow-xl z-50 whitespace-nowrap">
                            {link.name}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <hr className="border-emerald-100/60 my-2" />

          {/* ACCOUNTING */}
          <div className="space-y-1">
            {!isCollapsed ? (
              <button
                onClick={() => setIsAccountingExpanded(!isAccountingExpanded)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors ${
                  isParentActive(accountingLinks) ? "text-emerald-800" : ""
                }`}
              >
                <span>ACCOUNTING</span>
                {isAccountingExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            ) : (
              <div className="flex justify-center text-[8px] font-bold text-slate-350 select-none pb-1">ACCT</div>
            )}
            <AnimatePresence initial={false}>
              {(isAccountingExpanded || isCollapsed) && (
                <motion.div
                  initial={isCollapsed ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`space-y-1 overflow-hidden ${!isCollapsed ? "pl-2.5" : ""}`}
                >
                  {accountingLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-[11.5px] font-bold transition-all relative ${
                          active
                            ? "bg-emerald-50 text-emerald-900 shadow-xs border-l-3 border-[#1B4332]"
                            : "text-slate-600 hover:bg-emerald-50/40 hover:text-emerald-900"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-[#1B4332]" : "text-emerald-600/75 group-hover:text-emerald-700"}`} />
                          {!isCollapsed && <span>{link.name}</span>}
                        </span>
                        {isCollapsed && (
                          <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none shadow-xl z-50 whitespace-nowrap">
                            {link.name}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <hr className="border-emerald-100/60 my-2" />

          {/* SETTINGS */}
          <div className="space-y-1">
            <Link
              key="Settings"
              href="/admin/settings"
              onClick={() => setIsOpen(false)}
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                isActive("/admin/settings")
                  ? "bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white shadow-md shadow-emerald-950/25"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"
              }`}
            >
              <span className="flex items-center gap-3">
                <SettingsIcon className={`w-4 h-4 shrink-0 ${isActive("/admin/settings") ? "text-white" : "text-emerald-600 group-hover:text-emerald-700"}`} />
                {!isCollapsed && <span>SETTINGS</span>}
              </span>
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none shadow-xl z-50 whitespace-nowrap">
                  Settings
                </div>
              )}
            </Link>
          </div>

        </nav>

        {/* Desktop Collapse / Expand Button */}
        <div className="hidden md:flex justify-end p-3.5 border-t border-emerald-100 shrink-0">
          <button
            onClick={handleCollapseToggle}
            className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 rounded-xl text-emerald-600 hover:text-emerald-800 transition-all cursor-pointer flex items-center justify-center"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Logout Portal */}
        <div className="p-3 border-t border-emerald-100 shrink-0">
          <button
            onClick={() => {
              setRole("guest");
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-650 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer border border-transparent hover:border-red-100"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Logout Portal
              </motion.span>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

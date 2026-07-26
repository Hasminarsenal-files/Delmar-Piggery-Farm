"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRole } from "@/context/RoleContext";
import { 
  Bell, 
  Search, 
  User, 
  ChevronDown, 
  LogOut, 
  Sparkles, 
  Check, 
  Calendar, 
  Shield, 
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export const AdminHeader: React.FC = () => {
  const { 
    userName, 
    userEmail, 
    role, 
    setRole, 
    notifications, 
    markNotificationRead, 
    clearNotifications,
    toast,
    showToast
  } = useRole();
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [systemTime, setSystemTime] = useState("");
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.read);
  const unreadCount = unreadNotifs.length;

  // Format date and time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      };
      setCurrentDate(now.toLocaleDateString('en-US', options));
      setSystemTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-emerald-100 px-6 py-4 flex items-center justify-between shadow-sm shadow-emerald-900/5">
      
      {/* Left: Date / Search */}
      <div className="flex items-center gap-6 flex-1 max-w-xl">
        {/* Date block */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-emerald-50/80 border border-emerald-100 py-1.5 px-3 rounded-xl">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>{currentDate}</span>
          <span className="text-slate-300 mx-1">|</span>
          <span className="font-mono text-[10px] tracking-wider text-slate-600">{systemTime}</span>
        </div>

        {/* Executive search panel */}
        <div className={`relative flex-grow max-w-xs transition-all duration-300 ${searchFocused ? "max-w-sm" : ""}`}>
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${searchFocused ? "text-emerald-600" : "text-slate-400"}`} />
          <input
            type="text"
            placeholder="Search bookings, hogs, reports..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold bg-slate-50 text-slate-800 transition-all duration-300 shadow-sm"
          />
        </div>
      </div>

      {/* Right: Notifications, Quick Actions, Profile */}
      <div className="flex items-center gap-4">
        
        {/* Biosecurity Tag Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 py-1.5 px-3 rounded-xl shrink-0">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          <span>BIOSECURITY ACTIVE</span>
        </div>

        {/* Notifications Icon with dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`p-2.5 rounded-xl border bg-white hover:bg-slate-50 transition-colors relative cursor-pointer shadow-sm ${isNotifOpen ? "border-emerald-400 bg-emerald-50" : "border-slate-200"}`}
            aria-label="Toggle notifications center"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 transform origin-top-right"
              >
                {/* Notification Dropdown Header */}
                <div className="p-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-extrabold tracking-wide uppercase">Farm Operations Alerts</h4>
                    <p className="text-[10px] text-emerald-100 font-semibold">{unreadCount} unread system notices</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => clearNotifications()}
                      className="text-[9px] font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 font-semibold">
                      All clean! No active system alerts.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-3.5 text-xs flex gap-3 ${n.read ? "bg-white" : "bg-emerald-50/50"}`}
                      >
                        <div className="shrink-0 mt-1">
                          <span className={`w-2 h-2 rounded-full block ${
                            n.type === "system" ? "bg-red-500" :
                            n.type === "order" ? "bg-emerald-500" :
                            "bg-amber-500"
                          }`} />
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="font-extrabold text-slate-800 flex justify-between gap-2">
                            <span>{n.title}</span>
                            {!n.read && (
                              <button 
                                onClick={() => markNotificationRead(n.id)}
                                className="text-[9px] font-bold text-emerald-700 hover:underline cursor-pointer flex items-center gap-0.5 shrink-0"
                              >
                                <Check className="w-2.5 h-2.5" /> Mark read
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-normal font-semibold">{n.message}</p>
                          <span className="text-[9px] text-slate-400 font-bold block">{n.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Card Trigger */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-heading font-extrabold text-xs shadow-sm">
              {userName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="hidden md:block text-left">
              <h4 className="text-[11px] font-extrabold text-slate-800 leading-none">{userName}</h4>
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">Administrator</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2.5 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2.5 z-50 transform origin-top-right space-y-1.5"
              >
                {/* Admin info block */}
                <div className="p-2 border-b border-slate-100">
                  <h4 className="text-xs font-extrabold text-slate-800">{userName}</h4>
                  <p className="text-[9.5px] font-medium text-slate-500 truncate">{userEmail}</p>
                </div>

                {/* Dashboard Shortcut */}
                <Link href="/admin/dashboard" onClick={() => setIsProfileOpen(false)} className="block">
                  <span className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors cursor-pointer">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span>Control Center</span>
                  </span>
                </Link>

                {/* Role Switch Shortcut */}
                <button
                  onClick={() => {
                    setRole("customer");
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Switch to Customer</span>
                </button>

                {/* Logout */}
                <button
                  onClick={() => {
                    setRole("guest");
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Logout Portal</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
      {/* Toast Alert Popups */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 flex items-start gap-3 p-4 rounded-2xl shadow-2xl border max-w-sm backdrop-blur-md transition-colors ${
              toast.type === "warning"
                ? "bg-red-550/95 text-white border-red-400"
                : toast.type === "info"
                ? "bg-indigo-650/95 text-white border-indigo-500"
                : "bg-[#111c16]/95 text-white border-emerald-950/30"
            }`}
          >
            <div className="space-y-1 flex-1">
              <h5 className="font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> {toast.title}
              </h5>
              <p className="text-[11px] text-slate-100/90 leading-relaxed font-semibold">{toast.message}</p>
            </div>
            <button 
              onClick={() => showToast("", "")} 
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { Menu, X, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { role, userName } = useRole();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Products", href: "/products" },
    { name: "Services", href: "/services" },
    { name: "Permits", href: "/gallery" },
    { name: "FAQs", href: "/faqs" },
    { name: "Contact Us", href: "/contact" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md shadow-emerald-900/5 border-b border-emerald-100"
          : "bg-white/90 backdrop-blur-sm border-b border-emerald-100/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center h-14">
          {/* Logo Badge */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group gap-3">
              <div className="flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white p-1 rounded-xl shadow-sm border border-emerald-100 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/logo.jpg"
                  alt="Delmar Logo"
                  className="h-10 w-auto object-contain rounded-md"
                />
              </div>
              <span className="block font-heading font-extrabold text-[10px] sm:text-sm tracking-widest text-emerald-900 uppercase">
                DELMAR BUSINESS MANAGEMENT
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 font-sans">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide uppercase transition-colors duration-300 ${
                  isActive(link.href)
                    ? "text-emerald-700 font-extrabold"
                    : "text-slate-600 hover:text-emerald-700"
                }`}
              >
                <span className="relative z-10">{link.name}</span>
                {isActive(link.href) && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-emerald-50 border border-emerald-200 rounded-xl"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Authentication Actions */}
          <div className="hidden md:flex items-center gap-3">
            {role !== "guest" ? (
              <div className="flex items-center gap-3">
                <Link
                  href={role === "admin" ? "/admin/dashboard" : "/customer/dashboard"}
                  className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition-all"
                >
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{userName}</span>
                </Link>
                <Link href={role === "admin" ? "/admin/dashboard" : "/customer/dashboard"}>
                  <Button size="sm" variant="secondary" className="shadow-lg shadow-emerald-600/10 text-white font-bold bg-emerald-600 hover:bg-emerald-700 border-none">
                    Go to Portal
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors">
                  Sign In
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="text-white font-bold bg-emerald-600 hover:bg-emerald-700 border-none shadow-md shadow-emerald-600/20"
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sliding Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-full left-0 w-full mt-2 px-4 z-40 md:hidden`}
          >
            <div className="border border-emerald-100 bg-white/98 backdrop-blur-xl rounded-2xl p-5 shadow-2xl shadow-emerald-900/10 space-y-4 font-sans text-slate-800">
              <div className="space-y-1.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive(link.href)
                        ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-emerald-700"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="h-px bg-emerald-100" />

              {role !== "guest" ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-emerald-800 px-4">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-bold">{userName}</span>
                  </div>
                  <Link
                    href={role === "admin" ? "/admin/dashboard" : "/customer/dashboard"}
                    onClick={() => setIsOpen(false)}
                    className="block"
                  >
                    <Button className="w-full text-white font-bold bg-emerald-600 hover:bg-emerald-700 border-none" size="md">
                      Go to Portal
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50" size="md">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full text-white font-bold bg-emerald-600 hover:bg-emerald-700 border-none" size="md">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

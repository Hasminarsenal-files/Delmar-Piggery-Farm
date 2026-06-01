"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { Menu, X, PiggyBank, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { role, userName } = useRole();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Products", href: "/products" },
    { name: "Services", href: "/services" },
    { name: "Gallery", href: "/gallery" },
    { name: "FAQs", href: "/faqs" },
    { name: "Contact Us", href: "/contact" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#e6e8e6] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform duration-300">
                <PiggyBank className="w-6 h-6" />
              </div>
              <div>
                <span className="font-heading text-lg font-bold text-primary-800 leading-none block">DELMAR</span>
                <span className="text-[10px] font-bold text-accent-light uppercase tracking-wider block">Piggery Farm</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1.5 font-sans">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                  isActive(link.href)
                    ? "text-primary-700 bg-primary-50"
                    : "text-slate-600 hover:text-primary-600 hover:bg-slate-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Authentication Actions */}
          <div className="hidden md:flex items-center gap-3">
            {role !== "guest" ? (
              <div className="flex items-center gap-3">
                <Link
                  href={role === "admin" ? "/admin/dashboard" : "/customer/dashboard"}
                  className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all"
                >
                  <User className="w-3.5 h-3.5 text-primary-600" />
                  <span>{userName}</span>
                </Link>
                <Link href={role === "admin" ? "/admin/dashboard" : "/customer/dashboard"}>
                  <Button size="sm" variant="primary">
                    Go to Portal
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
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
              className="p-2 rounded-xl text-slate-600 hover:text-primary-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sliding Navigation Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[#e6e8e6] bg-white w-full animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="px-4 py-4 space-y-1.5 font-sans">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive(link.href)
                    ? "text-primary-700 bg-primary-50"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="h-px bg-slate-100 my-4" />

            {role !== "guest" ? (
              <div className="space-y-3 px-4">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <User className="w-4 h-4 text-primary-600" />
                  <span className="text-xs font-bold">{userName}</span>
                </div>
                <Link
                  href={role === "admin" ? "/admin/dashboard" : "/customer/dashboard"}
                  onClick={() => setIsOpen(false)}
                  className="block"
                >
                  <Button className="w-full" size="md">
                    Go to Portal
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5 px-2">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full" size="md">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full" size="md">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Globe, Share2 } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-primary-950 text-slate-300 font-sans overflow-hidden">
      {/* Subtle Glowing Accent Border Top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-light/50 to-transparent shadow-sm" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-6">
            <Link href="/" className="inline-block bg-white p-2.5 rounded-2xl shadow-lg border border-primary-800/10">
              <img 
                src="/logo.jpg" 
                alt="Savorlicious Food Services Logo" 
                className="h-14 w-auto object-contain rounded-md"
              />
            </Link>
            <div className="space-y-2">
              <span className="block font-heading font-extrabold text-sm tracking-widest text-slate-100 uppercase">
                Savorlicious Food Services
              </span>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Premium-grade piglets, quality fattening stock, and crispylicious lechon. Redefining modern swine farming and sustainable husbandry standards.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <a href="#" className="p-2.5 bg-primary-900/60 hover:bg-primary-900 border border-primary-800/30 hover:border-accent-light hover:text-accent-light text-slate-300 rounded-xl transition-all duration-300 cursor-pointer">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 bg-primary-900/60 hover:bg-primary-900 border border-primary-800/30 hover:border-accent-light hover:text-accent-light text-slate-300 rounded-xl transition-all duration-300 cursor-pointer">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-5">Quick Links</h4>
            <ul className="space-y-3 text-xs font-semibold">
              <li>
                <Link href="/" className="hover:text-accent-light transition-colors duration-300">Home</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-accent-light transition-colors duration-300">About Us</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-accent-light transition-colors duration-300">Our Products</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-accent-light transition-colors duration-300">Catering Services</Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-accent-light transition-colors duration-300">Permits</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-accent-light transition-colors duration-300 text-emerald-400">Terms & Policies</Link>
              </li>
            </ul>
          </div>

          {/* Offerings */}
          <div className="md:col-span-2">
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-5">Our Offerings</h4>
            <ul className="space-y-3 text-xs font-semibold">
              <li>
                <Link href="/products" className="hover:text-accent-light transition-colors duration-300">Weanling Piglets</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-accent-light transition-colors duration-300">Fattening Hogs</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-accent-light transition-colors duration-300">Fresh Pork Cuts</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-accent-light transition-colors duration-300">Crispylicious Lechon</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-accent-light transition-colors duration-300">Catering Packages</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-5">Get In Touch</h4>
            <ul className="space-y-3.5 text-xs">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-accent-light shrink-0 mt-0.5" />
                <span className="text-slate-400 font-medium">Purok Lapu-Lapu, Tickwas, Dumalinao, Zamboanga del Sur</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-accent-light shrink-0" />
                <span className="text-slate-400 font-medium">09464544973</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent-light shrink-0" />
                <span className="text-slate-400 font-medium">delmararsenal103@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="h-px bg-primary-900/60 my-10" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-semibold">
          <span>&copy; {new Date().getFullYear()} Savorlicious Food Services. All Rights Reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400 transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors duration-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

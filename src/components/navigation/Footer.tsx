"use client";

import React from "react";
import Link from "next/link";
import { PiggyBank, Mail, Phone, MapPin, Globe, Share2 } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-900 text-slate-300 font-sans border-t border-primary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary-600 text-white p-2 rounded-xl">
                <PiggyBank className="w-6 h-6" />
              </div>
              <div>
                <span className="font-heading text-lg font-bold text-white leading-none block">DELMAR</span>
                <span className="text-[10px] font-bold text-accent-light uppercase tracking-wider block">Piggery Farm</span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Providing premium-grade piglets, quality fattening pigs, and crispylicious lechon catering services. Committed to sustainable and clean livestock breeding since 2018.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="p-2 bg-primary-800 hover:bg-primary-700 text-white rounded-lg transition-colors cursor-pointer">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-primary-800 hover:bg-primary-700 text-white rounded-lg transition-colors cursor-pointer">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/" className="hover:text-accent-light transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-accent-light transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-accent-light transition-colors">Our Products</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-accent-light transition-colors">Catering Services</Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-accent-light transition-colors">Farm Gallery</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-4">Our Offerings</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/products" className="hover:text-accent-light transition-colors">Weanling Piglets</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-accent-light transition-colors">Fattening Breeders</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-accent-light transition-colors">Fresh Pork Meat Cuts</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-accent-light transition-colors">Crispylicious Lechon</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-accent-light transition-colors">Catering Food Packages</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3.5">
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-2">Get In Touch</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-accent-light shrink-0 mt-0.5" />
                <span className="text-slate-400">Purok 4, Brgy. San Juan, Aliaga, Nueva Ecija, Philippines</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-accent-light shrink-0" />
                <span className="text-slate-400">+63 912 345 6789</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-accent-light shrink-0" />
                <span className="text-slate-400">info@delmarpiggery.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="h-px bg-primary-800 my-10" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-semibold">
          <span>&copy; {new Date().getFullYear()} Delmar Piggery Farm. All Rights Reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Award, CheckCircle2, ShieldCheck, Soup, CakeSlice, UtensilsCrossed } from "lucide-react";

export default function ServicesPage() {
  const { addReservation } = useRole();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<{ title: string; price: number } | null>(null);
  const [reserveQty, setReserveQty] = useState(1);
  const [reserveDate, setReserveDate] = useState("");
  const [reserveSuccess, setReserveSuccess] = useState(false);

  const serviceCategories = [
    {
      title: "Crispylicious Lechon",
      icon: Award,
      tagline: "Our Signature Spit-Roasted Pig",
      description: "Delmar's lechon is roasted using slow-burning charcoal, yielding incredibly golden-crisp skin and seasoned meat infused with lemongrass, garlic, onions, and local spices.",
      packages: [
        { name: "Small Lechon (12kg - 14kg)", price: 8500, servings: "Suitable for 15-20 guests" },
        { name: "Medium Lechon (15kg - 18kg)", price: 10500, servings: "Suitable for 25-35 guests" },
        { name: "Large Lechon (19kg - 22kg)", price: 12500, servings: "Suitable for 40-50 guests" },
      ],
    },
    {
      title: "Catering Services",
      icon: UtensilsCrossed,
      tagline: "Full Banquet Buffets & Event Setup",
      description: "Elegant agricultural banquet catering for weddings, family reunions, and civic assemblies. Includes tables, chairs, waiters, and customized menus.",
      packages: [
        { name: "Standard Buffet Package (Min. 50 pax)", price: 12500, servings: "₱250 per head | 4 main courses" },
        { name: "Deluxe Feast Package (Min. 50 pax)", price: 17500, servings: "₱350 per head | 5 main courses + dessert" },
        { name: "VIP Royal Package (Min. 100 pax)", price: 40000, servings: "₱400 per head | Includes small Lechon" },
      ],
    },
    {
      title: "Sweet Corners",
      icon: CakeSlice,
      tagline: "Traditional & Modern Dessert Bars",
      description: "Delight your guests with custom dessert bars containing traditional Nueva Ecija kakanin (rice cakes), sweet cassava, fresh fruit selections, and cupcakes.",
      packages: [
        { name: "Traditional Sweet Corner", price: 4500, servings: "Kakanin platter assortment | Up to 50 guests" },
        { name: "Premium Dessert Display", price: 7500, servings: "Choco fountain, kakanin, pastries | Up to 100 guests" },
      ],
    },
    {
      title: "Food Packages & Trays",
      icon: Soup,
      tagline: "Pre-Packaged Meals & Hot Trays",
      description: "No-hassle meal trays delivered directly to your doorstep. Perfect for corporate assemblies, small home celebrations, or sports meets.",
      packages: [
        { name: "Fiesta Food Tray Set (A)", price: 3500, servings: "For 10-12 guests | Pork Adobo, Pansit, Shanghai" },
        { name: "Fiesta Food Tray Set (B)", price: 4500, servings: "For 10-12 guests | Sweet Pork Ribs, Beef Caldereta" },
      ],
    },
  ];

  const handleOpenBook = (pkg: { name: string; price: number }) => {
    setSelectedService({
      title: pkg.name,
      price: pkg.price,
    });
    setIsModalOpen(true);
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    addReservation({
      category: "Catering Services",
      quantity: reserveQty,
      pickupDate: reserveDate || new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
      price: selectedService.price * reserveQty,
    });

    setReserveSuccess(true);
    setTimeout(() => {
      setReserveSuccess(false);
      setIsModalOpen(false);
      setReserveQty(1);
      setReserveDate("");
      setSelectedService(null);
    }, 2500);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-extrabold font-heading text-slate-800 tracking-tight">Catering & Spit-Roast Services</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          From golden Crispylicious Lechon to themed buffet structures, we turn your Nueva Ecija gatherings into memorable feasts.
        </p>
      </div>

      {/* Services Sections */}
      <div className="space-y-16">
        {serviceCategories.map((sc, index) => {
          const Icon = sc.icon;
          return (
            <div
              key={sc.title}
              className={`flex flex-col lg:flex-row gap-10 items-stretch ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Graphic Info */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center bg-white rounded-3xl border border-slate-100 p-8 sm:p-10 shadow-xs">
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="p-3.5 rounded-2xl bg-primary-50 text-primary-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-extrabold text-slate-800 leading-snug">{sc.title}</h2>
                    <span className="text-[11px] font-bold text-accent-light uppercase tracking-wider block">{sc.tagline}</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium mb-6">
                  {sc.description}
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-primary-700 bg-primary-50/50 py-2.5 px-4 rounded-xl self-start">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Sanitary Food Safety Certified</span>
                </div>
              </div>

              {/* Packages Cards */}
              <div className="w-full lg:w-1/2 bg-slate-50/50 border border-slate-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-4">
                <h3 className="font-heading text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Available Packages</h3>
                <div className="space-y-3.5 flex-1">
                  {sc.packages.map((pkg) => (
                    <div
                      key={pkg.name}
                      className="bg-white p-4 rounded-2xl border border-[#e6e8e6] flex items-center justify-between gap-4 hover:border-primary-500/20 transition-all"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{pkg.name}</h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{pkg.servings}</span>
                      </div>
                      <div className="text-right shrink-0 space-y-1.5">
                        <div className="text-xs font-extrabold text-primary-800">₱{pkg.price.toLocaleString()}</div>
                        <Button size="sm" variant="light" onClick={() => handleOpenBook(pkg)}>
                          Book Setup
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Book Package: ${selectedService?.title}`}>
        {reserveSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <h4 className="font-heading text-base font-bold text-slate-800">Booking Reservation Created!</h4>
            <p className="text-xs text-slate-500 font-medium">Your request for {reserveQty}x {selectedService?.title} has been pushed to the context. Track progress in the dashboard portals!</p>
          </div>
        ) : (
          <form onSubmit={handleBookSubmit} className="space-y-4 font-sans">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between font-bold text-slate-700">
              <span>Unit Cost: ₱{selectedService?.price.toLocaleString()}</span>
              <span>Total Cost: ₱{((selectedService?.price || 0) * reserveQty).toLocaleString()}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Quantity (Number of setups/servings)</label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={reserveQty}
                onChange={(e) => setReserveQty(parseInt(e.target.value) || 1)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Scheduled Delivery / Event Date</label>
              <input
                type="date"
                required
                value={reserveDate}
                onChange={(e) => setReserveDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full">
                Confirm Booking
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}

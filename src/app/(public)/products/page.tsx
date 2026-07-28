"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Search, Filter, ShoppingBag, CheckCircle2, ShieldAlert } from "lucide-react";

export default function ProductsPage() {
  const { role, addReservation } = useRole();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  
  // Reservation Modal states
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [reserveProduct, setReserveProduct] = useState<{ title: string; category: string; price: number } | null>(null);
  const [reserveQty, setReserveQty] = useState(1);
  const [reserveDate, setReserveDate] = useState("");
  const [reserveSuccess, setReserveSuccess] = useState(false);

  const categories = ["All", "Piglets", "Fattening Pigs", "Fresh Pork Meat"];

  const productsList = [
    {
      id: "p1",
      title: "Regular Piglet",
      category: "Piglets",
      description: "Standard hybrid weanling piglet raised on balanced bio-feeds. Vaccinated and dewormed. Weight: 12kg - 15kg.",
      price: 3500,
      unit: "per head",
      stockStatus: "Available",
      specifications: "Age: 1 month | Vaccinated",
    },
    {
      id: "p2",
      title: "Sowlet (Female Piglet)",
      category: "Piglets",
      description: "Select female piglet optimized for breeding cycles and future litter productivity.",
      price: 6500,
      unit: "per head",
      stockStatus: "Available",
      specifications: "Age: 1 month | Selected Breeder",
    },
    {
      id: "p3",
      title: "Boarlet (Male Piglet)",
      category: "Piglets",
      description: "Premium male piglet with excellent sire genetics, selected specifically for breeding stock.",
      price: 5000,
      unit: "per head",
      stockStatus: "Available",
      specifications: "Age: 1 month | Selected Stud",
    },
    {
      id: "p4",
      title: "Fattening Hog",
      category: "Fattening Pigs",
      description: "Commercial grower finish hog ready for final finishing fattening cycles.",
      price: 200,
      unit: "per kilo",
      stockStatus: "Available",
      specifications: "Age: 3-4 months | Bio-Feed Diet",
    },
    {
      id: "p5",
      title: "Pork Belly (Liempo)",
      category: "Fresh Pork Meat",
      description: "Triple-layered premium liempo cuts, perfect for grilling, lechon kawali, or slow braising. Cleanly butchered.",
      price: 320,
      unit: "per kg",
      stockStatus: "Available",
      specifications: "Vacuum Sealed | Freshly Chilled",
    },
    {
      id: "p6",
      title: "Pork Loin",
      category: "Fresh Pork Meat",
      description: "Tender, lean pork loin cuts. Ideal for roasting, pork chops, or lean cutlet preparation.",
      price: 290,
      unit: "per kg",
      stockStatus: "Available",
      specifications: "Vacuum Sealed | Freshly Chilled",
    },
    {
      id: "p7",
      title: "Pork Ribs",
      category: "Fresh Pork Meat",
      description: "Fleshy bone cuts, packed with marbling. Excellent for oven baking or sweet-sour glaze preparation.",
      price: 290,
      unit: "per kg",
      stockStatus: "Available",
      specifications: "Vacuum Sealed | Freshly Chilled",
    },
    {
      id: "p8",
      title: "Pork Shoulder (Kasim)",
      category: "Fresh Pork Meat",
      description: "Lean, tender pork shoulder cuts, ideal for standard Filipino stews (adobo, sinigang, menudo). Freshly prepped.",
      price: 290,
      unit: "per kg",
      stockStatus: "Available",
      specifications: "Vacuum Sealed | Hygienically butchered",
    },
    {
      id: "p9",
      title: "Pork Leg / Ham (Pata)",
      category: "Fresh Pork Meat",
      description: "Meaty pork leg bone cuts, perfect for crispy pata or pata hamonado preparations.",
      price: 290,
      unit: "per kg",
      stockStatus: "Available",
      specifications: "Vacuum Sealed | Freshly Chilled",
    },
    {
      id: "p10",
      title: "Pork Liver (Atay)",
      category: "Fresh Pork Meat",
      description: "Nutrient-dense fresh pork liver, excellent for menudo, sisig, or local liver sauces.",
      price: 250,
      unit: "per kg",
      stockStatus: "Available",
      specifications: "Vacuum Sealed | Freshly Chilled",
    },
    {
      id: "p11",
      title: "Pig's Feet (Tiil / Trotters)",
      category: "Fresh Pork Meat",
      description: "Cleanly split trotters, high in collagen. Ideal for paksiw na pata or slow-simmered soups.",
      price: 250,
      unit: "per kg",
      stockStatus: "Available",
      specifications: "Vacuum Sealed | Freshly Chilled",
    },
    {
      id: "p12",
      title: "Pork Intestines (Tinae)",
      category: "Fresh Pork Meat",
      description: "Thoroughly cleaned pork intestines, perfect for chicharon bulaklak or local stews.",
      price: 150,
      unit: "per kg",
      stockStatus: "Available",
      specifications: "Vacuum Sealed | Freshly Chilled",
    },
    {
      id: "p13",
      title: "Pork Head (Ulo)",
      category: "Fresh Pork Meat",
      description: "Freshly prepared pork head cuts, ideal for authentic sisig or dinuguan recipes.",
      price: 170,
      unit: "per kg",
      stockStatus: "Available",
      specifications: "Vacuum Sealed | Freshly Chilled",
    },
  ];

  const filteredProducts = productsList.filter((p) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = p.title.toLowerCase().includes(searchLower) || 
                          p.description.toLowerCase().includes(searchLower) ||
                          p.category.toLowerCase().includes(searchLower) ||
                          (p.specifications && p.specifications.toLowerCase().includes(searchLower));
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenReserve = (product: typeof productsList[0]) => {
    if (role === "guest") {
      router.push("/login");
      return;
    }
    setReserveProduct({
      title: product.title,
      category: product.category,
      price: product.price,
    });
    setIsReserveModalOpen(true);
  };

  const handleReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveProduct) return;

    addReservation({
      category: reserveProduct.category as any,
      quantity: reserveQty,
      pickupDate: reserveDate || new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
      price: reserveProduct.price * reserveQty,
    });

    setReserveSuccess(true);
    setTimeout(() => {
      setReserveSuccess(false);
      setIsReserveModalOpen(false);
      setReserveQty(1);
      setReserveDate("");
      setReserveProduct(null);
    }, 2500);
  };

  return (
    <div className="pt-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Title */}
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold font-heading text-slate-800 tracking-tight">Our Products Catalog</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          Order healthy piglets, heavy growers, or fresh, hygienically sealed retail pork cuts directly from our trusted piggery.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 font-bold text-xs cursor-pointer p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Free Delivery Promo Banner */}
      {(activeCategory === "All" || activeCategory === "Fresh Pork Meat") && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs font-bold text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>🚚 FREE DELIVERY on all fresh pork meat orders within **Guipos, Dumalinao, and Pagadian**!</span>
          </div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded-md">Promo</span>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 max-w-md mx-auto space-y-4">
          <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-heading text-sm font-bold text-slate-800">No Products Found</h3>
          <p className="text-xs text-slate-500 font-medium">Try resetting your search query or choosing another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredProducts.map((p) => (
            <Card
              key={p.id}
              hoverable
              className="flex flex-col h-full"
              title={
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-lg uppercase tracking-wide">
                    {p.category}
                  </span>
                  <span className={`text-[10px] font-bold ${
                    p.stockStatus === "Available" ? "text-emerald-600" : "text-amber-600"
                  }`}>
                    {p.stockStatus}
                  </span>
                </div>
              }
              footer={
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="text-sm font-extrabold text-slate-800">₱{p.price.toLocaleString()}</span>
                    {p.unit && <span className="text-[10px] text-slate-500 font-bold ml-1">{p.unit}</span>}
                  </div>
                  <Button size="sm" onClick={() => handleOpenReserve(p)}>
                    Reserve Now
                  </Button>
                </div>
              }
            >
              <div className="space-y-3 flex-1">
                <h3 className="font-heading text-base font-extrabold text-slate-800 leading-snug">{p.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{p.description}</p>
                <div className="text-[10px] font-bold text-slate-400 bg-slate-50 py-1 px-2.5 rounded-lg inline-block">
                  {p.specifications}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reservation Modal */}
      <Modal isOpen={isReserveModalOpen} onClose={() => setIsReserveModalOpen(false)} title={`Reserve: ${reserveProduct?.title}`}>
        {reserveSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <h4 className="font-heading text-base font-bold text-slate-800">Reservation Successful!</h4>
            <p className="text-xs text-slate-500 font-medium">Your request for {reserveQty}x {reserveProduct?.title} has been recorded in the context. Toggle to the portals to track progress!</p>
          </div>
        ) : (
          <form onSubmit={handleReserveSubmit} className="space-y-4 font-sans">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between font-bold text-slate-700">
              <span>Unit Price: ₱{reserveProduct?.price.toLocaleString()}</span>
              <span>Total Price: ₱{((reserveProduct?.price || 0) * reserveQty).toLocaleString()}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Quantity</label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={reserveQty}
                onChange={(e) => setReserveQty(parseInt(e.target.value) || 1)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Pickup Date</label>
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
                Confirm Simulated Reservation
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}

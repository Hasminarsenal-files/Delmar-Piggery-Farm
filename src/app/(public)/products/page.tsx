"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Search, Filter, ShoppingBag, CheckCircle2, ShieldAlert } from "lucide-react";

export default function ProductsPage() {
  const { addReservation } = useRole();
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
      title: "Hybrid Weanlings (F1)",
      category: "Piglets",
      description: "Landrace x Large White crossbred piglets. Highly energetic, dewormed, and feed-ready. Weight range: 12kg - 15kg.",
      price: 3500,
      stockStatus: "Available",
      specifications: "Age: 8-10 weeks | Vaccinated",
    },
    {
      id: "p2",
      title: "Purebred Duroc Piglets",
      category: "Piglets",
      description: "Excellent red Duroc piglets selected for fat marble meat properties and strong muscular frames. Weight range: 14kg - 18kg.",
      price: 4500,
      stockStatus: "Low Stock",
      specifications: "Age: 9 weeks | Pedigree Certified",
    },
    {
      id: "p3",
      title: "Grower Pigs",
      category: "Fattening Pigs",
      description: "Healthy grower pigs raised on balanced bio-feed. Ideal for short fattening cycles. Weight range: 40kg - 55kg.",
      price: 7500,
      stockStatus: "Available",
      specifications: "Age: 14 weeks | Health Card Included",
    },
    {
      id: "p4",
      title: "Market-Ready Fattening Hog",
      category: "Fattening Pigs",
      description: "Fattened pigs raised on natural plant proteins. Perfect yield ratios for slaughterhouses. Weight range: 90kg - 110kg.",
      price: 12000,
      stockStatus: "Available",
      specifications: "Age: 22 weeks | Yield Rate > 78%",
    },
    {
      id: "p5",
      title: "Premium Pork Liempo (Belly)",
      category: "Fresh Pork Meat",
      description: "Triple-layered premium liempo cuts, perfect for grilling, lechon kawali, or slow braising. Cleanly butchered.",
      price: 340,
      unit: "per kg",
      stockStatus: "Available",
      specifications: "Vacuum Sealed | Freshly Chilled",
    },
    {
      id: "p6",
      title: "Pork Kasim / Shoulder",
      category: "Fresh Pork Meat",
      description: "Lean, tender pork shoulder cuts, ideal for standard Filipino stews (adobo, sinigang, menudo). Freshly prepped.",
      price: 295,
      unit: "per kg",
      stockStatus: "Available",
      specifications: "Vacuum Sealed | Hygienically butchered",
    },
    {
      id: "p7",
      title: "Pork Spareribs",
      category: "Fresh Pork Meat",
      description: "Fleshy bone cuts, packed with marbling. Excellent for oven baking or sweet-sour glaze preparation.",
      price: 310,
      unit: "per kg",
      stockStatus: "Available",
      specifications: "Vacuum Sealed | Freshly Chilled",
    },
  ];

  const filteredProducts = productsList.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenReserve = (product: typeof productsList[0]) => {
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
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Title */}
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold font-heading text-slate-800 tracking-tight">Our Products Catalog</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          Order healthy piglets, heavy growers, or fresh, hygienically sealed retail pork cuts directly from Nueva Ecija's trusted piggery.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium"
          />
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

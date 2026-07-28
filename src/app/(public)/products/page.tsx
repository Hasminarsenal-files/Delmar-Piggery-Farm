"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Search, Filter, ShoppingBag, CheckCircle2, ShieldAlert, Clock, Wallet } from "lucide-react";

export default function ProductsPage() {
  const { role, addOrder, onlinePaymentChannels, checkDuplicateReferenceNumber, userName, userEmail, userAddress } = useRole();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  
  // Reservation / Checkout Modal states
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [reserveProduct, setReserveProduct] = useState<{ title: string; category: string; price: number } | null>(null);
  const [reserveQty, setReserveQty] = useState(1);
  const [reserveDate, setReserveDate] = useState("");
  const [paymentChannelId, setPaymentChannelId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [refError, setRefError] = useState("");
  const [isDuplicateRef, setIsDuplicateRef] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState("");
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
      description: "Commercial grower finish hog ready for final finishing fattening cycles. Weight: 85kg - 100kg.",
      price: 200,
      unit: "per kilo",
      stockStatus: "Available",
      specifications: "Age: 3-4 months | Weight: 85-100kg | Bio-Feed Diet",
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
      description: "Versatile, flavorful pork shoulder cuts suitable for pork menudo, adobo, or ground pork dishes.",
      price: 280,
      unit: "per kg",
      stockStatus: "Available",
      specifications: "Vacuum Sealed | Freshly Chilled",
    },
    {
      id: "p9",
      title: "Ground Pork (Lean)",
      category: "Fresh Pork Meat",
      description: "Hygienically ground lean pork meat with low fat ratio. Ideal for lumpia, meatballs, and patties.",
      price: 260,
      unit: "per kg",
      stockStatus: "Available",
      specifications: "Vacuum Sealed | Freshly Chilled",
    },
  ];

  const filteredProducts = productsList.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
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
    setReferenceNumber("");
    setRefError("");
    setIsDuplicateRef(false);
    if (onlinePaymentChannels.length > 0) {
      setPaymentChannelId(onlinePaymentChannels[0].id);
    }
    setIsReserveModalOpen(true);
  };

  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveProduct) return;

    const cleanRef = referenceNumber.trim();
    if (!cleanRef) {
      setRefError("Payment Reference Number is required for online payment.");
      return;
    }
    setRefError("");

    const isDup = checkDuplicateReferenceNumber(cleanRef);
    setIsDuplicateRef(isDup);

    const generatedOrdNo = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setCreatedOrderNumber(generatedOrdNo);

    const selectedChannel = onlinePaymentChannels.find(c => c.id === paymentChannelId) || onlinePaymentChannels[0];

    await addOrder({
      product: reserveProduct.title,
      quantity: reserveQty,
      orderType: "Reservation",
      totalAmount: reserveProduct.price * reserveQty,
      reservationDate: new Date().toISOString().split("T")[0],
      pickupDate: reserveDate || new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
      deliveryOrPickup: "Pickup",
      paymentMethod: selectedChannel?.providerName || "Online Payment",
      paymentReferenceNumber: cleanRef,
      deliveryAddress: userAddress || "",
    });

    setReserveSuccess(true);
  };

  return (
    <div className="pt-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 font-sans">
      {/* Title */}
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold font-heading text-slate-800 tracking-tight">Our Products Catalog</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          Order healthy piglets, heavy growers, or fresh, hygienically sealed retail pork cuts directly from our trusted piggery.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
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
                  ? "bg-primary-600 text-white shadow-xs"
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

      {/* Reservation / Checkout Modal */}
      <Modal isOpen={isReserveModalOpen} onClose={() => { setIsReserveModalOpen(false); setReserveSuccess(false); }} title={reserveSuccess ? "Order Submitted for Verification" : `Checkout: ${reserveProduct?.title}`}>
        {reserveSuccess ? (
          <div className="text-center py-6 space-y-4 font-sans">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="px-2.5 py-1 text-[10px] font-extrabold bg-blue-100 text-blue-800 rounded-full uppercase tracking-wider">
                PAYMENT VERIFICATION PENDING
              </span>
              <h4 className="font-heading text-base font-bold text-slate-800 pt-2">Your order has been submitted and is waiting for payment verification.</h4>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-2 max-w-sm mx-auto font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Number:</span>
                <span className="font-bold text-slate-800">{createdOrderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status:</span>
                <span className="font-bold text-blue-600">Pending Verification</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reference Number:</span>
                <span className="font-bold text-slate-800">{referenceNumber}</span>
              </div>
              {isDuplicateRef && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Flagged as DUPLICATE Reference Number (Under Admin Review)</span>
                </div>
              )}
            </div>

            <Button onClick={() => { setIsReserveModalOpen(false); setReserveSuccess(false); router.push("/customer/orders"); }} className="w-full">
              Track Status in My Orders
            </Button>
          </div>
        ) : (
          <form onSubmit={handleReserveSubmit} className="space-y-4 font-sans text-xs">
            {/* ORDER SUMMARY */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <h4 className="font-heading text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-primary-600" /> Order Summary
              </h4>
              <div className="flex justify-between font-semibold text-slate-800 text-xs">
                <span>{reserveProduct?.title} (x{reserveQty})</span>
                <span>₱{((reserveProduct?.price || 0) * reserveQty).toLocaleString()}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Customer: <strong className="text-slate-700">{userName}</strong> ({userEmail})
              </div>
            </div>

            {/* QUANTITY & PICKUP DATE */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
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

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Pickup / Delivery Date</label>
                <input
                  type="date"
                  required
                  value={reserveDate}
                  onChange={(e) => setReserveDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            {/* ONLINE PAYMENT CHANNELS & INSTRUCTIONS */}
            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-primary-600" /> Select Payment Channel
              </label>

              <select
                value={paymentChannelId}
                onChange={(e) => setPaymentChannelId(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-800 bg-white"
              >
                {onlinePaymentChannels.filter(c => c.isActive).map(channel => (
                  <option key={channel.id} value={channel.id}>
                    {channel.providerName} — {channel.accountNumber} ({channel.accountName})
                  </option>
                ))}
              </select>

              {/* Display Configured Channel Instructions */}
              {(() => {
                const chan = onlinePaymentChannels.find(c => c.id === paymentChannelId) || onlinePaymentChannels[0];
                return (
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1 text-[11px] text-blue-900 font-medium">
                    <div className="font-bold flex items-center justify-between">
                      <span>Payment Account: {chan?.accountNumber} ({chan?.accountName})</span>
                      <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.5 rounded-sm uppercase">{chan?.providerName}</span>
                    </div>
                    <div className="text-[10px] text-blue-700 whitespace-pre-line leading-relaxed font-normal">
                      {chan?.instructions}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* REFERENCE NUMBER INPUT */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase flex items-center justify-between">
                <span>Payment Reference Number <span className="text-red-500">*</span></span>
                <span className="text-[9px] font-normal text-slate-400">Required for verification</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ABC123456789 or GCSH-987654"
                value={referenceNumber}
                onChange={(e) => {
                  setReferenceNumber(e.target.value);
                  setRefError("");
                  setIsDuplicateRef(checkDuplicateReferenceNumber(e.target.value));
                }}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono uppercase tracking-wider focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
              />
              {refError && (
                <p className="text-[10px] font-bold text-red-500">{refError}</p>
              )}
              {isDuplicateRef && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>This payment reference number has already been submitted. It will be flagged as DUPLICATE for Admin review.</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full">
                Submit Order for Verification (₱{((reserveProduct?.price || 0) * reserveQty).toLocaleString()})
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

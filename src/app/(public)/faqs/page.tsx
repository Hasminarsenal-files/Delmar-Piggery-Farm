"use client";

import React, { useState } from "react";
import { Plus, Minus, Search, HelpCircle, ShieldQuestion } from "lucide-react";

export default function FAQsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData = [
    {
      category: "Livestock & Breeding",
      q: "What pig breeds do you offer?",
      a: "We breed Landrace, Large White, and Duroc terminal boars. Our commercial weanlings are Landrace-Large White F1 females crossed with pure Duroc boars, giving high feed efficiency and lean meat carcasses.",
    },
    {
      category: "Livestock & Breeding",
      q: "Are the piglets vaccinated before purchase?",
      a: "Yes! All piglets undergo a strict veterinarian-guided vaccination protocol including Mycoplasma hyopneumoniae, Hog Cholera, and iron supplementations. Health cards are signed and turned over upon pickup.",
    },
    {
      category: "Livestock & Breeding",
      q: "Can I choose my piglets directly on the farm?",
      a: "For strict biosecurity reasons, customer entry to breeder pens is restricted. However, our veterinarian can show live videos or take high-quality images of specific stock numbers before reservation payments.",
    },
    {
      category: "Catering & Lechon",
      q: "How many days in advance should I reserve a Crispylicious Lechon?",
      a: "We recommend booking at least 5 to 7 days before your scheduled gathering. For peak holidays (Christmas, New Year) or large catered events, booking 2 weeks in advance ensures slot availability.",
    },
    {
      category: "Catering & Lechon",
      q: "Do you deliver to parts of Central Luzon outside Nueva Ecija?",
      a: "We regularly deliver within Nueva Ecija. Deliveries to neighboring provinces (Tarlac, Pampanga, Bulacan) can be arranged with corresponding logistical transit fees.",
    },
    {
      category: "Catering & Lechon",
      q: "Can I customize the lechon ingredients or stuffing?",
      a: "Our signature roasting recipe uses lemongrass (tanglad), garlic, leeks, onions, and select herbs. If you have specific dietary choices or flavor requests (e.g. spicy lechon), please note them during reservation booking.",
    },
    {
      category: "Account & Booking",
      q: "What is the Reservation system status in my dashboard?",
      a: "Reservations are marked as 'Pending' upon submission. Once the farm administrator validates stock scheduling and price quotas, they will mark it as 'Approved'. You will get notification update alerts.",
    },
    {
      category: "Account & Booking",
      q: "Do you offer cash-on-delivery (COD) for meat items?",
      a: "We accept digital bank transfers (BDO, Metrobank), GCash, and cash upon farm pickup. For lechon and catering, a 50% reservation fee is required, and the balance is settled upon delivery.",
    },
  ];

  const filteredFAQs = faqData.filter((faq) => {
    return (
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 font-sans">
      
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center mx-auto mb-2">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold font-heading text-slate-800 tracking-tight">Support & FAQs Portal</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          Search questions about our biosecure farm operations, pricing schemes, and catering delivery policies.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search topics (e.g. vaccination, lechon, pricing)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium bg-white"
        />
      </div>

      {/* FAQ List */}
      {filteredFAQs.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-slate-100 space-y-3">
          <ShieldQuestion className="w-10 h-10 text-slate-350 mx-auto" />
          <h3 className="text-xs font-bold text-slate-800">No Match Found</h3>
          <p className="text-[11px] text-slate-400 font-bold">Please check spelling or try terms like 'breed' or 'catering'.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFAQs.map((faq, idx) => (
            <div key={idx} className="border border-[#e6e8e6] rounded-2xl overflow-hidden bg-white shadow-xs">
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
              >
                <div>
                  <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-lg uppercase tracking-wide mr-3">
                    {faq.category}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">{faq.q}</span>
                </div>
                {openIndex === idx ? (
                  <Minus className="w-4 h-4 text-primary-600 shrink-0 ml-4" />
                ) : (
                  <Plus className="w-4 h-4 text-primary-600 shrink-0 ml-4" />
                )}
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-5 pt-2 text-xs text-slate-500 leading-relaxed font-medium border-t border-slate-50 bg-slate-50/20">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

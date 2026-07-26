"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Info,
  ShoppingBag,
  Calendar,
  PiggyBank,
  Truck,
  Search,
  ChevronDown,
  Sparkles,
  ArrowRight,
  X,
  MessageSquare,
  ShieldCheck,
  FileText
} from "lucide-react";
import { AIChatWidget } from "@/components/ui/AIChatWidget";

interface FAQItem {
  id: string;
  category: string;
  categoryName: string;
  q: string;
  a: string;
}

export default function FAQsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  // Category Tabs Configuration
  const categories = [
    { id: "all", name: "All Questions", icon: HelpCircle },
    { id: "general", name: "General", icon: Info },
    { id: "products", name: "Products & Services", icon: ShoppingBag },
    { id: "orders", name: "Orders & Reservations", icon: Calendar },
    { id: "paluwagan", name: "Paluwagan", icon: PiggyBank },
    { id: "delivery", name: "Delivery & Payments", icon: Truck },
  ];

  // Official FAQ Dataset for Delmar Piggery Farm & Savorlicious Food Services
  const faqData: FAQItem[] = [
    // 1. GENERAL
    {
      id: "gen-1",
      category: "general",
      categoryName: "General",
      q: "What is Delmar Piggery Farm?",
      a: "Delmar Piggery Farm offers quality piglets, fattening pigs, and fresh pork products. The business also provides food services through Savorlicious Food Services, including Crispylicious Lechon, catering, packed meals, and Bilao & Party Trays."
    },
    {
      id: "gen-2",
      category: "general",
      categoryName: "General",
      q: "What is Savorlicious Food Services?",
      a: "Savorlicious Food Services is the food-service side of the business offering Crispylicious Lechon, catering, packed meals, and Bilao & Party Trays."
    },
    {
      id: "gen-3",
      category: "general",
      categoryName: "General",
      q: "Do I need an account to browse the products?",
      a: "No. Customers can browse available products and services without registering. An account is required when placing orders or using customer-specific features."
    },

    // 2. PRODUCTS & SERVICES
    {
      id: "prod-1",
      category: "products",
      categoryName: "Products & Services",
      q: "What products are available from Delmar Piggery Farm?",
      a: "The farm offers piglets, fattening pigs, and fresh pork products. Availability may change depending on current inventory."
    },
    {
      id: "prod-2",
      category: "products",
      categoryName: "Products & Services",
      q: "What services are available from Savorlicious Food Services?",
      a: "Available services include Crispylicious Lechon, catering, packed meals, and Bilao & Party Trays."
    },
    {
      id: "prod-3",
      category: "products",
      categoryName: "Products & Services",
      q: "Can I check product availability online?",
      a: "Yes. Product availability is updated by the administrator. If an item is unavailable, it may be marked as unavailable or archived."
    },

    // 3. ORDERS & RESERVATIONS
    {
      id: "ord-1",
      category: "orders",
      categoryName: "Orders & Reservations",
      q: "What is the difference between a Cash Order and a Reservation?",
      a: "A Cash Order is a regular purchase, while a Reservation allows you to reserve a product or service for a specified date, subject to administrator approval."
    },
    {
      id: "ord-2",
      category: "orders",
      categoryName: "Orders & Reservations",
      q: "Can I order Crispylicious Lechon without joining Paluwagan?",
      a: "Yes. Customers can still order Crispylicious Lechon normally through Cash or Reservation. Paluwagan is completely separate and is available only to approved Paluwagan members."
    },
    {
      id: "ord-3",
      category: "orders",
      categoryName: "Orders & Reservations",
      q: "Can I cancel or modify my order?",
      a: "Order changes or cancellations depend on the order status and business policy. Contact the administrator as soon as possible for assistance."
    },

    // 4. PALUWAGAN
    {
      id: "pal-1",
      category: "paluwagan",
      categoryName: "Paluwagan",
      q: "What is the Paluwagan Program?",
      a: "The Paluwagan Program allows approved members to purchase eligible Crispylicious Lechon through an installment payment arrangement."
    },
    {
      id: "pal-2",
      category: "paluwagan",
      categoryName: "Paluwagan",
      q: "Is Paluwagan available for all products?",
      a: "No. Paluwagan is ONLY available for Crispylicious Lechon. Piglets, fattening pigs, fresh pork, catering, packed meals, and Bilao & Party Trays are not included."
    },
    {
      id: "pal-3",
      category: "paluwagan",
      categoryName: "Paluwagan",
      q: "Do I need to register for Paluwagan?",
      a: "Yes. Only customers who want to use the Paluwagan program need to complete the separate Paluwagan Membership registration."
    },
    {
      id: "pal-4",
      category: "paluwagan",
      categoryName: "Paluwagan",
      q: "Can I order normally even if I am not a Paluwagan member?",
      a: "Yes. Customers can still place regular Cash Orders or Reservations without joining Paluwagan."
    },
    {
      id: "pal-5",
      category: "paluwagan",
      categoryName: "Paluwagan",
      q: "Can I immediately use Paluwagan after registering?",
      a: "No. Your application must first be reviewed and approved by the administrator."
    },
    {
      id: "pal-6",
      category: "paluwagan",
      categoryName: "Paluwagan",
      q: "Why do I need to submit an ID?",
      a: "The ID and other information are collected to help verify the identity of applicants and protect the business from fraudulent Paluwagan registrations."
    },
    {
      id: "pal-7",
      category: "paluwagan",
      categoryName: "Paluwagan",
      q: "How does Paluwagan payment work?",
      a: "After approval and an eligible Paluwagan Lechon order, the system creates a payment schedule. Payments are due every 15 days according to the member's assigned schedule."
    },
    {
      id: "pal-8",
      category: "paluwagan",
      categoryName: "Paluwagan",
      q: "Where can I see my Paluwagan balance?",
      a: "Go to My Paluwagan. You can see your total contract amount, total payments, remaining balance, payment progress, upcoming due dates, payment schedule, and payment history."
    },
    {
      id: "pal-9",
      category: "paluwagan",
      categoryName: "Paluwagan",
      q: "Will I receive a reminder before my payment is due?",
      a: "Yes. The system sends an email reminder 2 days before the scheduled Paluwagan payment."
    },
    {
      id: "pal-10",
      category: "paluwagan",
      categoryName: "Paluwagan",
      q: "Can I see my payment history?",
      a: "Yes. The My Paluwagan page displays recorded payments, receipt numbers, dates, amounts, payment status, and remaining balance."
    },

    // 5. DELIVERY & PAYMENTS
    {
      id: "del-1",
      category: "delivery",
      categoryName: "Delivery & Payments",
      q: "Do I need to provide my address?",
      a: "Yes. Customers should provide their complete delivery address when placing an order so the administrator knows where the order should be delivered."
    },
    {
      id: "del-2",
      category: "delivery",
      categoryName: "Delivery & Payments",
      q: "Can I update my delivery address?",
      a: "You can update your address through your profile, subject to the system's rules and the status of existing orders."
    },
    {
      id: "del-3",
      category: "delivery",
      categoryName: "Delivery & Payments",
      q: "How will I know if my order has been approved?",
      a: "Check My Orders or My Reservations for the current status. The system may also send email notifications for important updates."
    },
    {
      id: "del-4",
      category: "delivery",
      categoryName: "Delivery & Payments",
      q: "Will I receive an email after making a payment?",
      a: "Yes. The system can send an email confirmation after the administrator records your payment."
    }
  ];

  // Filtering Logic
  const filteredFAQs = useMemo(() => {
    return faqData.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        searchTerm.trim() === "" ||
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm, faqData]);

  // Helper count per category
  const getCategoryCount = (catId: string) => {
    if (catId === "all") return faqData.length;
    return faqData.filter((f) => f.category === catId).length;
  };

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#070F0B] text-slate-100 font-sans pb-24 relative overflow-hidden">
      {/* Subtle Glow Accent in Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-600/20 via-emerald-950/30 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Header Section */}
      <div className="relative pt-14 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold tracking-widest uppercase shadow-lg"
        >
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          Help Center & Knowledge Base
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight"
        >
          Frequently Asked Questions
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-base sm:text-lg font-heading font-bold text-amber-400 tracking-wide"
        >
          Delmar Piggery Farm & Savorlicious Food Services
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed font-normal"
        >
          Find clear answers regarding our livestock products, catering services, order reservations, 
          and Crisprylicious Lechon Paluwagan program policies.
        </motion.p>

        {/* Live Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="max-w-2xl mx-auto pt-4"
        >
          <div className="relative">
            <Search className="w-5 h-5 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search any question or keyword (e.g. Paluwagan, Lechon, ID, Address)..."
              className="w-full bg-[#101D17] border border-emerald-500/40 rounded-2xl pl-12 pr-10 py-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-xl font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Category Tabs Filter */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none justify-start md:justify-center"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const count = getCategoryCount(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all duration-300 cursor-pointer shadow-md ${
                  isSelected
                    ? "bg-emerald-600 text-white border border-emerald-400 shadow-emerald-950/60 scale-105"
                    : "bg-[#111E18] text-slate-300 border border-emerald-900/50 hover:bg-[#182820] hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-amber-300" : "text-emerald-400"}`} />
                <span>{cat.name}</span>
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isSelected ? "bg-emerald-900 text-emerald-200" : "bg-[#09120D] text-slate-400 border border-emerald-900/60"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* FAQ Accordion List */}
        <div className="space-y-4 pt-2">
          <AnimatePresence mode="popLayout">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, idx) => {
                const isOpen = openId === faq.id;

                return (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    className="bg-[#111E18] border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl overflow-hidden shadow-xl transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleAccordion(faq.id)}
                      className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 pr-2">
                        <span className="inline-flex items-center justify-center text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md bg-emerald-950 border border-emerald-500/30 text-amber-400 shrink-0">
                          {faq.categoryName}
                        </span>
                        <h3 className="text-sm sm:text-base font-heading font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                          {faq.q}
                        </h3>
                      </div>
                      <div className={`p-2 rounded-xl border transition-all duration-300 shrink-0 ${
                        isOpen 
                          ? "bg-emerald-600 text-white border-emerald-400 rotate-180" 
                          : "bg-[#09120D] text-emerald-400 border-emerald-900/60 group-hover:bg-emerald-950"
                      }`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden border-t border-emerald-900/60 bg-[#09120E]"
                        >
                          <div className="px-6 py-5 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal space-y-2">
                            <p>{faq.a}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            ) : (
              /* No Search Results Found State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#111E18] border border-emerald-500/30 rounded-3xl p-10 text-center space-y-4 max-w-md mx-auto my-8 shadow-2xl"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <Search className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-heading font-black text-white">No Matching Questions Found</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    We couldn't find any FAQs matching "<span className="text-amber-400 font-bold">{searchTerm}</span>". 
                    Try adjusting your search keywords or select another topic filter.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Clear Search Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Quick Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#0C1712] via-[#12221A] to-[#0C1712] border border-emerald-500/40 rounded-3xl p-8 text-center space-y-6 max-w-4xl mx-auto shadow-2xl mt-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-extrabold border border-emerald-500/30 uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Still Have Questions?
          </div>

          <h3 className="text-xl sm:text-2xl font-heading font-black text-white">
            Need Additional Assistance or Want to Read Our Terms?
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto font-normal">
            Explore our official Business Terms & Conditions or contact our team directly for prompt assistance.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/terms">
              <button className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-lg flex items-center gap-2 cursor-pointer">
                <FileText className="w-4 h-4 text-amber-300" />
                <span>View Terms & Conditions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-6 py-3 rounded-xl bg-[#08120E] border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Contact Administrator</span>
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Floating AI Support Widget */}
      <AIChatWidget />
    </div>
  );
}

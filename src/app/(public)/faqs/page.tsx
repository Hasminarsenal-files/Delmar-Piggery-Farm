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
  CreditCard,
  User,
  Headphones,
  Search,
  Plus,
  Minus,
  MessageSquare,
  Sparkles,
  ArrowRight,
  X,
  ChevronDown
} from "lucide-react";
import { AIChatWidget } from "@/components/ui/AIChatWidget";

interface FAQItem {
  category: string;
  categoryName: string;
  q: string;
  a: string;
}

export default function FAQsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  // Categories list
  const categories = [
    { id: "all", name: "All Topics", icon: HelpCircle },
    { id: "general", name: "General", icon: Info },
    { id: "products", name: "Products & Services", icon: ShoppingBag },
    { id: "orders", name: "Orders & Reservations", icon: Calendar },
    { id: "paluwagan", name: "Paluwagan", icon: PiggyBank },
    { id: "delivery", name: "Delivery", icon: Truck },
    { id: "payments", name: "Payments", icon: CreditCard },
    { id: "account", name: "Account", icon: User },
    { id: "support", name: "Support", icon: Headphones },
  ];

  // Comprehensive FAQ Database
  const faqData: FAQItem[] = [
    // General
    {
      category: "general",
      categoryName: "General",
      q: "What is Delmar Business Management?",
      a: "We are an integrated agriculture and culinary enterprise in Zamboanga del Sur. We manage two main divisions: Delmar Piggery Farm, a modern biosecure swine breeding facility, and Savorlicious Food Services, which specializes in spit-roast crispy lechon and full-service event catering."
    },
    {
      category: "general",
      categoryName: "General",
      q: "Where is your main office and farm located?",
      a: "Our biosecure breeding farm is located in Dumalinao, Zamboanga del Sur. Our main administrative office and Savorlicious catering dispatch hubs are positioned locally to efficiently serve the surrounding municipalities."
    },
    {
      category: "general",
      categoryName: "General",
      q: "What are your business and visiting hours?",
      a: "Our administrative offices and customer support hotline are open Monday to Saturday, from 8:00 AM to 5:00 PM. Please note that physical visits to our breeding farm facilities are strictly restricted for biosecurity reasons, but virtual tours and video calls can be scheduled."
    },
    // Products & Services
    {
      category: "products",
      categoryName: "Products & Services",
      q: "What pig breeds do you offer for commercial breeding?",
      a: "We specialize in breeding pedigree Landrace, Large White, and Duroc terminal boars. Our commercial piglets (weanlings) are Landrace-Large White F1 females crossed with pure Duroc boars, selected for rapid growth, high feed conversion ratio, and excellent carcass quality."
    },
    {
      category: "products",
      categoryName: "Products & Services",
      q: "Are the piglets and breeder hogs fully vaccinated?",
      a: "Yes! Every piglet undergoes a comprehensive vaccination program guided by our resident veterinarian. This includes inoculations for Mycoplasma hyopneumoniae, Hog Cholera, and essential iron supplementations. A signed health card is provided with every purchase."
    },
    {
      category: "products",
      categoryName: "Products & Services",
      q: "What catering packages do Savorlicious Food Services offer?",
      a: "Savorlicious offers a wide range of services including whole charcoal-roasted Crispylicious Lechon, full-course buffet catering, customizable party food trays, and dessert setups for weddings, birthdays, corporate functions, and other celebrations."
    },
    // Orders & Reservations
    {
      category: "orders",
      categoryName: "Orders & Reservations",
      q: "How do I reserve a batch of piglets or fattening hogs?",
      a: "You can book directly through our online portal. Sign in to your Customer Dashboard, navigate to the Reservations page, select an active batch, enter the quantity, and upload a digital copy of your deposit receipt."
    },
    {
      category: "orders",
      categoryName: "Orders & Reservations",
      q: "How many days in advance should I reserve a Crispylicious Lechon?",
      a: "We advise booking at least 5 to 7 days before your scheduled gathering. For peak holiday seasons (such as Christmas and New Year) or large catering events, we highly recommend reserving at least 2 weeks in advance to ensure slot availability."
    },
    {
      category: "orders",
      categoryName: "Orders & Reservations",
      q: "Can I edit or cancel my reservation?",
      a: "Reservations can be edited or cancelled through your dashboard or by contacting support at least 3 days before your scheduled collection or event date. Note that reservation down payments are non-refundable but can be credited to future bookings."
    },
    // Paluwagan
    {
      category: "paluwagan",
      categoryName: "Paluwagan",
      q: "What is the Delmar Paluwagan Scheme?",
      a: "The Delmar Paluwagan is a community-based co-sharing initiative where registered members pool small weekly or monthly savings to raise a collective batch of hogs. When the batch reaches market weight and is sold, profits are shared proportionally among the participants."
    },
    {
      category: "paluwagan",
      categoryName: "Paluwagan",
      q: "How are my contributions tracked in the Paluwagan?",
      a: "Once you subscribe to a Paluwagan slot, all your contributions, ledger updates, and matching livestock batch growth records are tracked in real-time in your member dashboard. You will receive digital receipts for every payment."
    },
    {
      category: "paluwagan",
      categoryName: "Paluwagan",
      q: "What measures protect members if a hog falls sick?",
      a: "We operate a strict closed-tunnel biosecurity system to minimize health risks. Furthermore, all Paluwagan batches are backed by our farm insurance and replacement pool. In the unlikely event of stock mortality, the farm replaces the hog at no extra cost to the group."
    },
    // Delivery
    {
      category: "delivery",
      categoryName: "Delivery",
      q: "Do you deliver live pigs and piglets?",
      a: "Yes, we operate specialized, well-ventilated livestock transport vehicles to deliver bulk purchases of piglets and fattening hogs safely to your farm within Zamboanga del Sur. Logistical delivery fees are calculated based on travel distance."
    },
    {
      category: "delivery",
      categoryName: "Delivery",
      q: "How is the Savorlicious Lechon delivered?",
      a: "To ensure maximum crispiness, our roasted lechons are transported in specialized thermal carriers immediately after roasting and delivered hot to your doorstep. We coordinate dispatch times closely with your event schedule."
    },
    {
      category: "delivery",
      categoryName: "Delivery",
      q: "Are self-pickups allowed?",
      a: "Yes! You can arrange to pick up your live hog orders directly from our farm dispatch gate, or pick up food trays and whole lechons from our commercial culinary hub during designated hours."
    },
    // Payments
    {
      category: "payments",
      categoryName: "Payments",
      q: "What payment channels do you accept?",
      a: "We accept secure digital transfers via GCash, Maya, and major Philippine banks (BDO, Metrobank). Cash payments are also accepted for office walk-ins or direct farm pickups."
    },
    {
      category: "payments",
      categoryName: "Payments",
      q: "Is there a down payment required for bookings?",
      a: "Yes. To confirm livestock reservations and catering setups, a 50% reservation deposit is required. The remaining 50% balance must be settled upon physical delivery, setup, or pickup."
    },
    {
      category: "payments",
      categoryName: "Payments",
      q: "How long does payment validation take?",
      a: "Once you upload your transaction slip via the portal, our accounting staff will verify the funds. This process is usually completed within 1 to 2 hours, and a notification alert will be sent to your account."
    },
    // Account
    {
      category: "account",
      categoryName: "Account",
      q: "How do I create a Delmar customer account?",
      a: "Click 'Register' in the navigation bar, provide your name, contact details, and location, and set up your password. A verification link will be sent to confirm your details, after which you can access the reservation portal."
    },
    {
      category: "account",
      categoryName: "Account",
      q: "Can I manage multiple delivery addresses?",
      a: "Yes. In your Customer Dashboard's Profile Settings, you can save and edit multiple delivery addresses, making it easy to toggle between your farm location, home address, or event venues."
    },
    {
      category: "account",
      categoryName: "Account",
      q: "What should I do if I forget my login password?",
      a: "Simply click on the 'Forgot Password' link on the sign-in page, enter your registered email address, and we will send you a secure link to reset your password immediately."
    },
    // Support
    {
      category: "support",
      categoryName: "Support",
      q: "How do I reach customer support?",
      a: "You can open a support ticket under the 'Help & Support' tab in your dashboard, submit a message via our Contact page, or use the 24/7 AI Chat Assistant available on the portal."
    },
    {
      category: "support",
      categoryName: "Support",
      q: "Is the AI Chat Assistant capable of checking my order status?",
      a: "Yes! If you are logged in, our AI Assistant can retrieve and summarize your active orders, livestock reservations, and ledger status in real-time, in addition to answering general questions."
    },
    {
      category: "support",
      categoryName: "Support",
      q: "What is the typical resolution time for support tickets?",
      a: "Our helpdesk team reviews incoming support tickets during regular business hours (8:00 AM - 5:00 PM). Most queries are resolved within 2 to 4 hours of submission."
    }
  ];

  // Filtering FAQs based on Search & Category Selection
  const filteredFAQs = useMemo(() => {
    return faqData.filter((faq) => {
      const matchesSearch =
        faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);


  const openChatSupport = () => {
    window.dispatchEvent(new Event("open-chat"));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } }
  };

  return (
    <div className="min-h-screen bg-[#F9FBF9] text-[#1a2e22] font-sans pb-20">
      
      {/* Background elegant circles */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-[#eaf6ee] to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-40 right-10 w-72 h-72 rounded-full bg-primary-100/30 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-80 left-5 w-80 h-80 rounded-full bg-gold-light/20 blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-12">
        
        {/* Title / Hero */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-200/50 text-primary-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
            Support Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-primary-900 tracking-tight leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
            Find answers to common questions about our biosecure swine breeding, Savorlicious catering plans, Paluwagan rotating savings scheme, and logistics.
          </p>
        </div>

        {/* Search Bar - Glassmorphism */}
        <div className="max-w-xl mx-auto relative z-20">
          <div className="relative backdrop-blur-md bg-white/70 border border-slate-200/80 rounded-2xl shadow-sm focus-within:shadow-md focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/10 transition-all duration-300 flex items-center p-1.5">
            <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search topics (e.g. paluwagan, vaccination, catering)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setOpenQuestion(null); // Reset open accordion on search
              }}
              className="w-full text-xs font-medium bg-transparent border-none outline-none focus:outline-none focus:ring-0 pl-2.5 pr-8 py-2 text-slate-800 placeholder-slate-400 relative z-20 cursor-text"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-all cursor-pointer z-30"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Grid */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold text-primary-800/80 tracking-wider text-center sm:text-left">
            Browse by Category
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setOpenQuestion(null); // Reset open accordion on category change
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 text-center gap-2 cursor-pointer shadow-xs ${
                    isActive
                      ? "bg-gradient-to-br from-primary-600 to-primary-700 text-white border-gold/70 shadow-md shadow-primary-900/10"
                      : "bg-white hover:bg-slate-50 text-slate-700 hover:text-primary-700 border-slate-200/80"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl transition-colors duration-300 ${
                      isActive ? "bg-white/15 text-white" : "bg-primary-50 text-primary-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block leading-tight">
                    {cat.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* FAQ List / Accordion & No Match Handler */}
        <div className="max-w-4xl mx-auto space-y-6 pt-4">
          {filteredFAQs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white border border-slate-200/60 rounded-3xl shadow-xs space-y-5 px-6 max-w-xl mx-auto"
            >
              <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-100">
                <HelpCircle className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-extrabold font-heading text-slate-800">No matching questions found</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Can't find your answer? Contact us or chat with our AI Assistant.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
                <Link href="/contact" className="w-full sm:w-auto">
                  <button className="w-full px-5 py-2.5 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-slate-50 text-xs font-bold text-slate-700 hover:text-primary-700 shadow-xs transition-all cursor-pointer">
                    Contact Us
                  </button>
                </Link>
                <button
                  onClick={openChatSupport}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-850 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer border border-primary-800/30"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat with AI Assistant
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {filteredFAQs.map((faq) => {
                const isOpen = openQuestion === faq.q;
                return (
                  <motion.div
                    key={faq.q}
                    variants={itemVariants}
                    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                      isOpen
                        ? "border-primary-600 bg-white shadow-md shadow-primary-950/5"
                        : "border-slate-200/80 bg-white hover:border-primary-300 hover:shadow-xs"
                    }`}
                  >
                    <button
                      onClick={() => setOpenQuestion(isOpen ? null : faq.q)}
                      className="w-full px-6 py-4.5 flex items-center justify-between text-left transition-colors cursor-pointer select-none"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 pr-4">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider shrink-0 w-fit ${
                            isOpen
                              ? "bg-primary-600 text-white"
                              : "bg-primary-50 text-primary-700 border border-primary-200/20"
                          }`}
                        >
                          {faq.categoryName}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                          {faq.q}
                        </h4>
                      </div>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className={`p-1.5 rounded-full shrink-0 ${
                          isOpen ? "bg-primary-50 text-primary-600" : "bg-slate-50 text-slate-400"
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden bg-[#FCFDFB] border-t border-slate-100"
                        >
                          <div className="px-6 py-5 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Bottom CTA Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl border border-primary-750"
        >
          {/* Decorative background grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-[0.03] pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-gold/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-primary-400/10 blur-2xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight leading-snug">
              Still have questions?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl mx-auto leading-relaxed font-semibold">
              Can't find the answer you're looking for? Reach out to our dedicated team or get instant help from our AI Assistant.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 max-w-md mx-auto">
              <Link href="/contact" className="w-full sm:w-1/2">
                <button className="w-full bg-white hover:bg-slate-50 text-primary-950 text-xs sm:text-sm font-bold uppercase tracking-wider py-3 px-6 rounded-xl border border-transparent shadow-md transition-all duration-300 cursor-pointer">
                  Contact Us
                </button>
              </Link>
              <button
                onClick={openChatSupport}
                className="w-full sm:w-1/2 bg-gold hover:bg-[#b88910] text-slate-950 text-xs sm:text-sm font-bold uppercase tracking-wider py-3 px-6 rounded-xl border border-transparent shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat with AI
              </button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Floating AI Chat Widget Component */}
      <AIChatWidget />
    </div>
  );
}

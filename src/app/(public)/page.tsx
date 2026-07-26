"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { PIGLET_TYPES, LECHON_SIZES, CATERING_BUFFETS, SWEETS_PACKAGES } from "@/utils/pricing";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  PiggyBank,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Star,
  Plus,
  Minus,
  MessageSquare,
  ArrowRight,
  Sparkles,
  TrendingUp,
  HeartHandshake,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Award,
} from "lucide-react";

// Scroll Counter Component
const AnimatedCounter = ({ value, suffix = "", duration = 2000 }: { value: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    if (start === end) return;

    const totalMs = duration;
    const incrementTime = Math.max(Math.floor(totalMs / end), 20);

    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMs / incrementTime));
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="font-heading font-extrabold text-3xl sm:text-4xl text-primary-700 tracking-tight">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

// Scroll Reveal Helper
const ScrollReveal: React.FC<{ children: React.ReactNode; delay?: number; duration?: number }> = ({
  children,
  delay = 0,
  duration = 0.6,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default function HomePage() {
  const { role, addReservation } = useRole();
  const router = useRouter();
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);
  const [showContactSuccess, setShowContactSuccess] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  
  // Custom reservation modal
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [reserveCategory, setReserveCategory] = useState<"Piglets" | "Fattening Pigs" | "Crispylicious Lechon" | "Catering Services">("Piglets");
  const [reserveQty, setReserveQty] = useState(1);
  const [reserveDate, setReserveDate] = useState("");
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [pigletType, setPigletType] = useState("regular");
  const [lechonSize, setLechonSize] = useState("15kg");
  const [cateringType, setCateringType] = useState("set-a");

  // Redesign state
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);
  const [activeScrIdx, setActiveScrIdx] = useState(0);

  const feedbackScreenshots = [
    "/img/feedback/5e4ba03a-ef3f-4dbb-8bee-d46b5521ed1d.jpg",
    "/img/feedback/9b34c6ff-032e-4553-9864-ec4ecaa376a5.jpg",
    "/img/feedback/a9a8bb92-f079-4a4c-9045-e87fa8609e03.jpg",
    "/img/feedback/ab3575f6-21b1-4a01-a0c5-b1af3dd4389b.jpg",
    "/img/feedback/ba50553d-929a-4e15-a2a3-e32f73726f8a.jpg",
    "/img/feedback/d29a880f-986f-4e21-a528-7df011f77eea.jpg",
    "/img/feedback/d82f9184-92d7-4e1e-8632-dc1294165abb.jpg",
  ];

  const products = [
    {
      title: "Weanling Piglets",
      category: "Piglets",
      description: "High-grade hybrid weanlings (Landrace, Duroc, Large White crosses). Vaccinated, dewormed, and ready for fattening.",
      price: 3500,
      badge: "Best Seller",
      img: "/img/piglets/1.jpg",
      features: ["Certified Genetics", "Vaccinated & Dewormed", "Optimal Feed Conversion"],
    },
    {
      title: "Fattening Pigs",
      category: "Fattening Pigs",
      description: "Well-grown fatteners bred for high feed-conversion rates. Ideal weight ranges from 85kg to 110kg.",
      price: 12000,
      badge: "Premium Stock",
      img: "/img/piglets/3.jpg",
      features: ["Premium Feed Program", "Disease-Free Status", "High Carcass Yield"],
    },
    {
      title: "Fresh Pork Meat",
      category: "Fresh Pork Meat",
      description: "Farm-to-table premium cuts (Pork Belly, Pork Chops, Shoulder, Ribs). Hygienically prepared and vacuum-sealed.",
      price: 320,
      unit: "/ kg",
      badge: "100% Organic Feed",
      img: "/img/meat/fresh meat.png",
      features: ["Vacuum Sealed Freshness", "Hygienically Slaughtered", "No Hormones or Steroids"],
    },
  ];

  const services = [
    {
      title: "Crispylicious Lechon",
      category: "Crispylicious Lechon",
      description: "Golden, crispy-skinned traditional Filipino roasted pig. Stuffed with aromatic lemongrass, garlic, and native herbs.",
      price: "From ₱8,500",
      img: "/img/letson/3.jpg",
      details: "Our signature lechon is slowly roasted over native hardwood charcoal for 4-5 hours. The skin is glazed to a perfect glass-like crunch while the meat inside is infused with fresh tanglad, garlic cloves, peppercorns, and native farm spices.",
      features: ["Native charcoal roasted", "Spiced with fresh farm herbs", "Crisp skin guaranteed for hours"],
    },
    {
      title: "Catering Services",
      category: "Catering Services",
      description: "Full-course agricultural catering packages for weddings, birthdays, and community assemblies.",
      price: "From ₱250/pax",
      img: "/img/Catering/1.jpg",
      details: "Comprehensive professional catering for small gatherings up to grand celebrations. Menu highlights authentic farm-fresh pork recipes, heirloom side dishes, and customizable buffet styles.",
      features: ["Custom menu designs", "Professional waitstaff", "Elegant rustic decorations included"],
    },
    {
      title: "Sweet Corners",
      category: "Sweet Corners",
      description: "Custom dessert displays featuring native Filipino rice cakes, fresh farm fruit platters, and chocolate fountains.",
      price: "From ₱4,000",
      img: "/img/Sweet/2.jpg",
      details: "A delightful addition to any event, showing off Filipino dessert craftsmanship. Features freshly prepared bibingka, puto bumbong, cassava cakes, and tropical fruit boards picked from partner community farms.",
      features: ["Traditional native delicacies", "Modern dessert styling", "Organic fresh fruit platters"],
    },
    {
      title: "Food Packages",
      category: "Food Packages",
      description: "Premium packed meals, party trays, and group food packages tailored for your family gatherings and corporate events.",
      price: "From ₱180/pax",
      img: "/foodpackage.jpg",
      details: "Delicious, cooked-to-order food sets in convenient transport containers. From small family gatherings to large corporate events, we offer bilao packages, party trays, and customizable packed meals featuring our signature recipes.",
      features: ["Convenient party trays", "Packed meals & Bilao sets", "Freshly cooked to order"],
    },
  ];

  const faqs = [
    {
      q: "What pig breeds do you offer for breeding and fattening?",
      a: "We raise Landrace, Duroc, Large White, and Berkshire crosses. These breeds are selected for high litter sizes, excellent growth rates, and premium marbling quality.",
    },
    {
      q: "How do I reserve a Crispylicious Lechon for an event?",
      a: "You can book directly using our website portal! Click 'Book Reservation', choose 'Crispylicious Lechon', enter your details, and specify your event date. Our team will contact you to confirm delivery details.",
    },
    {
      q: "What biosecurity protocols do you maintain on your farm?",
      a: "Our farm strictly implements high-standard biosecurity protocols, including wheel disinfectants at gates, shower-in/shower-out facilities for workers, quarantine bays, and regular vaccination routines overseen by licensed veterinarians.",
    },
    {
      q: "Can I buy wholesale fresh pork cuts directly?",
      a: "Yes! We cater to butcheries, supermarkets, and restaurants. Wholesale fresh pork orders can be requested via our contact form or our reservation dashboard.",
    },
  ];



  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    
    setShowContactSuccess(true);
    setTimeout(() => {
      setShowContactSuccess(false);
      setContactForm({ name: "", email: "", subject: "", message: "" });
    }, 4000);
  };

  const getSelectedUnitPrice = () => {
    if (reserveCategory === "Piglets") {
      const type = PIGLET_TYPES.find(p => p.key === pigletType);
      return type ? type.price : 3500;
    }
    if (reserveCategory === "Fattening Pigs") {
      return 12000;
    }
    if (reserveCategory === "Crispylicious Lechon") {
      const size = LECHON_SIZES.find(l => l.key === lechonSize);
      return size ? size.price : 6500;
    }
    if (reserveCategory === "Catering Services") {
      if (cateringType.startsWith("set-")) {
        const buffet = CATERING_BUFFETS.find(b => b.key === cateringType);
        return buffet ? buffet.price : 250;
      } else {
        const sweet = SWEETS_PACKAGES.find(s => s.key === cateringType);
        return sweet ? sweet.price : 3650;
      }
    }
    return 0;
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const unitPrice = getSelectedUnitPrice();
    
    addReservation({
      category: reserveCategory,
      quantity: reserveQty,
      pickupDate: reserveDate || new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
      price: unitPrice * reserveQty,
    });

    setReserveSuccess(true);
    setTimeout(() => {
      setReserveSuccess(false);
      setIsReserveModalOpen(false);
      setReserveQty(1);
      setReserveDate("");
    }, 2500);
  };

  const openReservation = (cat?: any) => {
    if (role === "guest") {
      router.push("/login");
      return;
    }
    if (cat) {
      setReserveCategory(cat);
    }
    setIsReserveModalOpen(true);
  };

  return (
    <div className="font-sans bg-[#FFFDF7] text-[#1e2521] overflow-x-hidden min-h-screen">
      
      {/* 1. HERO SECTION WITH LAYERED PREMIUM BACKGROUND */}
      <section className="relative flex items-center overflow-hidden bg-gradient-to-br from-[#F4FDF9] via-[#FAFDFB] to-[#FFFDF7] text-slate-800 pt-6 pb-12 sm:pt-10 sm:pb-16 border-b border-primary-100">
        {/* Layered background with gradients, blur circles, and farm rolling hills */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Animated Blob 1 */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              x: [0, 30, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] rounded-full bg-primary-200/20 blur-[130px]"
          />
          {/* Animated Blob 2 */}
          <motion.div
            animate={{
              scale: [1.1, 0.95, 1.1],
              x: [0, -20, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-[-5%] right-[-5%] w-[55%] h-[55%] rounded-full bg-primary-300/10 blur-[150px]"
          />
          {/* Animated Accent Blob */}
          <motion.div
            animate={{
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-[35%] right-[25%] w-[30%] h-[30%] rounded-full bg-gold/10 blur-[110px]"
          />
          
          {/* Parallax Organic Hills Silhouette */}
          <svg className="absolute bottom-0 left-0 w-full h-40 sm:h-52 opacity-15 text-primary-100/30" viewBox="0 0 1440 200" fill="none" preserveAspectRatio="none">
            <path d="M0,130 Q360,190 720,130 T1440,110 L1440,200 L0,200 Z" fill="currentColor"></path>
          </svg>
          <svg className="absolute bottom-0 left-0 w-full h-32 sm:h-40 opacity-20 text-primary-200/20" viewBox="0 0 1440 200" fill="none" preserveAspectRatio="none">
            <path d="M0,150 Q400,100 800,160 T1440,140 L1440,200 L0,200 Z" fill="currentColor"></path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Column: Headline and Info */}
            <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/50 border border-primary-200/60 text-xs font-bold text-primary-700 tracking-wider uppercase backdrop-blur-xs mx-auto lg:mx-0 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d4a017]" />
                <span>🐖 Farm & Food Business</span>
              </motion.div>
 
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight leading-[1.1] text-slate-800">
                  <motion.span
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="block bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent pb-1"
                  >
                    Quality Livestock,
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="block text-[#b59218] bg-gradient-to-r from-[#d4a017] via-[#f3c23c] to-[#b59218] bg-clip-text text-transparent pb-1"
                  >
                    Exceptional Food,
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="block text-slate-800 text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mt-2"
                  >
                    Trusted Service.
                  </motion.span>
                </h1>
                <motion.p 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-sm sm:text-base text-slate-650 max-w-xl mx-auto lg:mx-0 leading-relaxed font-semibold"
                >
                  Delmar Piggery Farm and Savorlicious Food Services are committed to providing quality livestock, premium lechon, catering services, and delicious food packages for every occasion. We combine responsible farming, quality products, and outstanding customer service to deliver the best experience for our customers.
                </motion.p>
              </div>
 
              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <Link href="/services" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="primary" 
                    className="w-full sm:w-auto shadow-lg shadow-emerald-650/20 font-extrabold tracking-wide uppercase px-8 hover:scale-105 active:scale-98 transition-all duration-300"
                    icon={<ArrowRight className="w-4 h-4 text-white" />} 
                  >
                    Explore Our Services
                  </Button>
                </Link>
                <Link href="/products" className="w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 font-bold uppercase tracking-wide px-8 hover:scale-105 transition-all duration-300"
                  >
                    Browse Products
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Badges / Stats Panel */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200 max-w-md mx-auto lg:mx-0 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-700 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">100% Fresh</h4>
                    <span className="text-[10px] text-slate-500 font-semibold">Organic Feed Diet</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-700 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Certified</h4>
                    <span className="text-[10px] text-slate-500 font-semibold">High-Grade Genetics</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Option 2 - Overlapping Floating Glassmorphism Cards */}
            <div className="lg:col-span-6 relative h-[560px] w-full flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-[520px] h-full flex items-center justify-center">
                
                {/* Decorative glowing sphere background */}
                <div className="absolute w-72 h-72 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

                {/* Floating Card 1: Piglets */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  whileHover={{ scale: 1.05, zIndex: 30, transition: { duration: 0.3 } }}
                  className="absolute top-0 left-0 w-[220px] sm:w-[235px] bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl p-4 shadow-xl z-10"
                >
                  <div className="relative h-28 w-full rounded-2xl overflow-hidden mb-3">
                    <img
                      src="/img/piglets/1.jpg"
                      alt="Piglets"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-emerald-700 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Premium Breed
                    </div>
                  </div>
                  <h4 className="font-heading font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                    <span>🐖</span> Piglets
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold mb-2">High-Grade Swine Stock</p>
                  <div className="flex justify-end items-center text-xs font-bold pt-1.5 border-t border-slate-100">
                    <button 
                      onClick={() => openReservation("Piglets")} 
                      className="text-[10px] text-emerald-800 flex items-center gap-1 font-extrabold hover:text-emerald-950 transition-colors"
                    >
                      Reserve Now <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>

                {/* Floating Card 2: Fattening Pigs */}
                <motion.div
                  animate={{
                    y: [0, 12, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4,
                  }}
                  whileHover={{ scale: 1.05, zIndex: 30, transition: { duration: 0.3 } }}
                  className="absolute top-16 right-0 w-[220px] sm:w-[235px] bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl p-4 shadow-xl z-20"
                >
                  <div className="relative h-28 w-full rounded-2xl overflow-hidden mb-3">
                    <img
                      src="/img/piglets/2.jpg"
                      alt="Fattening Pigs"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-gold/90 text-slate-900 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Healthy & Ready
                    </div>
                  </div>
                  <h4 className="font-heading font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                    <span>🐷</span> Fattening Pigs
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold mb-2">Commercial Sows & Boars</p>
                  <div className="flex justify-end items-center text-xs font-bold pt-1.5 border-t border-slate-100">
                    <Link href="/products" className="text-[10px] text-emerald-800 flex items-center gap-1 font-extrabold hover:text-emerald-950 transition-colors">
                      View Details <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </motion.div>

                {/* Floating Card 3: Crispylicious Lechon */}
                <motion.div
                  animate={{
                    y: [0, -12, 0],
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8,
                  }}
                  whileHover={{ scale: 1.05, zIndex: 30, transition: { duration: 0.3 } }}
                  className="absolute bottom-16 left-2 w-[220px] sm:w-[235px] bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl p-4 shadow-xl z-15"
                >
                  <div className="relative h-28 w-full rounded-2xl overflow-hidden mb-3">
                    <img
                      src="/lechon.jpg"
                      alt="Crispylicious Lechon"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Perfect for Celebrations
                    </div>
                  </div>
                  <h4 className="font-heading font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                    <span>🍖</span> Crispylicious Lechon
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold mb-2">Slow-Roasted spit-pig</p>
                  <div className="flex justify-end items-center text-xs font-bold pt-1.5 border-t border-slate-100">
                    <button 
                      onClick={() => openReservation("Crispylicious Lechon")} 
                      className="text-[10px] text-emerald-800 flex items-center gap-1 font-extrabold hover:text-emerald-950 transition-colors"
                    >
                      Reserve Today <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>

                {/* Floating Card 4: Catering Services */}
                <motion.div
                  animate={{
                    y: [0, 10, 0],
                  }}
                  transition={{
                    duration: 5.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.2,
                  }}
                  whileHover={{ scale: 1.05, zIndex: 30, transition: { duration: 0.3 } }}
                  className="absolute bottom-0 right-2 w-[220px] sm:w-[235px] bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl p-4 shadow-xl z-10"
                >
                  <div className="relative h-28 w-full rounded-2xl overflow-hidden mb-3">
                    <img
                      src="/catering.jpg"
                      alt="Catering Services"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-emerald-700 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Packed Meals • Bilao • Trays
                    </div>
                  </div>
                  <h4 className="font-heading font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                    <span>🍽</span> Catering Services
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold mb-2">Packed Meals, Bilao, Trays</p>
                  <div className="flex justify-end items-center text-xs font-bold pt-1.5 border-t border-slate-100">
                    <button 
                      onClick={() => openReservation("Catering Services")} 
                      className="text-[10px] text-emerald-800 flex items-center gap-1 font-extrabold hover:text-emerald-950 transition-colors"
                    >
                      Book Now <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 3. FEATURED PRODUCTS & SERVICES SECTION */}
      <section className="py-24 sm:py-32 relative z-10 bg-[#FFFDF7]">
        {/* Subtle geometric pattern in background */}
        <div className="absolute inset-0 bg-[radial-gradient(#0b3d2e_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.02]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
              <h2 className="text-xs uppercase font-extrabold text-[#0B3D2E] tracking-widest border-b-2 border-[#D4AF37] inline-block pb-1.5 font-sans">
                Our Offerings
              </h2>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-[#0B3D2E] tracking-tight">
                Premium Livestock & Catering Packages
              </h3>
              <p className="text-slate-500 font-medium text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Explore our select category groups built around veterinary excellence, clean feeding schedules, and culinary perfection.
              </p>
            </div>
          </ScrollReveal>

          {/* Core Products Subgrid */}
          <div className="space-y-8 mb-20">
            <ScrollReveal>
              <div className="flex justify-between items-end border-b border-[#e6e8e6] pb-4">
                <div>
                  <h4 className="font-heading text-lg font-extrabold text-[#0B3D2E] uppercase tracking-wider">Premium Farm Stock</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Directly sourced from bio-secured breeding pens.</p>
                </div>
                <Link href="/products" className="group text-xs font-bold text-[#0B3D2E] hover:text-[#1B4332] flex items-center gap-1.5 transition-colors">
                  View Full Catalog
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.map((product, idx) => (
                <ScrollReveal key={product.title} delay={idx * 0.15}>
                  <div className="group bg-white rounded-2xl border border-[#e6e8e6] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                    {/* Image frame */}
                    <div className="relative h-56 w-full overflow-hidden bg-slate-50 border-b border-[#e6e8e6]">
                      <img
                        src={product.img}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 bg-[#0B3D2E] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                        {product.badge}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">{product.category}</span>
                          <h4 className="font-heading text-lg font-bold text-slate-800 leading-snug group-hover:text-[#0B3D2E] transition-colors">{product.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{product.description}</p>
                        
                        {/* Bullets */}
                        <ul className="space-y-1.5 pt-2">
                          {product.features.map((feat) => (
                            <li key={feat} className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-end">
                        <Button 
                          size="sm" 
                          variant="primary" 
                          className="font-bold text-xs px-5 shadow-sm shadow-[#0B3D2E]/10"
                          onClick={() => openReservation(product.category as any)}
                        >
                          Reserve
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Catering Services Subgrid */}
          <div className="space-y-8">
            <ScrollReveal>
              <div className="flex justify-between items-end border-b border-[#e6e8e6] pb-4">
                <div>
                  <h4 className="font-heading text-lg font-extrabold text-[#0B3D2E] uppercase tracking-wider">Catering & Special Food Services</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Celebrate milestones with premium spit-roasted pig and food packages.</p>
                </div>
                <Link href="/services" className="group text-xs font-bold text-[#0B3D2E] hover:text-[#1B4332] flex items-center gap-1.5 transition-colors">
                  View All Services
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, idx) => (
                <ScrollReveal key={service.title} delay={idx * 0.1}>
                  <div className="group bg-white rounded-2xl border border-[#e6e8e6] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                    <div className="relative h-44 w-full overflow-hidden bg-slate-50 border-b border-[#e6e8e6]">
                      <img
                        src={service.img}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <h5 className="font-heading text-sm font-extrabold text-slate-800 leading-snug group-hover:text-[#0B3D2E] transition-colors">{service.title}</h5>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{service.description}</p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-end">
                        <Button 
                          size="sm" 
                          variant="light" 
                          className="text-[11px] font-bold px-4"
                          onClick={() => {
                            if (service.category.includes("Lechon")) {
                              openReservation("Crispylicious Lechon");
                            } else {
                              openReservation("Catering Services");
                            }
                          }}
                        >
                          Book
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 4. WHY CHOOSE US SECTION (PREMIUM METRICS & QUALITY ASSURANCES) */}
      <section className="py-24 bg-gradient-to-br from-[#f2faf5] to-[#fcfdfd] text-slate-800 border-y border-primary-100 relative overflow-hidden z-10">
        {/* Glow circle overlay */}
        <div className="absolute top-[20%] left-[5%] w-80 h-80 rounded-full bg-primary-200/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[20%] right-[5%] w-96 h-96 rounded-full bg-emerald-100/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
              <h2 className="text-xs uppercase font-extrabold text-primary-700 tracking-widest">
                Our Edge
              </h2>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-primary-900 tracking-tight">
                Elite Standards In Swine Husbandry
              </h3>
              <p className="text-slate-550 font-medium text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Operating with institutional bio-security protocols and veterinary excellence to safeguard quality food supply chains.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <ScrollReveal delay={0.1}>
              <div className="group h-full bg-white border border-slate-200/80 p-8 rounded-2xl space-y-5 hover:border-emerald-500 hover:shadow-lg hover:bg-slate-50/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 text-xl font-bold">
                  🐖
                </div>
                <h4 className="font-heading text-xs font-bold text-slate-800 tracking-wider uppercase">Healthy Livestock</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Raised with proper care and quality standards.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <div className="group h-full bg-white border border-slate-200/80 p-8 rounded-2xl space-y-5 hover:border-emerald-500 hover:shadow-lg hover:bg-slate-50/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 text-xl font-bold">
                  🍽
                </div>
                <h4 className="font-heading text-xs font-bold text-slate-800 tracking-wider uppercase">Premium Food Services</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Delicious food prepared for every celebration.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <div className="group h-full bg-white border border-slate-200/80 p-8 rounded-2xl space-y-5 hover:border-emerald-500 hover:shadow-lg hover:bg-slate-50/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 text-xl font-bold">
                  🚚
                </div>
                <h4 className="font-heading text-xs font-bold text-slate-800 tracking-wider uppercase">Reliable Delivery</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Safe and timely delivery for your orders.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.55}>
              <div className="group h-full bg-white border border-slate-200/80 p-8 rounded-2xl space-y-5 hover:border-emerald-500 hover:shadow-lg hover:bg-slate-50/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 text-xl font-bold">
                  💚
                </div>
                <h4 className="font-heading text-xs font-bold text-slate-800 tracking-wider uppercase">Trusted Customer Service</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Friendly assistance before and after every order.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="py-24 bg-[#FFFDF7] border-y border-[#e6e8e6] relative overflow-hidden z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <ScrollReveal>
            <div className="space-y-3 mb-6">
              <h2 className="text-xs uppercase font-extrabold text-[#0B3D2E] tracking-widest">
                Testimonials
              </h2>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0B3D2E] tracking-tight">
                Trusted by Farmers & Hosts Alike
              </h3>
            </div>
          </ScrollReveal>

          {/* Interactive Widescreen Carousel */}
          <div className="relative flex items-center justify-center w-full mt-4 min-h-[250px] sm:min-h-[340px]">
              {/* Left Navigation Arrow */}
              <button
                onClick={() => setActiveScrIdx((prev) => (prev - 1 + feedbackScreenshots.length) % feedbackScreenshots.length)}
                className="absolute left-[-5px] sm:left-4 z-20 p-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#0B3D2E] hover:scale-105 active:scale-95 shadow-md cursor-pointer transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Slider Track */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 w-full max-w-4xl overflow-visible relative">
                {/* Left Card Preview (Desktop Only) */}
                <div
                  onClick={() => setActiveScrIdx((prev) => (prev - 1 + feedbackScreenshots.length) % feedbackScreenshots.length)}
                  className="hidden sm:block relative w-[140px] sm:w-[180px] md:w-[220px] bg-white rounded-2xl border border-slate-100 shadow-md opacity-30 hover:opacity-50 scale-90 transition-all duration-300 cursor-pointer overflow-hidden select-none shrink-0"
                >
                  <img
                    src={feedbackScreenshots[(activeScrIdx - 1 + feedbackScreenshots.length) % feedbackScreenshots.length]}
                    alt="Previous Feedback"
                    className="w-full h-auto object-contain pointer-events-none select-none"
                  />
                </div>

                {/* Center Active Card (All screens) */}
                <motion.div
                  key={activeScrIdx}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1.05, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  onClick={() => setActiveScreenshot(feedbackScreenshots[activeScrIdx])}
                  className="relative w-[260px] sm:w-[340px] md:w-[420px] bg-white rounded-2xl border border-slate-100 shadow-xl hover:shadow-emerald-950/5 cursor-pointer overflow-hidden select-none shrink-0 group transition-all duration-300"
                >
                  <img
                    src={feedbackScreenshots[activeScrIdx]}
                    alt="Active Customer Feedback"
                    className="w-full h-auto object-contain select-none"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#0B3D2E]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-2xl">
                    <span className="bg-white/95 text-[#0B3D2E] text-[10px] font-extrabold py-2 px-4 rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300 uppercase tracking-widest">
                      Enlarge Proof
                    </span>
                  </div>
                </motion.div>

                {/* Right Card Preview (Desktop Only) */}
                <div
                  onClick={() => setActiveScrIdx((prev) => (prev + 1) % feedbackScreenshots.length)}
                  className="hidden sm:block relative w-[140px] sm:w-[180px] md:w-[220px] bg-white rounded-2xl border border-slate-100 shadow-md opacity-30 hover:opacity-50 scale-90 transition-all duration-300 cursor-pointer overflow-hidden select-none shrink-0"
                >
                  <img
                    src={feedbackScreenshots[(activeScrIdx + 1) % feedbackScreenshots.length]}
                    alt="Next Feedback"
                    className="w-full h-auto object-contain pointer-events-none select-none"
                  />
                </div>
              </div>

              {/* Right Navigation Arrow */}
              <button
                onClick={() => setActiveScrIdx((prev) => (prev + 1) % feedbackScreenshots.length)}
                className="absolute right-[-5px] sm:right-4 z-20 p-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#0B3D2E] hover:scale-105 active:scale-95 shadow-md cursor-pointer transition-all duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-1.5 mt-8">
              {feedbackScreenshots.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveScrIdx(idx)}
                  className={`h-1.5 rounded-full cursor-pointer transition-all duration-350 ${
                    activeScrIdx === idx ? "w-5 bg-[#0B3D2E]" : "w-1.5 bg-slate-350 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

      {/* 7. FAQS SECTION */}
      <section className="py-24 bg-[#f4f6f1] border-y border-[#e6e8e6] relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-xs uppercase font-extrabold text-[#0B3D2E] tracking-widest">
                Questions
              </h2>
              <h3 className="text-3xl font-extrabold font-heading text-[#0B3D2E] tracking-tight">
                Frequently Answered Inquiries
              </h3>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.08}>
                <div className="border border-[#e6e8e6] rounded-2xl overflow-hidden bg-white shadow-xs">
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 leading-snug">{faq.q}</span>
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      {openFAQIndex === idx ? (
                        <Minus className="w-3.5 h-3.5 text-primary-700" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-primary-700" />
                      )}
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFAQIndex === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-slate-50"
                      >
                        <div className="px-6 pb-6 pt-3 text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION SECTION (PREMIUM BOOKING SECTION WITH BACKGROUND OVERLAY) */}
      <section className="relative py-28 sm:py-36 text-slate-800 overflow-hidden z-10 bg-[#f4faf6] border-y border-primary-100">
        {/* Background Image with Rich Light Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/img/Catering/catering.png"
            alt="Farm Catering Table Setup"
            className="w-full h-full object-cover filter brightness-[1.15] opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f4faf6] via-[#f4faf6]/85 to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <ScrollReveal>
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-100 border border-primary-200/50 text-xs font-bold text-primary-800 uppercase tracking-widest backdrop-blur-xs">
              <Calendar className="w-3.5 h-3.5 text-primary-700" />
              <span>Catering & Stock Bookings</span>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={0.15}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-primary-900 tracking-tight leading-tight">
              Ready to Book Your Farm-to-Table Experience?
            </h2>
            <p className="text-xs sm:text-sm text-slate-650 max-w-xl mx-auto font-semibold leading-relaxed mt-4">
              Reserve premium piglets for commercial fattening, order native roasted pork, or design a custom banquet course with our food services. Secure your booking slot today.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4.5 pt-4">
              <Button
                size="lg"
                variant="primary"
                className="w-full sm:w-auto font-extrabold uppercase shadow-lg shadow-primary-600/20 px-8"
                onClick={() => openReservation()}
              >
                Secure Reservation Slot
              </Button>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 uppercase font-bold px-8"
                >
                  Contact Farm Office
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 9. CONTACT SECTION */}
      <section className="py-24 bg-[#FFFDF7] border-t border-[#e6e8e6] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Contact Details Panel */}
            <div className="lg:col-span-5 space-y-8">
              <ScrollReveal>
                <div className="space-y-4">
                  <h2 className="text-xs uppercase font-extrabold text-[#0B3D2E] tracking-widest border-b-2 border-[#D4AF37] inline-block pb-1">
                    Contact Us
                  </h2>
                  <h3 className="text-3xl font-extrabold font-heading text-[#0B3D2E] tracking-tight">Let's Connect</h3>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
                    Have questions about our livestock genetics, current weight availability, roasted pig specifications, or catering packages? Write to us or call our farm office.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <div className="space-y-5">
                  <div className="flex gap-4 p-4.5 rounded-2xl bg-white border border-slate-200/60 shadow-xs hover:border-[#D4AF37] transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0 shadow-xs">
                      <MapPin className="w-5 h-5 text-[#0B3D2E]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Farm Location</h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-semibold mt-1">Purok Lapu-Lapu, Tickwas, Dumalinao, Zamboanga del Sur</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4.5 rounded-2xl bg-white border border-slate-200/60 shadow-xs hover:border-[#D4AF37] transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0 shadow-xs">
                      <Phone className="w-5 h-5 text-[#0B3D2E]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Phone Support</h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-semibold mt-1">09464544973</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4.5 rounded-2xl bg-white border border-slate-200/60 shadow-xs hover:border-[#D4AF37] transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0 shadow-xs">
                      <Mail className="w-5 h-5 text-[#0B3D2E]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Email Address</h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-semibold mt-1">delmararsenal103@gmail.com</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Contact Form Panel */}
            <div className="lg:col-span-7">
              <ScrollReveal delay={0.2}>
                <Card className="p-6 sm:p-8 rounded-3xl border border-[#e6e8e6] shadow-lg shadow-slate-100 bg-white">
                  {showContactSuccess ? (
                    <div className="p-8 text-center space-y-4">
                      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="w-7 h-7 animate-bounce" />
                      </div>
                      <h3 className="font-heading text-lg font-bold text-slate-800">Message Received!</h3>
                      <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto">
                        Thank you for writing. We have logged this query into the farm system and will get back to you shortly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Your Name</label>
                          <input
                            type="text"
                            required
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-semibold bg-slate-50/50"
                            placeholder="Juan Dela Cruz"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Email Address</label>
                          <input
                            type="email"
                            required
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-semibold bg-slate-50/50"
                            placeholder="juan.dc@email.com"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Subject</label>
                        <input
                          type="text"
                          required
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                          className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-semibold bg-slate-50/50"
                          placeholder="Inquiry about hybrid weanlings"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Your Message</label>
                        <textarea
                          required
                          rows={4}
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-semibold leading-relaxed bg-slate-50/50"
                          placeholder="Type your message here..."
                        />
                      </div>

                      <Button type="submit" className="w-full sm:w-auto font-bold uppercase tracking-wider text-xs px-6 py-3" icon={<MessageSquare className="w-4 h-4" />}>
                        Send Message
                      </Button>
                    </form>
                  )}
                </Card>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>

      {/* QUICK RESERVATION MODAL */}
      <Modal isOpen={isReserveModalOpen} onClose={() => setIsReserveModalOpen(false)} title="Reserve Stock / Catering Package">
        {reserveSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7 animate-bounce" />
            </div>
            <h4 className="font-heading text-lg font-bold text-slate-800">Reservation Logged!</h4>
            <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto">
              This reservation has been simulated and saved to the Role Context. Access client or admin portals to verify transaction details.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReservationSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Category Selection</label>
              <select
                value={reserveCategory}
                onChange={(e) => setReserveCategory(e.target.value as any)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl font-semibold focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="Piglets">Piglets (Weanlings & Breeders)</option>
                <option value="Fattening Pigs">Fattening Hogs (₱12,000/head)</option>
                <option value="Crispylicious Lechon">Crispylicious Lechon (charcoal roasted)</option>
                <option value="Catering Services">Catering Services & Dessert Packages</option>
              </select>
            </div>

            {/* Sub-type selections */}
            {reserveCategory === "Piglets" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Piglet Sub-Type</label>
                <select
                  value={pigletType}
                  onChange={(e) => setPigletType(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl font-semibold"
                >
                  {PIGLET_TYPES.map((type) => (
                    <option key={type.key} value={type.key}>
                      {type.label} (₱{type.price.toLocaleString()}/head)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {reserveCategory === "Crispylicious Lechon" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Lechon Size / Weight Tiers</label>
                <select
                  value={lechonSize}
                  onChange={(e) => setLechonSize(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl font-semibold"
                >
                  {LECHON_SIZES.map((size) => (
                    <option key={size.key} value={size.key}>
                      {size.label} (₱{size.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {reserveCategory === "Catering Services" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Catering / Sweets Package Selection</label>
                <select
                  value={cateringType}
                  onChange={(e) => setCateringType(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl font-semibold"
                >
                  <optgroup label="Buffet Packages (price per pax, min. 50 pax)">
                    {CATERING_BUFFETS.map((buffet) => (
                      <option key={buffet.key} value={buffet.key}>
                        {buffet.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Sweets Packages (price per package set)">
                    {SWEETS_PACKAGES.map((sweet) => (
                      <option key={sweet.key} value={sweet.key}>
                        {sweet.label} (₱{sweet.price.toLocaleString()})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                {reserveCategory === "Catering Services" && cateringType.startsWith("set-") 
                  ? "Number of Pax / Guests (Quantity)" 
                  : "Quantity Needed"}
              </label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={reserveQty}
                onChange={(e) => setReserveQty(parseInt(e.target.value) || 1)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Preferred Delivery / Pick-up Date</label>
              <input
                type="date"
                required
                value={reserveDate}
                onChange={(e) => setReserveDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl font-semibold"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Estimated Total</span>
                <span className="text-base font-extrabold text-[#0B3D2E]">
                  ₱{(getSelectedUnitPrice() * reserveQty).toLocaleString()}
                </span>
              </div>
              <Button type="submit" size="md" className="font-bold text-xs uppercase px-5">
                Confirm Booking
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* QUICK VIEW MODAL FOR SERVICES */}
      <Modal isOpen={!!selectedService} onClose={() => setSelectedService(null)} title="Service Spotlight">
        {selectedService && (
          <div className="space-y-5 text-[#1e2521]">
            <div className="h-56 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
              <img
                src={selectedService.img}
                alt={selectedService.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-[#0B3D2E] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                {selectedService.price}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-heading font-extrabold text-lg text-slate-800">{selectedService.title}</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">{selectedService.details}</p>
            </div>

            <div className="space-y-3">
              <h5 className="text-[10px] font-extrabold text-[#0B3D2E] uppercase tracking-wider">Key Highlights:</h5>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedService.features.map((feat: string) => (
                  <li key={feat} className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs font-semibold px-4.5"
                onClick={() => setSelectedService(null)}
              >
                Close
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                className="text-primary-950 font-bold text-xs px-5"
                onClick={() => {
                  const cat = selectedService.category || "Catering Services";
                  setSelectedService(null);
                  openReservation(cat);
                }}
              >
                Reserve Now
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* VERIFIED CHAT PROOF LIGHTBOX MODAL */}
      <Modal
        isOpen={!!activeScreenshot}
        onClose={() => setActiveScreenshot(null)}
        title="Verified Chat Feedback"
        size="md"
      >
        {activeScreenshot && (
          <div className="flex flex-col items-center justify-center space-y-5 py-2">
            <div className="max-h-[70vh] max-w-full overflow-hidden rounded-2xl border border-slate-100 shadow-lg bg-slate-50">
              <img
                src={activeScreenshot}
                alt="Verified Customer Chat Proof"
                className="max-h-[65vh] w-auto object-contain mx-auto"
              />
            </div>
            <div className="flex gap-3 w-full justify-center">
              <Button
                onClick={() => setActiveScreenshot(null)}
                className="px-6 font-bold text-xs uppercase"
                size="sm"
              >
                Close Proof
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

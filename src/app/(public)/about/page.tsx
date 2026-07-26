"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion, useInView } from "framer-motion";
import {
  ShieldCheck,
  Award,
  Soup,
  Truck,
  Clock,
  HeartHandshake,
  Target,
  Eye,
  Heart,
  Zap,
  Sparkles,
} from "lucide-react";

// Scroll Reveal Helper
const ScrollReveal: React.FC<{ children: React.ReactNode; delay?: number; duration?: number }> = ({
  children,
  delay = 0,
  duration = 0.6,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default function AboutPage() {
  const coreValues = [
    {
      title: "Integrity",
      desc: "Honesty and high ethical standards in all farming practices and food preparation.",
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: "Quality",
      desc: "We breed only premium livestock and source top ingredients for our catering setups.",
      icon: Award,
      color: "from-amber-500 to-amber-600",
    },
    {
      title: "Customer Satisfaction",
      desc: "Creating memorable events and supplying healthy stock to guarantee buyer delight.",
      icon: Heart,
      color: "from-rose-500 to-pink-600",
    },
    {
      title: "Responsibility",
      desc: "Complying strictly with biological safety rules and environmental waste management.",
      icon: HeartHandshake,
      color: "from-emerald-600 to-green-700",
    },
    {
      title: "Innovation",
      desc: "Utilizing modern breeding cycles, automated ventilation, and green bio-gas loop technology.",
      icon: Zap,
      color: "from-blue-500 to-indigo-600",
    },
  ];

  const choosingFeatures = [
    {
      title: "Strict Biosecurity",
      desc: "Our closed-tunnel facilities prevent disease entry and safeguard animal safety.",
      icon: ShieldCheck,
    },
    {
      title: "Superior Genetics",
      desc: "We breed pedigree Landrace, Duroc, and Large White lineages for high-yield carcasses.",
      icon: Award,
    },
    {
      title: "Hygienic Preparation",
      desc: "Vacuum-sealed packaging and sanitary kitchens for food safety compliance.",
      icon: Soup,
    },
    {
      title: "Timely Delivery",
      desc: "Safe transport routes and punctual deliveries for event packages.",
      icon: Truck,
    },
    {
      title: "Flexible Bookings",
      desc: "Fast slots scheduling with responsive reservation tracking built in.",
      icon: Clock,
    },
    {
      title: "Dedicated Care",
      desc: "Friendly consultation before orders and complete veterinary records support.",
      icon: HeartHandshake,
    },
  ];

  return (
    <div className="font-sans bg-[#FFFDF7] text-[#1e2521] overflow-x-hidden min-h-screen pb-16">
      
      {/* 2. OUR STORY SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-800 tracking-tight leading-snug">
                One Brand, Two Premium Divisions
              </h2>
              <div className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold space-y-4">
                <p>
                  Founded with a vision for sanitary agricultural practices, **Delmar Piggery Farm** started as a biosecure breeding facility in Dumalinao, Zamboanga del Sur. Utilizing closed-ventilation systems and purebred genetics, we established ourselves as a trusted source for commercial growers.
                </p>
                <p>
                  To link our farm-fresh meats directly to customers, we launched **Savorlicious Food Services**. Specializing in traditional charcoal-roasted lechon, catering buffets, dessert packages, and party setups, Savorlicious brings professional hospitality and delicious heirloom recipes to celebrations.
                </p>
                <p>
                  Today, we coordinate both enterprises under a unified biosecure workflow, ensuring that every hog bred and every meal served complies with the highest standards of safety, quality, and community value.
                </p>
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-emerald-700/5 rounded-3xl transform rotate-3 scale-102 blur-xs" />
              <img
                src="/aboutus.jpg"
                alt="Story Banner"
                className="w-full h-80 object-cover rounded-3xl shadow-xl relative z-10 border border-slate-100"
              />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 3. MISSION & VISION */}
      <section className="bg-slate-50 py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <ScrollReveal delay={0.1}>
            <Card className="p-8 space-y-5 bg-white border border-slate-200/60 rounded-3xl shadow-xs hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-800 uppercase tracking-wide">Our Mission</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                  To supply hog growers in Zamboanga del Sur with highly productive, disease-resistant piglets, while delivering premium-quality, hygienic pork products and catering services to Filipino families. We aim to elevate agricultural and culinary standards through biosecurity and genetic efficiency.
                </p>
              </div>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.25}>
            <Card className="p-8 space-y-5 bg-white border border-slate-200/60 rounded-3xl shadow-xs hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-800 uppercase tracking-wide">Our Vision</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                  To become a premier agricultural livestock farm and trusted food brand in the region, recognized for our commitment to animal welfare, biosecurity innovation, sustainable waste-to-energy loops, and unbeatable customer service.
                </p>
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. CORE VALUES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs uppercase font-extrabold text-primary-700 tracking-widest">Principles</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-800 tracking-tight">Our Core Values</h3>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold">
              The fundamental standards that drive our day-to-day operations, farm sanitation, and service logistics.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {coreValues.map((val, idx) => {
            const Icon = val.icon;
            return (
              <ScrollReveal key={val.title} delay={idx * 0.1}>
                <Card className="p-6 h-full flex flex-col justify-between border border-slate-200/60 rounded-2xl bg-white shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                  <div className="space-y-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${val.color} text-white flex items-center justify-center shadow-xs`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-heading text-sm font-bold text-slate-800">{val.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{val.desc}</p>
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* 6. WHY CHOOSE US */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs uppercase font-extrabold text-primary-700 tracking-widest">Our Edge</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-800 tracking-tight">Why Choose Us</h3>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {choosingFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <ScrollReveal key={feat.title} delay={idx * 0.1}>
                <div className="group h-full bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4 hover:border-emerald-500 hover:shadow-md hover:bg-slate-50/20 transition-all duration-300 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-108 transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{feat.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{feat.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* 7. CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 pt-12">
        <ScrollReveal>
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-primary-950 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight leading-tight">
              Ready to Order or Book a Setup?
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
              Reserve quality livestock piglets for your growing pens, browse our fresh vacuum-sealed cuts catalog, or design a catering menu with our SFS assistants today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href="/products" className="w-full sm:w-auto">
                <Button size="md" variant="primary" className="w-full bg-[#D4AF37] hover:bg-amber-500 text-slate-950 font-bold uppercase tracking-wider px-6">
                  Browse Products
                </Button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button size="md" variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 font-bold uppercase tracking-wider px-6">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
}

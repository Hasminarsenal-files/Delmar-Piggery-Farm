"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
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
} from "lucide-react";

export default function HomePage() {
  const { addReservation, addOrder } = useRole();
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);
  const [showContactSuccess, setShowContactSuccess] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  
  // Custom reservation modal
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [reserveCategory, setReserveCategory] = useState<"Piglets" | "Fattening Pigs" | "Crispylicious Lechon" | "Catering Services">("Piglets");
  const [reserveQty, setReserveQty] = useState(1);
  const [reserveDate, setReserveDate] = useState("");
  const [reserveSuccess, setReserveSuccess] = useState(false);

  const products = [
    {
      title: "Weanling Piglets",
      category: "Piglets",
      description: "High-grade hybrid weanlings (Landrace, Duroc, Large White crosses). Vaccinated, dewormed, and ready for fattening.",
      price: 3500,
      badge: "Best Seller",
    },
    {
      title: "Fattening Pigs",
      category: "Fattening Pigs",
      description: "Well-grown fatteners bred for high feed-conversion rates. Ideal weight ranges from 85kg to 110kg.",
      price: 12000,
      badge: "Premium Stock",
    },
    {
      title: "Fresh Pork Meat",
      category: "Fresh Pork Meat",
      description: "Farm-to-table premium cuts (Pork Belly, Pork Chops, Shoulder, Ribs). Hygienically prepared and vacuum-sealed.",
      price: 320,
      unit: "/ kg",
      badge: "100% Organic Feed",
    },
  ];

  const services = [
    {
      title: "Crispylicious Lechon",
      description: "Golden, crispy-skinned traditional Filipino roasted pig. Stuffed with aromatic lemongrass, garlic, and native herbs.",
      price: "From ₱8,500",
    },
    {
      title: "Catering Services",
      description: "Full-course agricultural catering packages for weddings, birthdays, and community assemblies. Traditional delicacies.",
      price: "From ₱250/pax",
    },
    {
      title: "Sweet Corners",
      description: "Custom dessert displays featuring native Filipino rice cakes, fresh farm fruit platters, and chocolate fountains.",
      price: "From ₱4,000",
    },
    {
      title: "Food Packages",
      description: "Conveniently boxed hot meals and tray bundles for corporate luncheons and family gather-ups.",
      price: "From ₱1,500/tray",
    },
  ];

  const testimonials = [
    {
      name: "Ramon Valenzuela",
      role: "Commercial Hog Dealer",
      rating: 5,
      comment: "Delmar's piglets have the best feed-conversion ratio I've seen in Central Luzon. Health cards are always complete and weight gains are predictable.",
    },
    {
      name: "Teresita Mendoza",
      role: "Catering & Events Coordinator",
      rating: 5,
      comment: "The Crispylicious Lechon is always the star of our banquets. Crackling skin stays crispy for hours, and the meat is flavorful and tender.",
    },
    {
      name: "Dr. Albert Santos",
      role: "Agricultural Consultant",
      rating: 5,
      comment: "Highly sanitary breeding facilities and biosecurity measures. Delmar Piggery sets the standard for modern pig farming setups in Nueva Ecija.",
    },
  ];

  const faqs = [
    {
      q: "What pig breeds do you offer for breeding and fattening?",
      a: "We primary raise Landrace, Duroc, Large White, and Berkshire crosses. These breeds are selected for high litter sizes, excellent growth rates, and premium meat quality.",
    },
    {
      q: "How do I reserve a Crispylicious Lechon for an event?",
      a: "You can book directly using our website portal! Click 'Reserve Now', choose 'Crispylicious Lechon', enter your details, and specify your event date. Our team will contact you to confirm delivery details.",
    },
    {
      q: "What biosecurity protocols do you maintain on your farm?",
      a: "Our farm strictly implements standard biosecurity protocols, including wheel disinfectants at gates, shower-in/shower-out facilities for workers, quarantine bays, and regular vaccination routines overseen by licensed veterinarians.",
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
    
    // Simulate API request
    setShowContactSuccess(true);
    setTimeout(() => {
      setShowContactSuccess(false);
      setContactForm({ name: "", email: "", subject: "", message: "" });
    }, 4000);
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceMap = {
      "Piglets": 3500,
      "Fattening Pigs": 12000,
      "Crispylicious Lechon": 8500,
      "Catering Services": 15000,
    };
    
    addReservation({
      category: reserveCategory,
      quantity: reserveQty,
      pickupDate: reserveDate || new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
      price: priceMap[reserveCategory] * reserveQty,
    });

    setReserveSuccess(true);
    setTimeout(() => {
      setReserveSuccess(false);
      setIsReserveModalOpen(false);
      setReserveQty(1);
      setReserveDate("");
    }, 2500);
  };

  return (
    <div className="font-sans">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 text-white py-20 lg:py-32">
        {/* Background Decorative Shapes */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-accent-light blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-primary-300 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text Panel */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-700/50 border border-primary-600/30 text-xs font-bold text-accent-light tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Generation Hog Farm & Catering</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight leading-tight">
                Premium Grade Livestock, <br />
                <span className="text-accent-light">Fresh Pork Products.</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Delmar Piggery Farm combines modern livestock husbandry, strict biosecurity, and premium genetics to produce high-performing weanling piglets and delicious lechon catering.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button size="lg" icon={<ArrowRight className="w-4 h-4" />} onClick={() => setIsReserveModalOpen(true)}>
                  Book Reservation
                </Button>
                <Link href="/products">
                  <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 hover:text-white">
                    Explore Catalog
                  </Button>
                </Link>
              </div>
            </div>

            {/* Graphic Panel */}
            <div className="lg:col-span-5 relative">
              <div className="w-full aspect-square rounded-3xl bg-linear-to-tr from-primary-700/60 to-primary-600/20 border border-primary-600/30 p-8 flex flex-col justify-between overflow-hidden shadow-2xl relative">
                {/* Floating Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 self-start shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent-light/20 p-2 rounded-xl text-accent-light">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Feed Conversion</div>
                      <div className="text-sm font-bold text-white">FCR 2.4 - Highly Efficient</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center items-center py-6">
                  <PiggyBank className="w-36 h-36 text-accent-light/80 filter drop-shadow-[0_10px_15px_rgba(82,183,136,0.3)] animate-pulse" />
                </div>

                {/* Floating Card 2 */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 self-end shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Biosecurity Level</div>
                      <div className="text-sm font-bold text-white">Class A Standard</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs uppercase font-bold text-primary-600 tracking-widest">Our Edge</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-800 tracking-tight">Why Choose Delmar Piggery?</h3>
            <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed">
              We operate under modern agriculture standards to provide you the healthiest pigs and quality food safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hoverable className="text-center p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-base font-bold text-slate-800">Veterinary Certified</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Our complete vaccination schedule and bio-secure facilities ensure that our pigs are consistently free of diseases and in optimal health.
              </p>
            </Card>

            <Card hoverable className="text-center p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-base font-bold text-slate-800">Superior Hog Genetics</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                We select premium Grand Parent stocks (Landrace, Duroc, Large White) to guarantee maximum litter sizes and excellent average daily weight gains.
              </p>
            </Card>

            <Card hoverable className="text-center p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-base font-bold text-slate-800">Customer-First Service</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                From ordering piglets to custom lechon spices and catering delivery scheduling, we guide you at every step of the logistics pipeline.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className="py-20 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-6 mb-12">
            <div className="space-y-2">
              <h2 className="text-xs uppercase font-bold text-primary-600 tracking-widest">Farm Catalog</h2>
              <h3 className="text-3xl font-extrabold font-heading text-slate-800 tracking-tight">Featured Products</h3>
            </div>
            <Link href="/products">
              <Button variant="outline" size="sm">
                View All Products
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((p) => (
              <Card
                key={p.title}
                hoverable
                className="flex flex-col h-full"
                title={
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-sm text-primary-800">{p.category}</span>
                    <span className="px-2 py-0.5 text-[9px] font-extrabold bg-accent-lighter text-primary-800 rounded-full">
                      {p.badge}
                    </span>
                  </div>
                }
                footer={
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-extrabold text-slate-800">
                      ₱{p.price.toLocaleString()}{p.unit || ""}
                    </span>
                    <Button size="sm" onClick={() => {
                      setReserveCategory(p.category as any);
                      setIsReserveModalOpen(true);
                    }}>
                      Reserve
                    </Button>
                  </div>
                }
              >
                <div className="space-y-2 flex-1">
                  <h4 className="font-heading text-lg font-bold text-slate-800 leading-snug">{p.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{p.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED SERVICES SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-6 mb-12">
            <div className="space-y-2">
              <h2 className="text-xs uppercase font-bold text-primary-600 tracking-widest">Catering & Catering Spices</h2>
              <h3 className="text-3xl font-extrabold font-heading text-slate-800 tracking-tight">Our Catering Services</h3>
            </div>
            <Link href="/services">
              <Button variant="outline" size="sm">
                View All Services
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
              <Card
                key={s.title}
                hoverable
                className="flex flex-col h-full"
                footer={
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-primary-700">{s.price}</span>
                    <Button size="sm" variant="light" onClick={() => {
                      setReserveCategory("Catering Services");
                      setIsReserveModalOpen(true);
                    }}>
                      Book
                    </Button>
                  </div>
                }
              >
                <div className="space-y-2 flex-1">
                  <h5 className="font-heading text-sm font-bold text-slate-800 leading-snug">{s.title}</h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{s.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 bg-[#f4f6f1] border-y border-primary-100/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs uppercase font-bold text-primary-600 tracking-widest">Feedback</h2>
            <h3 className="text-3xl font-extrabold font-heading text-slate-800 tracking-tight">What Our Partners Say</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <Card key={t.name} className="flex flex-col h-full bg-white relative">
                <div className="space-y-4 flex-1">
                  {/* Stars */}
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed italic">"{t.comment}"</p>
                  
                  <div className="h-px bg-slate-100" />

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-xs">
                      {t.name[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-none">{t.name}</h4>
                      <span className="text-[10px] text-slate-500 font-medium">{t.role}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQS SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-xs uppercase font-bold text-primary-600 tracking-widest">Questions</h2>
            <h3 className="text-3xl font-extrabold font-heading text-slate-800 tracking-tight">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-[#e6e8e6] rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-800">{faq.q}</span>
                  {openFAQIndex === idx ? (
                    <Minus className="w-4 h-4 text-primary-600 shrink-0" />
                  ) : (
                    <Plus className="w-4 h-4 text-primary-600 shrink-0" />
                  )}
                </button>
                {openFAQIndex === idx && (
                  <div className="px-6 pb-5 pt-1 text-xs text-slate-500 leading-relaxed font-medium border-t border-slate-50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <h2 className="text-xs uppercase font-bold text-primary-600 tracking-widest">Contact</h2>
                <h3 className="text-3xl font-extrabold font-heading text-slate-800 tracking-tight">Let's Connect</h3>
                <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
                  Have questions about our livestock breeding, pricing packages, or want to customize lechon ingredients? Feel free to reach out to us.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Farm Location</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Purok 4, Brgy. San Juan, Aliaga, Nueva Ecija, Philippines</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Phone Support</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">+63 912 345 6789</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Email Address</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">info@delmarpiggery.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <Card className="p-6 sm:p-8">
                {showContactSuccess ? (
                  <div className="p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6 animate-bounce" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-slate-800">Message Received!</h3>
                    <p className="text-xs text-slate-500 font-medium">Thank you for writing. We will notify the farm admin simulation and get back to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 uppercase">Your Name</label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium"
                          placeholder="Juan Dela Cruz"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 uppercase">Email Address</label>
                        <input
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium"
                          placeholder="juan.dc@email.com"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Subject</label>
                      <input
                        type="text"
                        required
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium"
                        placeholder="Inquiry about weanlings"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Your Message</label>
                      <textarea
                        required
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium leading-relaxed"
                        placeholder="Type your message here..."
                      />
                    </div>

                    <Button type="submit" className="w-full sm:w-auto" icon={<MessageSquare className="w-4 h-4" />}>
                      Send Message
                    </Button>
                  </form>
                )}
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* QUICK RESERVATION MODAL */}
      <Modal isOpen={isReserveModalOpen} onClose={() => setIsReserveModalOpen(false)} title="Simulate Pig/Catering Reservation">
        {reserveSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <h4 className="font-heading text-base font-bold text-slate-800">Reservation Recorded!</h4>
            <p className="text-xs text-slate-500 font-medium">This transaction has been pushed to the Role Context. Switch to customer/admin portals to view updates.</p>
          </div>
        ) : (
          <form onSubmit={handleReservationSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Category</label>
              <select
                value={reserveCategory}
                onChange={(e) => setReserveCategory(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="Piglets">Piglets (₱3,500/head)</option>
                <option value="Fattening Pigs">Fattening Pigs (₱12,000/head)</option>
                <option value="Crispylicious Lechon">Crispylicious Lechon (₱8,500/order)</option>
                <option value="Catering Services">Catering Services (₱15,000/booking)</option>
              </select>
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
              <label className="text-[10px] font-bold text-slate-700 uppercase">Preferred Pickup/Event Date</label>
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
                Submit Simulated Reservation
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

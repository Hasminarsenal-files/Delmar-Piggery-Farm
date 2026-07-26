"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRole, OrderType } from "@/context/RoleContext";
import { PIGLET_TYPES, LECHON_SIZES, CATERING_BUFFETS, SWEETS_PACKAGES, getReservationDetails } from "@/utils/pricing";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  CalendarCheck, 
  Bell, 
  User, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Truck, 
  Clock, 
  Trash2, 
  Edit3, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Check, 
  Heart,
  TrendingUp,
  MessageSquare
} from "lucide-react";

// CountUp Component for premium KPI animations
const CountUp = ({ end }: { end: number }) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 800; // ms
    const increment = Math.ceil(end / 20) || 1;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(start);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{value}</span>;
};

// Countdown helper for reservations
const getCountdown = (dateStr: string) => {
  if (!dateStr) return { text: "No Date", days: 999, color: "text-slate-400" };
  const eventDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { text: "Passed", days: diffDays, color: "text-rose-500 bg-rose-50 border-rose-100" };
  if (diffDays === 0) return { text: "Today", days: diffDays, color: "text-amber-600 bg-amber-50 border-amber-100 animate-pulse font-bold" };
  if (diffDays === 1) return { text: "Tomorrow", days: diffDays, color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
  if (diffDays <= 7) return { text: `${diffDays} Days Left`, days: diffDays, color: "text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20" };
  return { text: `${diffDays} Days Left`, days: diffDays, color: "text-emerald-700 bg-emerald-50 border-emerald-100" };
};

export default function CustomerDashboard() {
  const { userName, userEmail, userAddress, orders, reservations, notifications, addReservation, addOrder, markNotificationRead, clearNotifications, paluwaganBatches, paluwaganApplications } = useRole();
  
  // Filter lists based on logged in user
  const customerOrders = orders.filter((o) => o.customerEmail === userEmail);
  const customerReservations = reservations.filter((r) => r.customerEmail === userEmail);
  const activeOrders = customerOrders.filter((o) => o.status !== "Delivered");
  const activeReservations = customerReservations.filter((r) => r.status === "Pending" || r.status === "Approved");
  
  // Check if customer is approved Paluwagan member
  const isApprovedMember = paluwaganApplications.some(
    (app) => app.customerEmail === userEmail && app.status === "Approved"
  );
  const isPendingMember = paluwaganApplications.some(
    (app) => app.customerEmail === userEmail && app.status === "Pending"
  );

  // Local Notifications state to allow delete
  const [localNotifs, setLocalNotifs] = useState<any[]>([]);
  useEffect(() => {
    setLocalNotifs(notifications);
  }, [notifications]);

  // Profile name state synced with user context and localStorage
  const [profileName, setProfileName] = useState(userName);
  
  useEffect(() => {
    if (userName && userName !== "John Doe") {
      setProfileName(userName);
    } else if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("delmar_user_name") || localStorage.getItem("profile_name");
      if (savedName) setProfileName(savedName);
    }
  }, [userName]);

  // Modal Dialogs
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const [reserveCategory, setReserveCategory] = useState<"Piglets" | "Fattening Pigs" | "Crispylicious Lechon" | "Catering Services">("Piglets");
  const [reserveQty, setReserveQty] = useState(1);
  const [reserveDate, setReserveDate] = useState("");
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [pigletType, setPigletType] = useState("regular");
  const [lechonSize, setLechonSize] = useState("15kg");
  const [cateringType, setCateringType] = useState("set-a");
  const [orderType, setOrderType] = useState<OrderType>("Reservation");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");

  // Calendar States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);

  // Selected Order for Tracking Timeline (default to the most recent active or any order)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  useEffect(() => {
    if (customerOrders.length > 0 && !selectedOrderId) {
      const active = customerOrders.find(o => o.status !== "Delivered");
      setSelectedOrderId(active ? active.id : customerOrders[0].id);
    }
  }, [customerOrders, selectedOrderId]);

  const activeTrackingOrder = customerOrders.find(o => o.id === selectedOrderId);
  const tOrder = activeTrackingOrder as any;

  // Event handlers
  const getSelectedUnitPrice = () => {
    if (reserveCategory === "Piglets") {
      const type = PIGLET_TYPES.find((p) => p.key === pigletType);
      return type ? type.price : 3500;
    }
    if (reserveCategory === "Fattening Pigs") {
      return 12000;
    }
    if (reserveCategory === "Crispylicious Lechon") {
      const size = LECHON_SIZES.find((l) => l.key === lechonSize);
      return size ? size.price : 6500;
    }
    if (reserveCategory === "Catering Services") {
      if (cateringType.startsWith("set-")) {
        const buffet = CATERING_BUFFETS.find((b) => b.key === cateringType);
        return buffet ? buffet.price : 250;
      } else {
        const sweet = SWEETS_PACKAGES.find((s) => s.key === cateringType);
        return sweet ? sweet.price : 3650;
      }
    }
    return 0;
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const unitPrice = getSelectedUnitPrice();
    const totalCost = unitPrice * reserveQty;
    const pDate = reserveDate || new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0];

    // Determine product description
    let productDesc = reserveCategory as string;
    if (reserveCategory === "Piglets") {
      const type = PIGLET_TYPES.find((p) => p.key === pigletType);
      productDesc = `Weanling Piglet - ${type ? type.label : "Regular"}`;
    } else if (reserveCategory === "Fattening Pigs") {
      productDesc = "Fattening Hogs";
    } else if (reserveCategory === "Crispylicious Lechon") {
      const size = LECHON_SIZES.find((l) => l.key === lechonSize);
      productDesc = `Crispy Lechon - ${size ? size.label : "15kg"}`;
    } else if (reserveCategory === "Catering Services") {
      if (cateringType.startsWith("set-")) {
        const buffet = CATERING_BUFFETS.find((b) => b.key === cateringType);
        productDesc = `Catering - ${buffet ? buffet.label : "Set A"}`;
      } else {
        const sweet = SWEETS_PACKAGES.find((s) => s.key === cateringType);
        productDesc = `Dessert Package - ${sweet ? sweet.label : "Classic Sweet Corner"}`;
      }
    }

    addReservation({
      category: reserveCategory,
      quantity: reserveQty,
      pickupDate: pDate,
      price: totalCost,
      orderType,
      batchId: orderType === "Paluwagan" ? selectedBatchId : undefined,
    });

    setReserveSuccess(true);
    setTimeout(() => {
      setReserveSuccess(false);
      setIsReserveOpen(false);
      setReserveQty(1);
      setReserveDate("");
      setOrderType("Reservation");
      setSelectedBatchId("");
    }, 2000);
  };


  const deleteNotificationLocal = (id: string) => {
    setLocalNotifs(localNotifs.filter(n => n.id !== id));
  };

  const openChatSupport = () => {
    // Triggers custom event to open AIChatWidget window
    window.dispatchEvent(new Event("open-chat"));
  };

  // Order tracking status helper
  const getTimelineSteps = (status: string) => {
    const steps = [
      { name: "Order Submitted", active: true, desc: "Order details registered" },
      { name: "Approved", active: false, desc: "Stock allocated by staff" },
      { name: "Payment Verified", active: false, desc: "Invoices balanced" },
      { name: "Preparing Order", active: false, desc: "Weight verification & hygiene checks" },
      { name: "Out For Delivery", active: false, desc: "Dispatched from farm bays" },
      { name: "Delivered", active: false, desc: "Arrived at delivery address" },
    ];

    const currentStatus = status.toLowerCase();

    if (currentStatus === "pending") {
      steps[0].active = true;
    } else if (currentStatus === "approved") {
      steps[0].active = true;
      steps[1].active = true;
    } else if (currentStatus === "processing") {
      steps[0].active = true;
      steps[1].active = true;
      steps[2].active = true;
      steps[3].active = true;
    } else if (currentStatus === "out for delivery" || currentStatus === "shipping") {
      steps[0].active = true;
      steps[1].active = true;
      steps[2].active = true;
      steps[3].active = true;
      steps[4].active = true;
    } else if (currentStatus === "delivered" || currentStatus === "completed") {
      steps[0].active = true;
      steps[1].active = true;
      steps[2].active = true;
      steps[3].active = true;
      steps[4].active = true;
      steps[5].active = true;
    }

    return steps;
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedCalendarDay(null);
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedCalendarDay(null);
  };

  const getCalendarEventsForDay = (day: number) => {
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEvents: any[] = [];

    // Map reservations on this day
    customerReservations.forEach(r => {
      if (r.pickupDate === dateString) {
        dayEvents.push({ type: "Reservation", category: getReservationDetails(r.category, r.price, r.quantity), status: r.status, id: r.id });
      }
    });

    // Map orders on this day
    customerOrders.forEach(o => {
      if (o.dateCreated === dateString) {
        dayEvents.push({ type: "Order Placed", category: o.product, status: o.status, id: o.id });
      }
    });

    return dayEvents;
  };

  // Activity feed assembly (combines recent orders and reservations)
  const activities: any[] = [];
  customerOrders.forEach(o => {
    activities.push({
      type: "order",
      title: `Order Submitted: ${o.product}`,
      time: o.dateCreated,
      desc: `Total: ₱${o.totalAmount.toLocaleString()} | Status: ${o.status}`,
      status: o.status
    });
    if (o.status === "Delivered") {
      activities.push({
        type: "delivered",
        title: `Delivery Completed: ${o.product}`,
        time: o.dateCreated, // Mocking time or offset
        desc: "Order safely received and logged on delivery logs.",
        status: o.status
      });
    }
  });

  customerReservations.forEach(r => {
    activities.push({
      type: "reservation",
      title: `Booking: ${getReservationDetails(r.category, r.price, r.quantity)}`,
      time: r.reservationDate || r.pickupDate,
      desc: `${r.quantity} head(s) scheduled | Status: ${r.status}`,
      status: r.status
    });
  });

  // Sort activities newest first
  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // Quick reservation shortcut
  const handleQuickReserve = (category: typeof reserveCategory) => {
    setReserveCategory(category);
    setIsReserveOpen(true);
  };

  return (
    <div className="space-y-10 font-sans pb-16 bg-[#F7F8F6]">
      
      {/* 1. WELCOME HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-[#1B4332] text-white p-8 sm:p-10 shadow-xl border border-emerald-800/20">
        {/* Glow circles & silhouette backdrop */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-600/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl" />
          <svg className="absolute bottom-0 right-0 w-1/2 h-full opacity-10 text-emerald-950" viewBox="0 0 100 100" fill="currentColor" preserveAspectRatio="none">
            <path d="M50,100 L100,50 L100,100 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">Welcome Back, {profileName}</h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl leading-relaxed font-medium">
              Manage your livestock orders, reservations, deliveries, and farm services from one convenient dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0 w-full md:w-auto">
            <Button
              variant="secondary"
              size="md"
              icon={<Plus className="w-4 h-4 text-emerald-950" />}
              className="bg-[#D4AF37] hover:bg-[#c29d2f] text-emerald-950 font-extrabold shadow-md cursor-pointer w-full sm:w-auto"
              onClick={() => setIsReserveOpen(true)}
            >
              New Reservation
            </Button>
          </div>
        </div>


      </div>

      {/* 2. CUSTOMER QUICK STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-slate-200/60 bg-white">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Orders</h4>
            <div className="text-lg font-extrabold text-slate-800"><CountUp end={customerOrders.length} /> Completed</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-slate-200/60 bg-white">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Orders</h4>
            <div className="text-lg font-extrabold text-slate-800"><CountUp end={activeOrders.length} /> In Transit</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-slate-200/60 bg-white">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reservations</h4>
            <div className="text-lg font-extrabold text-slate-800"><CountUp end={activeReservations.length} /> Pending</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-slate-200/60 bg-white">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unread Alerts</h4>
            <div className="text-lg font-extrabold text-slate-800"><CountUp end={localNotifs.filter(n => !n.read).length} /> Updates</div>
          </div>
        </Card>

      </div>

      {/* Grid Layout: Main Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8-col on lg): Interactive widgets */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* A. QUICK ACTIONS SHORTCUT PANEL */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs font-bold text-[#1B4332] uppercase tracking-widest">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              
              <Link href="/products" className="group p-3 bg-white hover:bg-emerald-800 border border-slate-200/60 rounded-2xl hover:text-white transition-all text-center flex flex-col items-center justify-center gap-2.5 shadow-sm hover:shadow-md">
                <div className="p-2 bg-emerald-50 rounded-xl text-[#1B4332] group-hover:bg-white/10 group-hover:text-white">
                  <ShoppingBag className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide">Browse Catalog</span>
              </Link>

              <button onClick={() => handleQuickReserve("Piglets")} className="group p-3 bg-white hover:bg-emerald-800 border border-slate-200/60 rounded-2xl hover:text-white transition-all text-center flex flex-col items-center justify-center gap-2.5 shadow-sm hover:shadow-md cursor-pointer">
                <div className="p-2 bg-emerald-50 rounded-xl text-[#1B4332] group-hover:bg-white/10 group-hover:text-white">
                  <Plus className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide">Order Piglets</span>
              </button>

              <button onClick={() => handleQuickReserve("Catering Services")} className="group p-3 bg-white hover:bg-emerald-800 border border-slate-200/60 rounded-2xl hover:text-white transition-all text-center flex flex-col items-center justify-center gap-2.5 shadow-sm hover:shadow-md cursor-pointer">
                <div className="p-2 bg-emerald-50 rounded-xl text-[#1B4332] group-hover:bg-white/10 group-hover:text-white">
                  <CalendarCheck className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide">Book Catering</span>
              </button>

              <Link href="/customer/orders" className="group p-3 bg-white hover:bg-emerald-800 border border-slate-200/60 rounded-2xl hover:text-white transition-all text-center flex flex-col items-center justify-center gap-2.5 shadow-sm hover:shadow-md">
                <div className="p-2 bg-emerald-50 rounded-xl text-[#1B4332] group-hover:bg-white/10 group-hover:text-white">
                  <Truck className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide">View Orders</span>
              </Link>

              <button onClick={openChatSupport} className="group p-3 bg-white hover:bg-emerald-800 border border-slate-200/60 rounded-2xl hover:text-white transition-all text-center flex flex-col items-center justify-center gap-2.5 shadow-sm hover:shadow-md cursor-pointer col-span-2 sm:col-span-1">
                <div className="p-2 bg-emerald-50 rounded-xl text-[#1B4332] group-hover:bg-white/10 group-hover:text-white">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide">Help Desk</span>
              </button>

            </div>
          </div>

          {/* B. ACTIVE ORDER TRACKING & TIMELINE */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-xs font-bold text-[#1B4332] uppercase tracking-widest">Order Dispatch & Timeline</h3>
              <Link href="/customer/orders" className="text-[11px] font-bold text-[#1B4332] hover:underline flex items-center gap-1">
                History Catalog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {customerOrders.length === 0 ? (
              <Card className="p-8 text-center text-xs text-slate-500 font-medium">
                No orders registered yet. Shop piglets or fresh meat cut packages to initialize timelines.
              </Card>
            ) : (
              <div className="space-y-4">
                
                {/* List selector of orders */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {customerOrders.map(o => (
                    <button
                      key={o.id}
                      onClick={() => setSelectedOrderId(o.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all border ${
                        selectedOrderId === o.id
                          ? "bg-[#1B4332] border-[#1B4332] text-white shadow-sm"
                          : "bg-white border-slate-250 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {o.id} ({o.status})
                    </button>
                  ))}
                </div>

                {activeTrackingOrder && (
                  <Card className="p-6 space-y-6 bg-white border border-slate-200/60 shadow-sm">
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-500">Order ID: <span className="text-slate-800 font-extrabold">{activeTrackingOrder.id}</span></div>
                        <h4 className="text-sm font-extrabold text-[#1B4332]">{activeTrackingOrder.product}</h4>
                      </div>
                      <div className="text-right sm:text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Est. Dispatch Date</span>
                        <span className="text-xs font-extrabold text-slate-700">{activeTrackingOrder.dateCreated}</span>
                      </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="space-y-4">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Dispatch Pipeline</span>
                      
                      <div className="relative pt-2">
                        {/* Horizontal Line background */}
                        <div className="absolute top-[18px] left-4 right-4 h-1 bg-slate-200 -z-0 rounded-full hidden sm:block" />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-6 gap-6 sm:gap-2 relative z-10">
                          {getTimelineSteps(activeTrackingOrder.status).map((step, idx) => (
                            <div key={idx} className="flex sm:flex-col items-center gap-3 sm:gap-2.5 text-left sm:text-center">
                              {/* Step indicator circle */}
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 shadow-sm ${
                                step.active
                                  ? "bg-emerald-600 border-emerald-600 text-white"
                                  : "bg-white border-slate-300 text-slate-400"
                              }`}>
                                {step.active ? (
                                  <Check className="w-4 h-4 stroke-[3]" />
                                ) : (
                                  <span className="text-xs font-extrabold">{idx + 1}</span>
                                )}
                              </div>
                              
                              <div className="space-y-0.5">
                                <div className={`text-[10.5px] font-bold ${step.active ? "text-[#1B4332] font-extrabold" : "text-slate-400"}`}>
                                  {step.name}
                                </div>
                                <span className="text-[9px] text-slate-400 font-semibold block leading-tight max-w-[100px] mx-auto hidden sm:block">
                                  {step.desc}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {tOrder && tOrder.deliveryOrPickup === "Delivery" && (
                      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-[#080d0a]/30 rounded-2xl border border-slate-100">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase block tracking-wider">Assigned Delivery Driver</span>
                          <span className="font-extrabold text-slate-800 block">{tOrder.driverName || "Assigning Courier..."}</span>
                        </div>
                        <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-[#080d0a]/30 rounded-2xl border border-slate-100">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase block tracking-wider">Estimated Transit Time</span>
                          <span className="font-extrabold text-slate-800 block">{tOrder.estimatedArrival || "Calculating ETA..."}</span>
                        </div>
                        <div className="sm:col-span-2 space-y-1.5 p-3.5 bg-slate-50 dark:bg-[#080d0a]/30 rounded-2xl border border-slate-100">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase block tracking-wider">Transit Destination Address</span>
                          <span className="font-semibold text-slate-700 block">{tOrder.deliveryAddress || userAddress}</span>
                        </div>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* C. MY RESERVATIONS CARDS */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-xs font-bold text-[#1B4332] uppercase tracking-widest">My Reservations</h3>
            </div>

            {customerReservations.length === 0 ? (
              <Card className="p-8 text-center text-xs text-slate-500 font-medium">
                No active bookings. Choose "Book Catering" to reserve weanlings or a spit-roasting schedule.
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {customerReservations.slice(0, 4).map((r) => {
                  const countdown = getCountdown(r.pickupDate);
                  return (
                    <Card key={r.id} className="p-5 space-y-4 hover:shadow-md transition-shadow bg-white border border-slate-200/60 relative overflow-hidden flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            r.status === "Approved" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                            r.status === "Pending" ? "bg-amber-50 border-amber-200 text-amber-700 animate-pulse" :
                            "bg-slate-100 border-slate-250 text-slate-600"
                          }`}>
                            {r.status}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">ID: {r.id}</span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-sm font-extrabold text-[#1B4332]">{getReservationDetails(r.category, r.price, r.quantity)}</h4>
                          <span className="text-[11px] text-slate-500 font-medium block">Quantity: **{r.quantity}** units</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.pickupDate}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border ${countdown.color}`}>
                          {countdown.text}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* D. RECENT ACTIVITY TIMELINE */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs font-bold text-[#1B4332] uppercase tracking-widest">Recent Activity Feed</h3>
            <Card className="p-6 bg-white border border-slate-200/60">
              {activities.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-4 font-medium">No recent activities on profile feed.</div>
              ) : (
                <div className="relative border-l border-slate-200 ml-3.5 pl-6 space-y-6">
                  {activities.slice(0, 4).map((act, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                        act.type === "order" ? "bg-emerald-600" :
                        act.type === "reservation" ? "bg-amber-500" :
                        "bg-blue-500"
                      }`} />
                      
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h5 className="text-[11.5px] font-extrabold text-slate-800">{act.title}</h5>
                          <span className="text-[9px] text-slate-400 font-bold">{act.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{act.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

        </div>

        {/* Right Column (4-col on lg): Widgets, Profile, Alerts */}
        <div className="lg:col-span-4 space-y-8">

          {/* PALUWAGAN LEDGER SUMMARY & TRACKER */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs font-bold text-[#1B4332] uppercase tracking-widest">Paluwagan Savings Ledger</h3>
            {customerOrders.filter(o => o.orderType === "Paluwagan").length === 0 ? (
              <Card className="p-6 bg-white border border-slate-200/60 rounded-3xl text-center space-y-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">No Paluwagan Plan</span>
                <p className="text-xs text-slate-500 font-medium">Join a Paluwagan batch to save and pay for piglets or catering programs in convenient monthly installments.</p>
                <button 
                  onClick={openChatSupport}
                  className="text-xs text-[#2D6A4F] hover:text-[#1B4332] font-bold hover:underline cursor-pointer"
                >
                  Ask support about batches
                </button>
              </Card>
            ) : (
              customerOrders.filter(o => o.orderType === "Paluwagan").slice(0, 1).map(pOrder => {
                const totalPaid = pOrder.totalAmount - (pOrder.remainingBalance || 0);
                const progressPct = Math.round((totalPaid / pOrder.totalAmount) * 100) || 0;
                const batchName = paluwaganBatches.find(b => b.id === pOrder.batchId)?.name || "Active Batch";
                
                return (
                  <Link key={pOrder.id} href="/customer/paluwagan" className="block group">
                    <Card className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm hover:shadow-md group-hover:border-emerald-500/50 transition-all relative overflow-hidden space-y-6 cursor-pointer">
                      {/* Top Accent line */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#2D6A4F] group-hover:bg-[#1B4332] transition-colors" />
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-extrabold text-[#2D6A4F] uppercase tracking-wider block bg-emerald-50 px-2 py-0.5 rounded-md w-max">
                            Paluwagan Active
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-800 mt-1">{pOrder.product}</h4>
                          <span className="text-[10px] text-slate-405 font-mono font-bold">Plan ID: {pOrder.id}</span>
                        </div>
                      </div>

                      {/* Financial stats */}
                      <div className="grid grid-cols-2 gap-3.5 border-t border-slate-100 pt-4">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Active Batch</span>
                          <span className="text-xs font-extrabold text-slate-800">{batchName}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Contract</span>
                          <span className="text-xs font-extrabold text-slate-800">₱{pOrder.totalAmount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Paid</span>
                          <span className="text-xs font-extrabold text-emerald-600">₱{totalPaid.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Remaining Balance</span>
                          <span className="text-xs font-extrabold text-rose-600">₱{(pOrder.remainingBalance || 0).toLocaleString()}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Next Due Date</span>
                          <span className="text-xs font-extrabold text-amber-600 font-mono">{pOrder.nextDueDate || "Fully Paid"}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 border-t border-slate-100 pt-4">
                        <div className="flex justify-between text-[10px] font-extrabold text-slate-550 uppercase tracking-wide">
                          <span>Payment Progress</span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className="bg-emerald-600 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-center pt-2 border-t border-slate-100">
                        <span className="text-xs font-bold text-emerald-700 group-hover:text-emerald-950 group-hover:underline flex items-center justify-center gap-1.5 transition-all">
                          View Paluwagan Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>

          {/* F. UPCOMING EVENTS & CALENDAR WIDGET */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs font-bold text-[#1B4332] uppercase tracking-widest">Upcoming Schedules</h3>
            <div className="p-6 bg-white dark:bg-[#0f1412] border border-slate-200/60 dark:border-emerald-950/40 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 space-y-6 relative overflow-hidden">
              {/* Premium gradient top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#F7D070] to-[#D4AF37] opacity-90" />
              
              {/* Month Selector */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-[#2D6A4F] dark:text-[#52b788] rounded-xl">
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-widest font-sans">
                    {currentDate.toLocaleString("default", { month: "long" })} {year}
                  </span>
                </div>
                <div className="flex gap-1 bg-slate-50 dark:bg-[#080d0a]/50 p-1 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <button onClick={prevMonth} className="p-1.5 hover:bg-[#1B4332] hover:text-white dark:hover:bg-emerald-800 rounded-lg transition-all cursor-pointer text-slate-500 hover:scale-105 active:scale-95">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={nextMonth} className="p-1.5 hover:bg-[#1B4332] hover:text-white dark:hover:bg-emerald-800 rounded-lg transition-all cursor-pointer text-slate-500 hover:scale-105 active:scale-95">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Days header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold text-[#2D6A4F] dark:text-emerald-400/80 uppercase tracking-widest">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
              </div>

              {/* Calendar Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${year}-${month}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-7 gap-1.5"
                >
                  {/* Empty cells before the 1st of month */}
                  {Array.from({ length: firstDayIndex }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="h-9 w-full" />
                  ))}

                  {/* Days of month */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                    const events = getCalendarEventsForDay(day);
                    const isSelected = selectedCalendarDay === day;

                    return (
                      <button
                        key={`day-${day}`}
                        onClick={() => setSelectedCalendarDay(isSelected ? null : day)}
                        className={`h-9 w-full rounded-full text-xs font-bold flex flex-col items-center justify-between py-1 transition-all cursor-pointer border relative hover:scale-105 active:scale-95 ${
                          isSelected 
                            ? "bg-gradient-to-tr from-[#1B4332] to-[#2D6A4F] text-white border-[#1B4332] shadow-md shadow-emerald-950/20 scale-105" 
                            : isToday 
                              ? "bg-[#D4AF37]/10 dark:bg-[#D4AF37]/5 border-2 border-[#D4AF37] text-[#1B4332] dark:text-[#D4AF37] font-extrabold" 
                              : events.length > 0 
                                ? "bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100/50 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-450 hover:bg-emerald-50 dark:hover:bg-emerald-950/25" 
                                : "bg-white dark:bg-[#0f1412] border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#151b19]"
                        }`}
                      >
                        <span>{day}</span>
                        
                        {/* Event indicators */}
                        {events.length > 0 && (
                          <div className="flex gap-0.5 justify-center mb-0.5">
                            {events.map((e, index) => (
                              <span
                                key={index}
                                className={`w-1 h-1 rounded-full ${
                                  isSelected 
                                    ? "bg-white" 
                                    : e.type === "Reservation" 
                                      ? "bg-[#D4AF37]" 
                                      : "bg-emerald-600 dark:bg-emerald-500"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {/* Calendar event description list when clicked */}
              <AnimatePresence>
                {selectedCalendarDay ? (
                  <motion.div
                    key="events-list"
                    initial={{ opacity: 0, height: 0, y: 10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-emerald-50/25 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20 space-y-3.5 text-xs transition-all duration-300">
                      <div className="font-extrabold text-[#1B4332] dark:text-emerald-400 border-b border-emerald-100/60 dark:border-emerald-900/40 pb-2 flex justify-between items-center">
                        <span>Events for {currentDate.toLocaleString("default", { month: "long" })} {selectedCalendarDay}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                      </div>
                      {getCalendarEventsForDay(selectedCalendarDay).length === 0 ? (
                        <p className="text-[10px] text-slate-450 dark:text-slate-505 font-semibold italic text-center py-2">No dispatch or reservation scheduled on this date.</p>
                      ) : (
                        <div className="space-y-2.5">
                          {getCalendarEventsForDay(selectedCalendarDay).map((ev, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-[#141b18] rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-sm transition-all duration-200">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl shrink-0 ${
                                  ev.type === "Reservation" 
                                    ? "bg-amber-50 dark:bg-amber-950/20 text-[#D4AF37]" 
                                    : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450"
                                }`}>
                                  {ev.type === "Reservation" ? (
                                    <CalendarCheck className="w-4 h-4" />
                                  ) : (
                                    <ShoppingBag className="w-4 h-4" />
                                  )}
                                </div>
                                <div className="space-y-0.5">
                                  <span className="font-extrabold text-slate-800 dark:text-slate-100 block leading-tight">{ev.category}</span>
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">{ev.type} | {ev.id}</span>
                                </div>
                              </div>
                              <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full border shrink-0 ${
                                ev.status === "Approved" ? "bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400" :
                                ev.status === "Pending" ? "bg-amber-50 border-amber-250 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400 animate-pulse" :
                                "bg-slate-50 border-slate-200 text-slate-500 dark:bg-[#080d0a] dark:border-slate-850 dark:text-slate-400"
                              }`}>
                                {ev.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="events-placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3.5 bg-slate-50/50 dark:bg-[#080d0a]/30 rounded-2xl border border-slate-100 dark:border-slate-850 text-[10px] font-semibold text-slate-450 dark:text-slate-505 text-center flex items-center justify-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse shrink-0" />
                    <span>Click any date with marker dots to view schedules.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* G. NOTIFICATIONS CENTER */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-xs font-bold text-[#1B4332] uppercase tracking-widest">Notification Alerts</h3>
              {localNotifs.length > 0 && (
                <button
                  onClick={() => {
                    clearNotifications();
                    setLocalNotifs([]);
                  }}
                  className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            <Card className="p-4 bg-white border border-slate-200/60 shadow-sm space-y-3">
              {localNotifs.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-6 font-medium">All notifications cleared.</div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {localNotifs.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-2xl border transition-all flex justify-between gap-3 text-xs ${
                        notif.read ? "bg-slate-50/50 border-slate-100" : "bg-[#2D6A4F]/5 border-emerald-100 text-[#1B4332]"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          {!notif.read && <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full shrink-0" />}
                          <h5 className="font-extrabold">{notif.title}</h5>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold leading-normal">{notif.message}</p>
                      </div>

                      <div className="flex flex-col items-end justify-between shrink-0">
                        <button
                          onClick={() => deleteNotificationLocal(notif.id)}
                          className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {!notif.read && (
                          <button
                            onClick={() => {
                              markNotificationRead(notif.id);
                              setLocalNotifs(localNotifs.map(n => n.id === notif.id ? { ...n, read: true } : n));
                            }}
                            className="text-[9px] font-bold text-emerald-700 hover:underline cursor-pointer"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

        </div>

      </div>

      {/* Reservation Dialog Modal */}
      <Modal isOpen={isReserveOpen} onClose={() => setIsReserveOpen(false)} title="Request Customer Reservation">
        {reserveSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <h4 className="font-heading text-base font-bold text-slate-800">Reservation Registered!</h4>
            <p className="text-xs text-slate-500 font-medium">Successfully logged. The reservation lists will update instantly.</p>
          </div>
        ) : (
          <form onSubmit={handleCreateReservation} className="space-y-4 text-xs font-sans">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Product Category</label>
              <select
                value={reserveCategory}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setReserveCategory(val);
                  if (val !== "Crispylicious Lechon" && orderType === "Paluwagan") {
                    setOrderType("Reservation");
                  }
                }}
                className="w-full text-xs px-3 py-2.5 border border-slate-250 rounded-xl font-medium focus:ring-2 focus:ring-[#1B4332]/20"
              >
                <option value="Piglets">Weanling Piglets (Weanlings & Breeders)</option>
                <option value="Fattening Pigs">Fattening Pigs (₱12,000/head)</option>
                <option value="Crispylicious Lechon">Crispylicious Lechon (charcoal roasted)</option>
                <option value="Catering Services">Catering Services & Dessert Packages</option>
              </select>
            </div>

            {/* Sub-type selections */}
            {reserveCategory === "Piglets" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Piglet Sub-Type</label>
                <select
                  value={pigletType}
                  onChange={(e) => setPigletType(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-250 rounded-xl font-semibold focus:ring-2 focus:ring-[#1B4332]/20"
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
                <label className="text-[10px] font-bold text-slate-700 uppercase">Lechon Size / Weight Tiers</label>
                <select
                  value={lechonSize}
                  onChange={(e) => setLechonSize(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-250 rounded-xl font-semibold focus:ring-2 focus:ring-[#1B4332]/20"
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
                <label className="text-[10px] font-bold text-slate-700 uppercase">Catering / Sweets Package Selection</label>
                <select
                  value={cateringType}
                  onChange={(e) => setCateringType(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-250 rounded-xl font-semibold focus:ring-2 focus:ring-[#1B4332]/20"
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
              <label className="text-[10px] font-bold text-slate-700 uppercase">
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
                className="w-full text-xs px-3 py-2.5 border border-slate-250 rounded-xl font-semibold focus:ring-2 focus:ring-[#1B4332]/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Preferred Pickup Date</label>
              <input
                type="date"
                required
                value={reserveDate}
                onChange={(e) => setReserveDate(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-250 rounded-xl font-medium focus:ring-2 focus:ring-[#1B4332]/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Order Type / Payment Method</label>
              <select
                value={orderType}
                onChange={(e) => {
                  const val = e.target.value as OrderType;
                  setOrderType(val);
                  if (val === "Paluwagan" && paluwaganBatches.length > 0 && !selectedBatchId) {
                    setSelectedBatchId(paluwaganBatches[0].id);
                  }
                }}
                className="w-full text-xs px-3 py-2.5 border border-slate-250 rounded-xl font-semibold focus:ring-2 focus:ring-[#1B4332]/20"
              >
                <option value="Reservation">Reservation (Standard 50% downpayment)</option>
                <option value="Cash">Cash (Full payout)</option>
                {reserveCategory === "Crispylicious Lechon" && (
                  <option value="Paluwagan" disabled={!isApprovedMember}>
                    Paluwagan (rotating bi-weekly savings) {!isApprovedMember ? " - (Approved members only)" : ""}
                  </option>
                )}
              </select>
              {reserveCategory === "Crispylicious Lechon" && !isApprovedMember && (
                <span className="text-[10px] text-rose-600 font-bold block mt-1">
                  Paluwagan is available only for approved Paluwagan members.
                </span>
              )}
            </div>

            {orderType === "Paluwagan" && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Paluwagan Batch Selection</label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-250 rounded-xl font-semibold focus:ring-2 focus:ring-[#1B4332]/20"
                >
                  <option value="" disabled>-- Select Paluwagan Batch --</option>
                  {paluwaganBatches.filter(b => b.status === "Active").map(batch => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name} (Starts: {batch.startDate})
                    </option>
                  ))}
                </select>
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
                  <div className="text-[10.5px] font-bold text-emerald-800 uppercase">Paluwagan Payment Preview</div>
                  <div className="text-[10px] text-slate-550 font-semibold leading-relaxed">
                    • **25% Down Payment:** ₱{(getSelectedUnitPrice() * reserveQty * 0.25).toLocaleString()}  
                    • **Installment (x4 every 15 days):** ₱{(getSelectedUnitPrice() * reserveQty * 0.75 / 4).toLocaleString()}  
                    • **Schedule:** Created automatically upon admin approval.
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between font-bold text-slate-700">
              <span>Unit Cost: ₱{getSelectedUnitPrice().toLocaleString()}</span>
              <span>Total Cost: ₱{(getSelectedUnitPrice() * reserveQty).toLocaleString()}</span>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full bg-[#1B4332] text-white hover:bg-emerald-800">
                Confirm Reservation
              </Button>
            </div>
          </form>
        )}
      </Modal>



    </div>
  );
}

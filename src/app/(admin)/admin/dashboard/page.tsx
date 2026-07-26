"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import {
  ClipboardList,
  Layers,
  CalendarDays,
  Truck,
  TrendingUp,
  Users,
  Bell,
  ArrowRight,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Coins,
  CheckCircle2,
  BrainCircuit,
  PiggyBank,
  Check,
  X,
  Search,
  Filter,
  Flame,
  ArrowUpRight,
  ChevronRight,
  RefreshCw,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper for count-up animation
const CountUp: React.FC<{ value: number; prefix?: string; suffix?: string }> = ({ value, prefix = "", suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 1000; // ms
    const increment = end / (duration / 16); // ~60fps
    let timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(end);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
};

export default function AdminDashboard() {
  const { 
    inventory, 
    reservations, 
    orders, 
    notifications, 
    updateReservationStatus, 
    updateOrderStatus,
    members,
    batches,
    memberPayments,
    paluwaganBatches,
    auditLogs
  } = useRole();

  const [timeGreeting, setTimeGreeting] = useState("Good Morning");
  const [chartFilter, setChartFilter] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [activeChartTab, setActiveChartTab] = useState<"sales" | "revenue" | "inventory" | "reservations">("revenue");
  
  // New States for Member CRM & Finance Dashboard
  const [dashboardView, setDashboardView] = useState<"operations" | "members">("operations");
  const [memberChartTab, setMemberChartTab] = useState<"weekly" | "monthly" | "sales">("weekly");
  
  // Search & Filter States
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");

  // Dynamic greetings
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 18) {
      setTimeGreeting("Good Evening");
    } else if (hours >= 12) {
      setTimeGreeting("Good Afternoon");
    } else {
      setTimeGreeting("Good Morning");
    }
  }, []);

  // calculations
  const totalItems = inventory.length;
  const lowStockCount = inventory.filter(item => item.quantity <= item.minStockLevel).length;
  
  // Active Orders (Processing or Shipped)
  const activeOrdersCount = orders.filter((o) => o.status === "Processing" || o.status === "Shipped").length;
  
  // Pending Reservations
  const pendingReservationsCount = reservations.filter((r) => r.status === "Pending").length;
  
  // Total Valuation
  const totalStockValue = inventory.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
  
  // Total Sales (Paid and not Cancelled)
  const totalSalesVal = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  // === MEMBER CRM & FINANCIALS CALCULATIONS ===
  const totalMembers = members.filter(m => m.membershipStatus !== "Archived").length;
  const activeMembers = members.filter(m => m.membershipStatus === "Active").length;
  
  // Cash Orders: Count of standard piggery orders that are Paid and not Cancelled
  const cashOrdersCount = orders.filter(o => o.paymentStatus === "Paid" && o.status !== "Cancelled").length;
  
  // Total Collections: sum of amountPaid from memberPayments
  const totalCollections = memberPayments.reduce((sum, p) => sum + p.amountPaid, 0);
  
  // Outstanding Balances: sum of (totalDue - totalPaid) for active/inactive members
  const totalOutstanding = members
    .filter(m => m.membershipStatus !== "Archived")
    .reduce((sum, m) => {
      const paid = memberPayments.filter(p => p.memberId === m.id).reduce((s, p) => s + p.amountPaid, 0);
      return sum + Math.max(0, m.totalDue - paid);
    }, 0);
    
  // Today's Collections
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCollections = memberPayments
    .filter(p => p.paymentDate === todayStr)
    .reduce((sum, p) => sum + p.amountPaid, 0);
    
  // Monthly Revenue: collections in current month + delivered orders in current month
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const monthlyCollections = memberPayments
    .filter(p => p.paymentDate.startsWith(currentMonthStr))
    .reduce((sum, p) => sum + p.amountPaid, 0);
  const monthlyOrderSales = orders
    .filter(o => o.status === "Delivered" && o.dateCreated.startsWith(currentMonthStr))
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const monthlyRevenue = monthlyCollections + monthlyOrderSales;
  
  // Pending Payments: members with outstanding balance > 0
  const pendingPaymentsCount = members
    .filter(m => m.membershipStatus !== "Archived")
    .filter(m => {
      const paid = memberPayments.filter(p => p.memberId === m.id).reduce((s, p) => s + p.amountPaid, 0);
      return m.totalDue - paid > 0;
    }).length;

  // Upcoming Paluwagan due installments watcher
  const paluwaganDuePayments = React.useMemo(() => {
    const list: Array<{
      orderId: string;
      customerName: string;
      product: string;
      batchName: string;
      installmentNumber: number;
      dueDate: string;
      amountDue: number;
      status: "Pending" | "Paid" | "Overdue";
      daysRemaining: number;
    }> = [];

    const todayStr = new Date().toISOString().split("T")[0];
    const today = new Date(todayStr);

    orders.forEach(order => {
      if (order.orderType === "Paluwagan" && order.paluwaganSchedule) {
        const batchObj = paluwaganBatches.find(b => b.id === order.batchId);
        
        order.paluwaganSchedule.forEach(item => {
          if (item.status === "Pending" || item.status === "Overdue") {
            const dueDate = new Date(item.dueDate);
            const timeDiff = dueDate.getTime() - today.getTime();
            const daysRemaining = Math.round(timeDiff / (1000 * 60 * 60 * 24));

            list.push({
              orderId: order.id,
              customerName: order.customerName,
              product: order.product,
              batchName: batchObj ? batchObj.name : "Unassigned",
              installmentNumber: item.installmentNumber,
              dueDate: item.dueDate,
              amountDue: item.amountDue,
              status: item.status,
              daysRemaining
            });
          }
        });
      }
    });

    return list.sort((a, b) => {
      if (a.status === "Overdue" && b.status !== "Overdue") return -1;
      if (a.status !== "Overdue" && b.status === "Overdue") return 1;
      return a.daysRemaining - b.daysRemaining;
    });
  }, [orders, paluwaganBatches]);

  // Weekly Collections Chart Data (Monday-Sunday)
  const getWeeklyCollectionsData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const values = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayTotal = memberPayments
        .filter(p => p.paymentDate === dateStr)
        .reduce((sum, p) => sum + p.amountPaid, 0);
      values[i] = dayTotal;
    }
    
    const sum = values.reduce((a, b) => a + b, 0);
    if (sum === 0) {
      // Fallback mockup numbers bound to totalCollections for visual realism if no live data
      const scale = Math.max(1, totalCollections / 32500);
      return { labels: days, values: [3000, 5000, 1500, 4000, 6000, 8500, 4500].map(v => Math.round(v * scale)) };
    }
    return { labels: days, values };
  };

  // Monthly Collections Chart Data
  const getMonthlyCollectionsData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const values = Array(12).fill(0);
    memberPayments.forEach(p => {
      const monthIdx = new Date(p.paymentDate).getMonth();
      if (monthIdx >= 0 && monthIdx < 12) {
        values[monthIdx] += p.amountPaid;
      }
    });
    const sum = values.reduce((a, b) => a + b, 0);
    if (sum === 0) {
      const scale = Math.max(1, totalCollections / 425000);
      return { labels: months, values: [15000, 20000, 18000, 25000, 30000, 35000, 45000, 40000, 42000, 48000, 50000, 55000].map(v => Math.round(v * scale)) };
    }
    return { labels: months, values };
  };

  // Sales Overview Chart Data (Piggery Orders + Collections)
  const getSalesOverviewData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const values = Array(12).fill(0);
    orders.filter(o => o.status === "Delivered").forEach(o => {
      const monthIdx = new Date(o.dateCreated).getMonth();
      if (monthIdx >= 0 && monthIdx < 12) {
        values[monthIdx] += o.totalAmount;
      }
    });
    memberPayments.forEach(p => {
      const monthIdx = new Date(p.paymentDate).getMonth();
      if (monthIdx >= 0 && monthIdx < 12) {
        values[monthIdx] += p.amountPaid;
      }
    });
    const sum = values.reduce((a, b) => a + b, 0);
    if (sum === 0) {
      return { labels: months, values: [25000, 32000, 28000, 38000, 45000, 52000, 68000, 58000, 62000, 71000, 75000, 85000] };
    }
    return { labels: months, values };
  };

  // Payment Trends (GCash vs Cash vs Bank Transfer)
  const getPaymentMethodsBreakdown = () => {
    let gcash = memberPayments.filter(p => p.paymentMethod.toLowerCase() === "gcash").reduce((sum, p) => sum + p.amountPaid, 0);
    let cash = memberPayments.filter(p => p.paymentMethod.toLowerCase() === "cash").reduce((sum, p) => sum + p.amountPaid, 0);
    let bank = memberPayments.filter(p => p.paymentMethod.toLowerCase().includes("bank") || p.paymentMethod.toLowerCase().includes("transfer")).reduce((sum, p) => sum + p.amountPaid, 0);
    
    if (gcash === 0 && cash === 0 && bank === 0) {
      gcash = 18500;
      cash = 12000;
      bank = 8500;
    }
    
    const total = gcash + cash + bank;
    return [
      { name: "GCash", value: gcash, percentage: total > 0 ? (gcash / total) * 105 - 5 : 0, color: "bg-blue-500", stroke: "#3B82F6" },
      { name: "Cash", value: cash, percentage: total > 0 ? (cash / total) * 105 - 5 : 0, color: "bg-emerald-500", stroke: "#10B981" },
      { name: "Bank Transfer", value: bank, percentage: total > 0 ? (bank / total) * 105 - 5 : 0, color: "bg-amber-500", stroke: "#F59E0B" }
    ];
  };

  // Growth percentages (mocked, but bound dynamically to totals for realism)
  const mockGrowth = {
    revenue: "+14.8%",
    inventory: "+6.2%",
    orders: "+18.3%",
    reservations: "-2.4%",
    sales: "+12.4%",
    warnings: "-15.0%"
  };

  // Mock Sparklines paths
  const sparklinePaths = {
    revenue: "M0,25 Q15,5 30,20 T60,5 T90,22 T120,8",
    products: "M0,28 Q15,22 30,25 T60,15 T90,12 T120,5",
    orders: "M0,20 Q15,10 30,25 T60,12 T90,18 T120,4",
    reservations: "M0,10 Q15,18 30,5 T60,25 T90,20 T120,15",
    sales: "M0,28 Q15,15 30,20 T60,10 T90,8 T120,4",
    warnings: "M0,5 Q15,22 30,12 T60,25 T90,28 T120,29"
  };

  // Dynamic Chart SVG data based on filter & tab
  const getChartData = () => {
    const dataPoints: Record<typeof activeChartTab, Record<typeof chartFilter, { labels: string[]; values: number[] }>> = {
      revenue: {
        weekly: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          values: [42000, 38000, 58000, 48000, 62000, 85000, 95000]
        },
        monthly: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          values: [120000, 145000, 130000, 165000, 195000, 220000, 259400, 240000, 280000, 310000, 290000, 340000]
        },
        yearly: {
          labels: ["2023", "2024", "2025", "2026"],
          values: [1200000, 1850000, 2400000, 3100000]
        }
      },
      sales: {
        weekly: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          values: [4, 6, 8, 5, 9, 12, 15]
        },
        monthly: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          values: [18, 22, 25, 32, 28, 41, 48, 43, 52, 60, 58, 65]
        },
        yearly: {
          labels: ["2023", "2024", "2025", "2026"],
          values: [180, 260, 380, 520]
        }
      },
      inventory: {
        weekly: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          values: [85, 87, 86, 92, 90, 88, 95]
        },
        monthly: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          values: [75, 78, 82, 80, 85, 89, 94, 91, 95, 98, 102, 110]
        },
        yearly: {
          labels: ["2023", "2024", "2025", "2026"],
          values: [450, 680, 920, 1240]
        }
      },
      reservations: {
        weekly: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          values: [2, 1, 4, 3, 5, 8, 6]
        },
        monthly: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          values: [8, 12, 10, 14, 18, 15, 21, 19, 24, 28, 25, 30]
        },
        yearly: {
          labels: ["2023", "2024", "2025", "2026"],
          values: [95, 140, 190, 260]
        }
      }
    };
    return dataPoints[activeChartTab][chartFilter];
  };

  const chartData = getChartData();
  const maxVal = Math.max(...chartData.values) * 1.15;
  const chartHeight = 220;
  const chartWidth = 580;

  // Generate SVG path for main dashboard line chart
  const generateLinePath = () => {
    if (chartData.values.length === 0) return "";
    const stepX = chartWidth / (chartData.values.length - 1);
    return chartData.values.map((val, index) => {
      const x = index * stepX;
      const y = chartHeight - (val / maxVal) * chartHeight;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    }).join(" ");
  };

  // Generate SVG gradient area path
  const generateAreaPath = () => {
    const linePath = generateLinePath();
    if (!linePath) return "";
    const stepX = chartWidth / (chartData.values.length - 1);
    const lastX = (chartData.values.length - 1) * stepX;
    return `${linePath} L${lastX},${chartHeight} L0,${chartHeight} Z`;
  };

  // Live Inventory specific categories overview
  const pigletsStock = inventory.filter(i => i.category === "Piglets").reduce((acc, c) => acc + c.quantity, 0);
  const hogsStock = inventory.filter(i => i.category === "Fattening Pigs").reduce((acc, c) => acc + c.quantity, 0);
  const porkStock = inventory.filter(i => i.category === "Fresh Pork Meat").reduce((acc, c) => acc + c.quantity, 0);

  // Recent operational logs (Activity Feed)
  const recentActivities = [
    { id: "act-1", text: "New reservation booking RES-115 received from Maria Lopez", time: "10 mins ago", type: "booking" },
    { id: "act-2", text: "Fresh Pork Belly stock level updated (+15kg)", time: "1 hour ago", type: "stock" },
    { id: "act-3", text: "Crispylicious Lechon booking for catering ORD-981 approved", time: "2 hours ago", type: "order" },
    { id: "act-4", text: "GCash payment of ₱8,500 verified for Order ORD-9021", time: "4 hours ago", type: "payment" },
    { id: "act-5", text: "Low stock alert triggered: Duroc Piglets (DPF-0102)", time: "1 day ago", type: "alert" }
  ];

  // Dynamic filter for Recent Orders table
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.product.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.id.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === "All" || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });  return (
    <div className="space-y-8 font-sans pb-12 transition-colors duration-300 text-slate-800 dark:text-slate-100">
      
      {/* 1. EXECUTIVE DASHBOARD HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-br from-[#1B4332] to-[#0b291d] dark:from-[#0a1812] dark:to-[#050b08] p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-950 dark:border-emerald-950/60 relative overflow-hidden transition-all duration-300">
        {/* Glow circles */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#2D6A4F]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/5">
            Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            {timeGreeting}, Elena Delmar
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 font-medium">
            Here's today's farm performance. Overall biosecurity systems are normal.
          </p>
        </div>

        {/* Dynamic overview summary cards in header */}
        <div className="flex flex-wrap items-center gap-4 z-10 w-full lg:w-auto">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xs py-2.5 px-4 rounded-2xl flex items-center gap-3">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <div>
              <div className="text-[9px] font-bold text-slate-350 uppercase">Active Hogs</div>
              <div className="text-sm font-extrabold text-white">{pigletsStock + hogsStock} head</div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur-xs py-2.5 px-4 rounded-2xl flex items-center gap-3">
            <span className="w-2 h-2 bg-[#D4AF37] rounded-full" />
            <div>
              <div className="text-[9px] font-bold text-slate-350 uppercase">Daily Revenue</div>
              <div className="text-sm font-extrabold text-white">₱42,000</div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur-xs py-2.5 px-4 rounded-2xl flex items-center gap-3">
            <span className="w-2 h-2 bg-blue-400 rounded-full" />
            <div>
              <div className="text-[9px] font-bold text-slate-350 uppercase">Approvals</div>
              <div className="text-sm font-extrabold text-white">{pendingReservationsCount} pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW SWITCHER TABS */}
      <div className="flex bg-white dark:bg-[#0f1412] p-1 rounded-2xl border border-slate-100 dark:border-[#182620] shadow-xs max-w-xs sm:max-w-md">
        <button
          onClick={() => setDashboardView("operations")}
          className={`flex-grow py-2 px-4 rounded-xl text-[10.5px] font-extrabold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
            dashboardView === "operations"
              ? "bg-[#1B4332] text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Farm Operations
        </button>
        <button
          onClick={() => setDashboardView("members")}
          className={`flex-grow py-2 px-4 rounded-xl text-[10.5px] font-extrabold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
            dashboardView === "members"
              ? "bg-[#1B4332] text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Member CRM & Finance
        </button>
      </div>

      {dashboardView === "operations" ? (
        <>
          {/* 2. KPI GRID SECTION WITH SPARKLINES & ANIMATED COUNTERS */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            
            {/* KPI 1: Total Valuation */}
            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-4.5 rounded-2xl shadow-2xs space-y-3.5 hover:shadow-md transition-all relative overflow-hidden group duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Stock Value</span>
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-[#52b788] px-2 py-0.5 rounded-lg">{mockGrowth.inventory}</span>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                  <CountUp value={totalStockValue} prefix="₱" />
                </h3>
                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Live asset estimation</p>
              </div>
              {/* Sparkline curve */}
              <div className="h-8 w-full pt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 120 30" fill="none">
                  <path d={sparklinePaths.revenue} stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </motion.div>
    
            {/* KPI 2: Total Revenue */}
            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-4.5 rounded-2xl shadow-2xs space-y-3.5 hover:shadow-md transition-all relative overflow-hidden group duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Sales</span>
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-[#52b788] px-2 py-0.5 rounded-lg">{mockGrowth.sales}</span>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                  <CountUp value={totalSalesVal} prefix="₱" />
                </h3>
                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Direct pork & lechon sales</p>
              </div>
              <div className="h-8 w-full pt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 120 30" fill="none">
                  <path d={sparklinePaths.sales} stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </motion.div>
    
            {/* KPI 3: Total Products */}
            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-4.5 rounded-2xl shadow-2xs space-y-3.5 hover:shadow-md transition-all relative overflow-hidden group duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Inventory Items</span>
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-[#52b788] px-2 py-0.5 rounded-lg">{mockGrowth.inventory}</span>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                  <CountUp value={totalItems} suffix=" Items" />
                </h3>
                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Cataloged variations</p>
              </div>
              <div className="h-8 w-full pt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 120 30" fill="none">
                  <path d={sparklinePaths.products} stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </motion.div>
    
            {/* KPI 4: Active Orders */}
            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-4.5 rounded-2xl shadow-2xs space-y-3.5 hover:shadow-md transition-all relative overflow-hidden group duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Active Orders</span>
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-[#52b788] px-2 py-0.5 rounded-lg">{mockGrowth.orders}</span>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                  <CountUp value={activeOrdersCount} suffix=" Handovers" />
                </h3>
                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">In processing & shipping</p>
              </div>
              <div className="h-8 w-full pt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 120 30" fill="none">
                  <path d={sparklinePaths.orders} stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </motion.div>
    
            {/* KPI 5: Pending Bookings */}
            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-4.5 rounded-2xl shadow-2xs space-y-3.5 hover:shadow-md transition-all relative overflow-hidden group duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Pending Bookings</span>
                <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-955/30 dark:text-[#D4AF37] px-2 py-0.5 rounded-lg">{mockGrowth.reservations}</span>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                  <CountUp value={pendingReservationsCount} suffix=" Bookings" />
                </h3>
                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Awaiting verification</p>
              </div>
              <div className="h-8 w-full pt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 120 30" fill="none">
                  <path d={sparklinePaths.reservations} stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </motion.div>
    
            {/* KPI 6: Low Stock Warnings */}
            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-4.5 rounded-2xl shadow-2xs space-y-3.5 hover:shadow-md transition-all relative overflow-hidden group duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Low Stock</span>
                <span className={`text-[10px] font-extrabold ${lowStockCount > 0 ? "text-red-650 bg-red-50 dark:bg-red-950/30 dark:text-red-400" : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"}`}>
                  {mockGrowth.warnings}
                </span>
              </div>
              <div>
                <h3 className={`text-lg font-extrabold tracking-tight ${lowStockCount > 0 ? "text-red-650 dark:text-red-400" : "text-slate-800 dark:text-slate-100"}`}>
                  <CountUp value={lowStockCount} suffix=" Alerts" />
                </h3>
                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Below target stock level</p>
              </div>
              <div className="h-8 w-full pt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 120 30" fill="none">
                  <path d={sparklinePaths.warnings} stroke={lowStockCount > 0 ? "#DC2626" : "#10B981"} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </motion.div>
    
          </div>
    
          {/* 3. INTERACTIVE CHART ANALYTICS & AI INSIGHTS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Interactive SVG Chart Widget */}
            <div className="lg:col-span-12 space-y-4">
              <div className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-5 rounded-3xl shadow-2xs space-y-6 transition-all duration-300">
                
                {/* Chart Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 dark:border-emerald-955/30 pb-4">
                  <div>
                    <h3 className="font-heading text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Business Analytics Console</h3>
                    <p className="text-[10.5px] text-slate-450 dark:text-slate-400 font-medium">Toggle data dimensions and scope settings below</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Tabs */}
                    <div className="bg-slate-100 dark:bg-[#070a09] p-1 rounded-xl flex gap-1 border border-slate-200/50 dark:border-emerald-955/20">
                      <button 
                        onClick={() => setActiveChartTab("revenue")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${activeChartTab === "revenue" ? "bg-white dark:bg-[#0f1412] text-slate-800 dark:text-slate-100 shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"}`}
                      >
                        Revenue
                      </button>
                      <button 
                        onClick={() => setActiveChartTab("sales")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${activeChartTab === "sales" ? "bg-white dark:bg-[#0f1412] text-slate-800 dark:text-slate-100 shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"}`}
                      >
                        Sales
                      </button>
                      <button 
                        onClick={() => setActiveChartTab("inventory")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${activeChartTab === "inventory" ? "bg-white dark:bg-[#0f1412] text-slate-800 dark:text-slate-100 shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"}`}
                      >
                        Inventory
                      </button>
                      <button 
                        onClick={() => setActiveChartTab("reservations")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${activeChartTab === "reservations" ? "bg-white dark:bg-[#0f1412] text-slate-800 dark:text-slate-100 shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"}`}
                      >
                        Bookings
                      </button>
                    </div>
    
                    {/* Date Filters */}
                    <div className="flex bg-slate-50 dark:bg-[#070a09] border border-slate-200/80 dark:border-[#182620] rounded-xl overflow-hidden text-[9px] font-bold uppercase tracking-wider">
                      <button 
                        onClick={() => setChartFilter("weekly")}
                        className={`px-2.5 py-1.5 transition-all cursor-pointer ${chartFilter === "weekly" ? "bg-[#1B4332] text-white" : "text-slate-650 dark:text-slate-400 hover:bg-slate-105 dark:hover:bg-[#182620]/30"}`}
                      >
                        Week
                      </button>
                      <button 
                        onClick={() => setChartFilter("monthly")}
                        className={`px-2.5 py-1.5 transition-all cursor-pointer ${chartFilter === "monthly" ? "bg-[#1B4332] text-white" : "text-slate-650 dark:text-slate-400 hover:bg-slate-105 dark:hover:bg-[#182620]/30"}`}
                      >
                        Month
                      </button>
                      <button 
                        onClick={() => setChartFilter("yearly")}
                        className={`px-2.5 py-1.5 transition-all cursor-pointer ${chartFilter === "yearly" ? "bg-[#1B4332] text-white" : "text-slate-650 dark:text-slate-400 hover:bg-slate-105 dark:hover:bg-[#182620]/30"}`}
                      >
                        Year
                      </button>
                    </div>
                  </div>
                </div>
    
                {/* SVG Interactive Line Chart Rendering */}
                <div className="relative pt-2">
                  <svg className="w-full overflow-visible" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} fill="none">
                    
                    {/* Horizontal Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                      const y = chartHeight * ratio;
                      const value = Math.round(maxVal - (ratio * maxVal));
                      return (
                        <g key={index} className="opacity-45">
                          <line x1="0" y1={y} x2={chartWidth} y2={y} strokeDasharray="3,3" strokeWidth="1" className="stroke-slate-150 dark:stroke-emerald-950/45" />
                          <text x="-8" y={y + 3} textAnchor="end" fill="#94A3B8" className="text-[9px] font-bold font-mono dark:fill-slate-500">
                            {activeChartTab === "revenue" ? `₱${(value / 1000).toFixed(0)}k` : value}
                          </text>
                        </g>
                      );
                    })}
    
                    {/* Gradient area */}
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2D6A4F" stopOpacity="0.00" />
                      </linearGradient>
                    </defs>
                    <path d={generateAreaPath()} fill="url(#chartGradient)" />
    
                    {/* Line Path with Framer Motion draw trigger */}
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8 }}
                      d={generateLinePath()}
                      className="stroke-[#1B4332] dark:stroke-[#52b788]"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
    
                    {/* Chart Data point dots and labels */}
                    {chartData.values.map((val, idx) => {
                      const stepX = chartWidth / (chartData.values.length - 1);
                      const x = idx * stepX;
                      const y = chartHeight - (val / maxVal) * chartHeight;
                      return (
                        <g key={idx} className="group/dot cursor-pointer">
                          <circle cx={x} cy={y} r="3.5" strokeWidth="2" className="fill-white dark:fill-[#0f1412] stroke-[#1B4332] dark:stroke-[#52b788] transition-all group-hover/dot:r-5 group-hover/dot:fill-[#D4AF37]" />
                          <text x={x} y={y - 8} textAnchor="middle" className="text-[9px] font-bold fill-[#1B4332] dark:fill-[#D4AF37] opacity-0 group-hover/dot:opacity-100 transition-all font-mono">
                            {activeChartTab === "revenue" ? `₱${val.toLocaleString()}` : val}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  
                  {/* Bottom Labels X-Axis */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-emerald-950/30 text-[10px] font-bold text-slate-455 dark:text-slate-400 font-mono">
                    {chartData.labels.map((label, idx) => (
                      <span key={idx} style={{ width: `${100 / chartData.labels.length}%` }} className="text-center">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
    
              </div>
            </div>
          </div>
    
          {/* 4. FARM OPERATIONS SUMMARY & LOW STOCK ALERT SYSTEM */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Farm Operations Inventory Widgets */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Piglets Category details */}
                <div className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-5 rounded-2xl shadow-2xs space-y-3 transition-colors duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase">Weanling Piglets</span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{pigletsStock} head</h4>
                    <p className="text-[9.5px] font-semibold text-slate-405 dark:text-slate-400 mt-0.5">Average age: 9.5 weeks</p>
                  </div>
                  <div className="h-1 bg-slate-100 dark:bg-emerald-950/40 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(100, (pigletsStock / 30) * 100)}%` }} />
                  </div>
                </div>
    
                {/* Hogs Category details */}
                <div className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-5 rounded-2xl shadow-2xs space-y-3 transition-colors duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase">Fattening Hogs</span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{hogsStock} head</h4>
                    <p className="text-[9.5px] font-semibold text-slate-405 dark:text-slate-400 mt-0.5">Yield threshold rate: 78.4%</p>
                  </div>
                  <div className="h-1 bg-slate-100 dark:bg-emerald-950/40 rounded-full overflow-hidden">
                    <div className="bg-[#1B4332] h-full rounded-full" style={{ width: `${Math.min(100, (hogsStock / 20) * 100)}%` }} />
                  </div>
                </div>
    
                {/* Pork Meat Category details */}
                <div className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-5 rounded-2xl shadow-2xs space-y-3 transition-colors duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase">Pork Meat Cuts</span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{porkStock} kg</h4>
                    <p className="text-[9.5px] font-semibold text-slate-405 dark:text-slate-400 mt-0.5">Hygienically vacuum sealed</p>
                  </div>
                  <div className="h-1 bg-slate-100 dark:bg-emerald-950/40 rounded-full overflow-hidden">
                    <div className="bg-[#D4AF37] h-full rounded-full" style={{ width: `${Math.min(100, (porkStock / 150) * 100)}%` }} />
                  </div>
                </div>
              </div>
    
              {/* Low Stock safety center */}
              <div className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-5 rounded-3xl shadow-2xs space-y-4 transition-colors duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-heading text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-650 dark:text-red-400" /> Low Stock Command Center
                    </h3>
                    <p className="text-[10px] text-slate-455 dark:text-slate-400 font-semibold">Priority alert items running below minimal stock levels</p>
                  </div>
                  <Link href="/admin/inventory" className="text-[10.5px] text-[#1B4332] dark:text-[#D4AF37] font-bold hover:underline">
                    Full Stock Logs
                  </Link>
                </div>
    
                {inventory.filter(item => item.quantity <= item.minStockLevel).length === 0 ? (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-emerald-955/40 rounded-2xl space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    <h4 className="font-heading text-xs font-bold text-slate-800 dark:text-slate-100">All stocks healthy</h4>
                    <p className="text-[9.5px] font-semibold text-slate-455 dark:text-slate-400">No items currently run below minimal target safety stock levels.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inventory
                      .filter(item => item.quantity <= item.minStockLevel)
                      .map(item => {
                        const ratio = item.quantity / item.minStockLevel;
                        let alertType: "Critical" | "Warning" | "Normal" = "Normal";
                        let progressBg = "bg-emerald-600";
                        let textBadge = "bg-emerald-50 text-emerald-600";
                        
                        if (item.quantity === 0) {
                          alertType = "Critical";
                          progressBg = "bg-red-650";
                          textBadge = "bg-red-50 text-red-650 dark:bg-red-950/30 dark:text-red-400";
                        } else if (ratio <= 0.5) {
                          alertType = "Critical";
                          progressBg = "bg-red-650";
                          textBadge = "bg-red-50 text-red-650 dark:bg-red-950/30 dark:text-red-400";
                        } else if (ratio <= 1) {
                          alertType = "Warning";
                          progressBg = "bg-[#D4AF37]";
                          textBadge = "bg-amber-50 text-amber-600 dark:bg-amber-955/30 dark:text-[#D4AF37]";
                        }
    
                        return (
                          <div key={item.id} className="bg-slate-50/50 dark:bg-[#080d0a]/40 hover:bg-slate-50 dark:hover:bg-[#111915]/30 border border-slate-200/50 dark:border-emerald-950/40 p-3.5 rounded-2xl flex flex-col justify-between gap-3 text-xs transition-colors duration-300">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-extrabold text-slate-800 dark:text-slate-100">{item.name}</div>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block mt-0.5 uppercase tracking-wide">{item.category}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${textBadge}`}>
                                {alertType}
                              </span>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                                <span>Current: {item.quantity} {item.unit}</span>
                                <span>Min: {item.minStockLevel} {item.unit}</span>
                              </div>
                              <div className="h-1.5 bg-slate-200 dark:bg-emerald-955/30 rounded-full overflow-hidden">
                                <div className={`${progressBg} h-full rounded-full`} style={{ width: `${Math.max(5, (item.quantity / (item.minStockLevel || 1)) * 100)}%` }} />
                              </div>
                            </div>
    
                            <div className="pt-1.5 border-t border-slate-200/50 dark:border-emerald-950/30 text-[10px] font-bold text-slate-655 dark:text-slate-400 flex justify-between items-center">
                              <span>Suggestion:</span>
                              <span className="text-[#1B4332] dark:text-[#D4AF37] font-extrabold">Restock +{Math.max(5, item.minStockLevel * 2 - item.quantity)} head</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
    
            {/* Right Column: Upcoming Catering & Lechon Timeline Widget */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-5 rounded-3xl shadow-2xs space-y-5 h-full transition-colors duration-300">
                <h3 className="font-heading text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#1B4332] dark:text-[#D4AF37]" /> Booking Timeline
                </h3>
    
                {/* Timeline component */}
                <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-emerald-950/40">
                  {reservations.slice(0, 4).map((r, idx) => {
                    let badgeStyle = "bg-amber-50 text-amber-600 dark:bg-amber-955/30 dark:text-[#D4AF37]";
                    if (r.status === "Approved") {
                      badgeStyle = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-450";
                    } else if (r.status === "Completed") {
                      badgeStyle = "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400";
                    }
    
                    return (
                      <div key={r.id} className="relative pl-8 flex gap-3 text-xs group">
                        {/* Timeline dot */}
                        <div className={`absolute left-2 w-3.5 h-3.5 rounded-full border-4 border-white dark:border-[#0f1412] shadow-sm -translate-x-1/2 z-10 transition-colors ${
                          r.status === "Approved" ? "bg-emerald-600" :
                          r.status === "Pending" ? "bg-amber-500" :
                          "bg-blue-505"
                        }`} />
                        
                        <div className="bg-slate-50/50 dark:bg-[#080d0a]/40 group-hover:bg-slate-50 dark:group-hover:bg-[#111915]/30 border border-slate-200/50 dark:border-emerald-950/40 p-3 rounded-2xl flex-1 space-y-1.5 transition-colors duration-300">
                          <div className="flex justify-between items-start font-bold">
                            <h4 className="text-slate-850 dark:text-slate-100 truncate max-w-[120px]">{r.customerName}</h4>
                            <span className="text-[9.5px] font-mono text-slate-500 dark:text-slate-400">{r.pickupDate}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-extrabold text-slate-655 dark:text-slate-350 uppercase tracking-wide">{r.category} ({r.quantity}x)</span>
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold ${badgeStyle}`}>{r.status}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="pt-2 text-center">
                  <Link href="/admin/reservations" className="text-xs text-[#1B4332] dark:text-[#D4AF37] font-bold hover:underline flex items-center justify-center gap-1">
                    Manage Booking Schedules <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
    
          </div>

          {/* Paluwagan Upcoming Due Payments Widget */}
          {paluwaganDuePayments.length > 0 && (
            <div className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-5 rounded-3xl shadow-2xs space-y-4 transition-colors duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-heading text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                    <PiggyBank className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Paluwagan Upcoming Due Payments
                  </h3>
                  <p className="text-[10px] text-slate-455 dark:text-slate-400 font-semibold">Monitor collections due today, tomorrow, or in 2 days, and track overdue accounts</p>
                </div>
                <Link href="/admin/food-services/paluwagan" className="text-xs text-[#1B4332] dark:text-[#D4AF37] font-bold hover:underline">
                  Go to Paluwagan Module →
                </Link>
              </div>

              <div className="overflow-hidden border border-slate-150 rounded-xl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member Name</TableHead>
                      <TableHead>Cohort Batch</TableHead>
                      <TableHead>Menu Product</TableHead>
                      <TableHead>Installment Due</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status / Days Remaining</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paluwaganDuePayments.slice(0, 5).map((pay, idx) => {
                      const isOverdue = pay.status === "Overdue" || pay.daysRemaining < 0;
                      const isToday = pay.daysRemaining === 0;
                      const isTomorrow = pay.daysRemaining === 1;
                      const isTwoDays = pay.daysRemaining === 2;

                      let badgeStyle = "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400";
                      let statusText = `${pay.daysRemaining} days remaining`;

                      if (isOverdue) {
                        badgeStyle = "bg-red-50 text-red-650 border border-red-150 font-extrabold animate-pulse dark:bg-red-950/20 dark:text-red-400 dark:border-red-900";
                        const overdueDays = Math.abs(pay.daysRemaining);
                        statusText = `Overdue by ${overdueDays} day${overdueDays > 1 ? "s" : ""}`;
                      } else if (isToday) {
                        badgeStyle = "bg-orange-50 text-orange-600 border border-orange-150 font-extrabold dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900";
                        statusText = "Due Today";
                      } else if (isTomorrow) {
                        badgeStyle = "bg-amber-50 text-amber-600 border border-amber-150 font-extrabold dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900";
                        statusText = "Due Tomorrow";
                      } else if (isTwoDays) {
                        badgeStyle = "bg-blue-50 text-blue-600 border border-blue-150 font-extrabold dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900";
                        statusText = "Due in 2 days";
                      }

                      return (
                        <TableRow key={`${pay.orderId}-${pay.installmentNumber}-${idx}`}>
                          <TableCell className="font-extrabold text-slate-800 dark:text-slate-100">{pay.customerName}</TableCell>
                          <TableCell className="font-bold text-xs text-[#1B4332] dark:text-[#D4AF37]">{pay.batchName}</TableCell>
                          <TableCell className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{pay.product}</TableCell>
                          <TableCell className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">₱{pay.amountDue.toLocaleString()}</TableCell>
                          <TableCell className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{pay.dueDate}</TableCell>
                          <TableCell>
                            <span className={`px-2.5 py-0.5 rounded-lg text-[9.5px] uppercase ${badgeStyle}`}>
                              {statusText}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
    
          {/* 5. MODERN RECENT ORDERS MANAGER & RECENT ACTIVITY FEED */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Recent Orders Manager */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-5 rounded-3xl shadow-2xs space-y-4 transition-colors duration-300">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-heading text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Recent Piggery Orders</h3>
                    <p className="text-[10px] text-slate-455 dark:text-slate-400 font-semibold">Incoming fresh pork meat & packaging orders</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-405 dark:text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search customer..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 border border-slate-200 dark:border-emerald-950/50 rounded-xl text-[10.5px] w-full sm:w-40 font-semibold focus:outline-hidden focus:ring-1 focus:ring-primary-500/20 dark:bg-emerald-955/20 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 dark:border-emerald-950/50 rounded-xl text-[10.5px] font-bold bg-white dark:bg-[#0f1412] text-slate-850 dark:text-slate-250 focus:outline-hidden"
                    >
                      <option value="All">All Status</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
    
                <Card className="p-0 overflow-hidden border-slate-100/50 dark:border-[#182620]">
                  {filteredOrders.length === 0 ? (
                    <div className="p-10 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">No orders matching the filter query found.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-55 dark:bg-[#070a09]/50 hover:bg-slate-55 dark:hover:bg-[#070a09]/50">
                          <TableHead className="font-bold text-[10.5px] uppercase tracking-wider text-slate-505 dark:text-slate-400">Order ID</TableHead>
                          <TableHead className="font-bold text-[10.5px] uppercase tracking-wider text-slate-505 dark:text-slate-400">Customer</TableHead>
                          <TableHead className="font-bold text-[10.5px] uppercase tracking-wider text-slate-505 dark:text-slate-400">Items Summary</TableHead>
                          <TableHead className="font-bold text-[10.5px] uppercase tracking-wider text-slate-505 dark:text-slate-400">Amount</TableHead>
                          <TableHead className="font-bold text-[10.5px] uppercase tracking-wider text-slate-505 dark:text-slate-400">Status</TableHead>
                          <TableHead className="font-bold text-[10.5px] uppercase tracking-wider text-right text-slate-505 dark:text-slate-400">Quick Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.slice(0, 5).map((o) => (
                          <TableRow key={o.id} className="hover:bg-slate-50/30 dark:hover:bg-[#182620]/25">
                            <TableCell className="font-bold text-[11px] text-slate-500 dark:text-slate-400">{o.id}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-extrabold text-xs text-slate-800 dark:text-slate-100">{o.customerName}</div>
                                <span className="text-[9px] text-slate-450 dark:text-slate-505 block">{o.customerEmail}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-slate-655 dark:text-slate-350 max-w-[140px] truncate">{o.product}</TableCell>
                            <TableCell className="font-extrabold text-slate-800 dark:text-slate-150">₱{o.totalAmount.toLocaleString()}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-0.5 rounded-lg text-[9.5px] font-extrabold uppercase ${
                                o.status === "Delivered" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/45 dark:text-emerald-450" :
                                o.status === "Shipped" ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400" :
                                o.status === "Processing" ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400" :
                                "bg-amber-50 text-amber-600 dark:bg-amber-955/30 dark:text-[#D4AF37]"
                              }`}>
                                {o.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-slate-600 dark:text-slate-300">
                              {o.status === "Processing" && (
                                <Button 
                                  size="sm" 
                                  variant="light"
                                  className="text-[10px] py-1 px-2.5 font-bold uppercase cursor-pointer"
                                  onClick={() => updateOrderStatus(o.id, "Shipped")}
                                >
                                  Dispatch Ship
                                </Button>
                              )}
                              {o.status === "Shipped" && (
                                <Button 
                                  size="sm" 
                                  variant="primary" 
                                  className="bg-[#1B4332] hover:bg-[#2D6A4F] dark:bg-emerald-900 dark:hover:bg-emerald-855 text-[10px] py-1 px-2.5 font-bold uppercase cursor-pointer text-white"
                                  onClick={() => updateOrderStatus(o.id, "Delivered", "Paid")}
                                >
                                  Deliver
                                </Button>
                              )}
                              {o.status === "Delivered" && (
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center justify-end gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-455" /> Finished</span>
                              )}
                              {o.status === "Cancelled" && (
                                <span className="text-[10px] font-bold text-red-500">Cancelled</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Card>
                
                <div className="pt-1 text-center">
                  <Link href="/admin/orders" className="text-xs text-[#1B4332] dark:text-[#D4AF37] font-bold hover:underline">
                    Go to Orders Log →
                  </Link>
                </div>
              </div>
            </div>
    
            {/* Right Column: Live Operations Activity Feed */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-5 rounded-3xl shadow-2xs space-y-4 transition-colors duration-300">
                <div className="flex justify-between items-center border-b border-slate-55 dark:border-[#182620]/80 pb-3">
                  <h3 className="font-heading text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-455" /> Operations Feed
                  </h3>
                  <span className="flex items-center gap-1 text-[9px] font-bold text-slate-450 dark:text-slate-400 uppercase font-mono">
                    <Clock className="w-3 h-3" /> Live
                  </span>
                </div>
    
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {recentActivities.map((act) => (
                    <div key={act.id} className="text-xs flex gap-3 items-start border-b border-slate-50 dark:border-emerald-950/25 pb-3.5 last:border-none last:pb-0">
                      <div className="mt-0.5 shrink-0">
                        {act.type === "booking" && <span className="w-2.5 h-2.5 bg-amber-500 rounded-full block border border-white dark:border-[#0f1412]" />}
                        {act.type === "stock" && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full block border border-white dark:border-[#0f1412]" />}
                        {act.type === "order" && <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full block border border-white dark:border-[#0f1412]" />}
                        {act.type === "payment" && <span className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full block border border-white dark:border-[#0f1412]" />}
                        {act.type === "alert" && <span className="w-2.5 h-2.5 bg-red-500 rounded-full block border border-white dark:border-[#0f1412]" />}
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-[11.5px] text-slate-700 dark:text-slate-300 leading-normal font-semibold">
                          {act.text}
                        </p>
                        <span className="text-[9px] text-slate-400 dark:text-slate-505 font-bold block">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
    
              </div>
            </div>
    
          </div>
        </>
      ) : (
        /* Member CRM Dashboard View */
        <div className="space-y-8 animate-fadeIn">
          {/* A. KPI GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {/* Total Members */}
            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-4.5 rounded-2xl shadow-2xs space-y-3.5 hover:shadow-md transition-all relative overflow-hidden group duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Members</span>
                <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-[#52b788]"><Users className="w-4 h-4" /></span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                  <CountUp value={totalMembers} suffix=" Members" />
                </h3>
                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Total registered users</p>
              </div>
            </motion.div>

            {/* Active Members */}
            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-4.5 rounded-2xl shadow-2xs space-y-3.5 hover:shadow-md transition-all relative overflow-hidden group duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider block">Active Members</span>
                <span className="p-1.5 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400"><CheckCircle2 className="w-4 h-4" /></span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                  <CountUp value={activeMembers} suffix=" Active" />
                </h3>
                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Currently active status</p>
              </div>
            </motion.div>

            {/* Cash Orders */}
            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-4.5 rounded-2xl shadow-2xs space-y-3.5 hover:shadow-md transition-all relative overflow-hidden group duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider block">Cash Orders</span>
                <span className="p-1.5 bg-[#D4AF37]/15 rounded-lg text-[#D4AF37]"><Coins className="w-4 h-4" /></span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                  <CountUp value={cashOrdersCount} suffix=" Orders" />
                </h3>
                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Direct cash sales</p>
              </div>
            </motion.div>

            {/* Total Collections */}
            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-4.5 rounded-2xl shadow-2xs space-y-3.5 hover:shadow-md transition-all relative overflow-hidden group duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider block">Total Collections</span>
                <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-[#52b788]"><PiggyBank className="w-4 h-4" /></span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                  <CountUp value={totalCollections} prefix="₱" />
                </h3>
                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Cumulative CRM collections</p>
              </div>
            </motion.div>

            {/* Outstanding Balances */}
            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-4.5 rounded-2xl shadow-2xs space-y-3.5 hover:shadow-md transition-all relative overflow-hidden group duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Outstanding Balances</span>
                <span className="p-1.5 bg-red-50 dark:bg-red-950/40 rounded-lg text-red-650 dark:text-red-400"><AlertTriangle className="w-4 h-4" /></span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                  <CountUp value={totalOutstanding} prefix="₱" />
                </h3>
                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Awaiting member collection</p>
              </div>
            </motion.div>

            {/* Today's Collections */}
            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-4.5 rounded-2xl shadow-2xs space-y-3.5 hover:shadow-md transition-all relative overflow-hidden group duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Today's Collections</span>
                <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-[#52b788]"><TrendingUp className="w-4 h-4" /></span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                  <CountUp value={todayCollections} prefix="₱" />
                </h3>
                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Collected today</p>
              </div>
            </motion.div>

            {/* Monthly Revenue */}
            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-4.5 rounded-2xl shadow-2xs space-y-3.5 hover:shadow-md transition-all relative overflow-hidden group duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Monthly Revenue</span>
                <span className="p-1.5 bg-indigo-50 dark:bg-indigo-955/40 rounded-lg text-indigo-650 dark:text-indigo-400"><Coins className="w-4 h-4" /></span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                  <CountUp value={monthlyRevenue} prefix="₱" />
                </h3>
                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">This month's operations total</p>
              </div>
            </motion.div>

            {/* Pending Payments */}
            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-4.5 rounded-2xl shadow-2xs space-y-3.5 hover:shadow-md transition-all relative overflow-hidden group duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider block">Pending Payments</span>
                <span className="p-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-amber-600 dark:text-[#D4AF37]"><Clock className="w-4 h-4" /></span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                  <CountUp value={pendingPaymentsCount} suffix=" Accounts" />
                </h3>
                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Outstanding balances</p>
              </div>
            </motion.div>
          </div>

          {/* B. CHARTS PANEL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Collections & Sales Line/Bar Chart */}
            <div className="lg:col-span-8">
              <div className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-5 rounded-3xl shadow-2xs space-y-6 transition-all duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 dark:border-emerald-950/30 pb-4">
                  <div>
                    <h3 className="font-heading text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Collections & Sales Analytics</h3>
                    <p className="text-[10.5px] text-slate-450 dark:text-slate-400 font-medium">Visualizing payment inflows and direct orders</p>
                  </div>
                  
                  <div className="bg-slate-100 dark:bg-[#070a09] p-1 rounded-xl flex gap-1 border border-slate-200/50 dark:border-[#182620]/20">
                    <button 
                      onClick={() => setMemberChartTab("weekly")}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${memberChartTab === "weekly" ? "bg-white dark:bg-[#0f1412] text-slate-800 dark:text-slate-100 shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"}`}
                    >
                      Weekly Collections
                    </button>
                    <button 
                      onClick={() => setMemberChartTab("monthly")}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${memberChartTab === "monthly" ? "bg-white dark:bg-[#0f1412] text-slate-800 dark:text-slate-100 shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"}`}
                    >
                      Monthly Collections
                    </button>
                    <button 
                      onClick={() => setMemberChartTab("sales")}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${memberChartTab === "sales" ? "bg-white dark:bg-[#0f1412] text-slate-800 dark:text-slate-100 shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"}`}
                    >
                      Sales Overview
                    </button>
                  </div>
                </div>

                <div className="relative pt-2">
                  {memberChartTab === "weekly" ? (
                    /* Weekly Collections custom SVG Bar Chart */
                    <div>
                      <svg className="w-full overflow-visible" height={220} viewBox="0 0 580 220" fill="none">
                        {/* Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                          const y = 200 * ratio;
                          const weeklyData = getWeeklyCollectionsData();
                          const maxWeekly = Math.max(...weeklyData.values, 1000) * 1.15;
                          const value = Math.round(maxWeekly - (ratio * maxWeekly));
                          return (
                            <g key={index} className="opacity-45">
                              <line x1="0" y1={y} x2={580} y2={y} strokeDasharray="3,3" strokeWidth="1" className="stroke-slate-150 dark:stroke-emerald-950/45" />
                              <text x="-8" y={y + 3} textAnchor="end" fill="#94A3B8" className="text-[9px] font-bold font-mono dark:fill-slate-500">
                                ₱{value.toLocaleString()}
                              </text>
                            </g>
                          );
                        })}
                        
                        {/* Bars rendering */}
                        {(() => {
                          const weeklyData = getWeeklyCollectionsData();
                          const maxWeekly = Math.max(...weeklyData.values, 1000) * 1.15;
                          const barWidth = 35;
                          const barSpacing = (580 - (7 * barWidth)) / 6;
                          return weeklyData.values.map((val, idx) => {
                            const x = idx * (barWidth + barSpacing);
                            const barHeight = Math.max(8, (val / maxWeekly) * 180);
                            const y = 200 - barHeight;
                            return (
                              <g key={idx} className="group/bar cursor-pointer">
                                <rect x={x} y={y} width={barWidth} height={barHeight} rx="6" className="fill-[#1B4332] dark:fill-emerald-800 hover:fill-[#D4AF37] dark:hover:fill-[#D4AF37] transition-all duration-300" />
                                <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" className="text-[9px] font-extrabold fill-[#1B4332] dark:fill-[#D4AF37] opacity-0 group-hover/bar:opacity-100 transition-all font-mono">
                                  ₱{val.toLocaleString()}
                                </text>
                              </g>
                            );
                          });
                        })()}
                      </svg>
                      
                      {/* X-Axis labels */}
                      <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-emerald-950/30 text-[10px] font-bold text-slate-455 dark:text-slate-400 font-mono">
                        {getWeeklyCollectionsData().labels.map((label, idx) => (
                          <span key={idx} className="text-center w-full">{label}</span>
                        ))}
                      </div>
                    </div>
                  ) : memberChartTab === "monthly" ? (
                    /* Monthly Collections line chart */
                    <div>
                      <svg className="w-full overflow-visible" height={220} viewBox="0 0 580 220" fill="none">
                        {/* Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                          const y = 200 * ratio;
                          const monthlyData = getMonthlyCollectionsData();
                          const maxMonthly = Math.max(...monthlyData.values, 5000) * 1.15;
                          const value = Math.round(maxMonthly - (ratio * maxMonthly));
                          return (
                            <g key={index} className="opacity-45">
                              <line x1="0" y1={y} x2={580} y2={y} strokeDasharray="3,3" strokeWidth="1" className="stroke-slate-150 dark:stroke-emerald-950/45" />
                              <text x="-8" y={y + 3} textAnchor="end" fill="#94A3B8" className="text-[9px] font-bold font-mono dark:fill-slate-500">
                                ₱{(value / 1000).toFixed(0)}k
                              </text>
                            </g>
                          );
                        })}

                        {/* Line & Area */}
                        {(() => {
                          const mData = getMonthlyCollectionsData();
                          const maxVal = Math.max(...mData.values, 5000) * 1.15;
                          const stepX = 580 / (mData.values.length - 1);
                          const points = mData.values.map((val, idx) => {
                            const x = idx * stepX;
                            const y = 200 - (val / maxVal) * 180;
                            return `${x},${y}`;
                          });
                          const linePath = `M ${points.join(" L ")}`;
                          const areaPath = `${linePath} L 580,200 L 0,200 Z`;
                          
                          return (
                            <>
                              <defs>
                                <linearGradient id="memberCollectionsGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#1B4332" stopOpacity="0.25" />
                                  <stop offset="100%" stopColor="#1b4332" stopOpacity="0.00" />
                                </linearGradient>
                              </defs>
                              <path d={areaPath} fill="url(#memberCollectionsGrad)" />
                              <path d={linePath} stroke="#1B4332" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-[#52b788]" />
                              
                              {mData.values.map((val, idx) => {
                                const x = idx * stepX;
                                const y = 200 - (val / maxVal) * 180;
                                return (
                                  <g key={idx} className="group/dot cursor-pointer">
                                    <circle cx={x} cy={y} r="3.5" strokeWidth="2" className="fill-white dark:fill-[#0f1412] stroke-[#1B4332] dark:stroke-[#52b788] hover:r-5 transition-all" />
                                    <text x={x} y={y - 8} textAnchor="middle" className="text-[9px] font-bold fill-[#1B4332] dark:fill-[#D4AF37] opacity-0 group-hover/dot:opacity-100 transition-all font-mono">
                                      ₱{val.toLocaleString()}
                                    </text>
                                  </g>
                                );
                              })}
                            </>
                          );
                        })()}
                      </svg>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-emerald-950/30 text-[10px] font-bold text-slate-455 dark:text-slate-400 font-mono">
                        {getMonthlyCollectionsData().labels.map((label, idx) => (
                          <span key={idx} className="text-center w-full">{label}</span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Sales Overview line chart */
                    <div>
                      <svg className="w-full overflow-visible" height={220} viewBox="0 0 580 220" fill="none">
                        {/* Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                          const y = 200 * ratio;
                          const salesData = getSalesOverviewData();
                          const maxSales = Math.max(...salesData.values, 5000) * 1.15;
                          const value = Math.round(maxSales - (ratio * maxSales));
                          return (
                            <g key={index} className="opacity-45">
                              <line x1="0" y1={y} x2={580} y2={y} strokeDasharray="3,3" strokeWidth="1" className="stroke-slate-150 dark:stroke-emerald-950/45" />
                              <text x="-8" y={y + 3} textAnchor="end" fill="#94A3B8" className="text-[9px] font-bold font-mono dark:fill-slate-500">
                                ₱{(value / 1000).toFixed(0)}k
                              </text>
                            </g>
                          );
                        })}

                        {/* Combined Sales paths */}
                        {(() => {
                          const salesData = getSalesOverviewData();
                          const collectionsData = getMonthlyCollectionsData();
                          const maxVal = Math.max(...salesData.values, ...collectionsData.values, 5000) * 1.15;
                          const stepX = 580 / (salesData.values.length - 1);
                          
                          const salesPoints = salesData.values.map((val, idx) => {
                            const x = idx * stepX;
                            const y = 200 - (val / maxVal) * 180;
                            return `${x},${y}`;
                          });
                          const salesPath = `M ${salesPoints.join(" L ")}`;

                          const collectionsPoints = collectionsData.values.map((val, idx) => {
                            const x = idx * stepX;
                            const y = 200 - (val / maxVal) * 180;
                            return `${x},${y}`;
                          });
                          const collectionsPath = `M ${collectionsPoints.join(" L ")}`;

                          return (
                            <>
                              {/* Collections Line (Green) */}
                              <path d={collectionsPath} stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                              {/* Sales Line (Gold) */}
                              <path d={salesPath} stroke="#D4AF37" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                              
                              {/* Legend */}
                              <g transform="translate(340, 15)" className="text-[10px] font-bold font-sans">
                                <circle cx="5" cy="5" r="4" fill="#D4AF37" />
                                <text x="15" y="8" fill="#94A3B8" className="dark:fill-slate-400">Piggery Sales</text>
                                <circle cx="95" cy="5" r="4" fill="#10B981" />
                                <text x="105" y="8" fill="#94A3B8" className="dark:fill-slate-400">Collections</text>
                              </g>
                            </>
                          );
                        })()}
                      </svg>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-emerald-950/30 text-[10px] font-bold text-slate-455 dark:text-slate-400 font-mono">
                        {getSalesOverviewData().labels.map((label, idx) => (
                          <span key={idx} className="text-center w-full">{label}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right: Payment Trends circular/progress bars */}
            <div className="lg:col-span-4">
              <div className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-5 rounded-3xl shadow-2xs space-y-6 transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <h3 className="font-heading text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <Coins className="w-4 h-4 text-[#1B4332] dark:text-[#D4AF37]" /> Payment Trends
                  </h3>
                  <p className="text-[10.5px] text-slate-450 dark:text-slate-400 font-medium">Breakdown of CRM collection channels</p>
                </div>
                
                {/* SVG Donut / progress rings */}
                <div className="flex justify-center items-center py-4">
                  <svg width="140" height="140" viewBox="0 0 36 36" className="overflow-visible">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E2E8F0" strokeWidth="2.5" className="dark:stroke-emerald-950/40" />
                    {(() => {
                      const breakdown = getPaymentMethodsBreakdown();
                      const total = breakdown.reduce((sum, item) => sum + item.value, 0);
                      let accumulatedPercent = 0;
                      return breakdown.map((item, idx) => {
                        const percent = total > 0 ? (item.value / total) * 100 : 0;
                        const dashArray = `${percent} ${100 - percent}`;
                        const dashOffset = 100 - accumulatedPercent + 25; // 25 to start from 12 o'clock
                        accumulatedPercent += percent;
                        return (
                          <circle 
                            key={idx}
                            cx="18" 
                            cy="18" 
                            r="15.915" 
                            fill="none" 
                            stroke={item.stroke} 
                            strokeWidth="3.2" 
                            strokeDasharray={dashArray} 
                            strokeDashoffset={dashOffset} 
                            strokeLinecap="round"
                            className="transition-all duration-500 hover:stroke-[4]"
                          />
                        );
                      });
                    })()}
                    <g transform="translate(18, 20)" className="text-center font-sans">
                      <text x="0" y="0" textAnchor="middle" fill="#94A3B8" className="text-[5px] font-bold uppercase tracking-wider">Total collections</text>
                      <text x="0" y="-4" textAnchor="middle" className="text-[6.5px] font-extrabold fill-slate-800 dark:fill-slate-100">
                        ₱{Math.round(totalCollections / 1000)}k
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Progress bars list */}
                <div className="space-y-3.5">
                  {getPaymentMethodsBreakdown().map((item, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between items-center font-bold">
                        <span className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                          <span className="text-slate-700 dark:text-slate-350">{item.name}</span>
                        </span>
                        <span className="text-slate-800 dark:text-slate-100 font-mono">
                          ₱{item.value.toLocaleString()} ({Math.round(item.percentage)}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-emerald-955/35 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Cohort Batches Performance Grid */}
          <div className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-5 rounded-3xl shadow-2xs space-y-4 transition-colors duration-300">
            <div>
              <h3 className="font-heading text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" /> Program Cohort Batches Performance
              </h3>
              <p className="text-[10px] text-slate-455 dark:text-slate-400 font-semibold">Total members and collection summary per active program batch</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {batches.filter(b => b.status !== "Archived").map(batch => {
                // Calculate stats for this batch
                const batchMembers = members.filter(m => m.batchId === batch.id && m.membershipStatus !== "Archived");
                const memberCount = batchMembers.length;
                const totalPaid = memberPayments
                  .filter(p => p.batchId === batch.id)
                  .reduce((sum, p) => sum + p.amountPaid, 0);
                const totalDuesExpected = batchMembers.reduce((sum, m) => sum + m.totalDue, 0);
                const outstanding = Math.max(0, totalDuesExpected - totalPaid);
                const collectionRate = totalDuesExpected > 0 ? Math.round((totalPaid / totalDuesExpected) * 100) : 0;

                return (
                  <div key={batch.id} className="bg-slate-50/50 dark:bg-[#080d0a]/40 border border-slate-200/50 dark:border-emerald-955/20 p-4.5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-slate-850 dark:text-slate-100 text-xs uppercase tracking-wide">{batch.name}</h4>
                        <span className="text-[9.5px] text-slate-400 font-bold block mt-0.5">Default Due: ₱{batch.totalDue.toLocaleString()}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-[9.5px] font-extrabold flex items-center gap-1">
                        <Users className="w-3 h-3" /> {memberCount} Members
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Collected</span>
                        <span className="text-xs font-mono font-extrabold text-slate-700 dark:text-slate-350">₱{totalPaid.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Outstanding</span>
                        <span className="text-xs font-mono font-extrabold text-red-500">₱{outstanding.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-slate-400">
                        <span>Coverage</span>
                        <span>{collectionRate}%</span>
                      </div>
                      <div className="h-1 bg-slate-100 dark:bg-emerald-955/20 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${collectionRate}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* C. RECENT COLLECTIONS REGISTRY TABLE */}
          <div className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-5 rounded-3xl shadow-2xs space-y-4 transition-colors duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-heading text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                  Recent Collections Ledger
                </h3>
                <p className="text-[10px] text-slate-455 dark:text-slate-400 font-semibold">Latest payments received from Delmar Piggery program members</p>
              </div>
              <Link href="/admin/payments" className="text-xs text-[#1B4332] dark:text-[#D4AF37] font-bold hover:underline">
                View Payments Ledger
              </Link>
            </div>

            <Card className="p-0 overflow-hidden border-slate-100/50 dark:border-[#182620]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-55 dark:bg-[#070a09]/50 hover:bg-slate-55 dark:hover:bg-[#070a09]/50">
                    <TableHead className="font-bold text-[10.5px] uppercase tracking-wider text-slate-505 dark:text-slate-400">Receipt No.</TableHead>
                    <TableHead className="font-bold text-[10.5px] uppercase tracking-wider text-slate-505 dark:text-slate-400">Member</TableHead>
                    <TableHead className="font-bold text-[10.5px] uppercase tracking-wider text-slate-505 dark:text-slate-400">Method</TableHead>
                    <TableHead className="font-bold text-[10.5px] uppercase tracking-wider text-slate-505 dark:text-slate-400">Amount Paid</TableHead>
                    <TableHead className="font-bold text-[10.5px] uppercase tracking-wider text-slate-505 dark:text-slate-400">Payment Date</TableHead>
                    <TableHead className="font-bold text-[10.5px] uppercase tracking-wider text-slate-505 dark:text-slate-400">Collector</TableHead>
                    <TableHead className="font-bold text-[10.5px] uppercase tracking-wider text-slate-505 dark:text-slate-400">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-slate-405 dark:text-slate-405 text-xs font-semibold">
                        No member collections recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    memberPayments.slice(0, 5).map((pay) => {
                      const member = members.find(m => m.id === pay.memberId);
                      return (
                        <TableRow key={pay.id} className="hover:bg-slate-50/30 dark:hover:bg-[#182620]/25">
                          <TableCell className="font-mono font-bold text-[11px] text-[#1f8f60] dark:text-[#D4AF37]">{pay.receiptNumber}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-extrabold text-xs text-slate-800 dark:text-slate-100">{member?.fullName || "Unknown Member"}</div>
                              <span className="text-[9px] text-slate-450 dark:text-slate-500 block uppercase tracking-wider font-mono">{member?.memberId}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-slate-655 dark:text-slate-350">{pay.paymentMethod}</TableCell>
                          <TableCell className="font-extrabold text-emerald-600 dark:text-[#52b788]">₱{pay.amountPaid.toLocaleString()}</TableCell>
                          <TableCell className="font-mono text-[10.5px] font-bold text-slate-500 dark:text-slate-450">{pay.paymentDate}</TableCell>
                          <TableCell className="font-semibold text-slate-655 dark:text-slate-350">{pay.collector}</TableCell>
                          <TableCell className="font-medium text-slate-500 dark:text-slate-405 italic max-w-[150px] truncate" title={pay.remarks}>{pay.remarks || "—"}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* D. SYSTEM AUDIT TRAIL */}
          <div className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] p-5 rounded-3xl shadow-2xs space-y-4 transition-colors duration-300">
            <div>
              <h3 className="font-heading text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> Enterprise System Audit Trail
              </h3>
              <p className="text-[10px] text-slate-455 dark:text-slate-400 font-semibold">Real-time ledger of CRUD modifications, transactions, and admin operations</p>
            </div>

            <Card className="p-0 overflow-hidden border border-slate-100 dark:border-emerald-950/20 bg-slate-50/20 dark:bg-[#070a09]/10">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-55 dark:bg-[#070a09]/50 hover:bg-slate-55 dark:hover:bg-[#070a09]/50">
                    <TableHead className="font-bold text-[10.5px] uppercase tracking-wider text-slate-505 dark:text-slate-400">Timestamp</TableHead>
                    <TableHead className="font-bold text-[10.5px] uppercase tracking-wider text-slate-505 dark:text-slate-400">Action Type</TableHead>
                    <TableHead className="font-bold text-[10.5px] uppercase tracking-wider text-slate-505 dark:text-slate-400">Details</TableHead>
                    <TableHead className="font-bold text-[10.5px] uppercase tracking-wider text-slate-505 dark:text-slate-400">Operator</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-405 text-xs font-semibold">
                        No system audits recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    auditLogs.slice(0, 8).map((log) => (
                      <TableRow key={log.id} className="hover:bg-slate-50/30 dark:hover:bg-[#182620]/25">
                        <TableCell className="font-mono text-[10.5px] text-slate-500 dark:text-slate-450 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wide ${
                            log.action.includes("CREATE") || log.action.includes("REGISTER")
                              ? "bg-emerald-50 text-emerald-655 dark:bg-emerald-955/20 dark:text-[#52b788]"
                              : log.action.includes("UPDATE")
                              ? "bg-blue-50 text-blue-655 dark:bg-blue-955/20 dark:text-blue-400"
                              : log.action.includes("ARCHIVE")
                              ? "bg-red-50 text-red-655 dark:bg-red-955/20 dark:text-red-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          }`}>
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold text-xs text-slate-850 dark:text-slate-200">
                          {log.details}
                        </TableCell>
                        <TableCell className="font-mono text-[10.5px] text-slate-450 dark:text-slate-450 whitespace-nowrap">
                          {log.adminEmail}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>

        </div>
      )}

    </div>
  );
}

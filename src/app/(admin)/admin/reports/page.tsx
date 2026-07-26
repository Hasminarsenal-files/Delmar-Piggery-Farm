"use client";

import React, { useState, useMemo } from "react";
import { useRole, Member, MemberPayment } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  FileDown, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Coins, 
  Users, 
  Printer, 
  Download, 
  AlertCircle,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminReportsPage() {
  const { orders, reservations, memberPayments, members, batches } = useRole();
  const [activeTab, setActiveTab] = useState<"sales" | "collections">("sales");
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  // Sub-filters
  const [salesTimeframe, setSalesTimeframe] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [collectionsTimeframe, setCollectionsTimeframe] = useState<"weekly" | "monthly">("monthly");

  // Helper: compute member's cumulative payments
  const getMemberPaidAmount = (memberId: string) => {
    return memberPayments
      .filter(p => p.memberId === memberId)
      .reduce((sum, p) => sum + p.amountPaid, 0);
  };

  // Helper: get today, last 7 days, last 30 days, last 365 days timestamps
  const timeLimits = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = today - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = today - 30 * 24 * 60 * 60 * 1000;
    const oneYearAgo = today - 365 * 24 * 60 * 60 * 1000;
    return { today, sevenDaysAgo, thirtyDaysAgo, oneYearAgo };
  }, []);

  // A. SALES REPORT METRICS & DATA
  const salesData = useMemo(() => {
    const completedOrders = orders.filter(o => o.paymentStatus === "Paid" && o.status !== "Cancelled");
    
    // Filtered list
    let filtered = completedOrders;
    if (salesTimeframe === "daily") {
      filtered = completedOrders.filter(o => new Date(o.dateCreated).getTime() >= timeLimits.today);
    } else if (salesTimeframe === "weekly") {
      filtered = completedOrders.filter(o => new Date(o.dateCreated).getTime() >= timeLimits.sevenDaysAgo);
    } else if (salesTimeframe === "monthly") {
      filtered = completedOrders.filter(o => new Date(o.dateCreated).getTime() >= timeLimits.thirtyDaysAgo);
    } else if (salesTimeframe === "yearly") {
      filtered = completedOrders.filter(o => new Date(o.dateCreated).getTime() >= timeLimits.oneYearAgo);
    }

    const totalRevenue = filtered.reduce((sum, o) => sum + o.totalAmount, 0);
    const orderCount = filtered.length;
    const avgOrderValue = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

    // Chart representation: Group by days or months
    const groups: { [key: string]: number } = {};
    filtered.forEach(o => {
      let label = "";
      const date = new Date(o.dateCreated);
      if (salesTimeframe === "daily") {
        label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (salesTimeframe === "weekly" || salesTimeframe === "monthly") {
        label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      } else {
        label = date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      }
      groups[label] = (groups[label] || 0) + o.totalAmount;
    });

    const chartPoints = Object.keys(groups).map(key => ({
      label: key,
      value: groups[key]
    })).slice(-8); // Limit to last 8 data points for design aesthetics

    return { totalRevenue, orderCount, avgOrderValue, chartPoints, rawList: filtered };
  }, [orders, salesTimeframe, timeLimits]);

  // B. COLLECTIONS REPORT METRICS & DATA
  const collectionsData = useMemo(() => {
    let filtered = memberPayments;
    if (collectionsTimeframe === "weekly") {
      filtered = memberPayments.filter(p => new Date(p.paymentDate).getTime() >= timeLimits.sevenDaysAgo);
    } else if (collectionsTimeframe === "monthly") {
      filtered = memberPayments.filter(p => new Date(p.paymentDate).getTime() >= timeLimits.thirtyDaysAgo);
    }

    const totalCollections = filtered.reduce((sum, p) => sum + p.amountPaid, 0);
    const paymentCount = filtered.length;

    // Outstanding balances from active members
    const activeMembers = members.filter(m => m.membershipStatus !== "Archived");
    const outstandingBalances = activeMembers.reduce((sum, m) => {
      const paid = getMemberPaidAmount(m.id);
      return sum + Math.max(0, m.totalDue - paid);
    }, 0);

    // Top paying members (sorted by total cumulative payments)
    const topMembers = [...activeMembers]
      .map(m => {
        const cumulativePaid = getMemberPaidAmount(m.id);
        const remaining = Math.max(0, m.totalDue - cumulativePaid);
        return { member: m, cumulativePaid, remaining };
      })
      .sort((a, b) => b.cumulativePaid - a.cumulativePaid)
      .slice(0, 5); // Top 5

    // Chart representation: group by payment dates
    const groups: { [key: string]: number } = {};
    filtered.forEach(p => {
      const label = new Date(p.paymentDate).toLocaleDateString([], { month: 'short', day: 'numeric' });
      groups[label] = (groups[label] || 0) + p.amountPaid;
    });

    const chartPoints = Object.keys(groups).map(key => ({
      label: key,
      value: groups[key]
    })).slice(-8);

    return { totalCollections, paymentCount, outstandingBalances, topMembers, chartPoints, rawList: filtered };
  }, [memberPayments, members, collectionsTimeframe, timeLimits]);

  // EXPORT UTILITIES
  const triggerSuccessAlert = (message: string) => {
    setExportMessage(message);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const exportSalesExcel = () => {
    const headers = ["Order ID", "Customer Name", "Customer Email", "Order Date", "Product", "Total Amount (₱)", "Order Status", "Payment Status"];
    const rows = salesData.rawList.map(o => [
      o.id.slice(0, 8).toUpperCase(),
      o.customerName,
      o.customerEmail,
      o.dateCreated,
      o.product || "Swine Order",
      o.totalAmount,
      o.status,
      o.paymentStatus
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Delmar_Sales_Report_${salesTimeframe}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerSuccessAlert(`Sales report successfully exported to CSV!`);
  };

  const exportCollectionsExcel = () => {
    const headers = ["Receipt Number", "Member ID", "Payment Date", "Method", "Amount Paid (₱)", "Collector", "Remarks"];
    const rows = collectionsData.rawList.map(p => {
      const mCode = members.find(m => m.id === p.memberId)?.memberId || "";
      return [
        p.receiptNumber,
        mCode,
        p.paymentDate,
        p.paymentMethod,
        p.amountPaid,
        p.collector,
        p.remarks || ""
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Delmar_Collections_Report_${collectionsTimeframe}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerSuccessAlert(`Collection report successfully exported to CSV!`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 font-sans pb-12"
    >
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-report-section, #print-report-section * {
            visibility: visible;
          }
          #print-report-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
        }
      `}} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-900 to-[#1B4332] p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="space-y-1.5 z-10">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#D4AF37]" /> Reports & Business Analytics
          </h1>
          <p className="text-xs text-emerald-100/80 font-medium">
            Monitor sales revenue, analyze program collections progress, and export official spreadsheets.
          </p>
        </div>

        <div className="flex gap-2 z-10">
          <Button 
            variant="secondary" 
            className="bg-emerald-800/85 hover:bg-emerald-700/90 text-white text-xs font-bold uppercase rounded-xl border border-emerald-700/50 flex items-center gap-1.5 py-2.5 px-4 cursor-pointer"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4 text-emerald-400" />}
          >
            Export PDF
          </Button>
          <Button 
            variant="secondary" 
            className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-900 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 py-2.5 px-4 cursor-pointer shadow-md"
            onClick={activeTab === "sales" ? exportSalesExcel : exportCollectionsExcel}
            icon={<FileSpreadsheet className="w-4 h-4" />}
          >
            Export Excel
          </Button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportMessage}</span>
        </div>
      )}

      {/* Tabs Toolbar */}
      <div className="flex justify-between items-center bg-white dark:bg-[#0f1412] p-2.5 rounded-2xl border border-emerald-100/50 dark:border-emerald-950/20 shadow-xs">
        <span className="text-xs font-bold text-slate-500 pl-2">Select Report Console</span>
        
        <div className="bg-slate-100 dark:bg-[#070a09] p-1 rounded-xl flex gap-1 border border-slate-200/50 dark:border-emerald-955/20">
          <button 
            onClick={() => setActiveTab("sales")}
            className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${activeTab === "sales" ? "bg-white dark:bg-[#0f1412] text-slate-800 dark:text-slate-100 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
          >
            Sales Reports
          </button>
          <button 
            onClick={() => setActiveTab("collections")}
            className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${activeTab === "collections" ? "bg-white dark:bg-[#0f1412] text-slate-800 dark:text-slate-100 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
          >
            Collection Reports
          </button>
        </div>
      </div>

      {/* Main Print Container Wrapper */}
      <div id="print-report-section" className="space-y-8">
        {activeTab === "sales" ? (
          <>
            {/* Sales Sub-Filters */}
            <div className="flex justify-between items-center bg-slate-55/60 dark:bg-[#080c09] p-3 rounded-2xl border border-slate-200/50 dark:border-emerald-950/20">
              <span className="text-xs font-bold text-slate-650 dark:text-slate-350">Sales Timeframe</span>
              <div className="flex gap-2">
                {["daily", "weekly", "monthly", "yearly"].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setSalesTimeframe(mode as any)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase transition-all cursor-pointer ${salesTimeframe === mode ? "bg-emerald-600 text-white shadow-xs" : "bg-white dark:bg-[#0f1412] text-slate-550 border border-slate-200 dark:border-emerald-950/20"}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Sales Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-5 space-y-2 border border-slate-150/60 bg-white/85 dark:bg-[#0f1412]/80 backdrop-blur-md rounded-2xl shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Sales Revenue</span>
                <div className="text-2xl font-mono font-extrabold text-slate-800 dark:text-slate-100">
                  ₱{salesData.totalRevenue.toLocaleString()}
                </div>
                <span className="text-[10px] text-[#1f8f60] font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" /> Completed piggery shipments
                </span>
              </Card>

              <Card className="p-5 space-y-2 border border-slate-150/60 bg-white/85 dark:bg-[#0f1412]/80 backdrop-blur-md rounded-2xl shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Shipment Deliveries</span>
                <div className="text-2xl font-mono font-extrabold text-slate-850 dark:text-slate-100">
                  {salesData.orderCount} Orders
                </div>
                <span className="text-[10px] text-slate-450 dark:text-slate-400">Excluding pending bookings</span>
              </Card>

              <Card className="p-5 space-y-2 border border-slate-150/60 bg-white/85 dark:bg-[#0f1412]/80 backdrop-blur-md rounded-2xl shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Order Value</span>
                <div className="text-2xl font-mono font-extrabold text-slate-850 dark:text-slate-100">
                  ₱{salesData.avgOrderValue.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-450 dark:text-slate-400">Average transaction size</span>
              </Card>
            </div>

            {/* Sales Chart Section */}
            <Card className="p-6 border border-slate-100 dark:border-[#182620] bg-white dark:bg-[#0f1412]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-heading text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                    Sales Revenue Chart
                  </h3>
                  <p className="text-[9.5px] text-slate-400 font-medium">Visual trend representing completed sales collections</p>
                </div>
              </div>

              {salesData.chartPoints.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-slate-400 font-semibold text-xs border border-dashed border-slate-200 dark:border-emerald-950/20 rounded-2xl">
                  No sales data points registered in this period.
                </div>
              ) : (
                <div className="h-64 flex items-end justify-between gap-4 pt-6 border-b border-slate-100 dark:border-emerald-955/20">
                  {salesData.chartPoints.map((h, i) => {
                    const maxVal = Math.max(...salesData.chartPoints.map(p => p.value)) || 10000;
                    const heightPercent = (h.value / maxVal) * 85; // cap at 85% for tooltip spacer

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        <div className="absolute bottom-[calc(100%-10px)] bg-slate-900 text-white text-[9px] font-mono font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          ₱{h.value.toLocaleString()}
                        </div>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-emerald-700 to-emerald-500 group-hover:from-emerald-600 group-hover:to-emerald-400 transition-all rounded-t-lg shadow-xs"
                        />
                        <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 mt-2 block truncate max-w-[65px]">{h.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </>
        ) : (
          <>
            {/* Collection Sub-Filters */}
            <div className="flex justify-between items-center bg-slate-55/60 dark:bg-[#080c09] p-3 rounded-2xl border border-slate-200/50 dark:border-emerald-950/20">
              <span className="text-xs font-bold text-slate-650 dark:text-slate-350">Collections Timeframe</span>
              <div className="flex gap-2">
                {["weekly", "monthly"].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setCollectionsTimeframe(mode as any)}
                    className={`px-4 py-1.5 rounded-lg text-[9px] font-extrabold uppercase transition-all cursor-pointer ${collectionsTimeframe === mode ? "bg-emerald-600 text-white shadow-xs" : "bg-white dark:bg-[#0f1412] text-slate-550 border border-slate-200 dark:border-emerald-950/20"}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Collections Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-5 space-y-2 border border-slate-150/60 bg-white/85 dark:bg-[#0f1412]/80 backdrop-blur-md rounded-2xl shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Collections</span>
                <div className="text-2xl font-mono font-extrabold text-[#1f8f60] dark:text-[#52b788]">
                  ₱{collectionsData.totalCollections.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-450 dark:text-slate-400">Installments collected in period</span>
              </Card>

              <Card className="p-5 space-y-2 border border-slate-150/60 bg-white/85 dark:bg-[#0f1412]/80 backdrop-blur-md rounded-2xl shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Number of Payments</span>
                <div className="text-2xl font-mono font-extrabold text-slate-850 dark:text-slate-100">
                  {collectionsData.paymentCount} Payments
                </div>
                <span className="text-[10px] text-slate-450 dark:text-slate-400">Total receipt logs generated</span>
              </Card>

              <Card className="p-5 space-y-2 border border-slate-150/60 bg-white/85 dark:bg-[#0f1412]/80 backdrop-blur-md rounded-2xl shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Outstanding Balances</span>
                <div className="text-2xl font-mono font-extrabold text-red-500">
                  ₱{collectionsData.outstandingBalances.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-450 dark:text-slate-400">Awaiting program collections</span>
              </Card>
            </div>

            {/* Collection Chart & Top Payers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left: Collections Chart */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="font-heading text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Collections Curve</h3>
                <Card className="p-6 border border-slate-100 dark:border-[#182620] bg-white dark:bg-[#0f1412]">
                  {collectionsData.chartPoints.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-slate-400 font-semibold text-xs border border-dashed border-slate-200 dark:border-emerald-950/20 rounded-2xl">
                      No collections recorded in this period.
                    </div>
                  ) : (
                    <div className="h-64 flex items-end justify-between gap-4 pt-6 border-b border-slate-100 dark:border-emerald-955/20">
                      {collectionsData.chartPoints.map((h, i) => {
                        const maxVal = Math.max(...collectionsData.chartPoints.map(p => p.value)) || 5000;
                        const heightPercent = (h.value / maxVal) * 85;

                        return (
                          <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            <div className="absolute bottom-[calc(100%-10px)] bg-slate-900 text-white text-[9px] font-mono font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                              ₱{h.value.toLocaleString()}
                            </div>
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className="w-full bg-gradient-to-t from-emerald-800 to-emerald-600 group-hover:from-emerald-700 group-hover:to-emerald-550 transition-all rounded-t-lg shadow-xs"
                            />
                            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-2 block truncate max-w-[65px]">{h.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>

              {/* Right: Top Paying Members */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="font-heading text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Top Paying Members</h3>
                <Card className="p-4 border border-slate-100 dark:border-[#182620] bg-white dark:bg-[#0f1412] space-y-3">
                  {collectionsData.topMembers.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8 font-semibold">No active member payments registered.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-emerald-950/20">
                      {collectionsData.topMembers.map(({ member, cumulativePaid, remaining }) => {
                        const batchName = batches.find(b => b.id === member.batchId)?.name || "No Batch";
                        return (
                          <div key={member.id} className="flex justify-between items-center py-3 first:pt-1 last:pb-1">
                            <div>
                              <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 block">{member.fullName}</span>
                              <span className="text-[9.5px] text-slate-450 dark:text-slate-400 font-bold block">{batchName} • ID: {member.memberId}</span>
                            </div>
                            <div className="text-right space-y-0.5">
                              <span className="font-mono font-extrabold text-xs text-emerald-600 block">₱{cumulativePaid.toLocaleString()}</span>
                              <span className="text-[9.5px] text-slate-400 font-bold block">Bal: ₱{remaining.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-start gap-2.5 p-4 bg-slate-50 dark:bg-[#070a09] rounded-2xl border border-slate-150/60 dark:border-emerald-955/20 text-xs text-slate-505 dark:text-slate-400 leading-relaxed font-semibold">
        <AlertCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
        <span>Financial summary ratios are calculated on processed live hog sales and registered program collection installment logs. You can export these reports directly to Excel spreadsheets or download custom print styles to PDF format.</span>
      </div>
    </motion.div>
  );
}

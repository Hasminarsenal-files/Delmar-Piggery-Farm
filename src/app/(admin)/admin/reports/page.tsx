"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileDown, Calendar, BarChart3, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";

export default function AdminReportsPage() {
  const { orders, reservations } = useRole();
  const [exportSuccess, setExportSuccess] = useState(false);
  const [reportType, setReportType] = useState("Sales");

  const totalSales = orders
    .filter((o) => o.paymentStatus === "Paid" && o.status !== "Cancelled")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const pendingSales = reservations
    .filter((r) => r.status === "Pending" || r.status === "Approved")
    .reduce((acc, curr) => acc + curr.price, 0);

  const handleExport = (type: string) => {
    setReportType(type);
    setExportSuccess(true);
    setTimeout(() => {
      setExportSuccess(false);
    }, 2500);
  };

  // Mock monthly data for chart
  const salesHistory = [
    { month: "Jan", sales: 45000, bookings: 12 },
    { month: "Feb", sales: 52000, bookings: 16 },
    { month: "Mar", sales: 68000, bookings: 22 },
    { month: "Apr", sales: 75000, bookings: 28 },
    { month: "May", sales: 98000, bookings: 35 },
    { month: "Jun", sales: 110000, bookings: 42 },
  ];

  const maxVal = 120000;

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">Reports & Business Intelligence</h1>
          <p className="text-xs text-slate-500 font-medium">Verify feed conversions, mortality rates, and monthly dispatch margins.</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<FileDown className="w-3.5 h-3.5" />} onClick={() => handleExport("Financial Summary")}>
            Export Financials
          </Button>
          <Button variant="primary" size="sm" icon={<FileDown className="w-3.5 h-3.5" />} onClick={() => handleExport("Inventory Audit")}>
            Export Inventory
          </Button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Simulated CSV export generated for "{reportType}" and saved to downloads folder!</span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Completed Revenue</span>
          <div className="text-2xl font-extrabold text-slate-850">₱{totalSales.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +15.4% from last quarter
          </span>
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pipeline Sales</span>
          <div className="text-2xl font-extrabold text-slate-850">₱{pendingSales.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400 font-bold">Awaiting reservation pickups</span>
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avg Feed Cost Ratio</span>
          <div className="text-2xl font-extrabold text-slate-850">₱185 / kg</div>
          <span className="text-[10px] text-slate-400 font-bold">Stable supply contract</span>
        </Card>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sales Chart */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider">Hog Sales & Bookings Curve</h3>
          
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-slate-500">Monthly Revenue (₱)</span>
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-primary-600 rounded" /> Sales</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-accent-light rounded" /> Bookings count</span>
              </div>
            </div>

            {/* Custom SVG Column Chart */}
            <div className="h-64 flex items-end justify-between gap-4 pt-6 border-b border-slate-100">
              {salesHistory.map((h) => {
                const heightPercent = (h.sales / maxVal) * 100;
                return (
                  <div key={h.month} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-[calc(100%-10px)] bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      ₱{h.sales.toLocaleString()}
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-primary-600 group-hover:bg-primary-750 transition-colors rounded-t-lg shadow-sm"
                    />

                    {/* Label */}
                    <span className="text-[10px] font-bold text-slate-500 mt-2 block">{h.month}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Breakdown sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider">Stock Health Audits</h3>
          
          <Card className="p-5 space-y-4">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-550">Weanling Survival Rate</span>
                <span className="font-bold text-slate-800">98.2%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-primary-600 h-full rounded-full" style={{ width: "98.2%" }} />
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-550">Fattening Target Achievement</span>
                <span className="font-bold text-slate-800">92.5%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-accent-light h-full rounded-full" style={{ width: "92.5%" }} />
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-550">Pen Occupancy Margins</span>
                <span className="font-bold text-slate-800">76%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: "76%" }} />
              </div>
            </div>

            <div className="bg-primary-50 p-3 rounded-2xl border border-primary-100 text-[10px] text-primary-800 font-bold leading-normal flex gap-1.5">
              <Sparkles className="w-4 h-4 text-primary-600 shrink-0" />
              <span>Bio-sensors logged stable temperature values across all farrowing pens in Nueva Ecija site for the last 24h.</span>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}

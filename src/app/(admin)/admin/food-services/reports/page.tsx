"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calendar, 
  Download, 
  Coins, 
  Flame,
  Utensils
} from "lucide-react";
import { motion } from "framer-motion";

export default function FoodServicesReportsPage() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly">("monthly");
  const [isExported, setIsExported] = useState(false);

  // Mock Performance Data
  const cashSales = 6400;
  const reservationSales = 13500;
  const paluwaganSales = 12500;
  const totalRevenue = cashSales + reservationSales + paluwaganSales;

  const ordersCount = 3;
  const avgOrderValue = Math.round(totalRevenue / ordersCount);
  
  const popularItem = "Crispy Lechon Package (Large)";
  const deliveryFulfillmentRate = "97.8%";

  const exportReport = () => {
    setIsExported(true);
    setTimeout(() => setIsExported(false), 2500);
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1.5 z-10">
          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/5">
            Savorlicious Unit
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Food Services Sales Reports
          </h1>
          <p className="text-xs text-emerald-100/80 font-medium">Analyze sales performance metrics, order volume types, packages popularity, and delivery times.</p>
        </div>
        
        <div className="flex items-center gap-2.5 z-10 font-sans">
          <div className="bg-white/10 border border-white/10 p-1 rounded-xl flex gap-1 text-[9px] font-bold uppercase">
            <button 
              onClick={() => setTimeframe("weekly")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${timeframe === "weekly" ? "bg-white text-slate-900 shadow-xs" : "text-white"}`}
            >
              Week
            </button>
            <button 
              onClick={() => setTimeframe("monthly")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${timeframe === "monthly" ? "bg-white text-slate-900 shadow-xs" : "text-white"}`}
            >
              Month
            </button>
          </div>
          <Button 
            onClick={exportReport}
            className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-900 border-none font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-2 shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            Export XLS
          </Button>
        </div>
      </div>

      {isExported && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold text-center animate-bounce">
          Savorlicious Food Services Sales and Collections Report downloaded successfully!
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Sales Revenue</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-emerald-600">₱{totalRevenue.toLocaleString()}</div>
          <p className="text-[9px] font-semibold text-[#52b788] mt-1">Cash, Reservations, and Paluwagan</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Mean Ticket Invoice Size</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">₱{avgOrderValue.toLocaleString()}</div>
          <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-505 mt-1">Average spent per ticket</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Fulfillment Dispatch Rate</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-blue-600">{deliveryFulfillmentRate}</div>
          <p className="text-[9px] font-semibold text-emerald-600 mt-1">Delivery SLA success</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Fast Moving Package</div>
          <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-2 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse shrink-0" />
            <span className="truncate">{popularItem}</span>
          </div>
          <p className="text-[9px] font-semibold text-slate-400 mt-1">Highest order counts this month</p>
        </Card>
      </div>

      {/* Analytics Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales by Category and Order Type */}
        <div className="lg:col-span-8">
          <Card className="p-5 rounded-2xl border border-slate-150 space-y-5">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Order Program Types Breakdown</h3>
              <p className="text-[10px] text-slate-405 font-bold">Revenue generated per customer purchasing method</p>
            </div>
            
            <div className="space-y-4 pt-2">
              {[
                { name: "Cash Orders Checkout", amount: cashSales, percentage: (cashSales / totalRevenue) * 100, color: "bg-emerald-600" },
                { name: "Advance Reservation Bookings", amount: reservationSales, percentage: (reservationSales / totalRevenue) * 100, color: "bg-blue-500" },
                { name: "Paluwagan Installments Ledger", amount: paluwaganSales, percentage: (paluwaganSales / totalRevenue) * 100, color: "bg-[#D4AF37]" },
              ].map((item, index) => (
                <div key={index} className="space-y-1.5 text-xs font-sans">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="text-slate-800">₱{item.amount.toLocaleString()} ({item.percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-emerald-950/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`h-full rounded-full ${item.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Popular Food Packages Chart */}
        <div className="lg:col-span-4">
          <Card className="p-5 rounded-2xl border border-slate-150 space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Popular Packages Ratio</h3>
              <p className="text-[10px] text-slate-405 font-bold">Ticket counts by Savorlicious product category</p>
            </div>

            <div className="space-y-3.5 py-1">
              {[
                { name: "Crispy Lechon Packages", count: 18, share: "45%" },
                { name: "Buffet Catering Sets", count: 12, share: "30%" },
                { name: "Fresh Pork Belly Cuts", count: 6, share: "15%" },
                { name: "Sweet Corners & Cakes", count: 4, share: "10%" },
              ].map((row, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-655 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                    {row.name}
                  </span>
                  <span className="font-bold text-slate-850 font-mono">{row.count} orders ({row.share})</span>
                </div>
              ))}
            </div>

            <div className="bg-emerald-50 text-emerald-800 font-bold p-3 text-[10px] rounded-xl">
              Swine sourcing: 65% supplied internally from Savorlicious Food Services; 35% from external Nueva Ecija growers.
            </div>
          </Card>
        </div>

      </div>

      {/* Dispatch Logistics Efficiency metrics */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Deliveries Fulfillment Metrics</h3>
          <p className="text-[10px] text-slate-405 font-bold">SLA efficiency tracking by logistics rider</p>
        </div>
        <Card className="p-0 overflow-hidden border border-slate-150">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Delivery Courier / Rider</TableHead>
                <TableHead>Runs Completed</TableHead>
                <TableHead>Mean Transit Time</TableHead>
                <TableHead>On-Time SLA</TableHead>
                <TableHead>Fulfillment Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: "Reynaldo Diaz (Motorcycle)", runs: 28, time: "42 mins", sla: "98.2%", status: "Excellent" },
                { name: "Armando Perez (Utility Truck)", runs: 12, time: "1 hr 15 mins", sla: "96.5%", status: "Good" },
              ].map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-100">{row.name}</TableCell>
                  <TableCell className="text-xs font-semibold text-slate-700 font-mono">{row.runs} runs</TableCell>
                  <TableCell className="text-xs font-bold text-slate-750 font-mono">{row.time}</TableCell>
                  <TableCell className="text-xs font-bold text-emerald-600 font-mono">{row.sla}</TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 rounded-lg text-[9.5px] font-extrabold bg-emerald-50 text-emerald-600 font-mono">
                      {row.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

    </div>
  );
}

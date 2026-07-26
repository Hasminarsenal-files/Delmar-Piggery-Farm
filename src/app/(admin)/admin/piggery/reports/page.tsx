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
  AlertTriangle 
} from "lucide-react";

export default function FarmReportsPage() {
  const [timeframe, setTimeframe] = useState<"monthly" | "yearly">("monthly");
  const [isExported, setIsExported] = useState(false);

  // Mock Performance Data
  const animalCountTotal = 32; // sum of piggery inventory
  const activeSows = 5;
  const pigletsBornYTD = 45;
  const farrowingSuccess = "94.5%";
  const averageLitterSize = 11.2;
  const mortalityRate = "2.8%";
  
  // Financial flows
  const totalPiggerySales = 42400; // Piglet sales sum
  const totalPiggeryExpenses = 43000; // Feeds + Vet + Wages + Repairs
  const netMargin = totalPiggerySales - totalPiggeryExpenses;

  // Monthly stats
  const feedConsumptionTons = 2.4;
  const fcr = 2.6; // Feed Conversion Ratio

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
            Piggery Unit
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Farm Performance Reports
          </h1>
          <p className="text-xs text-emerald-100/80 font-medium">Analyze breeding efficiency, FCR parameters, mortality logs, and financial overhead balance.</p>
        </div>
        
        <div className="flex items-center gap-2.5 z-10">
          <div className="bg-white/10 border border-white/10 p-1 rounded-xl flex gap-1 text-[9px] font-bold uppercase">
            <button 
              onClick={() => setTimeframe("monthly")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${timeframe === "monthly" ? "bg-white text-slate-900 shadow-xs" : "text-white"}`}
            >
              Month
            </button>
            <button 
              onClick={() => setTimeframe("yearly")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${timeframe === "yearly" ? "bg-white text-slate-900 shadow-xs" : "text-white"}`}
            >
              Year
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
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold text-center">
          Piggery Operational Performance Report compiled and downloaded successfully!
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Breeding Success Rate</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-emerald-600">{farrowingSuccess}</div>
          <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Gilt-to-sow transition</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Avg Litter Size (Born Alive)</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">{averageLitterSize} heads</div>
          <p className="text-[9px] font-semibold text-[#52b788] mt-1">Industry standard benchmark: 10.5</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Herd Mortality Rate</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-red-600">{mortalityRate}</div>
          <p className="text-[9px] font-semibold text-emerald-600 mt-1">Excellent biosafety outcome</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Feed Conversion Ratio (FCR)</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-blue-600">{fcr} kg</div>
          <p className="text-[9px] font-semibold text-slate-450 mt-1">Feed required per 1kg weight gain</p>
        </Card>
      </div>

      {/* Charts and Overviews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Swine Growth Metrics */}
        <div className="lg:col-span-7">
          <Card className="p-5 rounded-2xl border border-slate-150 space-y-4">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Swine Cohort Feed Conversion Graph</h3>
              <p className="text-[10px] text-slate-405 font-bold">Monthly feed intake vs average swine weight gain</p>
            </div>
            
            <div className="h-60 pt-4 flex items-end justify-between border-b border-slate-100 pb-2">
              {[
                { label: "Jan", feed: 1.8, weight: 65 },
                { label: "Feb", feed: 2.0, weight: 72 },
                { label: "Mar", feed: 2.1, weight: 78 },
                { label: "Apr", feed: 2.3, weight: 85 },
                { label: "May", feed: 2.2, weight: 83 },
                { label: "Jun", feed: 2.4, weight: 90 },
              ].map((point, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-grow">
                  <div className="flex gap-1.5 items-end h-44 justify-center">
                    {/* Feed bar */}
                    <div 
                      style={{ height: `${(point.feed / 3) * 100}%` }} 
                      className="w-4 bg-emerald-600 rounded-t-xs hover:bg-emerald-700 transition-all"
                      title={`Feed intake: ${point.feed} tons`}
                    />
                    {/* Weight bar */}
                    <div 
                      style={{ height: `${(point.weight / 120) * 100}%` }} 
                      className="w-4 bg-[#D4AF37] rounded-t-xs hover:bg-[#D4AF37]/90 transition-all"
                      title={`Weight gain: ${point.weight} kg`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-450 font-mono">{point.label}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center gap-6 text-[10px] font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-600 rounded-xs" />
                <span>Monthly Feed Intake (Tons)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#D4AF37] rounded-xs" />
                <span>Swine Mean Weight (Kg)</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Operating Balance Sheet */}
        <div className="lg:col-span-5">
          <Card className="p-5 rounded-2xl border border-slate-150 space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Swine Unit Financial Sheet</h3>
              <p className="text-[10px] text-slate-405 font-bold">Total revenue vs farm operating budget</p>
            </div>

            <div className="space-y-3 py-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Piglet Sales Revenue</span>
                <span className="font-bold text-emerald-600">₱{totalPiggerySales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Gilt/Hog Sales (Other)</span>
                <span className="font-bold text-emerald-600">₱0</span>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Feed Overhead Expenses</span>
                <span className="font-bold text-red-500">-₱24,000</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Swine Vaccines & Meds</span>
                <span className="font-bold text-red-500">-₱8,500</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Utilities (Meralco, water pumps)</span>
                <span className="font-bold text-red-500">-₱5,200</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Labor wages & Stipends</span>
                <span className="font-bold text-red-500">-₱3,500</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Repairs & Gates maintenance</span>
                <span className="font-bold text-red-500">-₱1,800</span>
              </div>
              <div className="h-px bg-slate-150" />
              <div className="flex justify-between items-center text-xs font-extrabold">
                <span>Net Margin Cashflow</span>
                <span className={netMargin >= 0 ? "text-emerald-600" : "text-red-500"}>
                  {netMargin >= 0 ? "+" : ""}₱{netMargin.toLocaleString()}
                </span>
              </div>
            </div>

            <div className={`p-3 text-[10.5px] font-bold rounded-2xl flex items-center gap-2 ${
              netMargin >= 0 ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
            }`}>
              <Activity className="w-4 h-4" />
              {netMargin >= 0 
                ? "Piggery operations are cashflow positive this timeframe." 
                : "Swine unit is currently running a deficit due to feeds inventory stockpiling."}
            </div>
          </Card>
        </div>

      </div>

      {/* Historical Performance Table */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Historical Swine Cohort Batches</h3>
          <p className="text-[10px] text-slate-405 font-bold">Farrowing size and survival statistics by weaning batch</p>
        </div>
        <Card className="p-0 overflow-hidden border border-slate-150">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cohort Batch</TableHead>
                <TableHead>Farrowing Date</TableHead>
                <TableHead>Sows Bred</TableHead>
                <TableHead>Litter Count Born</TableHead>
                <TableHead>Mortality Loss</TableHead>
                <TableHead>Weaned Head</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { cohort: "Batch 2026-A", date: "2026-02-15", sows: 2, born: 22, loss: 1, weaned: 21, status: "Weaned & Sold" },
                { cohort: "Batch 2026-B", date: "2026-06-24", sows: 3, born: 34, loss: 0, weaned: 34, status: "Nursing" },
              ].map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-100">{row.cohort}</TableCell>
                  <TableCell className="text-xs text-slate-500 font-mono">{row.date}</TableCell>
                  <TableCell className="text-xs font-semibold text-slate-800">{row.sows} head</TableCell>
                  <TableCell className="text-xs font-bold text-emerald-600">{row.born} head</TableCell>
                  <TableCell className="text-xs font-bold text-red-500">{row.loss} head</TableCell>
                  <TableCell className="text-xs font-bold text-slate-800">{row.weaned} head</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-lg text-[9.5px] font-extrabold ${
                      row.status === "Weaned & Sold" ? "bg-slate-100 text-slate-650" : "bg-emerald-50 text-emerald-600"
                    }`}>
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

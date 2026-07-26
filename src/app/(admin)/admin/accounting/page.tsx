"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { 
  Landmark, 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

export default function AccountingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "quarterly">("monthly");

  // Swine Farm Financials
  const piggeryRevenue = 42400; // Piglet sales sum
  const piggeryExpenses = 43000; // Feeds + Meds + Utilities + Wages + Repairs
  const piggeryNet = piggeryRevenue - piggeryExpenses;

  // Savorlicious Food Services Financials
  const foodRevenue = 32400; // Cash + Reservation + Paluwagan payments
  const foodExpenses = 14500; // Sourcing, Rider payouts, event preparation (Mocked)
  const foodNet = foodRevenue - foodExpenses;

  // Consolidated Corporation Financials
  const consolidatedRevenue = piggeryRevenue + foodRevenue;
  const consolidatedExpenses = piggeryExpenses + foodExpenses;
  const consolidatedNet = consolidatedRevenue - consolidatedExpenses;

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1.5 z-10">
          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/5">
            Finance & Ledger
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-400" />
            Consolidated Ledger Center
          </h1>
          <p className="text-xs text-emerald-100/80 font-medium">Verify independent operating accounts, corporate net cashflows, and tax margins records.</p>
        </div>

        <div className="bg-white/10 border border-white/10 p-1 rounded-xl flex gap-1 text-[9px] font-bold uppercase z-10 font-sans">
          <button 
            onClick={() => setSelectedPeriod("monthly")}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${selectedPeriod === "monthly" ? "bg-white text-slate-900 shadow-xs" : "text-white"}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setSelectedPeriod("quarterly")}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${selectedPeriod === "quarterly" ? "bg-white text-slate-900 shadow-xs" : "text-white"}`}
          >
            Quarterly
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Swine Farm Card */}
        <Card className="p-5 rounded-2xl shadow-2xs hover:shadow-md transition-all border-l-4 border-emerald-600">
          <div className="flex justify-between items-start">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Swine Farm Unit Cashflow</span>
            <span className={`text-[10px] font-extrabold flex items-center ${piggeryNet >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {piggeryNet >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {((piggeryNet / piggeryRevenue) * 100).toFixed(1)}% margin
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-3">
            ₱{piggeryRevenue.toLocaleString()}
          </div>
          <div className="text-[10.5px] text-slate-450 mt-1 flex justify-between font-semibold">
            <span>Expenses: ₱{piggeryExpenses.toLocaleString()}</span>
            <span className={piggeryNet >= 0 ? "text-emerald-600" : "text-red-500"}>
              Net: {piggeryNet >= 0 ? "+" : ""}₱{piggeryNet.toLocaleString()}
            </span>
          </div>
        </Card>

        {/* Food Services Card */}
        <Card className="p-5 rounded-2xl shadow-2xs hover:shadow-md transition-all border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Food Services Cashflow</span>
            <span className={`text-[10px] font-extrabold flex items-center ${foodNet >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {foodNet >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {((foodNet / foodRevenue) * 100).toFixed(1)}% margin
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-3">
            ₱{foodRevenue.toLocaleString()}
          </div>
          <div className="text-[10.5px] text-slate-450 mt-1 flex justify-between font-semibold">
            <span>Expenses: ₱{foodExpenses.toLocaleString()}</span>
            <span className={foodNet >= 0 ? "text-emerald-600" : "text-red-500"}>
              Net: {foodNet >= 0 ? "+" : ""}₱{foodNet.toLocaleString()}
            </span>
          </div>
        </Card>

        {/* Consolidated Card */}
        <Card className="p-5 rounded-2xl shadow-2xs hover:shadow-md transition-all bg-gradient-to-r from-slate-900 to-slate-950 text-white border-none">
          <div className="flex justify-between items-start">
            <span className="text-[9.5px] font-bold text-slate-450 uppercase tracking-wider block">Corporate Net Margins</span>
            <span className={`text-[10px] font-extrabold flex items-center ${consolidatedNet >= 0 ? "text-emerald-450" : "text-red-400"}`}>
              {consolidatedNet >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {((consolidatedNet / consolidatedRevenue) * 100).toFixed(1)}% net
            </span>
          </div>
          <div className="text-xl font-extrabold mt-3 text-[#D4AF37]">
            ₱{consolidatedRevenue.toLocaleString()}
          </div>
          <div className="text-[10.5px] text-slate-400 mt-1 flex justify-between font-bold">
            <span>Expenses: ₱{consolidatedExpenses.toLocaleString()}</span>
            <span className={consolidatedNet >= 0 ? "text-emerald-450" : "text-red-400"}>
              Net Profit: ₱{consolidatedNet.toLocaleString()}
            </span>
          </div>
        </Card>

      </div>

      {/* Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Income Statement Comparison Bars */}
        <div className="lg:col-span-8">
          <Card className="p-5 rounded-2xl border border-slate-150 space-y-5">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Unit Net Margins Comparisons</h3>
              <p className="text-[10px] text-slate-405 font-bold">Consolidated net profit generation by business unit</p>
            </div>
            
            <div className="space-y-4 pt-2">
              {[
                { name: "Delmar Swine Farm Operations", revenue: piggeryRevenue, expenses: piggeryExpenses, net: piggeryNet, color: "bg-emerald-600" },
                { name: "Savorlicious Food Services Unit", revenue: foodRevenue, expenses: foodExpenses, net: foodNet, color: "bg-blue-500" },
              ].map((item, index) => {
                const maxVal = Math.max(piggeryRevenue, foodRevenue);
                const revPct = (item.revenue / maxVal) * 100;
                const expPct = (item.expenses / maxVal) * 100;
                
                return (
                  <div key={index} className="space-y-2 border-b border-slate-100 pb-3 last:border-none last:pb-0 text-xs">
                    <div className="font-bold text-slate-750">{item.name}</div>
                    
                    <div className="space-y-1.5 font-sans">
                      {/* Revenue Bar */}
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="text-slate-500 font-semibold">Total Revenue Inflow:</span>
                        <span className="font-bold text-emerald-600">₱{item.revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${revPct}%` }} />
                      </div>

                      {/* Expenses Bar */}
                      <div className="flex justify-between items-center text-[10.5px] pt-1">
                        <span className="text-slate-500 font-semibold">Operating Expense Outflow:</span>
                        <span className="font-bold text-red-500">₱{item.expenses.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${expPct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Operating Security Checklist */}
        <div className="lg:col-span-4">
          <Card className="p-5 rounded-2xl border border-slate-150 space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Financial Audit Status</h3>
              <p className="text-[10px] text-slate-405 font-bold">Automatic compliance validation checks</p>
            </div>

            <div className="space-y-3">
              {[
                { check: "Double-Entry Ledger Verified", status: true },
                { check: "Swine Inventory Sync Status", status: true },
                { check: "Paluwagan Installments Logged", status: true },
                { check: "Logistics Riders Pay Completed", status: true },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-655 flex items-center gap-2">
                    <ShieldCheck className={`w-4 h-4 ${item.status ? "text-emerald-500" : "text-slate-350"}`} />
                    {item.check}
                  </span>
                  <span className="font-extrabold text-emerald-600 font-mono">OK</span>
                </div>
              ))}
            </div>

            <div className="bg-[#1B4332] text-emerald-100 font-bold p-3 text-[10px] rounded-xl flex items-center gap-2">
              <Activity className="w-4 h-4 shrink-0" />
              Swine unit inventory valuations are computed separate from fresh meat stocks as per biosecurity guidelines.
            </div>
          </Card>
        </div>

      </div>

      {/* Accounting Ledgers */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Swine Farm & Food Services Ledgers</h3>
          <p className="text-[10px] text-slate-405 font-bold">Consolidated transaction cashflows listing</p>
        </div>
        <Card className="p-0 overflow-hidden border border-slate-150">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference ID</TableHead>
                <TableHead>Business Unit</TableHead>
                <TableHead>Transaction Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Inflow Amount</TableHead>
                <TableHead>Outflow Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { ref: "PS-2001", unit: "Delmar Piggery", title: "Sold 5x Duroc Piglets (Karlo Ramos)", type: "Revenue", inflow: 17500, outflow: 0, status: "Cleared" },
                { ref: "EXP-801", unit: "Delmar Piggery", title: "Purchased 15 bags Mash feeds (Cargill)", type: "Expense", inflow: 0, outflow: 24000, status: "Cleared" },
                { ref: "ORD-9021", unit: "Savorlicious Food", title: "Cash Order check (Maria Santos)", type: "Revenue", inflow: 6400, outflow: 0, status: "Cleared" },
                { ref: "ORD-9022", unit: "Savorlicious Food", title: "Advance Booking deposit (John Doe)", type: "Revenue", inflow: 13500, outflow: 0, status: "Cleared" },
                { ref: "ORD-9023", unit: "Savorlicious Food", title: "Paluwagan Installment 1-3 (Juan Cruz)", type: "Revenue", inflow: 7500, outflow: 0, status: "Cleared" },
              ].map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-mono text-xs font-bold text-slate-650">{row.ref}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-800">{row.unit}</TableCell>
                  <TableCell className="text-xs font-semibold text-slate-655">{row.title}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-lg text-[9.5px] font-extrabold ${
                      row.type === "Revenue" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
                    }`}>
                      {row.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-emerald-600 font-mono">
                    {row.inflow > 0 ? `₱${row.inflow.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-red-500 font-mono">
                    {row.outflow > 0 ? `₱${row.outflow.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 rounded-lg text-[9.5px] font-extrabold bg-slate-100 text-slate-650">
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

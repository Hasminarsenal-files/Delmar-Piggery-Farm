"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { 
  DollarSign, 
  Search, 
  Plus, 
  TrendingUp, 
  Coins, 
  FileText,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface FarmExpense {
  id: string;
  category: "Feeds" | "Medicine & Veterinary" | "Labor & Wages" | "Utilities" | "Maintenance" | "Other";
  description: string;
  amount: number;
  date: string;
  status: "Paid" | "Pending Approval";
  paymentMethod: string;
}

export default function FarmExpensesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [expenses, setExpenses] = useState<FarmExpense[]>([
    { id: "EXP-801", category: "Feeds", description: "Purchased 15 bags Grower Mash feeds from Cargill", amount: 24000, date: "2026-07-02", status: "Paid", paymentMethod: "GCash" },
    { id: "EXP-802", category: "Medicine & Veterinary", description: "Iron dextran shots and swine flu vaccines batch #4", amount: 8500, date: "2026-07-06", status: "Paid", paymentMethod: "GCash" },
    { id: "EXP-803", category: "Utilities", description: "Meralco electricity bill - water pumps & heat lamps", amount: 5200, date: "2026-07-10", status: "Paid", paymentMethod: "Bank Transfer" },
    { id: "EXP-804", category: "Labor & Wages", description: "Weekly worker stipend - farm maintenance helper", amount: 3500, date: "2026-07-14", status: "Paid", paymentMethod: "Cash" },
    { id: "EXP-805", category: "Maintenance", description: "Repair fencing materials for Pen A-3 swine gate", amount: 1800, date: "2026-07-15", status: "Pending Approval", paymentMethod: "Cash" },
  ]);

  const [form, setForm] = useState({
    category: "Feeds" as FarmExpense["category"],
    description: "",
    amount: 1000,
    date: "",
    status: "Paid" as "Paid" | "Pending Approval",
    paymentMethod: "GCash",
  });

  const categories = ["All", "Feeds", "Medicine & Veterinary", "Labor & Wages", "Utilities", "Maintenance", "Other"];

  const totalExpenses = expenses.filter(e => e.status === "Paid").reduce((acc, curr) => acc + curr.amount, 0);
  const feedsCost = expenses.filter(e => e.category === "Feeds" && e.status === "Paid").reduce((acc, curr) => acc + curr.amount, 0);
  const medCost = expenses.filter(e => e.category === "Medicine & Veterinary" && e.status === "Paid").reduce((acc, curr) => acc + curr.amount, 0);
  const otherCost = totalExpenses - feedsCost - medCost;

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          exp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || exp.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.date || form.amount <= 0) return;

    const newExpense: FarmExpense = {
      id: `EXP-${801 + expenses.length}`,
      category: form.category,
      description: form.description,
      amount: Number(form.amount),
      date: form.date,
      status: form.status,
      paymentMethod: form.paymentMethod
    };

    setExpenses([newExpense, ...expenses]);
    setSuccessMsg("Expense logged successfully!");
    setTimeout(() => {
      setSuccessMsg("");
      setIsAddOpen(false);
      setForm({
        category: "Feeds",
        description: "",
        amount: 1000,
        date: "",
        status: "Paid",
        paymentMethod: "GCash",
      });
    }, 1500);
  };

  const handleApprove = (id: string) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, status: "Paid" } : e));
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
            <DollarSign className="w-5 h-5 text-red-400" />
            Farm Expenses Journal
          </h1>
          <p className="text-xs text-emerald-100/80 font-medium">Record and categorize feeds purchase receipts, veterinary vaccines costs, wages, and utilities overhead.</p>
        </div>
        <Button 
          onClick={() => setIsAddOpen(true)}
          className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-900 border-none font-bold text-xs py-2 px-4 rounded-xl shadow-md z-10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Expense
        </Button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-4 gap-5">
        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Paid Expenses</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-red-650">₱{totalExpenses.toLocaleString()}</div>
          <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Current monthly bills</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Feeds Inventory Costs</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">₱{feedsCost.toLocaleString()}</div>
          <p className="text-[9px] font-semibold text-[#52b788] mt-1">{(totalExpenses > 0 ? (feedsCost / totalExpenses) * 100 : 0).toFixed(0)}% of total overhead</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Medicine & Swine Health</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">₱{medCost.toLocaleString()}</div>
          <p className="text-[9px] font-semibold text-[#D4AF37] mt-1">{(totalExpenses > 0 ? (medCost / totalExpenses) * 100 : 0).toFixed(0)}% of total overhead</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Other Utility & Stipends</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">₱{otherCost.toLocaleString()}</div>
          <p className="text-[9px] font-semibold text-slate-400 mt-1">Water pumps, fencing, labor</p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0f1412] p-4 border border-slate-150 dark:border-[#182620] rounded-2xl shadow-2xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search details or expense ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 dark:border-emerald-950 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-slate-50 dark:bg-[#070a09] font-medium"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto w-full sm:w-auto">
          {categories.map((tab) => (
            <button
              key={tab}
              onClick={() => setCategoryFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase whitespace-nowrap cursor-pointer transition-colors ${
                categoryFilter === tab
                  ? "bg-[#1B4332] text-white"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-650 dark:bg-emerald-950/20 dark:text-slate-300"
              }`}
            >
              {tab === "Medicine & Veterinary" ? "Meds" : tab === "Labor & Wages" ? "Wages" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filteredExpenses.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 text-xs font-semibold">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          No farm expenses matching filter query.
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden border border-slate-150 dark:border-[#182620]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expense ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description Details</TableHead>
                <TableHead>Amount (₱)</TableHead>
                <TableHead>Expense Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="font-mono text-xs font-bold text-slate-650">{exp.id}</TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 uppercase tracking-wider">
                      {exp.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-800 dark:text-slate-100">{exp.description}</TableCell>
                  <TableCell className="text-xs font-extrabold text-red-600 font-mono">
                    ₱{exp.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-500 font-mono">{exp.date}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-600">{exp.paymentMethod}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-lg text-[9.5px] font-extrabold ${
                      exp.status === "Paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600 animate-pulse"
                    }`}>
                      {exp.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {exp.status === "Pending Approval" ? (
                      <Button size="sm" variant="secondary" onClick={() => handleApprove(exp.id)} className="bg-emerald-700 text-white font-bold py-1">
                        Approve Pay
                      </Button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">Cleared</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Log Expense Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Log Swine Farm Expense Receipt">
        <form onSubmit={handleAddExpense} className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              >
                <option value="Feeds">Feeds & Mash</option>
                <option value="Medicine & Veterinary">Medicine & Swine Vaccines</option>
                <option value="Labor & Wages">Labor Stipends / Wages</option>
                <option value="Utilities">Utilities (Water / Power)</option>
                <option value="Maintenance">Fencing & Pen Repairs</option>
                <option value="Other">Other Expenses</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Amount (₱)</label>
              <input
                type="number"
                min="1"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold text-red-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-600">Description details</label>
            <input
              type="text"
              placeholder="e.g. Purchased 10 bags starter feed"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-xl font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Expense Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              >
                <option value="GCash">GCash</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Initial Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold"
              >
                <option value="Paid">Paid Out</option>
                <option value="Pending Approval">Pending Approval / Reimburse</option>
              </select>
            </div>
          </div>

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="light" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1B4332] text-white">
              Log Expense Item
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

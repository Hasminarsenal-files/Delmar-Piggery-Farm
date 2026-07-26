"use client";

import React, { useState, useMemo } from "react";
import { useRole, PaluwaganLedgerEntry, Order } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import {
  Coins,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  XCircle,
  Download,
  FileSpreadsheet,
  Edit2,
  Trash2,
  History,
  ShieldAlert,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PaluwaganLedgerPage() {
  const {
    userName,
    orders,
    paluwaganApplications,
    paluwaganLedger,
    paluwaganBatches,
    auditLogs,
    addLedgerPayment,
    voidLedgerPayment,
    correctLedgerPayment,
    showToast
  } = useRole();

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [collectorFilter, setCollectorFilter] = useState("All");

  // Selected item modal states
  const [selectedRecord, setSelectedRecord] = useState<PaluwaganLedgerEntry | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Correction Form values
  const [editForm, setEditForm] = useState({
    amountPaid: 0,
    paymentDate: "",
    paymentMethod: "",
    collector: "",
    remarks: ""
  });

  // Master lists
  const collectorsList = useMemo(() => {
    const list = new Set(paluwaganLedger.map(l => l.collector));
    return ["All", ...Array.from(list)];
  }, [paluwaganLedger]);

  const todayStr = new Date().toISOString().split("T")[0];

  // Helper date parsing
  const getDaysAgo = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  };

  // 1. Dashboard summary cards calculations
  const summaries = useMemo(() => {
    const nonVoided = paluwaganLedger.filter(p => p.status !== "Voided");
    
    // Today's Collections
    const todayColl = nonVoided
      .filter(p => p.paymentDate === todayStr)
      .reduce((sum, p) => sum + p.amountPaid, 0);

    // Weekly Collections (last 7 days)
    const sevenDaysAgo = getDaysAgo(7);
    const weeklyColl = nonVoided
      .filter(p => new Date(p.paymentDate) >= sevenDaysAgo)
      .reduce((sum, p) => sum + p.amountPaid, 0);

    // Monthly Collections (last 30 days)
    const thirtyDaysAgo = getDaysAgo(30);
    const monthlyColl = nonVoided
      .filter(p => new Date(p.paymentDate) >= thirtyDaysAgo)
      .reduce((sum, p) => sum + p.amountPaid, 0);

    // Total Collections
    const totalColl = nonVoided.reduce((sum, p) => sum + p.amountPaid, 0);

    // Outstanding Balances
    const outstandingVal = orders
      .filter(o => o.orderType === "Paluwagan" && o.status !== "Pending")
      .reduce((sum, o) => {
        const schedPaid = o.paluwaganSchedule?.reduce((s, i) => s + i.amountPaid, 0) || 0;
        const totPaid = (o.downPayment || 0) + schedPaid;
        const rem = o.totalAmount - totPaid;
        return sum + Math.max(0, rem);
      }, 0);

    // Overdue Accounts Amount
    const overdueVal = orders
      .filter(o => o.orderType === "Paluwagan")
      .reduce((sum, o) => {
        const schedOverdue = o.paluwaganSchedule
          ?.filter(i => i.status === "OVERDUE" || ((i.status === "UPCOMING" || i.status === "DUE") && new Date(i.dueDate) < new Date()))
          ?.reduce((s, i) => s + (i.amountDue - i.amountPaid), 0) || 0;
        return sum + schedOverdue;
      }, 0);

    return {
      todayColl,
      weeklyColl,
      monthlyColl,
      totalColl,
      outstandingVal,
      overdueVal
    };
  }, [paluwaganLedger, orders, todayStr]);

  // 2. Filtered ledger lists
  const filteredLedger = useMemo(() => {
    return paluwaganLedger.filter(row => {
      const matchesSearch =
        row.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "All" || row.status === statusFilter;
      const matchesDate = !dateFilter || row.paymentDate === dateFilter;
      const matchesCollector = collectorFilter === "All" || row.collector === collectorFilter;

      return matchesSearch && matchesStatus && matchesDate && matchesCollector;
    });
  }, [paluwaganLedger, searchTerm, statusFilter, dateFilter, collectorFilter]);

  // Filter audit logs specifically matching Paluwagan corrections and edits
  const paluwaganAuditLogs = useMemo(() => {
    return auditLogs.filter(
      (log) =>
        log.action.startsWith("PALUWAGAN_") ||
        log.details.includes("Paluwagan") ||
        log.action.includes("PALUWAGAN")
    );
  }, [auditLogs]);

  // 3. Chart calculations
  const chartData = useMemo(() => {
    // Methods performance
    const nonVoided = paluwaganLedger.filter(p => p.status !== "Voided");
    const methodCounts: Record<string, number> = {};
    nonVoided.forEach(p => {
      methodCounts[p.paymentMethod] = (methodCounts[p.paymentMethod] || 0) + p.amountPaid;
    });

    const batchPerformance: Record<string, number> = {};
    nonVoided.forEach(p => {
      batchPerformance[p.batchName] = (batchPerformance[p.batchName] || 0) + p.amountPaid;
    });

    // Daily collections for last 5 days
    const dailyMap: Record<string, number> = {};
    for (let i = 4; i >= 0; i--) {
      const dateString = getDaysAgo(i).toISOString().split("T")[0];
      dailyMap[dateString] = 0;
    }
    nonVoided.forEach(p => {
      if (dailyMap[p.paymentDate] !== undefined) {
        dailyMap[p.paymentDate] += p.amountPaid;
      }
    });

    return {
      methods: Object.entries(methodCounts).map(([name, val]) => ({ name, val })),
      batches: Object.entries(batchPerformance).map(([name, val]) => ({ name, val })),
      daily: Object.entries(dailyMap).map(([date, val]) => {
        const shortDate = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return { date: shortDate, val };
      })
    };
  }, [paluwaganLedger]);

  // Click row to view
  const handleOpenDetails = (row: PaluwaganLedgerEntry) => {
    setSelectedRecord(row);
    setIsDetailsOpen(true);
  };

  // Void payment handler
  const handleVoidPayment = async () => {
    if (!selectedRecord) return;
    if (!confirm(`Are you sure you want to VOID payment receipt ${selectedRecord.receiptNumber}? This is a permanent administrative audit change.`)) {
      return;
    }

    const success = await voidLedgerPayment(selectedRecord.id, userName);
    if (success) {
      showToast("Payment Voided", `Successfully voided payment receipt ${selectedRecord.receiptNumber}.`, "warning");
      setIsDetailsOpen(false);
      setSelectedRecord(null);
    }
  };

  // Correct payment form trigger
  const handleOpenEdit = () => {
    if (!selectedRecord) return;
    setEditForm({
      amountPaid: selectedRecord.amountPaid,
      paymentDate: selectedRecord.paymentDate,
      paymentMethod: selectedRecord.paymentMethod,
      collector: selectedRecord.collector,
      remarks: selectedRecord.remarks || ""
    });
    setIsEditOpen(true);
  };

  const handleConfirmEdit = async () => {
    if (!selectedRecord) return;
    const success = await correctLedgerPayment(
      selectedRecord.id,
      {
        amountPaid: editForm.amountPaid,
        paymentDate: editForm.paymentDate,
        paymentMethod: editForm.paymentMethod,
        collector: editForm.collector,
        remarks: editForm.remarks
      },
      userName
    );

    if (success) {
      showToast("Payment Adjusted", `Corrected payment details for OR: ${selectedRecord.receiptNumber}.`, "success");
      setIsEditOpen(false);
      setIsDetailsOpen(false);
      setSelectedRecord(null);
    }
  };

  // Export handlers
  const handleExportPDF = () => {
    showToast("Exporting PDF", "Delmar Farm Paluwagan Collection report is generating...", "info");
    setTimeout(() => {
      // Simulate file download by creating a fake print content popup
      const newWin = window.open("", "_blank");
      if (newWin) {
        newWin.document.write(`
          <html>
            <head>
              <title>Paluwagan Collection Ledger Report</title>
              <style>
                body { font-family: sans-serif; padding: 20px; color: #333; }
                .header { border-bottom: 2px solid #1b4332; padding-bottom: 10px; margin-bottom: 20px; }
                h1 { color: #1b4332; margin: 0; }
                .summary { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #f9f9f9; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .total { text-align: right; font-weight: bold; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Delmar Farm Paluwagan Ledger</h1>
                <p>Generated: ${new Date().toLocaleString()} | Administrator: ${userName}</p>
              </div>
              <div class="summary">
                <h3>Collection Summary Metrics</h3>
                <p>Total Registered Collections: ₱${summaries.totalColl.toLocaleString()}</p>
                <p>Outstanding Member Balances: ₱${summaries.outstandingVal.toLocaleString()}</p>
                <p>Overdue Installments Amount: ₱${summaries.overdueVal.toLocaleString()}</p>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Receipt</th>
                    <th>Date</th>
                    <th>Member ID</th>
                    <th>Member Name</th>
                    <th>Batch</th>
                    <th>Order No</th>
                    <th>Inst #</th>
                    <th>Amount Paid</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredLedger.map(r => `
                    <tr>
                      <td>${r.receiptNumber}</td>
                      <td>${r.paymentDate}</td>
                      <td>${r.memberId}</td>
                      <td>${r.memberName}</td>
                      <td>${r.batchName}</td>
                      <td>${r.orderId}</td>
                      <td>${r.installmentNumber === 0 ? "Downpayment" : `#${r.installmentNumber}`}</td>
                      <td>₱${r.amountPaid.toLocaleString()}</td>
                      <td>${r.paymentMethod}</td>
                      <td>${r.status}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
              <script>window.print();</script>
            </body>
          </html>
        `);
        newWin.document.close();
      }
    }, 1200);
  };

  const handleExportExcel = () => {
    showToast("Exporting Excel", "Ledger sheets generating as Spreadsheet formatted document...", "info");
    setTimeout(() => {
      // Simulate spreadsheet file download
      alert("Spreadsheet generated successfully!\nFile Name: paluwagan_collection_ledger_" + todayStr + ".xlsx\nSummary: " + filteredLedger.length + " payment records compiled.");
    }, 1500);
  };

  // Find matching customer details for selected record
  const selectedMemberDetails = useMemo(() => {
    if (!selectedRecord) return null;
    return paluwaganApplications.find(a => a.memberId === selectedRecord.memberId || a.fullName === selectedRecord.memberName);
  }, [selectedRecord, paluwaganApplications]);

  // Find matching order package
  const selectedOrderDetails = useMemo(() => {
    if (!selectedRecord) return null;
    return orders.find(o => o.id === selectedRecord.orderId);
  }, [selectedRecord, orders]);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">Collection Ledger</h1>
          <p className="text-xs text-slate-500 font-medium">Official master ledger tracking all Paluwagan installment collections and payments.</p>
        </div>

        {/* EXPORT ACTION BUTTONS */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportExcel}
            className="flex items-center gap-1 cursor-pointer font-bold bg-white text-emerald-700 border-emerald-100 hover:bg-emerald-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Excel Export
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPDF}
            className="flex items-center gap-1 cursor-pointer font-bold bg-white text-rose-700 border-rose-100 hover:bg-rose-50"
          >
            <Download className="w-3.5 h-3.5" />
            PDF Export
          </Button>
        </div>
      </div>

      {/* 1. COLLECTION SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="p-4 bg-white border border-slate-200/60 rounded-2xl shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Today's Collections</span>
          <span className="text-sm sm:text-base font-extrabold text-slate-800">₱{summaries.todayColl.toLocaleString()}</span>
        </Card>
        <Card className="p-4 bg-white border border-slate-200/60 rounded-2xl shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Weekly Collections</span>
          <span className="text-sm sm:text-base font-extrabold text-slate-850">₱{summaries.weeklyColl.toLocaleString()}</span>
        </Card>
        <Card className="p-4 bg-white border border-slate-200/60 rounded-2xl shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Collections</span>
          <span className="text-sm sm:text-base font-extrabold text-slate-855">₱{summaries.monthlyColl.toLocaleString()}</span>
        </Card>
        <Card className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">Total Collections</span>
          <span className="text-sm sm:text-base font-extrabold text-emerald-700">₱{summaries.totalColl.toLocaleString()}</span>
        </Card>
        <Card className="p-4 bg-white border border-slate-200/60 rounded-2xl shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Balances</span>
          <span className="text-sm sm:text-base font-extrabold text-slate-850">₱{summaries.outstandingVal.toLocaleString()}</span>
        </Card>
        <Card className="p-4 bg-rose-50/20 border border-rose-100 rounded-2xl shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-rose-700 uppercase tracking-wider block">Overdue Balances</span>
          <span className="text-sm sm:text-base font-extrabold text-rose-600 animate-pulse">₱{summaries.overdueVal.toLocaleString()}</span>
        </Card>
      </div>

      {/* 2. INTERACTIVE PERFORMANCE CHARTS (GORGEOUS SVG/CSS LAYOUTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart A: Daily Collections bar-graphs */}
        <Card className="p-5 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Daily Collection Graph (Last 5 Days)</h4>
          <div className="h-40 flex items-end justify-between gap-2.5 pt-4 text-center">
            {chartData.daily.map((day, idx) => {
              const maxVal = Math.max(...chartData.daily.map(d => d.val)) || 1;
              const heightPct = Math.round((day.val / maxVal) * 85) || 5;

              return (
                <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full group cursor-pointer">
                  <div className="text-[9px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                    ₱{day.val.toLocaleString()}
                  </div>
                  <div
                    className="w-full bg-emerald-500 hover:bg-emerald-700 transition-all rounded-t-lg duration-500 shadow-sm"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[9px] text-slate-400 font-bold block mt-2 font-mono whitespace-nowrap">
                    {day.date}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Chart B: Payment trends methods pie breakdown */}
        <Card className="p-5 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Collection Payment Methods</h4>
          <div className="flex items-center justify-between h-40 pt-2">
            {/* Visual breakdown bars stack */}
            <div className="flex-1 space-y-3 pr-4 text-xs font-semibold text-slate-600">
              {chartData.methods.map((method, idx) => {
                const totalVal = chartData.methods.reduce((s, m) => s + m.val, 0) || 1;
                const pct = Math.round((method.val / totalVal) * 100);
                const colors = ["bg-emerald-500", "bg-[#D4AF37]", "bg-blue-500", "bg-purple-500"];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[10.5px]">
                      <span>{method.name}</span>
                      <span className="font-extrabold text-slate-800">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`${barColor} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Donut representation info overlay */}
            <div className="w-24 h-24 rounded-full border-8 border-slate-100 flex items-center justify-center shrink-0 shadow-inner relative">
              <div className="absolute inset-0 rounded-full border-8 border-emerald-500 border-t-transparent border-r-transparent animate-spin-slow" />
              <div className="text-center">
                <Coins className="w-5 h-5 text-[#D4AF37] mx-auto" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Rates</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Chart C: Batch performance comparison */}
        <Card className="p-5 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Collection by Cohort Batches</h4>
          <div className="space-y-3.5 pt-2">
            {chartData.batches.length === 0 ? (
              <span className="text-xs text-slate-400 italic block py-4 text-center">No batch collections logged yet.</span>
            ) : (
              chartData.batches.map((batch, idx) => {
                const totalVal = chartData.batches.reduce((s, b) => s + b.val, 0) || 1;
                const pct = Math.round((batch.val / totalVal) * 100);

                return (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <span className="font-bold text-[#1B4332] w-24 truncate block">{batch.name}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-3 relative overflow-hidden">
                      <div className="bg-gradient-to-r from-[#2D6A4F] to-[#D4AF37] h-3 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-extrabold text-slate-800 font-mono w-16 text-right">₱{batch.val.toLocaleString()}</span>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <Card className="p-4 bg-white border border-slate-200/60 rounded-3xl shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Member, ID, Batch, OR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 font-medium"
          />
        </div>
        <div className="space-y-1">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-semibold bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partial Payment">Partial Payment</option>
            <option value="Overdue">Overdue</option>
            <option value="Voided">Voided</option>
          </select>
        </div>
        <div className="space-y-1">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-xl font-semibold bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          />
        </div>
        <div className="space-y-1">
          <select
            value={collectorFilter}
            onChange={(e) => setCollectorFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-semibold bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            {collectorsList.map((c, i) => (
              <option key={i} value={c}>{c === "All" ? "All Collectors" : c}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* MASTER LEDGER LISTS */}
      <Card className="overflow-hidden border border-slate-200/60 rounded-3xl bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px]">Receipt OR</TableHead>
              <TableHead className="text-[10px]">Payment Date</TableHead>
              <TableHead className="text-[10px]">Member ID</TableHead>
              <TableHead className="text-[10px]">Member Name</TableHead>
              <TableHead className="text-[10px]">Batch</TableHead>
              <TableHead className="text-[10px]">Order No</TableHead>
              <TableHead className="text-[10px]">Installment</TableHead>
              <TableHead className="text-[10px] text-right">Amount Paid</TableHead>
              <TableHead className="text-[10px] text-right">Outstanding Bal</TableHead>
              <TableHead className="text-[10px]">Method</TableHead>
              <TableHead className="text-[10px]">Status</TableHead>
              <TableHead className="text-[10px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLedger.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8 text-xs text-slate-400 font-medium">
                  No payment collections records matched the filter terms.
                </TableCell>
              </TableRow>
            ) : (
              filteredLedger.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs font-bold text-slate-800">{row.receiptNumber}</TableCell>
                  <TableCell className="text-xs font-semibold text-slate-550 font-mono">{row.paymentDate}</TableCell>
                  <TableCell className="text-xs font-mono text-slate-600">{row.memberId}</TableCell>
                  <TableCell className="font-extrabold text-slate-800 text-xs">{row.memberName}</TableCell>
                  <TableCell className="text-xs font-bold text-[#1B4332]">{row.batchName}</TableCell>
                  <TableCell className="text-xs font-mono text-slate-550 font-bold">{row.orderId}</TableCell>
                  <TableCell className="text-xs font-semibold text-slate-500 text-center">
                    {row.installmentNumber === 0 ? (
                      <span className="text-blue-600 font-bold text-[10.5px]">Downpayment</span>
                    ) : (
                      `Inst #${row.installmentNumber}`
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs font-extrabold text-slate-800 font-mono">
                    ₱{row.amountPaid.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-xs font-extrabold text-slate-800 font-mono bg-slate-50/50">
                    ₱{row.remainingBalanceAfter.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-650">{row.paymentMethod}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase border ${
                      row.status === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      row.status === "Partial Payment" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      row.status === "Voided" ? "bg-slate-100 text-slate-500 border-slate-200 line-through" :
                      "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {row.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenDetails(row)}
                      className="cursor-pointer font-bold text-[10px]"
                    >
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* 3. PALUWAGAN AUDIT LOGS DISPLAY PANEL */}
      <Card className="p-5 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-slate-850 uppercase tracking-widest flex items-center gap-1.5">
          <History className="w-4 h-4 text-emerald-600" />
          Paluwagan Audit Trail Ledger Logs
        </h4>
        <div className="space-y-3.5 max-h-52 overflow-y-auto pr-2">
          {paluwaganAuditLogs.length === 0 ? (
            <span className="text-xs text-slate-400 italic block py-4 text-center">No payment log audit trails registered yet.</span>
          ) : (
            paluwaganAuditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50/60 border border-slate-100 rounded-xl space-y-1.5 text-xs text-slate-650 leading-relaxed font-semibold">
                <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-100/60 pb-1">
                  <div className="flex items-center gap-1">
                    <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-extrabold uppercase font-mono">{log.action}</span>
                    <span className="font-bold text-slate-700 font-mono">ID: {log.id}</span>
                  </div>
                  <div className="font-mono">{new Date(log.timestamp).toLocaleString()} | Admin: {log.adminEmail}</div>
                </div>
                <p className="font-medium text-slate-750">Details: "{log.details}"</p>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* 4. PAYMENT RECORD DETAILS MODAL */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Official Paluwagan Collection Record Details"
        size="lg"
      >
        {selectedRecord && (
          <div className="space-y-6 text-xs text-slate-700 font-sans">
            {/* Header OR Code */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Receipt Number</span>
                <span className="text-sm font-mono font-extrabold text-slate-800">{selectedRecord.receiptNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Payment Date</span>
                <span className="font-extrabold text-slate-800 font-mono">{selectedRecord.paymentDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Member profile */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-850 uppercase tracking-widest text-[9.5px] border-l-2 border-emerald-500 pl-2">Member Information</h4>
                <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl space-y-2 leading-relaxed font-semibold text-slate-650">
                  <div>
                    <span className="text-slate-400 block text-[9.5px]">Member ID</span>
                    <span className="font-extrabold text-slate-800 font-mono">{selectedRecord.memberId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9.5px]">Full Name</span>
                    <span className="font-extrabold text-slate-800">{selectedRecord.memberName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9.5px]">Contact Phone</span>
                    <span className="font-bold text-slate-700 font-mono">{selectedMemberDetails?.mobileNumber || "0946-xxx-xxxx"}</span>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-850 uppercase tracking-widest text-[9.5px] border-l-2 border-emerald-500 pl-2">Order Information</h4>
                <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl space-y-2 leading-relaxed font-semibold text-slate-650">
                  <div>
                    <span className="text-slate-400 block text-[9.5px]">Order Number</span>
                    <span className="font-extrabold text-slate-800 font-mono">{selectedRecord.orderId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9.5px]">Lechon Package</span>
                    <span className="font-bold text-slate-750">
                      {selectedOrderDetails ? `${selectedOrderDetails.product} (Qty: ${selectedOrderDetails.quantity})` : "Crispylicious Lechon"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9.5px]">Total Contract Amount</span>
                    <span className="font-extrabold text-slate-850">
                      ₱{selectedOrderDetails ? selectedOrderDetails.totalAmount.toLocaleString() : "10,000"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-850 uppercase tracking-widest text-[9.5px] border-l-2 border-emerald-500 pl-2">Payment Details</h4>
                <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl space-y-2 leading-relaxed font-semibold text-slate-650">
                  <div>
                    <span className="text-slate-400 block text-[9.5px]">Installment Log Number</span>
                    <span className="font-extrabold text-[#1B4332]">
                      {selectedRecord.installmentNumber === 0 ? "Downpayment (25%)" : `Installment #${selectedRecord.installmentNumber}`}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[9.5px]">Amount Due</span>
                      <span className="font-bold text-slate-750 block">₱{selectedRecord.amountDue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9.5px]">Amount Paid</span>
                      <span className="font-extrabold text-emerald-650 block">₱{selectedRecord.amountPaid.toLocaleString()}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9.5px]">Remaining Balance After</span>
                    <span className="font-extrabold text-rose-650">₱{selectedRecord.remainingBalanceAfter.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[9.5px]">Payment Method</span>
                      <span className="font-bold text-slate-750 block">{selectedRecord.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9.5px]">Collector</span>
                      <span className="font-bold text-slate-750 block">{selectedRecord.collector}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks field */}
            {selectedRecord.remarks && (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1 font-semibold text-slate-600">
                <span className="text-[9.5px] text-slate-400 block uppercase tracking-wider">Transaction Remarks / Audit Logs:</span>
                <p className="font-medium text-slate-700 leading-normal">"{selectedRecord.remarks}"</p>
              </div>
            )}

            {/* ACTION FOOTER */}
            {selectedRecord.status !== "Voided" && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  variant="secondary"
                  className="font-bold text-rose-600 border-rose-100 hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
                  onClick={handleVoidPayment}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Void Payment
                </Button>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setIsDetailsOpen(false)}>
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    className="font-bold cursor-pointer flex items-center gap-1 bg-[#1B4332] text-white hover:bg-emerald-800"
                    onClick={handleOpenEdit}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Correct Details
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 5. CORRECT DETAILS MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Correct Payment Transaction Details"
      >
        {selectedRecord && (
          <div className="space-y-4 text-xs text-slate-700 font-sans">
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-slate-600 leading-relaxed font-semibold flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
              <span>
                **Audit Warning:** Correcting this payment transaction will update the ledger and recalculate customer balances automatically. All changes are logged in the master audit trail.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Amount Paid (₱)</label>
                <input
                  type="number"
                  required
                  value={editForm.amountPaid}
                  onChange={(e) => setEditForm({ ...editForm, amountPaid: Number(e.target.value) || 0 })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Payment Date</label>
                <input
                  type="date"
                  required
                  value={editForm.paymentDate}
                  onChange={(e) => setEditForm({ ...editForm, paymentDate: e.target.value })}
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Payment Method</label>
                <select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-semibold bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="GCash">GCash</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Collector</label>
                <input
                  type="text"
                  required
                  value={editForm.collector}
                  onChange={(e) => setEditForm({ ...editForm, collector: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Correction Remarks / Audit Note</label>
              <textarea
                rows={3}
                required
                value={editForm.remarks}
                onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                placeholder="e.g. Corrected GCash amount typo from 1000 to 1875. Verified Reference Code: GCSH-129038."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" disabled={!editForm.remarks} onClick={handleConfirmEdit} className="font-bold cursor-pointer bg-emerald-600 text-white hover:bg-emerald-800">
                Confirm Correction
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

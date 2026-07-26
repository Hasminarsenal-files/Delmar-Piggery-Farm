"use client";

import React, { useState, useMemo } from "react";
import { useRole, Order, PaluwaganBatch, PaluwaganScheduleItem } from "@/context/RoleContext";
import { generateFixedBatchSchedule, calculateBatchEndDate, calculateMemberPaluwaganMetrics } from "@/utils/paluwaganScheduler";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { 
  PiggyBank, 
  Plus, 
  Search, 
  Calendar, 
  MapPin, 
  Coins, 
  ShieldCheck, 
  AlertCircle, 
  Mail, 
  Download, 
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  User,
  Activity,
  CheckCircle2,
  Clock,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PaluwaganManagementPage() {
  const { 
    orders, 
    paluwaganBatches, 
    addPaluwaganBatch, 
    updatePaluwaganBatch,
    recordPaluwaganPayment,
    addNotification
  } = useRole();

  // Search/Filters states
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selection states
  const [selectedBatch, setSelectedBatch] = useState<PaluwaganBatch | null>(null);
  const [selectedMemberOrder, setSelectedMemberOrder] = useState<Order | null>(null);

  // Modals
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isRecordPayOpen, setIsRecordPayOpen] = useState(false);
  const [isEmailSimOpen, setIsEmailSimOpen] = useState(false);
  
  const [successMsg, setSuccessMsg] = useState("");

  // Add Batch Form (Requirements #2 & #3 & #11)
  const [newBatchForm, setNewBatchForm] = useState<{
    name: string;
    startDate: string;
    durationMonths: 8 | 12;
    endDate: string;
  }>({
    name: "",
    startDate: "2026-07-15",
    durationMonths: 8,
    endDate: "2027-02-28"
  });

  // Add Member to Batch Form
  const [selectedOrderToLink, setSelectedOrderToLink] = useState("");

  // Record Payment Form
  const [selectedSchedInstallment, setSelectedSchedInstallment] = useState<PaluwaganScheduleItem | null>(null);
  const [payForm, setPayForm] = useState({
    amountPaid: 0,
    collector: "Elena Delmar",
    receiptNumber: "",
    remarks: "Regular installment payment"
  });

  // Email Template Form
  const [selectedRemindSched, setSelectedRemindSched] = useState<PaluwaganScheduleItem | null>(null);

  // Active Paluwagan orders (members)
  const paluwaganOrders = useMemo(() => {
    return orders.filter(o => o.orderType === "Paluwagan");
  }, [orders]);

  // Compute stats for batches (Requirement #10)
  const batchStats = useMemo(() => {
    return paluwaganBatches.map(batch => {
      const batchMembers = paluwaganOrders.filter(o => o.batchId === batch.id);
      const totalExpected = batchMembers.reduce((sum, o) => sum + o.totalAmount, 0);
      const totalCollected = batchMembers.reduce((sum, o) => {
        const schedPaid = o.paluwaganSchedule?.reduce((s, i) => s + i.amountPaid, 0) || 0;
        return sum + (o.downPayment || 0) + schedPaid;
      }, 0);
      const outstanding = Math.max(0, totalExpected - totalCollected);

      let overdueAmount = 0;
      let overdueMembersCount = 0;

      batchMembers.forEach(m => {
        const metrics = calculateMemberPaluwaganMetrics(
          m.paluwaganSchedule || [],
          m.totalAmount,
          m.downPayment || Math.round(m.totalAmount * 0.25)
        );
        overdueAmount += metrics.overdueBalance;
        if (metrics.overdueCount > 0) {
          overdueMembersCount++;
        }
      });

      return {
        ...batch,
        durationMonths: batch.durationMonths || 8,
        endDate: batch.endDate || calculateBatchEndDate(batch.startDate, batch.durationMonths || 8),
        memberCount: batchMembers.length,
        totalExpected,
        totalCollected,
        outstanding,
        overdueAmount,
        overdueMembersCount
      };
    });
  }, [paluwaganBatches, paluwaganOrders]);

  // Global Paluwagan Metrics
  const globalReports = useMemo(() => {
    const totalMembers = paluwaganOrders.length;
    const activeBatchesCount = paluwaganBatches.filter(b => b.status === "Active").length;
    
    let totalExpectedSum = paluwaganOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    let totalCollectedSum = paluwaganOrders.reduce((sum, o) => {
      const schedPaid = o.paluwaganSchedule?.reduce((s, i) => s + i.amountPaid, 0) || 0;
      return sum + (o.downPayment || 0) + schedPaid;
    }, 0);

    const outstandingBalancesSum = Math.max(0, totalExpectedSum - totalCollectedSum);
    const fullyPaidMembersCount = paluwaganOrders.filter(o => o.remainingBalance === 0).length;
    const overdueMembersCount = paluwaganOrders.filter(o => 
      o.paluwaganSchedule?.some(item => item.status === "OVERDUE")
    ).length;

    return {
      totalMembers,
      activeBatchesCount,
      totalCollections: totalCollectedSum,
      outstandingBalances: outstandingBalancesSum,
      fullyPaidMembersCount,
      overdueMembersCount
    };
  }, [paluwaganOrders, paluwaganBatches]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return paluwaganOrders.filter(o => {
      const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            o.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBatch = batchFilter === "All" || o.batchId === batchFilter;
      
      const hasOverdue = o.paluwaganSchedule?.some(item => item.status === "OVERDUE");
      const isPaid = o.remainingBalance === 0;

      let matchesStatus = true;
      if (statusFilter === "Overdue") matchesStatus = !!hasOverdue;
      else if (statusFilter === "Fully Paid") matchesStatus = isPaid;
      else if (statusFilter === "Paying") matchesStatus = !isPaid && !hasOverdue;

      return matchesSearch && matchesBatch && matchesStatus;
    });
  }, [paluwaganOrders, searchTerm, batchFilter, statusFilter]);

  // Orders eligible to be linked to currently active batch
  const unlinkedPaluwaganOrders = useMemo(() => {
    return paluwaganOrders.filter(o => !o.batchId && o.status !== "Cancelled");
  }, [paluwaganOrders]);

  // Handlers
  const handleAddBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchForm.name || !newBatchForm.startDate) return;
    const computedEnd = calculateBatchEndDate(newBatchForm.startDate, newBatchForm.durationMonths);

    const ok = await addPaluwaganBatch({
      name: newBatchForm.name,
      startDate: newBatchForm.startDate,
      durationMonths: newBatchForm.durationMonths,
      endDate: computedEnd
    });

    if (ok) {
      setSuccessMsg("Paluwagan batch cohort added successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        setIsAddBatchOpen(false);
        setNewBatchForm({ name: "", startDate: "2026-07-15", durationMonths: 8, endDate: "2027-02-28" });
      }, 1500);
    }
  };

  const handleLinkMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch || !selectedOrderToLink) return;

    const orderToLink = orders.find(o => o.id === selectedOrderToLink);
    if (!orderToLink) return;

    const orderIndex = orders.findIndex(o => o.id === selectedOrderToLink);
    if (orderIndex !== -1) {
      const bStart = selectedBatch.startDate;
      const bDuration = selectedBatch.durationMonths || 8;
      const down = orderToLink.downPayment || Math.round(orderToLink.totalAmount * 0.25);
      const generated = generateFixedBatchSchedule(bStart, bDuration, orderToLink.totalAmount, down);

      orders[orderIndex] = {
        ...orderToLink,
        batchId: selectedBatch.id,
        status: "Approved",
        downPayment: down,
        paluwaganSchedule: generated,
        remainingBalance: Math.max(0, orderToLink.totalAmount - down),
        nextDueDate: generated.find(i => i.status === "UPCOMING" || i.status === "DUE" || i.status === "OVERDUE")?.dueDate
      };
    }

    // Sync UI selection
    const updatedOrder = orders.find(o => o.id === selectedOrderToLink);
    if (updatedOrder) {
      setSelectedMemberOrder(updatedOrder);
    }

    setSuccessMsg("Member linked to batch and payment schedule generated!");
    setTimeout(() => {
      setSuccessMsg("");
      setIsAddMemberOpen(false);
      setSelectedOrderToLink("");
    }, 1500);
  };

  const handleOpenRecordPay = (installment: PaluwaganScheduleItem) => {
    setSelectedSchedInstallment(installment);
    setPayForm({
      amountPaid: installment.amountDue,
      collector: "Elena Delmar",
      receiptNumber: `REC-${Math.floor(60000 + Math.random() * 9999)}`,
      remarks: `Installment #${installment.installmentNumber} payment`
    });
    setIsRecordPayOpen(true);
  };

  const handleRecordPaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberOrder || !selectedSchedInstallment) return;

    const ok = await recordPaluwaganPayment(
      selectedMemberOrder.id,
      selectedSchedInstallment.installmentNumber,
      {
        paymentDate: new Date().toISOString().split("T")[0],
        amountPaid: Number(payForm.amountPaid),
        collector: payForm.collector,
        receiptNumber: payForm.receiptNumber,
        remarks: payForm.remarks
      }
    );

    if (ok) {
      setSuccessMsg("Payment recorded and ledger updated!");
      // Update selected order details on screen
      const freshOrder = orders.find(o => o.id === selectedMemberOrder.id);
      if (freshOrder) {
        setSelectedMemberOrder(freshOrder);
      }

      setTimeout(() => {
        setSuccessMsg("");
        setIsRecordPayOpen(false);
      }, 1500);
    }
  };

  const handleOpenEmailSim = (installment: PaluwaganScheduleItem) => {
    setSelectedRemindSched(installment);
    setIsEmailSimOpen(true);
  };

  const handleSendReminderManual = () => {
    if (!selectedMemberOrder || !selectedRemindSched) return;
    
    addNotification({
      title: "Manual Email Reminder Sent",
      message: `Simulated notification sent to ${selectedMemberOrder.customerName} for payment due on ${selectedRemindSched.dueDate}.`,
      type: "system"
    });

    setSuccessMsg("Reminder email dispatched!");
    setTimeout(() => {
      setSuccessMsg("");
      setIsEmailSimOpen(false);
    }, 1500);
  };

  const exportPaluwaganExcel = () => {
    const headers = ["Member Name", "Batch", "Product", "Total Amount", "Down Payment", "Paid To Date", "Outstanding Balance", "Next Due Date", "Payment Status"];
    const rows = paluwaganOrders.map(o => {
      const batchName = paluwaganBatches.find(b => b.id === o.batchId)?.name || "Unlinked";
      const totalPaid = o.totalAmount - (o.remainingBalance || 0);
      const hasOverdue = o.paluwaganSchedule?.some(i => i.status === "OVERDUE");
      const status = o.remainingBalance === 0 ? "Fully Paid" : hasOverdue ? "Overdue" : "Paying";
      
      return [
        o.customerName,
        batchName,
        o.product,
        o.totalAmount,
        o.downPayment || 0,
        totalPaid,
        o.remainingBalance || 0,
        o.nextDueDate || "Fully Paid",
        status
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
    link.setAttribute("download", `Paluwagan_Batches_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPDFPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 font-sans pb-12 print:p-0 print:space-y-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden print:bg-none print:text-slate-900 print:shadow-none print:border-b print:border-slate-300 print:p-0">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none print:hidden" />
        <div className="space-y-1.5 z-10">
          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/5 print:hidden">
            Savorlicious Food Services
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white print:text-slate-900 flex items-center gap-2">
            <PiggyBank className="w-6 h-6 text-emerald-400 print:text-slate-700" />
            Paluwagan Installment System
          </h1>
          <p className="text-xs text-emerald-100/80 font-medium print:text-slate-600">Organize customer payments into cohorts, auto-generate 15-day schedules, record receipts, and dispatch email reminders.</p>
        </div>
        
        <div className="flex items-center gap-2 z-10 print:hidden">
          <Button 
            onClick={triggerPDFPrint}
            variant="outline"
            className="border-white/20 hover:bg-white/10 text-white font-bold py-2 px-3 text-xs"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print PDF
          </Button>
          <Button 
            onClick={exportPaluwaganExcel}
            className="bg-emerald-800 hover:bg-emerald-900 text-white border-none font-bold py-2 px-3 text-xs"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={() => setIsAddBatchOpen(true)}
            className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-900 border-none font-bold py-2 px-3 text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Batch
          </Button>
        </div>
      </div>

      {/* Reports Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 print:grid-cols-3 print:gap-2">
        <Card className="p-3.5 rounded-2xl border border-slate-150 shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Members</span>
          <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-1">{globalReports.totalMembers} Members</div>
        </Card>
        <Card className="p-3.5 rounded-2xl border border-slate-150 shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active Batches</span>
          <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-1">{globalReports.activeBatchesCount} Cohorts</div>
        </Card>
        <Card className="p-3.5 rounded-2xl border border-slate-150 shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Collections</span>
          <div className="text-lg font-extrabold text-emerald-600 mt-1">₱{globalReports.totalCollections.toLocaleString()}</div>
        </Card>
        <Card className="p-3.5 rounded-2xl border border-slate-150 shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Due</span>
          <div className="text-lg font-extrabold text-red-500 mt-1">₱{globalReports.outstandingBalances.toLocaleString()}</div>
        </Card>
        <Card className="p-3.5 rounded-2xl border border-slate-150 shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Fully Paid Accounts</span>
          <div className="text-lg font-extrabold text-emerald-600 mt-1">{globalReports.fullyPaidMembersCount} Paid</div>
        </Card>
        <Card className="p-3.5 rounded-2xl border border-slate-150 shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Overdue Accounts</span>
          <div className="text-lg font-extrabold text-red-600 mt-1">{globalReports.overdueMembersCount} Overdue</div>
        </Card>
      </div>

      {/* Batch Overview Slider / Grid */}
      <div className="space-y-3.5 print:break-after-page">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#1B4332] flex items-center gap-1.5">
          <Activity className="w-4 h-4" />
          Active Paluwagan Cohort Batches
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {batchStats.map((batch) => {
            const progress = batch.totalExpected > 0 ? Math.round((batch.totalCollected / batch.totalExpected) * 100) : 0;
            const isSelected = selectedBatch?.id === batch.id;
            
            return (
              <motion.div 
                whileHover={{ y: -3 }}
                onClick={() => setSelectedBatch(batch)}
                key={batch.id} 
                className={`p-5 rounded-2xl border transition-all cursor-pointer text-xs relative overflow-hidden flex flex-col justify-between space-y-3 ${
                  isSelected 
                    ? "bg-[#1B4332] text-white border-[#1B4332] shadow-md" 
                    : "bg-white dark:bg-[#0f1412] border-slate-150 hover:border-emerald-300 dark:border-[#182620] hover:shadow-sm"
                }`}
              >
                {/* Visual Accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  isSelected ? "bg-[#D4AF37]" : "bg-emerald-600"
                }`} />

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-sm uppercase tracking-wide">{batch.name}</h4>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${
                      isSelected 
                        ? "bg-white/20 text-[#D4AF37]" 
                        : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-450"
                    }`}>
                      {batch.durationMonths} Months ({batch.status})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-450 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Start: {batch.startDate} | End: {batch.endDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100/50 text-[10px]">
                  <div>
                    <span className={isSelected ? "text-white/70" : "text-slate-400 block"}>Total Members:</span>
                    <span className="font-extrabold">{batch.memberCount} Members</span>
                  </div>
                  <div>
                    <span className={isSelected ? "text-white/70" : "text-slate-400 block"}>Expected:</span>
                    <span className="font-extrabold">₱{batch.totalExpected.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className={isSelected ? "text-white/70" : "text-slate-400 block"}>Collected:</span>
                    <span className={`font-extrabold ${isSelected ? "text-emerald-300" : "text-emerald-700"}`}>₱{batch.totalCollected.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className={isSelected ? "text-white/70" : "text-slate-400 block"}>Outstanding:</span>
                    <span className={`font-extrabold ${batch.outstanding > 0 ? (isSelected ? "text-rose-300" : "text-rose-600") : ""}`}>₱{batch.outstanding.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className={isSelected ? "text-white/70" : "text-slate-400 block"}>Overdue Amount:</span>
                    <span className={`font-extrabold ${batch.overdueAmount > 0 ? "text-rose-500 animate-pulse" : ""}`}>₱{batch.overdueAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className={isSelected ? "text-white/70" : "text-slate-400 block"}>Overdue Members:</span>
                    <span className={`font-extrabold ${batch.overdueMembersCount > 0 ? "text-rose-500 font-bold" : ""}`}>{batch.overdueMembersCount} Member(s)</span>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[9px] font-extrabold uppercase">
                    <span className={isSelected ? "text-white/70" : "text-slate-400"}>Collection Coverage</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-emerald-955/20 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600" style={{ width: `${progress}%`, backgroundColor: isSelected ? "#D4AF37" : "#059669" }} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Batch Details */}
      {selectedBatch && (
        <Card className="p-6 rounded-2xl border border-slate-150 space-y-6 print:border-none print:p-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-emerald-950/20">
            <div>
              <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-slate-400">Cohort Details</span>
              <h2 className="text-lg font-extrabold text-[#1B4332] uppercase mt-1">{selectedBatch.name} Member Registry</h2>
            </div>
            
            <div className="flex gap-2 print:hidden">
              <Button 
                onClick={() => setIsAddMemberOpen(true)}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2 px-3 text-xs"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Member to Batch
              </Button>
              <Button 
                variant="light"
                onClick={() => setSelectedBatch(null)}
                className="text-xs"
              >
                Close Cohort View
              </Button>
            </div>
          </div>

          {/* Members Table */}
          {filteredMembers.filter(m => m.batchId === selectedBatch.id).length === 0 ? (
            <div className="p-8 text-center text-slate-450 font-semibold text-xs border border-dashed rounded-2xl">
              No members linked to this batch yet. Assign an order of type "Paluwagan" using "Add Member to Batch".
            </div>
          ) : (
            <div className="overflow-hidden border border-slate-150 rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Menu Product</TableHead>
                    <TableHead>Outstanding Balance</TableHead>
                    <TableHead>Next Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.filter(m => m.batchId === selectedBatch.id).map((member) => {
                    const totalPaid = member.totalAmount - (member.remainingBalance || 0);
                    const progress = Math.round((totalPaid / member.totalAmount) * 100);
                    const hasOverdue = member.paluwaganSchedule?.some(i => i.status === "OVERDUE");
                    const isFullyPaid = member.remainingBalance === 0;

                    return (
                      <TableRow key={member.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-slate-655">{member.id}</TableCell>
                        <TableCell className="font-extrabold text-slate-800 dark:text-slate-100">{member.customerName}</TableCell>
                        <TableCell>
                          <div className="text-xs font-semibold text-slate-700">{member.customerPhone || "—"}</div>
                          <span className="text-[9.5px] text-slate-450 font-bold block">{member.customerEmail}</span>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-800 truncate max-w-[150px]" title={member.product}>
                          {member.product}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-red-500">₱{(member.remainingBalance || 0).toLocaleString()}</TableCell>
                        <TableCell className="font-mono text-xs font-bold text-blue-600">{member.nextDueDate || "Fully Paid"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-lg text-[9.5px] font-extrabold uppercase ${
                            isFullyPaid ? "bg-emerald-50 text-emerald-600" :
                            hasOverdue ? "bg-red-50 text-red-650 animate-pulse border border-red-200" :
                            "bg-amber-50 text-amber-600"
                          }`}>
                            {isFullyPaid ? "Paid" : hasOverdue ? "Overdue" : "Paying"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-1 whitespace-nowrap">
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            onClick={() => setSelectedMemberOrder(member)}
                            className="bg-[#1B4332] text-white py-1"
                          >
                            Member Profile & Schedule
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      )}

      {/* Member Details & Schedule Panel */}
      {selectedMemberOrder && (
        <Card className="p-6 rounded-2xl border border-slate-150 space-y-6 print:border-none print:p-0">
          <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-emerald-950/20">
            <div>
              <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-slate-400">Paluwagan Member Profile</span>
              <h2 className="text-base font-extrabold text-[#1B4332] uppercase mt-1">{selectedMemberOrder.customerName} Payment Specs</h2>
            </div>
            
            <Button 
              variant="light"
              onClick={() => setSelectedMemberOrder(null)}
              className="text-xs print:hidden"
            >
              Close Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Personal Profile & Stats */}
            <div className="space-y-4">
              <div className="bg-slate-50/50 p-4.5 rounded-2xl border border-slate-150/60 space-y-3 text-xs leading-relaxed">
                <h4 className="font-extrabold text-slate-800 uppercase tracking-wide text-[10px]">Contact Profile Details</h4>
                <div className="space-y-1.5 font-semibold text-slate-700">
                  <div><span className="text-slate-400 font-bold block">Account ID:</span> {selectedMemberOrder.id}</div>
                  <div><span className="text-slate-400 font-bold block">Full Name:</span> {selectedMemberOrder.customerName}</div>
                  <div><span className="text-slate-400 font-bold block">Phone Number:</span> {selectedMemberOrder.customerPhone || "—"}</div>
                  <div><span className="text-slate-400 font-bold block">Email Address:</span> {selectedMemberOrder.customerEmail}</div>
                  <div><span className="text-slate-400 font-bold block">Fulfillment Location:</span> {selectedMemberOrder.customerAddress || "Aliaga, Nueva Ecija"}</div>
                  <div><span className="text-slate-400 font-bold block">Menu item package:</span> {selectedMemberOrder.product} ({selectedMemberOrder.quantity} pcs)</div>
                </div>
              </div>

              {/* Progress visualizer */}
              {(() => {
                const totalPaid = selectedMemberOrder.totalAmount - (selectedMemberOrder.remainingBalance || 0);
                const progressPct = Math.round((totalPaid / selectedMemberOrder.totalAmount) * 100);
                
                const numPaymentsMade = selectedMemberOrder.paluwaganSchedule?.filter(i => i.status === "PAID").length || 0;
                const remInstallments = (selectedMemberOrder.paluwaganSchedule?.length || 4) - numPaymentsMade;

                // Last payment details
                const lastPayment = selectedMemberOrder.paluwaganSchedule
                  ?.filter(i => i.status === "PAID")
                  .sort((a, b) => new Date(b.paymentDate || "").getTime() - new Date(a.paymentDate || "").getTime())[0];

                return (
                  <div className="bg-slate-50/50 p-4.5 rounded-2xl border border-slate-150/60 space-y-4 text-xs font-semibold text-slate-700">
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wide text-[10px]">Paluwagan Financial Ledger</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline font-bold text-[10.5px]">
                        <span>Down Payment:</span>
                        <span>₱{selectedMemberOrder.downPayment?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-baseline font-bold text-[10.5px]">
                        <span>Total Paid (incl DP):</span>
                        <span className="text-emerald-700 font-extrabold">₱{totalPaid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-baseline font-bold text-[10.5px]">
                        <span>Remaining Balance:</span>
                        <span className="text-red-500 font-extrabold">₱{(selectedMemberOrder.remainingBalance || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-baseline font-bold text-[10.5px]">
                        <span>Installment Rate:</span>
                        <span>₱{selectedMemberOrder.installmentAmount?.toLocaleString()} / 15 days</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t border-slate-200/50 pt-3">
                      <div className="flex justify-between text-[9px] font-extrabold uppercase">
                        <span>Payment Progress</span>
                        <span>{progressPct}% Paid</span>
                      </div>
                      <div className="font-mono text-emerald-700 font-bold block select-none">
                        {progressPct}% Paid
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t border-slate-200/50 pt-3 text-[10px]">
                      <div>Payments Made: <strong>{numPaymentsMade}</strong> installments</div>
                      <div>Remaining Count: <strong>{remInstallments}</strong> payments</div>
                      <div className="text-blue-600 font-bold">Next Due Date: {selectedMemberOrder.nextDueDate || "Fully Settled"}</div>
                      <div className="text-slate-450">Last Payment: {lastPayment ? `${lastPayment.paymentDate} (₱${lastPayment.amountPaid.toLocaleString()})` : "No payment yet"}</div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Payment Schedule Table */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-extrabold text-[#1B4332] uppercase tracking-wider text-[10.5px] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                15-Day Generated Installments Schedule
              </h4>
              
              <div className="border border-slate-150 rounded-xl overflow-hidden bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No.</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Installment (₱)</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Receipt No.</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedMemberOrder.paluwaganSchedule?.map((installment) => {
                      const isOverdue = installment.status === "OVERDUE";
                      const isPaid = installment.status === "PAID";
                      
                      return (
                        <TableRow key={installment.installmentNumber}>
                          <TableCell className="font-mono text-xs text-slate-500">#{installment.installmentNumber}</TableCell>
                          <TableCell className="font-mono text-xs font-bold text-slate-700">{installment.dueDate}</TableCell>
                          <TableCell className="font-mono text-xs font-bold text-slate-800">₱{installment.amountDue.toLocaleString()}</TableCell>
                          <TableCell className="font-mono text-xs text-slate-500">{installment.paymentDate || "—"}</TableCell>
                          <TableCell className="font-mono text-xs font-bold text-slate-600">{installment.receiptNumber || "—"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${
                              isPaid ? "bg-emerald-50 text-emerald-600" :
                              isOverdue ? "bg-red-50 text-red-650 border border-red-150 animate-pulse" :
                              "bg-amber-50 text-amber-600"
                            }`}>
                              {installment.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right space-x-1.5 whitespace-nowrap">
                            {!isPaid && (
                              <Button 
                                size="sm" 
                                variant="secondary" 
                                onClick={() => handleOpenRecordPay(installment)}
                                className="bg-emerald-700 text-white font-bold py-1 text-[10px]"
                              >
                                Record Pay
                              </Button>
                            )}
                            
                            {!isPaid && (
                              <Button 
                                size="sm" 
                                variant="light" 
                                onClick={() => handleOpenEmailSim(installment)}
                                className="text-[10px] text-blue-600 hover:text-blue-700"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </Button>
                            )}

                            {isPaid && (
                              <span className="text-[9.5px] text-slate-400 font-bold font-mono">Cleared by {installment.collector}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

          </div>
        </Card>
      )}

      {/* Unlinked members / Search filters section */}
      <div className="space-y-4 print:hidden">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#1B4332] flex items-center gap-1.5">
            <Search className="w-4 h-4" />
            Global Search & Filtering Toolbar
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0f1412] p-4 border border-slate-150 dark:border-[#182620] rounded-2xl shadow-2xs">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search member name or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 dark:border-emerald-950 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-slate-50 dark:bg-[#070a09] font-medium"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="px-2 py-1.5 border border-slate-200 dark:border-emerald-950 rounded-xl text-[10.5px] font-extrabold focus:outline-hidden"
            >
              <option value="All">All Batches</option>
              {paluwaganBatches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1.5 border border-slate-200 dark:border-emerald-950 rounded-xl text-[10.5px] font-extrabold focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Overdue">Overdue Accounts</option>
              <option value="Fully Paid">Fully Paid Accounts</option>
              <option value="Paying">Paying / On Track</option>
            </select>
          </div>
        </div>

        {/* Global Filtered List */}
        <Card className="p-0 overflow-hidden border border-slate-150">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member ID</TableHead>
                <TableHead>Cohort Batch</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Menu Product Item</TableHead>
                <TableHead>Remaining Balance</TableHead>
                <TableHead>Next Payment Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((o) => {
                const batchName = paluwaganBatches.find(b => b.id === o.batchId)?.name || "Unlinked";
                const hasOverdue = o.paluwaganSchedule?.some(i => i.status === "OVERDUE");
                const isFullyPaid = o.remainingBalance === 0;

                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-655">{o.id}</TableCell>
                    <TableCell className="font-bold text-xs text-[#1B4332]">
                      <span className={o.batchId ? "" : "text-slate-400 font-semibold"}>
                        {batchName}
                      </span>
                    </TableCell>
                    <TableCell className="font-extrabold text-slate-800 dark:text-slate-100">{o.customerName}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800 truncate max-w-[160px]">{o.product}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-red-500">₱{(o.remainingBalance || 0).toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-blue-600">{o.nextDueDate || "Fully Paid"}</TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9.5px] font-extrabold uppercase ${
                        isFullyPaid ? "bg-emerald-50 text-emerald-600" :
                        hasOverdue ? "bg-red-50 text-red-650 border border-red-150 animate-pulse" :
                        "bg-amber-50 text-amber-600"
                      }`}>
                        {isFullyPaid ? "Paid" : hasOverdue ? "Overdue" : "Paying"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => {
                          setSelectedBatch(paluwaganBatches.find(b => b.id === o.batchId) || null);
                          setSelectedMemberOrder(o);
                        }}
                        className="bg-emerald-700 text-white font-bold py-1 text-[10.5px]"
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Add Batch Modal */}
      <Modal isOpen={isAddBatchOpen} onClose={() => setIsAddBatchOpen(false)} title="Create Paluwagan Program Cohort">
        <form onSubmit={handleAddBatchSubmit} className="space-y-4 py-2 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-600">Paluwagan Batch Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Batch 5 - Lechon Christmas Program"
              value={newBatchForm.name}
              onChange={(e) => setNewBatchForm({ ...newBatchForm, name: e.target.value })}
              className="w-full p-2 border border-slate-205 rounded-xl font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600 uppercase text-[10px]">Batch Duration</label>
              <select
                value={newBatchForm.durationMonths}
                onChange={(e) => {
                  const dur = Number(e.target.value) as 8 | 12;
                  const computedEnd = calculateBatchEndDate(newBatchForm.startDate, dur);
                  setNewBatchForm({ ...newBatchForm, durationMonths: dur, endDate: computedEnd });
                }}
                className="w-full p-2 border border-slate-205 rounded-xl font-bold text-xs"
              >
                <option value={8}>8 Months (16 Installments)</option>
                <option value={12}>12 Months (24 Installments)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600 uppercase text-[10px]">Batch Start Date</label>
              <input
                type="date"
                required
                value={newBatchForm.startDate}
                onChange={(e) => {
                  const start = e.target.value;
                  const computedEnd = calculateBatchEndDate(start, newBatchForm.durationMonths);
                  setNewBatchForm({ ...newBatchForm, startDate: start, endDate: computedEnd });
                }}
                className="w-full p-2 border border-slate-205 rounded-xl font-bold text-emerald-700 text-xs"
              />
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <div className="font-bold text-slate-700">Batch Target End Date (Calculated):</div>
            <div className="font-mono font-extrabold text-emerald-800">{newBatchForm.endDate || calculateBatchEndDate(newBatchForm.startDate, newBatchForm.durationMonths)}</div>
            <div className="text-[10px] text-slate-500">Fixed payment dates will be automatically generated on the 15th and 30th of each month.</div>
          </div>

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="light" onClick={() => setIsAddBatchOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1B4332] text-white">
              Create Program Batch
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Member to Batch Modal */}
      <Modal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} title={`Assign Member to ${selectedBatch?.name}`}>
        <form onSubmit={handleLinkMemberSubmit} className="space-y-4 py-2 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-600">Select Unlinked Paluwagan Order</label>
            {unlinkedPaluwaganOrders.length === 0 ? (
              <p className="p-3 bg-slate-50 border rounded-xl text-slate-400 font-semibold">
                No unlinked Paluwagan orders in Savorlicious ledger. Place a Paluwagan order in Orders module first.
              </p>
            ) : (
              <select
                value={selectedOrderToLink}
                onChange={(e) => setSelectedOrderToLink(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold text-[#1B4332]"
                required
              >
                <option value="">-- Choose Order Account --</option>
                {unlinkedPaluwaganOrders.map(o => (
                  <option key={o.id} value={o.id}>{o.customerName} — {o.product} (₱{o.totalAmount.toLocaleString()})</option>
                ))}
              </select>
            )}
          </div>

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="light" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1B4332] text-white" disabled={unlinkedPaluwaganOrders.length === 0}>
              Link Cohort Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal isOpen={isRecordPayOpen} onClose={() => setIsRecordPayOpen(false)} title="Record Scheduled Installment Collection">
        <form onSubmit={handleRecordPaySubmit} className="space-y-4 py-2 text-xs">
          {selectedMemberOrder && selectedSchedInstallment && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-1 font-semibold text-slate-700">
              <div>Account: <strong>{selectedMemberOrder.customerName}</strong></div>
              <div>Installment Number: <strong>#{selectedSchedInstallment.installmentNumber}</strong></div>
              <div>Expected Installment Date: <strong>{selectedSchedInstallment.dueDate}</strong></div>
              <div>Standard Installment Due: <strong>₱{selectedSchedInstallment.amountDue.toLocaleString()}</strong></div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Amount Collected (₱)</label>
              <input
                type="number"
                value={payForm.amountPaid}
                onChange={(e) => setPayForm({ ...payForm, amountPaid: Number(e.target.value) })}
                className="w-full p-2 border border-slate-205 rounded-xl font-bold text-emerald-700"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Collector</label>
              <input
                type="text"
                value={payForm.collector}
                onChange={(e) => setPayForm({ ...payForm, collector: e.target.value })}
                className="w-full p-2 border border-slate-205 rounded-xl font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Official Receipt (OR) / Receipt No.</label>
              <input
                type="text"
                value={payForm.receiptNumber}
                onChange={(e) => setPayForm({ ...payForm, receiptNumber: e.target.value })}
                className="w-full p-2 border border-slate-250 rounded-xl font-mono font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Internal Remarks</label>
              <input
                type="text"
                value={payForm.remarks}
                onChange={(e) => setPayForm({ ...payForm, remarks: e.target.value })}
                className="w-full p-2 border border-slate-205 rounded-xl font-semibold"
              />
            </div>
          </div>

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="light" onClick={() => setIsRecordPayOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1B4332] text-white">
              Log Collection Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Simulated Email Reminder Modal */}
      <Modal isOpen={isEmailSimOpen} onClose={() => setIsEmailSimOpen(false)} title="Paluwagan Email Dispatch Draft">
        {selectedMemberOrder && selectedRemindSched && (
          <div className="space-y-4 py-2 text-xs">
            <div className="bg-slate-50 border rounded-xl p-4 font-mono leading-relaxed space-y-3.5 text-slate-800">
              <div><strong>Subject:</strong> Paluwagan Payment Reminder</div>
              <div className="h-px bg-slate-200" />
              <div>Hello {selectedMemberOrder.customerName},</div>
              <div>This is a friendly reminder that your next Paluwagan payment is due in 2 days.</div>
              <div>
                <div><strong>Due Date:</strong> {selectedRemindSched.dueDate}</div>
                <div><strong>Amount Due:</strong> ₱{selectedRemindSched.amountDue.toLocaleString()}</div>
                <div><strong>Remaining Balance:</strong> ₱{(selectedMemberOrder.remainingBalance || 0).toLocaleString()}</div>
              </div>
              <div>Thank you for your continued payments.</div>
              <div>
                <div>Regards,</div>
                <div>Savorlicious Food Services</div>
              </div>
            </div>

            {successMsg && (
              <div className="p-2 bg-emerald-50 text-emerald-600 text-center font-bold rounded-xl">
                {successMsg}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="light" onClick={() => setIsEmailSimOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendReminderManual} className="bg-blue-600 text-white font-bold flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                Dispatch Email Now
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

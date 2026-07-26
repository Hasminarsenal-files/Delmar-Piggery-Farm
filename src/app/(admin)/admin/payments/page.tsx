"use client";

import React, { useState, useMemo } from "react";
import { useRole, MemberPayment, Member } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  UserCheck, 
  Coins, 
  Calendar, 
  User, 
  CheckCircle,
  FileText,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminPaymentsPage() {
  const { 
    memberPayments, 
    members, 
    batches, 
    recordMemberPayment,
    userName 
  } = useRole();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("All");
  const [selectedMethod, setSelectedMethod] = useState("All");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "receipt">("date-desc");

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<MemberPayment | null>(null);

  // Form State
  const [memberId, setMemberId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("GCash");
  const [amountPaid, setAmountPaid] = useState("");
  const [remarks, setRemarks] = useState("");
  const [collector, setCollector] = useState(userName || "Elena Delmar");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto set collector name when username changes
  React.useEffect(() => {
    if (userName && userName !== "Visitor") {
      setCollector(userName);
    }
  }, [userName]);

  // Derived: select member object for recording
  const activeRecordMember = useMemo(() => {
    return members.find(m => m.id === memberId);
  }, [members, memberId]);

  // Derived: compute member's financial state before/after this payment
  const getMemberBalanceDetails = (member: Member, upToPaymentId?: string) => {
    // Expected total
    const expected = member.totalDue;
    
    // Payments made
    let paymentsQuery = memberPayments.filter(p => p.memberId === member.id);
    if (upToPaymentId) {
      // Find the index of the payment to calculate the balance *at that moment*
      const paymentIndex = paymentsQuery.findIndex(p => p.id === upToPaymentId);
      if (paymentIndex !== -1) {
        paymentsQuery = paymentsQuery.slice(paymentIndex); // Since newest is first
      }
    }
    
    const paid = paymentsQuery.reduce((sum, p) => sum + p.amountPaid, 0);
    const balance = expected - paid;
    return { expected, paid, balance };
  };

  // Filtered payments list
  const filteredPayments = useMemo(() => {
    return memberPayments.filter(p => {
      const member = members.find(m => m.id === p.memberId);
      const memberName = member ? member.fullName : "Unknown Member";
      const memberCode = member ? member.memberId : "";
      const batch = batches.find(b => b.id === p.batchId);
      const batchName = batch ? batch.name : "No Batch";

      // Calculate balance details
      const balDetails = member ? getMemberBalanceDetails(member) : { expected: 5000, paid: 0, balance: 5000 };
      let paymentStatus = "Unpaid";
      if (balDetails.balance <= 0) {
        paymentStatus = "Paid";
      } else if (balDetails.paid > 0) {
        paymentStatus = "Partially Paid";
      }

      // Search matching receipt number, name, ID, batch, contact, or status
      const matchesSearch = 
        p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member && member.contactNumber.includes(searchTerm)) ||
        paymentStatus.toLowerCase().includes(searchTerm.toLowerCase());

      // Filters
      const matchesBatch = selectedBatchId === "All" || p.batchId === selectedBatchId;
      const matchesMethod = selectedMethod === "All" || p.paymentMethod === selectedMethod;

      return matchesSearch && matchesBatch && matchesMethod;
    });
  }, [memberPayments, members, batches, searchTerm, selectedBatchId, selectedMethod]);

  // Sorted and Processed Payments
  const processedPayments = useMemo(() => {
    const list = [...filteredPayments];
    if (sortBy === "date-desc") {
      list.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    } else if (sortBy === "date-asc") {
      list.sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());
    } else if (sortBy === "amount-desc") {
      list.sort((a, b) => b.amountPaid - a.amountPaid);
    } else if (sortBy === "amount-asc") {
      list.sort((a, b) => a.amountPaid - b.amountPaid);
    } else if (sortBy === "receipt") {
      list.sort((a, b) => a.receiptNumber.localeCompare(b.receiptNumber));
    }
    return list;
  }, [filteredPayments, sortBy]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Receipt Number",
      "Member ID",
      "Member Name",
      "Batch",
      "Payment Date",
      "Payment Method",
      "Amount Paid",
      "Collector",
      "Remaining Balance",
      "Payment Status"
    ];
    const rows = processedPayments.map(p => {
      const memberObj = members.find(m => m.id === p.memberId);
      const memberName = memberObj ? memberObj.fullName : "Unknown";
      const memberCode = memberObj ? memberObj.memberId : "";
      const batchObj = batches.find(b => b.id === p.batchId);
      const batchName = batchObj ? batchObj.name : "No Batch";
      
      const balDetails = memberObj ? getMemberBalanceDetails(memberObj) : { expected: 5000, paid: 0, balance: 5000 };
      
      let paymentStatus = "Unpaid";
      if (balDetails.balance <= 0) {
        paymentStatus = "Paid";
      } else if (balDetails.paid > 0) {
        paymentStatus = "Partially Paid";
      }
      
      return [
        p.receiptNumber,
        memberCode,
        memberName,
        batchName,
        p.paymentDate,
        p.paymentMethod,
        p.amountPaid,
        p.collector,
        balDetails.balance,
        paymentStatus
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
    link.setAttribute("download", `Delmar_Collections_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Record Modal
  const openRecordModal = () => {
    const activeMembers = members.filter(m => m.membershipStatus !== "Archived");
    setMemberId(activeMembers[0]?.id || "");
    setPaymentMethod("GCash");
    setAmountPaid("");
    setRemarks("");
    setFormError("");
    setIsRecordModalOpen(true);
  };

  // Submit Payment
  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !amountPaid || Number(amountPaid) <= 0) {
      setFormError("Please select a member and enter a valid payment amount.");
      return;
    }
    setFormError("");
    
    // Check if amount paid exceeds remaining balance
    const member = members.find(m => m.id === memberId);
    if (member) {
      const { balance } = getMemberBalanceDetails(member);
      if (Number(amountPaid) > balance) {
        setFormError(`Amount paid cannot exceed the member's remaining balance of ₱${balance.toLocaleString()}.`);
        return;
      }
    }

    setIsSubmitting(true);
    
    const success = await recordMemberPayment({
      memberId,
      batchId: member?.batchId || undefined,
      paymentMethod,
      amountPaid: Number(amountPaid),
      collector,
      remarks: remarks || undefined
    });

    setIsSubmitting(false);
    if (success) {
      setIsRecordModalOpen(false);
    } else {
      setFormError("Failed to record payment. Please try again.");
    }
  };

  // Open Receipt
  const viewReceipt = (payment: MemberPayment) => {
    setSelectedPayment(payment);
    setIsReceiptModalOpen(true);
  };

  // Simulated PDF download
  const handleDownloadPDF = () => {
    alert("Simulated PDF generation started. Saving receipt file to downloads folder...");
  };

  // Simulated print
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
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-900 to-[#1B4332] p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="space-y-1.5 z-10">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight flex items-center gap-2">
            <Coins className="w-6 h-6 text-[#D4AF37]" /> Payment Ledger Registry
          </h1>
          <p className="text-xs text-emerald-100/80 font-medium">
            Record payments, print official receipts, and review outstanding accounts.
          </p>
        </div>

        <Button 
          variant="secondary" 
          className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-900 text-xs font-bold uppercase z-10 py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
          onClick={openRecordModal}
          icon={<Plus className="w-4 h-4" />}
        >
          Record Payment
        </Button>
      </div>

      {/* Filter toolbar */}
      <Card className="p-4 flex flex-col xl:flex-row items-center justify-between gap-4 border border-emerald-100/50 bg-white/85 dark:bg-[#0f1412]/80 backdrop-blur-md rounded-2xl shadow-sm">
        
        {/* Search */}
        <div className="relative w-full xl:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-950/30 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-white dark:bg-[#070a09]"
            placeholder="Search by ID, Name, Contact, Status..."
          />
        </div>

        {/* Filters, Sorting & Export */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#070a09] px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-emerald-950/20">
            <Filter className="w-3.5 h-3.5 text-[#1f8f60]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Batch</span>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="text-xs bg-transparent font-semibold focus:outline-hidden text-slate-700 dark:text-slate-200"
            >
              <option value="All">All Batches</option>
              {batches.filter(b => b.status !== "Archived").map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#070a09] px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-emerald-950/20">
            <CreditCard className="w-3.5 h-3.5 text-[#1f8f60]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Method</span>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="text-xs bg-transparent font-semibold focus:outline-hidden text-slate-700 dark:text-slate-200"
            >
              <option value="All">All Methods</option>
              <option value="GCash">GCash</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#070a09] px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-emerald-950/20">
            <TrendingUp className="w-3.5 h-3.5 text-[#1f8f60]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-transparent font-semibold focus:outline-hidden text-slate-700 dark:text-slate-200"
            >
              <option value="date-desc">Newest Date</option>
              <option value="date-asc">Oldest Date</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="receipt">Receipt No.</option>
            </select>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="px-3.5 py-1.5 text-xs border-emerald-100 hover:bg-emerald-50 dark:border-emerald-950/40 dark:hover:bg-emerald-950/20 cursor-pointer flex items-center gap-1.5 font-bold uppercase shrink-0"
            onClick={handleExportCSV}
            icon={<Download className="w-4 h-4 text-emerald-600" />}
          >
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Payments Logs List */}
      <Card className="p-0 overflow-hidden border border-slate-100 dark:border-[#182620] bg-white dark:bg-[#0f1412]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt No.</TableHead>
              <TableHead>Member Details</TableHead>
              <TableHead>Cohort Batch</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount Paid</TableHead>
              <TableHead className="text-right">Remaining Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Collector</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12 text-slate-400 font-medium text-xs">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No payment logs found matching criteria.
                </TableCell>
              </TableRow>
            ) : (
              processedPayments.map((payment) => {
                const member = members.find(m => m.id === payment.memberId);
                const memberName = member ? member.fullName : "Unknown Member";
                const memberCode = member ? member.memberId : "";
                const batch = batches.find(b => b.id === payment.batchId);
                const batchName = batch ? batch.name : "No Batch";

                // Financial computation
                const balDetails = member ? getMemberBalanceDetails(member) : { expected: 5000, paid: 0, balance: 5000 };
                let paymentStatus = "Unpaid";
                if (balDetails.balance <= 0) {
                  paymentStatus = "Paid";
                } else if (balDetails.paid > 0) {
                  paymentStatus = "Partially Paid";
                }

                let badgeStyle = "bg-red-50 text-red-655 dark:bg-red-955/20 dark:text-red-400";
                if (paymentStatus === "Paid") {
                  badgeStyle = "bg-emerald-50 text-emerald-655 dark:bg-emerald-955/20 dark:text-[#52b788]";
                } else if (paymentStatus === "Partially Paid") {
                  badgeStyle = "bg-amber-50 text-amber-655 dark:bg-amber-955/20 dark:text-[#D4AF37]";
                }

                return (
                  <TableRow key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-[#121916]/30 transition-colors">
                    <TableCell className="font-mono font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      {payment.receiptNumber}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100">{memberName}</div>
                      <span className="text-[9.5px] text-slate-400 font-mono block mt-0.5 uppercase tracking-wide">{memberCode}</span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-100/50">
                        {batchName}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-650 dark:text-slate-350">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {payment.paymentDate}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {payment.paymentMethod}
                    </TableCell>
                    <TableCell className="text-right font-mono font-extrabold text-xs text-emerald-600 dark:text-[#52b788]">
                      ₱{payment.amountPaid.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-red-600 dark:text-red-400">
                      ₱{balDetails.balance.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${badgeStyle}`}>
                        {paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-550 dark:text-slate-450">
                      {payment.collector}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="px-2.5 py-1 text-[10px] border-emerald-100 hover:bg-emerald-50 cursor-pointer flex items-center gap-1.5"
                        onClick={() => viewReceipt(payment)}
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" /> Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Member Program Payment"
        size="md"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button 
              variant="outline" 
              onClick={() => setIsRecordModalOpen(false)}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleRecordSubmit}
              className="text-xs cursor-pointer"
              isLoading={isSubmitting}
              disabled={members.filter(m => m.membershipStatus !== "Archived").length === 0}
            >
              Record Payment
            </Button>
          </div>
        }
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4 text-left">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-100 text-xs text-red-655 font-bold rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{formError}</span>
            </div>
          )}

          {members.filter(m => m.membershipStatus !== "Archived").length === 0 ? (
            <div className="p-6 text-center text-slate-400 font-semibold text-xs border border-dashed border-slate-200 dark:border-emerald-950/40 rounded-2xl bg-slate-50 dark:bg-[#070a09]/50">
              No active members found. Please register members first in the Member CRM directory.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Select Member *</label>
                  <select
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-semibold bg-transparent text-slate-800 dark:text-slate-100"
                  >
                    {members.filter(m => m.membershipStatus !== "Archived").map(m => (
                      <option key={m.id} value={m.id}>{m.fullName} ({m.memberId})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Assigned Batch</label>
                  <div className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-250 bg-slate-50 dark:bg-[#070a09]/50 font-bold text-emerald-800 dark:text-emerald-400">
                    {activeRecordMember ? (
                      batches.find(b => b.id === activeRecordMember.batchId)?.name || "No Batch Assigned"
                    ) : "No Member Selected"}
                  </div>
                </div>
              </div>

              {activeRecordMember && (
                <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/50 rounded-2xl flex flex-wrap gap-6 items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Dues</span>
                    <span className="font-mono font-extrabold text-slate-700 dark:text-slate-300">
                      ₱{getMemberBalanceDetails(activeRecordMember).expected.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Cumulative Payments</span>
                    <span className="font-mono font-extrabold text-emerald-600">
                      ₱{getMemberBalanceDetails(activeRecordMember).paid.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-l border-emerald-200/50 pl-6">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Remaining Balance</span>
                    <span className="font-mono font-extrabold text-red-500 text-sm">
                      ₱{getMemberBalanceDetails(activeRecordMember).balance.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Amount Paid (₱) *</label>
                  <input
                    type="number"
                    required
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-bold font-mono bg-transparent text-slate-800 dark:text-slate-100"
                    placeholder="2000"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-semibold bg-transparent text-slate-800 dark:text-slate-100"
                  >
                    <option value="GCash">GCash</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Collector (Admin) *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={collector}
                      onChange={(e) => setCollector(e.target.value)}
                      className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-transparent text-slate-800 dark:text-slate-100"
                      placeholder="Elena Delmar"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Remarks (Optional)</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-transparent text-slate-800 dark:text-slate-100"
                    placeholder="e.g. Down payment, Full payment"
                  />
                </div>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Official Collection Receipt"
        size="md"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button 
              variant="outline" 
              onClick={handlePrint}
              className="text-xs cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" /> Print Receipt
            </Button>
            <Button 
              variant="primary" 
              onClick={handleDownloadPDF}
              className="text-xs cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-white" /> Download PDF
            </Button>
          </div>
        }
      >
        {selectedPayment && (
          (() => {
            const memberObj = members.find(m => m.id === selectedPayment.memberId);
            const memberName = memberObj ? memberObj.fullName : "Unknown Member";
            const memberCode = memberObj ? memberObj.memberId : "";
            const memberEmail = memberObj ? memberObj.email : "";
            const memberContact = memberObj ? memberObj.contactNumber : "";
            const memberAddress = memberObj ? memberObj.address : "";
            const batchObj = batches.find(b => b.id === selectedPayment.batchId);
            const batchName = batchObj ? batchObj.name : "No Batch";

            // Calculate balance AFTER this payment
            // We sum all payments made by this member up to this point
            const memberPayList = memberPayments
              .filter(p => p.memberId === selectedPayment.memberId)
              .reverse(); // Reverse so oldest is first
            const paymentIndex = memberPayList.findIndex(p => p.id === selectedPayment.id);
            const totalPaidUpToThis = memberPayList
              .slice(0, paymentIndex + 1)
              .reduce((sum, p) => sum + p.amountPaid, 0);
            
            const totalDuesExpected = memberObj ? memberObj.totalDue : 5000;
            const remainingBalanceAfter = Math.max(0, totalDuesExpected - totalPaidUpToThis);

            return (
              <div className="p-2 border border-slate-100 bg-white dark:bg-[#0b0f0d] text-slate-800 dark:text-slate-100 font-sans rounded-2xl">
                <style dangerouslySetInnerHTML={{__html: `
                  @media print {
                    body * {
                      visibility: hidden;
                    }
                    #print-receipt-section, #print-receipt-section * {
                      visibility: visible;
                    }
                    #print-receipt-section {
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 100%;
                      background: white !important;
                      color: black !important;
                    }
                  }
                `}} />
                
                {/* Print view wrapper */}
                <div className="space-y-6 print:p-8" id="print-receipt-section">
                  {/* Brand Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                    <div>
                      <h2 className="text-sm font-extrabold uppercase tracking-widest text-emerald-800 dark:text-emerald-500">
                        SAVORLICIOUS FOOD SERVICES
                      </h2>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                        Purok Lapu-Lapu, Tickwas, Dumalinao, Zamboanga del Sur
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium">
                        Mobile: 09464544973 | delmararsenal103@gmail.com
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-[9px] font-extrabold bg-slate-900 text-white px-2 py-0.5 rounded-lg uppercase tracking-wider">
                        Payment Receipt
                      </span>
                      <h3 className="text-sm font-mono font-extrabold text-slate-800 dark:text-slate-100 mt-2 tracking-wider">
                        {selectedPayment.receiptNumber}
                      </h3>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                        Date: {selectedPayment.paymentDate}
                      </p>
                    </div>
                  </div>

                  {/* Customer Information Card */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Received From</span>
                      <div className="font-extrabold text-slate-900 dark:text-white">{memberName}</div>
                      <div className="text-[10px] text-slate-450 dark:text-slate-350">ID: {memberCode}</div>
                      <div className="text-[9.5px] text-slate-450 dark:text-slate-350 mt-0.5">{memberEmail}</div>
                      <div className="text-[9.5px] text-slate-450 dark:text-slate-350">{memberContact}</div>
                    </div>
                    
                    <div className="space-y-1 text-right">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Billing Address</span>
                      <div className="font-medium text-slate-700 dark:text-slate-300">{memberAddress}</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-2">Program Group</div>
                      <div className="font-extrabold text-emerald-800 dark:text-emerald-400 text-xs">{batchName}</div>
                    </div>
                  </div>

                  {/* Receipt breakdown table */}
                  <div className="border border-slate-200 dark:border-emerald-950/20 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-[#070a09] border-b border-slate-200 dark:border-emerald-950/20 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="p-3">Description</th>
                          <th className="p-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100 dark:border-emerald-950/10">
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                            Program Registration Installment ({selectedPayment.paymentMethod})
                            {selectedPayment.remarks && (
                              <span className="block text-[10px] text-slate-400 font-medium mt-0.5 italic">
                                Remarks: {selectedPayment.remarks}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono font-extrabold">
                            ₱{selectedPayment.amountPaid.toLocaleString()}
                          </td>
                        </tr>
                        
                        <tr className="bg-slate-50/40 dark:bg-[#070a09]/10">
                          <td className="p-3 font-bold text-slate-700 dark:text-slate-300 text-right">
                            Total Paid
                          </td>
                          <td className="p-3 text-right font-mono font-extrabold text-emerald-600">
                            ₱{selectedPayment.amountPaid.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Balance details */}
                  <div className="p-4 bg-slate-50 dark:bg-[#070a09] border border-slate-200/50 dark:border-emerald-950/20 rounded-2xl flex justify-between items-center text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Remaining Balance</span>
                      <span className={`font-mono font-extrabold ${remainingBalanceAfter <= 0 ? "text-emerald-600 text-sm" : "text-red-500 text-sm"}`}>
                        {remainingBalanceAfter <= 0 ? "FULLY PAID (₱0)" : `₱${remainingBalanceAfter.toLocaleString()}`}
                      </span>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="text-[9.5px] text-slate-400 font-bold block uppercase">Collector Signature</span>
                      <div className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1 justify-end">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> {selectedPayment.collector}
                      </div>
                    </div>
                  </div>

                  {/* Stamp simulation */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="font-mono text-[9px] text-slate-350 tracking-wider">
                      BARCODE_VALIDATION_TOKEN // {selectedPayment.id.slice(0, 8).toUpperCase()}
                    </div>
                    
                    <div className="border-2 border-dashed border-emerald-600/30 text-emerald-600/40 rounded-xl px-4 py-1 text-[10px] font-extrabold uppercase font-heading tracking-widest rotate-6">
                      Paid & Verified
                    </div>
                  </div>
                </div>

              </div>
            );
          })()
        )}
      </Modal>
    </motion.div>
  );
}

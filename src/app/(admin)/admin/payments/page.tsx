"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRole, MemberPayment, Member, Order } from "@/context/RoleContext";
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
  TrendingUp,
  Clock,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Settings,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminPaymentsPage() {
  const { 
    memberPayments, 
    members, 
    batches, 
    recordMemberPayment,
    orders,
    reservations,
    verifyOrderPayment,
    rejectOrderPayment,
    userEmail,
    userName 
  } = useRole();

  // Active Tab: "verification-queue" | "member-ledger"
  const [activeTab, setActiveTab] = useState<"verification-queue" | "member-ledger">("verification-queue");

  // --- ONLINE VERIFICATION QUEUE STATE ---
  const [verificationFilter, setVerificationFilter] = useState<string>("Pending Verification");
  const [queueSearchTerm, setQueueSearchTerm] = useState<string>("");
  
  // Rejection modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [rejectOrderId, setRejectOrderId] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [rejectError, setRejectError] = useState<string>("");

  // All online verification items (orders & reservations with paymentReferenceNumber or status "Payment Verification")
  const verificationQueueItems = useMemo(() => {
    return orders.filter(o => o.paymentReferenceNumber || o.paymentStatus === "Pending Verification" || o.status === "Payment Verification" || o.paymentStatus === "Rejected");
  }, [orders]);

  const pendingCount = useMemo(() => {
    return verificationQueueItems.filter(o => o.paymentStatus === "Pending Verification" || o.status === "Payment Verification").length;
  }, [verificationQueueItems]);

  const filteredQueueItems = useMemo(() => {
    return verificationQueueItems.filter(o => {
      const cleanSearch = queueSearchTerm.toLowerCase();
      const matchesSearch = o.id.toLowerCase().includes(cleanSearch) ||
                            o.customerName.toLowerCase().includes(cleanSearch) ||
                            o.customerEmail.toLowerCase().includes(cleanSearch) ||
                            (o.paymentReferenceNumber && o.paymentReferenceNumber.toLowerCase().includes(cleanSearch)) ||
                            o.product.toLowerCase().includes(cleanSearch);

      let matchesFilter = true;
      if (verificationFilter === "Pending Verification") {
        matchesFilter = o.paymentStatus === "Pending Verification" || o.status === "Payment Verification";
      } else if (verificationFilter === "Verified (Paid)") {
        matchesFilter = o.paymentStatus === "Paid";
      } else if (verificationFilter === "Rejected") {
        matchesFilter = o.paymentStatus === "Rejected";
      } else if (verificationFilter === "Flagged Duplicate") {
        matchesFilter = !!o.isDuplicateReference;
      }

      return matchesSearch && matchesFilter;
    });
  }, [verificationQueueItems, queueSearchTerm, verificationFilter]);

  const handleVerify = async (orderId: string) => {
    await verifyOrderPayment(orderId, userEmail || "admin@delmarfarm.com");
  };

  const handleOpenRejectModal = (orderId: string) => {
    setRejectOrderId(orderId);
    setRejectionReason("");
    setRejectError("");
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setRejectError("Rejection reason is required.");
      return;
    }
    await rejectOrderPayment(rejectOrderId, rejectionReason.trim(), userEmail || "admin@delmarfarm.com");
    setIsRejectModalOpen(false);
    setRejectOrderId("");
    setRejectionReason("");
  };


  // --- MEMBER LEDGER STATE ---
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

  React.useEffect(() => {
    if (userName && userName !== "Visitor") {
      setCollector(userName);
    }
  }, [userName]);

  const activeRecordMember = useMemo(() => {
    return members.find(m => m.id === memberId);
  }, [members, memberId]);

  const getMemberBalanceDetails = (member: Member, upToPaymentId?: string) => {
    const expected = member.totalDue;
    let paymentsQuery = memberPayments.filter(p => p.memberId === member.id);
    if (upToPaymentId) {
      const paymentIndex = paymentsQuery.findIndex(p => p.id === upToPaymentId);
      if (paymentIndex !== -1) {
        paymentsQuery = paymentsQuery.slice(paymentIndex);
      }
    }
    const paid = paymentsQuery.reduce((sum, p) => sum + p.amountPaid, 0);
    const balance = expected - paid;
    return { expected, paid, balance };
  };

  const filteredPayments = useMemo(() => {
    return memberPayments.filter(p => {
      const member = members.find(m => m.id === p.memberId);
      const memberName = member ? member.fullName : "Unknown Member";
      const memberCode = member ? member.memberId : "";
      const batch = batches.find(b => b.id === p.batchId);
      const batchName = batch ? batch.name : "No Batch";

      const balDetails = member ? getMemberBalanceDetails(member) : { expected: 5000, paid: 0, balance: 5000 };
      let paymentStatus = "Unpaid";
      if (balDetails.balance <= 0) {
        paymentStatus = "Paid";
      } else if (balDetails.paid > 0) {
        paymentStatus = "Partially Paid";
      }

      const matchesSearch = 
        p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member && member.contactNumber.includes(searchTerm)) ||
        paymentStatus.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBatch = selectedBatchId === "All" || p.batchId === selectedBatchId;
      const matchesMethod = selectedMethod === "All" || p.paymentMethod === selectedMethod;

      return matchesSearch && matchesBatch && matchesMethod;
    });
  }, [memberPayments, members, batches, searchTerm, selectedBatchId, selectedMethod]);

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

  const handleExportCSV = () => {
    alert("Exporting CSV payments log...");
  };

  const openRecordModal = () => {
    const activeMembers = members.filter(m => m.membershipStatus !== "Archived");
    setMemberId(activeMembers[0]?.id || "");
    setPaymentMethod("GCash");
    setAmountPaid("");
    setRemarks("");
    setFormError("");
    setIsRecordModalOpen(true);
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !amountPaid || Number(amountPaid) <= 0) {
      setFormError("Please select a member and enter a valid payment amount.");
      return;
    }
    setFormError("");
    
    const member = members.find(m => m.id === memberId);
    if (member) {
      const { balance } = getMemberBalanceDetails(member);
      if (Number(amountPaid) > balance) {
        setFormError(`Amount paid cannot exceed remaining balance of ₱${balance.toLocaleString()}.`);
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
      setFormError("Failed to record payment.");
    }
  };

  const viewReceipt = (payment: MemberPayment) => {
    setSelectedPayment(payment);
    setIsReceiptModalOpen(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 font-sans pb-12"
    >
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-900 to-[#1B4332] p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight flex items-center gap-2">
            <Coins className="w-6 h-6 text-[#D4AF37]" /> Payment Verification & Ledger Manager
          </h1>
          <p className="text-xs text-emerald-100/80 font-medium">
            Verify online reference numbers, manage member payment ledgers, and configure payment channels.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <Link href="/admin/settings/payment">
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs font-bold">
              <Settings className="w-4 h-4 mr-1.5" /> Payment Settings
            </Button>
          </Link>
          <Button 
            variant="secondary" 
            className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-900 text-xs font-bold uppercase py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
            onClick={openRecordModal}
            icon={<Plus className="w-4 h-4" />}
          >
            Record Manual Payment
          </Button>
        </div>
      </div>

      {/* TABS SWITCHER */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab("verification-queue")}
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "verification-queue"
              ? "border-[#1B4332] text-[#1B4332] font-black"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Online Payment Verification Queue</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-extrabold animate-pulse">
              {pendingCount} PENDING
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("member-ledger")}
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "member-ledger"
              ? "border-[#1B4332] text-[#1B4332] font-black"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Member Payment Ledger</span>
        </button>
      </div>

      {activeTab === "verification-queue" ? (
        /* ONLINE PAYMENT VERIFICATION QUEUE */
        <div className="space-y-4">
          <Card className="p-4 flex flex-col xl:flex-row items-center justify-between gap-4 border border-emerald-100/50 bg-white rounded-2xl shadow-xs">
            <div className="relative w-full xl:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={queueSearchTerm}
                onChange={(e) => setQueueSearchTerm(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-hidden font-medium"
                placeholder="Search Order #, Customer, Reference Code..."
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {["All", "Pending Verification", "Verified (Paid)", "Rejected", "Flagged Duplicate"].map(filter => (
                <button
                  key={filter}
                  onClick={() => setVerificationFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    verificationFilter === filter
                      ? "bg-[#1B4332] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-0 overflow-hidden border border-slate-100 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer Details</TableHead>
                  <TableHead>Purchased Product</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Reference Number</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead className="text-right">Manual Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQueueItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-slate-400 font-medium text-xs">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No online payment verification items found matching filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQueueItems.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-mono font-bold text-xs text-slate-800">{order.id}</TableCell>
                      <TableCell>
                        <div className="font-bold text-xs text-slate-800">{order.customerName}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{order.customerEmail}</div>
                      </TableCell>
                      <TableCell className="font-bold text-xs text-slate-700">{order.product} (x{order.quantity})</TableCell>
                      <TableCell className="font-mono font-extrabold text-xs text-slate-800">₱{order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {order.paymentReferenceNumber || "N/A"}
                          </span>
                          {order.isDuplicateReference && (
                            <div className="p-1 bg-amber-50 border border-amber-200 rounded text-[9px] font-extrabold text-amber-800 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>DUPLICATE FLAGGED</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                          order.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          order.paymentStatus === "Pending Verification" ? "bg-blue-50 text-blue-700 border border-blue-100 animate-pulse" :
                          order.paymentStatus === "Rejected" ? "bg-red-50 text-red-700 border border-red-100" :
                          "bg-amber-50 text-amber-700"
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.paymentStatus !== "Paid" && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase py-1 px-2.5"
                              onClick={() => handleVerify(order.id)}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> VERIFY PAYMENT
                            </Button>
                          )}
                          {order.paymentStatus !== "Rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 text-[10px] font-bold uppercase py-1 px-2.5"
                              onClick={() => handleOpenRejectModal(order.id)}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" /> REJECT
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      ) : (
        /* MEMBER PAYMENT LEDGER */
        <div className="space-y-4">
          <Card className="p-4 flex flex-col xl:flex-row items-center justify-between gap-4 border border-emerald-100/50 bg-white rounded-2xl shadow-xs">
            <div className="relative w-full xl:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-medium"
                placeholder="Search by ID, Name, Contact..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" variant="outline" onClick={handleExportCSV} icon={<Download className="w-4 h-4 text-emerald-600" />}>
                Export CSV
              </Button>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden border border-slate-100 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt No.</TableHead>
                  <TableHead>Member Details</TableHead>
                  <TableHead>Cohort Batch</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                  <TableHead>Collector</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-slate-400 font-medium text-xs">
                      No member payment logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  processedPayments.map((payment) => {
                    const member = members.find(m => m.id === payment.memberId);
                    const memberName = member ? member.fullName : "Unknown Member";
                    return (
                      <TableRow key={payment.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-mono font-bold text-xs text-slate-800">{payment.receiptNumber}</TableCell>
                        <TableCell className="font-bold text-xs text-slate-800">{memberName}</TableCell>
                        <TableCell className="text-xs text-slate-600">{payment.batchId || "N/A"}</TableCell>
                        <TableCell className="text-xs text-slate-600">{payment.paymentDate}</TableCell>
                        <TableCell className="text-xs font-bold text-slate-700">{payment.paymentMethod}</TableCell>
                        <TableCell className="text-right font-mono font-extrabold text-xs text-emerald-600">₱{payment.amountPaid.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-slate-500">{payment.collector}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => viewReceipt(payment)}>
                            View Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Rejection Modal */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title={`Reject Online Payment for ${rejectOrderId}`}>
        <form onSubmit={handleConfirmReject} className="space-y-4 font-sans text-xs">
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-600" /> Confirm Payment Rejection
            </div>
            <p className="text-[11px] leading-relaxed">
              Rejecting this payment will notify the customer via email and change the order status to <strong>Payment Failed / Action Required</strong> so they can re-submit a valid reference number.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 uppercase">Reason for Rejection *</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Reference number ABC123456789 not found in GCash merchant log / Amount mismatched."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl font-medium"
            />
            {rejectError && <p className="text-[10px] font-bold text-red-500">{rejectError}</p>}
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
              Confirm Rejection & Notify Customer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Member Payment Modal */}
      <Modal isOpen={isRecordModalOpen} onClose={() => setIsRecordModalOpen(false)} title="Record Manual Payment">
        <form onSubmit={handleRecordSubmit} className="space-y-4 font-sans text-xs">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 uppercase">Member</label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-semibold bg-white"
            >
              {members.filter(m => m.membershipStatus !== "Archived").map(m => (
                <option key={m.id} value={m.id}>{m.fullName} ({m.memberId})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 uppercase">Amount Paid (₱)</label>
            <input
              type="number"
              required
              min={1}
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          {formError && <p className="text-[10px] font-bold text-red-500">{formError}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            Save Payment Record
          </Button>
        </form>
      </Modal>

    </motion.div>
  );
}

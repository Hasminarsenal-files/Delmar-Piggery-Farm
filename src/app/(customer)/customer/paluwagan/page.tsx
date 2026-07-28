"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiggyBank,
  TrendingUp,
  Calendar,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Mail,
  ChevronRight,
  Info,
  ShieldAlert,
  Coins,
  Wallet,
  Send
} from "lucide-react";
import {
  generateFixedBatchSchedule,
  calculateBatchEndDate,
  calculateMemberPaluwaganMetrics,
  calculateEmailReminderDate,
  formatDateISO,
  PaluwaganScheduleItem
} from "@/utils/paluwaganScheduler";

export default function CustomerPaluwaganPage() {
  const { userEmail, orders, paluwaganBatches, onlinePaymentChannels, checkDuplicateReferenceNumber, submitPaluwaganInstallmentPayment } = useRole();

  // Filter Paluwagan orders for this customer
  const customerPaluwaganOrders = orders.filter(
    (o) => o.customerEmail === userEmail && o.orderType === "Paluwagan"
  );

  // Separate active (Approved/Completed) plans and pending applications
  const activePlans = customerPaluwaganOrders.filter(
    (o) => o.status !== "Pending" && o.status !== "Cancelled"
  );
  const pendingApplications = customerPaluwaganOrders.filter(
    (o) => o.status === "Pending"
  );

  // Selected plan ID state
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    if (activePlans.length > 0) return activePlans[0].id;
    if (pendingApplications.length > 0) return pendingApplications[0].id;
    return "";
  });

  // Remittance Modal state
  const [isRemitModalOpen, setIsRemitModalOpen] = useState<boolean>(false);
  const [targetInstallmentNum, setTargetInstallmentNum] = useState<number>(1);
  const [targetAmountDue, setTargetAmountDue] = useState<number>(0);
  const [channelId, setChannelId] = useState<string>("");
  const [remitRefNumber, setRemitRefNumber] = useState<string>("");
  const [refError, setRefError] = useState<string>("");
  const [isDupRef, setIsDupRef] = useState<boolean>(false);
  const [remitSuccess, setRemitSuccess] = useState<boolean>(false);

  // Find the currently selected order plan
  const activePlan = customerPaluwaganOrders.find((o) => o.id === selectedPlanId);

  const handleOpenRemittance = (installmentNumber: number, amountDue: number) => {
    setTargetInstallmentNum(installmentNumber);
    setTargetAmountDue(amountDue);
    setRemitRefNumber("");
    setRefError("");
    setIsDupRef(false);
    setRemitSuccess(false);
    if (onlinePaymentChannels.length > 0) {
      setChannelId(onlinePaymentChannels[0].id);
    }
    setIsRemitModalOpen(true);
  };

  const handleRemittanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlan) return;
    const cleanRef = remitRefNumber.trim();
    if (!cleanRef) {
      setRefError("Payment Reference Number is required.");
      return;
    }
    setRefError("");

    await submitPaluwaganInstallmentPayment(activePlan.id, targetInstallmentNum, cleanRef);
    setRemitSuccess(true);
  };

  // If no Paluwagan plans at all, show empty state
  if (customerPaluwaganOrders.length === 0 || !activePlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6 max-w-lg mx-auto font-sans">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 rounded-full bg-emerald-50 text-[#1B4332] flex items-center justify-center shadow-inner"
        >
          <PiggyBank className="w-12 h-12 stroke-[1.5]" />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">My Paluwagan Hub</h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            You don't have any active Paluwagan plans or applications at the moment. 
            Join a Paluwagan batch to save and pay for Crispylicious Lechon in convenient bi-weekly installments!
          </p>
        </div>
        <Link href="/products">
          <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />} className="cursor-pointer font-bold shadow-md">
            Browse Product Catalog
          </Button>
        </Link>
      </div>
    );
  }

  // Find associated batch details
  const matchedBatch = paluwaganBatches.find((b) => b.id === activePlan?.batchId) || paluwaganBatches[0];
  const batchStartDate = matchedBatch?.startDate || "2026-07-15";
  const batchDuration = matchedBatch?.durationMonths || 8;
  const batchEndDate = matchedBatch?.endDate || calculateBatchEndDate(batchStartDate, batchDuration);

  // Ensure fixed 15th/30th schedule is generated for active plan
  const schedule: PaluwaganScheduleItem[] = activePlan?.paluwaganSchedule && activePlan.paluwaganSchedule.length > 0
    ? activePlan.paluwaganSchedule
    : generateFixedBatchSchedule(
        batchStartDate,
        batchDuration,
        activePlan.totalAmount,
        activePlan.downPayment || Math.round(activePlan.totalAmount * 0.25)
      );

  // Compute exact metrics using utility
  const metrics = calculateMemberPaluwaganMetrics(
    schedule,
    activePlan.totalAmount,
    activePlan.downPayment || Math.round(activePlan.totalAmount * 0.25)
  );

  const totalAmount = metrics.totalAmountDue;
  const downPayment = metrics.downPayment;
  const totalPaid = metrics.totalPaid;
  const remainingBalance = metrics.remainingBalance;
  const overdueBalance = metrics.overdueBalance;
  const paidCount = metrics.paidCount;
  const overdueCount = metrics.overdueCount;
  const nextPaymentDate = metrics.nextPaymentDate;
  const nextPaymentAmount = metrics.nextPaymentAmount;
  const progressPct = Math.round((totalPaid / totalAmount) * 100) || 0;

  // Build payment history timeline log
  const paymentHistory: Array<{
    receiptNumber: string;
    date: string;
    amountPaid: number;
    remainingBalanceAfter: number;
    type: string;
    status?: string;
  }> = [];

  if (downPayment > 0 && activePlan) {
    paymentHistory.push({
      receiptNumber: "DPF-DP-INIT",
      date: activePlan.dateCreated,
      amountPaid: downPayment,
      remainingBalanceAfter: totalAmount - downPayment,
      type: "Down Payment",
      status: "Paid",
    });
  }

  if (activePlan?.installmentsLog) {
    let runningBalance = totalAmount - downPayment;
    activePlan.installmentsLog.forEach((log) => {
      runningBalance = Math.max(0, runningBalance - log.amount);
      const receiptNumber = log.remarks?.split(" - ")[0] || "DPF-REC-MOCK";
      paymentHistory.push({
        receiptNumber,
        date: log.date,
        amountPaid: log.amount,
        remainingBalanceAfter: runningBalance,
        type: "Installment",
        status: "Paid",
      });
    });
  }

  // Status Styling Badge Helper
  const getStatusBadge = (item: PaluwaganScheduleItem) => {
    if (item.verificationStatus === "Pending Verification" || item.status === ("PENDING VERIFICATION" as any)) {
      return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">PENDING VERIFICATION</span>;
    }
    if (item.verificationStatus === "Rejected" || item.status === ("REJECTED" as any)) {
      return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-red-50 text-red-700 border border-red-200">REJECTED</span>;
    }
    switch (item.status) {
      case "PAID":
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">PAID</span>;
      case "PARTIALLY PAID":
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-sky-50 text-sky-700 border border-sky-200">PARTIALLY PAID</span>;
      case "OVERDUE":
      case "MISSED":
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200">OVERDUE</span>;
      case "DUE":
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200">DUE TODAY</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-slate-50 text-slate-600 border border-slate-200">UPCOMING</span>;
    }
  };

  const nextReminderDate = nextPaymentDate !== "Fully Paid" ? calculateEmailReminderDate(nextPaymentDate) : null;

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">My Paluwagan Savings Ledger</h1>
          <p className="text-xs text-slate-500 font-medium">Monitor fixed bi-weekly payment dates (15th & 30th), batch schedules, and submit online remittances.</p>
        </div>

        {/* Plan Selector if customer has multiple plans */}
        {customerPaluwaganOrders.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Select Plan:</span>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-xl font-semibold bg-white text-slate-700 focus:ring-2 focus:ring-[#1B4332]/20"
            >
              {customerPaluwaganOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} - {o.product} ({o.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activePlan?.status === "Pending" ? (
          // PENDING PALUWAGAN PLAN DETAILS
          <motion.div
            key="pending-plan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="p-8 text-center space-y-4 md:col-span-3 bg-white border border-slate-200/60 rounded-3xl shadow-xs">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-2 max-w-lg mx-auto">
                <h3 className="text-base font-extrabold text-slate-800">Paluwagan Application Pending Approval</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Your Paluwagan application for **{activePlan.product}** is currently under admin review. 
                  Once approved, your ledger will activate automatically and generate the fixed bi-weekly schedule (15th and 30th).
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-2xl mx-auto text-left text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Product</span>
                  <span className="font-extrabold text-slate-800 block truncate">{activePlan.product}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Amount</span>
                  <span className="font-extrabold text-slate-800 block">₱{activePlan.totalAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Est. Down Payment</span>
                  <span className="font-extrabold text-slate-800 block">₱{(activePlan.totalAmount * 0.25).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Fixed Payment Dates</span>
                  <span className="font-extrabold text-[#1B4332] block">Every 15th & 30th</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          // ACTIVE APPROVED PALUWAGAN PLAN
          <motion.div
            key="active-plan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* LEFT COLUMN: Summary & Information */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Batch Information Card */}
              <Card className="p-5 bg-white border border-slate-200/60 rounded-3xl relative overflow-hidden space-y-4 shadow-xs">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#2D6A4F]" />
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xl text-[#2D6A4F]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Assigned Paluwagan Batch</span>
                    <h3 className="text-sm font-extrabold text-slate-800">{matchedBatch?.name || "Active Batch"}</h3>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-100">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Start Date</span>
                    <span className="font-extrabold text-slate-800 font-mono block">{batchStartDate}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Duration</span>
                    <span className="font-extrabold text-slate-800 block">{batchDuration} Months</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Batch Target End Date</span>
                    <span className="font-extrabold text-slate-800 font-mono block">{batchEndDate}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Fixed Payment Schedule</span>
                    <span className="font-extrabold text-[#1B4332] block">Every 15th & 30th of the Month</span>
                  </div>
                </div>
              </Card>

              {/* Financial Summary Card */}
              <Card className="p-5 bg-white border border-slate-200/60 rounded-3xl relative overflow-hidden space-y-4 shadow-xs">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4AF37]" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Financial Summary</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-1 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Amount Due</span>
                    <span className="text-sm font-extrabold text-slate-800">₱{totalAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Amount Paid</span>
                    <span className="text-sm font-extrabold text-emerald-600">₱{totalPaid.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Remaining Balance</span>
                    <span className="text-sm font-extrabold text-rose-600">₱{remainingBalance.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Overdue Balance</span>
                    <span className={`text-sm font-extrabold ${overdueBalance > 0 ? "text-rose-600 animate-pulse" : "text-slate-700"}`}>
                      ₱{overdueBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Progress Card */}
              <Card className="p-5 bg-white border border-slate-200/60 rounded-3xl space-y-4 shadow-xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Progress</span>
                  <span className="font-extrabold text-emerald-700">{progressPct}% Complete</span>
                </div>
                <div className="space-y-2">
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-[#2D6A4F] h-3 rounded-full transition-all duration-700"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </Card>

            </div>

            {/* RIGHT COLUMN: Payment Schedule Table & History */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Payment Schedule Table */}
              <Card className="p-5 bg-white border border-slate-200/60 rounded-3xl space-y-4 shadow-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <h3 className="font-heading text-xs font-bold text-[#1B4332] uppercase tracking-widest">Complete Payment Schedule</h3>
                    <p className="text-[10.5px] text-slate-450 font-medium">Batch-controlled schedule (15th and 30th fixed dates)</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl">
                    {metrics.syncedSchedule.length} Installments
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.syncedSchedule.map((item) => (
                        <TableRow key={item.installmentNumber}>
                          <TableCell className="font-bold text-xs text-slate-500">{item.installmentNumber}</TableCell>
                          <TableCell className="font-mono text-xs font-bold text-slate-800">{item.dueDate}</TableCell>
                          <TableCell className="font-mono text-xs font-bold text-slate-800">₱{item.amountDue.toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(item)}</TableCell>
                          <TableCell>
                            {item.status !== "PAID" && item.verificationStatus !== "Pending Verification" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenRemittance(item.installmentNumber, item.amountDue)}
                              >
                                <Send className="w-3 h-3 mr-1" /> Pay Online
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online Remittance Modal */}
      <Modal isOpen={isRemitModalOpen} onClose={() => { setIsRemitModalOpen(false); setRemitSuccess(false); }} title={remitSuccess ? "Remittance Submitted" : `Pay Remittance: Installment #${targetInstallmentNum}`}>
        {remitSuccess ? (
          <div className="text-center py-6 space-y-4 font-sans">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="px-2.5 py-1 text-[10px] font-extrabold bg-blue-100 text-blue-800 rounded-full uppercase tracking-wider">
                REMITTANCE VERIFICATION PENDING
              </span>
              <h4 className="font-heading text-base font-bold text-slate-800 pt-2">Your Paluwagan payment reference has been submitted for admin verification.</h4>
            </div>
            <Button onClick={() => { setIsRemitModalOpen(false); setRemitSuccess(false); }} className="w-full">
              Back to Savings Ledger
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRemittanceSubmit} className="space-y-4 font-sans text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Installment #{targetInstallmentNum}</span>
                <span>Amount: ₱{targetAmountDue.toLocaleString()}</span>
              </div>
            </div>

            {/* CHANNEL DROPDOWN & INSTRUCTIONS */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-primary-600" /> Select Payment Channel
              </label>

              <select
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-800 bg-white"
              >
                {onlinePaymentChannels.filter(c => c.isActive).map(channel => (
                  <option key={channel.id} value={channel.id}>
                    {channel.providerName} — {channel.accountNumber} ({channel.accountName})
                  </option>
                ))}
              </select>

              {(() => {
                const chan = onlinePaymentChannels.find(c => c.id === channelId) || onlinePaymentChannels[0];
                return (
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1 text-[11px] text-blue-900 font-medium">
                    <div className="font-bold flex items-center justify-between">
                      <span>Account: {chan?.accountNumber} ({chan?.accountName})</span>
                    </div>
                    <div className="text-[10px] text-blue-700 whitespace-pre-line leading-relaxed font-normal">
                      {chan?.instructions}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* REFERENCE NUMBER */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Payment Reference Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. ABC123456789 or GCSH-987654"
                value={remitRefNumber}
                onChange={(e) => {
                  setRemitRefNumber(e.target.value);
                  setRefError("");
                  setIsDupRef(checkDuplicateReferenceNumber(e.target.value));
                }}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono uppercase tracking-wider"
              />
              {refError && <p className="text-[10px] font-bold text-red-500">{refError}</p>}
              {isDupRef && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Reference code already exists. Flagged as DUPLICATE for Admin review.</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full">
                Submit Remittance for Verification (₱{targetAmountDue.toLocaleString()})
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}


"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
  Coins
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
  const { userEmail, orders, paluwaganBatches } = useRole();

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

  // Find the currently selected order plan
  const activePlan = customerPaluwaganOrders.find((o) => o.id === selectedPlanId);

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
    type: "Down Payment" | "Installment";
  }> = [];

  if (downPayment > 0 && activePlan) {
    paymentHistory.push({
      receiptNumber: "DPF-DP-INIT",
      date: activePlan.dateCreated,
      amountPaid: downPayment,
      remainingBalanceAfter: totalAmount - downPayment,
      type: "Down Payment",
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
      });
    });
  }

  // Status Styling Badge Helper
  const getStatusBadge = (status: PaluwaganScheduleItem["status"]) => {
    switch (status) {
      case "PAID":
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">PAID</span>;
      case "PARTIALLY PAID":
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-sky-50 text-sky-700 border border-sky-200">PARTIALLY PAID</span>;
      case "OVERDUE":
      case "MISSED":
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">OVERDUE</span>;
      case "DUE":
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200 animate-bounce">DUE TODAY</span>;
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
          <p className="text-xs text-slate-500 font-medium">Monitor fixed bi-weekly payment dates (15th & 30th), batch schedules, and catch-up balances.</p>
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
            <Card className="p-8 text-center space-y-4 md:col-span-3 bg-white border border-slate-200/60 rounded-3xl shadow-sm">
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
              <Card className="p-5 bg-white border border-slate-200/60 rounded-3xl relative overflow-hidden space-y-4 shadow-sm">
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
              <Card className="p-5 bg-white border border-slate-200/60 rounded-3xl relative overflow-hidden space-y-4 shadow-sm">
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
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Paid Installments</span>
                    <span className="text-xs font-extrabold text-emerald-700">{paidCount} / {metrics.syncedSchedule.length}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Overdue Installments</span>
                    <span className={`text-xs font-extrabold ${overdueCount > 0 ? "text-rose-600" : "text-slate-700"}`}>
                      {overdueCount} installment(s)
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Next Payment Date & Amount</span>
                    <div className="flex justify-between items-baseline mt-0.5">
                      <span className="text-xs font-extrabold text-amber-600 font-mono">{nextPaymentDate}</span>
                      <span className="text-xs font-extrabold text-slate-800">₱{nextPaymentAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Progress Card */}
              <Card className="p-5 bg-white border border-slate-200/60 rounded-3xl space-y-4 shadow-sm">
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
                  <span className="text-[10px] text-slate-450 block font-semibold text-center">
                    ₱{totalPaid.toLocaleString()} paid of ₱{totalAmount.toLocaleString()} contract amount
                  </span>
                </div>
              </Card>

              {/* Email Reminder Alert Card */}
              <Card className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex gap-3 text-xs">
                <div className="p-1.5 bg-emerald-100 rounded-xl text-[#1B4332] shrink-0 h-max mt-0.5">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-emerald-800">Automated Billing Alerts</div>
                  <p className="text-[10.5px] text-slate-550 font-semibold leading-relaxed">
                    Automated email reminders are dispatched exactly 2 days before fixed due dates (13th & 28th).
                  </p>
                  {nextReminderDate && (
                    <span className="text-[9.5px] font-extrabold text-[#2D6A4F] bg-emerald-100/50 px-2 py-0.5 rounded-md inline-block">
                      Next Alert Date: {nextReminderDate}
                    </span>
                  )}
                </div>
              </Card>

            </div>

            {/* RIGHT COLUMN: Payment Schedule Table & History */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Payment Schedule Table */}
              <Card className="p-5 bg-white border border-slate-200/60 rounded-3xl space-y-4 shadow-sm">
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
                        <TableHead>Required Amount</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.syncedSchedule.map((item) => (
                        <TableRow key={item.installmentNumber} className={item.status === "OVERDUE" ? "bg-rose-50/30" : ""}>
                          <TableCell className="font-bold text-xs text-slate-500">{item.installmentNumber}</TableCell>
                          <TableCell className="font-mono text-xs font-bold text-slate-800">{item.dueDate}</TableCell>
                          <TableCell className="font-mono text-xs font-bold text-slate-800">₱{item.amountDue.toLocaleString()}</TableCell>
                          <TableCell className="font-mono text-xs font-bold text-emerald-600">₱{item.amountPaid.toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* Recorded Payment History */}
              <Card className="p-5 bg-white border border-slate-200/60 rounded-3xl space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="font-heading text-xs font-bold text-[#1B4332] uppercase tracking-widest">Payment Log & Official Receipts</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{paymentHistory.length} Transactions</span>
                </div>

                {paymentHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium text-center py-4">No payment transactions recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {paymentHistory.map((history, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-2xl flex justify-between items-center text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-800">{history.type}</span>
                            <span className="text-[9px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {history.receiptNumber}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-450 font-mono font-semibold">Date: {history.date}</div>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="text-sm font-extrabold text-emerald-600 block">+₱{history.amountPaid.toLocaleString()}</span>
                          <span className="text-[9.5px] text-slate-400 block font-mono">Rem: ₱{history.remainingBalanceAfter.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

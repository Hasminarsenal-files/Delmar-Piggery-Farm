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
  Info
} from "lucide-react";

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
            Join a Paluwagan batch to save and pay for piglets or catering programs in convenient bi-weekly installments!
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
  const matchedBatch = paluwaganBatches.find((b) => b.id === activePlan?.batchId);

  // Calculations for active/approved plan
  const totalAmount = activePlan?.totalAmount || 0;
  const downPayment = activePlan?.downPayment || 0;
  const schedulePaid = activePlan?.paluwaganSchedule?.reduce((sum, item) => sum + item.amountPaid, 0) || 0;
  const totalPaid = downPayment + schedulePaid;
  const remainingBalance = activePlan?.remainingBalance ?? (totalAmount - totalPaid);
  const progressPct = Math.round((totalPaid / totalAmount) * 100) || 0;

  // Build payment history timeline log
  const paymentHistory: Array<{
    receiptNumber: string;
    date: string;
    amountPaid: number;
    remainingBalanceAfter: number;
    type: "Down Payment" | "Installment";
  }> = [];

  // 1. Add downpayment if configured
  if (downPayment > 0 && activePlan) {
    paymentHistory.push({
      receiptNumber: "DPF-DP-INIT",
      date: activePlan.dateCreated,
      amountPaid: downPayment,
      remainingBalanceAfter: totalAmount - downPayment,
      type: "Down Payment",
    });
  }

  // 2. Add recorded installment logs
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

  // Helper to determine status classes for installments
  const getInstallmentStatus = (dueDateStr: string, status: "Paid" | "Pending" | "Overdue") => {
    if (status === "Paid") {
      return { label: "Paid", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      return { label: "Overdue", color: "bg-rose-50 text-rose-700 border-rose-200" };
    }
    // Check if it's the next upcoming installment
    const isNextDue = activePlan?.nextDueDate === dueDateStr;
    if (isNextDue) {
      return { label: "Upcoming", color: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse font-bold" };
    }
    return { label: "Pending", color: "bg-slate-50 text-slate-600 border-slate-200" };
  };

  // Determine email reminder text
  const nextReminderDate = activePlan?.nextDueDate
    ? (() => {
        const d = new Date(activePlan.nextDueDate);
        d.setDate(d.getDate() - 2);
        return d.toISOString().split("T")[0];
      })()
    : null;

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">My Paluwagan Savings Ledger</h1>
          <p className="text-xs text-slate-500 font-medium">Monitor your installment schedule, payment history, and contract progress.</p>
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
                  Once approved, your ledger will activate automatically and generate the full 4-installment bi-weekly schedule.
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
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Payment Interval</span>
                  <span className="font-extrabold text-[#1B4332] block">Every 15 Days</span>
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
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Paluwagan Batch</span>
                    <h3 className="text-sm font-extrabold text-slate-800">{matchedBatch?.name || "Active Batch"}</h3>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-100">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase border ${
                      matchedBatch?.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}>
                      {matchedBatch?.status || "Active"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Interval</span>
                    <span className="font-extrabold text-slate-800 block">Every 15 Days</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Start Date</span>
                    <span className="font-extrabold text-slate-800 font-mono block">{matchedBatch?.startDate || "N/A"}</span>
                  </div>
                </div>
              </Card>

              {/* Financial Summary Card */}
              <Card className="p-5 bg-white border border-slate-200/60 rounded-3xl relative overflow-hidden space-y-4 shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4AF37]" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Financial Summary</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-1 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Contract Amount</span>
                    <span className="text-sm font-extrabold text-slate-800">₱{totalAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Down Payment (25%)</span>
                    <span className="text-sm font-extrabold text-slate-800">₱{downPayment.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Paid</span>
                    <span className="text-sm font-extrabold text-emerald-600">₱{totalPaid.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Remaining Balance</span>
                    <span className="text-sm font-extrabold text-rose-600">₱{remainingBalance.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Next Due Date</span>
                    <span className="text-sm font-extrabold text-amber-600 font-mono">{activePlan.nextDueDate || "Fully Paid"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Payment Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                      remainingBalance <= 0
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {remainingBalance <= 0 ? "Fully Paid" : activePlan.paymentStatus || "Partially Paid"}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Progress & Visual Percent Card */}
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
                    An email reminder will be sent automatically 2 days before each due date. 
                  </p>
                  {nextReminderDate && (
                    <span className="text-[9.5px] font-extrabold text-[#2D6A4F] bg-emerald-100/50 px-2 py-0.5 rounded-md inline-block">
                      Next Alert: {nextReminderDate}
                    </span>
                  )}
                </div>
              </Card>

            </div>

            {/* RIGHT COLUMN: Payment Schedule & History */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Payment Schedule */}
              <div className="space-y-3">
                <h3 className="font-heading text-xs font-bold text-[#1B4332] uppercase tracking-widest">Installment Due Schedule</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activePlan.paluwaganSchedule && activePlan.paluwaganSchedule.length > 0 ? (
                    activePlan.paluwaganSchedule.map((item) => {
                      const statusConfig = getInstallmentStatus(item.dueDate, item.status);
                      return (
                        <Card
                          key={item.installmentNumber}
                          className="p-4 bg-white border border-slate-200/60 rounded-2xl relative overflow-hidden flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-[#1B4332] text-xs">Installment #{item.installmentNumber}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-extrabold uppercase border ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Amount Due</span>
                              <span className="text-sm font-extrabold text-slate-800">₱{item.amountDue.toLocaleString()}</span>
                            </div>
                            <div className="text-right space-y-0.5">
                              <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Due Date</span>
                              <span className="text-xs font-bold text-slate-700 font-mono">{item.dueDate}</span>
                            </div>
                          </div>

                          {item.status === "Paid" && (
                            <div className="text-[9.5px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Paid on {item.paymentDate || "N/A"} via {item.collector || "Farm Clerk"} (REC: {item.receiptNumber})</span>
                            </div>
                          )}
                        </Card>
                      );
                    })
                  ) : (
                    <Card className="col-span-2 p-8 text-center text-xs text-slate-455 border border-slate-200/60">
                      No schedule installments generated. Contact admin regarding your Paluwagan order.
                    </Card>
                  )}
                </div>
              </div>

              {/* Payment History Log */}
              <div className="space-y-3">
                <h3 className="font-heading text-xs font-bold text-[#1B4332] uppercase tracking-widest">Collection & Payout History</h3>
                {paymentHistory.length === 0 ? (
                  <Card className="p-8 text-center text-xs text-slate-455 border border-slate-200/60">
                    No transactions registered. Complete down payment or wait for collections to post logs.
                  </Card>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px]">Receipt Number</TableHead>
                        <TableHead className="text-[10px]">Payment Date</TableHead>
                        <TableHead className="text-[10px]">Type</TableHead>
                        <TableHead className="text-[10px] text-right">Amount Paid</TableHead>
                        <TableHead className="text-[10px] text-right">Remaining Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentHistory.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {row.receiptNumber}
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-slate-600 font-mono">{row.date}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase border ${
                              row.type === "Down Payment"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}>
                              {row.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-xs font-extrabold text-slate-800 font-mono">
                            ₱{row.amountPaid.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-xs font-extrabold text-slate-800 font-mono bg-slate-50/50">
                            ₱{row.remainingBalanceAfter.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { useRole, Order, Reservation } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { 
  ShoppingBag, 
  Info, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  Eye, 
  Calendar, 
  Filter, 
  CreditCard, 
  PiggyBank, 
  Package, 
  Tag, 
  MapPin, 
  User, 
  AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UnifiedTransaction {
  id: string;
  product: string;
  orderType: "Cash" | "Reservation" | "Paluwagan";
  quantity: number;
  dateCreated: string;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  paymentReferenceNumber?: string;
  isDuplicateReference?: boolean;
  pickupDate?: string;
  deliveryOrPickup?: "Delivery" | "Pickup";
  deliveryAddress?: string;
  paymentMethod?: string;
  paymentRejectionReason?: string;
  paluwaganSchedule?: any[];
  downPayment?: number;
  remainingBalance?: number;
  customerName?: string;
  customerEmail?: string;
  rawItem: any;
}

export default function CustomerOrdersPage() {
  const { userEmail, userName, userPhone, userAddress, orders, reservations, resubmitOrderPaymentReference, checkDuplicateReferenceNumber } = useRole();

  // Active Filter Tab: "All" | "Cash Orders" | "Reservations" | "Paluwagan"
  const [activeTab, setActiveTab] = useState<"All" | "Cash Orders" | "Reservations" | "Paluwagan">("All");

  // Re-submit Reference Modal state
  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [newRefNumber, setNewRefNumber] = useState<string>("");
  const [refError, setRefError] = useState<string>("");
  const [isDuplicateRef, setIsDuplicateRef] = useState<boolean>(false);

  // View Details Modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<UnifiedTransaction | null>(null);

  // --- UNIFIED TRANSACTIONS LIST ---
  const unifiedTransactions = useMemo(() => {
    const list: UnifiedTransaction[] = [];
    const processedIds = new Set<string>();

    // 1. Add all orders for this customer
    orders.filter(o => o.customerEmail === userEmail).forEach(o => {
      processedIds.add(o.id);
      list.push({
        id: o.id,
        product: o.product,
        orderType: o.orderType || "Cash",
        quantity: o.quantity,
        dateCreated: o.dateCreated,
        totalAmount: o.totalAmount,
        paymentStatus: o.paymentStatus || "Pending Verification",
        status: o.status || "Pending Approval",
        paymentReferenceNumber: o.paymentReferenceNumber,
        isDuplicateReference: o.isDuplicateReference,
        pickupDate: o.pickupDate || o.deliveryDate,
        deliveryOrPickup: o.deliveryOrPickup || "Pickup",
        deliveryAddress: o.deliveryAddress,
        paymentMethod: o.paymentMethod,
        paymentRejectionReason: o.paymentRejectionReason,
        paluwaganSchedule: o.paluwaganSchedule,
        downPayment: o.downPayment,
        remainingBalance: o.remainingBalance,
        customerName: o.customerName || userName,
        customerEmail: o.customerEmail || userEmail,
        rawItem: o
      });
    });

    // 2. Add standalone reservations not present in orders
    reservations.filter(r => r.customerEmail === userEmail).forEach(r => {
      if (!processedIds.has(r.id)) {
        processedIds.add(r.id);

        let productDesc = r.category as string;
        if (r.category === "Piglets") productDesc = "Weanling Piglet";
        else if (r.category === "Fattening Pigs") productDesc = "Fattening Hog";
        else if (r.category === "Crispylicious Lechon") productDesc = "Crispy Lechon";
        else if (r.category === "Catering Services") productDesc = "Catering / Dessert Package";

        list.push({
          id: r.id,
          product: productDesc,
          orderType: "Reservation",
          quantity: r.quantity,
          dateCreated: r.reservationDate || new Date().toISOString().split("T")[0],
          totalAmount: r.price,
          paymentStatus: r.paymentStatus || "Pending Verification",
          status: r.status === "Pending" ? "Pending Approval" : r.status,
          paymentReferenceNumber: r.paymentReferenceNumber,
          isDuplicateReference: r.isDuplicateReference,
          pickupDate: r.pickupDate,
          paymentRejectionReason: r.paymentRejectionReason,
          customerName: r.customerName || userName,
          customerEmail: r.customerEmail || userEmail,
          rawItem: r
        });
      }
    });

    // Sort newest date first
    return list.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
  }, [orders, reservations, userEmail, userName]);

  // Filtered transactions by selected tab
  const filteredTransactions = useMemo(() => {
    return unifiedTransactions.filter(item => {
      if (activeTab === "All") return true;
      if (activeTab === "Cash Orders") return item.orderType === "Cash";
      if (activeTab === "Reservations") return item.orderType === "Reservation";
      if (activeTab === "Paluwagan") return item.orderType === "Paluwagan";
      return true;
    });
  }, [unifiedTransactions, activeTab]);

  // Helper Badge Renderers
  const getOrderTypeBadge = (type: string) => {
    switch (type) {
      case "Cash":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">Cash Order</span>;
      case "Reservation":
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">Reservation</span>;
      case "Paluwagan":
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-50 text-purple-800 border border-purple-200">Paluwagan</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-50 text-slate-700 border border-slate-200">{type}</span>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Paid</span>;
      case "Pending Verification":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100 animate-pulse flex items-center gap-1"><Clock className="w-3 h-3" /> Pending Verification</span>;
      case "Rejected":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-100 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Rejected</span>;
      case "Partially Paid":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1">Partially Paid</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
      case "Completed":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700">Completed</span>;
      case "Processing":
      case "Shipped":
      case "Ready for Pickup":
      case "Ready":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700">{status}</span>;
      case "Approved":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700">Approved</span>;
      case "Payment Verification":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-50 text-sky-700">Payment Verification</span>;
      case "Pending Approval":
      case "Pending":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700">Pending Approval</span>;
      case "Payment Failed / Action Required":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-50 text-red-700 font-black">Action Required</span>;
      case "Cancelled":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-500">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  // Re-submit Modal Handlers
  const handleOpenResubmit = (orderId: string, currentRef?: string) => {
    setSelectedOrderId(orderId);
    setNewRefNumber(currentRef || "");
    setRefError("");
    setIsDuplicateRef(false);
    setIsResubmitModalOpen(true);
  };

  const handleResubmitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRef = newRefNumber.trim();
    if (!cleanRef) {
      setRefError("Payment Reference Number is required.");
      return;
    }
    setRefError("");

    await resubmitOrderPaymentReference(selectedOrderId, cleanRef);
    setIsResubmitModalOpen(false);
    setSelectedOrderId("");
    setNewRefNumber("");
  };

  // Details Modal Handler
  const handleViewDetails = (item: UnifiedTransaction) => {
    setSelectedTransaction(item);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-900 to-[#1B4332] p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#D4AF37]" /> My Orders & Reservations Hub
          </h1>
          <p className="text-xs text-emerald-100/80 font-medium">
            Track your retail pork orders, livestock reservations, and Paluwagan installment progress in one unified portal.
          </p>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { key: "All", label: "All Transactions", count: unifiedTransactions.length },
          { key: "Cash Orders", label: "Cash Orders", count: unifiedTransactions.filter(t => t.orderType === "Cash").length },
          { key: "Reservations", label: "Reservations", count: unifiedTransactions.filter(t => t.orderType === "Reservation").length },
          { key: "Paluwagan", label: "Paluwagan", count: unifiedTransactions.filter(t => t.orderType === "Paluwagan").length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.key
                ? "bg-[#1B4332] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === tab.key ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* UNIFIED TRANSACTIONS TABLE */}
      {filteredTransactions.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs font-medium space-y-3 bg-white border border-slate-200 rounded-3xl">
          <Package className="w-10 h-10 text-slate-350 mx-auto" />
          <div className="font-heading text-sm font-bold text-slate-800">No Transactions Found</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any recorded transactions under the selected <strong>{activeTab}</strong> tab.
          </p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden border border-slate-100 bg-white rounded-3xl shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Order Type</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-mono font-bold text-xs text-slate-800">{item.id}</TableCell>
                  <TableCell className="font-bold text-xs text-slate-800 max-w-[180px] truncate" title={item.product}>
                    {item.product}
                  </TableCell>
                  <TableCell>{getOrderTypeBadge(item.orderType)}</TableCell>
                  <TableCell className="font-bold text-xs text-slate-700">{item.quantity}</TableCell>
                  <TableCell className="text-xs text-slate-500 font-medium">{item.dateCreated}</TableCell>
                  <TableCell className="font-mono font-extrabold text-xs text-slate-800">₱{item.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>{getPaymentStatusBadge(item.paymentStatus)}</TableCell>
                  <TableCell>{getOrderStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(item)}
                        className="text-[10px] font-bold uppercase px-2.5 py-1"
                      >
                        <Eye className="w-3 h-3 mr-1" /> View Details
                      </Button>

                      {(item.paymentStatus === "Rejected" || item.status === "Payment Failed / Action Required") && (
                        <Button
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase px-2.5 py-1"
                          onClick={() => handleOpenResubmit(item.id, item.paymentReferenceNumber)}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" /> Re-submit Ref
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* VIEW DETAILS MODAL */}
      <Modal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        title={`Transaction Details: ${selectedTransaction?.id}`}
      >
        {selectedTransaction && (
          <div className="space-y-4 font-sans text-xs">
            {/* Header info */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Transaction Number</span>
                <div className="font-mono text-base font-extrabold text-slate-800">{selectedTransaction.id}</div>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Category</span>
                {getOrderTypeBadge(selectedTransaction.orderType)}
              </div>
            </div>

            {/* Rejection Alert if applicable */}
            {selectedTransaction.paymentRejectionReason && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <ShieldAlert className="w-4 h-4 text-red-600" /> Admin Rejection Reason
                </div>
                <p className="text-[11px] leading-relaxed">
                  {selectedTransaction.paymentRejectionReason}
                </p>
              </div>
            )}

            {/* Duplicate reference alert */}
            {selectedTransaction.isDuplicateReference && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> Duplicate Reference Number Flag
                </div>
                <p className="text-[11px] leading-relaxed">
                  This reference code has already been submitted on another transaction. Admin review is required.
                </p>
              </div>
            )}

            {/* General Information Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-white border border-slate-200/80 rounded-2xl">
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Purchased Product</span>
                <span className="font-bold text-slate-800 text-xs">{selectedTransaction.product}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Quantity</span>
                <span className="font-bold text-slate-800 text-xs">{selectedTransaction.quantity}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Date Logged</span>
                <span className="font-bold text-slate-800 text-xs font-mono">{selectedTransaction.dateCreated}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Amount</span>
                <span className="font-mono font-extrabold text-emerald-600 text-sm">₱{selectedTransaction.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Status & Method Breakdown */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Payment Status</span>
                <div className="mt-1">{getPaymentStatusBadge(selectedTransaction.paymentStatus)}</div>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Order Status</span>
                <div className="mt-1">{getOrderStatusBadge(selectedTransaction.status)}</div>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Payment Method</span>
                <span className="font-bold text-slate-800">{selectedTransaction.paymentMethod || "Online Payment"}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Payment Reference</span>
                <span className="font-mono font-bold text-slate-800">{selectedTransaction.paymentReferenceNumber || "None"}</span>
              </div>
            </div>

            {/* Pickup / Delivery Details */}
            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2">
              <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Fulfillment & Pickup Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Fulfillment Type</span>
                  <span className="font-bold text-slate-800">{selectedTransaction.deliveryOrPickup || "Pickup"}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Target Date</span>
                  <span className="font-mono font-bold text-slate-800">{selectedTransaction.pickupDate || "Scheduled upon verification"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Delivery / Contact Address</span>
                  <span className="font-medium text-slate-700">{selectedTransaction.deliveryAddress || userAddress || "Delmar Piggery Farm Compound"}</span>
                </div>
              </div>
            </div>

            {/* Paluwagan Schedule Summary if Paluwagan order */}
            {selectedTransaction.orderType === "Paluwagan" && selectedTransaction.paluwaganSchedule && (
              <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl space-y-2">
                <h4 className="font-bold text-purple-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <PiggyBank className="w-4 h-4 text-purple-700" /> Paluwagan Installment Summary
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-purple-950">
                  <div>Down Payment: ₱{(selectedTransaction.downPayment || 0).toLocaleString()}</div>
                  <div>Remaining Balance: ₱{(selectedTransaction.remainingBalance || 0).toLocaleString()}</div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button onClick={() => setIsDetailsModalOpen(false)} className="w-full">
                Close Details
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* RE-SUBMIT PAYMENT REFERENCE MODAL */}
      <Modal isOpen={isResubmitModalOpen} onClose={() => setIsResubmitModalOpen(false)} title={`Re-submit Reference for ${selectedOrderId}`}>
        <form onSubmit={handleResubmitSubmit} className="space-y-4 font-sans text-xs">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" /> Re-submit Payment Reference
            </div>
            <p className="text-[11px] leading-relaxed">
              Your reference code was flagged or rejected by the admin. Please enter your corrected Reference Number from your mobile wallet or online bank.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 uppercase">Corrected Reference Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. ABC123456789 or GCSH-987654"
              value={newRefNumber}
              onChange={(e) => {
                setNewRefNumber(e.target.value);
                setRefError("");
                setIsDuplicateRef(checkDuplicateReferenceNumber(e.target.value, selectedOrderId));
              }}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono uppercase tracking-wider focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
            />
            {refError && <p className="text-[10px] font-bold text-red-500">{refError}</p>}
            {isDuplicateRef && (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Reference code already submitted. Flagged as DUPLICATE for Admin review.</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full">
              Submit Reference Code for Verification
            </Button>
          </div>
        </form>
      </Modal>

      {/* Support footer */}
      <div className="flex items-start gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed font-medium">
        <Info className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
        <span>For complaints regarding order packaging, weights, or payment verification status, please coordinate with our support line at 09464544973.</span>
      </div>
    </div>
  );
}

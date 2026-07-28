"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ShoppingBag, Info, ShieldAlert, Clock, CheckCircle2, RefreshCw } from "lucide-react";

export default function CustomerOrdersPage() {
  const { userEmail, orders, resubmitOrderPaymentReference, checkDuplicateReferenceNumber } = useRole();
  const customerOrders = orders.filter((o) => o.customerEmail === userEmail);

  // Resubmit Modal state
  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [newRefNumber, setNewRefNumber] = useState<string>("");
  const [refError, setRefError] = useState<string>("");
  const [isDuplicateRef, setIsDuplicateRef] = useState<boolean>(false);

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

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">My Orders Tracker</h1>
        <p className="text-xs text-slate-500 font-medium">Monitor your order status, reference numbers, and online payment verification updates.</p>
      </div>

      {customerOrders.length === 0 ? (
        <Card className="p-8 text-center text-slate-500 text-xs font-medium space-y-2">
          <ShoppingBag className="w-8 h-8 text-slate-350 mx-auto" />
          <div>No active orders found. Explore our public Products page to place retail purchases.</div>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Purchased Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Payment Reference</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-bold text-[11px] text-slate-550">{o.id}</TableCell>
                  <TableCell className="font-bold text-xs text-slate-800 max-w-[180px] truncate" title={o.product}>
                    {o.product} (x{o.quantity})
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-500">{o.orderType}</TableCell>
                  <TableCell className="text-xs font-medium text-slate-500">{o.dateCreated}</TableCell>
                  <TableCell className="font-bold text-xs text-slate-800">₱{o.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    {o.paymentReferenceNumber ? (
                      <div className="space-y-0.5">
                        <span className="font-mono text-[11px] font-bold text-slate-700">{o.paymentReferenceNumber}</span>
                        {o.isDuplicateReference && (
                          <div className="text-[9px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-sm border border-amber-200">
                            DUPLICATE FLAGGED
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                      o.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                      o.paymentStatus === "Pending Verification" ? "bg-blue-50 text-blue-700 border border-blue-100 animate-pulse" :
                      o.paymentStatus === "Rejected" ? "bg-red-50 text-red-700 border border-red-100" :
                      "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}>
                      {o.paymentStatus === "Pending Verification" && <Clock className="w-3 h-3" />}
                      {o.paymentStatus === "Paid" && <CheckCircle2 className="w-3 h-3" />}
                      {o.paymentStatus === "Rejected" && <ShieldAlert className="w-3 h-3" />}
                      {o.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      o.status === "Delivered" || o.status === "Completed" ? "bg-emerald-50 text-emerald-700" :
                      o.status === "Processing" || o.status === "Shipped" ? "bg-indigo-50 text-indigo-700" :
                      o.status === "Payment Verification" ? "bg-blue-50 text-blue-700" :
                      o.status === "Payment Failed / Action Required" ? "bg-red-50 text-red-700 font-black" :
                      "bg-amber-50 text-amber-700"
                    }`}>
                      {o.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {(o.paymentStatus === "Rejected" || o.status === "Payment Failed / Action Required") && (
                      <Button size="sm" variant="outline" onClick={() => handleOpenResubmit(o.id, o.paymentReferenceNumber)}>
                        <RefreshCw className="w-3 h-3 mr-1" /> Re-submit Ref
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Modal for Re-submitting Payment Reference */}
      <Modal isOpen={isResubmitModalOpen} onClose={() => setIsResubmitModalOpen(false)} title={`Re-submit Payment Reference for ${selectedOrderId}`}>
        <form onSubmit={handleResubmitSubmit} className="space-y-4 font-sans text-xs">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" /> Payment Verification Failed
            </div>
            <p className="text-[11px] leading-relaxed">
              Your previous payment reference could not be verified by the admin. Please enter your corrected payment Reference Number below.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 uppercase">Corrected Payment Reference Number *</label>
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
                <span>This reference code is already submitted elsewhere. It will be flagged as DUPLICATE.</span>
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

      <div className="flex items-start gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed font-medium">
        <Info className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
        <span>For complaints regarding order packaging, weights, or payment verifications, please coordinate with our support hotline at 09464544973.</span>
      </div>
    </div>
  );
}

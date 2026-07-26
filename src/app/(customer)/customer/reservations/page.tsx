"use client";

import React, { useState } from "react";
import { useRole, OrderType } from "@/context/RoleContext";
import { PIGLET_TYPES, LECHON_SIZES, CATERING_BUFFETS, SWEETS_PACKAGES, getReservationDetails } from "@/utils/pricing";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { CalendarCheck, Plus, CheckCircle2, Info } from "lucide-react";

export default function CustomerReservationsPage() {
  const { userEmail, reservations, addReservation, paluwaganBatches, paluwaganApplications } = useRole();
  const customerReservations = reservations.filter((r) => r.customerEmail === userEmail);

  // Check if customer is approved Paluwagan member
  const isApprovedMember = paluwaganApplications.some(
    (app) => app.customerEmail === userEmail && app.status === "Approved"
  );

  // Reservation dialog
  const [isOpen, setIsOpen] = useState(false);
  const [reserveCategory, setReserveCategory] = useState<"Piglets" | "Fattening Pigs" | "Crispylicious Lechon" | "Catering Services">("Piglets");
  const [reserveQty, setReserveQty] = useState(1);
  const [reserveDate, setReserveDate] = useState("");
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [pigletType, setPigletType] = useState("regular");
  const [lechonSize, setLechonSize] = useState("15kg");
  const [cateringType, setCateringType] = useState("set-a");
  const [orderType, setOrderType] = useState<OrderType>("Reservation");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");

  const getSelectedUnitPrice = () => {
    if (reserveCategory === "Piglets") {
      const type = PIGLET_TYPES.find((p) => p.key === pigletType);
      return type ? type.price : 3500;
    }
    if (reserveCategory === "Fattening Pigs") {
      return 12000;
    }
    if (reserveCategory === "Crispylicious Lechon") {
      const size = LECHON_SIZES.find((l) => l.key === lechonSize);
      return size ? size.price : 6500;
    }
    if (reserveCategory === "Catering Services") {
      if (cateringType.startsWith("set-")) {
        const buffet = CATERING_BUFFETS.find((b) => b.key === cateringType);
        return buffet ? buffet.price : 250;
      } else {
        const sweet = SWEETS_PACKAGES.find((s) => s.key === cateringType);
        return sweet ? sweet.price : 3650;
      }
    }
    return 0;
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const unitPrice = getSelectedUnitPrice();

    addReservation({
      category: reserveCategory,
      quantity: reserveQty,
      pickupDate: reserveDate || new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
      price: unitPrice * reserveQty,
      orderType,
      batchId: orderType === "Paluwagan" ? selectedBatchId : undefined,
    });

    setReserveSuccess(true);
    setTimeout(() => {
      setReserveSuccess(false);
      setIsOpen(false);
      setReserveQty(1);
      setReserveDate("");
      setOrderType("Reservation");
      setSelectedBatchId("");
    }, 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">My Reservations Hub</h1>
          <p className="text-xs text-slate-500 font-medium">Verify pending stock requests and banquet bookings.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsOpen(true)}
          className="cursor-pointer"
        >
          Book Reservation
        </Button>
      </div>

      {customerReservations.length === 0 ? (
        <Card className="p-8 text-center text-slate-500 text-xs font-medium space-y-2">
          <CalendarCheck className="w-8 h-8 text-slate-350 mx-auto" />
          <div>No active reservations found. Click 'Book Reservation' to start booking piglets or lechon.</div>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Res ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Reserved Date</TableHead>
                <TableHead>Expected Date</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Booking Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerReservations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-bold text-[11px] text-slate-550">{r.id}</TableCell>
                  <TableCell className="font-bold text-xs text-slate-800">{getReservationDetails(r.category, r.price, r.quantity)}</TableCell>
                  <TableCell className="font-bold text-xs">{r.quantity}</TableCell>
                  <TableCell className="text-xs font-medium text-slate-550">{r.reservationDate}</TableCell>
                  <TableCell className="text-xs font-medium text-slate-500">{r.pickupDate}</TableCell>
                  <TableCell className="font-bold text-xs text-slate-850">₱{r.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                      r.status === "Approved" ? "bg-emerald-50 text-emerald-600" :
                      r.status === "Pending" ? "bg-amber-50 text-amber-600" :
                      r.status === "Declined" ? "bg-red-50 text-red-650" :
                      "bg-slate-100 text-slate-555"
                    }`}>
                      {r.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <div className="flex items-start gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed font-medium">
        <Info className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
        <span>Reservations require 50% deposit within 48 hours of approval. Our coordinator will contact you to send GCash/Bank account invoices.</span>
      </div>

      {/* Booking Form Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Reserve Stock / Food Package">
        {reserveSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <h4 className="font-heading text-base font-bold text-slate-800">Booking Saved!</h4>
            <p className="text-xs text-slate-500 font-medium">Your simulated reservation is successfully recorded.</p>
          </div>
        ) : (
          <form onSubmit={handleCreateReservation} className="space-y-4 font-sans text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Product / Service Category</label>
              <select
                value={reserveCategory}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setReserveCategory(val);
                  if (val !== "Crispylicious Lechon" && orderType === "Paluwagan") {
                    setOrderType("Reservation");
                  }
                }}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="Piglets">Weanling Piglets (Weanlings & Breeders)</option>
                <option value="Fattening Pigs">Fattening Pigs (₱12,000/head)</option>
                <option value="Crispylicious Lechon">Crispylicious Lechon (charcoal roasted)</option>
                <option value="Catering Services">Catering Services & Dessert Packages</option>
              </select>
            </div>

            {/* Sub-type selections */}
            {reserveCategory === "Piglets" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Piglet Sub-Type</label>
                <select
                  value={pigletType}
                  onChange={(e) => setPigletType(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                >
                  {PIGLET_TYPES.map((type) => (
                    <option key={type.key} value={type.key}>
                      {type.label} (₱{type.price.toLocaleString()}/head)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {reserveCategory === "Crispylicious Lechon" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Lechon Size / Weight Tiers</label>
                <select
                  value={lechonSize}
                  onChange={(e) => setLechonSize(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                >
                  {LECHON_SIZES.map((size) => (
                    <option key={size.key} value={size.key}>
                      {size.label} (₱{size.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {reserveCategory === "Catering Services" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Catering / Sweets Package Selection</label>
                <select
                  value={cateringType}
                  onChange={(e) => setCateringType(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                >
                  <optgroup label="Buffet Packages (price per pax, min. 50 pax)">
                    {CATERING_BUFFETS.map((buffet) => (
                      <option key={buffet.key} value={buffet.key}>
                        {buffet.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Sweets Packages (price per package set)">
                    {SWEETS_PACKAGES.map((sweet) => (
                      <option key={sweet.key} value={sweet.key}>
                        {sweet.label} (₱{sweet.price.toLocaleString()})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">
                {reserveCategory === "Catering Services" && cateringType.startsWith("set-") 
                  ? "Number of Pax / Guests (Quantity)" 
                  : "Quantity Needed"}
              </label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={reserveQty}
                onChange={(e) => setReserveQty(parseInt(e.target.value) || 1)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Pickup / Event Schedule</label>
              <input
                type="date"
                required
                value={reserveDate}
                onChange={(e) => setReserveDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Order Type / Payment Method</label>
              <select
                value={orderType}
                onChange={(e) => {
                  const val = e.target.value as OrderType;
                  setOrderType(val);
                  if (val === "Paluwagan" && paluwaganBatches.length > 0 && !selectedBatchId) {
                    setSelectedBatchId(paluwaganBatches[0].id);
                  }
                }}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="Reservation">Reservation (Standard 50% downpayment)</option>
                <option value="Cash">Cash (Full payout)</option>
                {reserveCategory === "Crispylicious Lechon" && (
                  <option value="Paluwagan" disabled={!isApprovedMember}>
                    Paluwagan (rotating bi-weekly savings) {!isApprovedMember ? " - (Approved members only)" : ""}
                  </option>
                )}
              </select>
              {reserveCategory === "Crispylicious Lechon" && !isApprovedMember && (
                <span className="text-[10px] text-rose-600 font-bold block mt-1">
                  Paluwagan is available only for approved Paluwagan members.
                </span>
              )}
            </div>

            {orderType === "Paluwagan" && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Paluwagan Batch Selection</label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-[#1B4332]/20"
                >
                  <option value="" disabled>-- Select Paluwagan Batch --</option>
                  {paluwaganBatches.filter(b => b.status === "Active").map(batch => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name} (Starts: {batch.startDate})
                    </option>
                  ))}
                </select>
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
                  <div className="text-[10.5px] font-bold text-emerald-800 uppercase">Paluwagan Payment Preview</div>
                  <div className="text-[10px] text-slate-550 font-semibold leading-relaxed">
                    • **25% Down Payment:** ₱{(getSelectedUnitPrice() * reserveQty * 0.25).toLocaleString()}  
                    • **Installment (x4 every 15 days):** ₱{(getSelectedUnitPrice() * reserveQty * 0.75 / 4).toLocaleString()}  
                    • **Schedule:** Created automatically upon admin approval.
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between font-bold text-slate-700">
              <span>Unit Cost: ₱{getSelectedUnitPrice().toLocaleString()}</span>
              <span>Total Cost: ₱{(getSelectedUnitPrice() * reserveQty).toLocaleString()}</span>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full">
                Place Reservation
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}

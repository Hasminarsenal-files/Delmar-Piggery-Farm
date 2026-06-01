"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { CalendarCheck, Plus, CheckCircle2, Info } from "lucide-react";

export default function CustomerReservationsPage() {
  const { userEmail, reservations, addReservation } = useRole();
  const customerReservations = reservations.filter((r) => r.customerEmail === userEmail);

  // Reservation dialog
  const [isOpen, setIsOpen] = useState(false);
  const [reserveCategory, setReserveCategory] = useState<"Piglets" | "Fattening Pigs" | "Crispylicious Lechon" | "Catering Services">("Piglets");
  const [reserveQty, setReserveQty] = useState(1);
  const [reserveDate, setReserveDate] = useState("");
  const [reserveSuccess, setReserveSuccess] = useState(false);

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const priceMap = {
      "Piglets": 3500,
      "Fattening Pigs": 12000,
      "Crispylicious Lechon": 8500,
      "Catering Services": 15000,
    };

    addReservation({
      category: reserveCategory,
      quantity: reserveQty,
      pickupDate: reserveDate || new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
      price: priceMap[reserveCategory] * reserveQty,
    });

    setReserveSuccess(true);
    setTimeout(() => {
      setReserveSuccess(false);
      setIsOpen(false);
      setReserveQty(1);
      setReserveDate("");
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
                  <TableCell className="font-bold text-xs text-slate-800">{r.category}</TableCell>
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
                onChange={(e) => setReserveCategory(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="Piglets">Weanling Piglets (₱3,500/head)</option>
                <option value="Fattening Pigs">Fattening Pigs (₱12,000/head)</option>
                <option value="Crispylicious Lechon">Crispylicious Lechon (₱8,500/order)</option>
                <option value="Catering Services">Catering Services (₱15,000/booking)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Quantity Needed</label>
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

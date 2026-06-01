"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { ShoppingBag, CalendarCheck, Bell, User, Plus, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

export default function CustomerDashboard() {
  const { userName, userEmail, orders, reservations, notifications, addReservation } = useRole();
  
  // Simulated stats
  const customerOrders = orders.filter((o) => o.customerEmail === userEmail);
  const customerReservations = reservations.filter((r) => r.customerEmail === userEmail);
  const activeReservations = customerReservations.filter((r) => r.status === "Pending" || r.status === "Approved");
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  // Reservation dialog
  const [isReserveOpen, setIsReserveOpen] = useState(false);
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
      setIsReserveOpen(false);
      setReserveQty(1);
      setReserveDate("");
    }, 2000);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-750 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-md">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading">Welcome back, {userName}!</h1>
          <p className="text-xs text-slate-350 font-medium">Track your livestock deliveries and booking timelines from Delmar Piggery finest breed farm.</p>
        </div>
        <Button
          variant="secondary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          className="bg-accent-light hover:bg-accent-light/90 shrink-0 cursor-pointer"
          onClick={() => setIsReserveOpen(true)}
        >
          New Reservation
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">My Total Orders</h4>
            <div className="text-xl font-extrabold text-slate-800">{customerOrders.length} Completed</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Reservations</h4>
            <div className="text-xl font-extrabold text-slate-800">{activeReservations.length} Pending Approval</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl text-red-650">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unread Alerts</h4>
            <div className="text-xl font-extrabold text-slate-800">{unreadNotifs} System Updates</div>
          </div>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Reservations table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider">My Reservations</h3>
            <Link href="/customer/reservations" className="text-xs text-primary-600 font-bold hover:underline">
              View All
            </Link>
          </div>
          
          <Card className="p-0 overflow-hidden">
            {customerReservations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-medium">
                No reservations logged. Click 'New Reservation' to add one.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Pickup Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerReservations.slice(0, 3).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-bold text-[11px] text-slate-550">{r.id}</TableCell>
                      <TableCell className="font-bold text-xs text-slate-800">{r.category}</TableCell>
                      <TableCell className="font-bold text-xs">{r.quantity}</TableCell>
                      <TableCell className="text-xs font-medium text-slate-500">{r.pickupDate}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                          r.status === "Approved" ? "bg-emerald-50 text-emerald-600" :
                          r.status === "Pending" ? "bg-amber-50 text-amber-600" :
                          "bg-slate-100 text-slate-555"
                        }`}>
                          {r.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>

        {/* Orders List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider">My Orders</h3>
            <Link href="/customer/orders" className="text-xs text-primary-600 font-bold hover:underline">
              View All
            </Link>
          </div>

          <Card className="p-5 space-y-4">
            {customerOrders.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-4 font-medium">No order history available.</div>
            ) : (
              <div className="space-y-3">
                {customerOrders.slice(0, 2).map((o) => (
                  <div key={o.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-1 overflow-hidden">
                      <div className="font-bold text-slate-800 truncate">{o.items}</div>
                      <span className="text-[10px] text-slate-450 font-bold block">{o.orderDate} | ₱{o.totalAmount.toLocaleString()}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold shrink-0 ${
                      o.status === "Delivered" ? "bg-emerald-50 text-emerald-600" :
                      o.status === "Processing" ? "bg-indigo-50 text-indigo-600" :
                      "bg-amber-50 text-amber-600"
                    }`}>
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* Reservation Modal */}
      <Modal isOpen={isReserveOpen} onClose={() => setIsReserveOpen(false)} title="Simulate Customer Reservation">
        {reserveSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <h4 className="font-heading text-base font-bold text-slate-800">Reservation Placed!</h4>
            <p className="text-xs text-slate-500 font-medium">Successfully logged. The reservation lists will update instantly.</p>
          </div>
        ) : (
          <form onSubmit={handleCreateReservation} className="space-y-4 text-xs font-sans">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Product Category</label>
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
              <label className="text-[10px] font-bold text-slate-700 uppercase">Preferred Pickup Date</label>
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

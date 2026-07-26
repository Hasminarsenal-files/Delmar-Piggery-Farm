"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { 
  Utensils, 
  Search, 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Coins,
  Sparkles
} from "lucide-react";

interface CateringRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  eventDate: string;
  eventType: string;
  venueAddress: string;
  packageSet: "Set A" | "Set B" | "Set C";
  guestCount: number;
  pricePerPax: number;
  totalAmount: number;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
}

export default function CateringPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [bookings, setBookings] = useState<CateringRecord[]>([
    { id: "CAT-301", customerName: "Maria Santos", customerPhone: "0917-234-5678", eventDate: "2026-07-22", eventType: "50th Birthday Party", venueAddress: "Brgy. Valenzuela, Cabanatuan City", packageSet: "Set A", guestCount: 50, pricePerPax: 250, totalAmount: 12500, status: "Confirmed" },
    { id: "CAT-302", customerName: "Lita Mendoza", customerPhone: "0918-765-4321", eventDate: "2026-07-26", eventType: "Family Swearing-In", venueAddress: "Mendoza Compound, Aliaga, Nueva Ecija", packageSet: "Set C", guestCount: 100, pricePerPax: 340, totalAmount: 34000, status: "Pending" },
    { id: "CAT-303", customerName: "Juan Dela Cruz", customerPhone: "0922-111-2222", eventDate: "2026-07-10", eventType: "Swine Seminar Lunch", venueAddress: "Piggery Hub Hall, Cabanatuan City", packageSet: "Set B", guestCount: 40, pricePerPax: 290, totalAmount: 11600, status: "Completed" },
  ]);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    eventDate: "",
    eventType: "Birthday Party",
    venueAddress: "",
    packageSet: "Set A" as CateringRecord["packageSet"],
    guestCount: 50,
  });

  const totalBookingsCount = bookings.length;
  const activeBookingsCount = bookings.filter(b => b.status === "Confirmed").length;
  const totalPaxServed = bookings.filter(b => b.status !== "Cancelled").reduce((acc, curr) => acc + curr.guestCount, 0);
  const totalRevenue = bookings.filter(b => b.status === "Completed" || b.status === "Confirmed").reduce((acc, curr) => acc + curr.totalAmount, 0);

  const filteredBookings = bookings.filter(book => {
    const matchesSearch = book.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.venueAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || book.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.eventDate || !form.venueAddress) return;

    let price = 250;
    if (form.packageSet === "Set B") price = 290;
    else if (form.packageSet === "Set C") price = 340;

    const total = form.guestCount * price;
    const newBooking: CateringRecord = {
      id: `CAT-${301 + bookings.length}`,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      eventDate: form.eventDate,
      eventType: form.eventType,
      venueAddress: form.venueAddress,
      packageSet: form.packageSet,
      guestCount: Number(form.guestCount),
      pricePerPax: price,
      totalAmount: total,
      status: "Pending"
    };

    setBookings([newBooking, ...bookings]);
    setSuccessMsg("Catering booking recorded successfully!");
    setTimeout(() => {
      setSuccessMsg("");
      setIsAddOpen(false);
      setForm({
        customerName: "",
        customerPhone: "",
        eventDate: "",
        eventType: "Birthday Party",
        venueAddress: "",
        packageSet: "Set A",
        guestCount: 50,
      });
    }, 1500);
  };

  const handleUpdateStatus = (id: string, status: CateringRecord["status"]) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1.5 z-10">
          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/5">
            Savorlicious Unit
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-400" />
            Catering Bookings Console
          </h1>
          <p className="text-xs text-emerald-100/80 font-medium">Log event dates, package sets buffet lines pricing details, venues, and catering staff status.</p>
        </div>
        <Button 
          onClick={() => setIsAddOpen(true)}
          className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-900 border-none font-bold text-xs py-2 px-4 rounded-xl shadow-md z-10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Catering Event
        </Button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Consolidated Revenue</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-emerald-600">₱{totalRevenue.toLocaleString()}</div>
          <p className="text-[9px] font-semibold text-slate-405 dark:text-slate-500 mt-1">Confirmed + completed events</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Active Catering Events</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-blue-600">{activeBookingsCount} Events</div>
          <p className="text-[9px] font-semibold text-[#52b788] mt-1">Awaiting kitchen dispatch</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Guests Served</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">{totalPaxServed} Pax</div>
          <p className="text-[9px] font-semibold text-[#D4AF37] mt-1">Accumulated guest count</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Bookings Registered</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">{totalBookingsCount} Events</div>
          <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Historical bookings archive</p>
        </Card>
      </div>

      {/* Toolbar Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0f1412] p-4 border border-slate-150 dark:border-[#182620] rounded-2xl shadow-2xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search venue, customer, event details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 dark:border-emerald-950 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-slate-50 dark:bg-[#070a09] font-medium"
          />
        </div>

        <div className="flex gap-2">
          {["All", "Pending", "Confirmed", "Completed", "Cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === tab
                  ? "bg-[#1B4332] text-white"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-650 dark:bg-emerald-950/20 dark:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filteredBookings.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 text-xs font-semibold">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          No catering event bookings found matching search filter.
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden border border-slate-150 dark:border-[#182620]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Event Date</TableHead>
                <TableHead>Event Type / Description</TableHead>
                <TableHead>Venue Address Location</TableHead>
                <TableHead>Package Set</TableHead>
                <TableHead>Guest Count</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-mono text-xs font-bold text-slate-650">{book.id}</TableCell>
                  <TableCell>
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-100">{book.customerName}</div>
                    <span className="text-[10px] text-slate-450 font-bold block mt-0.5">{book.customerPhone}</span>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-850 dark:text-slate-350 font-mono">{book.eventDate}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-800 dark:text-slate-100">{book.eventType}</TableCell>
                  <TableCell className="text-xs font-semibold text-slate-600 dark:text-slate-400 max-w-[180px] truncate" title={book.venueAddress}>
                    {book.venueAddress}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-emerald-50 text-emerald-800 font-mono">
                      {book.packageSet}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-800">{book.guestCount} pax</TableCell>
                  <TableCell className="text-xs font-extrabold text-slate-800 font-mono">₱{book.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[9.5px] font-extrabold uppercase ${
                      book.status === "Completed" ? "bg-emerald-50 text-emerald-600" :
                      book.status === "Confirmed" ? "bg-blue-50 text-blue-600" :
                      book.status === "Cancelled" ? "bg-slate-150 text-slate-500" :
                      "bg-amber-50 text-amber-600 animate-pulse"
                    }`}>
                      {book.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1 whitespace-nowrap">
                    {book.status === "Pending" && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => handleUpdateStatus(book.id, "Confirmed")} className="bg-emerald-700 text-white font-bold py-1">
                          Confirm Event
                        </Button>
                        <Button size="sm" variant="light" onClick={() => handleUpdateStatus(book.id, "Cancelled")} className="text-red-500">
                          Cancel
                        </Button>
                      </>
                    )}
                    {book.status === "Confirmed" && (
                      <Button size="sm" variant="secondary" onClick={() => handleUpdateStatus(book.id, "Completed")} className="bg-emerald-700 text-white py-1">
                        Complete Event
                      </Button>
                    )}
                    {book.status === "Completed" && (
                      <span className="text-[10px] text-slate-400 font-bold">Transaction Closed</span>
                    )}
                    {book.status === "Cancelled" && (
                      <span className="text-[10px] text-red-505 font-bold">Cancelled</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add Booking Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Log Catering Service Booking">
        <form onSubmit={handleAddBooking} className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Customer Full Name</label>
              <input
                type="text"
                required
                placeholder="Juan Cruz"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Contact Number</label>
              <input
                type="text"
                required
                placeholder="0917-XXX-XXXX"
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Event Date</label>
              <input
                type="date"
                required
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Event Type Description</label>
              <input
                type="text"
                required
                placeholder="e.g. Debut, Anniversary"
                value={form.eventType}
                onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Event Venue Address</label>
              <input
                type="text"
                required
                placeholder="Brgy. Hall, Cabanatuan"
                value={form.venueAddress}
                onChange={(e) => setForm({ ...form, venueAddress: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Select Buffet Set Package</label>
              <select
                value={form.packageSet}
                onChange={(e) => setForm({ ...form, packageSet: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold text-emerald-800"
              >
                <option value="Set A">Buffet Set A (₱250/pax)</option>
                <option value="Set B">Buffet Set B (₱290/pax)</option>
                <option value="Set C">Buffet Set C (₱340/pax)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Guest Count (Pax)</label>
              <input
                type="number"
                min="20"
                value={form.guestCount}
                onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 font-bold">
            Consolidated Invoice Total: ₱{(form.guestCount * (form.packageSet === "Set A" ? 250 : form.packageSet === "Set B" ? 290 : 340)).toLocaleString()}
          </div>

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="light" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1B4332] text-white">
              Log Catering Booking
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

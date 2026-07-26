"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { 
  Truck, 
  MapPin, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck,
  Compass
} from "lucide-react";

interface DeliveryRecord {
  id: string;
  orderId: string;
  customerName: string;
  deliveryAddress: string;
  deliveryDate: string;
  riderName: string;
  status: "Pending" | "Dispatched" | "Delivered" | "Failed";
  totalAmount: number;
}

export default function DeliveriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignedRider, setAssignedRider] = useState("Juan dela Cruz");
  const [successMsg, setSuccessMsg] = useState("");

  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([
    { id: "DLV-401", orderId: "ORD-9021", customerName: "Maria Santos", deliveryAddress: "45 Rizal St, Aliaga, Nueva Ecija", deliveryDate: "2026-07-16", riderName: "Reynaldo Diaz", status: "Delivered", totalAmount: 6400 },
    { id: "DLV-402", orderId: "ORD-9022", customerName: "John Doe", deliveryAddress: "123 Mahogany St, Cabanatuan City", deliveryDate: "2026-07-20", riderName: "Pending Assignment", status: "Pending", totalAmount: 13500 },
    { id: "DLV-403", orderId: "ORD-9023", customerName: "Juan Dela Cruz", deliveryAddress: "77 Mabini St, Santa Rosa, Nueva Ecija", deliveryDate: "2026-07-18", riderName: "Reynaldo Diaz", status: "Dispatched", totalAmount: 12500 },
  ]);

  const totalDeliveriesCount = deliveries.length;
  const activeDispatches = deliveries.filter(d => d.status === "Dispatched").length;
  const completedCount = deliveries.filter(d => d.status === "Delivered").length;
  const pendingAssignCount = deliveries.filter(d => d.riderName === "Pending Assignment").length;

  const filteredDeliveries = deliveries.filter(del => {
    const matchesSearch = del.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          del.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          del.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          del.riderName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || del.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAssign = (del: DeliveryRecord) => {
    setSelectedDelivery(del);
    setAssignedRider(del.riderName === "Pending Assignment" ? "Reynaldo Diaz" : del.riderName);
    setIsAssignOpen(true);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelivery) return;

    setDeliveries(deliveries.map(d => d.id === selectedDelivery.id ? {
      ...d,
      riderName: assignedRider,
      status: d.status === "Pending" ? "Dispatched" : d.status
    } : d));

    setSuccessMsg("Delivery rider dispatched successfully!");
    setTimeout(() => {
      setSuccessMsg("");
      setIsAssignOpen(false);
    }, 1500);
  };

  const handleUpdateStatus = (id: string, status: DeliveryRecord["status"]) => {
    setDeliveries(deliveries.map(d => d.id === id ? { ...d, status } : d));
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
            <Truck className="w-5 h-5 text-emerald-400" />
            Order Deliveries Log
          </h1>
          <p className="text-xs text-emerald-100/80 font-medium">Dispatch fresh pork cuts and crispy lechons, assign riders, and monitor delivery locations.</p>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Scheduled Deliveries</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">{totalDeliveriesCount} Drops</div>
          <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">All cataloged runs</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Active Transit Dispatches</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-blue-600">{activeDispatches} In Transit</div>
          <p className="text-[9px] font-semibold text-[#52b788] mt-1">Riders on the road</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Successful Handovers</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-emerald-600">{completedCount} Delivered</div>
          <p className="text-[9px] font-semibold text-emerald-600 mt-1">Confirmed by customers</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Awaiting Rider Assignment</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-amber-500">{pendingAssignCount} Drops</div>
          <p className="text-[9px] font-semibold text-[#D4AF37] mt-1">Pending dispatch schedules</p>
        </Card>
      </div>

      {/* Toolbar Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0f1412] p-4 border border-slate-150 dark:border-[#182620] rounded-2xl shadow-2xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search address, customer, order, rider..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 dark:border-emerald-950 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-slate-50 dark:bg-[#070a09] font-medium"
          />
        </div>

        <div className="flex gap-2">
          {["All", "Pending", "Dispatched", "Delivered", "Failed"].map((tab) => (
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
      {filteredDeliveries.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 text-xs font-semibold">
          <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          No delivery logs matching filter criteria.
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden border border-slate-150 dark:border-[#182620]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run ID</TableHead>
                <TableHead>Order Link</TableHead>
                <TableHead>Customer Details</TableHead>
                <TableHead>Delivery Location Address</TableHead>
                <TableHead>Expected Date</TableHead>
                <TableHead>Assigned Rider</TableHead>
                <TableHead>Value Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeliveries.map((del) => (
                <TableRow key={del.id}>
                  <TableCell className="font-mono text-xs font-bold text-slate-650">{del.id}</TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-[#1B4332]">{del.orderId}</TableCell>
                  <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-100">{del.customerName}</TableCell>
                  <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[200px] truncate" title={del.deliveryAddress}>
                    {del.deliveryAddress}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-505 font-mono">{del.deliveryDate}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-650">
                    <span className={del.riderName === "Pending Assignment" ? "text-red-500 font-semibold" : "text-slate-800 dark:text-slate-300"}>
                      {del.riderName}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-extrabold text-slate-800 dark:text-slate-100">₱{del.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-lg text-[9.5px] font-extrabold ${
                      del.status === "Delivered" ? "bg-emerald-50 text-emerald-600" :
                      del.status === "Dispatched" ? "bg-blue-50 text-blue-600" :
                      del.status === "Failed" ? "bg-red-50 text-red-650" :
                      "bg-amber-50 text-amber-600 animate-pulse"
                    }`}>
                      {del.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1 whitespace-nowrap">
                    {del.riderName === "Pending Assignment" ? (
                      <Button size="sm" variant="secondary" onClick={() => handleOpenAssign(del)} className="bg-emerald-700 text-white font-bold py-1">
                        Assign Dispatch
                      </Button>
                    ) : (
                      <>
                        {del.status === "Dispatched" && (
                          <Button size="sm" variant="secondary" onClick={() => handleUpdateStatus(del.id, "Delivered")} className="bg-emerald-700 text-white py-1">
                            Arrived / Done
                          </Button>
                        )}
                        <Button size="sm" variant="light" onClick={() => handleOpenAssign(del)}>
                          Reassign
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Dispatch Assignment Modal */}
      <Modal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title="Swine Logistics Rider Dispatcher">
        <form onSubmit={handleAssignSubmit} className="space-y-4 py-2 text-xs">
          {selectedDelivery && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-1">
              <div className="font-bold text-slate-800">Dispatch Link: {selectedDelivery.id} ({selectedDelivery.orderId})</div>
              <div className="text-[10.5px] text-slate-500 font-semibold">Drop: {selectedDelivery.deliveryAddress}</div>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold text-slate-600">Select Swine Logistics Delivery Rider</label>
            <select
              value={assignedRider}
              onChange={(e) => setAssignedRider(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-xl font-bold text-emerald-850"
            >
              <option value="Reynaldo Diaz">Reynaldo Diaz (Motorcycle Courier)</option>
              <option value="Armando Perez">Armando Perez (L300 Utility Truck)</option>
              <option value="Juan dela Cruz">Juan dela Cruz (Farm Pickup truck)</option>
            </select>
          </div>

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="light" onClick={() => setIsAssignOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1B4332] text-white">
              Dispatch Rider
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

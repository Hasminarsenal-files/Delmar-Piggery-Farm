"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { 
  TrendingUp, 
  Search, 
  Plus, 
  Trash2, 
  Truck, 
  CheckCircle2, 
  CircleDollarSign,
  PiggyBank
} from "lucide-react";

interface PigletSale {
  id: string;
  buyerName: string;
  buyerPhone: string;
  breed: string;
  quantity: number;
  pricePerHead: number;
  totalAmount: number;
  saleDate: string;
  deliveryMethod: "Pickup" | "Delivery";
  paymentStatus: "Paid" | "Pending";
  status: "Pending Pickup" | "Completed" | "Cancelled";
}

export default function PigletSalesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [sales, setSales] = useState<PigletSale[]>([
    { id: "PS-2001", buyerName: "Karlo Ramos", buyerPhone: "0917-234-5678", breed: "Duroc", quantity: 5, pricePerHead: 3500, totalAmount: 17500, saleDate: "2026-07-05", deliveryMethod: "Pickup", paymentStatus: "Paid", status: "Completed" },
    { id: "PS-2002", buyerName: "Lita Mendoza", buyerPhone: "0918-765-4321", breed: "Landrace", quantity: 3, pricePerHead: 3500, totalAmount: 10500, saleDate: "2026-07-12", deliveryMethod: "Delivery", paymentStatus: "Pending", status: "Pending Pickup" },
    { id: "PS-2003", buyerName: "Sandro Cruz", buyerPhone: "0922-111-2222", breed: "Large White", quantity: 4, pricePerHead: 3600, totalAmount: 14400, saleDate: "2026-07-15", deliveryMethod: "Pickup", paymentStatus: "Paid", status: "Completed" },
  ]);

  const [form, setForm] = useState({
    buyerName: "",
    buyerPhone: "",
    breed: "Duroc",
    quantity: 1,
    pricePerHead: 3500,
    deliveryMethod: "Pickup" as "Pickup" | "Delivery",
    paymentStatus: "Pending" as "Paid" | "Pending",
  });

  const totalRevenue = sales.filter(s => s.status === "Completed").reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalHeadSold = sales.filter(s => s.status === "Completed").reduce((acc, curr) => acc + curr.quantity, 0);
  const pendingSalesCount = sales.filter(s => s.status === "Pending Pickup").length;

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sale.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.buyerName || !form.buyerPhone) return;

    const total = form.quantity * form.pricePerHead;
    const newSale: PigletSale = {
      id: `PS-${2001 + sales.length}`,
      buyerName: form.buyerName,
      buyerPhone: form.buyerPhone,
      breed: form.breed,
      quantity: Number(form.quantity),
      pricePerHead: Number(form.pricePerHead),
      totalAmount: total,
      saleDate: new Date().toISOString().split("T")[0],
      deliveryMethod: form.deliveryMethod,
      paymentStatus: form.paymentStatus,
      status: form.paymentStatus === "Paid" ? "Completed" : "Pending Pickup"
    };

    setSales([newSale, ...sales]);
    setSuccessMsg("Piglet sale registered successfully!");
    setTimeout(() => {
      setSuccessMsg("");
      setIsAddOpen(false);
      setForm({
        buyerName: "",
        buyerPhone: "",
        breed: "Duroc",
        quantity: 1,
        pricePerHead: 3500,
        deliveryMethod: "Pickup",
        paymentStatus: "Pending",
      });
    }, 1500);
  };

  const handleUpdateStatus = (id: string, status: PigletSale["status"]) => {
    setSales(sales.map(s => s.id === id ? {
      ...s,
      status,
      paymentStatus: status === "Completed" ? "Paid" : s.paymentStatus
    } : s));
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1.5 z-10">
          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/5">
            Piggery Unit
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Piglet Sales Tracker
          </h1>
          <p className="text-xs text-emerald-100/80 font-medium">Record live weanling and sowlet sales transactions, invoice receipts, and buyer pickups.</p>
        </div>
        <Button 
          onClick={() => setIsAddOpen(true)}
          className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-900 border-none font-bold text-xs py-2 px-4 rounded-xl shadow-md z-10 animate-pulse"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Piglet Sale
        </Button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-3 gap-5">
        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Sales Revenue</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-emerald-600">₱{totalRevenue.toLocaleString()}</div>
          <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Direct completed sales</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Live Head Sold</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">{totalHeadSold} head</div>
          <p className="text-[9px] font-semibold text-[#52b788] mt-1">Dispatched to growers</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Pending Pickups</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-amber-500">{pendingSalesCount} Orders</div>
          <p className="text-[9px] font-semibold text-[#D4AF37] mt-1">Awaiting customer collection</p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0f1412] p-4 border border-slate-150 dark:border-[#182620] rounded-2xl shadow-2xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice ID or buyer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 dark:border-emerald-950 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-slate-50 dark:bg-[#070a09] font-medium"
          />
        </div>

        <div className="flex gap-2">
          {["All", "Pending Pickup", "Completed", "Cancelled"].map((tab) => (
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
      {filteredSales.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 text-xs font-semibold">
          <CircleDollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          No piglet transactions matching filter criteria.
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden border border-slate-150 dark:border-[#182620]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Buyer Details</TableHead>
                <TableHead>Breed Sold</TableHead>
                <TableHead>Qty (Head)</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Sale Date</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Fulfillment Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                    {sale.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-100">{sale.buyerName}</div>
                    <span className="text-[10px] text-slate-450 font-bold block mt-0.5">{sale.buyerPhone}</span>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-700 dark:text-slate-300">{sale.breed}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-800 dark:text-slate-100">{sale.quantity} Head</TableCell>
                  <TableCell className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                    ₱{sale.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-500 font-mono">{sale.saleDate}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-lg text-[9.5px] font-extrabold ${
                      sale.deliveryMethod === "Pickup" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                    }`}>
                      {sale.deliveryMethod}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-lg text-[9.5px] font-extrabold ${
                      sale.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-650"
                    }`}>
                      {sale.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-lg text-[9.5px] font-extrabold ${
                      sale.status === "Completed" ? "bg-emerald-50 text-emerald-600" :
                      sale.status === "Pending Pickup" ? "bg-amber-50 text-amber-600" :
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {sale.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {sale.status === "Pending Pickup" && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => handleUpdateStatus(sale.id, "Completed")} className="bg-emerald-700 text-white border-none py-1">
                          Release Assets
                        </Button>
                        <Button size="sm" variant="light" onClick={() => handleUpdateStatus(sale.id, "Cancelled")} className="text-red-500">
                          Cancel
                        </Button>
                      </>
                    )}
                    {sale.status === "Completed" && (
                      <span className="text-[10px] text-slate-400 font-bold">Transaction Closed</span>
                    )}
                    {sale.status === "Cancelled" && (
                      <span className="text-[10px] text-red-500 font-bold">Cancelled</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Log Sale Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Log Piglet Sale Transaction">
        <form onSubmit={handleAddSale} className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Buyer Full Name</label>
              <input
                type="text"
                required
                placeholder="Juan Cruz"
                value={form.buyerName}
                onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Contact Number</label>
              <input
                type="text"
                required
                placeholder="0917-XXX-XXXX"
                value={form.buyerPhone}
                onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Breed Selection</label>
              <select
                value={form.breed}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              >
                <option value="Duroc">Duroc</option>
                <option value="Landrace">Landrace</option>
                <option value="Large White">Large White</option>
                <option value="Pietrain">Pietrain</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Quantity (Head)</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Price per Head</label>
              <input
                type="number"
                value={form.pricePerHead}
                onChange={(e) => setForm({ ...form, pricePerHead: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Fulfillment Method</label>
              <select
                value={form.deliveryMethod}
                onChange={(e) => setForm({ ...form, deliveryMethod: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold"
              >
                <option value="Pickup">Pickup at Farm</option>
                <option value="Delivery">Farm Delivery Dispatch</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Initial Payment Status</label>
              <select
                value={form.paymentStatus}
                onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold"
              >
                <option value="Pending">Pending Payment</option>
                <option value="Paid">Fully Paid Upfront</option>
              </select>
            </div>
          </div>

          <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 font-bold">
            Consolidated Invoice Total: ₱{(form.quantity * form.pricePerHead).toLocaleString()}
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
              Log Invoice Sale
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

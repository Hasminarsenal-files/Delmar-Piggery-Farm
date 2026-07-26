"use client";

import React, { useState, useMemo } from "react";
import { useRole, Order, OrderType, PaluwaganInstallment } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { 
  Search, 
  Filter, 
  Coins, 
  Calendar, 
  Truck, 
  CheckCircle2, 
  FileText,
  DollarSign,
  Plus,
  ShieldCheck,
  TrendingUp,
  XCircle,
  PiggyBank,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SavorliciousOrdersPage() {
  const { orders, updateOrder } = useRole();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All Orders");
  
  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLogInstallmentOpen, setIsLogInstallmentOpen] = useState(false);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  
  const [installmentAmount, setInstallmentAmount] = useState(1000);
  const [installmentRemarks, setInstallmentRemarks] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Add Order Form State
  const [newOrderForm, setNewOrderForm] = useState({
    customerName: "",
    customerEmail: "",
    product: "Crispy Lechon Package (Small)",
    quantity: 1,
    orderType: "Cash" as OrderType,
    totalAmount: 6500,
    deliveryOrPickup: "Pickup" as "Delivery" | "Pickup",
    paymentMethod: "Cash",
    // Reservation Fields
    reservationDate: "",
    pickupDate: "",
    deliveryDate: "",
    deliveryAddress: "",
    eventType: "Birthday",
    specialInstructions: "",
    // Paluwagan Fields
    downPayment: 1500,
    installmentAmount: 1250,
    numberOfPayments: 4,
    paymentSchedule: "Weekly" as "Weekly" | "Bi-Weekly" | "Monthly",
    nextDueDate: "",
  });

  // Filters list
  const filterOptions = [
    "All Orders", "Cash", "Reservation", "Paluwagan", 
    "Pending", "Approved", "Completed", "Cancelled"
  ];

  // Calculations for Statistics Cards
  const stats = useMemo(() => {
    let total = orders.length;
    let cashSales = orders
      .filter(o => o.orderType === "Cash" && o.status === "Completed")
      .reduce((sum, o) => sum + o.totalAmount, 0);
    
    let activeReservations = orders
      .filter(o => o.orderType === "Reservation" && o.status === "Approved")
      .length;

    let paluwaganCollections = orders
      .filter(o => o.orderType === "Paluwagan")
      .reduce((sum, o) => {
        const paidLog = o.installmentsLog?.reduce((s, inst) => s + inst.amount, 0) || 0;
        return sum + paidLog;
      }, 0);

    let paluwaganOutstanding = orders
      .filter(o => o.orderType === "Paluwagan" && o.status !== "Cancelled")
      .reduce((sum, o) => sum + (o.remainingBalance || 0), 0);

    return { total, cashSales, activeReservations, paluwaganCollections, paluwaganOutstanding };
  }, [orders]);

  // Filtered Orders List
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            o.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            o.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      if (activeFilter === "All Orders") return true;
      if (activeFilter === "Cash" || activeFilter === "Reservation" || activeFilter === "Paluwagan") {
        return o.orderType === activeFilter;
      }
      return o.status === activeFilter;
    });
  }, [orders, searchTerm, activeFilter]);

  // Handlers
  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleOpenLogInstallment = (order: Order) => {
    setSelectedOrder(order);
    setInstallmentAmount(order.installmentAmount || 1000);
    setInstallmentRemarks(`Payment for installment`);
    setIsLogInstallmentOpen(true);
  };

  const handleLogInstallmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const amount = Number(installmentAmount);
    const newInstallment: PaluwaganInstallment = {
      date: new Date().toISOString().split("T")[0],
      amount: amount,
      remarks: installmentRemarks
    };

    const updatedLog = [...(selectedOrder.installmentsLog || []), newInstallment];
    const updatedBalance = Math.max(0, (selectedOrder.remainingBalance || 0) - amount);
    
    // Automatically transition payment status
    let payStatus: Order["paymentStatus"] = selectedOrder.paymentStatus;
    if (updatedBalance <= 0) {
      payStatus = "Paid";
    } else {
      payStatus = "Partially Paid";
    }

    const nextDue = new Date();
    if (selectedOrder.paymentSchedule === "Weekly") nextDue.setDate(nextDue.getDate() + 7);
    else if (selectedOrder.paymentSchedule === "Bi-Weekly") nextDue.setDate(nextDue.getDate() + 14);
    else nextDue.setDate(nextDue.getMonth() + 1);

    const nextDueStr = nextDue.toISOString().split("T")[0];

    const ok = await updateOrder(selectedOrder.id, {
      remainingBalance: updatedBalance,
      installmentsLog: updatedLog,
      paymentStatus: payStatus,
      nextDueDate: updatedBalance <= 0 ? undefined : nextDueStr,
      status: updatedBalance <= 0 ? "Completed" : selectedOrder.status
    });

    if (ok) {
      setSuccessMsg("Installment payment recorded successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        setIsLogInstallmentOpen(false);
      }, 1500);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `ORD-${Math.floor(9000 + Math.random() * 999)}`;
    const today = new Date().toISOString().split("T")[0];

    let payStatus: Order["paymentStatus"] = "Pending";
    let remBal = newOrderForm.totalAmount;
    let initialLogs: PaluwaganInstallment[] = [];

    if (newOrderForm.orderType === "Paluwagan") {
      remBal = newOrderForm.totalAmount - newOrderForm.downPayment;
      initialLogs = [{ date: today, amount: newOrderForm.downPayment, remarks: "Down Payment" }];
      payStatus = "Partially Paid";
    } else if (newOrderForm.paymentMethod === "GCash" || newOrderForm.paymentMethod === "Paid") {
      payStatus = "Paid";
      remBal = 0;
    }

    const payload: Order = {
      id: newId,
      customerName: newOrderForm.customerName,
      customerEmail: newOrderForm.customerEmail,
      product: newOrderForm.product,
      quantity: Number(newOrderForm.quantity),
      orderType: newOrderForm.orderType,
      totalAmount: Number(newOrderForm.totalAmount),
      paymentStatus: payStatus,
      status: newOrderForm.orderType === "Paluwagan" ? "Pending" : "Approved",
      dateCreated: today,
      // Cash
      deliveryOrPickup: newOrderForm.deliveryOrPickup,
      paymentMethod: newOrderForm.paymentMethod,
      // Reservation
      reservationDate: newOrderForm.orderType === "Reservation" ? newOrderForm.reservationDate : undefined,
      pickupDate: newOrderForm.orderType === "Reservation" ? newOrderForm.pickupDate : undefined,
      deliveryDate: newOrderForm.orderType === "Reservation" ? newOrderForm.deliveryDate : undefined,
      deliveryAddress: newOrderForm.orderType === "Reservation" ? newOrderForm.deliveryAddress : undefined,
      eventType: newOrderForm.orderType === "Reservation" ? newOrderForm.eventType : undefined,
      specialInstructions: newOrderForm.orderType === "Reservation" ? newOrderForm.specialInstructions : undefined,
      // Paluwagan
      downPayment: newOrderForm.orderType === "Paluwagan" ? newOrderForm.downPayment : undefined,
      remainingBalance: newOrderForm.orderType === "Paluwagan" ? remBal : undefined,
      installmentAmount: newOrderForm.orderType === "Paluwagan" ? newOrderForm.installmentAmount : undefined,
      numberOfPayments: newOrderForm.orderType === "Paluwagan" ? newOrderForm.numberOfPayments : undefined,
      paymentSchedule: newOrderForm.orderType === "Paluwagan" ? newOrderForm.paymentSchedule : undefined,
      nextDueDate: newOrderForm.orderType === "Paluwagan" ? newOrderForm.nextDueDate : undefined,
      installmentsLog: newOrderForm.orderType === "Paluwagan" ? initialLogs : undefined,
    };

    // Use general context order addition logic by updating context state
    orders.unshift(payload);
    
    setSuccessMsg("Food services order logged successfully!");
    setTimeout(() => {
      setSuccessMsg("");
      setIsAddOrderOpen(false);
      setNewOrderForm({
        customerName: "",
        customerEmail: "",
        product: "Crispy Lechon Package (Small)",
        quantity: 1,
        orderType: "Cash",
        totalAmount: 6500,
        deliveryOrPickup: "Pickup",
        paymentMethod: "Cash",
        reservationDate: "",
        pickupDate: "",
        deliveryDate: "",
        deliveryAddress: "",
        eventType: "Birthday",
        specialInstructions: "",
        downPayment: 1500,
        installmentAmount: 1250,
        numberOfPayments: 4,
        paymentSchedule: "Weekly",
        nextDueDate: "",
      });
    }, 1500);
  };

  const handleUpdateOrderStatus = async (id: string, status: Order["status"], paymentStatus?: Order["paymentStatus"]) => {
    await updateOrder(id, {
      status,
      ...(paymentStatus ? { paymentStatus } : {})
    });
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
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white">Food Orders Dispatcher</h1>
          <p className="text-xs text-emerald-100/80 font-medium">Consolidated management of Savorlicious Cash, Reservation, and Paluwagan installment programs.</p>
        </div>
        <Button 
          onClick={() => setIsAddOrderOpen(true)}
          className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-900 border-none font-bold text-xs py-2 px-4 rounded-xl shadow-md z-10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Food Order
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4.5">
        <Card className="p-4 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Food Orders</div>
          <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-2">{stats.total} Orders</div>
          <p className="text-[9px] font-semibold text-slate-405 dark:text-slate-500 mt-0.5">All order types</p>
        </Card>

        <Card className="p-4 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Completed Cash Sales</div>
          <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-emerald-600">₱{stats.cashSales.toLocaleString()}</div>
          <p className="text-[9px] font-semibold text-slate-405 mt-0.5">Instant cash checkout</p>
        </Card>

        <Card className="p-4 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active Reservations</div>
          <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-blue-600">{stats.activeReservations} Booked</div>
          <p className="text-[9px] font-semibold text-slate-405 mt-0.5">Approved and waiting prep</p>
        </Card>

        <Card className="p-4 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Paluwagan Collections</div>
          <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-[#D4AF37]">₱{stats.paluwaganCollections.toLocaleString()}</div>
          <p className="text-[9px] font-semibold text-slate-405 mt-0.5">Installments collected</p>
        </Card>

        <Card className="p-4 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Paluwagan</div>
          <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-red-500">₱{stats.paluwaganOutstanding.toLocaleString()}</div>
          <p className="text-[9px] font-semibold text-slate-405 mt-0.5">Active receivable balances</p>
        </Card>
      </div>

      {/* Toolbar Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0f1412] p-4 border border-slate-150 dark:border-[#182620] rounded-2xl shadow-2xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, product, order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 dark:border-emerald-950 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-slate-50 dark:bg-[#070a09] font-medium"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto w-full sm:w-auto">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setActiveFilter(opt)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase whitespace-nowrap cursor-pointer transition-colors ${
                activeFilter === opt
                  ? "bg-[#1B4332] text-white"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-650 dark:bg-emerald-950/20 dark:text-slate-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 text-xs font-semibold">
          <XCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          No food service orders found matching criteria.
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden border border-slate-150 dark:border-[#182620]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer Details</TableHead>
                <TableHead>Products Ordered</TableHead>
                <TableHead>Order Type</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Fulfillment Status</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((o) => {
                const paidAmt = o.installmentsLog?.reduce((s, i) => s + i.amount, 0) || 0;
                const progress = o.orderType === "Paluwagan" ? Math.round((paidAmt / o.totalAmount) * 100) : 100;
                
                return (
                  <TableRow key={o.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-slate-650">{o.id}</TableCell>
                    <TableCell>
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100">{o.customerName}</div>
                      <span className="text-[10px] text-slate-450 font-bold block mt-0.5">{o.customerEmail}</span>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-xs text-slate-800 truncate max-w-[160px]" title={o.product}>
                        {o.product}
                      </div>
                      <span className="text-[9.5px] text-slate-400 font-semibold block mt-0.5">Quantity: {o.quantity} pcs</span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9.5px] font-extrabold ${
                        o.orderType === "Cash" ? "bg-emerald-50 text-emerald-850 dark:bg-emerald-950/20" :
                        o.orderType === "Reservation" ? "bg-blue-50 text-blue-700 dark:bg-blue-955/20" :
                        "bg-amber-50 text-amber-800 dark:bg-amber-955/20"
                      }`}>
                        {o.orderType}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-xs text-slate-800 font-mono">
                      ₱{o.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <span className={`px-2 py-0.5 rounded-lg text-[9.5px] font-extrabold ${
                          o.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-600" :
                          o.paymentStatus === "Partially Paid" ? "bg-amber-50 text-amber-600" :
                          "bg-red-50 text-red-650"
                        }`}>
                          {o.paymentStatus}
                        </span>
                        {o.orderType === "Paluwagan" && (
                          <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: `${progress}%` }} />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-lg text-[9.5px] font-extrabold ${
                        o.status === "Completed" || o.status === "Delivered" ? "bg-emerald-50 text-emerald-600" :
                        o.status === "Approved" || o.status === "Shipped" ? "bg-blue-50 text-blue-600" :
                        o.status === "Cancelled" ? "bg-slate-150 text-slate-500" :
                        "bg-amber-50 text-amber-600"
                      }`}>
                        {o.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-500 font-mono">{o.dateCreated}</TableCell>
                    <TableCell className="text-right space-x-1 whitespace-nowrap">
                      <Button size="sm" variant="light" onClick={() => handleOpenDetails(o)}>
                        Details
                      </Button>
                      
                      {o.orderType === "Paluwagan" && o.status !== "Completed" && o.status !== "Cancelled" && (
                        <Button size="sm" variant="secondary" onClick={() => handleOpenLogInstallment(o)} className="bg-emerald-700 text-white font-bold py-1">
                          Log Installment
                        </Button>
                      )}

                      {o.status === "Pending" && (
                        <Button size="sm" variant="outline" onClick={() => handleUpdateOrderStatus(o.id, "Approved")}>
                          Approve
                        </Button>
                      )}

                      {o.status === "Approved" && (
                        <Button size="sm" variant="outline" onClick={() => handleUpdateOrderStatus(o.id, "Completed", "Paid")}>
                          Deliver/Close
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="Food Order Specifications Sheet">
        {selectedOrder && (
          <div className="space-y-6 py-2 text-xs font-sans leading-relaxed">
            
            {/* General Header Details */}
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3.5">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">Customer Profile</span>
                <div className="font-bold text-slate-800 mt-1">{selectedOrder.customerName}</div>
                <div className="text-slate-500 mt-0.5">{selectedOrder.customerEmail}</div>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">Order Specs</span>
                <div className="font-mono font-bold text-[#1B4332] mt-1">{selectedOrder.id}</div>
                <div className="text-slate-500 mt-0.5">Created: {selectedOrder.dateCreated}</div>
              </div>
            </div>

            {/* Cash Type details */}
            {selectedOrder.orderType === "Cash" && (
              <div className="space-y-3">
                <h4 className="font-extrabold text-[#1B4332] uppercase tracking-wider text-[10px]">Cash Transaction Details</h4>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                  <div>
                    <span className="text-slate-500 block font-bold">Product Item:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.product}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold">Quantity:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.quantity} sets/pcs</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-500 block font-bold">Fulfillment:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.deliveryOrPickup || "Pickup"}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-500 block font-bold">Payment Method:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.paymentMethod || "Cash"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Reservation Type details */}
            {selectedOrder.orderType === "Reservation" && (
              <div className="space-y-3">
                <h4 className="font-extrabold text-[#1B4332] uppercase tracking-wider text-[10px]">Reservation & Booking Specs</h4>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                  <div>
                    <span className="text-slate-500 block font-bold">Booking Date:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.reservationDate || selectedOrder.dateCreated}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold">Fulfillment Date:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.pickupDate || selectedOrder.deliveryDate || "—"}</span>
                  </div>
                  <div className="mt-2 col-span-2">
                    <span className="text-slate-500 block font-bold">Delivery Location:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.deliveryAddress || "Self-collection at hub"}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-500 block font-bold">Event Type:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.eventType || "Catering Event"}</span>
                  </div>
                  <div className="mt-2 col-span-2">
                    <span className="text-slate-500 block font-bold">Kitchen Special Instructions:</span>
                    <p className="text-slate-650 bg-white p-2 border border-slate-200 rounded-lg mt-1 font-semibold">{selectedOrder.specialInstructions || "No dietary modifications."}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Paluwagan Type details */}
            {selectedOrder.orderType === "Paluwagan" && (
              <div className="space-y-4">
                <h4 className="font-extrabold text-[#1B4332] uppercase tracking-wider text-[10px]">Paluwagan Cohort Ledger</h4>
                
                <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                  <div>
                    <span className="text-slate-500 block font-bold">Down Payment:</span>
                    <span className="font-bold text-slate-800">₱{selectedOrder.downPayment?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold">Remaining Balance:</span>
                    <span className="font-bold text-red-500">₱{selectedOrder.remainingBalance?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold">Installment Value:</span>
                    <span className="font-bold text-[#D4AF37]">₱{selectedOrder.installmentAmount?.toLocaleString()}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-500 block font-bold">Payments Count:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.numberOfPayments} Installments</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-500 block font-bold">Payment Schedule:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.paymentSchedule}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-500 block font-bold">Next Due Date:</span>
                    <span className="font-bold text-blue-600">{selectedOrder.nextDueDate || "Fully Paid"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-600 block">Payment Progress Logs</span>
                  <div className="border border-slate-150 rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Payment Date</TableHead>
                          <TableHead>Cash Contribution</TableHead>
                          <TableHead>Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.installmentsLog?.map((log, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-slate-505 font-bold">{log.date}</TableCell>
                            <TableCell className="font-bold text-emerald-600 font-mono">₱{log.amount.toLocaleString()}</TableCell>
                            <TableCell className="text-slate-500 font-semibold">{log.remarks || "Regular payment"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button onClick={() => setIsDetailsOpen(false)} className="bg-[#1B4332] text-white">
                Close Sheet
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Log Paluwagan Installment Modal */}
      <Modal isOpen={isLogInstallmentOpen} onClose={() => setIsLogInstallmentOpen(false)} title="Record Paluwagan Contribution">
        <form onSubmit={handleLogInstallmentSubmit} className="space-y-4 py-2 text-xs">
          {selectedOrder && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
              <div className="font-bold text-slate-800">Account: {selectedOrder.customerName}</div>
              <div className="text-[10.5px] text-slate-600 flex justify-between font-semibold">
                <span>Remaining Balance: <span className="text-red-500 font-bold">₱{selectedOrder.remainingBalance?.toLocaleString()}</span></span>
                <span>Scheduled Installment: <span className="text-emerald-700 font-bold">₱{selectedOrder.installmentAmount?.toLocaleString()}</span></span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Amount Paid (₱)</label>
              <input
                type="number"
                min="100"
                value={installmentAmount}
                onChange={(e) => setInstallmentAmount(Number(e.target.value))}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold text-emerald-650"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Receipt Notes / Remarks</label>
              <input
                type="text"
                value={installmentRemarks}
                onChange={(e) => setInstallmentRemarks(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-xl font-semibold"
                required
              />
            </div>
          </div>

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="light" onClick={() => setIsLogInstallmentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-700 text-white font-bold">
              Record Collection
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Order Modal */}
      <Modal isOpen={isAddOrderOpen} onClose={() => setIsAddOrderOpen(false)} title="Log Savorlicious Food Order">
        <form onSubmit={handleCreateOrder} className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Customer Full Name</label>
              <input
                type="text"
                required
                placeholder="Pedro Cruz"
                value={newOrderForm.customerName}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Customer Email Address</label>
              <input
                type="email"
                required
                placeholder="pedro@email.com"
                value={newOrderForm.customerEmail}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, customerEmail: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Order Program Type</label>
              <select
                value={newOrderForm.orderType}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, orderType: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold text-[#1B4332]"
              >
                <option value="Cash">Cash Order</option>
                <option value="Reservation">Advance Booking</option>
                <option value="Paluwagan">Paluwagan Installment</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Food Menu Product</label>
              <select
                value={newOrderForm.product}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, product: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="Crispy Lechon Package (Small)">Small Lechon (15-25kg)</option>
                <option value="Crispy Lechon Package (Medium)">Medium Lechon (30-40kg)</option>
                <option value="Crispy Lechon Package (Large)">Large Lechon (45-55kg)</option>
                <option value="Catering Buffet Set A (P250/pax)">Catering Set A</option>
                <option value="Catering Buffet Set B (P290/pax)">Catering Set B</option>
                <option value="Fresh Pork Belly (1kg)">Fresh Belly Meat</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Invoice Sum (₱)</label>
              <input
                type="number"
                value={newOrderForm.totalAmount}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, totalAmount: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold text-emerald-700"
                required
              />
            </div>
          </div>

          {/* Conditional Cash Fields */}
          {newOrderForm.orderType === "Cash" && (
            <div className="grid grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
              <div className="space-y-1">
                <label className="font-bold text-slate-650">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={newOrderForm.quantity}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, quantity: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-650">Fulfillment</label>
                <select
                  value={newOrderForm.deliveryOrPickup}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, deliveryOrPickup: e.target.value as any })}
                  className="w-full p-2 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="Pickup">Pickup</option>
                  <option value="Delivery">Delivery Dispatch</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-650">Method</label>
                <select
                  value={newOrderForm.paymentMethod}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, paymentMethod: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="Cash">Cash</option>
                  <option value="GCash">GCash Portal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
          )}

          {/* Conditional Reservation Fields */}
          {newOrderForm.orderType === "Reservation" && (
            <div className="space-y-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-650">Booking Date</label>
                  <input
                    type="date"
                    value={newOrderForm.reservationDate}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, reservationDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-650">Pickup Date</label>
                  <input
                    type="date"
                    value={newOrderForm.pickupDate}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, pickupDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-650">Delivery Date</label>
                  <input
                    type="date"
                    value={newOrderForm.deliveryDate}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, deliveryDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-650">Delivery Address</label>
                  <input
                    type="text"
                    placeholder="123 St, Cabanatuan City"
                    value={newOrderForm.deliveryAddress}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, deliveryAddress: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-650">Event Description</label>
                  <input
                    type="text"
                    placeholder="E.g. Wedding Catering"
                    value={newOrderForm.eventType}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, eventType: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-655">Kitchen special instructions</label>
                <input
                  type="text"
                  placeholder="Extra hot sauce, crispy skin details..."
                  value={newOrderForm.specialInstructions}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, specialInstructions: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
            </div>
          )}

          {/* Conditional Paluwagan Fields */}
          {newOrderForm.orderType === "Paluwagan" && (
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-650">Down Payment (₱)</label>
                  <input
                    type="number"
                    value={newOrderForm.downPayment}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, downPayment: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-xl font-bold text-emerald-650"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-650">Installment Value (₱)</label>
                  <input
                    type="number"
                    value={newOrderForm.installmentAmount}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, installmentAmount: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-650">No. of Installments</label>
                  <input
                    type="number"
                    value={newOrderForm.numberOfPayments}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, numberOfPayments: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-650">Contribution Frequency</label>
                  <select
                    value={newOrderForm.paymentSchedule}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, paymentSchedule: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-xl font-bold text-emerald-700"
                  >
                    <option value="Weekly">Weekly payments</option>
                    <option value="Bi-Weekly">Bi-Weekly cohorts</option>
                    <option value="Monthly">Monthly cohorts</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-650">First Payment Due Date</label>
                  <input
                    type="date"
                    value={newOrderForm.nextDueDate}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, nextDueDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="light" onClick={() => setIsAddOrderOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1B4332] text-white">
              Log Dispatch Order
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRole, Order } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Truck, CheckCircle2, ShieldAlert, Edit3 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, updateOrder } = useRole();
  const [activeTab, setActiveTab] = useState<string>("All");

  // Modal States
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [driver, setDriver] = useState("");
  const [eta, setEta] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<any>("Pending");
  const [destination, setDestination] = useState("");

  const selectedOrder = orders.find(o => o.id === selectedOrderId) as any;

  const tabs: string[] = ["All", "Pending", "Approved", "Preparing", "Out for Delivery", "Delivered", "Completed", "Cancelled"];

  const filteredOrders = orders.filter((o) => {
    return activeTab === "All" || (o.status as string) === activeTab;
  });

  const handleOpenDeliveryModal = (o: any) => {
    setSelectedOrderId(o.id);
    setDriver(o.driverName || "");
    setEta(o.estimatedArrival || "");
    setDeliveryStatus(o.status || "Pending");
    setDestination(o.deliveryAddress || o.customerAddress || "");
  };

  const handleSaveDelivery = async () => {
    if (!selectedOrderId) return;
    await updateOrder(selectedOrderId, {
      status: deliveryStatus,
      driverName: driver,
      estimatedArrival: eta,
      deliveryAddress: destination
    } as any);
    setSelectedOrderId(null);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">Orders Dispatcher</h1>
        <p className="text-xs text-slate-500 font-medium">Coordinate meat weight items shipping, delivery driver dispatches, and GCash status checks.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-550 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center text-slate-500 text-xs font-medium space-y-2">
          <Truck className="w-8 h-8 text-slate-350 mx-auto" />
          <div>No orders matching filter.</div>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items Purchased</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Delivery Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-bold text-[11px] text-slate-550">{o.id}</TableCell>
                  <TableCell>
                    <div className="font-bold text-xs text-slate-800">{o.customerName}</div>
                    <span className="text-[9px] text-slate-400 font-medium block">{o.customerEmail}</span>
                  </TableCell>
                  <TableCell className="font-bold text-xs text-slate-800 max-w-[180px] truncate" title={o.product}>
                    {o.product}
                  </TableCell>
                  <TableCell className="font-bold text-xs text-slate-800">₱{o.totalAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-xs font-medium text-slate-500">{o.dateCreated}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                      o.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {o.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase ${
                      o.status === "Delivered" || o.status === "Completed" ? "bg-emerald-50 text-emerald-600" :
                      o.status === "Cancelled" ? "bg-red-50 text-red-600" :
                      o.status as any === "Approved" || o.status as any === "Preparing" || o.status as any === "Out for Delivery" ? "bg-blue-50 text-blue-600" :
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {o.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1 shrink-0">
                    <Button size="sm" variant="light" onClick={() => handleOpenDeliveryModal(o)}>
                      <Edit3 className="w-3.5 h-3.5 mr-1" /> Manage
                    </Button>
                    {o.paymentStatus === "Pending" && (
                      <Button size="sm" variant="outline" onClick={() => updateOrderStatus(o.id, o.status, "Paid")}>
                        Validate Pay
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Delivery / Order Management Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          title="Manage Order & Delivery Dispatch"
          size="md"
        >
          <div className="space-y-5 text-slate-800 dark:text-slate-200">
            <div>
              <span className="text-[10px] font-extrabold text-[#D4AF37] font-mono tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {selectedOrder.id}
              </span>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-105 mt-1.5">{selectedOrder.product}</h4>
              <p className="text-xs text-slate-500">Customer: <strong>{selectedOrder.customerName}</strong> ({selectedOrder.customerEmail})</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Order / Delivery Status</label>
                <select
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-bold bg-white dark:bg-[#0f1412] dark:border-[#182620]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {selectedOrder.deliveryOrPickup === "Delivery" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Assigned Delivery Driver</label>
                    <input
                      type="text"
                      placeholder="e.g. Juan Cruz (Plate ABC 1234)"
                      value={driver}
                      onChange={(e) => setDriver(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-white dark:bg-[#0f1412] dark:border-[#182620]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Estimated Arrival Time (ETA)</label>
                    <input
                      type="text"
                      placeholder="e.g. 2 hours, Today at 3 PM, or 2026-07-20"
                      value={eta}
                      onChange={(e) => setEta(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-white dark:bg-[#0f1412] dark:border-[#182620]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Delivery Address</label>
                    <textarea
                      rows={3}
                      placeholder="Enter specific delivery destination details..."
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-white dark:bg-[#0f1412] dark:border-[#182620]"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2.5 pt-4">
              <Button onClick={handleSaveDelivery} className="flex-1 font-bold">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setSelectedOrderId(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

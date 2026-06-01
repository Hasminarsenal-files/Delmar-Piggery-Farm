"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Truck, CheckCircle2, ShieldAlert } from "lucide-react";

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useRole();
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

  const filteredOrders = orders.filter((o) => {
    return activeTab === "All" || o.status === activeTab;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">Orders Dispatcher</h1>
        <p className="text-xs text-slate-500 font-medium">Coordinate meat weight items shipping and GCash bank payment status checks.</p>
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
        <Card className="p-8 text-center text-slate-505 text-xs font-medium space-y-2">
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
                  <TableCell className="font-bold text-xs text-slate-800 max-w-[180px] truncate" title={o.items}>
                    {o.items}
                  </TableCell>
                  <TableCell className="font-bold text-xs text-slate-800">₱{o.totalAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-xs font-medium text-slate-500">{o.orderDate}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                      o.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {o.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                      o.status === "Delivered" ? "bg-emerald-50 text-emerald-600" :
                      o.status === "Shipped" ? "bg-blue-50 text-blue-600" :
                      o.status === "Processing" ? "bg-indigo-50 text-indigo-650" :
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {o.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1 shrink-0">
                    {o.status === "Processing" && (
                      <>
                        <Button size="sm" variant="light" onClick={() => updateOrderStatus(o.id, "Shipped")}>
                          Ship Item
                        </Button>
                        {o.paymentStatus === "Pending" && (
                          <Button size="sm" variant="outline" onClick={() => updateOrderStatus(o.id, "Processing", "Paid")}>
                            Validate Pay
                          </Button>
                        )}
                      </>
                    )}
                    {o.status === "Shipped" && (
                      <Button size="sm" variant="secondary" onClick={() => updateOrderStatus(o.id, "Delivered")}>
                        Deliver
                      </Button>
                    )}
                    {o.status === "Delivered" && (
                      <span className="text-[10px] text-slate-400 font-bold">Closed Transaction</span>
                    )}
                    {o.status === "Cancelled" && (
                      <span className="text-[10px] text-red-500 font-bold">Cancelled</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

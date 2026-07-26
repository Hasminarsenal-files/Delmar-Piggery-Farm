"use client";

import React from "react";
import { useRole } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { ShoppingBag, Truck, Info } from "lucide-react";

export default function CustomerOrdersPage() {
  const { userEmail, orders } = useRole();
  const customerOrders = orders.filter((o) => o.customerEmail === userEmail);

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">My Orders Tracker</h1>
        <p className="text-xs text-slate-500 font-medium">Verify your fresh meat deliveries and processing logs.</p>
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
                <TableHead>Purchased Items</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Delivery Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-bold text-[11px] text-slate-550">{o.id}</TableCell>
                  <TableCell className="font-bold text-xs text-slate-800 max-w-[200px] truncate" title={o.product}>
                    {o.product}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-500">{o.orderType}</TableCell>
                  <TableCell className="text-xs font-medium text-slate-500">{o.dateCreated}</TableCell>
                  <TableCell className="font-bold text-xs text-slate-800">₱{o.totalAmount.toLocaleString()}</TableCell>
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
                      o.status === "Processing" ? "bg-indigo-50 text-indigo-600" :
                      "bg-red-50 text-red-600"
                    }`}>
                      {o.status}
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
        <span>For complaints regarding order packaging, weights, or delivery schedules, please coordinate with our support line at 09464544973.</span>
      </div>
    </div>
  );
}

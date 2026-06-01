"use client";

import React from "react";
import { useRole } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Users, Info, Mail, Phone } from "lucide-react";

export default function AdminCustomersPage() {
  const { reservations, orders } = useRole();

  // Aggregate customer details from reservations and orders
  const customerEmails = Array.from(
    new Set([
      ...reservations.map((r) => r.customerEmail),
      ...orders.map((o) => o.customerEmail),
    ])
  );

  const customersList = customerEmails.map((email) => {
    // Find name
    const orderMatch = orders.find((o) => o.customerEmail === email);
    const resMatch = reservations.find((r) => r.customerEmail === email);
    const name = orderMatch?.customerName || resMatch?.customerName || "Simulated Client";

    const customerOrders = orders.filter((o) => o.customerEmail === email && o.status !== "Cancelled");
    const totalSpent = customerOrders.reduce((sum, curr) => sum + curr.totalAmount, 0);

    const activeResCount = reservations.filter(
      (r) => r.customerEmail === email && (r.status === "Pending" || r.status === "Approved")
    ).length;

    return {
      name,
      email,
      phone: email.includes("maria") ? "0923-456-7890" : email.includes("john") ? "0912-345-6789" : "0915-098-7654",
      ordersCount: customerOrders.length,
      activeResCount,
      totalSpent,
      location: email.includes("maria") ? "Tarlac City" : email.includes("john") ? "Aliaga, Nueva Ecija" : "Cabanatuan City",
    };
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">Customer CRM Directory</h1>
        <p className="text-xs text-slate-500 font-medium">Review customer logs, address coordinates, and aggregate farm purchases.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        {customersList.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">No customers registered yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Details</TableHead>
                <TableHead>Phone / Contact</TableHead>
                <TableHead>Transit Address</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Active Reservations</TableHead>
                <TableHead>Cumulative Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customersList.map((c) => (
                <TableRow key={c.email}>
                  <TableCell>
                    <div className="font-bold text-xs text-slate-800">{c.name}</div>
                    <span className="text-[10px] text-slate-450 font-semibold flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" /> {c.email}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-650">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {c.phone}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-500">{c.location}</TableCell>
                  <TableCell className="font-bold text-xs">{c.ordersCount} Orders</TableCell>
                  <TableCell className="font-bold text-xs">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] ${
                      c.activeResCount > 0 ? "bg-amber-50 text-amber-600 font-extrabold" : "bg-slate-50 text-slate-400"
                    }`}>
                      {c.activeResCount} Active
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-xs text-primary-800">₱{c.totalSpent.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <div className="flex items-start gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed font-medium">
        <Info className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
        <span>Customer directory compiles contacts automatically from checkout transactions and reservation forms. Direct integration with SMS logs is under review.</span>
      </div>
    </div>
  );
}

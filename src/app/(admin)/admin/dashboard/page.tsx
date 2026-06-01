"use client";

import React from "react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import {
  ClipboardList,
  CalendarDays,
  Truck,
  TrendingUp,
  Users,
  Bell,
  ArrowRight,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Coins,
  CheckCircle2
} from "lucide-react";

export default function AdminDashboard() {
  const { inventory, reservations, orders, notifications, updateReservationStatus, updateOrderStatus } = useRole();

  // Statistics summaries
  const totalItems = inventory.length;
  const lowStockCount = inventory.filter(item => item.quantity <= item.minStockLevel).length;
  const totalStockValue = inventory.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
  const pendingReservations = reservations.filter((r) => r.status === "Pending").length;
  
  const totalSales = orders
    .filter((o) => o.paymentStatus === "Paid" && o.status !== "Cancelled")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const uniqueCustomers = Array.from(
    new Set([
      ...reservations.map((r) => r.customerEmail),
      ...orders.map((o) => o.customerEmail),
    ])
  ).length;

  const recentNotifications = notifications.slice(0, 4);

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-slate-100 rounded-3xl shadow-xs">
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-red-750 shrink-0" />
            <span>Farm Operations Portal</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">Welcome Elena Delmar. Monitor livestock numbers, feed margins, and event scheduling.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 py-2 px-3.5 rounded-xl">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>Biosecurity System Online</span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 flex items-center gap-4 hover:border-primary-500/20 transition-colors">
          <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Products</h4>
            <div className="text-xl font-extrabold text-slate-800">{totalItems} Items</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 hover:border-red-500/20 transition-colors">
          <div className={`p-3 rounded-2xl ${lowStockCount > 0 ? "bg-red-50 text-red-655" : "bg-emerald-50 text-emerald-600"}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Low Stock Warnings</h4>
            <div className={`text-xl font-extrabold ${lowStockCount > 0 ? "text-red-600" : "text-slate-800"}`}>
              {lowStockCount} Alerts
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 hover:border-emerald-500/20 transition-colors">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stock Valuation</h4>
            <div className="text-xl font-extrabold text-slate-800">₱{totalStockValue.toLocaleString()}</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 hover:border-indigo-500/20 transition-colors">
          <div className="p-3 bg-indigo-50 text-indigo-650 rounded-2xl">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Bookings</h4>
            <div className="text-xl font-extrabold text-slate-800">{pendingReservations} Requests</div>
          </div>
        </Card>
      </div>

      {/* Tables and alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Reservations Action List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider">Active Bookings Pending Action</h3>
            <Link href="/admin/reservations" className="text-xs text-red-800 font-bold hover:underline">
              Manage Bookings
            </Link>
          </div>

          <Card className="p-0 overflow-hidden">
            {reservations.filter(r => r.status === "Pending").length === 0 ? (
              <div className="p-8 text-center text-slate-550 text-xs font-medium">No pending reservations to process. All caught up!</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Pickup Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations
                    .filter((r) => r.status === "Pending")
                    .slice(0, 3)
                    .map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div>
                            <div className="font-bold text-xs text-slate-850">{r.customerName}</div>
                            <span className="text-[10px] text-slate-450">{r.customerEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-xs text-slate-800">{r.category}</TableCell>
                        <TableCell className="font-bold text-xs">{r.quantity}</TableCell>
                        <TableCell className="text-xs font-medium text-slate-500">{r.pickupDate}</TableCell>
                        <TableCell className="text-right space-x-1.5 shrink-0">
                          <Button size="sm" variant="light" onClick={() => updateReservationStatus(r.id, "Approved")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="danger" className="bg-red-50 text-red-650 border-none hover:bg-red-100" onClick={() => updateReservationStatus(r.id, "Declined")}>
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>

        {/* Action Alerts logs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Critical Low Stock Alert Widget */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-650" /> Stock Shortages
            </h3>
            
            <Card className="p-5">
              {inventory.filter(item => item.quantity <= item.minStockLevel).length === 0 ? (
                <div className="text-center py-4 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <div className="text-xs font-bold text-slate-800">All stocks healthy</div>
                  <p className="text-[10px] text-slate-505 font-medium">No items currently run below safety levels.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inventory
                    .filter(item => item.quantity <= item.minStockLevel)
                    .slice(0, 3)
                    .map(item => (
                      <div key={item.id} className="text-xs flex justify-between items-center border-b border-slate-50 pb-2.5 last:border-none last:pb-0">
                        <div>
                          <div className="font-bold text-slate-800">{item.name}</div>
                          <span className="text-[9px] text-slate-400 font-medium">Min Level: {item.minStockLevel} {item.unit}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-red-50 text-red-650">
                          {item.quantity} Left
                        </span>
                      </div>
                    ))}
                  <div className="pt-2 text-center">
                    <Link href="/admin/inventory" className="text-[10px] text-primary-750 font-bold hover:underline">
                      Go to Inventory Details →
                    </Link>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Recent Alerts Card */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-red-800" /> Recent Alerts
              </h3>
            </div>

            <Card className="p-5">
              {recentNotifications.length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-4 font-medium">No alerts triggered.</div>
              ) : (
                <div className="space-y-3.5">
                  {recentNotifications.map((n) => (
                    <div key={n.id} className="text-xs flex gap-3 items-start border-b border-slate-50 pb-3 last:border-none last:pb-0">
                      <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-1.5 shrink-0" />
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800">{n.title}</div>
                        <p className="text-[11px] text-slate-500 leading-normal font-medium">{n.message}</p>
                        <span className="text-[9px] text-slate-400 font-bold block">{n.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}

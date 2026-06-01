"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { CalendarDays, CheckCircle2, ShieldAlert } from "lucide-react";

export default function AdminReservationsPage() {
  const { reservations, updateReservationStatus } = useRole();
  const [activeTab, setActiveTab] = useState<string>("All");

  const tabs = ["All", "Pending", "Approved", "Completed", "Declined"];

  const filteredReservations = reservations.filter((r) => {
    return activeTab === "All" || r.status === activeTab;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">Reservations Dashboard</h1>
        <p className="text-xs text-slate-500 font-medium">Verify booking schedules, adjust status keys, or coordinate delivery.</p>
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

      {filteredReservations.length === 0 ? (
        <Card className="p-8 text-center text-slate-500 text-xs font-medium space-y-2">
          <CalendarDays className="w-8 h-8 text-slate-350 mx-auto animate-bounce" />
          <div>No reservations found under this filter.</div>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Res ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Expected Date</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-bold text-[11px] text-slate-550">{r.id}</TableCell>
                  <TableCell>
                    <div className="font-bold text-xs text-slate-800">{r.customerName}</div>
                    <span className="text-[9px] text-slate-400 font-semibold block">{r.customerEmail}</span>
                  </TableCell>
                  <TableCell className="font-bold text-xs text-slate-800">{r.category}</TableCell>
                  <TableCell className="font-bold text-xs">{r.quantity}</TableCell>
                  <TableCell className="text-xs font-medium text-slate-500">{r.pickupDate}</TableCell>
                  <TableCell className="font-bold text-xs text-slate-800">₱{r.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                      r.status === "Approved" ? "bg-emerald-50 text-emerald-600" :
                      r.status === "Pending" ? "bg-amber-50 text-amber-600" :
                      r.status === "Completed" ? "bg-blue-50 text-blue-600" :
                      "bg-red-50 text-red-600"
                    }`}>
                      {r.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1.5 shrink-0">
                    {r.status === "Pending" && (
                      <>
                        <Button size="sm" variant="light" onClick={() => updateReservationStatus(r.id, "Approved")}>
                          Approve
                        </Button>
                        <Button size="sm" variant="danger" className="bg-red-50 text-red-650 hover:bg-red-100 border-none" onClick={() => updateReservationStatus(r.id, "Declined")}>
                          Reject
                        </Button>
                      </>
                    )}
                    {r.status === "Approved" && (
                      <Button size="sm" variant="secondary" onClick={() => updateReservationStatus(r.id, "Completed")}>
                        Mark Complete
                      </Button>
                    )}
                    {r.status === "Completed" && (
                      <span className="text-[10px] text-slate-405 font-bold">Processed</span>
                    )}
                    {r.status === "Declined" && (
                      <span className="text-[10px] text-red-450 font-bold">Declined</span>
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

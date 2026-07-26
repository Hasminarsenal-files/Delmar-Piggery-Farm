"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Users, Info, Mail, Phone, Calendar, MapPin, Eye, ShieldAlert, Award } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export default function AdminCustomersPage() {
  const { customers, orders, reservations } = useRole();
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);

  // Find the selected customer object
  const selectedCustomer = customers.find(c => c.email === selectedCustomerEmail);
  const selectedCustomerOrders = selectedCustomer 
    ? orders.filter(o => o.customerEmail === selectedCustomer.email) 
    : [];

  const handleRowClick = (email: string) => {
    setSelectedCustomerEmail(email);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">Customer CRM Directory</h1>
        <p className="text-xs text-slate-500 font-medium">Review customer logs, address coordinates, and aggregate farm purchases.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">No customers registered yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Details</TableHead>
                <TableHead>Phone / Contact</TableHead>
                <TableHead>Transit Address</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => {
                const customerOrders = orders.filter(o => o.customerEmail === c.email && o.status !== "Cancelled");

                return (
                  <TableRow 
                    key={c.email} 
                    className="hover:bg-slate-50/50 dark:hover:bg-[#182620]/25 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(c.email)}
                  >
                    <TableCell>
                      <div className="font-bold text-xs text-slate-800">{c.fullName}</div>
                      <span className="text-[10px] text-slate-455 font-semibold flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-405" /> {c.email}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-655">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-405" /> {c.phone}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-500 max-w-[200px] truncate">
                      {c.address}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${
                        c.status === "Active" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/45 dark:text-emerald-450" : "bg-red-50 text-red-655"
                      }`}>
                        {c.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-500 font-mono">
                      {c.registrationDate}
                    </TableCell>
                    <TableCell>
                      <button 
                        className="text-xs text-emerald-700 hover:text-emerald-950 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(c.email);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" /> View Profile
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <div className="flex items-start gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed font-medium">
        <Info className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
        <span>Customer directory compiles contacts automatically from registration logs, checkout transactions and reservation forms. Direct integration with SMS logs is under review.</span>
      </div>

      {/* Customer Profile Details Modal */}
      {selectedCustomer && (
        <Modal 
          isOpen={!!selectedCustomerEmail} 
          onClose={() => setSelectedCustomerEmail(null)} 
          title="Customer Profile Details"
          size="lg"
        >
          <div className="space-y-6 text-slate-800 dark:text-slate-200">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-[#080d0a]/40 p-4 rounded-2xl border border-slate-105 dark:border-emerald-955/20">
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold font-mono text-[#D4AF37] tracking-wider bg-white/10 dark:bg-[#0f1412] px-2.5 py-0.5 rounded-lg border border-slate-100 dark:border-emerald-955/40">
                  {selectedCustomer.id}
                </span>
                <h3 className="text-sm font-extrabold uppercase text-slate-800 dark:text-slate-100">{selectedCustomer.fullName}</h3>
                <p className="text-[10px] text-slate-500 font-semibold">{selectedCustomer.email}</p>
              </div>

              <div className="flex flex-col items-end gap-1.5 text-right">
                <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${
                  selectedCustomer.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-605"
                }`}>
                  Account Status: {selectedCustomer.status}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  Joined: <strong className="font-mono">{selectedCustomer.registrationDate}</strong>
                </span>
              </div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 p-3 bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] rounded-2xl">
                <div className="text-[10px] font-extrabold text-slate-455 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Number
                </div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{selectedCustomer.phone}</p>
              </div>

              <div className="space-y-1 p-3 bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] rounded-2xl">
                <div className="text-[10px] font-extrabold text-slate-455 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Last Login Activity
                </div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{selectedCustomer.lastLogin}</p>
              </div>

              <div className="sm:col-span-2 space-y-1 p-3 bg-white dark:bg-[#0f1412] border border-slate-105 dark:border-[#182620] rounded-2xl">
                <div className="text-[10px] font-extrabold text-slate-455 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Delivery & Transit Address
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{selectedCustomer.address}</p>
              </div>
            </div>

            {/* Order History */}
            <div className="space-y-3">
              <h4 className="font-heading text-xs font-extrabold uppercase tracking-widest text-slate-800 dark:text-slate-200 border-b pb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" /> Complete Order History
              </h4>

              {selectedCustomerOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-semibold">No order logs found for this customer account.</div>
              ) : (
                <div className="overflow-hidden border border-slate-100 dark:border-emerald-955/40 rounded-2xl">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCustomerOrders.map((ord) => (
                        <TableRow key={ord.id}>
                          <TableCell className="font-mono text-xs font-bold text-slate-500">{ord.id}</TableCell>
                          <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-100">{ord.product}</TableCell>
                          <TableCell className="font-mono text-xs font-bold">₱{ord.totalAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${
                              ord.status === "Delivered" || ord.status === "Completed" ? "bg-emerald-50 text-emerald-600" :
                              ord.status === "Cancelled" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                            }`}>
                              {ord.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-slate-505 font-mono">{ord.dateCreated}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Password notice */}
            <div className="p-3.5 bg-amber-50/50 dark:bg-amber-955/10 border border-amber-150/40 dark:border-amber-900/30 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-450 leading-relaxed font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>Security Access Level Notice: Customer credentials and login password hashes are locked behind Supabase identity encryption shields. Administrators have no lookup authorization.</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

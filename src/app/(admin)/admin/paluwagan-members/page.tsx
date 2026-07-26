"use client";

import React, { useState, useMemo } from "react";
import { useRole, PaluwaganApplication } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  PiggyBank,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Archive,
  Eye,
  Activity,
  Receipt,
  FileText
} from "lucide-react";

export default function PaluwaganMembersPage() {
  const {
    paluwaganApplications,
    paluwaganBatches,
    orders,
    archivePaluwaganMembership,
    showToast
  } = useRole();

  // Search/Filters states
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Active");

  // Selection states for Member Profile modal
  const [selectedMember, setSelectedMember] = useState<PaluwaganApplication | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Retrieve approved or archived applications
  const approvedMembers = useMemo(() => {
    return paluwaganApplications.filter(
      (app) => app.status === "Approved" || app.adminRemarks === "Membership archived by administrator."
    );
  }, [paluwaganApplications]);

  // Compute orders and ledger balances for each member row
  const memberList = useMemo(() => {
    return approvedMembers.map((member) => {
      // Find orders matching this member
      const memberOrders = orders.filter(
        (o) => o.customerEmail === member.customerEmail && o.orderType === "Paluwagan" && o.status !== "Pending"
      );

      const totalOrdersCount = memberOrders.length;

      const totalBalance = memberOrders.reduce((sum, o) => {
        const schedulePaid = o.paluwaganSchedule?.reduce((sSum, item) => sSum + item.amountPaid, 0) || 0;
        const totalPaid = (o.downPayment || 0) + schedulePaid;
        const remaining = o.remainingBalance ?? (o.totalAmount - totalPaid);
        return sum + Math.max(0, remaining);
      }, 0);

      // Find first upcoming next due date
      const nextDueStr = memberOrders
        .map((o) => o.nextDueDate)
        .filter(Boolean)
        .sort((a, b) => new Date(a!).getTime() - new Date(b!).getTime())[0] || "None";

      const isActive = member.status === "Approved";
      const statusText = isActive ? "Active" : "Archived";

      return {
        ...member,
        totalOrders: totalOrdersCount,
        remainingBalance: totalBalance,
        nextDueDate: nextDueStr,
        statusText,
      };
    });
  }, [approvedMembers, orders]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return memberList.filter((m) => {
      const matchesSearch =
        m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.memberId && m.memberId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        m.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBatch = batchFilter === "All" || m.assignedBatchId === batchFilter;
      const matchesStatus = statusFilter === "All" || m.statusText === statusFilter;
      
      return matchesSearch && matchesBatch && matchesStatus;
    });
  }, [memberList, searchTerm, batchFilter, statusFilter]);

  const handleArchiveMember = async (memberId: string, name: string) => {
    if (!confirm(`Are you sure you want to ARCHIVE the membership of ${name} (Member ID: ${memberId})?`)) {
      return;
    }
    const success = await archivePaluwaganMembership(memberId);
    if (success) {
      showToast("Membership Archived", `Archived membership for ${name}.`, "warning");
    }
  };

  const handleOpenProfile = (member: PaluwaganApplication) => {
    setSelectedMember(member);
    setIsProfileOpen(true);
  };

  // Find orders of selected member for profile display
  const selectedMemberOrders = useMemo(() => {
    if (!selectedMember) return [];
    return orders.filter(
      (o) => o.customerEmail === selectedMember.customerEmail && o.orderType === "Paluwagan"
    );
  }, [selectedMember, orders]);

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">Paluwagan Members</h1>
        <p className="text-xs text-slate-500 font-medium">Monitor active program participants, schedules, and account ledger sheets.</p>
      </div>

      {/* FILTER BAR */}
      <Card className="p-4 bg-white border border-slate-200/60 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Member ID, name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batch:</span>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-xl font-semibold bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="All">All Batches</option>
              {paluwaganBatches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-xl font-semibold bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="All">All Members</option>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>
      </Card>

      {/* MEMBERS TABLE */}
      <Card className="overflow-hidden border border-slate-200/60 rounded-3xl bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10.5px]">Member ID</TableHead>
              <TableHead className="text-[10.5px]">Full Name</TableHead>
              <TableHead className="text-[10.5px]">Batch</TableHead>
              <TableHead className="text-[10.5px]">Total Orders</TableHead>
              <TableHead className="text-[10.5px] text-right">Remaining Balance</TableHead>
              <TableHead className="text-[10.5px]">Next Due Date</TableHead>
              <TableHead className="text-[10.5px]">Status</TableHead>
              <TableHead className="text-[10.5px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-xs text-slate-400 font-medium">
                  No Paluwagan members found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs font-bold text-slate-800">{m.memberId || "Pending"}</TableCell>
                  <TableCell className="font-extrabold text-slate-800 text-xs">{m.fullName}</TableCell>
                  <TableCell className="text-xs font-bold text-[#1B4332]">
                    {paluwaganBatches.find(b => b.id === m.assignedBatchId)?.name || "Active Batch"}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-650">{m.totalOrders} lechon orders</TableCell>
                  <TableCell className="text-right text-xs font-extrabold text-slate-800 font-mono">
                    ₱{m.remainingBalance.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-600 font-mono">
                    {m.nextDueDate === "None" ? (
                      <span className="text-slate-400 font-semibold italic">None</span>
                    ) : (
                      m.nextDueDate
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase border ${
                      m.statusText === "Active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {m.statusText}
                    </span>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenProfile(m)}
                      className="font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Profile
                    </Button>
                    {m.statusText === "Active" && m.memberId && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleArchiveMember(m.memberId!, m.fullName)}
                        className="font-bold text-rose-600 border-rose-100 hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        Archive
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* MEMBER PROFILE MODAL */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title="Member Paluwagan Account File"
        size="lg"
      >
        {selectedMember && (
          <div className="space-y-6 text-xs text-slate-700">
            {/* Header Badge */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Member ID</span>
                <span className="text-sm font-mono font-extrabold text-slate-800">{selectedMember.memberId || "Pending"}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Membership Since</span>
                <span className="font-extrabold text-slate-800 font-mono">{selectedMember.dateApproved || "N/A"}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Demographic Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-850 uppercase tracking-widest text-[10px] border-l-2 border-emerald-500 pl-2">Member Demographic Info</h4>
                <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Applicant Name</span>
                    <span className="font-extrabold text-slate-800">{selectedMember.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone / Email</span>
                    <span className="font-semibold text-slate-750 block truncate max-w-[200px]">{selectedMember.mobileNumber} | {selectedMember.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Civil Status / Age</span>
                    <span className="font-bold text-slate-750">{selectedMember.civilStatus} | {selectedMember.age} years old</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Occupation / Business</span>
                    <span className="font-bold text-slate-750">{selectedMember.occupation} ({selectedMember.employerName})</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100/50">
                    <span className="text-slate-400">Home Address</span>
                    <span className="font-bold text-slate-700 block truncate max-w-[180px]">{selectedMember.completeAddress}, {selectedMember.barangay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Income Range</span>
                    <span className="font-bold text-emerald-850">{selectedMember.monthlyIncomeRange}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact & ID Verification */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-850 uppercase tracking-widest text-[10px] border-l-2 border-emerald-500 pl-2">Emergency Contacts & Verification</h4>
                <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Emergency Name</span>
                    <span className="font-extrabold text-slate-800">{selectedMember.emergencyContactName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Relationship</span>
                    <span className="font-bold text-slate-700">{selectedMember.emergencyContactRelationship}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Contact Phone</span>
                    <span className="font-bold text-slate-700 font-mono">{selectedMember.emergencyContactNumber}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-slate-100/50">
                    <span className="text-slate-400">ID verified</span>
                    <span className="font-bold text-slate-800">{selectedMember.idType}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>File Scanner name</span>
                    <span className="font-bold text-emerald-800 underline">{selectedMember.idFileName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Installment checkout listings */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-850 uppercase tracking-widest text-[10px] border-l-2 border-emerald-500 pl-2">Active Paluwagan Installment Orders</h4>
              {selectedMemberOrders.length === 0 ? (
                <div className="p-4 bg-slate-50 text-center text-slate-450 border border-slate-100 rounded-2xl">
                  No active lechon installment transactions logged yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedMemberOrders.map((order) => {
                    const totalAmt = order.totalAmount;
                    const dpAmt = order.downPayment || 0;
                    const schedPaid = order.paluwaganSchedule?.reduce((sum, item) => sum + item.amountPaid, 0) || 0;
                    const totPaid = dpAmt + schedPaid;
                    const remBal = Math.max(0, order.remainingBalance ?? (totalAmt - totPaid));

                    return (
                      <div key={order.id} className="p-4 border border-slate-200 rounded-2xl space-y-3 bg-white">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <div>
                            <span className="font-bold text-slate-800 text-xs">Order: {order.id}</span>
                            <span className="text-[10px] text-slate-400 ml-2 font-mono">Booked: {order.dateCreated}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase border ${
                            order.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-slate-650">
                          <div>
                            <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Contract Cost</span>
                            <span className="font-extrabold text-slate-800">₱{totalAmt.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Down Payment</span>
                            <span className="font-bold text-slate-700">₱{dpAmt.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Total Paid</span>
                            <span className="font-bold text-emerald-650">₱{totPaid.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Outstanding Bal</span>
                            <span className="font-extrabold text-rose-650">₱{remBal.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Schedule listing items */}
                        <div className="bg-slate-50/50 p-2.5 border border-slate-100 rounded-xl space-y-1.5">
                          <span className="text-[8.5px] text-slate-400 font-bold block uppercase tracking-wider">Installments Schedule:</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {order.paluwaganSchedule?.map((item) => (
                              <div key={item.installmentNumber} className="bg-white border border-slate-150 p-2 rounded-lg flex flex-col justify-between">
                                <span className="font-bold text-[9px] text-slate-450 block">Inst. #{item.installmentNumber}</span>
                                <span className="font-bold text-slate-800 text-[10.5px]">₱{item.amountDue.toLocaleString()}</span>
                                <span className={`text-[8.5px] font-extrabold uppercase mt-1 ${
                                  item.status === "PAID" ? "text-emerald-600" : item.status === "OVERDUE" ? "text-rose-600" : "text-slate-500"
                                }`}>
                                  {item.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <Button variant="secondary" onClick={() => setIsProfileOpen(false)}>
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

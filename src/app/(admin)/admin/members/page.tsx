"use client";

import React, { useState, useMemo } from "react";
import { useRole, Member } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { 
  Search, 
  UserPlus, 
  Edit, 
  Archive, 
  RotateCcw, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  ArrowUpDown,
  BookOpen,
  Calendar,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function AdminMembersPage() {
  const { 
    members, 
    batches, 
    memberPayments, 
    addMember, 
    updateMember, 
    archiveMember, 
    restoreMember 
  } = useRole();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("All");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("All");
  const [viewTab, setViewTab] = useState<"Active" | "Archived">("Active");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [batchId, setBatchId] = useState("");
  const [totalDue, setTotalDue] = useState("5000");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto set default total due when batch changes
  const handleBatchChange = (selectedId: string) => {
    setBatchId(selectedId);
    const batch = batches.find(b => b.id === selectedId);
    if (batch) {
      setTotalDue(batch.totalDue.toString());
    }
  };

  // Helper: compute financial details for a member
  const getMemberFinancials = (member: Member) => {
    const totalPaid = memberPayments
      .filter(p => p.memberId === member.id)
      .reduce((sum, p) => sum + p.amountPaid, 0);
    const remaining = member.totalDue - totalPaid;
    let paymentStatus: "Paid" | "Partially Paid" | "Unpaid" = "Unpaid";
    
    if (remaining <= 0) {
      paymentStatus = "Paid";
    } else if (totalPaid > 0) {
      paymentStatus = "Partially Paid";
    }
    
    return { totalPaid, remaining, paymentStatus };
  };

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members
      .filter(member => {
        // Tab check (active vs archived)
        if (viewTab === "Active") {
          return member.membershipStatus !== "Archived";
        } else {
          return member.membershipStatus === "Archived";
        }
      })
      .filter(member => {
        const financials = getMemberFinancials(member);
        const batchName = batches.find(b => b.id === member.batchId)?.name || "No Batch";

        // Advanced Search fields
        const matchesSearch = 
          member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.contactNumber.includes(searchTerm) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.dateRegistered.includes(searchTerm) ||
          batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          financials.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase());

        // Batch Filter
        const matchesBatch = selectedBatchId === "All" || member.batchId === selectedBatchId;

        // Payment Status Filter
        const matchesPayment = selectedPaymentStatus === "All" || financials.paymentStatus === selectedPaymentStatus;

        return matchesSearch && matchesBatch && matchesPayment;
      });
  }, [members, memberPayments, batches, searchTerm, selectedBatchId, selectedPaymentStatus, viewTab]);

  // Actions
  const openAddModal = () => {
    setFullName("");
    setContactNumber("");
    setEmail("");
    setAddress("");
    setBatchId(batches[0]?.id || "");
    setTotalDue(batches[0]?.totalDue?.toString() || "5000");
    setNotes("");
    setFormError("");
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !contactNumber || !email || !address) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);
    
    const success = await addMember({
      fullName,
      contactNumber,
      email,
      address,
      dateRegistered: new Date().toISOString().split("T")[0],
      batchId: batchId || undefined,
      totalDue: Number(totalDue),
      notes: notes || undefined
    });

    setIsSubmitting(false);
    if (success) {
      setIsAddModalOpen(false);
    } else {
      setFormError("Failed to register member. Please check if email is unique.");
    }
  };

  const openEditModal = (member: Member) => {
    setCurrentMember(member);
    setFullName(member.fullName);
    setContactNumber(member.contactNumber);
    setEmail(member.email);
    setAddress(member.address);
    setBatchId(member.batchId || "");
    setTotalDue(member.totalDue.toString());
    setNotes(member.notes || "");
    setFormError("");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember) return;
    if (!fullName || !contactNumber || !email || !address) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    const success = await updateMember(currentMember.id, {
      fullName,
      contactNumber,
      email,
      address,
      batchId: batchId || undefined,
      totalDue: Number(totalDue),
      notes: notes || undefined
    });

    setIsSubmitting(false);
    if (success) {
      setIsEditModalOpen(false);
    } else {
      setFormError("Failed to update member information.");
    }
  };

  const handleArchive = async (id: string) => {
    if (confirm("Are you sure you want to archive this member?")) {
      await archiveMember(id);
    }
  };

  const handleRestore = async (id: string) => {
    await restoreMember(id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 font-sans pb-12"
    >
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-900 to-[#1B4332] p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="space-y-1.5 z-10">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#D4AF37]" /> Member CRM Registry
          </h1>
          <p className="text-xs text-emerald-100/80 font-medium">
            Manage Savorlicious Food Services program members, batches, and remaining balances.
          </p>
        </div>

        <Button 
          variant="secondary" 
          className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-900 text-xs font-bold uppercase z-10 py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
          onClick={openAddModal}
          icon={<UserPlus className="w-4 h-4" />}
        >
          Add Member
        </Button>
      </div>

      {/* Main filter toolbar */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-100/50 bg-white/85 dark:bg-[#0f1412]/80 backdrop-blur-md rounded-2xl shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-950/30 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-white dark:bg-[#070a09]"
            placeholder="Search by ID, Name, Contact, Batch..."
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#070a09] px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-emerald-950/20">
            <Filter className="w-3.5 h-3.5 text-[#1f8f60]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Batch</span>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="text-xs bg-transparent font-semibold focus:outline-hidden text-slate-700 dark:text-slate-200"
            >
              <option value="All">All Batches</option>
              {batches.filter(b => b.status !== "Archived").map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#070a09] px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-emerald-950/20">
            <CreditCard className="w-3.5 h-3.5 text-[#1f8f60]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Payment</span>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="text-xs bg-transparent font-semibold focus:outline-hidden text-slate-700 dark:text-slate-200"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
          
          {/* Tabs switch */}
          <div className="bg-slate-100 dark:bg-[#070a09] p-1 rounded-xl flex gap-1 border border-slate-200/50 dark:border-emerald-955/20 ml-auto">
            <button 
              onClick={() => setViewTab("Active")}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${viewTab === "Active" ? "bg-white dark:bg-[#0f1412] text-slate-800 dark:text-slate-100 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
            >
              Active
            </button>
            <button 
              onClick={() => setViewTab("Archived")}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${viewTab === "Archived" ? "bg-white dark:bg-[#0f1412] text-slate-800 dark:text-slate-100 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
            >
              Archived ({members.filter(m => m.membershipStatus === "Archived").length})
            </button>
          </div>
        </div>

      </Card>

      {/* Members Directory List */}
      <Card className="p-0 overflow-hidden border border-slate-100 dark:border-[#182620] bg-white dark:bg-[#0f1412]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member Details</TableHead>
              <TableHead>Contact / Email</TableHead>
              <TableHead>Assigned Batch</TableHead>
              <TableHead className="text-right">Total Due</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Remaining Balance</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-400 font-medium text-xs">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No members found matching the specified filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => {
                const financials = getMemberFinancials(member);
                const batch = batches.find(b => b.id === member.batchId);
                const batchName = batch ? batch.name : "No Batch";

                // Badges configuration
                let badgeStyle = "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400";
                if (financials.paymentStatus === "Paid") {
                  badgeStyle = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400";
                } else if (financials.paymentStatus === "Partially Paid") {
                  badgeStyle = "bg-amber-50 text-amber-600 dark:bg-amber-955/20 dark:text-[#D4AF37]";
                }

                return (
                  <TableRow key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-[#121916]/30 transition-colors">
                    <TableCell>
                      <div className="font-extrabold text-xs text-slate-800 dark:text-slate-100">{member.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">{member.memberId}</div>
                      <div className="text-[9.5px] text-slate-450 dark:text-slate-400 mt-1.5 flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-[#1f8f60] shrink-0" /> Registered: {member.dateRegistered}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-xs text-slate-650 dark:text-slate-350 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {member.contactNumber}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-450 dark:text-slate-450 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-450 shrink-0" /> {member.email}
                      </span>
                      <span className="flex items-center gap-1.5 text-[9.5px] text-slate-450 dark:text-slate-450 mt-1 truncate max-w-[160px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {member.address}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-100/50">
                        {batchName}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs">
                      ₱{member.totalDue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-emerald-600 dark:text-[#52b788]">
                      ₱{financials.totalPaid.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-red-600 dark:text-red-400">
                      ₱{financials.remaining.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${badgeStyle}`}>
                        {financials.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        {viewTab === "Active" ? (
                          <>
                            <Link href="/admin/payments">
                              <Button variant="outline" size="sm" className="px-2 py-1 text-[10px] flex items-center gap-1 border-emerald-100 hover:border-emerald-250 cursor-pointer" title="Record Payment">
                                <CreditCard className="w-3.5 h-3.5 text-[#1f8f60]" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="px-2 py-1 text-[10px] border-slate-100 hover:bg-slate-50 cursor-pointer"
                              onClick={() => openEditModal(member)}
                              title="Edit Member"
                              icon={<Edit className="w-3.5 h-3.5 text-slate-500" />}
                            />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="px-2 py-1 text-[10px] border-red-50 hover:bg-red-50 cursor-pointer"
                              onClick={() => handleArchive(member.id)}
                              title="Archive Member"
                              icon={<Archive className="w-3.5 h-3.5 text-red-550" />}
                            />
                          </>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="px-2 py-1 text-[10px] border-emerald-100 hover:bg-emerald-50 cursor-pointer"
                            onClick={() => handleRestore(member.id)}
                            title="Restore Member"
                            icon={<RotateCcw className="w-3.5 h-3.5 text-emerald-600" />}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Program Member"
        size="md"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button 
              variant="outline" 
              onClick={() => setIsAddModalOpen(false)}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddSubmit}
              className="text-xs cursor-pointer"
              isLoading={isSubmitting}
            >
              Register Member
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-left">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-100 text-xs text-red-655 font-bold rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-transparent text-slate-800 dark:text-slate-100"
                placeholder="e.g. John Doe"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Contact Number *</label>
              <input
                type="text"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-transparent text-slate-800 dark:text-slate-100"
                placeholder="e.g. 0917-123-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-transparent text-slate-800 dark:text-slate-100"
                placeholder="e.g. john.doe@gmail.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Complete Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-transparent text-slate-800 dark:text-slate-100"
                placeholder="e.g. Aliaga, Nueva Ecija"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Program Batch</label>
              <select
                value={batchId}
                onChange={(e) => handleBatchChange(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-semibold bg-transparent text-slate-800 dark:text-slate-100"
              >
                {batches.filter(b => b.status !== "Archived").map(b => (
                  <option key={b.id} value={b.id}>{b.name} (Due: ₱{b.totalDue})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Total Amount Due (₱) *</label>
              <input
                type="number"
                required
                value={totalDue}
                onChange={(e) => setTotalDue(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-bold font-mono bg-transparent text-slate-800 dark:text-slate-100"
                placeholder="5000"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Additional Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-transparent text-slate-800 dark:text-slate-100"
              rows={3}
              placeholder="Record any comments, preferences, or payment structures here..."
            />
          </div>
        </form>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modify Member Information"
        size="md"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(false)}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleEditSubmit}
              className="text-xs cursor-pointer"
              isLoading={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-100 text-xs text-red-655 font-bold rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-transparent text-slate-800 dark:text-slate-100"
                placeholder="e.g. John Doe"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Contact Number *</label>
              <input
                type="text"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-transparent text-slate-800 dark:text-slate-100"
                placeholder="e.g. 0917-123-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-transparent text-slate-800 dark:text-slate-100"
                placeholder="e.g. john.doe@gmail.com"
                disabled
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Complete Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-transparent text-slate-800 dark:text-slate-100"
                placeholder="e.g. Aliaga, Nueva Ecija"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Program Batch</label>
              <select
                value={batchId}
                onChange={(e) => handleBatchChange(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-semibold bg-transparent text-slate-800 dark:text-slate-100"
              >
                {batches.filter(b => b.status !== "Archived").map(b => (
                  <option key={b.id} value={b.id}>{b.name} (Due: ₱{b.totalDue})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Total Amount Due (₱) *</label>
              <input
                type="number"
                required
                value={totalDue}
                onChange={(e) => setTotalDue(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-bold font-mono bg-transparent text-slate-800 dark:text-slate-100"
                placeholder="5000"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Additional Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-transparent text-slate-800 dark:text-slate-100"
              rows={3}
              placeholder="Record any comments, preferences, or payment structures here..."
            />
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}

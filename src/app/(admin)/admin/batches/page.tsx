"use client";

import React, { useState, useMemo } from "react";
import { useRole, Batch, Member } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { 
  Layers, 
  Plus, 
  Edit, 
  Archive, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Coins, 
  TrendingUp, 
  RotateCcw,
  BookOpen,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminBatchesPage() {
  const { 
    batches, 
    members, 
    memberPayments, 
    addBatch, 
    updateBatch, 
    archiveBatch 
  } = useRole();

  // Selected view tab
  const [viewTab, setViewTab] = useState<"Active" | "Archived">("Active");

  // Expandable batch detail view (id of expanded batch)
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);

  // Form State
  const [batchName, setBatchName] = useState("");
  const [totalDue, setTotalDue] = useState("5000");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper: compute financial details for a batch
  const getBatchMetrics = (batch: Batch) => {
    const batchMembers = members.filter(m => m.batchId === batch.id && m.membershipStatus !== "Archived");
    const totalMembers = batchMembers.length;
    
    // Total Payments
    const totalPaid = memberPayments
      .filter(p => p.batchId === batch.id)
      .reduce((sum, p) => sum + p.amountPaid, 0);

    // Total Due from members
    const expectedDue = batchMembers.reduce((sum, m) => sum + m.totalDue, 0);
    const outstanding = Math.max(0, expectedDue - totalPaid);
    
    const progressPercent = expectedDue > 0 ? Math.min(100, Math.round((totalPaid / expectedDue) * 100)) : 0;

    return { totalMembers, totalPaid, expectedDue, outstanding, progressPercent };
  };

  // Filtered list based on active/archived status
  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      if (viewTab === "Active") {
        return b.status !== "Archived";
      } else {
        return b.status === "Archived";
      }
    });
  }, [batches, viewTab]);

  // Actions
  const openAddModal = () => {
    setBatchName("");
    setTotalDue("5000");
    setFormError("");
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName) {
      setFormError("Batch name is required.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    const success = await addBatch({
      name: batchName,
      totalDue: Number(totalDue)
    });

    setIsSubmitting(false);
    if (success) {
      setIsAddModalOpen(false);
    } else {
      setFormError("Failed to create batch. The name might already exist.");
    }
  };

  const openEditModal = (batch: Batch) => {
    setCurrentBatch(batch);
    setBatchName(batch.name);
    setTotalDue(batch.totalDue.toString());
    setFormError("");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBatch || !batchName) {
      setFormError("Batch name is required.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    const success = await updateBatch(currentBatch.id, {
      name: batchName,
      totalDue: Number(totalDue)
    });

    setIsSubmitting(false);
    if (success) {
      setIsEditModalOpen(false);
    } else {
      setFormError("Failed to update batch details.");
    }
  };

  const handleArchive = async (id: string) => {
    if (confirm("Are you sure you want to archive this batch? Associated members will remain, but the batch group itself will be hidden.")) {
      await archiveBatch(id);
    }
  };

  const handleRestore = async (id: string) => {
    await updateBatch(id, { status: "Active" });
  };

  const toggleExpandBatch = (id: string) => {
    if (expandedBatchId === id) {
      setExpandedBatchId(null);
    } else {
      setExpandedBatchId(id);
    }
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
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="space-y-1.5 z-10">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#D4AF37]" /> Program Batch Hub
          </h1>
          <p className="text-xs text-emerald-100/80 font-medium">
            Monitor and coordinate program cohorts, collect dues, and review metrics.
          </p>
        </div>

        <Button 
          variant="secondary" 
          className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-900 text-xs font-bold uppercase z-10 py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
          onClick={openAddModal}
          icon={<Plus className="w-4 h-4" />}
        >
          Create Batch
        </Button>
      </div>

      {/* Tabs Toolbar */}
      <div className="flex justify-between items-center bg-white dark:bg-[#0f1412] p-2.5 rounded-2xl border border-emerald-100/50 dark:border-emerald-950/20 shadow-xs">
        <span className="text-xs font-bold text-slate-500 pl-2">Filter Batches</span>
        
        <div className="bg-slate-100 dark:bg-[#070a09] p-1 rounded-xl flex gap-1 border border-slate-200/50 dark:border-emerald-955/20">
          <button 
            onClick={() => setViewTab("Active")}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${viewTab === "Active" ? "bg-white dark:bg-[#0f1412] text-slate-800 dark:text-slate-100 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
          >
            Active Groups
          </button>
          <button 
            onClick={() => setViewTab("Archived")}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${viewTab === "Archived" ? "bg-white dark:bg-[#0f1412] text-slate-800 dark:text-slate-100 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
          >
            Archived ({batches.filter(b => b.status === "Archived").length})
          </button>
        </div>
      </div>

      {/* Batch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBatches.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 font-medium text-xs border border-dashed border-slate-200 dark:border-emerald-950/40 rounded-3xl bg-white dark:bg-[#0f1412]">
            No batch cohorts registered in this tab.
          </div>
        ) : (
          filteredBatches.map((batch) => {
            const metrics = getBatchMetrics(batch);
            const isExpanded = expandedBatchId === batch.id;

            return (
              <motion.div 
                layout
                key={batch.id} 
                className="bg-white dark:bg-[#0f1412] border border-slate-100 dark:border-[#182620] rounded-3xl shadow-2xs overflow-hidden flex flex-col justify-between"
              >
                {/* Card Top */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-sm uppercase tracking-wide">
                        {batch.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold">
                        Created default due: ₱{batch.totalDue.toLocaleString()}
                      </p>
                    </div>
                    
                    <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-[#1f8f60] dark:text-[#52b788] px-2.5 py-1 rounded-xl text-[10px] font-extrabold border border-emerald-100/50">
                      <Users className="w-3.5 h-3.5" /> {metrics.totalMembers} Members
                    </span>
                  </div>

                  {/* Financial Mini Grid */}
                  <div className="grid grid-cols-2 gap-3.5 pt-1.5">
                    <div className="bg-slate-50/50 dark:bg-[#080d0a]/40 border border-slate-200/50 dark:border-emerald-950/20 p-2.5 rounded-2xl">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Collections</span>
                      <span className="text-xs font-mono font-extrabold text-slate-800 dark:text-slate-100">
                        ₱{metrics.totalPaid.toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-slate-50/50 dark:bg-[#080d0a]/40 border border-slate-200/50 dark:border-emerald-950/20 p-2.5 rounded-2xl">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Outstanding Balances</span>
                      <span className="text-xs font-mono font-extrabold text-red-600 dark:text-red-400">
                        ₱{metrics.outstanding.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Collection Progress bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[9.5px] font-bold text-slate-450 dark:text-slate-400">
                      <span>Collection Coverage</span>
                      <span className="font-mono">{metrics.progressPercent}% Collected</span>
                    </div>
                    
                    <div className="h-2 bg-slate-100 dark:bg-emerald-950/20 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-full rounded-full transition-all duration-550" 
                        style={{ width: `${metrics.progressPercent}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions Bottom */}
                <div className="px-6 py-4 bg-slate-50/60 dark:bg-[#080d0a]/40 border-t border-slate-100 dark:border-[#182620] flex items-center justify-between shrink-0">
                  <button 
                    onClick={() => toggleExpandBatch(batch.id)}
                    className="text-xs text-[#1f8f60] dark:text-[#D4AF37] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {isExpanded ? (
                      <>Hide Cohort <ChevronUp className="w-3.5 h-3.5" /></>
                    ) : (
                      <>View Members <ChevronDown className="w-3.5 h-3.5" /></>
                    )}
                  </button>

                  <div className="flex gap-1.5">
                    {viewTab === "Active" ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="px-2 py-1 text-[10px] border-slate-200 hover:bg-slate-50 cursor-pointer"
                          onClick={() => openEditModal(batch)}
                          icon={<Edit className="w-3.5 h-3.5 text-slate-500" />}
                          title="Rename Batch"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="px-2 py-1 text-[10px] border-red-100 hover:bg-red-50 cursor-pointer"
                          onClick={() => handleArchive(batch.id)}
                          icon={<Archive className="w-3.5 h-3.5 text-red-550" />}
                          title="Archive Batch"
                        />
                      </>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="px-2.5 py-1 text-[10px] border-emerald-100 hover:bg-emerald-50 cursor-pointer flex items-center gap-1"
                        onClick={() => handleRestore(batch.id)}
                        icon={<RotateCcw className="w-3.5 h-3.5 text-emerald-600" />}
                      >
                        Restore
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expandable Members list */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 dark:border-[#182620] overflow-hidden bg-slate-50/20 dark:bg-[#070a09]/10"
                    >
                      <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Members of {batch.name}</h4>
                        {members.filter(m => m.batchId === batch.id && m.membershipStatus !== "Archived").length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4 font-semibold">No active members in this batch yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {members
                              .filter(m => m.batchId === batch.id && m.membershipStatus !== "Archived")
                              .map(member => {
                                const totalPaidMember = memberPayments
                                  .filter(p => p.memberId === member.id)
                                  .reduce((sum, p) => sum + p.amountPaid, 0);
                                const remBal = member.totalDue - totalPaidMember;

                                return (
                                  <div key={member.id} className="flex justify-between items-center text-xs p-2 bg-white dark:bg-[#0f1412] border border-slate-150/60 dark:border-emerald-950/20 rounded-xl shadow-3xs">
                                    <div>
                                      <span className="font-extrabold text-slate-800 dark:text-slate-100">{member.fullName}</span>
                                      <span className="text-[9px] text-slate-400 block font-mono uppercase tracking-wider">{member.memberId}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-bold text-slate-850 dark:text-slate-200">Paid: ₱{totalPaidMember.toLocaleString()}</span>
                                      <span className={`block text-[9.5px] font-bold ${remBal <= 0 ? "text-emerald-600" : "text-red-500"}`}>
                                        {remBal <= 0 ? "Fully Paid" : `Bal: ₱${remBal.toLocaleString()}`}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Batch Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Setup Program Cohort Batch"
        size="sm"
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
              Create Batch
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-left">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-100 text-xs text-red-655 font-bold rounded-xl flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-red-600" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Batch Name *</label>
            <input
              type="text"
              required
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-transparent text-slate-800 dark:text-slate-100"
              placeholder="e.g. Batch 16"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Default Registration Fee / Due (₱) *</label>
            <input
              type="number"
              required
              value={totalDue}
              onChange={(e) => setTotalDue(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-bold font-mono bg-transparent text-slate-800 dark:text-slate-100"
              placeholder="5000"
            />
            <p className="text-[9.5px] text-slate-400 font-semibold leading-normal pt-1">
              This amount will be pre-filled as the default Total Amount Due when registering members under this batch.
            </p>
          </div>
        </form>
      </Modal>

      {/* Edit Batch Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modify Batch Details"
        size="sm"
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
              <RotateCcw className="w-4 h-4 text-red-600" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Batch Name *</label>
            <input
              type="text"
              required
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium bg-transparent text-slate-800 dark:text-slate-100"
              placeholder="e.g. Batch 16"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Default Registration Fee / Due (₱) *</label>
            <input
              type="number"
              required
              value={totalDue}
              onChange={(e) => setTotalDue(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-bold font-mono bg-transparent text-slate-800 dark:text-slate-100"
              placeholder="5000"
            />
          </div>
        </form>
      </Modal>

      <div className="flex items-start gap-2.5 p-4 bg-slate-50 dark:bg-[#070a09] rounded-2xl border border-slate-150/60 dark:border-emerald-950/20 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
        <Info className="w-4.5 h-4.5 text-primary-600 shrink-0 mt-0.5" />
        <span>Archiving a batch does not delete its member registry. It simply cleanses the active dashboard panels. Outstanding dues and collection logs from archived cohorts are still accounted for in audit calculations and reports.</span>
      </div>
    </motion.div>
  );
}

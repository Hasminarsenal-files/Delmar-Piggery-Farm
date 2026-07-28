"use client";

import React, { useState } from "react";
import { useRole, OnlinePaymentChannel } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Settings, Plus, CreditCard, CheckCircle2, XCircle, Edit3, Trash2, Shield, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminPaymentSettingsPage() {
  const { onlinePaymentChannels, updateOnlinePaymentChannels } = useRole();

  const [channels, setChannels] = useState<OnlinePaymentChannel[]>(onlinePaymentChannels);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<OnlinePaymentChannel | null>(null);

  // Form State
  const [providerName, setProviderName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleOpenAdd = () => {
    setEditingChannel(null);
    setProviderName("");
    setAccountName("Delmar E. Arsenal");
    setAccountNumber("");
    setInstructions("1. Send exact amount to the account above.\n2. Complete payment in your online banking/wallet app.\n3. Copy the Reference Number and submit below for verification.");
    setIsActive(true);
    setIsChannelModalOpen(true);
  };

  const handleOpenEdit = (channel: OnlinePaymentChannel) => {
    setEditingChannel(channel);
    setProviderName(channel.providerName);
    setAccountName(channel.accountName);
    setAccountNumber(channel.accountNumber);
    setInstructions(channel.instructions);
    setIsActive(channel.isActive);
    setIsChannelModalOpen(true);
  };

  const handleSaveChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: OnlinePaymentChannel[];
    if (editingChannel) {
      updated = channels.map(c => c.id === editingChannel.id ? {
        ...c,
        providerName,
        accountName,
        accountNumber,
        instructions,
        isActive
      } : c);
    } else {
      const newChan: OnlinePaymentChannel = {
        id: `pay-chan-${Date.now()}`,
        providerName,
        accountName,
        accountNumber,
        instructions,
        isActive
      };
      updated = [...channels, newChan];
    }

    setChannels(updated);
    await updateOnlinePaymentChannels(updated);
    setIsChannelModalOpen(false);
  };

  const handleToggleActive = async (id: string) => {
    const updated = channels.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c);
    setChannels(updated);
    await updateOnlinePaymentChannels(updated);
  };

  const handleDeleteChannel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment channel?")) return;
    const updated = channels.filter(c => c.id !== id);
    setChannels(updated);
    await updateOnlinePaymentChannels(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 font-sans pb-12"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-900 to-[#1B4332] p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#D4AF37]" /> Admin Payment Channels Configuration
          </h1>
          <p className="text-xs text-emerald-100/80 font-medium">
            Configure GCash, BanKo, and custom online payment instructions shown during customer checkout.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-900 text-xs font-bold uppercase z-10 py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Payment Channel
        </Button>
      </div>

      {/* Info Alert */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 text-xs text-blue-900 font-medium">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <strong>How Online Payment Channels Work:</strong> Active channels configured here will immediately appear in the customer checkout modal on the public Products page and customer Paluwagan online remittance form. Customers copy account details, pay via their mobile banking app, and enter their reference number for manual admin verification.
        </div>
      </div>

      {/* Payment Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {channels.map((chan) => (
          <Card key={chan.id} className="p-5 space-y-4 border border-slate-200 rounded-3xl relative overflow-hidden bg-white shadow-xs">
            <div className={`absolute top-0 left-0 right-0 h-1 ${chan.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />

            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-base font-extrabold text-slate-800">{chan.providerName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                    chan.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                  }`}>
                    {chan.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-600">
                  Acct Name: <span className="text-slate-800">{chan.accountName}</span>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block">
                  Acct Number: {chan.accountNumber}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="outline" onClick={() => handleOpenEdit(chan)}>
                  <Edit3 className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteChannel(chan.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-[11px]">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">Checkout Payment Instructions</span>
              <p className="text-slate-600 font-medium whitespace-pre-line leading-relaxed">
                {chan.instructions}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Channel Status Toggle</span>
              <Button
                size="sm"
                variant={chan.isActive ? "outline" : "primary"}
                onClick={() => handleToggleActive(chan.id)}
                className="text-[10px] font-bold uppercase"
              >
                {chan.isActive ? "Deactivate Channel" : "Activate Channel"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal for Adding/Editing Payment Channels */}
      <Modal isOpen={isChannelModalOpen} onClose={() => setIsChannelModalOpen(false)} title={editingChannel ? `Edit Payment Channel: ${editingChannel.providerName}` : "Add New Payment Channel"}>
        <form onSubmit={handleSaveChannel} className="space-y-4 font-sans text-xs">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 uppercase">Provider / Bank Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. GCash Mobile, BanKo BPI, Maya"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 uppercase">Account Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Delmar E. Arsenal"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 uppercase">Account / Mobile Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. 09464544973 or 1800-1945-2644"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 uppercase">Payment Instructions *</label>
            <textarea
              required
              rows={4}
              placeholder="Enter step-by-step instructions for the customer..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl font-medium leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="active-toggle"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="active-toggle" className="text-xs font-bold text-slate-700 cursor-pointer">
              Active Payment Channel (Visible to Customers)
            </label>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full">
              Save Channel Configuration
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}

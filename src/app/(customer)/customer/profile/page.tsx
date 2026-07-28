"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, User, Phone, Mail, MapPin, Wallet } from "lucide-react";

export default function CustomerProfilePage() {
  const { userName, userEmail, userPhone, userAddress, updateProfile } = useRole();
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState(userPhone);
  const [address, setAddress] = useState(userAddress);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setName(userName);
    setEmail(userEmail);
    setPhone(userPhone);
    setAddress(userAddress);
  }, [userName, userEmail, userPhone, userAddress]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(name, email, phone, address);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">My Profile Settings</h1>
        <p className="text-xs text-slate-500 font-medium">Manage default delivery coordinates and password authentication.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Details Form */}
        <div className="lg:col-span-8">
          <Card className="p-6 sm:p-8">
            {success && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Simulated Profile settings updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Default Delivery Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    rows={3}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Sidebar Billing info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-slate-50 border border-slate-100">
            <h3 className="font-heading text-xs font-bold text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary-600" /> Payment Channels
            </h3>
            
            <div className="space-y-3.5 text-xs font-medium text-slate-500">
              <p>Your billing account defaults are synced with the farm. You can pay reservations using:</p>
              
              <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-1">
                <div className="font-bold text-slate-800">GCash Mobile</div>
                <div className="text-[10px] text-slate-400">09464544973 (Delmar E. Arsenal)</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-1">
                <div className="font-bold text-slate-800">BanKo (Subsidiary of BPI)</div>
                <div className="text-[10px] text-slate-400">Acct: 1800-1945-2644 (Delmar E. Arsenal)</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

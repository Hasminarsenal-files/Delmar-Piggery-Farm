"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Wallet, CreditCard, ShieldCheck } from "lucide-react";

export default function CustomerPaymentMethodsPage() {
  const { userName, userPhone } = useRole();

  // Customer Preferred Payment Method state
  const [preferredMethod, setPreferredMethod] = useState<string>("GCash Mobile");
  const [accountName, setAccountName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [paymentSaved, setPaymentSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPreferredMethod(localStorage.getItem("delmar_customer_payment_method") || "GCash Mobile");
      setAccountName(localStorage.getItem("delmar_customer_account_name") || userName);
      setAccountNumber(localStorage.getItem("delmar_customer_account_number") || userPhone);
    }
  }, [userName, userPhone]);

  const handleSavePaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("delmar_customer_payment_method", preferredMethod);
      localStorage.setItem("delmar_customer_account_name", accountName);
      localStorage.setItem("delmar_customer_account_number", accountNumber);
    }
    setPaymentSaved(true);
    setTimeout(() => {
      setPaymentSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">Payment Methods & Channels</h1>
        <p className="text-xs text-slate-500 font-medium">Manage your personal payment method defaults and view official farm remittance channels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Customer Preferred Payment Method Card */}
        <div className="lg:col-span-7">
          <Card className="p-6 sm:p-8">
            <h2 className="font-heading text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary-600" /> My Preferred Payment Method
            </h2>
            <p className="text-xs text-slate-500 font-medium mb-5">Set your default payment channel and account details for quick order checkout and Paluwagan remittances.</p>

            {paymentSaved && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Preferred payment method saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSavePaymentMethod} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Preferred Payment Channel</label>
                <select
                  value={preferredMethod}
                  onChange={(e) => setPreferredMethod(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-semibold text-slate-800 bg-white"
                >
                  <option value="GCash Mobile">GCash Mobile</option>
                  <option value="BanKo (Subsidiary of BPI)">BanKo (Subsidiary of BPI)</option>
                  <option value="BDO Bank Transfer">BDO Bank Transfer</option>
                  <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                  <option value="Cash on Pickup">Cash on Pickup</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase">Account / Sender Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Hasmin Arsenal"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase">Account / Mobile Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 09464544973"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit">Save Payment Method</Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Official Farm Receiver Accounts Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 bg-slate-50 border border-slate-100">
            <h3 className="font-heading text-xs font-bold text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary-600" /> Farm Payment Channels
            </h3>
            
            <div className="space-y-3.5 text-xs font-medium text-slate-500">
              <p>Official farm billing accounts for customer deposits, Paluwagan installments, and meat orders:</p>
              
              <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">GCash Mobile</span>
                  <span className="px-2 py-0.5 text-[9px] font-extrabold bg-blue-50 text-blue-700 rounded-full border border-blue-100">Verified</span>
                </div>
                <div className="text-xs font-semibold text-slate-700">09464544973</div>
                <div className="text-[10px] text-slate-400 font-medium">Account Name: Delmar E. Arsenal</div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">BanKo (Subsidiary of BPI)</span>
                  <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">Verified Bank</span>
                </div>
                <div className="text-xs font-semibold text-slate-700">Acct: 1800-1945-2644</div>
                <div className="text-[10px] text-slate-400 font-medium">Account Name: Delmar E. Arsenal</div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl text-[11px] text-amber-800 font-medium space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Remittance Security Notice
                </div>
                <p className="leading-relaxed text-[10px]">
                  Always save your transaction receipt or reference code when submitting payments to our farm channels.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

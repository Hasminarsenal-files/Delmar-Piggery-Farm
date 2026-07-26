"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Calendar,
  Ban,
  UserCheck,
  CreditCard,
  UserPlus,
  Heart,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  PiggyBank,
  FileText,
  ArrowRight,
  HelpCircle
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-24 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary-900/30 via-emerald-950/20 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Header Section */}
      <div className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase mb-6"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Official Business Policies & Guidelines
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight"
        >
          Terms & Conditions
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-3 text-lg font-heading font-bold text-amber-400"
        >
          Delmar Piggery Farm – Home of Crisprylicious Lechon
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xs sm:text-sm text-emerald-400 font-medium tracking-wide uppercase mt-1"
        >
          By Savorlicious Food Services
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6 max-w-3xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed"
        >
          Welcome! To all members of the <span className="font-semibold text-white">Crisprylicious Lechon Paluwagan</span>, 
          we kindly ask everyone to read and understand our policies. These guidelines are designed to protect both our members 
          and <span className="font-semibold text-white">Delmar Piggery Farm</span> to ensure a smooth, fair, and successful experience for everyone.
        </motion.p>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Core Value Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-r from-emerald-950/80 via-primary-950/90 to-emerald-950/80 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                Built on Trust, Commitment & Community
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
                Same Price as Our Cash Price — No Hidden Charges
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Our <strong className="text-emerald-300">Crisprylicious Lechon Paluwagan</strong> is offered at the 
                <span className="text-amber-300 font-bold"> exact same price as our CASH PRICE</span>, meaning you get your lechon at 
                the same price as a cash purchase—with <span className="text-white font-semibold">no additional interest or hidden charges</span>. 
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Because of this special arrangement, we sincerely ask everyone to honor their commitment by paying their scheduled contributions 
                on time. While we do not impose penalties for late payments, timely contributions are essential to sustain our piggery operations 
                and ensure that every member receives their Crisprylicious Lechon as scheduled.
              </p>
            </div>

            <div className="lg:col-span-4 bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-5 space-y-3 text-center sm:text-left">
              <div className="flex items-center gap-3 justify-center sm:justify-start text-emerald-400 font-bold text-sm">
                <PiggyBank className="w-6 h-6 shrink-0" />
                <span>Zero Interest Paluwagan</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Cash-equivalent pricing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No interest fees or surprise surcharges</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Guaranteed slot and fresh delivery</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Policy Grid (6 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* 1. Early Delivery Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="flex flex-col h-full"
          >
            <Card className="bg-slate-900/90 border-slate-800 hover:border-emerald-500/40 transition-all duration-300 p-6 flex flex-col justify-between h-full shadow-xl rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Policy #1</span>
                    <h3 className="text-lg font-heading font-extrabold text-white">Early Delivery Policy</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Customers who wish to receive their Crisprylicious Lechon earlier than their assigned delivery month may request an early delivery. 
                  Approval of the request shall be at the discretion of Savorlicious Food Services, depending on the delivery schedule and production capacity.
                </p>

                <div className="space-y-2.5 pt-3 border-t border-slate-800 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>To qualify, the customer must first pay all scheduled contributions up to their originally assigned delivery month.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Ensures the account is updated with no overdue balance before lechon release.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Following advance payment, customer shall continue paying succeeding monthly contributions through the 12-month period.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Once all required contributions have been paid, the account is fully settled.</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 2. Cancellation Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col h-full"
          >
            <Card className="bg-slate-900/90 border-slate-800 hover:border-amber-500/40 transition-all duration-300 p-6 flex flex-col justify-between h-full shadow-xl rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all" />
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-400">
                    <Ban className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Policy #2</span>
                    <h3 className="text-lg font-heading font-extrabold text-white">Cancellation Policy</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Customers who voluntarily withdraw from or cancel their participation in the Crisprylicious Lechon Paluwagan before completing the program 
                  acknowledge that all contributions made are final and non-refundable.
                </p>

                <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 space-y-2 mt-2 text-xs text-amber-200/90">
                  <div className="flex items-start gap-2 font-semibold text-amber-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Important Acknowledgment</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-slate-300">
                    By joining the Delmar Piggery Farm – Crisprylicious Lechon Paluwagan by Savorlicious Food Services, the customer understands, accepts, 
                    and agrees that all payments made are final and non-refundable, regardless of voluntary cancellation, change of mind, inability to continue 
                    scheduled contributions, or personal circumstances.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 3. Transfer of Membership */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-col h-full"
          >
            <Card className="bg-slate-900/90 border-slate-800 hover:border-blue-500/40 transition-all duration-300 p-6 flex flex-col justify-between h-full shadow-xl rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all" />
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-500/30 text-blue-400">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Policy #3</span>
                    <h3 className="text-lg font-heading font-extrabold text-white">Transfer of Membership</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  A customer who can no longer continue participating in the paluwagan may, subject to the approval of Savorlicious Food Services, 
                  transfer their membership slot to another qualified person.
                </p>

                <div className="bg-slate-950/60 border border-blue-500/20 rounded-xl p-4 space-y-2 mt-4 text-xs">
                  <span className="block font-bold text-blue-300">Substitute Member Obligations</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    The substitute member shall assume all remaining payment obligations and shall be bound by the exact same Terms and Conditions 
                    of the Crisprylicious Lechon Paluwagan.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 4. Payment Commitment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col h-full"
          >
            <Card className="bg-slate-900/90 border-slate-800 hover:border-emerald-500/40 transition-all duration-300 p-6 flex flex-col justify-between h-full shadow-xl rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Policy #4</span>
                    <h3 className="text-lg font-heading font-extrabold text-white">Payment Commitment</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  <strong className="text-white">We do not charge penalties for late payments.</strong> However, we highly encourage all members to pay 
                  their scheduled contributions on time to support smooth operations.
                </p>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Timely payments help us sustain our piggery operations and ensure the smooth and timely delivery of Crisprylicious Lechon to every member.
                </p>

                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-center text-xs font-medium text-emerald-300">
                  ❤️ Your commitment and cooperation make this paluwagan possible for everyone.
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 5. Late Joiner Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex flex-col h-full"
          >
            <Card className="bg-slate-900/90 border-slate-800 hover:border-purple-500/40 transition-all duration-300 p-6 flex flex-col justify-between h-full shadow-xl rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all" />
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-400">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">Policy #5</span>
                    <h3 className="text-lg font-heading font-extrabold text-white">Late Joiner Policy</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Customers who join the Crisprylicious Lechon Paluwagan after the batch has already started may still be accommodated, 
                  provided that delivery slots are still available.
                </p>

                <div className="space-y-2.5 pt-3 border-t border-slate-800 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Must pay all scheduled contributions from the start of the batch up to their chosen delivery month (catch-up contributions).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Ensures account is updated with no overdue balance before lechon release.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Succeeding monthly contributions continue through the 12-month period.</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 6. Community & Thank You */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col h-full"
          >
            <Card className="bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-500/40 transition-all duration-300 p-6 flex flex-col justify-between h-full shadow-xl rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all" />
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-400">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-rose-400 font-bold">Community</span>
                    <h3 className="text-lg font-heading font-extrabold text-white">Thank You!</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Thank you for trusting <strong className="text-white">Delmar Piggery Farm – Home of Crisprylicious Lechon by Savorlicious Food Services</strong>.
                </p>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Every contribution helps support our piggery operations, allowing us to raise quality hogs and serve delicious Crisprylicious Lechon while keeping our paluwagan sustainable.
                </p>

                <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3 text-center text-xs font-semibold text-rose-200">
                  Together, let's build a community founded on trust, commitment, and mutual support!
                </div>
              </div>
            </Card>
          </motion.div>

        </div>

        {/* Footer CTA & Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center space-y-6 max-w-4xl mx-auto shadow-2xl"
        >
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-white">
            Ready to Join the Crisprylicious Lechon Paluwagan?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Reserve your delivery month slot today at cash-equivalent pricing with zero interest or hidden charges.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/customer/paluwagan-membership">
              <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl gap-2 shadow-lg shadow-emerald-950">
                <span>Apply for Paluwagan</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/faqs">
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 px-6 py-3 rounded-xl gap-2">
                <HelpCircle className="w-4 h-4" />
                <span>Frequently Asked Questions</span>
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

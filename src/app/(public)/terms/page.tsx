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
  AlertTriangle,
  PiggyBank,
  ArrowRight,
  HelpCircle,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#070F0B] text-slate-100 font-sans pb-24 relative overflow-hidden">
      {/* Glow Accent Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-600/20 via-emerald-950/30 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Header Section */}
      <div className="relative pt-14 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-widest uppercase shadow-lg"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Official Business Policies & Guidelines
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight"
        >
          Terms & Conditions
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-lg sm:text-xl font-heading font-bold text-amber-400 tracking-wide"
        >
          Delmar Piggery Farm – Home of Crisprylicious Lechon
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-xs sm:text-sm text-emerald-400 font-extrabold tracking-widest uppercase"
        >
          By Savorlicious Food Services
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="max-w-3xl mx-auto text-sm sm:text-base text-slate-200 leading-relaxed font-normal pt-2"
        >
          Welcome! To all members of the <strong className="text-white font-semibold">Crisprylicious Lechon Paluwagan</strong>, 
          we kindly ask everyone to read and understand our policies. These guidelines are designed to protect both our members 
          and <strong className="text-white font-semibold">Delmar Piggery Farm</strong> to ensure a smooth, fair, and successful experience for everyone.
        </motion.p>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Core Value Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-[#0F1B16] via-[#14261F] to-[#0F1B16] border border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-widest bg-amber-950/60 px-3 py-1 rounded-md border border-amber-500/30">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Built on Trust, Commitment & Community
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-white leading-tight">
                Same Price as Our Cash Price — No Additional Interest or Hidden Charges
              </h2>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                Our <strong className="text-emerald-300 font-bold">Crisprylicious Lechon Paluwagan</strong> is offered at the 
                <span className="text-amber-300 font-extrabold underline decoration-amber-500/50 underline-offset-4"> exact same price as our CASH PRICE</span>, 
                meaning you get your lechon at the same price as a cash purchase—with <strong className="text-white">no additional interest or hidden charges</strong>.
              </p>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                Because of this special arrangement, we sincerely ask everyone to honor their commitment by paying their scheduled contributions on time. 
                While we do not impose penalties for late payments, timely contributions are essential to sustain our piggery operations and ensure that every member receives their Crisprylicious Lechon as scheduled.
              </p>
            </div>

            <div className="lg:col-span-4 bg-[#08120D] border border-emerald-500/30 rounded-2xl p-6 space-y-4 text-left shadow-inner">
              <div className="flex items-center gap-3 text-emerald-400 font-black text-base border-b border-emerald-900/60 pb-3">
                <PiggyBank className="w-6 h-6 text-emerald-400 shrink-0" />
                <span>Zero Interest Guarantee</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-200 font-medium">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-white">100% Cash-equivalent pricing</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-white">Zero interest or hidden surcharges</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-white">Guaranteed slot & fresh roast release</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* 6 Policy Cards Grid - High Contrast Dark Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 1. Early Delivery Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="flex flex-col h-full"
          >
            <div className="bg-[#111D17] border border-emerald-500/30 rounded-2xl p-6 flex flex-col justify-between h-full shadow-xl hover:border-emerald-500/60 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-400 shadow-md">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-black">Policy #1</span>
                    <h3 className="text-lg font-heading font-extrabold text-white">Early Delivery Policy</h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  Customers who wish to receive their Crisprylicious Lechon earlier than their assigned delivery month may request an early delivery. 
                  Approval of the request shall be at the discretion of Savorlicious Food Services, depending on the delivery schedule and production capacity.
                </p>

                <div className="space-y-3 pt-3 border-t border-emerald-900/60 text-xs sm:text-sm text-slate-200">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                    <span><strong className="text-white">Requirement:</strong> Must first pay all scheduled contributions up to their originally assigned delivery month.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                    <span>Ensures the account is updated and has no overdue balance before the lechon is released.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                    <span>Following advance payment, customer shall continue paying succeeding monthly contributions through the 12-month period.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                    <span>Once all required contributions have been paid, the account shall be considered fully settled.</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. Cancellation Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col h-full"
          >
            <div className="bg-[#191812] border border-amber-500/40 rounded-2xl p-6 flex flex-col justify-between h-full shadow-xl hover:border-amber-500/70 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-950 border border-amber-500/50 text-amber-400 shadow-md">
                    <Ban className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-amber-400 font-black">Policy #2</span>
                    <h3 className="text-lg font-heading font-extrabold text-white">Cancellation Policy</h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  Customers who voluntarily withdraw from or cancel their participation in the Crisprylicious Lechon Paluwagan before completing the program 
                  acknowledge that all contributions made are <strong className="text-amber-300 font-bold">final and non-refundable</strong>.
                </p>

                <div className="bg-amber-950/80 border border-amber-500/50 rounded-xl p-4 space-y-2 mt-2 text-xs sm:text-sm text-amber-100">
                  <div className="flex items-center gap-2 font-black text-amber-400">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Important Acknowledgment</span>
                  </div>
                  <p className="leading-relaxed text-xs text-slate-200 font-medium">
                    By joining the Delmar Piggery Farm – Crisprylicious Lechon Paluwagan by Savorlicious Food Services, the customer understands, accepts, 
                    and agrees that all payments made are final and non-refundable, regardless of voluntary cancellation, change of mind, inability to continue 
                    scheduled contributions, or personal circumstances.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3. Transfer of Membership */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-col h-full"
          >
            <div className="bg-[#121922] border border-sky-500/40 rounded-2xl p-6 flex flex-col justify-between h-full shadow-xl hover:border-sky-500/70 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-sky-950 border border-sky-500/50 text-sky-400 shadow-md">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-sky-400 font-black">Policy #3</span>
                    <h3 className="text-lg font-heading font-extrabold text-white">Transfer of Membership</h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  A customer who can no longer continue participating in the paluwagan may, subject to the approval of Savorlicious Food Services, 
                  transfer their membership slot to another qualified person.
                </p>

                <div className="bg-sky-950/70 border border-sky-500/40 rounded-xl p-4 space-y-2 mt-4 text-xs sm:text-sm">
                  <span className="block font-black text-sky-300">Substitute Member Obligations</span>
                  <p className="text-slate-200 text-xs leading-relaxed font-medium">
                    The substitute member shall assume all remaining payment obligations and shall be bound by the exact same Terms and Conditions 
                    of the Crisprylicious Lechon Paluwagan.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 4. Payment Commitment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col h-full"
          >
            <div className="bg-[#111D17] border border-emerald-500/30 rounded-2xl p-6 flex flex-col justify-between h-full shadow-xl hover:border-emerald-500/60 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-400 shadow-md">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-black">Policy #4</span>
                    <h3 className="text-lg font-heading font-extrabold text-white">Payment Commitment</h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  <strong className="text-emerald-300 font-bold">We do not charge penalties for late payments.</strong> However, we highly encourage all members to pay their scheduled contributions on time.
                </p>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  Timely payments help us sustain our piggery operations and ensure the smooth and timely delivery of Crisprylicious Lechon to every member.
                </p>

                <div className="bg-emerald-950/70 border border-emerald-500/40 rounded-xl p-3.5 text-center text-xs sm:text-sm font-extrabold text-emerald-200">
                  ❤️ Your commitment and cooperation make this paluwagan possible for everyone.
                </div>
              </div>
            </div>
          </motion.div>

          {/* 5. Late Joiner Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex flex-col h-full"
          >
            <div className="bg-[#19121F] border border-purple-500/40 rounded-2xl p-6 flex flex-col justify-between h-full shadow-xl hover:border-purple-500/70 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-purple-950 border border-purple-500/50 text-purple-400 shadow-md">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-purple-400 font-black">Policy #5</span>
                    <h3 className="text-lg font-heading font-extrabold text-white">Late Joiner Policy</h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  Customers who join the Crisprylicious Lechon Paluwagan after the batch has already started may still be accommodated, 
                  provided that delivery slots are still available.
                </p>

                <div className="space-y-3 pt-3 border-t border-purple-900/60 text-xs sm:text-sm text-slate-200">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-1" />
                    <span><strong className="text-white">Catch-Up Contributions:</strong> Must pay all scheduled contributions from the start of the batch up to their chosen delivery month.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-1" />
                    <span>Ensures account is updated with no overdue balance before lechon release.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-1" />
                    <span>After delivery, customer continues paying succeeding monthly contributions until all 12 contributions are complete.</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 6. Community & Thank You */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col h-full"
          >
            <div className="bg-gradient-to-br from-[#1C1215] via-[#241519] to-[#1C1215] border border-rose-500/40 rounded-2xl p-6 flex flex-col justify-between h-full shadow-xl hover:border-rose-500/70 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-rose-950 border border-rose-500/50 text-rose-400 shadow-md">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-rose-400 font-black">Community</span>
                    <h3 className="text-lg font-heading font-extrabold text-white">Thank You!</h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  Thank you for trusting <strong className="text-white">Delmar Piggery Farm – Home of Crisprylicious Lechon by Savorlicious Food Services</strong>.
                </p>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  Every contribution helps support our piggery operations, allowing us to raise quality hogs and serve delicious Crisprylicious Lechon while keeping our paluwagan sustainable.
                </p>

                <div className="bg-rose-950/70 border border-rose-500/40 rounded-xl p-3.5 text-center text-xs sm:text-sm font-extrabold text-rose-200">
                  Together, let's build a community founded on trust, commitment, and mutual support!
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Footer CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-[#0D1813] border border-emerald-500/40 rounded-3xl p-8 sm:p-10 text-center space-y-6 max-w-4xl mx-auto shadow-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950 text-emerald-400 text-xs font-extrabold border border-emerald-500/30 uppercase tracking-widest">
            <Award className="w-4 h-4" />
            Crisprylicious Lechon Paluwagan
          </div>
          <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
            Ready to Join the Lechon Paluwagan?
          </h3>
          <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto font-normal">
            Reserve your delivery month slot today at cash-equivalent pricing with zero interest or hidden charges.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/customer/paluwagan-membership">
              <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3 rounded-xl gap-2 shadow-lg shadow-emerald-950">
                <span>Apply for Paluwagan</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/faqs">
              <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 px-6 py-3 rounded-xl gap-2 font-bold">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Frequently Asked Questions</span>
              </Button>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

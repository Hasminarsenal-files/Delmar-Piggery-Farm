"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Phone, Mail, MapPin, CheckCircle2, MessageSquare, Clock } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  return (
    <div className="pt-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 font-sans">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold font-heading text-slate-800 tracking-tight">Contact Our Farm Team</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          Book bulk piglet schedules, arrange lechon roasting times, or request direct consulting on biosecure systems.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-8 space-y-6">
            <h2 className="font-heading text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Operational Channels</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Breeding Station</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Purok Lapu-Lapu, Tickwas, Dumalinao, Zamboanga del Sur</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Direct Sales & Support</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">09464544973</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Email Enquiries</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">delmararsenal103@gmail.com</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Office Working Hours</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Monday - Saturday | 8:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Simple Map Box */}
          <div className="bg-gradient-to-br from-[#f2faf5] to-[#fcfdfd] text-slate-800 rounded-3xl p-8 border border-primary-100 flex flex-col justify-between aspect-video relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute w-40 h-40 bg-accent-light rounded-full top-2 right-2 blur-2xl" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider block">Interactive Location</span>
              <h3 className="font-heading text-sm font-bold text-primary-900 mt-1">Dumalinao, Zamboanga del Sur Location</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-655 mt-4">
              <MapPin className="w-4 h-4 text-primary-600 shrink-0" />
              <span>Zamboanga del Sur GPS: 7.8200° N, 123.3700° E</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <Card className="p-8">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 animate-bounce" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-800">Message Delivered!</h3>
                <p className="text-xs text-slate-500 font-medium">Your request has been successfully transmitted. Our farm team will contact you back shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-heading text-lg font-bold text-slate-800 border-b border-slate-50 pb-3">Send Us a Message</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase">Your Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium"
                      placeholder="Juan Dela Cruz"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium"
                      placeholder="juan.dc@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase">Subject</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium"
                    placeholder="Quotation for 20 piglets"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase">Message Body</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium leading-relaxed"
                    placeholder="Describe your request in detail..."
                  />
                </div>

                <Button type="submit" icon={<MessageSquare className="w-4 h-4" />}>
                  Send Enquiry
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>

    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRole, ChatbotFAQ } from "@/context/RoleContext";
import {
  CheckCircle2,
  Settings,
  Database,
  Sliders,
  Lock,
  Bot,
  Plus,
  Trash2,
  HelpCircle,
  Wrench,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { chatbotGuidelines, chatbotFaqs, updateChatbotSettings } = useRole();

  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "ai">("general");

  // General Settings States
  const [farmName, setFarmName] = useState("Delmar Piggery Farm");
  const [contactPhone, setContactPhone] = useState("+63 912 345 6789");
  const [biosecurityAlerts, setBiosecurityAlerts] = useState(true);
  const [autoApproveReservations, setAutoApproveReservations] = useState(false);
  const [sensorLogs, setSensorLogs] = useState(true);

  // AI Assistant States
  const [guidelines, setGuidelines] = useState(chatbotGuidelines);
  const [faqs, setFaqs] = useState<ChatbotFAQ[]>(chatbotFaqs);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  // Sync settings when context loads
  useEffect(() => {
    setGuidelines(chatbotGuidelines);
    setFaqs(chatbotFaqs);
  }, [chatbotGuidelines, chatbotFaqs]);

  // General Settings Handler
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 2500);
  };

  // AI Settings Handler
  const handleSaveAISettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateChatbotSettings(guidelines, faqs);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 2500);
    }
  };

  // FAQ Mutators
  const updateFaqQuestion = (idx: number, text: string) => {
    setFaqs(faqs.map((faq, i) => (i === idx ? { ...faq, q: text } : faq)));
  };

  const updateFaqAnswer = (idx: number, text: string) => {
    setFaqs(faqs.map((faq, i) => (i === idx ? { ...faq, a: text } : faq)));
  };

  const removeFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  const handleAddFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setFaqs([...faqs, { q: newQuestion.trim(), a: newAnswer.trim() }]);
    setNewQuestion("");
    setNewAnswer("");
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">Farm Configurations</h1>
        <p className="text-xs text-slate-500 font-medium">Control biosecurity alert scopes, pricing factors, and metadata fields.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 shrink-0">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "general"
              ? "border-primary-600 text-primary-700"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5" />
            General Settings
          </span>
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "ai"
              ? "border-primary-600 text-primary-700"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="flex items-center gap-2">
            <Bot className="w-3.5 h-3.5" />
            AI Support Assistant
          </span>
        </button>
      </div>

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Configurations saved successfully and synchronized live!</span>
        </div>
      )}

      {activeTab === "general" ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Settings panels */}
          <form onSubmit={handleSaveGeneral} className="md:col-span-8 space-y-6">
            {/* Farm Details */}
            <Card className="p-6 space-y-4">
              <h3 className="font-heading text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary-600" /> Farm Identity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase">Farm Brand Name</label>
                  <input
                    type="text"
                    required
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase">Contact Hotline</label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>
            </Card>

            {/* Automation Parameters */}
            <Card className="p-6 space-y-5">
              <h3 className="font-heading text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary-600" /> Operations Control
              </h3>

              <div className="space-y-4 text-xs font-semibold">
                {/* Toggle 1 */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-slate-800 font-bold">Smart Biosecurity Sensors</h4>
                    <p className="text-[10px] text-slate-450 leading-relaxed font-medium">Trigger warning dialog alerts if pen temperatures exceed 32°C.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={biosecurityAlerts}
                    onChange={(e) => setBiosecurityAlerts(e.target.checked)}
                    className="w-8 h-4 rounded-full border border-slate-350 bg-slate-100 accent-primary-600 cursor-pointer"
                  />
                </div>

                {/* Toggle 2 */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-slate-800 font-bold">Auto-Approve Piglet Reservations</h4>
                    <p className="text-[10px] text-slate-450 leading-relaxed font-medium">Skip admin review and approve bookings instantly if stock levels exceed pen capacity.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoApproveReservations}
                    onChange={(e) => setAutoApproveReservations(e.target.checked)}
                    className="w-8 h-4 rounded-full border border-slate-350 bg-slate-100 accent-primary-600 cursor-pointer"
                  />
                </div>

                {/* Toggle 3 */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-slate-800 font-bold">Automated Sensor History Logs</h4>
                    <p className="text-[10px] text-slate-450 leading-relaxed font-medium">Write logs inside reports tracking feed conversion levels daily.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={sensorLogs}
                    onChange={(e) => setSensorLogs(e.target.checked)}
                    className="w-8 h-4 rounded-full border border-slate-350 bg-slate-100 accent-primary-600 cursor-pointer"
                  />
                </div>
              </div>
            </Card>

            <Button type="submit">Save Configurations</Button>
          </form>

          {/* Database sidebar warning */}
          <div className="md:col-span-4 space-y-6">
            <Card className="p-6 bg-slate-50 border border-slate-150">
              <h3 className="font-heading text-xs font-bold text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-red-750" /> System Database
              </h3>

              <div className="space-y-3.5 text-xs text-slate-500 font-medium">
                <p>MySQL Database connectors are configured as mock state handlers.</p>

                <div className="flex items-start gap-1.5 p-2 bg-white rounded-xl border border-slate-150 text-[10px] leading-relaxed">
                  <Lock className="w-3.5 h-3.5 text-red-650 shrink-0 mt-0.5" />
                  <span>Production DB migrations are currently locked by the developer context.</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveAISettings} className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-6">
            {/* Persona and Guidelines */}
            <Card className="p-6 space-y-4">
              <h3 className="font-heading text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-primary-600" /> Core Assistant Persona
              </h3>

              <div className="space-y-2 text-xs font-semibold">
                <label className="text-[10px] font-bold text-slate-700 uppercase">System Guidelines & Tone</label>
                <p className="text-[10.5px] text-slate-450 font-medium leading-relaxed mb-1.5">
                  This guideline dictates how the AI Support Agent behaves, its helpful tone, and what inquiries it is responsible for answering.
                </p>
                <textarea
                  value={guidelines}
                  onChange={(e) => setGuidelines(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium h-24 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  required
                />
              </div>
            </Card>

            {/* FAQ Manager */}
            <Card className="p-6 space-y-5">
              <h3 className="font-heading text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary-600" /> FAQ Knowledge Base
              </h3>

              <div className="space-y-4">
                {/* List of current FAQs */}
                {faqs.length === 0 ? (
                  <p className="text-xs text-slate-450 py-4 font-medium text-center bg-slate-50 rounded-xl border border-slate-100">
                    No FAQs defined yet. Use the fields below to register one!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl relative group space-y-3 shadow-xs"
                      >
                        <button
                          type="button"
                          onClick={() => removeFaq(idx)}
                          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Delete FAQ entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="space-y-1 text-xs font-semibold pr-6">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Question</label>
                          <input
                            type="text"
                            value={faq.q}
                            onChange={(e) => updateFaqQuestion(idx, e.target.value)}
                            className="w-full text-[11px] font-bold text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg"
                            required
                          />
                        </div>

                        <div className="space-y-1 text-xs font-semibold">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Answer</label>
                          <textarea
                            value={faq.a}
                            onChange={(e) => updateFaqAnswer(idx, e.target.value)}
                            className="w-full text-[11px] font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg h-20 resize-none leading-relaxed"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Button type="submit">Save AI Settings</Button>
          </div>

          {/* Sidebar to add new QA Pair */}
          <div className="md:col-span-4 space-y-6">
            <Card className="p-6 bg-slate-50 border border-slate-150 space-y-4">
              <h3 className="font-heading text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary-600" /> Add FAQ Entry
              </h3>

              <div className="space-y-3.5 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase">Question Prompt</label>
                  <input
                    type="text"
                    placeholder="e.g. Do you sell hogs?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase">Answer Body</label>
                  <textarea
                    placeholder="e.g. Yes, we sell premium fattening hogs..."
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white h-24 resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddFaq}
                  disabled={!newQuestion.trim() || !newAnswer.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4.5 py-2.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-40 rounded-xl transition-all cursor-pointer shadow-sm shadow-primary-600/10 active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Insert QA Pair</span>
                </button>
              </div>
            </Card>
          </div>
        </form>
      )}
    </div>
  );
}

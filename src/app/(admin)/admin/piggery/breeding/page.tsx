"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { 
  Heart, 
  Calendar, 
  Baby, 
  Activity, 
  Search, 
  Plus, 
  Sparkles, 
  Info,
  CheckCircle,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";

interface SowRecord {
  id: string;
  tagNumber: string;
  breed: string;
  status: "Open" | "Bred" | "Pregnant" | "Farrowed" | "Lactating";
  lastServiceDate?: string;
  sireBreed?: string;
  estimatedFarrowingDate?: string;
  penNumber: string;
  successRate?: string;
}

interface FarrowingLog {
  id: string;
  sowTag: string;
  farrowingDate: string;
  bornAlive: number;
  stillborn: number;
  averageBirthWeight: number;
  weaningDate?: string;
  notes?: string;
}

export default function BreedingPage() {
  const [activeTab, setActiveTab] = useState<"registry" | "logs">("registry");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isAddSowOpen, setIsAddSowOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isAddFarrowingOpen, setIsAddFarrowingOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Initial Mock Data for Sows
  const [sows, setSows] = useState<SowRecord[]>([
    { id: "sow-1", tagNumber: "DPF-S-101", breed: "Landrace", status: "Pregnant", lastServiceDate: "2026-04-10", sireBreed: "Duroc", estimatedFarrowingDate: "2026-08-04", penNumber: "Breeding Pen 1", successRate: "95%" },
    { id: "sow-2", tagNumber: "DPF-S-102", breed: "Large White", status: "Lactating", lastServiceDate: "2026-03-01", sireBreed: "Pietrain", estimatedFarrowingDate: "2026-06-25", penNumber: "Farrowing Pen 2", successRate: "90%" },
    { id: "sow-3", tagNumber: "DPF-S-103", breed: "Yorkshire", status: "Open", penNumber: "Gilt Pen A", successRate: "100%" },
    { id: "sow-4", tagNumber: "DPF-S-104", breed: "Landrace", status: "Bred", lastServiceDate: "2026-07-01", sireBreed: "Duroc", estimatedFarrowingDate: "2026-10-25", penNumber: "Breeding Pen 3", successRate: "N/A" },
    { id: "sow-5", tagNumber: "DPF-S-105", breed: "Berkshire", status: "Pregnant", lastServiceDate: "2026-04-18", sireBreed: "Large White", estimatedFarrowingDate: "2026-08-12", penNumber: "Breeding Pen 2", successRate: "93%" },
  ]);

  // Initial Mock Data for Farrowing
  const [farrowings, setFarrowings] = useState<FarrowingLog[]>([
    { id: "f-1", sowTag: "DPF-S-102", farrowingDate: "2026-06-24", bornAlive: 12, stillborn: 1, averageBirthWeight: 1.4, weaningDate: "2026-07-22", notes: "Excellent milk production and maternal instincts." },
    { id: "f-2", sowTag: "DPF-S-101", farrowingDate: "2026-02-15", bornAlive: 10, stillborn: 0, averageBirthWeight: 1.3, weaningDate: "2026-03-15", notes: "Litter raised with 100% survival rate." },
  ]);

  // Form states
  const [sowForm, setSowForm] = useState({ tagNumber: "", breed: "Landrace", penNumber: "Breeding Pen 1" });
  const [serviceForm, setServiceForm] = useState({ sowTag: "", sireBreed: "Duroc", serviceDate: "", serviceMethod: "Artificial Insemination" });
  const [farrowForm, setFarrowForm] = useState({ sowTag: "", farrowingDate: "", bornAlive: 10, stillborn: 0, avgWeight: 1.3, notes: "" });

  const activeSows = sows.length;
  const pregnantCount = sows.filter(s => s.status === "Pregnant").length;
  const lactatingCount = sows.filter(s => s.status === "Lactating").length;
  const activeLittersCount = farrowings.filter(f => !f.weaningDate).length;

  const filteredSows = sows.filter(sow => {
    const matchesSearch = sow.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sow.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sow.penNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || sow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sowForm.tagNumber) return;

    const newSow: SowRecord = {
      id: `sow-${Date.now()}`,
      tagNumber: sowForm.tagNumber.toUpperCase(),
      breed: sowForm.breed,
      status: "Open",
      penNumber: sowForm.penNumber,
      successRate: "N/A"
    };

    setSows([newSow, ...sows]);
    setSuccessMsg("Sow registered successfully!");
    setTimeout(() => {
      setSuccessMsg("");
      setIsAddSowOpen(false);
      setSowForm({ tagNumber: "", breed: "Landrace", penNumber: "Breeding Pen 1" });
    }, 1500);
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.sowTag || !serviceForm.serviceDate) return;

    // Estimate farrowing date: Service date + 114 days (3 months, 3 weeks, 3 days)
    const serviceDateObj = new Date(serviceForm.serviceDate);
    const estFarrowingDate = new Date(serviceDateObj);
    estFarrowingDate.setDate(serviceDateObj.getDate() + 114);

    const estFarrowingStr = estFarrowingDate.toISOString().split("T")[0];

    setSows(sows.map(s => s.tagNumber === serviceForm.sowTag ? {
      ...s,
      status: "Bred",
      lastServiceDate: serviceForm.serviceDate,
      sireBreed: serviceForm.sireBreed,
      estimatedFarrowingDate: estFarrowingStr
    } : s));

    setSuccessMsg("Service log recorded! Sow status updated to Bred.");
    setTimeout(() => {
      setSuccessMsg("");
      setIsAddServiceOpen(false);
      setServiceForm({ sowTag: "", sireBreed: "Duroc", serviceDate: "", serviceMethod: "Artificial Insemination" });
    }, 1500);
  };

  const handleAddFarrowing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farrowForm.sowTag || !farrowForm.farrowingDate) return;

    const newFarrow: FarrowingLog = {
      id: `f-${Date.now()}`,
      sowTag: farrowForm.sowTag,
      farrowingDate: farrowForm.farrowingDate,
      bornAlive: Number(farrowForm.bornAlive),
      stillborn: Number(farrowForm.stillborn),
      averageBirthWeight: Number(farrowForm.avgWeight),
      notes: farrowForm.notes
    };

    setFarrowings([newFarrow, ...farrowings]);

    setSows(sows.map(s => s.tagNumber === farrowForm.sowTag ? {
      ...s,
      status: "Lactating",
      estimatedFarrowingDate: undefined
    } : s));

    setSuccessMsg("Farrowing recorded successfully! Sow status updated to Lactating.");
    setTimeout(() => {
      setSuccessMsg("");
      setIsAddFarrowingOpen(false);
      setFarrowForm({ sowTag: "", farrowingDate: "", bornAlive: 10, stillborn: 0, avgWeight: 1.3, notes: "" });
    }, 1500);
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-[#1B4332] to-[#2C5D47] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1.5 z-10">
          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/5">
            Farm operations
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400 fill-red-400" />
            Breeding & Farrowing Registry
          </h1>
          <p className="text-xs text-emerald-100/80 font-medium">Manage sow heat periods, artificial insemination schedules, pregnancy status checks, and litter counts.</p>
        </div>
        <div className="flex gap-2 z-10 shrink-0">
          <Button onClick={() => setIsAddSowOpen(true)} className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-900 border-none font-bold text-xs py-2 px-3 rounded-xl">
            Register Sow
          </Button>
          <Button onClick={() => setIsAddServiceOpen(true)} className="bg-emerald-700 hover:bg-emerald-800 text-white border-none font-bold text-xs py-2 px-3 rounded-xl">
            Log Service
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Active Sows Registered</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">{activeSows} Sows</div>
          <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Breeding herd pool</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Confirmed Pregnant</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-blue-600">{pregnantCount} Sows</div>
          <p className="text-[9px] font-semibold text-[#52b788] mt-1">Expected delivery logs updated</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Currently Lactating</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-[#D4AF37]">{lactatingCount} Sows</div>
          <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Farrowing units occupied</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Active litters under nursing</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 text-emerald-600">{activeLittersCount} Litters</div>
          <p className="text-[9px] font-semibold text-[#D4AF37] mt-1">Awaiting weaning schedules</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-[#0f1412] p-1 rounded-2xl border border-slate-150 dark:border-[#182620] shadow-xs max-w-xs sm:max-w-md">
        <button
          onClick={() => setActiveTab("registry")}
          className={`flex-grow py-2 px-4 rounded-xl text-[10.5px] font-extrabold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
            activeTab === "registry"
              ? "bg-[#1B4332] text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Sow Registry
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex-grow py-2 px-4 rounded-xl text-[10.5px] font-extrabold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
            activeTab === "logs"
              ? "bg-[#1B4332] text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          <Baby className="w-3.5 h-3.5" />
          Farrowing Logs
        </button>
      </div>

      {activeTab === "registry" ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0f1412] p-4 border border-slate-150 dark:border-[#182620] rounded-2xl shadow-2xs">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search sow tag, breed, pen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 dark:border-emerald-950 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-slate-50 dark:bg-[#070a09] font-medium"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto w-full sm:w-auto">
              {["All", "Open", "Bred", "Pregnant", "Lactating"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase whitespace-nowrap cursor-pointer transition-colors ${
                    statusFilter === tab
                      ? "bg-[#1B4332] text-white"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-650 dark:bg-emerald-950/20 dark:text-slate-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Sows Table */}
          {filteredSows.length === 0 ? (
            <Card className="p-8 text-center text-slate-400 text-xs font-semibold">
              <Info className="w-8 h-8 text-slate-350 mx-auto mb-2" />
              No sows matching selected status filter.
            </Card>
          ) : (
            <Card className="p-0 overflow-hidden border border-slate-150 dark:border-[#182620]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sow Tag</TableHead>
                    <TableHead>Breed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Breeding Date</TableHead>
                    <TableHead>Estimated Farrowing</TableHead>
                    <TableHead>Sire Breed Used</TableHead>
                    <TableHead>Pen Assignment</TableHead>
                    <TableHead>Historical Success</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSows.map((sow) => (
                    <TableRow key={sow.id}>
                      <TableCell className="font-mono text-xs font-extrabold text-[#1B4332] dark:text-[#52b788]">
                        {sow.tagNumber}
                      </TableCell>
                      <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-100">{sow.breed}</TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[9.5px] font-extrabold uppercase ${
                          sow.status === "Open" ? "bg-slate-100 text-slate-650 dark:bg-[#182620]/30" :
                          sow.status === "Bred" ? "bg-amber-50 text-amber-600 dark:bg-amber-955/20" :
                          sow.status === "Pregnant" ? "bg-blue-50 text-blue-600 dark:bg-blue-955/20" :
                          "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
                        }`}>
                          {sow.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-600 dark:text-slate-400">{sow.lastServiceDate || "—"}</TableCell>
                      <TableCell className="text-xs font-extrabold text-slate-800 dark:text-slate-300">
                        {sow.estimatedFarrowingDate ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            {sow.estimatedFarrowingDate}
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-500">{sow.sireBreed || "—"}</TableCell>
                      <TableCell className="text-xs font-bold text-slate-700 dark:text-slate-350">{sow.penNumber}</TableCell>
                      <TableCell className="text-xs font-bold text-[#D4AF37] font-mono">{sow.successRate || "—"}</TableCell>
                      <TableCell className="text-right">
                        {sow.status === "Pregnant" && (
                          <Button size="sm" variant="secondary" onClick={() => {
                            setFarrowForm({ ...farrowForm, sowTag: sow.tagNumber });
                            setIsAddFarrowingOpen(true);
                          }} className="bg-emerald-700 text-white border-none py-1">
                            Record Farrowing
                          </Button>
                        )}
                        {sow.status === "Open" && (
                          <Button size="sm" variant="light" onClick={() => {
                            setServiceForm({ ...serviceForm, sowTag: sow.tagNumber });
                            setIsAddServiceOpen(true);
                          }}>
                            Log Service
                          </Button>
                        )}
                        {sow.status === "Lactating" && (
                          <Button size="sm" variant="outline" onClick={() => {
                            setSows(sows.map(s => s.id === sow.id ? { ...s, status: "Open" } : s));
                          }}>
                            Mark Weaned
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Farrowing Table */}
          <Card className="p-0 overflow-hidden border border-slate-150 dark:border-[#182620]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farrowing Date</TableHead>
                  <TableHead>Sow Tag</TableHead>
                  <TableHead>Born Alive</TableHead>
                  <TableHead>Stillborn</TableHead>
                  <TableHead>Avg Birth Weight</TableHead>
                  <TableHead>Weaning Date</TableHead>
                  <TableHead>Clinical / Maternal Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {farrowings.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs font-mono font-bold text-slate-650">{log.farrowingDate}</TableCell>
                    <TableCell className="font-mono text-xs font-extrabold text-[#1B4332]">{log.sowTag}</TableCell>
                    <TableCell className="text-xs font-extrabold text-emerald-600 font-mono">+{log.bornAlive} heads</TableCell>
                    <TableCell className="text-xs font-extrabold text-red-500 font-mono">{log.stillborn} heads</TableCell>
                    <TableCell className="text-xs font-bold text-slate-800 dark:text-slate-200">{log.averageBirthWeight} kg</TableCell>
                    <TableCell className="text-xs font-medium text-slate-500">
                      {log.weaningDate ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle className="w-3 h-3" />
                          {log.weaningDate}
                        </span>
                      ) : "Nursing Litters"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-[240px] truncate" title={log.notes}>
                      {log.notes || "No abnormalities observed."}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Register Sow Modal */}
      <Modal isOpen={isAddSowOpen} onClose={() => setIsAddSowOpen(false)} title="Register Breeding Gilt/Sow">
        <form onSubmit={handleAddSow} className="space-y-4 py-2 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-600">Sow Tag Number (E.g. DPF-S-106)</label>
            <input
              type="text"
              required
              placeholder="DPF-S-XXX"
              value={sowForm.tagNumber}
              onChange={(e) => setSowForm({ ...sowForm, tagNumber: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-xl font-mono uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Breed</label>
              <select
                value={sowForm.breed}
                onChange={(e) => setSowForm({ ...sowForm, breed: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              >
                <option value="Landrace">Landrace</option>
                <option value="Large White">Large White</option>
                <option value="Yorkshire">Yorkshire</option>
                <option value="Duroc">Duroc</option>
                <option value="Berkshire">Berkshire</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Pen Assignment</label>
              <input
                type="text"
                required
                value={sowForm.penNumber}
                onChange={(e) => setSowForm({ ...sowForm, penNumber: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl uppercase font-semibold"
              />
            </div>
          </div>

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="light" onClick={() => setIsAddSowOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1B4332] text-white">
              Register Sow
            </Button>
          </div>
        </form>
      </Modal>

      {/* Log Service Modal */}
      <Modal isOpen={isAddServiceOpen} onClose={() => setIsAddServiceOpen(false)} title="Log Breeding Service (A.I. / Natural)">
        <form onSubmit={handleAddService} className="space-y-4 py-2 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-600">Select Sow Tag</label>
            <select
              value={serviceForm.sowTag}
              onChange={(e) => setServiceForm({ ...serviceForm, sowTag: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-xl font-mono uppercase"
              required
            >
              <option value="">-- Choose Gilt/Sow --</option>
              {sows.filter(s => s.status === "Open").map(s => (
                <option key={s.id} value={s.tagNumber}>{s.tagNumber} ({s.breed})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Sire (Boar) Breed</label>
              <select
                value={serviceForm.sireBreed}
                onChange={(e) => setServiceForm({ ...serviceForm, sireBreed: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              >
                <option value="Duroc">Duroc (Paternal Line)</option>
                <option value="Pietrain">Pietrain (Lean Percentage)</option>
                <option value="Landrace">Landrace</option>
                <option value="Large White">Large White</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Breeding Method</label>
              <select
                value={serviceForm.serviceMethod}
                onChange={(e) => setServiceForm({ ...serviceForm, serviceMethod: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              >
                <option value="Artificial Insemination">Artificial Insemination (A.I.)</option>
                <option value="Natural Mating">Natural Mating</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-600">Service Date</label>
            <input
              type="date"
              required
              value={serviceForm.serviceDate}
              onChange={(e) => setServiceForm({ ...serviceForm, serviceDate: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="light" onClick={() => setIsAddServiceOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1B4332] text-white">
              Log Service
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Farrowing Modal */}
      <Modal isOpen={isAddFarrowingOpen} onClose={() => setIsAddFarrowingOpen(false)} title="Log Farrowing Event Details">
        <form onSubmit={handleAddFarrowing} className="space-y-4 py-2 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-600">Sow Tag</label>
            <input
              type="text"
              readOnly
              value={farrowForm.sowTag}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold text-[#1B4332]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Born Alive (Heads)</label>
              <input
                type="number"
                min="0"
                value={farrowForm.bornAlive}
                onChange={(e) => setFarrowForm({ ...farrowForm, bornAlive: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold text-emerald-600"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Stillborn (Heads)</label>
              <input
                type="number"
                min="0"
                value={farrowForm.stillborn}
                onChange={(e) => setFarrowForm({ ...farrowForm, stillborn: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold text-red-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Average Birth Weight (Kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                value={farrowForm.avgWeight}
                onChange={(e) => setFarrowForm({ ...farrowForm, avgWeight: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Farrowing Date</label>
              <input
                type="date"
                required
                value={farrowForm.farrowingDate}
                onChange={(e) => setFarrowForm({ ...farrowForm, farrowingDate: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-600">Clinical / Maternal Notes</label>
            <textarea
              placeholder="e.g. Rapid delivery, litter nursing normally. No stillborn."
              value={farrowForm.notes}
              onChange={(e) => setFarrowForm({ ...farrowForm, notes: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-xl h-20"
            />
          </div>

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="light" onClick={() => setIsAddFarrowingOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1B4332] text-white">
              Log Farrowing Event
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

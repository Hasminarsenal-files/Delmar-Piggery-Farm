"use client";

import React, { useState } from "react";
import { useRole, InventoryItem, InventoryCategory, InventoryLog } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  ShieldAlert, 
  ClipboardList, 
  PlusCircle, 
  MinusCircle, 
  History, 
  Activity, 
  Layers,
  HeartPulse
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PiggeryInventoryPage() {
  const { 
    inventory, 
    inventoryLogs, 
    addInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem, 
    updateStockLevel 
  } = useRole();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"monitor" | "logs">("monitor");

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Selection states
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Form Fields
  const [form, setForm] = useState({
    name: "",
    category: "Piglets" as InventoryCategory,
    quantity: 5,
    unit: "head",
    price: 3500,
    minStockLevel: 2,
    tagNumber: "",
    breed: "Duroc",
    ageWeeks: 8,
    weightKg: 15,
    penNumber: "Pen A-1",
    healthStatus: "Healthy" as any,
  });

  // Adjust Form state
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustAction, setAdjustAction] = useState<"Stock In" | "Stock Out" | "Manual Adjustment">("Manual Adjustment");
  const [adjustNotes, setAdjustNotes] = useState("");

  // Filter pig-only items
  const pigInventory = inventory.filter(
    (item) => item.category === "Piglets" || item.category === "Fattening Pigs"
  );

  const pigLogs = inventoryLogs.filter(
    (log) => log.itemCategory === "Piglets" || log.itemCategory === "Fattening Pigs"
  );

  const categories = ["All", "Piglets", "Fattening Pigs"];

  // Core stats calculation
  const totalHead = pigInventory.reduce((acc, curr) => acc + curr.quantity, 0);
  const pigletsCount = pigInventory.filter(i => i.category === "Piglets").reduce((acc, curr) => acc + curr.quantity, 0);
  const fatteningCount = pigInventory.filter(i => i.category === "Fattening Pigs").reduce((acc, curr) => acc + curr.quantity, 0);
  const totalValue = pigInventory.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);

  // Filtered List
  const filteredInventory = pigInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.tagNumber && item.tagNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.penNumber && item.penNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.breed && item.breed.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Event Handlers
  const handleOpenAdd = () => {
    setForm({
      name: "",
      category: "Piglets",
      quantity: 5,
      unit: "head",
      price: 3500,
      minStockLevel: 2,
      tagNumber: "",
      breed: "Duroc",
      ageWeeks: 8,
      weightKg: 15,
      penNumber: "Pen A-1",
      healthStatus: "Healthy",
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      minStockLevel: item.minStockLevel,
      tagNumber: item.tagNumber || "",
      breed: item.breed || "Duroc",
      ageWeeks: item.ageWeeks || 8,
      weightKg: item.weightKg || 15,
      penNumber: item.penNumber || "Pen A-1",
      healthStatus: item.healthStatus || "Healthy",
    });
    setIsEditOpen(true);
  };

  const handleOpenAdjust = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustQty(1);
    setAdjustAction("Manual Adjustment");
    setAdjustNotes("");
    setIsAdjustOpen(true);
  };

  const handleOpenDelete = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.unit) return;

    const payload: Omit<InventoryItem, "id" | "status"> = {
      name: form.name,
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit,
      price: Number(form.price),
      minStockLevel: Number(form.minStockLevel),
      tagNumber: form.tagNumber || undefined,
      breed: form.breed || undefined,
      ageWeeks: Number(form.ageWeeks) || undefined,
      weightKg: Number(form.weightKg) || undefined,
      penNumber: form.penNumber || undefined,
      healthStatus: form.healthStatus,
    };

    const ok = await addInventoryItem(payload);
    if (ok) {
      setSuccessMsg("Live asset registered successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        setIsAddOpen(false);
      }, 1500);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const payload: Partial<InventoryItem> = {
      name: form.name,
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit,
      price: Number(form.price),
      minStockLevel: Number(form.minStockLevel),
      tagNumber: form.tagNumber || null as any,
      breed: form.breed || null as any,
      ageWeeks: Number(form.ageWeeks) || null as any,
      weightKg: Number(form.weightKg) || null as any,
      penNumber: form.penNumber || null as any,
      healthStatus: form.healthStatus,
    };

    const ok = await updateInventoryItem(selectedItem.id, payload);
    if (ok) {
      setSuccessMsg("Asset details updated successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        setIsEditOpen(false);
      }, 1500);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const multiplier = adjustAction === "Stock Out" ? -1 : 1;
    const change = Number(adjustQty) * multiplier;

    const ok = await updateStockLevel(selectedItem.id, change, adjustAction, adjustNotes);
    if (ok) {
      setSuccessMsg("Stock levels adjusted successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        setIsAdjustOpen(false);
      }, 1500);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedItem) return;
    const ok = await deleteInventoryItem(selectedItem.id);
    if (ok) {
      setSuccessMsg("Item deleted successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        setIsDeleteOpen(false);
      }, 1500);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1.5 z-10">
          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/5">
            Piggery Unit
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white">Live Pig Inventory</h1>
          <p className="text-xs text-emerald-100/80 font-medium">Track your Duroc, Landrace, and Large White breeding assets, pens, and animal healthcare.</p>
        </div>
        <Button 
          onClick={handleOpenAdd}
          className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-900 border-none font-bold text-xs py-2 px-4 rounded-xl shadow-md z-10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Pig Group
        </Button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Herd Count</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">{totalHead} Head</div>
          <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Live animals in pens</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Weanling Piglets</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">{pigletsCount} Head</div>
          <p className="text-[9px] font-semibold text-[#52b788] mt-1">Average age: 8.5 weeks</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Fattening Hogs</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">{fatteningCount} Head</div>
          <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Ready for market</p>
        </Card>

        <Card className="p-4.5 rounded-2xl shadow-2xs hover:shadow-md transition-all">
          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Asset Value</div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">₱{totalValue.toLocaleString()}</div>
          <p className="text-[9px] font-semibold text-[#D4AF37] mt-1">Based on current market weight</p>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white dark:bg-[#0f1412] p-1 rounded-2xl border border-slate-150 dark:border-[#182620] shadow-xs max-w-xs sm:max-w-md">
        <button
          onClick={() => setActiveTab("monitor")}
          className={`flex-grow py-2 px-4 rounded-xl text-[10.5px] font-extrabold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
            activeTab === "monitor"
              ? "bg-[#1B4332] text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Herd Monitor
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex-grow py-2 px-4 rounded-xl text-[10.5px] font-extrabold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
            activeTab === "logs"
              ? "bg-[#1B4332] text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Inventory Logs
        </button>
      </div>

      {activeTab === "monitor" ? (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0f1412] p-4 border border-slate-150 dark:border-[#182620] rounded-2xl shadow-2xs">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tag number, breed, pen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 dark:border-emerald-950 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-slate-50 dark:bg-[#070a09] font-medium"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase whitespace-nowrap cursor-pointer transition-colors ${
                    activeCategory === cat
                      ? "bg-[#1B4332] text-white"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-650 dark:bg-emerald-950/20 dark:text-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {filteredInventory.length === 0 ? (
            <Card className="p-8 text-center text-slate-400 text-xs font-semibold">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No breeding or market hogs matching search filter.
            </Card>
          ) : (
            <Card className="p-0 overflow-hidden border border-slate-150 dark:border-[#182620]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tag Number</TableHead>
                    <TableHead>Group Name / Breed</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Age & Weight</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Market Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        {item.tagNumber || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-100">{item.name}</div>
                        <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block mt-0.5">{item.breed || "Crossbreed"}</span>
                      </TableCell>
                      <TableCell className="font-bold text-xs text-slate-700 dark:text-slate-300">
                        {item.penNumber || "N/A"}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100">{item.quantity}</span>
                        <span className="text-[10px] text-slate-400 ml-1 font-semibold">{item.unit}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-300">{item.ageWeeks ? `${item.ageWeeks} weeks` : "N/A"}</div>
                        <span className="text-[10px] text-slate-450 font-bold block mt-0.5">{item.weightKg ? `${item.weightKg} kg` : "N/A"}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-lg text-[9.5px] font-extrabold flex items-center gap-1.5 w-fit ${
                          item.healthStatus === "Healthy" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" :
                          item.healthStatus === "Under Treatment" ? "bg-amber-50 text-amber-600 dark:bg-amber-955/20" :
                          "bg-red-50 text-red-650 dark:bg-red-955/20"
                        }`}>
                          <HeartPulse className="w-3 h-3" />
                          {item.healthStatus || "Healthy"}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-100">
                        ₱{item.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button size="sm" variant="light" onClick={() => handleOpenAdjust(item)}>
                          Adjust
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleOpenEdit(item)}>
                          <Edit className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                        <Button size="sm" variant="light" onClick={() => handleOpenDelete(item)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
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
          <Card className="p-0 overflow-hidden border border-slate-150 dark:border-[#182620]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Pig Group</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Head Count Change</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pigLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center p-8 text-slate-400 text-xs font-semibold">
                      No stock movement logs recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  pigLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs font-semibold text-slate-500 font-mono">
                        {log.createdAt}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-100">{log.itemName}</div>
                        <span className="text-[10px] text-slate-450 font-bold block mt-0.5">{log.itemCategory}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-lg text-[9.5px] font-extrabold uppercase tracking-wider ${
                          log.action === "Stock In" ? "bg-emerald-50 text-emerald-600" :
                          log.action === "Stock Out" ? "bg-red-50 text-red-650" :
                          "bg-slate-100 text-slate-650"
                        }`}>
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className={`font-mono text-xs font-extrabold ${log.quantityChanged > 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged} heads
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-medium">
                        {log.notes}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Live Herd Asset">
        <form onSubmit={handleAddSubmit} className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              >
                <option value="Piglets">Piglets (Weaners)</option>
                <option value="Fattening Pigs">Fattening Pigs</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Tag Number (E.g. DPF-0120)</label>
              <input
                type="text"
                placeholder="DPF-XXXX"
                value={form.tagNumber}
                onChange={(e) => setForm({ ...form, tagNumber: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl font-mono uppercase"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-600">Asset Name (E.g. Duroc Weanlings Group)</label>
            <input
              type="text"
              required
              placeholder="Breed / identifier name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-xl font-semibold"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Breed</label>
              <input
                type="text"
                value={form.breed}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Quantity (Head)</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Initial Price / Head</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Age (Weeks)</label>
              <input
                type="number"
                value={form.ageWeeks}
                onChange={(e) => setForm({ ...form, ageWeeks: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Weight (Kg)</label>
              <input
                type="number"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Pen Assignment</label>
              <input
                type="text"
                value={form.penNumber}
                onChange={(e) => setForm({ ...form, penNumber: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl uppercase font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Min. Alert Level</label>
              <input
                type="number"
                value={form.minStockLevel}
                onChange={(e) => setForm({ ...form, minStockLevel: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Health Status</label>
              <select
                value={form.healthStatus}
                onChange={(e) => setForm({ ...form, healthStatus: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              >
                <option value="Healthy">Healthy</option>
                <option value="Under Treatment">Under Treatment</option>
                <option value="Sick">Sick</option>
              </select>
            </div>
          </div>

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="light" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1B4332] text-white">
              Save Herd Asset
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Live Herd Asset Details">
        <form onSubmit={handleEditSubmit} className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              >
                <option value="Piglets">Piglets (Weaners)</option>
                <option value="Fattening Pigs">Fattening Pigs</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Tag Number (E.g. DPF-0120)</label>
              <input
                type="text"
                placeholder="DPF-XXXX"
                value={form.tagNumber}
                onChange={(e) => setForm({ ...form, tagNumber: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl font-mono uppercase"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-600">Asset Name (E.g. Duroc Weanlings Group)</label>
            <input
              type="text"
              required
              placeholder="Breed / identifier name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-xl font-semibold"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Breed</label>
              <input
                type="text"
                value={form.breed}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Quantity (Head)</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Estimated Value / Head</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Age (Weeks)</label>
              <input
                type="number"
                value={form.ageWeeks}
                onChange={(e) => setForm({ ...form, ageWeeks: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Weight (Kg)</label>
              <input
                type="number"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Pen Assignment</label>
              <input
                type="text"
                value={form.penNumber}
                onChange={(e) => setForm({ ...form, penNumber: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl uppercase font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Min. Alert Level</label>
              <input
                type="number"
                value={form.minStockLevel}
                onChange={(e) => setForm({ ...form, minStockLevel: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Health Status</label>
              <select
                value={form.healthStatus}
                onChange={(e) => setForm({ ...form, healthStatus: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-xl"
              >
                <option value="Healthy">Healthy</option>
                <option value="Under Treatment">Under Treatment</option>
                <option value="Sick">Sick</option>
              </select>
            </div>
          </div>

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="light" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1B4332] text-white">
              Update Herd Details
            </Button>
          </div>
        </form>
      </Modal>

      {/* Adjust Modal */}
      <Modal isOpen={isAdjustOpen} onClose={() => setIsAdjustOpen(false)} title="Quick Adjust Herd Count">
        <form onSubmit={handleAdjustSubmit} className="space-y-4 py-2 text-xs">
          {selectedItem && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
              <div className="font-bold text-slate-800">{selectedItem.name}</div>
              <div className="text-[10px] text-slate-500 mt-1">Current Count: <span className="font-bold text-slate-800">{selectedItem.quantity} heads</span></div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Adjustment Type</label>
              <select
                value={adjustAction}
                onChange={(e) => setAdjustAction(e.target.value as any)}
                className="w-full p-2 border border-slate-200 rounded-xl"
              >
                <option value="Manual Adjustment">Manual Correction</option>
                <option value="Stock In">Stock In (Births / Purchases)</option>
                <option value="Stock Out">Stock Out (Mortality / Sales)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Quantity (Head)</label>
              <input
                type="number"
                min="1"
                value={adjustQty}
                onChange={(e) => setAdjustQty(Number(e.target.value))}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-600">Remarks / Reasons</label>
            <textarea
              placeholder="e.g. Registered new piglets from Litter F2"
              value={adjustNotes}
              onChange={(e) => setAdjustNotes(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-xl h-20"
              required
            />
          </div>

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="light" onClick={() => setIsAdjustOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1B4332] text-white">
              Log Adjustment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="De-register Herd Asset">
        <div className="space-y-4 py-2 text-xs">
          <p className="text-slate-600 leading-relaxed font-semibold">
            Are you sure you want to completely de-register this pig group? This will remove all tag records and database entries.
          </p>

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="light" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleDeleteSubmit} className="bg-red-650 hover:bg-red-750 text-white">
              De-register
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

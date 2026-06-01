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
  BarChart3, 
  AlertTriangle, 
  Coins,
  Activity,
  Layers
} from "lucide-react";

export default function AdminInventoryPage() {
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
  const [activeTab, setActiveTab] = useState<"monitor" | "charts" | "logs">("monitor");

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
    category: "Fresh Pork Meat" as InventoryCategory,
    quantity: 10,
    unit: "kg",
    price: 300,
    minStockLevel: 5,
    tagNumber: "",
    breed: "",
    ageWeeks: 0,
    weightKg: 0,
    penNumber: "",
    healthStatus: "Healthy" as any,
  });

  // Adjust Form state
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustAction, setAdjustAction] = useState<"Stock In" | "Stock Out" | "Manual Adjustment">("Manual Adjustment");
  const [adjustNotes, setAdjustNotes] = useState("");

  const categories: string[] = [
    "All",
    "Piglets",
    "Fattening Pigs",
    "Fresh Pork Meat",
    "Lechon Packages",
    "Catering Packages",
    "Sweet Corners",
    "Food Packages"
  ];

  // Core stats calculation
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStockLevel);
  const lowStockCount = lowStockItems.length;
  const totalValue = inventory.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
  const recentLogsCount = inventoryLogs.length;

  // Filtered List
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.tagNumber && item.tagNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.penNumber && item.penNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Event Handlers
  const handleOpenAdd = () => {
    setForm({
      name: "",
      category: "Fresh Pork Meat",
      quantity: 10,
      unit: "kg",
      price: 300,
      minStockLevel: 5,
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

    const isPig = form.category === "Piglets" || form.category === "Fattening Pigs";

    const payload: Omit<InventoryItem, "id" | "status"> = {
      name: form.name,
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit,
      price: Number(form.price),
      minStockLevel: Number(form.minStockLevel),
      tagNumber: isPig ? form.tagNumber : undefined,
      breed: isPig ? form.breed : undefined,
      ageWeeks: isPig ? Number(form.ageWeeks) : undefined,
      weightKg: isPig ? Number(form.weightKg) : undefined,
      penNumber: isPig ? form.penNumber : undefined,
      healthStatus: isPig ? form.healthStatus : "N/A",
    };

    const ok = await addInventoryItem(payload);
    if (ok) {
      setSuccessMsg("Inventory item registered successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        setIsAddOpen(false);
      }, 1500);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const isPig = form.category === "Piglets" || form.category === "Fattening Pigs";

    const payload: Partial<InventoryItem> = {
      name: form.name,
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit,
      price: Number(form.price),
      minStockLevel: Number(form.minStockLevel),
      tagNumber: isPig ? form.tagNumber : null as any,
      breed: isPig ? form.breed : null as any,
      ageWeeks: isPig ? Number(form.ageWeeks) : null as any,
      weightKg: isPig ? Number(form.weightKg) : null as any,
      penNumber: isPig ? form.penNumber : null as any,
      healthStatus: isPig ? form.healthStatus : "N/A",
    };

    const ok = await updateInventoryItem(selectedItem.id, payload);
    if (ok) {
      setSuccessMsg("Inventory item updated successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        setIsEditOpen(false);
      }, 1500);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    // Determine the direction
    const amount = adjustAction === "Stock Out" ? -Math.abs(adjustQty) : Math.abs(adjustQty);

    const ok = await updateStockLevel(selectedItem.id, amount, adjustAction as any, adjustNotes);
    if (ok) {
      setSuccessMsg("Stocks adjusted successfully!");
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
      setIsDeleteOpen(false);
    }
  };

  // Helper values for dynamically drawing simple SVG charts
  const categoryChartData = categories.slice(1).map(cat => {
    const items = inventory.filter(i => i.category === cat);
    const count = items.reduce((acc, curr) => acc + curr.quantity, 0);
    const val = items.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
    return { name: cat, count, value: val };
  });

  const maxCount = Math.max(...categoryChartData.map(c => c.count), 1);
  const maxValue = Math.max(...categoryChartData.map(c => c.value), 1);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">Inventory Management</h1>
          <p className="text-xs text-slate-500 font-medium">Track meat weights, live pig tag counters, and catering packages stock.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<History className="w-4 h-4" />}
            onClick={() => setActiveTab(activeTab === "logs" ? "monitor" : "logs")}
            className={`cursor-pointer ${activeTab === "logs" ? "border-primary-600 bg-primary-50/50 text-primary-700" : ""}`}
          >
            Audit Logs
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<BarChart3 className="w-4 h-4" />}
            onClick={() => setActiveTab(activeTab === "charts" ? "monitor" : "charts")}
            className={`cursor-pointer ${activeTab === "charts" ? "border-primary-600 bg-primary-50/50 text-primary-700" : ""}`}
          >
            Analytics
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
            className="cursor-pointer"
          >
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Products</h4>
            <div className="text-xl font-extrabold text-slate-800">{totalItems} Unique Items</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl text-red-650">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Low Stock Alerts</h4>
            <div className={`text-xl font-extrabold ${lowStockCount > 0 ? "text-red-600" : "text-slate-850"}`}>
              {lowStockCount} Shortage Warnings
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Stock Value</h4>
            <div className="text-xl font-extrabold text-slate-800">₱{totalValue.toLocaleString()}</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-650">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Recent Activity</h4>
            <div className="text-xl font-extrabold text-slate-800">{recentLogsCount} Adjustments</div>
          </div>
        </Card>
      </div>

      {/* Critical Low Stock Banner */}
      {lowStockCount > 0 && activeTab === "monitor" && (
        <div className="bg-red-50 border border-red-150 p-4 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-650 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-red-800">Critical Stock Warning!</h4>
            <p className="text-[11px] text-red-750 font-medium">
              The following items have dropped below their minimum safety thresholds:{" "}
              <strong>{lowStockItems.map(i => `${i.name} (${i.quantity} left)`).join(", ")}</strong>. Please restock immediately.
            </p>
          </div>
        </div>
      )}

      {/* TABS VIEW CONTROLLER */}
      {activeTab === "monitor" && (
        <>
          {/* Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Item Name, tag, or pen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === c
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-50 text-slate-650 hover:bg-slate-100"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {filteredInventory.length === 0 ? (
            <Card className="p-8 text-center text-slate-500 text-xs font-medium space-y-2">
              <Layers className="w-8 h-8 text-slate-350 mx-auto" />
              <div>No matching inventory items found. Add items to track stock metrics.</div>
            </Card>
          ) : (
            <Card className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product details</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Safety Min</TableHead>
                    <TableHead>Pig Parameters</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => {
                    const isPigCategory = item.category === "Piglets" || item.category === "Fattening Pigs";
                    return (
                      <TableRow key={item.id} className={item.quantity <= item.minStockLevel ? "bg-red-50/20" : ""}>
                        <TableCell>
                          <div>
                            <div className="font-bold text-xs text-slate-800">{item.name}</div>
                            <span className="text-[9px] text-slate-400 font-bold block">ID: {item.id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-slate-600">{item.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                              item.status === "Available" ? "bg-emerald-50 text-emerald-600" :
                              item.status === "Low Stock" ? "bg-amber-50 text-amber-600" :
                              "bg-red-50 text-red-600"
                            }`}>
                              {item.quantity} {item.unit} ({item.status})
                            </span>
                            
                            {/* Fast increment/decrement */}
                            <div className="flex gap-1">
                              <button 
                                onClick={() => updateStockLevel(item.id, 1, "Stock In", "Quick Stock Add")}
                                className="text-emerald-600 hover:text-emerald-800 p-0.5 hover:bg-slate-100 rounded-md cursor-pointer"
                                title="Add 1"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => item.quantity > 0 && updateStockLevel(item.id, -1, "Stock Out", "Quick Stock Deduct")}
                                className="text-red-500 hover:text-red-700 p-0.5 hover:bg-slate-100 rounded-md cursor-pointer"
                                title="Deduct 1"
                              >
                                <MinusCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-slate-800">₱{item.price.toLocaleString()}</TableCell>
                        <TableCell className="text-xs font-medium text-slate-500">{item.minStockLevel} {item.unit}</TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {isPigCategory ? (
                            <div className="space-y-0.5 text-[10px]">
                              <div>Tag: <span className="font-bold text-slate-700">{item.tagNumber || "N/A"}</span></div>
                              <div>Pen: <span className="font-semibold text-slate-700">{item.penNumber || "N/A"}</span> | Breed: <span className="text-slate-650">{item.breed || "N/A"}</span></div>
                              <div>Health: <span className={`font-bold ${item.healthStatus === "Healthy" ? "text-emerald-600" : "text-amber-600"}`}>{item.healthStatus}</span></div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Non-Livestock Item</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() => handleOpenAdjust(item)}
                            className="text-[10px] py-1 px-2 border-none"
                          >
                            Adjust Stock
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 min-w-0"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5 text-slate-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleOpenDelete(item)}
                            className="p-1 min-w-0 bg-red-50 hover:bg-red-100 border-none text-red-650"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}

      {/* ANALYTICS CHARTS TAB */}
      {activeTab === "charts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Stock levels by Category */}
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wide">Stock Quantity by Category</h3>
              <p className="text-[10px] text-slate-450 font-medium">Visualizes overall item unit counters aggregated by category.</p>
            </div>
            
            <div className="space-y-4 pt-2">
              {categoryChartData.map((data, index) => {
                const widthPercent = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
                return (
                  <div key={data.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{data.name}</span>
                      <span className="text-slate-500">{data.count} units</span>
                    </div>
                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div 
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-700 rounded-full transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Chart 2: Inventory Value Distribution */}
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wide">Financial Asset Value (₱)</h3>
              <p className="text-[10px] text-slate-450 font-medium">Representing total stock values (Quantity * Price) by category.</p>
            </div>

            <div className="space-y-4 pt-2">
              {categoryChartData.map((data) => {
                const widthPercent = maxValue > 0 ? (data.value / maxValue) * 100 : 0;
                return (
                  <div key={data.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{data.name}</span>
                      <span className="text-emerald-700">₱{data.value.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Chart 3: Stock Health Index / Pigs Status */}
          <Card className="p-6 space-y-4 lg:col-span-2">
            <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wide">Low Stock Alert Levels Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-center space-y-1">
                <div className="text-2xl font-black text-emerald-700">
                  {inventory.filter(i => i.status === "Available").length}
                </div>
                <div className="text-xs font-bold text-slate-600">Sufficiently Stocked Items</div>
                <p className="text-[10px] text-slate-450 font-medium">Items that satisfy minimum safety thresholds.</p>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl text-center space-y-1">
                <div className="text-2xl font-black text-amber-700">
                  {inventory.filter(i => i.status === "Low Stock").length}
                </div>
                <div className="text-xs font-bold text-slate-600">Low Stock Threshold Warnings</div>
                <p className="text-[10px] text-slate-450 font-medium">Requires replenishment soon to satisfy orders.</p>
              </div>

              <div className="p-4 bg-red-50/50 border border-red-150 rounded-2xl text-center space-y-1">
                <div className="text-2xl font-black text-red-650">
                  {inventory.filter(i => i.status === "Out of Stock").length}
                </div>
                <div className="text-xs font-bold text-slate-600">Out of Stock Depleted Hogs/Meat</div>
                <p className="text-[10px] text-slate-450 font-medium">Currently unavailable for customer bookings.</p>
              </div>
            </div>
          </Card>

        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === "logs" && (
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-50 flex justify-between items-center">
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <History className="w-5 h-5 text-slate-500" /> Inventory Adjustments Audit Trail
              </h3>
              <p className="text-[10px] text-slate-450 font-medium">Continuous tracking of all stock adjustments, manual counts, and completed checkout orders.</p>
            </div>
          </div>
          
          {inventoryLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-medium">No adjustment entries recorded in log.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Adjustment Action</TableHead>
                  <TableHead>Qty Shift</TableHead>
                  <TableHead>Reference Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs font-medium text-slate-450">{log.createdAt}</TableCell>
                    <TableCell className="font-bold text-xs text-slate-800">{log.itemName}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-500">{log.itemCategory}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold ${
                        log.action === "Stock In" ? "bg-emerald-50 text-emerald-600" :
                        log.action === "Stock Out" ? "bg-red-50 text-red-650" :
                        log.action === "Sale" ? "bg-blue-50 text-blue-600" :
                        log.action === "Manual Adjustment" ? "bg-amber-50 text-amber-600" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className={`text-xs font-extrabold ${log.quantityChanged > 0 ? "text-emerald-600" : log.quantityChanged < 0 ? "text-red-500" : "text-slate-500"}`}>
                      {log.quantityChanged > 0 ? "+" : ""}{log.quantityChanged}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-medium max-w-[280px] truncate" title={log.notes}>
                      {log.notes}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* ADD ITEM MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Inventory Item">
        {successMsg ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <h4 className="font-heading text-base font-bold text-slate-800">Success!</h4>
            <p className="text-xs text-slate-500 font-medium">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Pork Belly (1kg) or Duroc Piglets"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary-500/20 bg-white"
                >
                  <option value="Piglets">Piglets (Livestock)</option>
                  <option value="Fattening Pigs">Fattening Pigs (Livestock)</option>
                  <option value="Fresh Pork Meat">Fresh Pork Meat</option>
                  <option value="Lechon Packages">Lechon Packages</option>
                  <option value="Catering Packages">Catering Packages</option>
                  <option value="Sweet Corners">Sweet Corners</option>
                  <option value="Food Packages">Food Packages</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Measurement Unit</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. kg, pcs, head, set"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Initial Qty</label>
                <input
                  type="number"
                  required
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Unit Price (₱)</label>
                <input
                  type="number"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Min Safety Stock</label>
                <input
                  type="number"
                  required
                  value={form.minStockLevel}
                  onChange={(e) => setForm({ ...form, minStockLevel: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            {/* Pig Specific Optional Parameters */}
            {(form.category === "Piglets" || form.category === "Fattening Pigs") && (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                <div className="text-[10px] font-extrabold text-slate-550 uppercase tracking-wider">Livestock Metadata Parameters</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase">Tag ID Number</label>
                    <input
                      type="text"
                      placeholder="e.g. DPF-0310"
                      value={form.tagNumber}
                      onChange={(e) => setForm({ ...form, tagNumber: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium bg-white focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase">Breed Selection</label>
                    <select
                      value={form.breed}
                      onChange={(e) => setForm({ ...form, breed: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium bg-white focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="Landrace">Landrace</option>
                      <option value="Duroc">Duroc</option>
                      <option value="Large White">Large White</option>
                      <option value="Berkshire">Berkshire</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase">Age (weeks)</label>
                    <input
                      type="number"
                      value={form.ageWeeks}
                      onChange={(e) => setForm({ ...form, ageWeeks: parseInt(e.target.value) || 0 })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-xl font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase">Weight (kg)</label>
                    <input
                      type="number"
                      value={form.weightKg}
                      onChange={(e) => setForm({ ...form, weightKg: parseInt(e.target.value) || 0 })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase">Pen Location</label>
                    <input
                      type="text"
                      placeholder="Pen B-3"
                      value={form.penNumber}
                      onChange={(e) => setForm({ ...form, penNumber: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-xl font-medium focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase">Health Condition</label>
                    <select
                      value={form.healthStatus}
                      onChange={(e) => setForm({ ...form, healthStatus: e.target.value as any })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-xl font-medium focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="Healthy">Healthy</option>
                      <option value="Under Treatment">Under Treatment</option>
                      <option value="Sick">Sick</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" className="w-full">
                Register Stock Item
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* EDIT ITEM MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Stock Card Parameter">
        {successMsg ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <h4 className="font-heading text-base font-bold text-slate-800">Success!</h4>
            <p className="text-xs text-slate-500 font-medium">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Pork Belly (1kg)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary-500/20 bg-white"
                >
                  <option value="Piglets">Piglets (Livestock)</option>
                  <option value="Fattening Pigs">Fattening Pigs (Livestock)</option>
                  <option value="Fresh Pork Meat">Fresh Pork Meat</option>
                  <option value="Lechon Packages">Lechon Packages</option>
                  <option value="Catering Packages">Catering Packages</option>
                  <option value="Sweet Corners">Sweet Corners</option>
                  <option value="Food Packages">Food Packages</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Measurement Unit</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. kg, pcs, head, set"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Quantity In Stock</label>
                <input
                  type="number"
                  required
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Unit Price (₱)</label>
                <input
                  type="number"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Min Safety Stock</label>
                <input
                  type="number"
                  required
                  value={form.minStockLevel}
                  onChange={(e) => setForm({ ...form, minStockLevel: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            {/* Pig Specific Optional Parameters */}
            {(form.category === "Piglets" || form.category === "Fattening Pigs") && (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                <div className="text-[10px] font-extrabold text-slate-550 uppercase tracking-wider">Livestock Metadata Parameters</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase">Tag ID Number</label>
                    <input
                      type="text"
                      placeholder="e.g. DPF-0310"
                      value={form.tagNumber}
                      onChange={(e) => setForm({ ...form, tagNumber: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium bg-white focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase">Breed Selection</label>
                    <select
                      value={form.breed}
                      onChange={(e) => setForm({ ...form, breed: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium bg-white focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="Landrace">Landrace</option>
                      <option value="Duroc">Duroc</option>
                      <option value="Large White">Large White</option>
                      <option value="Berkshire">Berkshire</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase">Age (weeks)</label>
                    <input
                      type="number"
                      value={form.ageWeeks}
                      onChange={(e) => setForm({ ...form, ageWeeks: parseInt(e.target.value) || 0 })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-xl font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase">Weight (kg)</label>
                    <input
                      type="number"
                      value={form.weightKg}
                      onChange={(e) => setForm({ ...form, weightKg: parseInt(e.target.value) || 0 })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase">Pen Location</label>
                    <input
                      type="text"
                      placeholder="Pen B-3"
                      value={form.penNumber}
                      onChange={(e) => setForm({ ...form, penNumber: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-xl font-medium focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase">Health Condition</label>
                    <select
                      value={form.healthStatus}
                      onChange={(e) => setForm({ ...form, healthStatus: e.target.value as any })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-xl font-medium focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="Healthy">Healthy</option>
                      <option value="Under Treatment">Under Treatment</option>
                      <option value="Sick">Sick</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" className="w-full">
                Apply Edit Parameters
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* QUICK ADJUST STOCKS MODAL */}
      <Modal isOpen={isAdjustOpen} onClose={() => setIsAdjustOpen(false)} title={`Stock Adjustment: ${selectedItem?.name}`}>
        {successMsg ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <h4 className="font-heading text-base font-bold text-slate-800">Success!</h4>
            <p className="text-xs text-slate-500 font-medium">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs font-sans">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between text-xs font-bold text-slate-750">
              <span>Current Stock Balance:</span>
              <span className="text-primary-750">{selectedItem?.quantity} {selectedItem?.unit}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Adjustment Direction</label>
                <select
                  value={adjustAction}
                  onChange={(e) => setAdjustAction(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium bg-white focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="Stock In">Stock In (+ Add Qty)</option>
                  <option value="Stock Out">Stock Out (- Deduct Qty)</option>
                  <option value="Manual Adjustment">Manual Adjustment (Count Update)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Quantity Volume</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Reference Audit Notes</label>
              <textarea
                rows={3}
                placeholder="e.g. Restocked shelf items or manual correction of recount"
                value={adjustNotes}
                onChange={(e) => setAdjustNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary-500/20 focus:outline-hidden"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full">
                Apply Stock Adjustment
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Card Removal">
        <div className="space-y-4 text-xs font-sans">
          <p className="text-slate-550 leading-relaxed font-semibold">
            Are you sure you want to completely remove <strong>{selectedItem?.name}</strong> from your stock logs? This action is permanent and will cascade delete all linked adjustment audits.
          </p>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-1/2"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              className="w-1/2 bg-red-600 hover:bg-red-750 text-white border-none"
              onClick={handleDeleteSubmit}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

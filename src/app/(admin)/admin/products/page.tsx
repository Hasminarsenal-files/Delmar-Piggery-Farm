"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Edit, Plus, Store, CheckCircle2, ShieldAlert } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([
    { id: "1", name: "Weanling Piglets", category: "Piglets", price: 3500, unit: "per head", status: "Active" },
    { id: "2", name: "Fattening Pigs", category: "Fattening Pigs", price: 12000, unit: "per head", status: "Active" },
    { id: "3", name: "Fresh Pork Belly (Liempo)", category: "Fresh Pork Meat", price: 340, unit: "per kg", status: "Active" },
    { id: "4", name: "Crispylicious Lechon (Small)", category: "Crispylicious Lechon", price: 8500, unit: "per roasting", status: "Active" },
    { id: "5", name: "Fiesta Food Tray Set (A)", category: "Food Packages", price: 3500, unit: "per tray set", status: "Active" },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Piglets");
  const [price, setPrice] = useState(3000);
  const [unit, setUnit] = useState("per head");

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newProd = {
      id: (products.length + 1).toString(),
      name,
      category,
      price,
      unit,
      status: "Active",
    };

    setProducts([...products, newProd]);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setIsOpen(false);
      setName("");
      setPrice(3000);
    }, 2000);
  };

  const handleToggleStatus = (id: string) => {
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" } : p
      )
    );
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">Store Listings Catalog</h1>
          <p className="text-xs text-slate-500 font-medium">Manage pricing metrics, tags, and display catalogs for public visitors.</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setIsOpen(true)} className="cursor-pointer">
          Add Listing
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Listing Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Simulated Cost</TableHead>
              <TableHead>Unit Metric</TableHead>
              <TableHead>Catalog Status</TableHead>
              <TableHead className="text-right">Configure</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-bold text-xs text-slate-800 flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary-500" />
                  <span>{p.name}</span>
                </TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">{p.category}</TableCell>
                <TableCell className="font-bold text-xs text-slate-800">₱{p.price.toLocaleString()}</TableCell>
                <TableCell className="text-xs font-medium text-slate-500">{p.unit}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                    p.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                  }`}>
                    {p.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handleToggleStatus(p.id)}>
                    Toggle Visibility
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Register Store Listing">
        {success ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-heading text-base font-bold text-slate-800">Listing Saved!</h4>
            <p className="text-xs text-slate-500 font-medium">Appended to public visual catalogs successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleAddProduct} className="space-y-4 text-xs font-sans">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
                placeholder="e.g. Pork Kasim / Shoulder"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="Piglets">Piglets</option>
                  <option value="Fattening Pigs">Fattening Pigs</option>
                  <option value="Fresh Pork Meat">Fresh Pork Meat</option>
                  <option value="Crispylicious Lechon">Crispylicious Lechon</option>
                  <option value="Food Packages">Food Packages</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Unit Metric</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="per head">per head</option>
                  <option value="per kg">per kg</option>
                  <option value="per roasting">per roasting</option>
                  <option value="per tray set">per tray set</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Simulated Unit Cost (₱)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full">
                Register Catalog
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

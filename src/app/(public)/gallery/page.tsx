"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Sparkles, Eye, X, HelpCircle, Image as ImageIcon } from "lucide-react";

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedPhoto, setSelectedPhoto] = useState<typeof photos[0] | null>(null);

  const filters = ["All", "Pigs & Pens", "Meat Processing", "Catering & Lechon"];

  const photos = [
    {
      id: 1,
      title: "Pedigree Duroc Breeder",
      category: "Pigs & Pens",
      caption: "Our prize breeding boars chosen for strong muscle growth and excellent posture.",
      color: "from-amber-800 to-amber-950",
    },
    {
      id: 2,
      title: "Evaporative Cooling Pen",
      category: "Pigs & Pens",
      caption: "Climate-controlled nursery pens keeping weanling temperature at exactly 28°C.",
      color: "from-emerald-800 to-emerald-950",
    },
    {
      id: 3,
      title: "Hygienic Butchery Chamber",
      category: "Meat Processing",
      caption: "Stainless steel partition room where carcass cuts are prepared, packed, and blast chilled.",
      color: "from-slate-700 to-slate-900",
    },
    {
      id: 4,
      title: "Vaccination Record Desk",
      category: "Pigs & Pens",
      caption: "Ensuring digital tracking of tags and vaccination logs with our licensed farm vet.",
      color: "from-teal-800 to-teal-950",
    },
    {
      id: 5,
      title: "Spit-Roast Lechon Spit",
      category: "Catering & Lechon",
      caption: "Aromatic herbs and spice stuffing roasted over slow charcoal heat for maximum crackling skin.",
      color: "from-orange-850 to-orange-950",
    },
    {
      id: 6,
      title: "Banquet Wedding Catering",
      category: "Catering & Lechon",
      caption: "Buffet design layout complete with server personnel, sweet corner tables, and custom floral sets.",
      color: "from-indigo-850 to-indigo-950",
    },
  ];

  const filteredPhotos = photos.filter((p) => activeFilter === "All" || p.category === activeFilter);

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 font-sans">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold font-heading text-slate-800 tracking-tight">Our Farm Gallery</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          Take a visual tour through our biosecure climate pens, processing facilities, and roasting ovens.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="flex justify-center gap-1.5 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === f
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-white border border-[#e6e8e6] text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPhotos.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelectedPhoto(p)}
            className="group cursor-pointer bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            {/* Visual Placeholder */}
            <div className={`aspect-video w-full bg-gradient-to-tr ${p.color} relative flex items-center justify-center p-6`}>
              <ImageIcon className="absolute top-4 left-4 w-5 h-5 text-white/30" />
              <div className="text-center space-y-1 text-white/90">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">{p.category}</span>
                <div className="text-sm font-bold tracking-tight font-heading">{p.title}</div>
              </div>
              <div className="absolute inset-0 bg-primary-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white border border-white/20">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-5 space-y-1 bg-white">
              <h3 className="text-xs font-bold text-slate-800">{p.title}</h3>
              <p className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">{p.category}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium mt-2">{p.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setSelectedPhoto(null)} />
          <div className="relative bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-800/10 z-10 animate-in zoom-in-95 duration-200">
            {/* Image Placeholder */}
            <div className={`aspect-video w-full bg-gradient-to-tr ${selectedPhoto.color} flex items-center justify-center relative p-8`}>
              <ImageIcon className="w-16 h-16 text-white/20" />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/35 hover:bg-black/50 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-lg uppercase tracking-wide">
                  {selectedPhoto.category}
                </span>
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-800">{selectedPhoto.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{selectedPhoto.caption}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

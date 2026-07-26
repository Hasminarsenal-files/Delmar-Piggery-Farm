"use client";

import React, { useState } from "react";
import { ShieldCheck, Eye, X, FileText, CheckCircle2 } from "lucide-react";

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedDoc, setSelectedDoc] = useState<typeof documents[0] | null>(null);

  const filters = ["All", "Registrations", "Clearances & Health"];

  const documents = [
    {
      id: 1,
      title: "Mayor's Business Permit",
      category: "Clearances & Health",
      agency: "Municipal Government Office",
      caption: "Official business operations permit authorizing commercial livestock raising, wholesale distribution, and agricultural operations.",
      img: "/img/permits/4084ccd4-0af8-4daf-bc54-09b7b60a813c.jpg",
      verified: true,
      certNo: "BP-2026-90812",
    },
    {
      id: 2,
      title: "DTI Certificate of Registration",
      category: "Registrations",
      agency: "Department of Trade & Industry",
      caption: "Certificate of Business Name Registration legally registering the name 'Savorlicious Food Services' under the national commercial registry.",
      img: "/img/permits/232b3e43-c7fa-4302-b720-ce70296afac6.jpg",
      verified: true,
      certNo: "DTI-08712398",
    },
    {
      id: 3,
      title: "BIR Certificate of Registration (Form 2303)",
      category: "Registrations",
      agency: "Bureau of Internal Revenue",
      caption: "Official tax registration and compliance ledger certificate authorizing formal invoices, receipt billing, and retail commercial tax compliance.",
      img: "/img/permits/918a490c-a052-420b-aa67-aa7ad48095e4.jpg",
      verified: true,
      certNo: "BIR-Form-2303-998",
    },
  ];

  const filteredDocs = documents.filter((doc) => activeFilter === "All" || doc.category === activeFilter);

  return (
    <div className="pt-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 font-sans">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700 uppercase tracking-wide animate-pulse">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Legally Registered & Compliant</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-800 tracking-tight">
          Legality & Business Permits
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          At Savorlicious Food Services, we operate under full compliance with local municipal laws, environmental bureaus, and agricultural sanitary departments. Inspect our registration permits below.
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
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white border border-[#e6e8e6] text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className="group cursor-pointer bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 relative aspect-[3/4] w-full flex items-center justify-center p-5"
          >
            <img
              src={doc.img}
              alt={doc.title}
              className="max-h-full max-w-full object-contain shadow-md rounded-lg group-hover:scale-102 transition-transform duration-500"
            />
            
            {/* Hover Quick View Overlay */}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
              <div className="bg-white/20 backdrop-blur-md p-3.5 rounded-full text-white border border-white/20 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
            </div>

            {/* Verified Badge */}
            {doc.verified && (
              <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-extrabold uppercase shadow-sm">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox / Zoom Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setSelectedDoc(null)} />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-800/10 z-10 animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Scrollable Document Area */}
            <div className="bg-slate-100 p-8 flex items-center justify-center max-h-[70vh] overflow-y-auto relative">
              <img
                src={selectedDoc.img}
                alt={selectedDoc.title}
                className="max-h-full max-w-full object-contain shadow-xl rounded-xl"
              />
              <button
                onClick={() => setSelectedDoc(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Info details */}
            <div className="p-6 space-y-3 bg-white border-t border-slate-100">
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase tracking-wide border border-emerald-100">
                    {selectedDoc.agency}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg uppercase tracking-wide">
                    {selectedDoc.category}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 font-mono">
                  No: {selectedDoc.certNo}
                </div>
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-800">{selectedDoc.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{selectedDoc.caption}</p>
            </div>
          </div>
        </div>
      )}



    </div>
  );
}

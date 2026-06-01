"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, Award, Users, ShieldAlert, Heart } from "lucide-react";

export default function AboutPage() {
  const milestones = [
    { year: "2018", title: "Foundation", desc: "Delmar Piggery Farm started with 10 sow levels in Aliaga, Nueva Ecija, focused on sanitary pork breeding." },
    { year: "2020", title: "Bio-Security Upgrade", desc: "Constructed closed-tunnel ventilation pens and implemented Class A sanitation routines to safeguard herd health." },
    { year: "2022", title: "Genetics Program", desc: "Imported pedigree Landrace and Duroc breeders to optimize carcass quality and feed efficiency rates." },
    { year: "2024", title: "Catering Expansion", desc: "Launched our Crispylicious Lechon roasting facility and full food services, linking farm-to-table." },
  ];

  return (
    <div className="py-16 space-y-16">
      {/* Title Header */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-[11px] font-bold text-primary-700 uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          <span>Established Since 2018</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-slate-800 tracking-tight leading-tight">
          Pioneering Clean & Modern <br />
          <span className="text-primary-600">Hog Husbandry</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Delmar Piggery Farm operates at the intersection of biosecure livestock rearing, healthy genetics, and traditional Filipino spit-roast culinary arts.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 space-y-4 bg-primary-900 text-white border-none">
          <h2 className="font-heading text-xl font-bold text-accent-light">Our Mission</h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            To supply hog growers in Central Luzon with highly productive, disease-resistant piglets, while delivering premium-quality, hygienic pork products and catering services to Filipino families. We aim to elevate agricultural standards through rigorous biosecurity and genetic efficiency.
          </p>
        </Card>

        <Card className="p-8 space-y-4">
          <h2 className="font-heading text-xl font-bold text-primary-800">Our Vision</h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
            To become a premier agricultural livestock farm and trusted food brand in the Philippines, recognized for our commitment to animal welfare, biosecurity innovation, sustainable waste-to-energy farm loops, and unbeatable customer service.
          </p>
        </Card>
      </section>

      {/* Milestones timeline */}
      <section className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-2xl font-bold text-slate-800 mb-12">Our Farm Journey</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((m) => (
              <Card key={m.year} className="p-6 relative border-t-4 border-t-primary-600">
                <div className="text-2xl font-extrabold text-primary-600 font-heading mb-1">{m.year}</div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">{m.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{m.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Protocols */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <h2 className="text-center font-heading text-2xl font-bold text-slate-800">High-Standard Farming Practices</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Closed-Climate Housing</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">Our pens utilize evaporative cooling pads to manage heat stress, maintaining optimal temperatures for maximum feed absorption and animal comfort.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Biosecurity & Quarantine</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">Foot baths, vehicle spraying, and mandatory quarantine protocols for incoming breeding stocks protect our herd from ASF and other viral vectors.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Complete Vet Records</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">Every piglet is marked with ear tags corresponding to digital files listing birth data, vitamins, vaccines (Mycoplasma, Parvovirus), and weight records.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Purebred Genetics Selection</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">We breed terminal Duroc boars with Landrace-Large White F1 sows to yield piglets with deep meat carcasses, low backfat levels, and tender texture.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Eco-Friendly Bio-Digesters</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">Waste materials are piped into subterranean bio-gas reactors, providing clean energy to fuel our feed heaters and roasting ovens, closing the farm loop.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Farm-to-Table Transparency</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">We maintain traceability from birth logs, feed formulations, slaughterhouse hygiene, to final seasoned lechon boxes delivered to events.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { fetchArchitectureSpecs } from "@/services/api";
import { ShieldCheck, Layers, Cpu, Database, Globe, ArrowDown, Lock, Activity } from "lucide-react";

export default function ArchitecturePage() {
  const [arch, setArch] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const data = await fetchArchitectureSpecs();
      setArch(data);
    }
    load();
  }, []);

  if (!arch) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading enterprise architecture specifications...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-blue-700 text-xs font-semibold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>SIH Enterprise Reference Architecture</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{arch.title}</h1>
        <p className="text-sm text-slate-500 max-w-3xl mx-auto font-medium">
          Production Decoupled DPI Architecture with Backend REST APIs, Leaflet GIS Engine, and Integrated GSI Geoscientific Risk Advisory.
        </p>
      </div>

      {/* Layer Stack */}
      <div className="space-y-4">
        {arch.layers.map((layer: any) => (
          <div
            key={layer.id}
            className="relative bg-white border border-slate-200 p-6 rounded-2xl shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span
                  className="w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: layer.color }}
                >
                  {layer.number}
                </span>
                <h3 className="font-bold text-sm text-slate-900 tracking-wide">{layer.title}</h3>
              </div>

              {layer.badge && (
                <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 px-3 py-1 rounded-full shadow-xs">
                  ⚠️ {layer.badge}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {layer.components.map((comp: string, i: number) => (
                <div
                  key={i}
                  className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold flex items-center space-x-2.5 shadow-2xs"
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: layer.color }}></div>
                  <span>{comp}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

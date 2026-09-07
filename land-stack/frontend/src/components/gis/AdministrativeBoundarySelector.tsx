"use client";

import { useEffect, useState } from "react";
import { fetchAdminBoundaries } from "@/services/gisAnalysisService";
import { Building2 } from "lucide-react";

interface AdminBoundarySelectorProps {
  onSelectBoundary: (center: [number, number], zoom: number) => void;
}

export default function AdministrativeBoundarySelector({ onSelectBoundary }: AdminBoundarySelectorProps) {
  const [boundaries, setBoundaries] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState<string>("all");

  useEffect(() => {
    async function load() {
      const data = await fetchAdminBoundaries();
      const items = Array.isArray(data)
        ? data
        : (data?.features?.map((f: any) => ({
            id: f.id || f.properties?.id || f.properties?.name,
            name: f.properties?.name || f.name || 'Region',
            level: f.properties?.level || f.level || 'State',
            center: f.properties?.center || [20.5937, 78.9629]
          })) || []);
      setBoundaries(items);
    }
    load();
  }, []);

  const handleSelect = (id: string) => {
    if (id === "all") {
      onSelectBoundary([20.5937, 78.9629], 5); // India center
      setSelectedState("all");
      return;
    }

    const safeBoundaries = Array.isArray(boundaries) ? boundaries : [];
    const found = safeBoundaries.find((b) => b.id === id || b.name === id);
    if (found && found.center) {
      setSelectedState(id);
      const zoomLevel = found.level === "State" ? 7 : 10;
      onSelectBoundary(found.center, zoomLevel);
    }
  };

  const safeList = Array.isArray(boundaries) ? boundaries : [];

  return (
    <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-md border border-slate-200 p-1.5 rounded-2xl shadow-md">
      <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 flex-shrink-0">
        <Building2 className="w-3.5 h-3.5" />
      </div>

      <select
        value={selectedState}
        onChange={(e) => handleSelect(e.target.value)}
        className="bg-transparent text-xs text-slate-800 font-bold focus:outline-none pr-2"
      >
        <option value="all">🇮🇳 All India Jurisdiction</option>
        {safeList.map((b) => (
          <option key={b.id || b.name} value={b.id || b.name}>
            {b.level === "State" ? "📍 State: " : "🏙️ District: "} {b.name}
          </option>
        ))}
      </select>
    </div>
  );
}

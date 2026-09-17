"use client";

import { useState, useEffect } from "react";
import { getLayerById } from "@/config/gisLayerRegistry";
import { ChevronUp, ChevronDown, Table as TableIcon } from "lucide-react";

interface FeatureDataTableProps {
  activeLayers: string[];
}

export default function FeatureDataTable({ activeLayers }: FeatureDataTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync selected layer
  useEffect(() => {
    if (activeLayers.length === 0) {
      setSelectedLayerId(null);
      setIsOpen(false);
    } else if (!selectedLayerId || !activeLayers.includes(selectedLayerId)) {
      setSelectedLayerId(activeLayers[0]);
    }
  }, [activeLayers]);

  useEffect(() => {
    if (!isOpen || !selectedLayerId) return;
    
    const layerMeta = getLayerById(selectedLayerId);
    if (!layerMeta || layerMeta.source_type !== "POSTGIS" || !layerMeta.queryable) {
      setData([]);
      setError(layerMeta ? "Layer is not queryable." : "Unknown layer.");
      return;
    }

    setLoading(true);
    setError(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    fetch(`${API_BASE}${layerMeta.source.replace("/api/v1", "")}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load table data");
        return res.json();
      })
      .then((geojson) => {
        if (geojson && geojson.features) {
          setData(geojson.features.map((f: any) => f.properties).slice(0, 50));
        } else {
          setData([]);
        }
      })
      .catch((err) => {
        setError(err.message);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [isOpen, selectedLayerId]);

  if (activeLayers.length === 0) return null;

  return (
    <div className={`absolute bottom-0 left-0 w-full bg-white border-t border-[#E3E8EF] shadow-md transition-all duration-200 z-[1000] flex flex-col font-sans ${isOpen ? "h-60" : "h-9"}`}>
      {/* Header Bar */}
      <div 
        className="h-9 px-4 bg-[#F7F9FC] border-b border-[#E3E8EF] flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <TableIcon className="w-3.5 h-3.5 text-[#1D5FD1]" />
          <span className="text-xs font-bold text-[#102A43]">GIS Feature Attribute Table</span>
          
          {isOpen && activeLayers.length > 0 && (
            <div className="ml-3 flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
              {activeLayers.map((id) => {
                const meta = getLayerById(id);
                if (!meta) return null;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedLayerId(id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      selectedLayerId === id 
                        ? "bg-[#1D5FD1] text-white" 
                        : "bg-white border border-[#E3E8EF] text-[#53627A] hover:bg-slate-100"
                    }`}
                  >
                    {meta.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-0.5 hover:bg-slate-200 rounded text-[#53627A]">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Table Content */}
      {isOpen && (
        <div className="flex-1 overflow-auto p-0 bg-white">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-xs text-[#53627A]">Loading layer records…</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-xs text-[#D9363E] font-medium">{error}</span>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-xs text-[#53627A]">No features found in the current layer extent.</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-max text-xs">
              <thead className="bg-[#F1F4F8] sticky top-0 border-b border-[#E3E8EF] z-10">
                <tr>
                  {Object.keys(data[0]).filter(k => !k.startsWith('_')).map((key) => (
                    <th key={key} className="px-3 py-2 text-[10px] font-bold text-[#53627A] uppercase tracking-wider whitespace-nowrap">
                      {key.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8EF] text-[11px] text-[#14213D]">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFD] h-9 transition-colors">
                    {Object.entries(row).filter(([k]) => !k.startsWith('_')).map(([k, v]) => (
                      <td key={k} className="px-3 py-1.5 whitespace-nowrap font-mono text-[11px]">
                        {String(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

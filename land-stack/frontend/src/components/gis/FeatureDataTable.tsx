"use client";

import { useState, useEffect } from "react";
import { getLayerById } from "@/config/gisLayerRegistry";
import { ChevronUp, ChevronDown, X, Table as TableIcon } from "lucide-react";

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
    // In a full implementation, we'd add pagination and filtering to the endpoint.
    // For Phase 5 architecture, we'll fetch the layer GeoJSON (limit 100 on backend normally).
    fetch(`${API_BASE}${layerMeta.source.replace("/api/v1", "")}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load table data");
        return res.json();
      })
      .then((geojson) => {
        if (geojson && geojson.features) {
          setData(geojson.features.map((f: any) => f.properties).slice(0, 50)); // cap at 50 for now
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
    <div className={`absolute bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 z-[1000] flex flex-col ${isOpen ? "h-64" : "h-10"}`}>
      {/* Header Bar */}
      <div 
        className="h-10 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <TableIcon className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-800">Attribute Table</span>
          
          {isOpen && activeLayers.length > 0 && (
            <div className="ml-4 flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
              {activeLayers.map((id) => {
                const meta = getLayerById(id);
                if (!meta) return null;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedLayerId(id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                      selectedLayerId === id 
                        ? "bg-indigo-600 text-white" 
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
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
          <button className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-500">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Table Content */}
      {isOpen && (
        <div className="flex-1 overflow-auto p-0 bg-white">
          {loading ? (
            <div className="flex items-center justify-center h-full space-x-2">
              <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <span className="text-xs text-slate-500 font-semibold">Loading data...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-xs text-red-500 font-semibold">{error}</span>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-xs text-slate-400 font-semibold">No features found in the current view.</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
                <tr>
                  {Object.keys(data[0]).filter(k => !k.startsWith('_')).map((key) => (
                    <th key={key} className="px-3 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                      {key.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    {Object.entries(row).filter(([k]) => !k.startsWith('_')).map(([k, v]) => (
                      <td key={k} className="px-3 py-2 whitespace-nowrap">
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

"use client";

import { useState } from "react";
import { fetchParcelSpatialOverlay } from "@/services/gisAnalysisService";
import { Layers, Play, X, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

interface LayerOverlayPanelProps {
  selectedUlpin: string | null;
}

interface OverlayResult {
  ulpin: string;
  layers: Record<string, { count: number; features: any[]; source: string }>;
  source: string;
}

const OVERLAY_LAYERS = [
  { id: "geology", label: "Geology & Lithology", color: "#059669", icon: "🪨" },
  { id: "soil", label: "Soil Classification", color: "#d97706", icon: "🌱" },
  { id: "landuse", label: "Land Use / LULC", color: "#2563eb", icon: "🏗️" },
  { id: "waterbodies", label: "Water Bodies", color: "#0284c7", icon: "💧" },
  { id: "roads", label: "Road Network", color: "#6b7280", icon: "🛣️" },
  { id: "elevation", label: "Elevation & Terrain", color: "#8b5cf6", icon: "⛰️" },
  { id: "risk_zones", label: "Hazard / Risk Zones", color: "#dc2626", icon: "⚠️" },
];

const MAX_LAYERS = 3;

export default function LayerOverlayPanel({ selectedUlpin }: LayerOverlayPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [result, setResult] = useState<OverlayResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleToggleLayer = (layerId: string) => {
    if (selectedLayers.includes(layerId)) {
      setSelectedLayers(selectedLayers.filter((l) => l !== layerId));
    } else if (selectedLayers.length < MAX_LAYERS) {
      setSelectedLayers([...selectedLayers, layerId]);
    }
  };

  const handleRunOverlay = async () => {
    if (!selectedUlpin || selectedLayers.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await fetchParcelSpatialOverlay(selectedUlpin, selectedLayers);
      setResult(data);
      setShowResults(true);
    } catch (err: any) {
      setError(err.message || "Overlay analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setShowResults(false);
    setError(null);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xs flex items-center space-x-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors shrink-0"
      >
        <Layers className="w-4 h-4 text-emerald-600" />
        <span>Spatial Overlay</span>
        {selectedLayers.length > 0 && (
          <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold">
            {selectedLayers.length}/{MAX_LAYERS}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-xl border border-slate-200 p-3 rounded-2xl shadow-xl z-50 space-y-3 animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                TNGIS-STYLE SPATIAL OVERLAY
              </span>
              <span className="text-[9px] text-slate-400">
                Select up to {MAX_LAYERS} layers for intersection analysis
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* ULPIN Display */}
          {selectedUlpin ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 text-[10px]">
              <span className="text-blue-500 font-semibold">Target Parcel: </span>
              <span className="text-blue-800 font-bold font-mono">{selectedUlpin}</span>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 flex items-center space-x-1.5 text-[10px]">
              <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <span className="text-amber-700 font-semibold">Click a parcel on the map first to select a ULPIN</span>
            </div>
          )}

          {/* Layer Checkboxes */}
          <div className="space-y-1 max-h-56 overflow-y-auto">
            {OVERLAY_LAYERS.map((layer) => {
              const isSelected = selectedLayers.includes(layer.id);
              const isDisabled = !isSelected && selectedLayers.length >= MAX_LAYERS;

              return (
                <label
                  key={layer.id}
                  className={`flex items-center space-x-2.5 p-2 rounded-lg border cursor-pointer transition-all text-xs ${
                    isSelected
                      ? "bg-blue-50/80 border-blue-200"
                      : isDisabled
                        ? "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => handleToggleLayer(layer.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className="flex-1 font-semibold text-slate-700">
                    {layer.icon} {layer.label}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunOverlay}
            disabled={!selectedUlpin || selectedLayers.length === 0 || loading}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-sm"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing…</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Run Overlay Analysis</span>
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 text-[10px] text-red-700 font-semibold">
              {error}
            </div>
          )}

          {/* Results */}
          {result && showResults && (
            <div className="space-y-2 border-t border-slate-100 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Overlay Results
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold">
                    {result.source}
                  </span>
                  <button onClick={handleClear} className="p-0.5 rounded hover:bg-slate-100">
                    <X className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>

              {Object.entries(result.layers).map(([layerId, data]) => {
                const layerMeta = OVERLAY_LAYERS.find((l) => l.id === layerId);
                return (
                  <div
                    key={layerId}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: layerMeta?.color || "#6b7280" }}
                        />
                        <span className="text-[11px] font-bold text-slate-700">
                          {layerMeta?.icon} {layerMeta?.label || layerId}
                        </span>
                      </div>
                      <span className={`text-xs font-black ${data.count > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                        {data.count} {data.count === 1 ? "feature" : "features"}
                      </span>
                    </div>

                    {/* Count bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(data.count * 20, 100)}%`,
                          backgroundColor: layerMeta?.color || "#6b7280",
                        }}
                      />
                    </div>

                    {/* Feature details */}
                    {data.features.length > 0 && (
                      <div className="space-y-1 mt-1">
                        {data.features.slice(0, 3).map((feat: any, idx: number) => (
                          <div key={idx} className="text-[9px] text-slate-500 bg-white rounded px-1.5 py-1 border border-slate-100">
                            {Object.entries(feat).slice(0, 3).map(([k, v]) => (
                              <span key={k} className="inline-block mr-2">
                                <span className="text-slate-400 font-semibold">{k.replace(/_/g, " ")}: </span>
                                <span className="text-slate-700 font-medium">{String(v)}</span>
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

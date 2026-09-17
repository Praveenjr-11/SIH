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
        className="h-9 px-3 bg-white border border-[#E3E8EF] rounded-md shadow-xs flex items-center space-x-2 text-xs font-semibold text-[#14213D] hover:bg-[#F7F9FC] transition-colors shrink-0"
      >
        <Layers className="w-4 h-4 text-[#16845B]" />
        <span>Spatial Overlay</span>
        {selectedLayers.length > 0 && (
          <span className="bg-emerald-50 text-[#16845B] border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold">
            {selectedLayers.length}/{MAX_LAYERS}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-80 bg-white border border-[#E3E8EF] p-3 rounded-lg shadow-lg z-50 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E3E8EF]">
            <div>
              <span className="text-[10px] font-bold text-[#102A43] uppercase tracking-wider block">
                TNGIS SPATIAL OVERLAY
              </span>
              <span className="text-[9px] text-[#53627A]">
                Select up to {MAX_LAYERS} layers for intersection analysis
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-md text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC] transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ULPIN Display */}
          {selectedUlpin ? (
            <div className="bg-[#F7F9FC] border border-[#E3E8EF] rounded-md px-2.5 py-1.5 text-[10px]">
              <span className="text-[#53627A] font-semibold">Target Parcel: </span>
              <span className="text-[#1D5FD1] font-bold font-mono">{selectedUlpin}</span>
            </div>
          ) : (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-md px-2.5 py-1.5 flex items-center space-x-1.5 text-[10px]">
              <AlertTriangle className="w-3 h-3 text-[#E99A16] flex-shrink-0" />
              <span className="text-[#B45309] font-medium">Click a parcel on the map first to select a ULPIN</span>
            </div>
          )}

          {/* Layer Checkboxes */}
          <div className="space-y-1 max-h-56 overflow-y-auto custom-scrollbar">
            {OVERLAY_LAYERS.map((layer) => {
              const isSelected = selectedLayers.includes(layer.id);
              const isDisabled = !isSelected && selectedLayers.length >= MAX_LAYERS;

              return (
                <label
                  key={layer.id}
                  className={`flex items-center space-x-2.5 p-2 rounded-md border cursor-pointer transition-all text-xs ${
                    isSelected
                      ? "bg-blue-50/50 border-[#1D5FD1] text-[#14213D]"
                      : isDisabled
                        ? "bg-[#F7F9FC] border-[#E3E8EF] opacity-50 cursor-not-allowed text-[#53627A]"
                        : "bg-white border-[#E3E8EF] hover:bg-[#F7F9FC] text-[#14213D]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => handleToggleLayer(layer.id)}
                    className="rounded border-[#E3E8EF] text-[#1D5FD1] focus:ring-[#1D5FD1] w-3.5 h-3.5"
                  />
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className="flex-1 font-medium">
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
            className="w-full py-2 bg-[#16845B] hover:bg-[#13724e] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-md text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-xs"
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
            <div className="bg-red-50 border border-red-200 rounded-md px-2.5 py-1.5 text-[10px] text-[#D9363E] font-medium">
              {error}
            </div>
          )}

          {/* Results */}
          {result && showResults && (
            <div className="space-y-2 border-t border-[#E3E8EF] pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#102A43] uppercase tracking-wider">
                  Overlay Results
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#F7F9FC] border border-[#E3E8EF] text-[#53627A] font-bold">
                    {result.source}
                  </span>
                  <button onClick={handleClear} className="p-0.5 rounded-md hover:bg-[#F7F9FC] text-[#53627A]">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {Object.entries(result.layers).map(([layerId, data]) => {
                const layerMeta = OVERLAY_LAYERS.find((l) => l.id === layerId);
                return (
                  <div
                    key={layerId}
                    className="bg-[#F7F9FC] border border-[#E3E8EF] rounded-md p-2.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: layerMeta?.color || "#53627A" }}
                        />
                        <span className="text-[11px] font-bold text-[#14213D]">
                          {layerMeta?.icon} {layerMeta?.label || layerId}
                        </span>
                      </div>
                      <span className={`text-xs font-bold ${data.count > 0 ? "text-[#16845B]" : "text-[#53627A]"}`}>
                        {data.count} {data.count === 1 ? "feature" : "features"}
                      </span>
                    </div>

                    {/* Count bar */}
                    <div className="w-full bg-[#E3E8EF] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(data.count * 20, 100)}%`,
                          backgroundColor: layerMeta?.color || "#1D5FD1",
                        }}
                      />
                    </div>

                    {/* Feature details */}
                    {data.features.length > 0 && (
                      <div className="space-y-1 mt-1">
                        {data.features.slice(0, 3).map((feat: any, idx: number) => (
                          <div key={idx} className="text-[9px] text-[#53627A] bg-white rounded px-2 py-1 border border-[#E3E8EF]">
                            {Object.entries(feat).slice(0, 3).map(([k, v]) => (
                              <span key={k} className="inline-block mr-2">
                                <span className="text-[#53627A] font-medium">{k.replace(/_/g, " ")}: </span>
                                <span className="text-[#14213D] font-semibold">{String(v)}</span>
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

"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Eye, EyeOff, Layers, Search, AlertCircle, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { GIS_LAYER_REGISTRY, getLayersByCategory } from "@/config/gisLayerRegistry";

interface LayerState {
  status: "idle" | "loading" | "loaded" | "error";
  errorMsg?: string;
  featureCount?: number;
  source?: string;
}

interface LayerManagerProps {
  activeLayers: string[];
  layerStates?: Record<string, LayerState>;
  onToggleLayer: (layerId: string) => void;
}

export default function LayerManager({ activeLayers, layerStates = {}, onToggleLayer }: LayerManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    ADMINISTRATIVE: true,
    NATURAL_RESOURCES: true,
  });

  const categories = getLayersByCategory();

  const filteredCategories = useMemo(() => {
    const result = {} as Record<string, typeof GIS_LAYER_REGISTRY>;
    for (const [category, layers] of Object.entries(categories)) {
      const matching = layers.filter(
        (l) =>
          l.name.toLowerCase().includes(query.toLowerCase()) ||
          l.category.toLowerCase().includes(query.toLowerCase())
      );
      if (matching.length > 0) {
        result[category] = matching;
      }
    }
    return result;
  }, [categories, query]);

  const toggleCategory = (category: string) => {
    setExpanded((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className="relative z-[1000]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xs flex items-center space-x-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors shrink-0"
        aria-label="Layer Manager"
      >
        <Layers className="w-4 h-4 text-indigo-600" />
        <span>Map Layers</span>
        {activeLayers.length > 0 && (
          <span className="bg-indigo-100 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded text-[9px] font-bold">
            {activeLayers.length} active
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[340px] max-h-[80vh] flex flex-col bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="flex-shrink-0 bg-slate-50 border-b border-slate-200 p-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">GIS Layer Registry</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search layer name or category (e.g., 'forest')"
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          {/* Layer List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {Object.keys(filteredCategories).length === 0 ? (
              <p className="p-3 text-center text-xs text-slate-400">No layers match "{query}".</p>
            ) : (
              Object.entries(filteredCategories).map(([category, layers]) => (
                <div key={category} className="border border-slate-100 rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex w-full items-center justify-between bg-slate-100 px-3 py-2 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider hover:bg-slate-200 transition-colors"
                  >
                    <span>{category.replace(/_/g, " ")}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${expanded[category] ? "rotate-180" : ""}`}
                    />
                  </button>

                  {expanded[category] && (
                    <div className="bg-white p-1.5 space-y-0.5">
                      {layers.map((layer) => {
                        const isVisible = activeLayers.includes(layer.id);
                        const state = layerStates[layer.id];
                        
                        return (
                          <div key={layer.id} className="flex flex-col space-y-1 p-1.5 rounded-md transition-colors hover:bg-slate-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 min-w-0">
                                <button
                                  onClick={() => onToggleLayer(layer.id)}
                                  className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors ${
                                    isVisible ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400 hover:text-slate-600"
                                  }`}
                                >
                                  {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>
                                <div className="truncate flex items-center space-x-1.5">
                                  {layer.style?.icon ? (
                                    <span className="text-xs">{layer.style.icon}</span>
                                  ) : (
                                    <div
                                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                      style={{
                                        backgroundColor: layer.style?.fillColor || layer.style?.color || "#cbd5e1",
                                        border: `1px solid ${layer.style?.color || "transparent"}`,
                                      }}
                                    />
                                  )}
                                  <span
                                    className={`text-[11px] truncate ${
                                      isVisible ? "font-bold text-indigo-900" : "font-medium text-slate-700"
                                    }`}
                                    title={layer.name}
                                  >
                                    {layer.name}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Source / pending badge */}
                              <div className="flex items-center space-x-1.5 flex-shrink-0">
                                {isVisible && state?.status === "loading" && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
                                {isVisible && state?.status === "loaded" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                                {isVisible && state?.status === "error" && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                                {!isVisible && layer.data_status === "PENDING_VERIFICATION" && (
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                )}
                              </div>
                            </div>
                            
                            {/* Status Banner — replaces raw error with helpful context */}
                            {isVisible && state && (
                              <>
                                {state.status === "loading" && (
                                  <div className="ml-8 text-[9px] text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                    Fetching {layer.name} from TNGIS…
                                  </div>
                                )}
                                {state.status === "loaded" && (
                                  <div className="ml-8 text-[9px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    <span className="font-bold">Loaded</span>
                                    {state.featureCount !== undefined && (
                                      <span className="text-emerald-600">{state.featureCount} features</span>
                                    )}
                                    <span className="text-emerald-500 font-semibold">· {state.source === 'TNGIS' ? 'TNGIS Live' : state.source || 'API'}</span>
                                  </div>
                                )}
                                {state.status === "error" && state.errorMsg && (() => {
                                  const msg = state.errorMsg;
                                  const isWMS = msg.includes('WMS tile layer');
                                  const isTNGIS = msg.includes('TNGIS:');
                                  const isZoom = msg.includes('Zoom in') || msg.includes('Zoom out');
                                  return (
                                    <div className={`ml-8 text-[9px] px-2 py-1 rounded border flex flex-col gap-0.5 ${
                                      isZoom ? 'text-amber-700 bg-amber-50 border-amber-100' :
                                      isWMS  ? 'text-sky-700 bg-sky-50 border-sky-100' :
                                               'text-rose-600 bg-rose-50 border-rose-100'
                                    }`}>
                                      <span className="font-semibold">
                                        {isZoom ? `⚠ ${msg}` :
                                         isWMS  ? `ℹ ${layer.name} uses WMS tile rendering` :
                                         isTNGIS ? `⚠ TNGIS unavailable — ${msg.replace('TNGIS: ', '')}` :
                                                   `⚠ ${msg}`}
                                      </span>
                                    </div>
                                  );
                                })()}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

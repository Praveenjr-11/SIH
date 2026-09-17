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
    <div className="relative z-[1000] font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-3 bg-[#FFFFFF] border border-[#E3E8EF] rounded-md shadow-xs flex items-center space-x-2 text-xs font-semibold text-[#102A43] hover:bg-[#F7F9FC] transition-colors shrink-0"
        aria-label="Layer Manager"
      >
        <Layers className="w-4 h-4 text-[#1D5FD1]" />
        <span>Thematic Layers</span>
        {activeLayers.length > 0 && (
          <span className="bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF] px-1.5 py-0.5 rounded text-[10px] font-bold">
            {activeLayers.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-[330px] max-h-[75vh] flex flex-col bg-[#FFFFFF] border border-[#E3E8EF] rounded-md shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 bg-[#F7F9FC] border-b border-[#E3E8EF] p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#102A43] uppercase tracking-wider">Spatial Layer Catalog</h3>
              <span className="text-[10px] text-[#53627A]">Official Datasets</span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#53627A]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter layers (e.g. geology, forest)..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E3E8EF] rounded text-xs text-[#14213D] focus:outline-none focus:border-[#1D5FD1]"
              />
            </div>
          </div>

          {/* Layer List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {Object.keys(filteredCategories).length === 0 ? (
              <p className="p-3 text-center text-xs text-[#53627A]">No layers match "{query}".</p>
            ) : (
              Object.entries(filteredCategories).map(([category, layers]) => (
                <div key={category} className="border border-[#E3E8EF] rounded overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex w-full items-center justify-between bg-[#F7F9FC] px-3 py-2 text-left text-[11px] font-bold text-[#53627A] uppercase tracking-wider hover:bg-slate-100 transition-colors"
                  >
                    <span>{category.replace(/_/g, " ")}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform text-[#53627A] ${expanded[category] ? "rotate-180" : ""}`}
                    />
                  </button>

                  {expanded[category] && (
                    <div className="bg-white p-1 divide-y divide-[#E3E8EF]/60">
                      {layers.map((layer) => {
                        const isActive = activeLayers.includes(layer.id);
                        const state = layerStates[layer.id];
                        const isLoading = state?.status === "loading";
                        const isError = state?.status === "error";

                        return (
                          <div
                            key={layer.id}
                            className="flex items-center justify-between p-2 hover:bg-[#F7F9FC] rounded transition-colors text-xs"
                          >
                            <div className="flex items-center space-x-2 min-w-0 pr-2">
                              <button
                                onClick={() => onToggleLayer(layer.id)}
                                className={`p-1 rounded transition-colors shrink-0 ${
                                  isActive 
                                    ? "text-[#1D5FD1] bg-[#F1F5FB]" 
                                    : "text-[#53627A] hover:text-[#102A43]"
                                }`}
                                title={isActive ? "Hide Layer" : "Show Layer"}
                              >
                                {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>
                              <div className="min-w-0">
                                <div className="font-semibold text-[#14213D] truncate text-xs">{layer.name}</div>
                                <div className="text-[10px] text-[#53627A] truncate">{layer.geometry_type} · {layer.source_type}</div>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center space-x-1">
                              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1D5FD1]" />}
                              {isError && (
                                <span title={state?.errorMsg}>
                                  <AlertCircle className="w-3.5 h-3.5 text-[#D9363E]" />
                                </span>
                              )}
                              {state?.status === "loaded" && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#16845B]" />
                              )}
                            </div>
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

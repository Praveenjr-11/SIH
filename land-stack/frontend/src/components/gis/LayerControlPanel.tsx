"use client";

import { useEffect, useState } from "react";
import { fetchGisLayersList } from "@/services/gisAnalysisService";
import { Layers, Eye, EyeOff, Info, Database, Shield, HardDriveUpload, Building2 } from "lucide-react";
import VillageBoundaryManager from "./VillageBoundaryManager";

interface LayerControlPanelProps {
  activeLayers: string[];
  onToggleLayer: (layerId: string) => void;
  onSelectStateBoundary?: (stateName: string) => void;
}

interface GisLayerMeta {
  layer: string;
  displayName: string;
  geometryType: string;
  available: boolean;
  category: string;
  source: string;
  sourceStatus: "MOCK" | "REAL" | "DERIVED";
  version: string;
  organization: string;
  updatedAt: string | null;
  attribution: string | null;
  crs: string;
}

function SourceBadge({ status }: { status: string }) {
  if (status === "REAL" || status === "REAL_VILLAGE_BOUNDARY") {
    return (
      <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
        <Shield className="w-2.5 h-2.5 text-emerald-600" />
        <span>Verified Real</span>
      </span>
    );
  }
  if (status === "DERIVED") {
    return (
      <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
        <Database className="w-2.5 h-2.5" />
        <span>Derived</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
      <Database className="w-2.5 h-2.5" />
      <span>Mock</span>
    </span>
  );
}

export default function LayerControlPanel({
  activeLayers,
  onToggleLayer,
  onSelectStateBoundary,
}: LayerControlPanelProps) {
  const [gisLayers, setGisLayers] = useState<GisLayerMeta[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null);
  const [isVillageManagerOpen, setIsVillageManagerOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await fetchGisLayersList();
      setGisLayers(data);
    }
    load();
  }, []);

  const realCount = gisLayers.filter(
    (l) => l.sourceStatus === "REAL" || l.source === "REAL_VILLAGE_BOUNDARY"
  ).length;
  const mockCount = gisLayers.filter((l) => l.sourceStatus === "MOCK").length;

  const categoryColors: Record<string, string> = {
    administrative: "#10b981",
    geology: "#059669",
    soil: "#d97706",
    landuse: "#2563eb",
    water: "#0284c7",
    roads: "#6b7280",
    elevation: "#8b5cf6",
    hazard: "#dc2626",
  };

  return (
    <>
      <div className="relative">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-white/95 backdrop-blur-md border border-slate-200 px-3.5 py-2 rounded-2xl shadow-md flex items-center space-x-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span>GIS Layers ({activeLayers.length})</span>
            {realCount > 0 && (
              <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold">
                {realCount} Real
              </span>
            )}
          </button>

          <button
            onClick={() => setIsVillageManagerOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-2xl shadow-md flex items-center space-x-1.5 text-xs font-bold transition-all hover:scale-[1.02]"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Village Boundaries ZIP</span>
            <span className="bg-emerald-800 text-white text-[9px] px-1.5 py-0.5 rounded-full">261.5k</span>
          </button>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-xl border border-slate-200 p-3 rounded-2xl shadow-xl z-50 space-y-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                ACTIVE MAP OVERLAYS
              </span>
              <div className="flex items-center space-x-2">
                {realCount > 0 && (
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-1.5 py-0.5 rounded">
                    {realCount} Verified
                  </span>
                )}
                {mockCount > 0 && (
                  <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 font-bold px-1.5 py-0.5 rounded">
                    {mockCount} Mock
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {gisLayers.map((layer) => {
                const isEnabled = activeLayers.includes(layer.layer);
                const isExpanded = expandedLayer === layer.layer;
                const dotColor = categoryColors[layer.category] || "#6b7280";

                return (
                  <div key={layer.layer} className="space-y-0">
                    <div
                      onClick={() => onToggleLayer(layer.layer)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                        isEnabled
                          ? "bg-blue-50/80 border-blue-200 text-slate-900"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: dotColor }}
                        ></div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold block leading-tight truncate">
                              {layer.displayName}
                            </span>
                            <SourceBadge status={layer.sourceStatus} />
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium block truncate">
                            {layer.source} {layer.version ? `• v${layer.version}` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedLayer(isExpanded ? null : layer.layer);
                          }}
                          className="p-0.5 rounded text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        {isEnabled ? (
                          <Eye className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mx-2 mb-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] space-y-1.5 animate-in fade-in">
                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <span className="text-slate-400 font-semibold block">Source</span>
                            <span className="text-slate-700 font-bold">{layer.source}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold block">Status</span>
                            <SourceBadge status={layer.sourceStatus} />
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold block">Version</span>
                            <span className="text-slate-700 font-medium">
                              {layer.version || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold block">CRS</span>
                            <span className="text-slate-700 font-medium">{layer.crs}</span>
                          </div>
                          {layer.organization && (
                            <div className="col-span-2">
                              <span className="text-slate-400 font-semibold block">Organization</span>
                              <span className="text-slate-700 font-medium">{layer.organization}</span>
                            </div>
                          )}
                        </div>
                        {layer.attribution && (
                          <p className="text-[9px] text-slate-500 italic border-t border-slate-200 pt-1.5 mt-1">
                            {layer.attribution}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <VillageBoundaryManager
        isOpen={isVillageManagerOpen}
        onClose={() => setIsVillageManagerOpen(false)}
        onSelectStateBoundary={onSelectStateBoundary}
      />
    </>
  );
}

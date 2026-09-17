"use client";

import React, { useState } from "react";
import {
  Layers,
  ChevronDown,
  X,
  RotateCcw,
  CheckSquare,
  Square,
  Search,
  ShieldCheck,
  Building2,
  Receipt,
  Network,
  Trees,
  SlidersHorizontal
} from "lucide-react";

export interface LayerItemDef {
  id: string;
  name: string;
  description?: string;
}

export interface LayerCategoryDef {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  layers: LayerItemDef[];
}

export const LAYER_GROUPS: LayerCategoryDef[] = [
  {
    id: "BASE_LAYERS",
    title: "BASE LAYERS",
    icon: Layers,
    accentColor: "text-[#1D5FD1]",
    layers: [
      { id: "cadastral_parcels", name: "Cadastral Parcels", description: "ULPIN, boundaries & survey numbers" },
      { id: "satellite_imagery", name: "Satellite Imagery", description: "High-resolution satellite view" },
      { id: "road_network", name: "Road Network", description: "State & national highways, local roads" },
      { id: "administrative_boundary", name: "Administrative Boundary", description: "District, taluk & village boundaries" },
    ],
  },
  {
    id: "GOVERNANCE",
    title: "GOVERNANCE",
    icon: ShieldCheck,
    accentColor: "text-[#6366F1]",
    layers: [
      { id: "gov_ror", name: "Record of Rights / RoR", description: "Certified land title & patta register" },
      { id: "gov_registration", name: "Registration", description: "Sub-Registrar Office deed linkage" },
      { id: "gov_encumbrance", name: "Encumbrance", description: "13-year statutory encumbrance certificate" },
      { id: "gov_mortgage", name: "Mortgage", description: "Bank hypothecations & institutional liens" },
      { id: "gov_disputes", name: "Disputes", description: "Court injunctions & litigation stays" },
    ],
  },
  {
    id: "PLANNING",
    title: "PLANNING",
    icon: Building2,
    accentColor: "text-[#0284C7]",
    layers: [
      { id: "plan_master_plan", name: "Master Plan", description: "DTCP / CMDA statutory master plan scope" },
      { id: "plan_zoning", name: "Zoning", description: "Residential, commercial, industrial zoning" },
      { id: "plan_land_use", name: "Land Use", description: "Current land use classification" },
      { id: "plan_building_permissions", name: "Building Permissions", description: "Permissible FSI & building height limits" },
      { id: "plan_restrictions", name: "Restrictions", description: "Buffer zones & development setbacks" },
    ],
  },
  {
    id: "FISCAL",
    title: "FISCAL",
    icon: Receipt,
    accentColor: "text-[#16845B]",
    layers: [
      { id: "fiscal_property_tax", name: "Property Tax", description: "Municipal tax assessment status" },
      { id: "fiscal_valuation", name: "Valuation", description: "Registration guideline rate & market value" },
    ],
  },
  {
    id: "INFRASTRUCTURE",
    title: "INFRASTRUCTURE",
    icon: Network,
    accentColor: "text-[#E99A16]",
    layers: [
      { id: "infra_water", name: "Water", description: "Water pipelines & surface catchments" },
      { id: "infra_electricity", name: "Electricity", description: "High-voltage transmission grid lines" },
      { id: "infra_drainage", name: "Drainage", description: "Stormwater channels & municipal drains" },
      { id: "infra_roads", name: "Roads", description: "PWD right-of-way alignment" },
    ],
  },
  {
    id: "ENVIRONMENT",
    title: "ENVIRONMENT",
    icon: Trees,
    accentColor: "text-[#059669]",
    layers: [
      { id: "env_protected_areas", name: "Protected Areas", description: "Reserved forests & wildlife sanctuaries" },
      { id: "env_flood_hazard", name: "Flood Hazard", description: "GSI hydrological flood risk classification" },
      { id: "env_eco_sensitive_zones", name: "Eco-Sensitive Zones", description: "Catchment & wetland buffer zones" },
    ],
  },
];

interface GisLayerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeLayers: Set<string>;
  onToggleLayer: (layerId: string) => void;
  onResetToDefaults: () => void;
}

export default function GisLayerPanel({
  isOpen,
  onClose,
  activeLayers,
  onToggleLayer,
  onResetToDefaults,
}: GisLayerPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  if (!isOpen) return null;

  const totalActiveCount = activeLayers.size;

  return (
    <div className="absolute top-14 left-3 sm:left-4 z-[2100] w-[310px] sm:w-[340px] max-h-[calc(100vh-140px)] flex flex-col bg-white border border-[#E3E8EF] rounded-xl shadow-xl overflow-hidden font-sans animate-in fade-in slide-in-from-left-4 duration-200">
      {/* HEADER */}
      <div className="p-3.5 bg-[#102A43] text-white flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-md bg-[#1C3D5D] flex items-center justify-center text-[#1D5FD1]">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Layer Catalog
            </h3>
            <p className="text-[10px] text-slate-300">Tamil Nadu Land Stack DPI</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {totalActiveCount > 1 && (
            <button
              onClick={onResetToDefaults}
              className="px-2 py-0.5 rounded text-[10px] font-semibold text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors flex items-center space-x-1"
              title="Reset to default layers"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-[#1C3D5D] hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="Close Layer Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FILTER INPUT */}
      <div className="p-2.5 bg-[#F7F9FC] border-b border-[#E3E8EF] shrink-0">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-[#53627A] absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter layer name..."
            className="w-full h-8 pl-8 pr-7 bg-white border border-[#E3E8EF] rounded-md text-xs text-[#14213D] placeholder:text-[#53627A] focus:outline-none focus:border-[#1D5FD1]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* SCROLLABLE LAYERS LIST */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
        {LAYER_GROUPS.map((group) => {
          const GroupIcon = group.icon;
          const isCollapsed = collapsedCategories[group.id];

          // Filter layers by search query
          const filteredLayers = group.layers.filter((l) =>
            !searchQuery ||
            l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.title.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filteredLayers.length === 0) return null;

          const groupActiveCount = filteredLayers.filter((l) => activeLayers.has(l.id)).length;

          return (
            <div key={group.id} className="border border-[#E3E8EF] rounded-lg overflow-hidden bg-white">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(group.id)}
                className="w-full px-3 py-2 bg-[#F8FAFD] hover:bg-[#F1F5FB] flex items-center justify-between text-left transition-colors border-b border-[#E3E8EF]/60"
              >
                <div className="flex items-center space-x-2">
                  <GroupIcon className={`w-3.5 h-3.5 ${group.accentColor}`} />
                  <span className="text-[11px] font-bold text-[#102A43] uppercase tracking-wider">
                    {group.title}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {groupActiveCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#1D5FD1] text-white text-[9px] font-bold flex items-center justify-center">
                      {groupActiveCount}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#53627A] transition-transform duration-200 ${
                      isCollapsed ? "-rotate-90" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Category Layers */}
              {!isCollapsed && (
                <div className="divide-y divide-[#E3E8EF]/50 p-1">
                  {filteredLayers.map((layer) => {
                    const isChecked = activeLayers.has(layer.id);
                    return (
                      <label
                        key={layer.id}
                        className={`flex items-start space-x-2.5 p-2 rounded-md cursor-pointer transition-colors ${
                          isChecked ? "bg-[#F1F5FB]/70" : "hover:bg-[#F8FAFD]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleLayer(layer.id)}
                          className="mt-0.5 w-3.5 h-3.5 rounded border-[#E3E8EF] text-[#1D5FD1] focus:ring-[#1D5FD1] focus:ring-offset-0 cursor-pointer accent-[#1D5FD1]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-semibold leading-tight ${
                            isChecked ? "text-[#1D5FD1]" : "text-[#102A43]"
                          }`}>
                            {layer.name}
                          </div>
                          {layer.description && (
                            <div className="text-[10px] text-[#53627A] truncate mt-0.5">
                              {layer.description}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="p-2.5 bg-[#F8FAFD] border-t border-[#E3E8EF] flex items-center justify-between text-[10px] text-[#53627A] font-medium shrink-0">
        <span>Active: <strong className="text-[#1D5FD1]">{totalActiveCount} layers</strong></span>
        <span>SIH26014 DPI Certified</span>
      </div>
    </div>
  );
}

"use client";

import { useMap } from "react-leaflet";
import { Plus, Minus, Globe, Layers } from "lucide-react";
import { BasemapType } from "@/types/gis";

interface MapControlsProps {
  currentBasemap: BasemapType;
  onSelectBasemap: (basemap: BasemapType) => void;
}

export default function MapControls({ currentBasemap, onSelectBasemap }: MapControlsProps) {
  const map = useMap();

  const handleResetView = () => {
    map.flyTo([20.5937, 78.9629], 5, { duration: 1.5 });
  };

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <div className="absolute top-3 right-3 z-30 flex flex-col items-end space-y-2">
      {/* Zoom & Pan Control Buttons */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xs p-1 flex flex-col space-y-0.5">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <div className="h-px bg-slate-200 mx-1"></div>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Reset to India Center Button */}
      <button
        onClick={handleResetView}
        title="Reset Map to India View"
        className="bg-white/95 backdrop-blur-md border border-slate-200 px-3 h-9 rounded-xl shadow-xs text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors flex items-center space-x-1.5"
      >
        <span className="text-sm">🇮🇳</span>
        <span>India View</span>
      </button>

      {/* Basemap Switcher Selector */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-1 rounded-xl shadow-xs flex items-center space-x-1">
        <button
          onClick={() => onSelectBasemap("osm")}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
            currentBasemap === "osm"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          OSM
        </button>
        <button
          onClick={() => onSelectBasemap("satellite")}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
            currentBasemap === "satellite"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => onSelectBasemap("topo")}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
            currentBasemap === "topo"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Topo
        </button>
      </div>
    </div>
  );
}

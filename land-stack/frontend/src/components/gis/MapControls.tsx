"use client";

import { useState } from "react";
import { useMap } from "react-leaflet";
import { Plus, Minus, Globe, Layers, Ruler, Trash2, MapPin, Navigation } from "lucide-react";
import { BasemapType } from "@/types/gis";

interface MapControlsProps {
  currentBasemap: BasemapType;
  onSelectBasemap: (basemap: BasemapType) => void;
  measureMode: "off" | "distance" | "area";
  onSetMeasureMode: (mode: "off" | "distance" | "area") => void;
  onClearMeasure: () => void;
  onGoToPoint?: (lat: number, lng: number) => void;
}

export default function MapControls({
  currentBasemap,
  onSelectBasemap,
  measureMode,
  onSetMeasureMode,
  onClearMeasure,
  onGoToPoint,
}: MapControlsProps) {
  const map = useMap();
  const [showGoTo, setShowGoTo] = useState(false);
  const [goToInput, setGoToInput] = useState("");
  const [goToError, setGoToError] = useState<string | null>(null);
  const [showMeasureDropdown, setShowMeasureDropdown] = useState(false);

  const handleResetView = () => {
    map.flyTo([20.5937, 78.9629], 5, { duration: 1.5 });
  };

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  // Phase 4: Go to Location
  const handleGoTo = () => {
    setGoToError(null);
    const parts = goToInput.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
      setGoToError("Enter coordinates as: lat, lng");
      return;
    }
    const [lat, lng] = parts;
    // Validate India bounding box
    if (lat < 6 || lat > 37 || lng < 68 || lng > 98) {
      setGoToError("Coordinates outside India (lat 6–37, lng 68–98)");
      return;
    }
    map.flyTo([lat, lng], 16, { duration: 1.5 });
    setShowGoTo(false);
    setGoToInput("");
    if (onGoToPoint) {
      onGoToPoint(lat, lng);
    }
  };

  // Phase 3: Measure toggle
  const handleMeasureToggle = (mode: "distance" | "area") => {
    if (measureMode === mode) {
      onSetMeasureMode("off");
    } else {
      onSetMeasureMode(mode);
    }
    setShowMeasureDropdown(false);
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

      {/* Phase 3: Measure Tool */}
      <div className="relative">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-1 rounded-xl shadow-xs flex items-center space-x-0.5">
          <button
            onClick={() => setShowMeasureDropdown(!showMeasureDropdown)}
            title="Measurement Tool"
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 ${
              measureMode !== "off"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>{measureMode === "distance" ? "Distance" : measureMode === "area" ? "Area" : "Measure"}</span>
          </button>
          {measureMode !== "off" && (
            <button
              onClick={() => {
                onClearMeasure();
                onSetMeasureMode("off");
              }}
              title="Clear Measurement"
              className="px-2 py-1.5 rounded-lg text-[11px] font-bold text-red-500 hover:bg-red-50 hover:text-red-700 transition-all flex items-center space-x-0.5"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Measure dropdown */}
        {showMeasureDropdown && (
          <div className="absolute top-full right-0 mt-1 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl p-1 space-y-0.5 z-50 w-36 animate-in fade-in slide-in-from-top-1">
            <button
              onClick={() => handleMeasureToggle("distance")}
              className={`w-full px-3 py-1.5 rounded-lg text-[11px] font-bold text-left transition-all flex items-center space-x-2 ${
                measureMode === "distance"
                  ? "bg-violet-100 text-violet-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>📏</span>
              <span>Distance</span>
            </button>
            <button
              onClick={() => handleMeasureToggle("area")}
              className={`w-full px-3 py-1.5 rounded-lg text-[11px] font-bold text-left transition-all flex items-center space-x-2 ${
                measureMode === "area"
                  ? "bg-violet-100 text-violet-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>📐</span>
              <span>Area</span>
            </button>
          </div>
        )}
      </div>

      {/* Phase 4: Go to Location */}
      <div className="relative">
        <button
          onClick={() => {
            setShowGoTo(!showGoTo);
            setGoToError(null);
          }}
          title="Go to Coordinates"
          className={`bg-white/95 backdrop-blur-md border border-slate-200 px-3 h-9 rounded-xl shadow-xs text-xs font-bold transition-colors flex items-center space-x-1.5 ${
            showGoTo ? "bg-blue-50 text-blue-700 border-blue-200" : "text-slate-800 hover:bg-slate-50"
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Go to</span>
        </button>

        {showGoTo && (
          <div className="absolute top-full right-0 mt-1 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl p-2.5 z-50 w-56 animate-in fade-in slide-in-from-top-1">
            <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
              Lat, Lng (decimal degrees)
            </label>
            <div className="flex items-center space-x-1">
              <input
                type="text"
                value={goToInput}
                onChange={(e) => {
                  setGoToInput(e.target.value);
                  setGoToError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleGoTo()}
                placeholder="12.9449, 79.9556"
                className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              <button
                onClick={handleGoTo}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold transition-colors"
              >
                Go
              </button>
            </div>
            {goToError && (
              <p className="text-[9px] text-red-500 font-semibold mt-1">{goToError}</p>
            )}
            <p className="text-[8px] text-slate-400 mt-1">
              India bounds: lat 6–37, lng 68–98
            </p>
          </div>
        )}
      </div>

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

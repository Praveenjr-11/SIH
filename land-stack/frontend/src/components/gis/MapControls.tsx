"use client";

import { useState } from "react";
import { useMap } from "react-leaflet";
import {
  Plus,
  Minus,
  Navigation,
  Ruler,
  Layers,
  Maximize,
  Minimize,
  Trash2,
  MapPin,
  Crosshair,
  Loader2,
  Satellite
} from "lucide-react";
import { BasemapType } from "@/types/gis";

interface MapControlsProps {
  currentBasemap?: BasemapType;
  onSelectBasemap?: (basemap: BasemapType) => void;
  onToggleBasemap?: () => void;
  measureMode: "off" | "distance" | "area";
  onSetMeasureMode: (mode: "off" | "distance" | "area") => void;
  onClearMeasure: () => void;
  onGoToPoint?: (lat: number, lng: number) => void;
  isLayerPanelOpen?: boolean;
  onToggleLayerPanel?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export default function MapControls({
  currentBasemap = "satellite",
  onSelectBasemap,
  onToggleBasemap,
  measureMode,
  onSetMeasureMode,
  onClearMeasure,
  onGoToPoint,
  isLayerPanelOpen = false,
  onToggleLayerPanel,
  isFullscreen = false,
  onToggleFullscreen,
}: MapControlsProps) {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const [showMeasureDropdown, setShowMeasureDropdown] = useState(false);

  // Zoom In
  const handleZoomIn = () => {
    map.zoomIn();
  };

  // Zoom Out
  const handleZoomOut = () => {
    map.zoomOut();
  };

  // Locate (Browser Geolocation or center on Tamil Nadu)
  const handleLocate = () => {
    setLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.flyTo([latitude, longitude], 16, { duration: 1.5 });
          if (onGoToPoint) {
            onGoToPoint(latitude, longitude);
          }
          setLocating(false);
        },
        (error) => {
          console.warn("Geolocation access denied or unavailable, resetting to Tamil Nadu center:", error);
          // Fall back to Tamil Nadu state center
          map.flyTo([11.1271, 78.6569], 7.5, { duration: 1.2 });
          setLocating(false);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      map.flyTo([11.1271, 78.6569], 7.5, { duration: 1.2 });
      setLocating(false);
    }
  };

  const handleMeasureToggle = (mode: "distance" | "area") => {
    if (measureMode === mode) {
      onSetMeasureMode("off");
    } else {
      onSetMeasureMode(mode);
    }
    setShowMeasureDropdown(false);
  };

  return (
    <div className="absolute top-3 right-3 z-[2000] flex flex-col items-end space-y-2 font-sans select-none">
      {/* 1. ZOOM IN & ZOOM OUT */}
      <div className="bg-white border border-[#E3E8EF] rounded-lg shadow-sm p-1 flex flex-col space-y-1">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom In"
          className="w-8 h-8 rounded-md flex items-center justify-center text-[#102A43] hover:bg-[#F1F5FB] hover:text-[#1D5FD1] transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <div className="h-px bg-[#E3E8EF] mx-1"></div>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom Out"
          className="w-8 h-8 rounded-md flex items-center justify-center text-[#102A43] hover:bg-[#F1F5FB] hover:text-[#1D5FD1] transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* 2. DIRECT SATELLITE / STREET BASEMAP TOGGLE */}
      {onToggleBasemap && (
        <button
          onClick={onToggleBasemap}
          title={
            currentBasemap === "satellite"
              ? "Satellite Imagery is active. Click to switch to Vector / Street Map."
              : "Vector Map is active. Click to switch to Satellite Imagery."
          }
          aria-label="Toggle Satellite Basemap"
          className={`h-9 px-3 rounded-lg border shadow-sm flex items-center space-x-1.5 text-xs font-bold transition-all ${
            currentBasemap === "satellite"
              ? "bg-[#102A43] text-white border-[#102A43] hover:bg-[#1D5FD1]"
              : "bg-white text-[#102A43] border-[#E3E8EF] hover:bg-[#F1F5FB] hover:text-[#1D5FD1]"
          }`}
        >
          <Satellite className={`w-3.5 h-3.5 ${currentBasemap === "satellite" ? "text-[#38BDF8]" : "text-[#53627A]"}`} />
          <span>{currentBasemap === "satellite" ? "Satellite" : "Street"}</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              currentBasemap === "satellite" ? "bg-[#38BDF8] animate-pulse" : "bg-slate-300"
            }`}
          />
        </button>
      )}

      {/* 3. LOCATE BUTTON */}
      <button
        onClick={handleLocate}
        title="Locate Current Position"
        aria-label="Locate Current Position"
        className={`w-10 h-10 rounded-lg bg-white border border-[#E3E8EF] shadow-sm flex items-center justify-center transition-colors ${
          locating ? "text-[#1D5FD1] bg-[#F1F5FB]" : "text-[#102A43] hover:bg-[#F1F5FB] hover:text-[#1D5FD1]"
        }`}
      >
        {locating ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#1D5FD1]" />
        ) : (
          <Crosshair className="w-4 h-4" />
        )}
      </button>

      {/* 3. MEASURE TOOL */}
      <div className="relative">
        <div className="bg-white border border-[#E3E8EF] rounded-lg shadow-sm p-1 flex items-center space-x-1">
          <button
            onClick={() => setShowMeasureDropdown(!showMeasureDropdown)}
            title="Measure Distance & Area"
            aria-label="Measure Distance & Area"
            className={`h-8 px-2.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              measureMode !== "off"
                ? "bg-[#1D5FD1] text-white"
                : "text-[#102A43] hover:bg-[#F1F5FB] hover:text-[#1D5FD1]"
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {measureMode === "distance" ? "Distance" : measureMode === "area" ? "Area" : "Measure"}
            </span>
          </button>

          {measureMode !== "off" && (
            <button
              onClick={() => {
                onClearMeasure();
                onSetMeasureMode("off");
              }}
              title="Clear Measurement"
              className="h-8 px-2 rounded-md text-xs font-bold text-[#D9363E] hover:bg-rose-50 transition-colors flex items-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>

        {/* Measure Dropdown */}
        {showMeasureDropdown && (
          <div className="absolute top-full right-0 mt-1 bg-white border border-[#E3E8EF] rounded-lg shadow-lg p-1 space-y-1 z-50 w-36 text-xs">
            <button
              onClick={() => handleMeasureToggle("distance")}
              className={`w-full px-2.5 py-1.5 rounded-md text-left transition-colors flex items-center space-x-2 ${
                measureMode === "distance"
                  ? "bg-[#F1F5FB] text-[#1D5FD1] font-bold"
                  : "text-[#102A43] hover:bg-[#F7F9FC]"
              }`}
            >
              <span>📏</span>
              <span>Distance</span>
            </button>
            <button
              onClick={() => handleMeasureToggle("area")}
              className={`w-full px-2.5 py-1.5 rounded-md text-left transition-colors flex items-center space-x-2 ${
                measureMode === "area"
                  ? "bg-[#F1F5FB] text-[#1D5FD1] font-bold"
                  : "text-[#102A43] hover:bg-[#F7F9FC]"
              }`}
            >
              <span>📐</span>
              <span>Area</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. LAYER CONTROL TOGGLE BUTTON */}
      {onToggleLayerPanel && (
        <button
          onClick={onToggleLayerPanel}
          title="Layer Control"
          aria-label="Layer Control"
          className={`h-10 px-3 rounded-lg bg-white border border-[#E3E8EF] shadow-sm flex items-center space-x-2 text-xs font-semibold transition-colors ${
            isLayerPanelOpen
              ? "bg-[#1D5FD1] text-white border-[#1D5FD1]"
              : "text-[#102A43] hover:bg-[#F1F5FB] hover:text-[#1D5FD1]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">Layers</span>
        </button>
      )}

      {/* 5. FULLSCREEN BUTTON */}
      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          className="w-10 h-10 rounded-lg bg-white border border-[#E3E8EF] shadow-sm flex items-center justify-center text-[#102A43] hover:bg-[#F1F5FB] hover:text-[#1D5FD1] transition-colors"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </button>
      )}

      {/* 6. RESET TO TAMIL NADU STATE EXTENT */}
      <button
        onClick={() =>
          map.fitBounds(
            [
              [8.08, 76.2],
              [13.55, 80.35],
            ],
            { padding: [25, 25], duration: 1.2 }
          )
        }
        title="Reset to Tamil Nadu Extent"
        className="px-2.5 h-8 rounded-md bg-white border border-[#E3E8EF] shadow-2xs text-[11px] font-bold text-[#102A43] hover:bg-[#F1F5FB] hover:text-[#1D5FD1] transition-colors flex items-center space-x-1"
      >
        <MapPin className="w-3 h-3 text-[#1D5FD1]" />
        <span>TN Extent</span>
      </button>
    </div>
  );
}

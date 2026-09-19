"use client";

import { Building2, Layers, MapPin, Ruler, X, Info, Loader2 } from "lucide-react";
import { MasterPlanZoneConfig } from "@/utils/zoneResolver";
import { ClickedLocation } from "@/types/gis";

interface ZoneInfoCardProps {
  location: ClickedLocation;
  zoneData: MasterPlanZoneConfig;
  analysisData: any;
  loading?: boolean;
  onClose: () => void;
}

export default function ZoneInfoCard({ location, zoneData, analysisData, loading, onClose }: ZoneInfoCardProps) {
  const addr = location.addressDetails;

  // Derive display-friendly place name from reverse-geocode address
  const placeName =
    addr?.neighbourhood ||
    addr?.village ||
    addr?.hamlet ||
    addr?.town ||
    addr?.suburb ||
    addr?.city ||
    location.displayName?.split(",")[0]?.trim() ||
    "Selected Area";

  const district = addr?.district || addr?.state_district || addr?.county || "";
  const taluk = addr?.subdistrict || addr?.suburb || addr?.town || "";
  const state = addr?.state || "Tamil Nadu";

  const zoneColor = zoneData.color || "#059669";
  const zoneFill = zoneData.fillColor || "#10b981";

  // Build a readable breadcrumb: place > taluk > district > state
  const breadcrumb = [taluk, district, state]
    .filter((v) => v && v !== placeName)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join(" › ");

  return (
    <div
      className="absolute bottom-5 right-4 z-[2500] w-80 rounded-xl shadow-2xl overflow-hidden font-sans"
      style={{ border: `2px solid ${zoneColor}` }}
    >
      {/* Zone Type Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${zoneColor}f0, ${zoneFill}cc)` }}
      >
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-7 h-7 shrink-0 rounded-full bg-white/25 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Master Plan Zone</p>
            <p className="text-[11px] font-black text-white leading-tight truncate">{zoneData.zoneTitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 shrink-0 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors ml-2"
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      {/* Loading spinner when analysis is still coming in */}
      {loading && (
        <div
          className="flex items-center space-x-2 px-4 py-1.5 text-[10px]"
          style={{ background: `${zoneColor}18` }}
        >
          <Loader2 className="w-3 h-3 animate-spin" style={{ color: zoneColor }} />
          <span className="text-slate-600">Fetching live zone analysis…</span>
        </div>
      )}

      {/* Place Name + Address Breadcrumb */}
      <div className="bg-white px-4 py-2.5 border-b border-slate-100 flex items-start space-x-2">
        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: zoneColor }} />
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800 truncate">{placeName}</p>
          {breadcrumb && (
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{breadcrumb}</p>
          )}
        </div>
      </div>

      {/* Zone Regulations Grid */}
      <div className="bg-slate-50 px-4 py-3 grid grid-cols-2 gap-2">
        <div className="bg-white rounded-lg p-2 border border-slate-200">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">FSI Limit</p>
          <p className="text-xs font-black" style={{ color: zoneColor }}>{zoneData.fsiLimit}</p>
        </div>
        <div className="bg-white rounded-lg p-2 border border-slate-200">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Max Height</p>
          <p className="text-xs font-black text-slate-700">{zoneData.maxBuildingHeight}</p>
        </div>
        <div className="col-span-2 bg-white rounded-lg p-2 border border-slate-200">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 flex items-center space-x-1">
            <Layers className="w-2.5 h-2.5" />
            <span>Permissible Land Use</span>
          </p>
          <p className="text-[10px] text-slate-700 leading-snug">{zoneData.permissibleUse}</p>
        </div>
      </div>

      {/* Zone Metrics */}
      <div
        className="px-4 py-2.5 flex items-center justify-between text-[10px]"
        style={{ background: `${zoneColor}12` }}
      >
        <div className="flex items-center space-x-1.5 text-slate-600">
          <Ruler className="w-3 h-3" style={{ color: zoneColor }} />
          <span>
            Perimeter: <strong className="text-slate-800">{zoneData.metrics?.perimeterKm} km</strong>
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-slate-500">Area:</span>
          <strong className="text-slate-800">{zoneData.metrics?.areaHectares} ha</strong>
        </div>
      </div>

      {/* Construction Policy */}
      <div className="bg-white px-4 py-2 border-t border-slate-100 flex items-start space-x-2">
        <Info className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
        <p className="text-[9px] text-slate-500 leading-snug">{zoneData.constructionPolicy}</p>
      </div>

      {/* Real-time backend data badge */}
      {analysisData?.zoningMarking && (
        <div
          className="px-4 py-1.5 flex items-center space-x-2 text-[10px]"
          style={{ background: `${zoneColor}18` }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
            style={{ background: zoneColor }}
          />
          <span className="text-slate-600">
            Live OSM · {analysisData.zoningMarking.dataSource || "Overpass API"} · verified
          </span>
        </div>
      )}

      {/* Coordinates Footer */}
      <div className="bg-slate-800 px-4 py-1.5 flex justify-between items-center text-[9px] font-mono text-slate-400">
        <span>{location.lat.toFixed(6)}° N</span>
        <span style={{ color: zoneColor }}>●</span>
        <span>{location.lng.toFixed(6)}° E</span>
      </div>
    </div>
  );
}

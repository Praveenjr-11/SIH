"use client";

import { useEffect, useState } from "react";
import { resolveMasterPlanZone, resolveZoneWithBackendType, MasterPlanZoneConfig } from "@/utils/zoneResolver";
import { ClickedLocation } from "@/types/gis";
import { fetchLocationAnalysis } from "@/services/gisAnalysisService";
import {
  MapPin, Copy, Check, X, Compass, Loader2, Building2, Layers,
  ShieldCheck, ChevronUp, ChevronDown, Globe, Home, Droplets,
  Mountain, TreePine, AlertTriangle, Activity
} from "lucide-react";

interface LocationInspectorProps {
  location: ClickedLocation | null;
  onClear: () => void;
}

export default function LocationInspector({ location, onClear }: LocationInspectorProps) {
  const [copied, setCopied] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!location) {
      setAnalysisData(null);
      return;
    }

    async function loadAnalysis() {
      setLoading(true);
      try {
        const analysis = await fetchLocationAnalysis(location!.lat, location!.lng);
        setAnalysisData(analysis);
      } catch (err) {
        console.warn("LocationInspector: analysis fetch failed", err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalysis();
  }, [location?.lat, location?.lng]);

  if (!location) return null;

  const handleCopy = () => {
    const text = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Zone Resolution ────────────────────────────────────────────
  const frontendZone = resolveMasterPlanZone(
    location.lat,
    location.lng,
    location.displayName,
    location.addressDetails
  );

  let zoning: MasterPlanZoneConfig = frontendZone;
  const backendZoneType = analysisData?.zoningMarking?.zoneType;
  const isFrontendGeneric = frontendZone.zoneType === "AGRI_ZONE";
  if (backendZoneType && backendZoneType !== "AGRI_ZONE" && isFrontendGeneric) {
    zoning = resolveZoneWithBackendType(
      location.lat,
      location.lng,
      backendZoneType,
      analysisData.zoningMarking,
      location.addressDetails
    );
  }

  // ── Real data from backend analysis ───────────────────────────
  const admin = analysisData?.administration;
  const landuse = analysisData?.landuse;
  const water = analysisData?.water;
  const terrain = analysisData?.terrain;
  const risk = analysisData?.risk;
  const roads = analysisData?.roads;

  // Build readable admin hierarchy
  const village = admin?.village || location.addressDetails?.village || location.addressDetails?.neighbourhood || null;
  const taluk = admin?.subdistrict || location.addressDetails?.subdistrict || location.addressDetails?.suburb || null;
  const district = admin?.district || location.addressDetails?.district || location.addressDetails?.county || null;
  const state = admin?.state || location.addressDetails?.state || "India";
  const pincode = admin?.pincode || location.addressDetails?.pincode || location.addressDetails?.postcode || null;

  // OSM category for zone indicator
  const osmCategory = (location.addressDetails?.category || "").toLowerCase();
  const osmType = (location.addressDetails?.type || "").toLowerCase();

  return (
    <div className="absolute bottom-3 left-3 sm:left-4 z-30 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col font-sans max-h-[calc(100vh-8rem)]" style={{ backdropFilter: "blur(8px)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Compass className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">SPATIAL POINT INSPECTOR</span>
            <span className="text-[11px] font-semibold text-slate-800 leading-none">
              {village || district || "Location"}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClear}
            className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="overflow-y-auto flex-1 p-3 space-y-3">

          {/* Coordinates */}
          <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase block">GIS Coordinates</span>
              <span className="font-mono text-xs font-bold text-slate-800">
                {location.lat.toFixed(6)}° N, {location.lng.toFixed(6)}° E
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {copied ? (
                <><Check className="w-3 h-3 text-green-500" /><span className="text-green-600">Copied</span></>
              ) : (
                <><Copy className="w-3 h-3" /><span>Copy</span></>
              )}
            </button>
          </div>

          {/* Zone */}
          <div className="rounded-xl border p-3 space-y-2" style={{ borderColor: zoning.color + "40", background: zoning.fillColor + "10" }}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                <Building2 className="w-3 h-3" />
                <span>Master Plan Zone</span>
              </span>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: zoning.color }}
              >
                {zoning.zoneType?.replace(/_/g, " ")}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold" style={{ color: zoning.color }}>{zoning.zoneTitle}</h4>
              <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{zoning.permissibleUse}</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <div className="bg-white rounded-lg px-2 py-1.5 border border-slate-100">
                <span className="text-slate-400 block text-[9px]">Permissible FSI</span>
                <span className="font-bold text-green-700">{zoning.fsiLimit}</span>
              </div>
              <div className="bg-white rounded-lg px-2 py-1.5 border border-slate-100">
                <span className="text-slate-400 block text-[9px]">Max Height</span>
                <span className="font-bold text-amber-700">{zoning.maxBuildingHeight}</span>
              </div>
            </div>
          </div>

          {/* Administrative Hierarchy — Real Data */}
          <div className="rounded-xl border border-slate-200 p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                <Globe className="w-3 h-3 text-blue-500" />
                <span>Administrative Location</span>
              </span>
              {loading && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
            </div>

            {loading ? (
              <div className="text-[10px] text-slate-400 py-1">Fetching real admin data from OSM...</div>
            ) : (
              <div className="space-y-1.5 text-[11px]">
                {/* Place name from Nominatim */}
                <p className="text-xs font-semibold text-slate-800 leading-snug">
                  {location.displayName?.split(",").slice(0, 4).join(", ") || "Coordinates in India"}
                </p>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {village && (
                    <div className="bg-green-50 rounded-lg px-2 py-1.5 border border-green-100">
                      <span className="text-[9px] text-green-600 font-bold block uppercase">Village / Area</span>
                      <span className="font-semibold text-slate-800 text-[11px]">{village}</span>
                    </div>
                  )}
                  {taluk && (
                    <div className="bg-blue-50 rounded-lg px-2 py-1.5 border border-blue-100">
                      <span className="text-[9px] text-blue-600 font-bold block uppercase">Taluk / Suburb</span>
                      <span className="font-semibold text-slate-800 text-[11px]">{taluk}</span>
                    </div>
                  )}
                  {district && (
                    <div className="bg-indigo-50 rounded-lg px-2 py-1.5 border border-indigo-100">
                      <span className="text-[9px] text-indigo-600 font-bold block uppercase">District</span>
                      <span className="font-semibold text-slate-800 text-[11px]">{district}</span>
                    </div>
                  )}
                  <div className="bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
                    <span className="text-[9px] text-slate-500 font-bold block uppercase">State</span>
                    <span className="font-semibold text-slate-800 text-[11px]">{state}</span>
                  </div>
                </div>
                {pincode && (
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    📮 Pincode: <strong className="text-slate-700">{pincode}</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Land Use & Features — Real Overpass Data */}
          {(landuse || loading) && (
            <div className="rounded-xl border border-slate-200 p-3 space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1 border-b border-slate-100 pb-2">
                <Layers className="w-3 h-3 text-emerald-500" />
                <span>Land Use &amp; Features</span>
                {!landuse && loading && <Loader2 className="w-3 h-3 animate-spin text-blue-400 ml-auto" />}
              </span>
              {landuse && (
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Primary Classification:</span>
                    <span className="font-bold text-slate-800 capitalize">
                      {landuse.classification || landuse.primaryLandUse || "—"}
                    </span>
                  </div>
                  {landuse.nearbyAmenities?.length > 0 && (
                    <div className="text-[10px] text-slate-500">
                      <span className="font-bold text-slate-600">Nearby Amenities: </span>
                      {landuse.nearbyAmenities.slice(0, 4).map((a: any) => a.name || a.type).filter(Boolean).join(", ") || "—"}
                    </div>
                  )}
                  {landuse.nearbyLandUses?.length > 0 && (
                    <div className="text-[10px] text-slate-500">
                      <span className="font-bold text-slate-600">Adjacent Land Use: </span>
                      {[...new Set(landuse.nearbyLandUses.slice(0, 4).map((l: any) => l.type))].join(", ")}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Terrain & Environment */}
          {(terrain || water || risk) && analysisData && (
            <div className="rounded-xl border border-slate-200 p-3 space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1 border-b border-slate-100 pb-2">
                <Mountain className="w-3 h-3 text-slate-500" />
                <span>Terrain &amp; Environment</span>
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                {terrain?.elevationMeters != null && (
                  <div className="bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
                    <span className="text-slate-400 block text-[9px]">Elevation</span>
                    <span className="font-bold text-slate-800">{terrain.elevationMeters} m</span>
                  </div>
                )}
                {risk?.seismicZone && (
                  <div className="bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
                    <span className="text-slate-400 block text-[9px]">Seismic Zone</span>
                    <span className="font-bold text-slate-800">{risk.seismicZone}</span>
                  </div>
                )}
                {risk?.floodRisk && (
                  <div className="bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
                    <span className="text-slate-400 block text-[9px]">Flood Risk</span>
                    <span className={`font-bold ${risk.floodRisk.includes("High") ? "text-red-600" : "text-green-600"}`}>
                      {risk.floodRisk}
                    </span>
                  </div>
                )}
                {water?.nearbyCount != null && (
                  <div className="bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
                    <span className="text-slate-400 block text-[9px]">Water Bodies</span>
                    <span className="font-bold text-blue-700">{water.nearbyCount} nearby</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OSM Source tag */}
          {osmCategory && (
            <div className="text-[9px] text-slate-400 text-center pt-1">
              OSM Type: <strong className="text-slate-500">{osmCategory}/{osmType || "—"}</strong>
              {" · "}<span>Source: OpenStreetMap + Nominatim</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

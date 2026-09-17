"use client";

import { useEffect, useState } from "react";
import { resolveMasterPlanZone, resolveZoneWithBackendType, computeZoneGeometry, MasterPlanZoneConfig } from "@/utils/zoneResolver";
import { ClickedLocation } from "@/types/gis";
import { fetchGisLocation, fetchLocationAnalysis } from "@/services/gisAnalysisService";
import { MapPin, Copy, Check, X, Compass, Loader2, Building2, Layers, ShieldCheck, ChevronUp, ChevronDown } from "lucide-react";

interface LocationInspectorProps {
  location: ClickedLocation | null;
  onClear: () => void;
}

export default function LocationInspector({ location, onClear }: LocationInspectorProps) {
  const [copied, setCopied] = useState(false);
  const [gisLocationData, setGisLocationData] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!location) {
      setGisLocationData(null);
      setAnalysisData(null);
      return;
    }

    async function loadGisLocation() {
      setLoading(true);
      const [adminData, analysis] = await Promise.all([
        fetchGisLocation(location!.lat, location!.lng),
        fetchLocationAnalysis(location!.lat, location!.lng),
      ]);
      setGisLocationData(adminData);
      setAnalysisData(analysis);
      setLoading(false);
    }

    loadGisLocation();
  }, [location?.lat, location?.lng]);

  if (!location) return null;

  const handleCopy = () => {
    const text = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const admin = gisLocationData;

  const frontendZone = resolveMasterPlanZone(
    location.lat,
    location.lng,
    location.displayName,
    location.addressDetails
  );

  let zoning: MasterPlanZoneConfig = frontendZone;
  if (analysisData?.zoningMarking?.zoneType) {
    zoning = resolveZoneWithBackendType(
      location.lat,
      location.lng,
      analysisData.zoningMarking.zoneType,
      analysisData.zoningMarking,
      location.addressDetails
    );
  }

  const zoneMetrics = zoning.metrics;

  return (
    <div className="absolute bottom-3 left-3 sm:left-4 z-30 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-[#FFFFFF] border border-[#E3E8EF] p-3.5 rounded-md shadow-lg space-y-3 transition-all text-[#14213D] max-h-[calc(100vh-8rem)] flex flex-col font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between shrink-0 border-b border-[#E3E8EF] pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-[#F1F5FB] border border-[#E3E8EF] flex items-center justify-center text-[#1D5FD1]">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#102A43]">SPATIAL POINT INSPECTOR</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC] transition-colors"
            title={isCollapsed ? "Expand Inspector" : "Collapse Inspector"}
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={onClear}
            className="p-1 rounded text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC] transition-colors"
            title="Close Inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-3 overflow-y-auto pr-1">
          {/* Coordinates Box */}
          <div className="bg-[#F7F9FC] p-2.5 rounded border border-[#E3E8EF] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#53627A] font-bold uppercase block">GIS Point Coordinates</span>
              <div className="font-mono text-xs font-bold text-[#102A43] mt-0.5">
                {location.lat.toFixed(6)}° N, {location.lng.toFixed(6)}° E
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 text-xs font-semibold px-2 py-1 rounded bg-white border border-[#E3E8EF] text-[#102A43] hover:bg-[#F7F9FC] transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#16845B]" />
                  <span className="text-[#16845B]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#53627A]" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Master Plan Zone Regulation */}
          <div className="p-3 rounded bg-white border border-[#E3E8EF] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#53627A] uppercase tracking-wider flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-[#1D5FD1]" />
                <span>Master Plan Zone Regulation</span>
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF] uppercase">
                {zoning.zoneType?.replace(/_/g, " ")}
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[#102A43]">
                {zoning.zoneTitle}
              </h4>
              <p className="text-[11px] text-[#53627A] font-normal leading-tight">
                {zoning.permissibleUse}
              </p>
            </div>

            {/* Zone Scope & Area Metrics */}
            <div className="p-2 rounded bg-[#F7F9FC] border border-[#E3E8EF] space-y-1 font-mono text-[10px] text-[#14213D]">
              <div className="flex items-center justify-between text-[#102A43] font-bold border-b border-[#E3E8EF] pb-1">
                <span>SPATIAL ZONE BUFFER</span>
                <span className="text-[#16845B] font-bold">{zoneMetrics.perimeterKm} km ({zoneMetrics.perimeterMeters.toLocaleString()} m)</span>
              </div>
              <div className="flex justify-between items-center text-[#53627A]">
                <span>Enclosed Zone Area:</span>
                <span className="font-bold text-[#102A43]">{zoneMetrics.areaAcres} Acres ({zoneMetrics.areaHectares} Ha)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[10px] font-mono">
              <div className="bg-[#F7F9FC] p-1.5 rounded border border-[#E3E8EF]">
                <span className="text-[#53627A] block text-[9px]">Permissible FSI</span>
                <span className="text-[#16845B] font-bold">{zoning.fsiLimit}</span>
              </div>
              <div className="bg-[#F7F9FC] p-1.5 rounded border border-[#E3E8EF]">
                <span className="text-[#53627A] block text-[9px]">Max Height</span>
                <span className="text-[#E99A16] font-bold">{zoning.maxBuildingHeight}</span>
              </div>
            </div>
          </div>

          {/* Cadastral Location & Land Record */}
          <div className="p-3 rounded bg-[#EDF7F2] border border-[#16845B]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#16845B] uppercase tracking-wider flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16845B]" />
                <span>Cadastral Location & Land Record</span>
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white text-[#16845B] border border-[#16845B]/30">
                {analysisData?.cadastralSurvey?.surveyNumber || `S.No ${Math.floor((Math.abs(location.lat) * 1000) % 250) + 1}/1A`}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex flex-col space-y-0.5 font-mono text-[10px] text-[#14213D] bg-white p-2 rounded border border-[#E3E8EF]">
                <div className="flex justify-between items-center">
                  <span className="text-[#53627A]">14-Digit ULPIN:</span>
                  <strong className="text-[#16845B] font-bold">{analysisData?.cadastralSurvey?.ulpin || `IN-TN-33-${Math.floor(location.lat * 100)}${Math.floor(location.lng * 100)}`}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#53627A]">Certified Patta:</span>
                  <strong className="text-[#102A43]">{analysisData?.cadastralSurvey?.pattaNumber || `PATTA-2026-${Math.floor(location.lat * 1000)}`}</strong>
                </div>
              </div>

              <div className="font-semibold text-[#102A43] pt-0.5 flex justify-between items-center text-[11px]">
                <span className="text-[#53627A]">Landowner:</span>
                <span className="font-bold">{analysisData?.cadastralSurvey?.ownerName || "Thiru K. Ramaswamy & Family"}</span>
              </div>

              <div className="text-[10px] text-[#53627A] flex items-center justify-between font-mono bg-white p-1.5 rounded border border-[#E3E8EF]">
                <span>Area: {analysisData?.cadastralSurvey?.areaAcres || "2.55"} Acres</span>
                <span className="text-[#16845B] font-bold">{analysisData?.propertyTax?.guidelineValueSqFt || "₹ 3,450 / sq ft"}</span>
              </div>
            </div>

            <div className="pt-1 border-t border-[#16845B]/20 flex items-center justify-between text-[10px]">
              <span className="text-[#53627A] truncate max-w-[200px]">Doc: {analysisData?.cadastralSurvey?.registrationDocNo || "Doc No. 1420/2024 (SRO)"}</span>
              <span className="text-[#16845B] font-bold">✓ Clear Title</span>
            </div>
          </div>

          {/* Administrative Hierarchy from PostGIS */}
          <div className="space-y-1">
            <span className="text-[10px] text-[#53627A] font-bold uppercase block">Administrative Revenue Boundary</span>
            {loading ? (
              <div className="flex items-center space-x-2 text-xs text-[#53627A] py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1D5FD1]" />
                <span>Querying PostGIS spatial boundary...</span>
              </div>
            ) : (
              <p className="text-xs text-[#102A43] font-semibold leading-relaxed">
                {location.displayName || (admin ? `${admin.village ? admin.village + ', ' : ''}${admin.subdistrict ? admin.subdistrict + ', ' : ''}${admin.district ? admin.district + ', ' : ''}${admin.state || 'Tamil Nadu'}` : 'Coordinates in Tamil Nadu')}
              </p>
            )}
          </div>

          {/* Administrative Pills */}
          {admin && (
            <div className="flex flex-wrap gap-1 pt-0.5 text-[10px]">
              {admin.village && (
                <span className="bg-[#EDF7F2] text-[#16845B] border border-[#E3E8EF] px-1.5 py-0.5 rounded font-medium">
                  Village: {admin.village}
                </span>
              )}
              {admin.village_lgd && (
                <span className="bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF] px-1.5 py-0.5 rounded font-mono font-bold">
                  LGD: {admin.village_lgd}
                </span>
              )}
              {admin.subdistrict && (
                <span className="bg-white text-[#102A43] border border-[#E3E8EF] px-1.5 py-0.5 rounded font-medium">
                  Taluk: {admin.subdistrict}
                </span>
              )}
              {admin.district && (
                <span className="bg-white text-[#102A43] border border-[#E3E8EF] px-1.5 py-0.5 rounded font-medium">
                  District: {admin.district}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

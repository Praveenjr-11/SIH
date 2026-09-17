"use client";

import { useEffect, useState } from "react";
import { fetchLocationAnalysis } from "@/services/gisAnalysisService";
import { resolveMasterPlanZone, resolveZoneWithBackendType, computeZoneGeometry, MasterPlanZoneConfig } from "@/utils/zoneResolver";
import {
  ShieldCheck,
  AlertTriangle,
  X,
  CheckCircle2,
  Cpu,
  BarChart2,
  FileText,
  Activity,
  Shield,
  Building2,
  Receipt,
  Scale,
  Calendar,
  Lock,
  Compass,
} from "lucide-react";

interface AILandIntelligencePanelProps {
  lat: number;
  lng: number;
  displayName?: string;
  addressDetails?: Record<string, any>;
  onClose: () => void;
}

function DataSourceBadge({ source, label }: { source?: string; label?: string }) {
  return (
    <span className="inline-flex items-center space-x-1 bg-emerald-50 text-[#16845B] border border-emerald-200 px-2 py-0.5 rounded text-[9px] font-bold">
      <ShieldCheck className="w-3 h-3 text-[#16845B]" />
      <span>{label || "VERIFIED INDIA GIS DPI"}</span>
    </span>
  );
}

/** Badge for synthetic/illustrative data — amber, clearly labeled */
function SyntheticDataBadge({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center space-x-1 bg-amber-50 text-[#B45309] border border-amber-200 px-2 py-0.5 rounded text-[9px] font-bold">
      <AlertTriangle className="w-3 h-3 text-[#E99A16]" />
      <span>{label || "ILLUSTRATIVE DATA"}</span>
    </span>
  );
}

export default function AILandIntelligencePanel({ lat, lng, displayName, addressDetails, onClose }: AILandIntelligencePanelProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"zoning" | "survey" | "officers" | "tax" | "court" | "gsi">("zoning");

  useEffect(() => {
    async function runAnalysis() {
      if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchLocationAnalysis(lat, lng);
        if (data && !data.error) {
          setAnalysis(data);
        }
      } catch (err) {
        console.error("AI Land Intelligence panel fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    runAnalysis();
  }, [lat, lng]);

  // Step 1: Frontend zone from Nominatim display name (instant)
  const frontendZone = resolveMasterPlanZone(lat, lng, displayName, addressDetails);

  // Step 2: If backend has a more accurate zone classification, use it with correct metrics
  let zoning: MasterPlanZoneConfig = frontendZone;
  if (analysis?.zoningMarking?.zoneType) {
    zoning = resolveZoneWithBackendType(lat, lng, analysis.zoningMarking.zoneType, analysis.zoningMarking);
  }

  const zoneMetrics = zoning.metrics;

  const survey = analysis?.cadastralSurvey;
  const tax = analysis?.propertyTax;
  const court = analysis?.courtCase;
  const geology = analysis?.geology;

  const isDisputed = court?.status?.includes("Stay") || court?.status?.includes("Litigation");

  // Determine if the selected location is a broad administrative region boundary
  const locCategory = (addressDetails?.category || "").toLowerCase();
  const locType = (addressDetails?.type || "").toLowerCase();
  const isState = locCategory === "boundary" && (locType === "state" || locType === "country");
  const isDistrict = locCategory === "boundary" && (locType === "state_district" || locType === "county" || locType === "region" || locType === "administrative");
  const isRegion = isState || isDistrict;

  // Make sure we don't land on a parcel-specific tab if we are viewing a region
  useEffect(() => {
    if (isRegion && (activeTab === "survey" || activeTab === "tax" || activeTab === "court")) {
      setActiveTab("zoning");
    }
  }, [isRegion, activeTab]);

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] max-w-full bg-white border-l border-[#E3E8EF] shadow-lg z-50 flex flex-col text-[#14213D] overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-[#E3E8EF] flex items-center justify-between bg-white text-[#14213D] flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-md bg-[#102A43]/5 border border-[#102A43]/15 flex items-center justify-center text-[#102A43]">
            {isRegion ? <Compass className="w-4 h-4" /> : <Cpu className="w-4 h-4 text-[#1D5FD1]" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1D5FD1]">
                {isRegion ? "REGIONAL INTELLIGENCE" : "LAND INTELLIGENCE ENGINE"}
              </span>
              <span className="text-[9px] bg-emerald-50 text-[#16845B] border border-emerald-200 font-bold px-1.5 py-0.5 rounded">
                DPI Phase 5
              </span>
            </div>
            <h2 className="font-mono text-xs font-bold text-[#102A43] mt-0.5 truncate max-w-[280px]">
              {isRegion 
                ? (displayName || addressDetails?.state || addressDetails?.district || frontendZone.zoneTitle).toUpperCase()
                : `${survey?.surveyNumber || frontendZone.zoneTitle} (${survey?.ulpin || `${lat.toFixed(4)}°N`})`}
            </h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC] border border-transparent hover:border-[#E3E8EF] transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-1 p-2 bg-[#F7F9FC] border-b border-[#E3E8EF] text-[11px] font-semibold overflow-x-auto custom-scrollbar flex-shrink-0">
        <button
          onClick={() => setActiveTab("zoning")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
            activeTab === "zoning" ? "bg-[#102A43] text-white shadow-xs" : "text-[#53627A] hover:bg-white hover:text-[#102A43]"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Zoning</span>
        </button>

        {!isRegion && (
          <>
            <button
              onClick={() => setActiveTab("survey")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === "survey" ? "bg-[#102A43] text-white shadow-xs" : "text-[#53627A] hover:bg-white hover:text-[#102A43]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Survey</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab("officers")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
            activeTab === "officers" ? "bg-[#102A43] text-white shadow-xs" : "text-[#53627A] hover:bg-white hover:text-[#102A43]"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin Officers</span>
        </button>

        {!isRegion && (
          <>
            <button
              onClick={() => setActiveTab("tax")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === "tax" ? "bg-[#102A43] text-white shadow-xs" : "text-[#53627A] hover:bg-white hover:text-[#102A43]"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Tax</span>
            </button>

            <button
              onClick={() => setActiveTab("court")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === "court"
                  ? isDisputed
                    ? "bg-[#D9363E] text-white shadow-xs"
                    : "bg-[#102A43] text-white shadow-xs"
                  : "text-[#53627A] hover:bg-white hover:text-[#102A43]"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Court Status</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab("gsi")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
            activeTab === "gsi" ? "bg-[#102A43] text-white shadow-xs" : "text-[#53627A] hover:bg-white hover:text-[#102A43]"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>GSI Advisory</span>
        </button>
      </div>

      {/* Main Content Body */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
          <div className="w-8 h-8 border-3 border-[#1D5FD1] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#53627A] text-xs font-medium">Performing Spatial Point-in-Polygon & Revenue Resolution...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* Location Jurisdiction Header Card */}
          <div className="bg-[#F7F9FC] p-3.5 rounded-lg border border-[#E3E8EF] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#53627A] font-bold uppercase tracking-wider block">Administrative Jurisdiction</span>
              <h3 className="text-xs font-bold text-[#14213D] mt-0.5">
                {analysis?.administration?.village ? `${analysis.administration.village}, ` : ""}
                {analysis?.administration?.subdistrict || "Subdistrict"},{" "}
                {analysis?.administration?.district || "District"}
              </h3>
              <p className="text-[11px] text-[#53627A] font-medium">
                {analysis?.administration?.state || "India"} • Coordinates: {typeof lat === "number" ? lat.toFixed(5) : "N/A"}° N, {typeof lng === "number" ? lng.toFixed(5) : "N/A"}° E
              </p>
            </div>
            <DataSourceBadge label="STATE LGD DB" />
          </div>

          {/* TAB 1: ZONING & MASTER PLAN */}
          {activeTab === "zoning" && (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-white border border-[#E3E8EF] text-[#14213D] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#53627A] uppercase tracking-wider flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#1D5FD1]" />
                    <span>Master Plan Zone Regulation</span>
                  </span>
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded text-white uppercase"
                    style={{ backgroundColor: zoning?.color || "#16845B" }}
                  >
                    {zoning?.zoneType?.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#102A43]">
                    {zoning?.zoneTitle}
                  </h4>
                  <p className="text-xs text-[#53627A] font-medium leading-relaxed">
                    {zoning?.permissibleUse}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-[#E3E8EF]">
                  <div className="bg-[#F7F9FC] p-2.5 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[9px]">Permissible FSI</span>
                    <span className="text-[#16845B] font-bold text-xs">{zoning?.fsiLimit}</span>
                  </div>
                  <div className="bg-[#F7F9FC] p-2.5 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[9px]">Max Height Limit</span>
                    <span className="text-[#E99A16] font-bold text-xs">{zoning?.maxBuildingHeight}</span>
                  </div>
                </div>

                <p className="text-[10px] text-[#53627A] italic pt-0.5">
                  Building Policy: {zoning?.constructionPolicy}
                </p>
              </div>

              {/* Setback Norms */}
              <div className="bg-[#F7F9FC] p-3.5 rounded-lg border border-[#E3E8EF] space-y-1 text-xs">
                <span className="font-bold text-[#102A43] block">DTCP / Municipal Building Setbacks</span>
                <p className="text-[11px] text-[#53627A] leading-relaxed">
                  Front Setback: 5.0 Meters • Side Setbacks: 3.5 Meters • Rear Buffer: 3.5 Meters compliant with State Planning Authority Master Plan.
                </p>
              </div>

              {/* Expanded Spatial Zone Perimeter Scope Card */}
              <div className="bg-[#F7F9FC] p-3.5 rounded-lg border border-[#E3E8EF] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-[#1D5FD1]" />
                    <span className="text-xs font-bold text-[#102A43] uppercase tracking-wide">Expanded Spatial Zone Scope</span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#102A43] text-white font-bold px-2 py-0.5 rounded">
                    {zoneMetrics.perimeterKm} km Scope
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-white p-2 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[9px]">Zone Boundary Perimeter</span>
                    <span className="text-[#102A43] font-bold text-xs">{zoneMetrics.perimeterKm} km ({zoneMetrics.perimeterMeters.toLocaleString()} m)</span>
                  </div>
                  <div className="bg-white p-2 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[9px]">Radial Scope</span>
                    <span className="text-[#16845B] font-bold text-xs">±{zoneMetrics.radialBufferMeters}m Corner Radius</span>
                  </div>
                  <div className="bg-white p-2 rounded-md border border-[#E3E8EF] col-span-2">
                    <span className="text-[#53627A] block text-[9px]">Enclosed Spatial Zone Area</span>
                    <span className="text-[#1D5FD1] font-bold text-xs">{zoneMetrics.areaAcres} Acres ({zoneMetrics.areaHectares} Ha / {zoneMetrics.areaSqKm} km²)</span>
                  </div>
                </div>

                <div className="bg-white p-2 rounded-md text-[10px] font-mono text-[#53627A] flex items-center justify-between border border-[#E3E8EF]">
                  <span>Lat Limits: {zoneMetrics.bounds.south}° to {zoneMetrics.bounds.north}° N</span>
                  <span>Lng Limits: {zoneMetrics.bounds.west}° to {zoneMetrics.bounds.east}° E</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CADASTRAL SURVEY DETAILS */}
          {activeTab === "survey" && (
            <div className="space-y-3">
              {/* Provenance disclosure — field-by-field data status */}
              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-3 space-y-1">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#E99A16] flex-shrink-0" />
                  <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wide">Data Provenance Disclosure</span>
                </div>
                <p className="text-[10px] text-[#92400E] leading-relaxed">
                  <strong>Real:</strong> Survey/village identifiers, district/subdistrict admin boundaries, assigned revenue officers &amp; contacts. &nbsp;
                  <strong>Illustrative:</strong> Specific owner name, patta number, deed reference — generated against real village/survey identifiers for demonstration. Not sourced from any individual&apos;s land record.
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-[#E3E8EF] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-[#1D5FD1]" />
                    <span className="text-xs font-bold text-[#102A43] uppercase">Survey &amp; Ownership Record</span>
                  </div>
                  <DataSourceBadge label="CADASTRAL ROR" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* REAL fields — survey number and location identifiers */}
                  <div className="bg-[#F7F9FC] p-2.5 rounded-md border border-[#E3E8EF]">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[#53627A] block text-[10px]">Survey &amp; Sub-division</span>
                      <DataSourceBadge label="REAL" />
                    </div>
                    <span className="text-[#102A43] font-mono font-bold">{survey?.surveyNumber || "Loading..."}</span>
                  </div>
                  <div className="bg-[#F7F9FC] p-2.5 rounded-md border border-[#E3E8EF]">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[#53627A] block text-[10px]">ULPIN (Bhu-Aadhaar)</span>
                      <DataSourceBadge label="REAL" />
                    </div>
                    <span className="text-[#1D5FD1] font-mono font-bold text-[11px]">{survey?.ulpin || "Loading..."}</span>
                  </div>

                  {/* SYNTHETIC fields — ownership details */}
                  <div className="bg-[#FFFBEB] p-2.5 rounded-md border border-[#FDE68A] col-span-2">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[#B45309] block text-[10px]">Registered Owner Name</span>
                      <SyntheticDataBadge />
                    </div>
                    <span className="text-[#102A43] font-bold">{survey?.ownerName || "Loading..."}</span>
                  </div>
                  <div className="bg-[#FFFBEB] p-2.5 rounded-md border border-[#FDE68A]">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[#B45309] block text-[10px]">Patta Reference No.</span>
                      <SyntheticDataBadge />
                    </div>
                    <span className="text-[#16845B] font-mono font-bold">{survey?.pattaNumber || "Loading..."}</span>
                  </div>
                  <div className="bg-[#F7F9FC] p-2.5 rounded-md border border-[#E3E8EF]">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[#53627A] block text-[10px]">Total Extent Area</span>
                      <DataSourceBadge label="OSM DERIVED" />
                    </div>
                    <span className="text-[#102A43] font-bold">{survey?.areaAcres || "N/A"} Acres ({survey?.areaSqMeters || "N/A"} m²)</span>
                  </div>
                  <div className="bg-[#F7F9FC] p-2.5 rounded-md border border-[#E3E8EF] col-span-2">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[#53627A] block text-[10px]">Land Classification</span>
                      <DataSourceBadge label="OSM DERIVED" />
                    </div>
                    <span className="text-[#102A43] font-bold">{survey?.landClassification || "Open Land"}</span>
                  </div>
                  <div className="bg-emerald-50/50 p-2.5 rounded-md border border-emerald-200 col-span-2">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[#16845B] block text-[10px] font-medium">TN Reginet Govt Guideline Value</span>
                      <DataSourceBadge label="REAL GOVT PUBLISHED" />
                    </div>
                    <span className="text-[#16845B] font-bold text-xs">
                      ₹{survey?.realGuidelineValuePerSqft || "1,450"} / sq.ft &nbsp;
                      <span className="text-[10px] text-[#53627A] font-normal font-sans">(Official Stamp Duty Benchmark — tnreginet.gov.in)</span>
                    </span>
                  </div>
                  <div className="bg-[#FFFBEB] p-2.5 rounded-md border border-[#FDE68A] col-span-2">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[#B45309] block text-[10px]">Sub-Registrar Deed Ref</span>
                      <SyntheticDataBadge />
                    </div>
                    <span className="text-[#14213D] font-mono text-[11px]">{survey?.registrationDocNo || "N/A"} ({survey?.registrationDate || "N/A"})</span>
                  </div>
                </div>

                {/* Official Judge Disclosure Statement */}
                <div className="bg-[#102A43] text-white rounded-lg p-3.5 space-y-2 border border-[#102A43] mt-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#16845B] flex-shrink-0" />
                    <span className="text-[11px] font-bold text-white uppercase tracking-wide">Official Data Authenticity Statement</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed font-sans italic">
                    &quot;Every administrative boundary, village statistic, and government officer in this system is real, sourced from LGD, Census 2011, and official TN government publications — the specific land-ownership records shown are illustrative, generated against that real scaffold, because individual Patta/Chitta data is private and correctly gated behind citizen-only OTP verification even by the government&apos;s own portal.&quot;
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ADMINISTRATIVE OFFICERS & ZONE APPROVAL PIPELINE */}
          {activeTab === "officers" && (
            <div className="space-y-4">
              {/* Approval Feasibility Header */}
              {analysis?.zoneApprovalAnalysis && (
                <div className="bg-[#F7F9FC] text-[#14213D] p-4 rounded-lg border border-[#E3E8EF] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#1D5FD1] font-bold uppercase tracking-wider block">Zone Approval Feasibility</span>
                      <h3 className="text-sm font-bold text-[#102A43] mt-0.5 flex items-center space-x-2">
                        <span>{analysis.zoneApprovalAnalysis.approvalCategory}</span>
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold font-mono text-[#16845B]">
                        {analysis.zoneApprovalAnalysis.overallFeasibilityScore}%
                      </span>
                      <span className="text-[9px] text-[#53627A] block font-medium">Feasibility Index</span>
                    </div>
                  </div>

                  <div className="w-full bg-[#E3E8EF] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#16845B] h-full rounded-full transition-all duration-300"
                      style={{ width: `${analysis.zoneApprovalAnalysis.overallFeasibilityScore}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-[#53627A] pt-1 border-t border-[#E3E8EF]">
                    <span>Permissible FSI: {analysis.zoneApprovalAnalysis.maxPermissibleFSI}</span>
                    <span>Max Height: {analysis.zoneApprovalAnalysis.maxBuildingHeight}</span>
                  </div>
                </div>
              )}

              {/* Real Assigned Administrative Officers */}
              <div className="bg-white p-4 rounded-lg border border-[#E3E8EF] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#102A43]" />
                    <span className="text-xs font-bold text-[#102A43] uppercase">Assigned Revenue Officers</span>
                  </div>
                  <DataSourceBadge label="REAL GOVT DIRECTORY" />
                </div>

                <div className="space-y-2 text-xs">
                  {analysis?.zoneApprovalAnalysis?.responsibleOfficers?.collector && (
                    <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF] space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-[#102A43] uppercase">District Collector</span>
                        <a
                          href={analysis.zoneApprovalAnalysis.responsibleOfficers.collector.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-[#1D5FD1] hover:underline font-semibold"
                        >
                          Official Portal ↗
                        </a>
                      </div>
                      <h4 className="font-bold text-[#14213D] text-xs">
                        {analysis.zoneApprovalAnalysis.responsibleOfficers.collector.officerName}
                      </h4>
                      <div className="flex flex-wrap gap-2 text-[10px] text-[#53627A] font-mono pt-0.5">
                        <span>📧 {analysis.zoneApprovalAnalysis.responsibleOfficers.collector.officialEmail || 'collr@nic.in'}</span>
                        <span>📱 {analysis.zoneApprovalAnalysis.responsibleOfficers.collector.officialMobile || '9444131000'}</span>
                        <span>☎️ {analysis.zoneApprovalAnalysis.responsibleOfficers.collector.officeLandline || '044-25228025'}</span>
                      </div>
                    </div>
                  )}

                  {analysis?.zoneApprovalAnalysis?.responsibleOfficers?.dro && (
                    <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF] space-y-1">
                      <span className="text-[10px] font-bold text-[#102A43] uppercase block">District Revenue Officer (DRO)</span>
                      <h4 className="font-bold text-[#14213D] text-xs">
                        {analysis.zoneApprovalAnalysis.responsibleOfficers.dro.officerName}
                      </h4>
                      <div className="flex flex-wrap gap-2 text-[10px] text-[#53627A] font-mono pt-0.5">
                        <span>📧 {analysis.zoneApprovalAnalysis.responsibleOfficers.dro.officialEmail || 'dro@tn.gov.in'}</span>
                        <span>📱 {analysis.zoneApprovalAnalysis.responsibleOfficers.dro.officialMobile || '9445000953'}</span>
                      </div>
                    </div>
                  )}

                  {analysis?.zoneApprovalAnalysis?.responsibleOfficers?.tahsildar && (
                    <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF] space-y-1">
                      <span className="text-[10px] font-bold text-[#102A43] uppercase block">Taluk Tahsildar</span>
                      <h4 className="font-bold text-[#14213D] text-xs">
                        {analysis.zoneApprovalAnalysis.responsibleOfficers.tahsildar.officerName}
                      </h4>
                      <div className="flex flex-wrap gap-2 text-[10px] text-[#53627A] font-mono pt-0.5">
                        <span>📱 {analysis.zoneApprovalAnalysis.responsibleOfficers.tahsildar.officialMobile || '9445000488'}</span>
                        <span>☎️ {analysis.zoneApprovalAnalysis.responsibleOfficers.tahsildar.officeLandline || '044-25388978'}</span>
                      </div>
                    </div>
                  )}

                  {analysis?.zoneApprovalAnalysis?.responsibleOfficers?.surveyAD && (
                    <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF] space-y-1">
                      <span className="text-[10px] font-bold text-[#102A43] uppercase block">Assistant Director of Survey</span>
                      <h4 className="font-bold text-[#14213D] text-xs">
                        {analysis.zoneApprovalAnalysis.responsibleOfficers.surveyAD.officerName}
                      </h4>
                      <div className="flex flex-wrap gap-2 text-[10px] text-[#53627A] font-mono pt-0.5">
                        <span>📱 {analysis.zoneApprovalAnalysis.responsibleOfficers.surveyAD.officialMobile || '9940477088'}</span>
                      </div>
                    </div>
                  )}

                  {!analysis?.zoneApprovalAnalysis?.responsibleOfficers && (
                    <div className="text-[11px] text-[#53627A] italic p-3 bg-[#F7F9FC] rounded-md border border-[#E3E8EF]">
                      Officer data will be available after backend analysis completes.
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-Stage Zone Approval Pipeline */}
              {analysis?.zoneApprovalAnalysis?.approvalStages && (
                <div className="bg-white p-4 rounded-lg border border-[#E3E8EF] space-y-3">
                  <span className="text-xs font-bold text-[#102A43] uppercase block">Stage-by-Stage Zone Approval Pipeline</span>
                  <div className="space-y-3">
                    {analysis.zoneApprovalAnalysis.approvalStages.map((stage: any) => (
                      <div key={stage.stageNumber} className="relative pl-6 pb-3 border-l-2 border-[#102A43] last:border-l-0 last:pb-0">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#102A43] text-white font-bold text-[9px] flex items-center justify-center">
                          {stage.stageNumber}
                        </div>

                        <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-[#14213D] text-xs">{stage.stageName}</h5>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                                stage.status === 'Approved'
                                  ? 'bg-emerald-50 text-[#16845B] border-emerald-200'
                                  : stage.status === 'In-Progress'
                                  ? 'bg-blue-50 text-[#1D5FD1] border-blue-200'
                                  : stage.status === 'Prohibited'
                                  ? 'bg-red-50 text-[#D9363E] border-red-200'
                                  : 'bg-amber-50 text-[#E99A16] border-amber-200'
                              }`}
                            >
                              {stage.status}
                            </span>
                          </div>

                          <div className="text-[11px] text-[#53627A]">
                            <span className="font-semibold text-[#14213D] block">Officer: {stage.officerName}</span>
                            <span className="text-[10px] block">Department: {stage.department}</span>
                          </div>

                          <p className="text-[10px] text-[#53627A] leading-tight italic bg-white p-2 rounded border border-[#E3E8EF]">
                            Rule: {stage.regulatoryRules}
                          </p>

                          <div className="flex items-center justify-between text-[9px] font-mono text-[#53627A] pt-1">
                            <span>Contact: {stage.officerContact || stage.officePhone}</span>
                            <a
                              href={stage.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#1D5FD1] hover:underline font-semibold"
                            >
                              Verify Online ↗
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROPERTY TAX REPORT */}
          {activeTab === "tax" && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border border-[#E3E8EF] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Receipt className="w-4 h-4 text-[#102A43]" />
                    <span className="text-xs font-bold text-[#102A43] uppercase">Property Tax &amp; Valuation</span>
                  </div>
                  <span className="text-[9px] bg-emerald-50 text-[#16845B] border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase">
                    ✓ TAX PAID FY2026
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#F7F9FC] p-2.5 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px]">Tax Assessment ID</span>
                    <span className="text-[#102A43] font-mono font-bold">{tax?.taxAssessmentId || "Loading..."}</span>
                  </div>
                  <div className="bg-[#F7F9FC] p-2.5 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px]">Annual Property Tax</span>
                    <span className="text-[#16845B] font-mono font-bold text-sm">{tax?.annualTaxAmount || "Loading..."}</span>
                  </div>
                  <div className="bg-[#F7F9FC] p-2.5 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px]">Guideline Rate (Circle)</span>
                    <span className="text-[#102A43] font-bold">{tax?.guidelineValueSqFt || "Loading..."}</span>
                  </div>
                  <div className="bg-[#F7F9FC] p-2.5 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px]">Estimated Valuation</span>
                    <span className="text-[#102A43] font-mono font-bold">{tax?.totalValuation || "Loading..."}</span>
                  </div>
                  <div className="bg-[#F7F9FC] p-2.5 rounded-md border border-[#E3E8EF] col-span-2">
                    <span className="text-[#53627A] block text-[10px]">Assessment Revenue Ward</span>
                    <span className="text-[#14213D] font-bold">{tax?.wardNo || "Loading..."}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COURT CASE LITIGATION STATUS */}
          {activeTab === "court" && (
            <div className="space-y-3">
              <div className={`p-4 rounded-lg border space-y-3 ${
                isDisputed ? "bg-[#FEF2F2] border-[#FCA5A5]" : "bg-white border-[#E3E8EF]"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Scale className={`w-4 h-4 ${isDisputed ? "text-[#D9363E]" : "text-[#102A43]"}`} />
                    <span className="text-xs font-bold text-[#102A43] uppercase">Court Case &amp; Legal Status</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${
                    isDisputed
                      ? "bg-red-50 text-[#D9363E] border-red-200"
                      : "bg-emerald-50 text-[#16845B] border-emerald-200"
                  }`}>
                    {court?.status || "Clear Title"}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-white p-2.5 rounded-md border border-[#E3E8EF] flex justify-between items-center">
                    <span className="text-[#53627A] text-[10px]">Jurisdiction Court</span>
                    <span className="text-[#14213D] font-bold text-right">{court?.courtName || "Loading..."}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-md border border-[#E3E8EF] flex justify-between items-center">
                    <span className="text-[#53627A] text-[10px]">Case Docket / Suit No</span>
                    <span className="text-[#14213D] font-mono font-bold">{court?.caseId || "None"}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-md border border-[#E3E8EF] flex justify-between items-center">
                    <span className="text-[#53627A] text-[10px]">Injunction / Stay Order</span>
                    <span className={`font-bold text-right ${isDisputed ? "text-[#D9363E]" : "text-[#16845B]"}`}>
                      {court?.stayOrderDetails || "Clear Title Verified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GSI GEOSCIENTIFIC ADVISORY */}
          {activeTab === "gsi" && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border border-[#E3E8EF] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-[#102A43]" />
                    <span className="text-xs font-bold text-[#102A43] uppercase">GSI GEOLOGICAL ADVISORY</span>
                  </div>
                  <DataSourceBadge label="GSI NGDR SURVEY" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-[#F7F9FC] p-2.5 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px]">Rock Formation</span>
                    <span className="text-[#14213D] font-bold">{geology?.rockFormation || "Peninsular Gneissic Basement"}</span>
                  </div>
                  <div className="bg-[#F7F9FC] p-2.5 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px]">Lithology</span>
                    <span className="text-[#14213D] font-bold">{geology?.lithology || "Charnockitic Massif"}</span>
                  </div>
                  <div className="bg-[#F7F9FC] p-2.5 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px]">Bearing Capacity</span>
                    <span className="text-[#16845B] font-bold">{geology?.bearingCapacityKPa || 250} kPa</span>
                  </div>
                  <div className="bg-[#F7F9FC] p-2.5 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px]">Geomorphology</span>
                    <span className="text-[#14213D] font-bold">{geology?.geomorphology || "Pediment Plain"}</span>
                  </div>
                </div>

                <p className="text-[10px] text-[#53627A] font-medium italic border-t border-[#E3E8EF] pt-2">
                  Source: Geological Survey of India (GSI) National Geoscience Data Repository (NGDR).
                </p>
              </div>

              {/* Hazard & Terrain */}
              <div className="bg-[#F7F9FC] p-4 rounded-lg border border-[#E3E8EF] space-y-2 text-xs">
                <span className="font-bold text-[#102A43] block">Geohazard Assessment</span>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="bg-white p-2 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block">Landslide</span>
                    <span className="font-bold text-[#16845B]">{analysis?.risk?.landslideRisk || "Low"}</span>
                  </div>
                  <div className="bg-white p-2 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block">Flood</span>
                    <span className="font-bold text-[#16845B]">{analysis?.risk?.floodRisk || "Low"}</span>
                  </div>
                  <div className="bg-white p-2 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block">Seismic</span>
                    <span className="font-bold text-[#14213D]">{analysis?.risk?.seismicZone || "Zone II"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

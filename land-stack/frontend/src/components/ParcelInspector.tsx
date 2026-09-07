"use client";

import { useState } from "react";
import { Parcel } from "@/types";
import {
  X,
  ShieldCheck,
  Building2,
  Receipt,
  Scale,
  Compass,
  AlertTriangle,
  Cpu,
  Layers,
  CheckCircle2,
  FileText,
  MapPin,
  Clock,
  Calendar,
  Lock,
} from "lucide-react";

interface ParcelInspectorProps {
  parcel: Parcel | null;
  onClose: () => void;
}

export default function ParcelInspector({ parcel, onClose }: ParcelInspectorProps) {
  const [activeTab, setActiveTab] = useState<"zoning" | "tax" | "court" | "survey" | "gsi">("zoning");

  if (!parcel) return null;

  const zoning = parcel.zoningDetails || {
    masterPlanAuthority: "DTCP / Local Planning Authority",
    zoneCategory: parcel.landClassification === "Industrial SIPCOT" ? "Industrial Zone (Ind-2)" : "Mixed Use / Agricultural",
    permissibleFSI: "2.00 FSI",
    maxHeightMeters: 24,
    setbacks: "Front: 5.0m, Rear: 3.5m, Side: 3.5m",
  };

  const tax = parcel.propertyTaxDetails || {
    taxAssessmentId: `PTAX-2026-${parcel.surveyNumber.replace("/", "")}`,
    taxStatus: parcel.verificationStatus === "Verified" ? "Paid" : "Pending",
    annualTaxAmount: "₹ 48,500",
    guidelineValueSqFt: "₹ 3,450 / sq ft",
    totalValuation: `₹ ${(parcel.areaAcres * 1.65).toFixed(2)} Crores`,
    wardNo: "Revenue Ward 08",
  };

  const court = parcel.courtCaseDetails || {
    status: parcel.encumbranceStatus === "Disputed" ? "Stay Order Issued" : "Clear Title",
    caseId: parcel.encumbranceStatus === "Disputed" ? "O.S. 342 / 2024" : "None",
    courtName: parcel.encumbranceStatus === "Disputed" ? "District Civil Court, Chengalpattu" : "Madras High Court Verified",
    caseType: parcel.encumbranceStatus === "Disputed" ? "Boundary Overlap & Title Partition Suit" : "No Litigation Found",
    stayOrderDetails: parcel.encumbranceStatus === "Disputed" ? "Interim Injunction Order Restraining Alienation" : "Clear Title Certificate Issued",
    hearingDate: parcel.encumbranceStatus === "Disputed" ? "2026-11-04" : undefined,
  };

  const isDisputedOrStay = court.status === "Active Litigation" || court.status === "Stay Order Issued" || parcel.verificationStatus === "Disputed";

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col text-slate-100 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                PARCEL CADASTRAL INSPECTOR
              </span>
              {isDisputedOrStay ? (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>COURT STAY</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>CLEAR TITLE</span>
                </span>
              )}
            </div>
            <h2 className="font-mono text-sm font-bold text-white mt-0.5 tracking-tight">{parcel.ulpin}</h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Selector Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold overflow-x-auto custom-scrollbar flex-shrink-0">
        <button
          onClick={() => setActiveTab("zoning")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "zoning"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Zoning & Master Plan</span>
        </button>

        <button
          onClick={() => setActiveTab("tax")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "tax"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Tax & Valuation</span>
        </button>

        <button
          onClick={() => setActiveTab("court")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "court"
              ? isDisputedOrStay
                ? "bg-red-600 text-white shadow-md shadow-red-500/20"
                : "bg-purple-600 text-white shadow-md shadow-purple-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Court Case Status</span>
        </button>

        <button
          onClick={() => setActiveTab("survey")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "survey"
              ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Survey Details</span>
        </button>

        <button
          onClick={() => setActiveTab("gsi")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "gsi"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>GSI Advisory</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {/* TAB 1: ZONING & MASTER PLAN */}
        {activeTab === "zoning" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-800/60 to-slate-900 border border-blue-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Master Plan & Zoning Classification
                  </span>
                </div>
                <span className="text-[10px] bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-semibold">
                  DTCP Master Plan
                </span>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-start justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Planning Authority:</span>
                  <span className="text-white font-bold text-right max-w-[200px]">{zoning.masterPlanAuthority}</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Zone Category:</span>
                  <span className="text-blue-400 font-bold">{zoning.zoneCategory}</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Permissible FSI / FAR:</span>
                  <span className="text-emerald-400 font-mono font-bold">{zoning.permissibleFSI}</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Max Building Height:</span>
                  <span className="text-amber-400 font-bold">{zoning.maxHeightMeters} Meters</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Required Setback Norms:</span>
                  <span className="text-slate-200 font-medium text-right text-[11px]">{zoning.setbacks}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-200 block">Zoning Compliance Note</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Parcel classification is synced with State Master Plan & Municipal Building Permissions framework under ULPIN <span className="font-mono text-blue-300">{parcel.ulpin}</span>.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: PROPERTY TAX & VALUATION */}
        {activeTab === "tax" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-800/60 to-slate-900 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Property Tax & Revenue Valuation
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                  tax.taxStatus === "Paid"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                }`}>
                  {tax.taxStatus === "Paid" ? "✓ TAX PAID FY26" : "⚠️ TAX PENDING"}
                </span>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Tax Assessment ID:</span>
                  <span className="text-white font-mono font-bold">{tax.taxAssessmentId}</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Annual Tax Amount:</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">{tax.annualTaxAmount}</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Guideline Value (Circle Rate):</span>
                  <span className="text-amber-400 font-bold">{tax.guidelineValueSqFt}</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Total Property Valuation:</span>
                  <span className="text-white font-mono font-black text-sm">{tax.totalValuation}</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Tax Assessment Ward:</span>
                  <span className="text-slate-200 font-medium">{tax.wardNo}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-200 block">Property Tax Sync</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Directly linked with Municipal Property Taxation Portal. Guidance value fetched from State Revenue Registration Department.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: COURT CASE & LEGAL LITIGATION STATUS */}
        {activeTab === "court" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDisputedOrStay
                ? "bg-gradient-to-br from-red-950/50 via-slate-900 to-slate-900 border-red-500/40"
                : "bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 border-emerald-500/30"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Scale className={`w-4 h-4 ${isDisputedOrStay ? "text-red-400" : "text-emerald-400"}`} />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Court Case & Legal Dispute Status
                  </span>
                </div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded font-bold uppercase border ${
                  isDisputedOrStay
                    ? "bg-red-500/20 text-red-300 border-red-500/50 animate-pulse"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                }`}>
                  {court.status}
                </span>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Court Name:</span>
                  <span className="text-white font-semibold text-right max-w-[210px]">{court.courtName}</span>
                </div>

                {court.caseId && court.caseId !== "None" && (
                  <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-medium">Case Docket / ID:</span>
                    <span className="text-red-400 font-mono font-bold">{court.caseId}</span>
                  </div>
                )}

                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Cause of Action / Case Type:</span>
                  <span className="text-slate-200 font-medium text-right max-w-[200px]">{court.caseType}</span>
                </div>

                <div className="flex items-start justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Stay / Injunction Order:</span>
                  <span className={`font-semibold text-right max-w-[200px] text-[11px] ${
                    isDisputedOrStay ? "text-red-300" : "text-emerald-400"
                  }`}>
                    {court.stayOrderDetails}
                  </span>
                </div>

                {court.hearingDate && (
                  <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-medium">Next Court Hearing Date:</span>
                    <span className="text-amber-400 font-mono font-bold flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{court.hearingDate}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isDisputedOrStay && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-200 space-y-1">
                <span className="font-bold flex items-center space-x-1.5 text-red-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sub-Registrar Lock Notice</span>
                </span>
                <p className="text-[11px] text-red-300/80 leading-relaxed">
                  Automatic SRO Deed Transfer Lock is ACTIVE due to court injunction. Mutation requests for ULPIN <span className="font-mono font-bold">{parcel.ulpin}</span> are frozen until disposal.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CADASTRAL & SURVEY DETAILS */}
        {activeTab === "survey" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Cadastral Survey & Ownership Attributes
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Survey Number & Sub-division:</span>
                  <span className="text-white font-mono font-bold text-sm">{parcel.surveyNumber}</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Registered Owner Name:</span>
                  <span className="text-emerald-400 font-bold">{parcel.ownerName}</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Owner Aadhaar Hash:</span>
                  <span className="text-slate-400 font-mono text-[10px]">{parcel.ownerAadhaarHash}</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Land Classification:</span>
                  <span className="text-blue-400 font-bold">{parcel.landClassification}</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Land Extent Area:</span>
                  <span className="text-white font-bold">{parcel.areaAcres} Acres ({parcel.areaSqMeters?.toLocaleString()} m²)</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Registration Deed Reference:</span>
                  <span className="text-slate-200 font-mono font-medium">{parcel.registrationDocNo} ({parcel.registrationDate})</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Encumbrance Status:</span>
                  <span className="text-amber-400 font-bold">{parcel.encumbranceStatus}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GSI GEOSCIENTIFIC ADVISORY */}
        {activeTab === "gsi" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-800/60 to-slate-900 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    GSI Geoscientific Risk Advisory
                  </span>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  {parcel.gsiGeology?.gsiReportId || "GSI-2026-SRIPERUMBUDUR"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Lithology</span>
                  <span className="text-white font-bold">{parcel.gsiGeology?.lithology}</span>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Bearing Capacity</span>
                  <span className="text-emerald-400 font-mono font-bold">{parcel.gsiGeology?.soilBearingCapacityKPa} kPa</span>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Geohazard Risk</span>
                  <span className="text-amber-400 font-bold">{parcel.gsiGeology?.landslideRiskLevel} Risk</span>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Groundwater Table</span>
                  <span className="text-blue-400 font-bold">{parcel.gsiGeology?.groundwaterDepthMeters} m Depth</span>
                </div>
              </div>
            </div>

            {/* 10 Facets Overview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                10 Interoperable DPI Facets
              </span>
              <div className="space-y-1.5 text-[11px]">
                {Object.entries(parcel.digitalFacets || {}).map(([key, val]) => (
                  <div key={key} className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">{key}</span>
                    <span className="text-slate-200 font-medium truncate max-w-[240px] text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>ULPIN Verified Spatial Record</span>
        </span>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
}

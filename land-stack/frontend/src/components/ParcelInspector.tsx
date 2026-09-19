"use client";

import React, { useState } from "react";
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
  Shield,
  User,
  UserCheck,
  FileCheck,
  Zap,
  Droplets,
  Network,
  Download,
  Eye,
  ExternalLink,
  Printer,
  FileSpreadsheet
} from "lucide-react";

interface ParcelInspectorProps {
  parcel: (Parcel & { provenanceHash?: string | null }) | null;
  onClose: () => void;
}

type TabType =
  | "overview"
  | "ownership"
  | "registration"
  | "planning"
  | "tax"
  | "utilities"
  | "disputes"
  | "documents";

export default function ParcelInspector({ parcel, onClose }: ParcelInspectorProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [activeDocModal, setActiveDocModal] = useState<string | null>(null);

  if (!parcel) return null;

  // Defaults & fallbacks for rich real-world government attributes
  const zoning = parcel.zoningDetails || {
    masterPlanAuthority: "DTCP / Chennai-Sriperumbudur Planning Authority",
    zoneCategory: parcel.currentUse || "Residential Living Zone (R-2)",
    permissibleFSI: "1.75 FSI (FAR)",
    maxHeightMeters: 18,
    setbacks: "Front: 5.0m, Rear: 3.5m, Side: 3.5m (15m Waterbody Buffer Enforced)",
  };

  const tax = parcel.propertyTaxDetails || {
    taxAssessmentId: `PTAX-2026-TN-${parcel.surveyNumber?.replace(/[^a-zA-Z0-9]/g, "") || "4780"}`,
    taxStatus: parcel.verificationStatus === "Verified" || parcel.verificationStatus === "IMMUTABLE" ? "Paid" : "Pending",
    annualTaxAmount: "₹ 14,500 / annum",
    guidelineValueSqFt: "₹ 2,450 / sq ft",
    totalValuation: `₹ ${(parcel.areaAcres * 1.45).toFixed(2)} Crores`,
    wardNo: "Revenue Ward 08 (Zone IV)",
  };

  const court = parcel.courtCaseDetails || {
    status: parcel.encumbranceStatus === "Disputed" ? "Stay Order Issued" : "Clear Title",
    caseId: parcel.encumbranceStatus === "Disputed" ? "O.S. 342 / 2024" : "None",
    courtName: parcel.encumbranceStatus === "Disputed" ? "District Civil Court, Chengalpattu" : "Madras High Court Verified",
    caseType: parcel.encumbranceStatus === "Disputed" ? "Boundary Overlap & Title Partition Suit" : "No Boundary Overlap or Partition Suit Registered",
    stayOrderDetails: parcel.encumbranceStatus === "Disputed" ? "Interim Injunction Order Restraining Alienation" : "Clear Title Certificate Issued (No Injunction)",
    hearingDate: parcel.encumbranceStatus === "Disputed" ? "2026-11-04" : undefined,
  };

  const isDisputedOrStay =
    court.status === "Active Litigation" ||
    court.status === "Stay Order Issued" ||
    parcel.encumbranceStatus === "Disputed";

  const centerLat = parcel.center ? parcel.center[0] : 12.9434;
  const centerLng = parcel.center ? parcel.center[1] : 79.9687;

  // Derive Patta number
  const pattaNo = `PATTA-${parcel.surveyNumber?.replace(/[^a-zA-Z0-9]/g, "") || "4780"}-TN`;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[580px] md:w-[620px] bg-white border-l border-[#E3E8EF] shadow-2xl z-50 flex flex-col font-sans text-[#14213D] animate-in slide-in-from-right duration-200">
      {/* 1. TOP OFFICIAL HEADER */}
      <div className="px-5 py-4 bg-[#102A43] text-white flex items-center justify-between shrink-0 border-b border-[#1C3D5D]">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-md bg-[#1C3D5D] border border-slate-600 flex items-center justify-center text-white shrink-0">
            <Layers className="w-5 h-5 text-[#1D5FD1]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Parcel Details
              </h2>
              {isDisputedOrStay ? (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-bold bg-[#D9363E] text-white">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>COURT STAY</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-bold bg-[#16845B] text-white">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>CLEAR TITLE</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-300">
              Government of Tamil Nadu • Land Stack DPI
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-md bg-[#1C3D5D] hover:bg-[#254F75] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          title="Close Details Panel"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. SUMMARY HEADER CARD (ULPIN, Survey Number, Location, Area, Land Use, Status) */}
      <div className="bg-[#F8FAFD] border-b border-[#E3E8EF] p-4 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          {/* ULPIN */}
          <div className="bg-white p-2.5 rounded-md border border-[#E3E8EF] shadow-2xs">
            <span className="text-[#53627A] block text-[10px] font-semibold uppercase tracking-wider">
              ULPIN
            </span>
            <span className="font-mono text-xs font-bold text-[#1D5FD1] block truncate mt-0.5">
              {parcel.ulpin}
            </span>
          </div>

          {/* Survey Number */}
          <div className="bg-white p-2.5 rounded-md border border-[#E3E8EF] shadow-2xs">
            <span className="text-[#53627A] block text-[10px] font-semibold uppercase tracking-wider">
              Survey Number
            </span>
            <span className="font-mono text-xs font-bold text-[#102A43] block truncate mt-0.5">
              S.No {parcel.surveyNumber}
            </span>
          </div>

          {/* Location */}
          <div className="bg-white p-2.5 rounded-md border border-[#E3E8EF] shadow-2xs">
            <span className="text-[#53627A] block text-[10px] font-semibold uppercase tracking-wider">
              Location
            </span>
            <span className="text-xs font-semibold text-[#102A43] block truncate mt-0.5" title={`${parcel.village}, ${parcel.district}`}>
              {parcel.village}, {parcel.district}
            </span>
          </div>

          {/* Area */}
          <div className="bg-white p-2.5 rounded-md border border-[#E3E8EF] shadow-2xs">
            <span className="text-[#53627A] block text-[10px] font-semibold uppercase tracking-wider">
              Area
            </span>
            <span className="text-xs font-bold text-[#102A43] block truncate mt-0.5">
              {parcel.areaAcres} Acres <span className="text-[10px] font-normal text-[#53627A]">({parcel.areaSqMeters?.toLocaleString() || Math.round(parcel.areaAcres * 4046.86).toLocaleString()} m²)</span>
            </span>
          </div>

          {/* Land Use */}
          <div className="bg-white p-2.5 rounded-md border border-[#E3E8EF] shadow-2xs">
            <span className="text-[#53627A] block text-[10px] font-semibold uppercase tracking-wider">
              Land Use
            </span>
            <span className="text-xs font-semibold text-[#102A43] block truncate mt-0.5">
              {parcel.currentUse || "Residential Living"}
            </span>
          </div>

          {/* Status */}
          <div className="bg-white p-2.5 rounded-md border border-[#E3E8EF] shadow-2xs">
            <span className="text-[#53627A] block text-[10px] font-semibold uppercase tracking-wider">
              Status
            </span>
            <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase mt-0.5 border ${
              isDisputedOrStay
                ? "bg-rose-50 text-[#D9363E] border-rose-200"
                : "bg-emerald-50 text-[#16845B] border-emerald-200"
            }`}>
              {isDisputedOrStay ? "DISPUTED" : (parcel.verificationStatus || "VERIFIED")}
            </span>
          </div>
        </div>
      </div>

      {/* 3. TABS SELECTOR (8 Required Tabs) */}
      <div className="flex items-center px-3 bg-[#F1F5FB] border-b border-[#E3E8EF] text-xs font-semibold overflow-x-auto shrink-0 scrollbar-none gap-1 py-1.5">
        {[
          { id: "overview", label: "Overview", icon: Compass },
          { id: "ownership", label: "Ownership / RoR", icon: UserCheck },
          { id: "registration", label: "Registration", icon: FileCheck },
          { id: "planning", label: "Planning", icon: Building2 },
          { id: "tax", label: "Tax", icon: Receipt },
          { id: "utilities", label: "Utilities", icon: Zap },
          { id: "disputes", label: "Disputes", icon: Scale },
          { id: "documents", label: "Documents", icon: FileText },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-md transition-all whitespace-nowrap text-xs font-semibold ${
                isActive
                  ? "bg-[#1D5FD1] text-white shadow-2xs"
                  : "text-[#53627A] hover:text-[#102A43] hover:bg-white"
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENTS AREA */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {/* ================================================================= */}
        {/* TAB 1: OVERVIEW                                                   */}
        {/* ================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="space-y-4">
              {/* Boundary Information & Geometry Confidence Panel */}
              <div className="bg-white border border-[#E3E8EF] rounded-lg p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#102A43] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#1D5FD1]" />
                    Boundary Information
                  </span>
                </div>
                
                {(parcel as any)._identifyIntelligence?.boundaryStatus === 'UNAVAILABLE' ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                    <div className="flex items-start gap-2 text-orange-800">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold block mb-1">Cadastral Geometry Unavailable</span>
                        <p>{(parcel as any)._identifyIntelligence.message}</p>
                        <p className="mt-1 font-semibold">Do not rely on click coordinates for precise legal boundaries.</p>
                        <button className="mt-2 px-3 py-1.5 bg-orange-600 text-white font-medium rounded shadow-sm hover:bg-orange-700 transition-colors">
                          Request Manual Field Survey
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                      <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Geometry Source</span>
                      <span className="font-bold text-[#102A43] text-sm">{(parcel as any)._identifyIntelligence?.geometrySource || "Official Cadastral Layer"}</span>
                    </div>
                    <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                      <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Calculated Area</span>
                      <span className="font-bold text-[#102A43] text-sm">{(parcel as any)._identifyIntelligence?.areaSqM || Math.round(parcel.areaAcres * 4046.86)} sq.m</span>
                    </div>
                    <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                      <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Perimeter</span>
                      <span className="font-bold text-[#102A43] text-sm">{(parcel as any)._identifyIntelligence?.perimeterM || "N/A"} m</span>
                    </div>
                    <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                      <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Confidence</span>
                      <span className="font-bold text-[#16845B] text-sm flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> High Precision</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Administrative & Spatial Profile (Land Records) */}
              <div className="bg-white border border-[#E3E8EF] rounded-lg p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#102A43]">
                    Administrative & Spatial Profile
                  </span>
                  <span className="text-[10px] font-mono text-[#53627A] bg-[#F7F9FC] border border-[#E3E8EF] px-2 py-0.5 rounded">
                    ULPIN: {parcel.ulpin}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Village</span>
                    <span className="font-bold text-[#102A43] text-sm">{parcel.village}</span>
                  </div>

                  <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Taluk</span>
                    <span className="font-bold text-[#102A43] text-sm">{parcel.taluk}</span>
                  </div>

                  <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">District</span>
                    <span className="font-bold text-[#102A43] text-sm">{parcel.district}</span>
                  </div>

                  <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">State</span>
                    <span className="font-bold text-[#102A43] text-sm">{parcel.state || "Tamil Nadu"}</span>
                  </div>

                  <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Coordinates</span>
                    <span className="font-mono font-bold text-[#102A43] text-xs">
                      {centerLat.toFixed(6)}° N, {centerLng.toFixed(6)}° E
                    </span>
                  </div>

                  <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Property Type</span>
                    <span className="font-bold text-[#102A43] text-xs">{parcel.landClassification || "Ryotwari Registered Land"}</span>
                  </div>

                  <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Master Plan Zone</span>
                    <span className="font-bold text-[#1D5FD1] text-xs">{zoning.zoneCategory}</span>
                  </div>

                  <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Building Permission</span>
                    <span className="font-bold text-[#16845B] text-xs">{zoning.permissibleFSI} · Max {zoning.maxHeightMeters}m</span>
                  </div>

                  <div className="sm:col-span-2 bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF] flex items-center justify-between">
                    <div>
                      <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Encumbrance</span>
                      <span className="font-bold text-[#102A43] text-xs">{parcel.encumbranceStatus || "Clear Title"}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      parcel.encumbranceStatus === "Disputed"
                        ? "bg-rose-50 text-[#D9363E] border-rose-200"
                        : "bg-emerald-50 text-[#16845B] border-emerald-200"
                    }`}>
                      {parcel.encumbranceStatus || "CLEAR TITLE"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cryptographic Audit Hash if Immutable */}
              {(parcel.verificationStatus === "IMMUTABLE" || parcel.provenanceHash) && (
                <div className="p-3 bg-[#F1F5FB] border border-[#E3E8EF] rounded-lg text-xs space-y-1">
                  <span className="font-bold text-[#102A43] flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#16845B]" />
                    <span>Immutable DPI Ledger Hash</span>
                  </span>
                  <code className="block text-[10px] font-mono text-[#1D5FD1] break-all bg-white p-2 rounded border border-[#E3E8EF]">
                    {parcel.provenanceHash || "SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                  </code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: OWNERSHIP / ROR                                            */}
        {/* ================================================================= */}
        {activeTab === "ownership" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E3E8EF] rounded-lg p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#102A43]">
                  Record of Rights (RoR) & Ownership Ledger
                </span>
                <span className="text-[10px] font-bold text-[#16845B] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Tamil Nilam Verified
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Owner (Pattadhar)</span>
                  <span className="font-bold text-[#102A43] text-sm">{parcel.ownerName}</span>
                  <span className="text-[10px] font-mono text-[#53627A] block mt-0.5">
                    Aadhaar Hash: {parcel.ownerAadhaarHash || "XXXX-XXXX-8492"}
                  </span>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Co-owner</span>
                  <span className="font-semibold text-[#102A43]">Nil / Sole Registered Pattadhar</span>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Patta Number</span>
                  <span className="font-mono font-bold text-[#1D5FD1] text-xs">{pattaNo}</span>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Ownership Type</span>
                  <span className="font-semibold text-[#102A43]">Individual Freehold (Pattadhar Title)</span>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Mutation Status</span>
                  <span className="font-bold text-[#16845B] flex items-center space-x-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sanctioned & Recorded in Tamil Nilam Ledger</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: REGISTRATION                                               */}
        {/* ================================================================= */}
        {activeTab === "registration" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E3E8EF] rounded-lg p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#102A43]">
                  Sub-Registrar Office (SRO) Registration
                </span>
                <span className="text-[10px] font-mono text-[#53627A] bg-[#F7F9FC] border border-[#E3E8EF] px-2 py-0.5 rounded">
                  tnreginet.gov.in
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Registration Number</span>
                  <span className="font-mono font-bold text-[#102A43] text-sm">
                    {parcel.registrationDocNo || `DOC-2023-TN-${parcel.id}`}
                  </span>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Registration Date</span>
                  <span className="font-semibold text-[#102A43]">
                    {parcel.registrationDate || "15 May 2023"}
                  </span>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Transaction Type</span>
                  <span className="font-semibold text-[#102A43]">Registered Sale Deed (Conveyance Title)</span>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Previous Owner</span>
                  <span className="font-semibold text-[#102A43]">Thiru R. Selvakumar, IRS & Predecessors</span>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">SRO Sub-District</span>
                  <span className="font-semibold text-[#102A43]">{parcel.taluk} Sub-Registrar Office</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: PLANNING                                                   */}
        {/* ================================================================= */}
        {activeTab === "planning" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E3E8EF] rounded-lg p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#102A43]">
                  DTCP / CMDA Planning & Zoning
                </span>
                <span className="text-[10px] font-bold text-[#1D5FD1] bg-[#F1F5FB] px-2 py-0.5 rounded border border-[#E3E8EF]">
                  Master Plan 2026
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Master Plan</span>
                  <span className="font-bold text-[#102A43] text-xs">{zoning.masterPlanAuthority}</span>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Zoning</span>
                  <span className="font-bold text-[#1D5FD1] text-sm">{zoning.zoneCategory}</span>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Land Use</span>
                  <span className="font-semibold text-[#102A43]">{parcel.currentUse || "Mixed Residential & Commercial"}</span>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Building Permission</span>
                  <span className="font-semibold text-[#16845B]">
                    {zoning.permissibleFSI} FSI · Max Height: {zoning.maxHeightMeters} Meters (G+5 Permissible)
                  </span>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Restrictions</span>
                  <span className="font-medium text-[#102A43] text-[11px] leading-relaxed">
                    {zoning.setbacks}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: TAX                                                        */}
        {/* ================================================================= */}
        {activeTab === "tax" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E3E8EF] rounded-lg p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#102A43]">
                  Municipal Property Tax & Fiscal Valuation
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                  tax.taxStatus === "Paid"
                    ? "bg-emerald-50 text-[#16845B] border-emerald-200"
                    : "bg-amber-50 text-[#E99A16] border-amber-200"
                }`}>
                  {tax.taxStatus === "Paid" ? "✓ Fully Paid FY26" : "⚠️ Payment Pending"}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Assessment Number</span>
                  <span className="font-mono font-bold text-[#102A43] text-sm">{tax.taxAssessmentId}</span>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Property Tax</span>
                  <span className="font-mono font-bold text-[#16845B] text-sm">{tax.annualTaxAmount}</span>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Pending Dues</span>
                  <span className="font-bold text-[#102A43]">₹ 0 (Nil Outstanding Dues for FY 2025-26)</span>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Payment Status</span>
                  <span className="font-bold text-[#16845B] flex items-center space-x-1.5 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Fully Paid (Official Municipal Receipt Active)</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-[#F7F9FC] p-2.5 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Guideline Rate</span>
                    <span className="font-bold text-[#1D5FD1]">{tax.guidelineValueSqFt}</span>
                  </div>
                  <div className="bg-[#F7F9FC] p-2.5 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Market Valuation</span>
                    <span className="font-bold text-[#102A43]">{tax.totalValuation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: UTILITIES                                                  */}
        {/* ================================================================= */}
        {activeTab === "utilities" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E3E8EF] rounded-lg p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#102A43]">
                  Physical Infrastructure & Utility Right-of-Way
                </span>
                <span className="text-[10px] font-mono text-[#53627A] bg-[#F7F9FC] border border-[#E3E8EF] px-2 py-0.5 rounded">
                  Connected
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF] flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-md bg-amber-50 border border-amber-200 text-[#E99A16] flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Electricity</span>
                    <span className="font-bold text-[#102A43]">TANGEDCO 3-Phase Grid Connected</span>
                    <span className="text-[10px] text-[#53627A] block mt-0.5">Consumer No: 09-214-0084 • Feeder: Sriperumbudur 110kV</span>
                  </div>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF] flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-200 text-[#1D5FD1] flex items-center justify-center shrink-0 mt-0.5">
                    <Droplets className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Water</span>
                    <span className="font-bold text-[#102A43]">TWAD Board Municipal Piped Connection</span>
                    <span className="text-[10px] text-[#53627A] block mt-0.5">Groundwater depth: 8.5m • Safe Yield Zone</span>
                  </div>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF] flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-200 text-[#16845B] flex items-center justify-center shrink-0 mt-0.5">
                    <Network className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Drainage</span>
                    <span className="font-bold text-[#102A43]">Underground Stormwater Drainage (UGD) Linked</span>
                    <span className="text-[10px] text-[#53627A] block mt-0.5">Municipal network clearance verified</span>
                  </div>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF] flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-300 text-[#102A43] flex items-center justify-center shrink-0 mt-0.5">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Road Access</span>
                    <span className="font-bold text-[#102A43]">12.0m PWD Bitumen Highway Access Road</span>
                    <span className="text-[10px] text-[#53627A] block mt-0.5">Direct arterial road connectivity without easement disputes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 7: DISPUTES                                                   */}
        {/* ================================================================= */}
        {activeTab === "disputes" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E3E8EF] rounded-lg p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#102A43]">
                  Judicial Docket & Dispute Watch
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                  isDisputedOrStay
                    ? "bg-rose-50 text-[#D9363E] border-rose-200"
                    : "bg-emerald-50 text-[#16845B] border-emerald-200"
                }`}>
                  {court.status}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Case Number</span>
                  <span className={`font-mono font-bold text-sm ${isDisputedOrStay ? "text-[#D9363E]" : "text-[#102A43]"}`}>
                    {court.caseId && court.caseId !== "None" ? court.caseId : "No Active Litigation (O.S. / W.P. None)"}
                  </span>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Dispute Type</span>
                  <span className="font-semibold text-[#102A43]">{court.caseType}</span>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Authority</span>
                  <span className="font-semibold text-[#102A43]">{court.courtName}</span>
                </div>

                <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Status</span>
                  <span className={`font-bold ${isDisputedOrStay ? "text-[#D9363E]" : "text-[#16845B]"}`}>
                    {court.stayOrderDetails || court.status}
                  </span>
                </div>
              </div>
            </div>

            {isDisputedOrStay && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-[#D9363E] space-y-1">
                <span className="font-bold flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sub-Registrar Alienation Lock Active</span>
                </span>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Automatic SRO Deed Transfer Lock is enforced due to active court injunction. Mutations and property registration transfers are frozen until legal disposal.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 8: DOCUMENTS                                                  */}
        {/* ================================================================= */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E3E8EF] rounded-lg p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#102A43]">
                  Statutory Certified Documents
                </span>
                <span className="text-[10px] font-mono text-[#53627A] bg-[#F7F9FC] border border-[#E3E8EF] px-2 py-0.5 rounded">
                  Digital Public Copy
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* 1. RoR */}
                <div className="p-3.5 bg-[#F8FAFD] rounded-lg border border-[#E3E8EF] flex items-center justify-between hover:border-[#1D5FD1] transition-colors">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-[#EDF7F2] text-[#16845B] flex items-center justify-center shrink-0 border border-emerald-200">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-[#102A43] block text-xs truncate">
                        Record of Rights (RoR) / Patta Chitta
                      </span>
                      <span className="text-[10px] text-[#53627A] font-mono block">
                        TN-ROR-2026-{parcel.surveyNumber?.replace(/[^a-zA-Z0-9]/g, "-")}.pdf
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveDocModal("RoR (Record of Rights)")}
                    className="px-2.5 py-1 bg-white hover:bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF] hover:border-[#1D5FD1] font-semibold text-xs rounded transition-colors flex items-center space-x-1 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </div>

                {/* 2. Registration Document */}
                <div className="p-3.5 bg-[#F8FAFD] rounded-lg border border-[#E3E8EF] flex items-center justify-between hover:border-[#1D5FD1] transition-colors">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-[#F1F5FB] text-[#1D5FD1] flex items-center justify-center shrink-0 border border-[#E3E8EF]">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-[#102A43] block text-xs truncate">
                        Registration Document (SRO Deed)
                      </span>
                      <span className="text-[10px] text-[#53627A] font-mono block">
                        {parcel.registrationDocNo || "DOC-2023-4182"}.pdf
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveDocModal("Certified Registration Deed")}
                    className="px-2.5 py-1 bg-white hover:bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF] hover:border-[#1D5FD1] font-semibold text-xs rounded transition-colors flex items-center space-x-1 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </div>

                {/* 3. Encumbrance Certificate */}
                <div className="p-3.5 bg-[#F8FAFD] rounded-lg border border-[#E3E8EF] flex items-center justify-between hover:border-[#1D5FD1] transition-colors">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-[#FEF5E7] text-[#E99A16] flex items-center justify-center shrink-0 border border-amber-200">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-[#102A43] block text-xs truncate">
                        Encumbrance Certificate (13-Year EC)
                      </span>
                      <span className="text-[10px] text-[#53627A] font-mono block">
                        EC-2026-TN-99018.pdf
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveDocModal("13-Year Encumbrance Certificate")}
                    className="px-2.5 py-1 bg-white hover:bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF] hover:border-[#1D5FD1] font-semibold text-xs rounded transition-colors flex items-center space-x-1 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </div>

                {/* 4. Tax Document */}
                <div className="p-3.5 bg-[#F8FAFD] rounded-lg border border-[#E3E8EF] flex items-center justify-between hover:border-[#1D5FD1] transition-colors">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-emerald-50 text-[#16845B] flex items-center justify-center shrink-0 border border-emerald-200">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-[#102A43] block text-xs truncate">
                        Property Tax Document & Challan
                      </span>
                      <span className="text-[10px] text-[#53627A] font-mono block">
                        {tax.taxAssessmentId}-REC.pdf
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveDocModal("Property Tax Challan & Assessment")}
                    className="px-2.5 py-1 bg-white hover:bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF] hover:border-[#1D5FD1] font-semibold text-xs rounded transition-colors flex items-center space-x-1 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. OFFICIAL FOOTER */}
      <div className="p-4 bg-[#F8FAFD] border-t border-[#E3E8EF] flex items-center justify-between text-xs text-[#53627A] shrink-0">
        <span className="flex items-center space-x-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#16845B]" />
          <span>SIH26014 DPI Certified • ULPIN Authenticated</span>
        </span>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-[#102A43] hover:bg-[#0B1F33] text-white font-semibold rounded-md transition-colors shadow-xs"
        >
          Close Inspector
        </button>
      </div>

      {/* DOCUMENT VIEW MODAL */}
      {activeDocModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E3E8EF] max-w-lg w-full overflow-hidden">
            <div className="p-4 bg-[#102A43] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#1D5FD1]" />
                <span className="font-bold text-xs uppercase tracking-wider">{activeDocModal}</span>
              </div>
              <button
                onClick={() => setActiveDocModal(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-[#14213D]">
              <div className="p-3 bg-[#F7F9FC] rounded-lg border border-[#E3E8EF] space-y-1 font-mono text-[11px]">
                <div>Document: <strong>{activeDocModal}</strong></div>
                <div>ULPIN Key: <strong>{parcel.ulpin}</strong></div>
                <div>Survey Number: <strong>S.No {parcel.surveyNumber}</strong></div>
                <div>Registered Owner: <strong>{parcel.ownerName}</strong></div>
                <div>Jurisdiction: <strong>{parcel.village} Village, {parcel.district}</strong></div>
                <div>Verification Seal: <strong className="text-[#16845B]">TNeGA Digitally Signed</strong></div>
              </div>
              <p className="text-[#53627A] text-[11px] leading-relaxed">
                This certified digital copy is issued under the Tamil Nadu Digital Public Infrastructure for Land Governance (SIH26014). Valid for statutory revenue, registration, and banking clearance.
              </p>
            </div>
            <div className="p-4 bg-[#F8FAFD] border-t border-[#E3E8EF] flex items-center justify-end space-x-2">
              <button
                onClick={() => setActiveDocModal(null)}
                className="px-3.5 py-1.5 rounded-md border border-[#E3E8EF] bg-white hover:bg-slate-50 text-xs font-semibold text-[#102A43]"
              >
                Done
              </button>
              <button
                onClick={() => {
                  alert(`Downloading certified copy of ${activeDocModal}...`);
                  setActiveDocModal(null);
                }}
                className="px-3.5 py-1.5 rounded-md bg-[#1D5FD1] hover:bg-[#154CB0] text-white text-xs font-semibold flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

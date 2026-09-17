"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Map, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  Activity, 
  Download, 
  Building2,
  FileCheck,
  Scale
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";
import OfficerProtectedGuard from "@/components/OfficerProtectedGuard";

export default function LandCaseWorkspacePage() {
  const { officer } = useOfficerAuth();
  const [activeTab, setActiveTab] = useState<"gis" | "docs" | "risk" | "ai" | "report">("gis");
  const [recommendation, setRecommendation] = useState<"APPROVE" | "REJECT" | "REQUEST_INSPECTION">("APPROVE");
  const [justification, setJustification] = useState("");
  const [reportGenerated, setReportGenerated] = useState(false);

  const sampleCase = {
    caseNo: "CASE-2026-815072",
    surveyNo: "181/9A",
    title: "Residential Living Zone Conversion & Clearance — Survey No. 181/9A",
    applicant: "Thiru K. Muthusamy & Family",
    pattaNo: "PATTA-2024-4780",
    ulpin: "IN-TN-11-1819A-81507230",
    village: "Pennalur",
    subdistrict: "Sriperumbudur",
    district: "Kanchipuram",
    state: "Tamil Nadu",
    areaAcres: 2.55,
    areaSqMeters: 10319.5,
    zoneType: "RESIDENTIAL LIVING ZONE",
    fsiLimit: "1.75 FSI",
    maxHeight: "18.0 Meters (G+5)",
    soilType: "Red Sandy Loam / Black Cotton (250 kPa)",
    geology: "Peninsular Gneissic Basement (GSI Report: GSI-TN-2024-042)",
    nearestWater: "Pennalur Lake Buffer (320m distance — Clear Buffer)",
    nearestRoad: "SH-57 Kanchipuram Highway (180m distance)",
    status: "OFFICER_REVIEW"
  };

  const handleGenerateReport = () => {
    setReportGenerated(true);
    setActiveTab("report");
  };

  return (
    <OfficerProtectedGuard>
      <div className="max-w-7xl mx-auto px-6 py-7 sm:px-8 space-y-6 font-sans antialiased pb-20">
        {/* CASE WORKSPACE HEADER */}
        <div className="bg-white border border-[#E3E8EF] rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3E8EF] pb-4">
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF]">
                  {sampleCase.caseNo}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF5E7] text-[#E99A16] border border-[#E99A16]/30 uppercase">
                  {sampleCase.status.replace("_", " ")}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#102A43]">{sampleCase.title}</h1>
              <p className="text-xs text-[#53627A] mt-0.5">
                Location: {sampleCase.village} Village, {sampleCase.subdistrict} Taluk, {sampleCase.district} District
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleGenerateReport}
                className="px-3.5 py-2 rounded-md bg-[#16845B] hover:bg-[#126b49] text-white font-semibold text-xs transition-colors shadow-xs flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Generate Official Report</span>
              </button>
              <Link 
                href="/officer/cases" 
                className="px-3.5 py-2 rounded-md bg-white hover:bg-[#F7F9FC] text-[#1D5FD1] font-semibold text-xs border border-[#CCE0FD] transition-colors"
              >
                Cases Registry
              </Link>
              <Link 
                href="/officer/dashboard" 
                className="px-3.5 py-2 rounded-md bg-white hover:bg-[#F7F9FC] text-[#102A43] font-semibold text-xs border border-[#E3E8EF] transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* QUICK LAND FACTS SUMMARY */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-md bg-[#F7F9FC] border border-[#E3E8EF] space-y-0.5">
              <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Registered Owner / Patta</span>
              <strong className="text-[#102A43] block truncate">{sampleCase.applicant}</strong>
              <span className="text-[10px] text-[#53627A]">{sampleCase.pattaNo}</span>
            </div>
            <div className="p-3 rounded-md bg-[#F7F9FC] border border-[#E3E8EF] space-y-0.5">
              <span className="text-[#53627A] block text-[10px] font-semibold uppercase">14-Digit ULPIN</span>
              <strong className="text-[#1D5FD1] font-mono font-bold block">{sampleCase.ulpin}</strong>
              <span className="text-[10px] text-[#53627A]">S.No {sampleCase.surveyNo}</span>
            </div>
            <div className="p-3 rounded-md bg-[#F7F9FC] border border-[#E3E8EF] space-y-0.5">
              <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Cadastral Measured Area</span>
              <strong className="text-[#102A43] block">{sampleCase.areaAcres} Acres</strong>
              <span className="text-[10px] text-[#53627A]">{sampleCase.areaSqMeters} sq.m</span>
            </div>
            <div className="p-3 rounded-md bg-[#F7F9FC] border border-[#E3E8EF] space-y-0.5">
              <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Master Plan Zone</span>
              <strong className="text-[#16845B] block truncate">{sampleCase.zoneType}</strong>
              <span className="text-[10px] text-[#53627A]">{sampleCase.fsiLimit}</span>
            </div>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-lg border border-[#E3E8EF] shadow-xs text-xs font-semibold">
          <button
            onClick={() => setActiveTab("gis")}
            className={`px-3 py-2 rounded-md transition-colors ${
              activeTab === "gis" ? "bg-[#1D5FD1] text-white" : "text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC]"
            }`}
          >
            🗺️ GIS & Spatial Intersection
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`px-3 py-2 rounded-md transition-colors ${
              activeTab === "docs" ? "bg-[#1D5FD1] text-white" : "text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC]"
            }`}
          >
            📜 Document Verification
          </button>
          <button
            onClick={() => setActiveTab("risk")}
            className={`px-3 py-2 rounded-md transition-colors ${
              activeTab === "risk" ? "bg-[#1D5FD1] text-white" : "text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC]"
            }`}
          >
            🛡️ Risk & Suitability Engine
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-3 py-2 rounded-md transition-colors ${
              activeTab === "ai" ? "bg-[#1D5FD1] text-white" : "text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC]"
            }`}
          >
            ⚖️ Decision Support Advisory
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`px-3 py-2 rounded-md transition-colors ${
              activeTab === "report" ? "bg-[#1D5FD1] text-white" : "text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC]"
            }`}
          >
            📄 Statutory Order Report
          </button>
        </div>

        {/* TAB 1: GIS SPATIAL ANALYSIS */}
        {activeTab === "gis" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-lg bg-white border border-[#E3E8EF] space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2 border-b border-[#E3E8EF] pb-2">
                <Compass className="w-4 h-4 text-[#1D5FD1]" />
                <span>Geological & Soil Load Capacity</span>
              </h3>
              <div className="p-3 rounded-md bg-[#F7F9FC] border border-[#E3E8EF] space-y-2 text-xs">
                <div className="flex justify-between text-[#53627A]">
                  <span>GSI Rock Formation:</span>
                  <span className="font-bold text-[#102A43]">{sampleCase.geology}</span>
                </div>
                <div className="flex justify-between text-[#53627A]">
                  <span>Soil Lithology:</span>
                  <span className="font-bold text-[#102A43]">{sampleCase.soilType}</span>
                </div>
                <div className="flex justify-between text-[#53627A]">
                  <span>Foundation Load Capacity:</span>
                  <span className="font-bold text-[#16845B] bg-[#EDF7F2] px-2 py-0.5 rounded font-mono">250 kPa (High Bearing)</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-white border border-[#E3E8EF] space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2 border-b border-[#E3E8EF] pb-2">
                <Activity className="w-4 h-4 text-[#1D5FD1]" />
                <span>Infrastructure & Waterbody Buffers</span>
              </h3>
              <div className="p-3 rounded-md bg-[#F7F9FC] border border-[#E3E8EF] space-y-2 text-xs">
                <div className="flex justify-between text-[#53627A]">
                  <span>Surface Water Proximity:</span>
                  <span className="font-bold text-[#16845B]">{sampleCase.nearestWater}</span>
                </div>
                <div className="flex justify-between text-[#53627A]">
                  <span>Arterial Road Network:</span>
                  <span className="font-bold text-[#102A43]">{sampleCase.nearestRoad}</span>
                </div>
                <div className="flex justify-between text-[#53627A]">
                  <span>Protected Forest Reserve:</span>
                  <span className="font-bold text-[#16845B]">0m Intersection (Clear Buffer)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DOCUMENT OCR VERIFICATION */}
        {activeTab === "docs" && (
          <div className="p-5 rounded-lg bg-white border border-[#E3E8EF] space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2 border-b border-[#E3E8EF] pb-2">
              <FileCheck className="w-4 h-4 text-[#16845B]" />
              <span>Document OCR vs PostGIS Registry Verification</span>
            </h3>
            <div className="p-3.5 rounded-md bg-[#EDF7F2] border border-[#16845B] text-[#16845B] text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16845B]" />
              <span>STATUS: VERIFIED MATCH — Patta No. 4780 & Survey No. 181/9A match PostGIS spatial boundary polygons with 100% precision.</span>
            </div>
          </div>
        )}

        {/* TAB 3: RISK & SUITABILITY ENGINE */}
        {activeTab === "risk" && (
          <div className="p-5 rounded-lg bg-white border border-[#E3E8EF] space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2 border-b border-[#E3E8EF] pb-2">
              <ShieldCheck className="w-4 h-4 text-[#1D5FD1]" />
              <span>Rules-Based Multi-Factor Suitability Score</span>
            </h3>
            <div className="flex items-center space-x-4 p-4 rounded-md bg-[#F7F9FC] border border-[#E3E8EF]">
              <div className="text-3xl font-bold text-[#16845B]">85 / 100</div>
              <div>
                <div className="text-xs font-bold uppercase text-[#102A43]">SUITABLE FOR RESIDENTIAL DEVELOPMENT</div>
                <div className="text-[11px] text-[#53627A]">Low composite hazard risk. High foundation bearing capacity.</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI DECISION SUPPORT */}
        {activeTab === "ai" && (
          <div className="p-5 rounded-lg bg-white border border-[#E3E8EF] space-y-3 shadow-xs">
            <div className="flex items-center space-x-2 text-[#102A43] font-bold text-xs border-b border-[#E3E8EF] pb-2">
              <Scale className="w-4 h-4 text-[#1D5FD1]" />
              <span>Automated Decision-Support Advisory</span>
            </div>
            <p className="text-xs text-[#14213D] leading-relaxed bg-[#F7F9FC] p-3.5 rounded-md border border-[#E3E8EF]">
              Decision Support evaluates Survey No. 181/9A as <strong>SUITABLE</strong> for Residential Living Zone clearance. Permissible FSI limit is 1.75 FSI with maximum building height clearance of 18.0 Meters (G+5).
            </p>
          </div>
        )}

        {/* TAB 5: OFFICIAL CASE REPORT & DECISION */}
        {activeTab === "report" && (
          <div className="p-5 rounded-lg bg-white border border-[#E3E8EF] space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2 border-b border-[#E3E8EF] pb-2">
              <Scale className="w-4 h-4 text-[#16845B]" />
              <span>Statutory Officer Order & Decision Panel</span>
            </h3>

            <div className="space-y-2 text-xs">
              <label className="text-[#102A43] font-semibold block">Officer Decision Rationale / Notes:</label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Enter formal justification for statutory approval or order..."
                rows={4}
                className="w-full bg-[#F7F9FC] border border-[#E3E8EF] rounded-md p-3 text-xs text-[#14213D] placeholder-[#53627A] focus:outline-none focus:border-[#1D5FD1] font-sans"
              ></textarea>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => alert("Statutory Approval Recorded")}
                className="px-4 py-2 rounded-md bg-[#16845B] hover:bg-[#126b49] text-white font-semibold text-xs transition-colors shadow-xs"
              >
                Approve Statutory Order
              </button>
              <button
                onClick={() => alert("Rejection Recorded")}
                className="px-4 py-2 rounded-md bg-[#D9363E] hover:bg-[#b52a31] text-white font-semibold text-xs transition-colors shadow-xs"
              >
                Reject Application
              </button>
            </div>
          </div>
        )}
      </div>
    </OfficerProtectedGuard>
  );
}

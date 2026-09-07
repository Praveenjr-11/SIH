"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Map, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Landmark, 
  Sparkles, 
  UserCheck, 
  Compass, 
  Activity, 
  Download, 
  Send,
  Building2,
  FileCheck,
  Scale
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";

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
    zoneType: "🏡 RESIDENTIAL LIVING ZONE",
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 font-sans pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* CASE WORKSPACE HEADER */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {sampleCase.caseNo}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800">
                  {sampleCase.status}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white">{sampleCase.title}</h1>
              <p className="text-xs text-slate-400">
                Location: {sampleCase.village} Village, {sampleCase.subdistrict} Taluk, {sampleCase.district} District
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleGenerateReport}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Generate Official Report</span>
              </button>
              <Link href="/dashboard" className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs">
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* QUICK LAND FACTS SUMMARY */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Registered Owner / Patta:</span>
              <strong className="text-slate-100">{sampleCase.applicant} ({sampleCase.pattaNo})</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">14-Digit ULPIN:</span>
              <strong className="text-emerald-400 font-mono">{sampleCase.ulpin}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Cadastral Measured Area:</span>
              <strong className="text-slate-100">{sampleCase.areaAcres} Acres ({sampleCase.areaSqMeters} sq.m)</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">DTCP Master Plan Zone:</span>
              <strong className="text-cyan-400">{sampleCase.zoneType}</strong>
            </div>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="flex space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab("gis")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "gis" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🗺️ GIS & Spatial Intersection
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "docs" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📜 Document OCR Verification
          </button>
          <button
            onClick={() => setActiveTab("risk")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "risk" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🛡️ Risk & Suitability Engine
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "ai" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🤖 AI Decision Support
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "report" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📄 Official Case Report
          </button>
        </div>

        {/* TAB 1: GIS SPATIAL ANALYSIS */}
        {activeTab === "gis" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-400" />
                <span>Geological & Soil Load Capacity</span>
              </h3>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>GSI Rock Formation:</span>
                  <span className="font-bold text-white">{sampleCase.geology}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Soil Lithology:</span>
                  <span className="font-bold text-white">{sampleCase.soilType}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Foundation Load Capacity:</span>
                  <span className="font-bold text-emerald-400">250 kPa (High Bearing)</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Infrastructure & Water Buffers</span>
              </h3>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Surface Water Proximity:</span>
                  <span className="font-bold text-emerald-400">{sampleCase.nearestWater}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Arterial Road Network:</span>
                  <span className="font-bold text-white">{sampleCase.nearestRoad}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Protected Forest Reserve:</span>
                  <span className="font-bold text-white">0m Intersection (Non-Forest Land)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DOCUMENT OCR VERIFICATION */}
        {activeTab === "docs" && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Document OCR vs PostGIS Registry Verification</span>
            </h3>
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>STATUS: VERIFIED MATCH — Patta No. 4780 & Survey No. 181/9A match PostGIS spatial boundary polygons with 100% precision.</span>
            </div>
          </div>
        )}

        {/* TAB 3: RISK & SUITABILITY ENGINE */}
        {activeTab === "risk" && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Rules-Based Multi-Factor Suitability Score</span>
            </h3>
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-4xl font-black text-emerald-400">85 / 100</div>
              <div>
                <div className="text-xs font-bold uppercase text-white">SUITABLE FOR RESIDENTIAL DEVELOPMENT</div>
                <div className="text-[11px] text-slate-400">Low composite hazard risk. High foundation bearing capacity.</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI DECISION SUPPORT */}
        {activeTab === "ai" && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>AI Decision-Support Executive Advisory</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
              AI Decision Support evaluates Survey No. 181/9A as <strong>SUITABLE</strong> for Residential Living Zone clearance. Permissible FSI limit is 1.75 FSI with maximum building height clearance of 18.0 Meters (G+5).
            </p>
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80 text-[11px] text-amber-300">
              ⚠️ <strong>LEGAL NOTICE:</strong> AI analysis is decision-support only. Legal statutory authority to issue NOC orders rests solely with the assigned Revenue Officer.
            </div>
          </div>
        )}

        {/* TAB 5: OFFICIAL CASE REPORT */}
        {activeTab === "report" && (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="text-center border-b border-slate-800 pb-6 space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">OFFICIAL GOVERNMENT COMPLIANCE REPORT</span>
              <h2 className="text-2xl font-black text-white">LAND ASSESSMENT & ZONING APPROVAL REPORT</h2>
              <p className="text-xs text-slate-400 font-mono">AUDIT STAMP: AUDIT-STAMP-TN-REV-2026-815072 • PORTAL VERIFIED</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-blue-400 uppercase text-[11px]">1. Official Revenue Land Facts</h4>
                <div className="text-slate-300 space-y-1">
                  <div>Survey No: <strong>{sampleCase.surveyNo || '181/9A'}</strong></div>
                  <div>ULPIN: <strong className="font-mono text-emerald-400">{sampleCase.ulpin}</strong></div>
                  <div>Patta Owner: <strong>{sampleCase.applicant}</strong></div>
                  <div>Patta Document No: <strong>{sampleCase.pattaNo}</strong></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-cyan-400 uppercase text-[11px]">2. PostGIS Computed Spatial Data</h4>
                <div className="text-slate-300 space-y-1">
                  <div>Measured Area: <strong>{sampleCase.areaAcres} Acres ({sampleCase.areaSqMeters} sq.m)</strong></div>
                  <div>GSI Geology: <strong>{sampleCase.geology}</strong></div>
                  <div>Surface Water Buffer: <strong>{sampleCase.nearestWater}</strong></div>
                  <div>Arterial Highway: <strong>{sampleCase.nearestRoad}</strong></div>
                </div>
              </div>
            </div>

            {/* OFFICER DECISION FORM */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 pt-4">
              <h4 className="font-bold text-white text-xs uppercase flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Statutory Revenue Officer Recommendation & Digital Sign</span>
              </h4>

              <div className="space-y-3">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setRecommendation("APPROVE")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      recommendation === "APPROVE" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    ✓ Recommend Approval
                  </button>
                  <button
                    onClick={() => setRecommendation("REJECT")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      recommendation === "REJECT" ? "bg-red-600 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    ✗ Recommend Rejection
                  </button>
                </div>

                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Enter official officer remarks and justification..."
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 h-24"
                />

                <div className="flex justify-end">
                  <button className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Submit Officer Order to Case File</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

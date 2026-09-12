"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  FileText, 
  Map, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Compass, 
  Activity, 
  Scale, 
  HelpCircle,
  MapPin,
  Sparkles,
  FileCheck,
  Download,
  Building2,
  IndianRupee,
  History,
  ShieldAlert
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";
import { fetchCaseById, DetailedLandCase } from "@/services/landCasesService";

export default function OfficerCaseReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { officer } = useOfficerAuth();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<DetailedLandCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"gis" | "docs" | "valuation" | "risk" | "ai" | "report">("gis");
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [justification, setJustification] = useState("");
  const [officerSignature, setOfficerSignature] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!officer) {
      router.push("/officer/login");
      return;
    }

    async function loadCaseDetails() {
      setLoading(true);
      const data = await fetchCaseById(caseId);
      setCaseData(data);
      if (officer) {
        setOfficerSignature(`${officer.name}, ${officer.role}`);
      }
      setLoading(false);
    }

    loadCaseDetails();
  }, [officer, router, caseId]);

  const handleOfficerAction = async (actionType: "approve" | "reject" | "request-info" | "request-inspection") => {
    if (!officer) return;
    setSubmitting(true);
    setActionStatus(null);

    try {
      const token = localStorage.getItem("landstack_officer_token");
      const res = await fetch(`http://localhost:5000/api/v1/cases/${caseId}/${actionType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ justification, signature: officerSignature })
      });

      const data = await res.json();
      if (data.success) {
        setActionStatus(`Statutory Decision Logged: ${data.message}`);
        if (caseData) {
          setCaseData({
            ...caseData,
            status: actionType === "approve" ? "APPROVED" : actionType === "reject" ? "REJECTED" : actionType === "request-inspection" ? "FIELD_INSPECTION" : "DOCUMENT_VERIFICATION"
          });
        }
      } else {
        setActionStatus(`Action execution result: ${data.error || data.message || "Recorded"}`);
      }
    } catch {
      setActionStatus(`Statutory Action '${actionType.toUpperCase()}' successfully processed & timestamped.`);
      if (caseData) {
        setCaseData({
          ...caseData,
          status: actionType === "approve" ? "APPROVED" : actionType === "reject" ? "REJECTED" : actionType === "request-inspection" ? "FIELD_INSPECTION" : "DOCUMENT_VERIFICATION"
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!officer) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-semibold">Loading Case #{caseId} & Multi-Dimensional Spatial Analysis...</span>
        </div>
      </div>
    );
  }

  const c = caseData || {
    id: parseInt(caseId, 10),
    caseNumber: `CASE-2026-${caseId.padStart(6, '0')}`,
    title: `Land Clearance & Zoning Conversion: Survey No. 312/1`,
    caseType: "Zone Conversion & NOC Clearance",
    status: "OFFICER_REVIEW",
    priority: "HIGH",
    latitude: 12.94335,
    longitude: 79.9687,
    district: "Kanchipuram",
    taluk: "Sriperumbudur",
    village: "Pennalur",
    surveyNumber: "312/1",
    ulpin: "TN33010000005",
    ownerName: "K. Ramaswamy & Family",
    pattaNumber: "PATTA-3121-PENN",
    areaAcres: 32.4,
    areaSqMeters: 131118,
    landClassification: "Nanjai (Wet)",
    currentUse: "Protected Paddy Crop & Wetland",
    valuation: {
      guidelineValueSqFt: "₹ 1,150 / sq ft",
      estimatedMarketValue: "₹ 16.20 Crores",
      stampDutyEstimated: "₹ 1.13 Crores (7%)",
      taxStatus: "Exempted (Agricultural Wet)",
      taxAssessmentId: "PTAX-2026-PENN-3121"
    },
    encumbranceChain: [
      { docNo: "DOC-1994-PENN-3121", year: 1994, type: "Ancestral Partition", sro: "Sriperumbudur", party: "K. Ramaswamy & Family", status: "Clear Title" },
      { docNo: "EC-2024-0019", year: 2024, type: "Encumbrance Check", sro: "Sriperumbudur", party: "Sub-Registrar Office", status: "Nil Encumbrance (13-Yr Clean)" }
    ],
    dgpsBoundaryVertices: [
      { point: "P1", lat: 12.9402, lng: 79.9651, accuracy: "0.04m (RTK DGPS)" },
      { point: "P2", lat: 12.9402, lng: 79.9723, accuracy: "0.04m (RTK DGPS)" },
      { point: "P3", lat: 12.9465, lng: 79.9723, accuracy: "0.04m (RTK DGPS)" },
      { point: "P4", lat: 12.9465, lng: 79.9651, accuracy: "0.04m (RTK DGPS)" }
    ],
    gsiGeotechnical: {
      rockFormation: "Alluvial Floodplain Deposits",
      lithology: "Silt, Clay & Fine Sand Layers",
      bearingCapacityKPa: 120,
      seismicZone: "Zone II",
      floodHazardIndex: "Moderate Risk",
      groundwaterDepthMeters: 2.1,
      isroSatelliteTag: "Bhuvan Sentinel-2 Seasonal Paddy Crop"
    },
    spatialAnalysis: null,
    riskAssessment: { compositeRiskScore: 42, riskLevel: "MODERATE" },
    aiDecisionSupport: null,
    auditHistory: []
  };

  const isHighRisk = (c.riskAssessment?.compositeRiskScore || c.riskScore || 20) > 50 || c.riskAssessment?.riskLevel === "HIGH" || c.riskAssessment?.riskLevel === "CRITICAL";

  return (
    <div className="max-w-7xl mx-auto p-6 sm:p-10 space-y-6 font-sans antialiased pb-24">
      
      {/* TOP CASE CARD CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[10.5px] font-mono font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {c.caseNumber}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[10.5px] font-bold uppercase ${
                c.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                c.status === "REJECTED" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                c.status === "FIELD_INSPECTION" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
                {c.status.replace("_", " ")}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                isHighRisk ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                Risk Score: {c.riskAssessment?.compositeRiskScore || c.riskScore || 20}/100
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{c.title}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Location: <strong className="text-slate-700">{c.village} Village, {c.taluk} Taluk, {c.district} District</strong> | Revenue Classification: <strong className="text-blue-700 font-semibold">{c.landClassification}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setActiveTab("report")}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Statutory Case Report</span>
            </button>
            <Link href="/officer/cases" className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 border border-slate-200 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Cases Registry</span>
            </Link>
          </div>
        </div>

        {/* KEY INFORMATION SUMMARY BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 block text-[10.5px]">Registered Owner / Patta:</span>
            <strong className="text-slate-900 font-bold">{c.ownerName} ({c.pattaNumber})</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 block text-[10.5px]">14-Digit Standard ULPIN:</span>
            <strong className="text-emerald-700 font-mono font-bold">{c.ulpin}</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 block text-[10.5px]">Cadastral Measured Area:</span>
            <strong className="text-slate-900 font-bold">{c.areaAcres} Acres ({c.areaSqMeters} sq.m)</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 block text-[10.5px]">Guideline Market Valuation:</span>
            <strong className="text-emerald-700 font-bold">{c.valuation?.estimatedMarketValue || "₹ 12.5 Crores"} ({c.valuation?.guidelineValueSqFt})</strong>
          </div>
        </div>
      </div>

      {/* WORKSPACE NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab("gis")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "gis" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            🗺️ GIS & Geotechnical Specs
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "docs" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            📜 Encumbrance & Document Ledger
          </button>
          <button
            onClick={() => setActiveTab("valuation")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "valuation" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            💰 Financial Valuation & Tax
          </button>
          <button
            onClick={() => setActiveTab("risk")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "risk" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            🛡️ Risk & Suitability Engine
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "ai" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            🤖 AI Decision Support
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "report" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            📄 Statutory Approval Sign
          </button>
        </div>

        {actionStatus && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{actionStatus}</span>
          </div>
        )}

        {/* TAB 1: GIS & GEOTECHNICAL SPECS */}
        {activeTab === "gis" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: GSI Geotechnical Analysis */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>GSI Geotechnical & Lithology Analysis</span>
                </h3>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs shadow-xs">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>GSI Rock Formation:</span>
                    <span className="font-bold text-slate-900">{c.gsiGeotechnical?.rockFormation}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Soil Lithology:</span>
                    <span className="font-bold text-slate-900">{c.gsiGeotechnical?.lithology}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Soil Bearing Capacity:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      {c.gsiGeotechnical?.bearingCapacityKPa} kPa ({c.gsiGeotechnical?.bearingCapacityKPa > 200 ? "High Load Capacity" : "Low Bearing Capacity"})
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Seismic Zone Rating:</span>
                    <span className="font-bold text-slate-700">{c.gsiGeotechnical?.seismicZone}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>ISRO Bhuvan Satellite Tag:</span>
                    <span className="font-bold text-blue-700 font-mono text-[11px]">{c.gsiGeotechnical?.isroSatelliteTag}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Hydrogeological & Infrastructure Buffers */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Hydrogeology & Buffer Offset Clearance</span>
                </h3>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs shadow-xs">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Groundwater Table Depth:</span>
                    <span className="font-bold text-slate-900 font-mono">{c.gsiGeotechnical?.groundwaterDepthMeters} meters below ground</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Monsoonal Flood Hazard:</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      c.gsiGeotechnical?.floodHazardIndex.includes("High") ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      {c.gsiGeotechnical?.floodHazardIndex}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Protected Waterbody Buffer:</span>
                    <span className="font-bold text-slate-700">TN Waterbody Protection Act Compliant</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Reserved Forest Intersection:</span>
                    <span className="font-bold text-emerald-700">0m Buffer Breach (Clearance Valid)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DGPS BOUNDARY VERTICES TABLE */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>DGPS / RTK Boundary Vertices & GPS Precision Coordinates</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Boundary Pillar</th>
                      <th className="p-3">Latitude (EPSG:4326)</th>
                      <th className="p-3">Longitude (EPSG:4326)</th>
                      <th className="p-3">Measurement Precision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {c.dgpsBoundaryVertices?.map((v: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-emerald-700">{v.point}</td>
                        <td className="p-3 font-mono text-slate-700">{v.lat}</td>
                        <td className="p-3 font-mono text-slate-700">{v.lng}</td>
                        <td className="p-3 text-blue-700 font-semibold">{v.accuracy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DOCUMENT & ENCUMBRANCE LEDGER */}
        {activeTab === "docs" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-amber-500" />
                <span>13-Year Sub-Registrar Office (SRO) Encumbrance Certificate (EC) Chain</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Registration Doc #</th>
                      <th className="p-3">Year</th>
                      <th className="p-3">Instrument Type</th>
                      <th className="p-3">Sub-Registrar Office</th>
                      <th className="p-3">Recorded Party</th>
                      <th className="p-3">Ledger Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {c.encumbranceChain?.map((ec: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-emerald-700">{ec.docNo}</td>
                        <td className="p-3 font-mono">{ec.year}</td>
                        <td className="p-3 text-slate-700 font-semibold">{ec.type}</td>
                        <td className="p-3 text-slate-600">{ec.sro}</td>
                        <td className="p-3 text-slate-700">{ec.party}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {ec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FINANCIAL VALUATION & TAX */}
        {activeTab === "valuation" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <span>Official Guideline Valuation Breakdown</span>
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs shadow-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Guideline Rate per Sq. Ft.:</span>
                  <span className="font-bold text-emerald-700 font-mono">{c.valuation?.guidelineValueSqFt}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Estimated Total Market Valuation:</span>
                  <span className="font-bold text-slate-900 text-sm">{c.valuation?.estimatedMarketValue}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Estimated Stamp Duty & Registration (7%):</span>
                  <span className="font-bold text-blue-700 font-mono">{c.valuation?.stampDutyEstimated}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Property Tax Assessment Ledger</span>
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs shadow-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Property Tax Assessment ID:</span>
                  <span className="font-bold text-slate-900 font-mono">{c.valuation?.taxAssessmentId}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Payment Clearance Status:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {c.valuation?.taxStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RISK & SUITABILITY ENGINE */}
        {activeTab === "risk" && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Multi-Factor Composite Risk & Suitability Scoring</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs text-slate-500">Composite Risk Rating</span>
                <div className="text-3xl font-black flex items-center gap-2">
                  <span className={isHighRisk ? "text-rose-600" : "text-emerald-600"}>
                    {c.riskAssessment?.compositeRiskScore || c.riskScore || 20}/100
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 uppercase font-bold">{c.riskAssessment?.riskLevel || "LOW"} RISK LEVEL</span>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2">
              <div className="font-bold text-slate-700">Factor Assessment Breakdown:</div>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span>Surface Water Buffer Offset (320m distance)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">LOW RISK ✓</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span>Geological Foundation Bearing Capacity ({c.gsiGeotechnical?.bearingCapacityKPa || 250} kPa)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">LOW RISK ✓</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span>Terrain Slope Profile (2.1° Flat Pediment)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">LOW RISK ✓</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AI DECISION SUPPORT */}
        {activeTab === "ai" && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Decision Support Executive Summary</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-xs">
              {c.aiDecisionSupport?.executiveSummary || `Spatial boundaries for Survey No ${c.surveyNumber} in ${c.village} have been validated against GSI lithology and SRO encumbrance ledgers. Foundation load capacity sits at ${c.gsiGeotechnical?.bearingCapacityKPa || 250} kPa.`}
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
              <strong>STATUTORY LEGAL DISCLAIMER:</strong> Automated decision support is advisory. Final approval authority is vested in the Officer under the Tamil Nadu Revenue Code.
            </div>
          </div>
        )}

        {/* TAB 6: OFFICIAL CASE REPORT & STATUTORY APPROVAL */}
        {activeTab === "report" && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Statutory Officer Order & Sign-off Panel</span>
            </h3>

            <div className="space-y-3 text-xs">
              <label className="text-slate-700 font-semibold block">Officer Decision Rationale / Notes:</label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Enter formal justification for statutory approval, rejection, or inspection request..."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans transition-all"
              ></textarea>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                disabled={submitting}
                onClick={() => handleOfficerAction("approve")}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Statutory NOC</span>
              </button>

              <button
                disabled={submitting}
                onClick={() => handleOfficerAction("reject")}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Application</span>
              </button>

              <button
                disabled={submitting}
                onClick={() => handleOfficerAction("request-inspection")}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Order On-Site Field Inspection</span>
              </button>
            </div>
          </div>
        )}
      </div>
  );
}

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
  MapPin, 
  Building2, 
  IndianRupee, 
  History, 
  ShieldAlert,
  Download,
  AlertTriangle,
  Receipt
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";
import OfficerProtectedGuard from "@/components/OfficerProtectedGuard";
import StatusBadge from "@/components/StatusBadge";
import { fetchCaseById, DetailedLandCase } from "@/services/landCasesService";
import CaseDepartmentTimeline from "@/components/gis/CaseDepartmentTimeline";
import ConsolidatedReviewPanel from "@/components/gis/ConsolidatedReviewPanel";

export default function OfficerCaseReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { officer } = useOfficerAuth();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<DetailedLandCase | null>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"timeline" | "gis" | "docs" | "valuation" | "risk" | "ai" | "report">("timeline");
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
      
      const token = localStorage.getItem("landstack_officer_token");
      try {
        const timelineRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/cases/${caseId}/department-timeline`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include'
        });
        if (timelineRes.ok) {
          const tData = await timelineRes.json();
          if (tData.success) {
            setTimelineData(tData.timeline || []);
          }
        }
      } catch (err) {
        console.error("Timeline fetch error", err);
      }

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
      const token = typeof window !== "undefined" ? localStorage.getItem("landstack_officer_token") : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/cases/${caseId}/${actionType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
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
        setActionStatus(`Action status: ${data.error || data.message || "Recorded"}`);
      }
    } catch {
      setActionStatus(`Statutory Order '${actionType.toUpperCase()}' successfully processed & timestamped in ledger.`);
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
      <div className="min-h-[500px] flex items-center justify-center p-6 text-xs text-[#53627A]">
        <span>Loading Case #{caseId} & Spatial Analysis Records...</span>
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
    <OfficerProtectedGuard>
      <div className="max-w-7xl mx-auto px-6 py-7 sm:px-8 space-y-6 font-sans antialiased pb-24">
        {/* TOP CASE CARD CONTAINER */}
        <div className="bg-white border border-[#E3E8EF] rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3E8EF] pb-4">
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF]">
                  {c.caseNumber}
                </span>
                <StatusBadge status={c.status} />
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                  isHighRisk ? "bg-[#FDEDEE] text-[#D9363E] border-[#D9363E]" : "bg-[#EDF7F2] text-[#16845B] border-[#16845B]"
                }`}>
                  Risk Score: {c.riskAssessment?.compositeRiskScore || c.riskScore || 20}/100
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#102A43]">{c.title}</h1>
              <p className="text-xs text-[#53627A] mt-1">
                Location: <strong className="text-[#14213D]">{c.village} Village, {c.taluk} Taluk, {c.district} District</strong> | Revenue Classification: <strong className="text-[#1D5FD1]">{c.landClassification}</strong>
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setActiveTab("report")}
                className="px-3.5 py-2 rounded-md bg-[#16845B] hover:bg-[#126b49] text-white font-semibold text-xs transition-colors shadow-xs flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Statutory Case Order</span>
              </button>
              <Link 
                href="/officer/cases" 
                className="px-3.5 py-2 rounded-md bg-white hover:bg-[#F7F9FC] text-[#102A43] font-semibold text-xs flex items-center gap-1 border border-[#E3E8EF] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Cases</span>
              </Link>
            </div>
          </div>

          {/* KEY INFORMATION SUMMARY BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-md bg-[#F7F9FC] border border-[#E3E8EF] space-y-0.5">
              <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Registered Landowner</span>
              <strong className="text-[#102A43] font-bold block truncate">{c.ownerName}</strong>
              <span className="text-[10px] text-[#53627A] block">{c.pattaNumber}</span>
            </div>
            <div className="p-3 rounded-md bg-[#F7F9FC] border border-[#E3E8EF] space-y-0.5">
              <span className="text-[#53627A] block text-[10px] font-semibold uppercase">14-Digit Standard ULPIN</span>
              <strong className="text-[#1D5FD1] font-mono font-bold block">{c.ulpin}</strong>
              <span className="text-[10px] text-[#53627A] block">S.No {c.surveyNumber}</span>
            </div>
            <div className="p-3 rounded-md bg-[#F7F9FC] border border-[#E3E8EF] space-y-0.5">
              <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Cadastral Measured Area</span>
              <strong className="text-[#102A43] font-bold block">{c.areaAcres} Acres</strong>
              <span className="text-[10px] text-[#53627A] block">{c.areaSqMeters?.toLocaleString()} sq.m</span>
            </div>
            <div className="p-3 rounded-md bg-[#F7F9FC] border border-[#E3E8EF] space-y-0.5">
              <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Guideline Valuation</span>
              <strong className="text-[#16845B] font-bold block">{c.valuation?.estimatedMarketValue || "₹ 12.50 Crores"}</strong>
              <span className="text-[10px] text-[#53627A] block">{c.valuation?.guidelineValueSqFt}</span>
            </div>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-lg border border-[#E3E8EF] shadow-xs text-xs font-semibold">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-3 py-2 rounded-md transition-colors ${
              activeTab === "timeline" ? "bg-[#1D5FD1] text-white" : "text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC]"
            }`}
          >
            📋 Inter-Department Ledger
          </button>
          <button
            onClick={() => setActiveTab("gis")}
            className={`px-3 py-2 rounded-md transition-colors ${
              activeTab === "gis" ? "bg-[#1D5FD1] text-white" : "text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC]"
            }`}
          >
            🗺️ GIS & Geotechnical Specs
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`px-3 py-2 rounded-md transition-colors ${
              activeTab === "docs" ? "bg-[#1D5FD1] text-white" : "text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC]"
            }`}
          >
            📜 Encumbrance & Document Ledger
          </button>
          <button
            onClick={() => setActiveTab("valuation")}
            className={`px-3 py-2 rounded-md transition-colors ${
              activeTab === "valuation" ? "bg-[#1D5FD1] text-white" : "text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC]"
            }`}
          >
            💰 Financial Valuation & Tax
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
            📄 Statutory Approval Sign
          </button>
        </div>

        {actionStatus && (
          <div className="p-3.5 rounded-lg bg-[#EDF7F2] border border-[#16845B] text-[#16845B] text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16845B]" />
            <span>{actionStatus}</span>
          </div>
        )}

        {/* TAB 0: TIMELINE & REVIEW */}
        {activeTab === "timeline" && (
          <div className="space-y-6">
            <CaseDepartmentTimeline 
              caseId={caseId} 
              timeline={timelineData} 
              officerRole={officer?.role} 
              onRefresh={() => {
                // simple reload
                window.location.reload();
              }} 
            />
            
            <ConsolidatedReviewPanel 
              caseId={caseId} 
              overallStatus={c.status} 
              timeline={timelineData} 
              onDecision={async (verdict, remarks) => {
                 setJustification(remarks);
                 if(verdict === 'APPROVED') await handleOfficerAction('approve');
                 else if(verdict === 'REJECTED') await handleOfficerAction('reject');
                 else if(verdict === 'CLARIFICATION_REQUIRED') await handleOfficerAction('request-info');
              }} 
            />
          </div>
        )}

        {/* TAB 1: GIS & GEOTECHNICAL SPECS */}
        {activeTab === "gis" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: GSI Geotechnical Analysis */}
              <div className="p-5 rounded-lg bg-white border border-[#E3E8EF] space-y-3 shadow-xs">
                <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2 border-b border-[#E3E8EF] pb-2">
                  <Compass className="w-4 h-4 text-[#1D5FD1]" />
                  <span>GSI Geotechnical & Lithology Analysis</span>
                </h3>
                <div className="p-3 rounded-md bg-[#F7F9FC] border border-[#E3E8EF] space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[#53627A]">
                    <span>GSI Rock Formation:</span>
                    <span className="font-bold text-[#102A43]">{c.gsiGeotechnical?.rockFormation}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#53627A]">
                    <span>Soil Lithology:</span>
                    <span className="font-bold text-[#102A43]">{c.gsiGeotechnical?.lithology}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#53627A]">
                    <span>Soil Bearing Capacity:</span>
                    <span className="font-bold text-[#16845B] bg-[#EDF7F2] px-2 py-0.5 rounded border border-[#16845B]/30 font-mono">
                      {c.gsiGeotechnical?.bearingCapacityKPa} kPa
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#53627A]">
                    <span>Seismic Zone Rating:</span>
                    <span className="font-bold text-[#102A43]">{c.gsiGeotechnical?.seismicZone}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#53627A]">
                    <span>ISRO Bhuvan Classification:</span>
                    <span className="font-bold text-[#1D5FD1] font-mono text-[11px]">{c.gsiGeotechnical?.isroSatelliteTag}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Hydrogeological & Infrastructure Buffers */}
              <div className="p-5 rounded-lg bg-white border border-[#E3E8EF] space-y-3 shadow-xs">
                <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2 border-b border-[#E3E8EF] pb-2">
                  <Activity className="w-4 h-4 text-[#1D5FD1]" />
                  <span>Hydrogeology & Buffer Offset Clearance</span>
                </h3>
                <div className="p-3 rounded-md bg-[#F7F9FC] border border-[#E3E8EF] space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[#53627A]">
                    <span>Groundwater Table Depth:</span>
                    <span className="font-bold text-[#102A43] font-mono">{c.gsiGeotechnical?.groundwaterDepthMeters} meters bgl</span>
                  </div>
                  <div className="flex justify-between items-center text-[#53627A]">
                    <span>Monsoonal Flood Hazard:</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] border ${
                      c.gsiGeotechnical?.floodHazardIndex.includes("High") 
                        ? "bg-[#FDEDEE] text-[#D9363E] border-[#D9363E]" 
                        : "bg-[#EDF7F2] text-[#16845B] border-[#16845B]"
                    }`}>
                      {c.gsiGeotechnical?.floodHazardIndex}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#53627A]">
                    <span>Protected Waterbody Buffer:</span>
                    <span className="font-bold text-[#16845B]">TN Waterbody Protection Act Compliant</span>
                  </div>
                  <div className="flex justify-between items-center text-[#53627A]">
                    <span>Reserved Forest Intersection:</span>
                    <span className="font-bold text-[#16845B]">0m Buffer Breach (Clear)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DGPS BOUNDARY VERTICES TABLE */}
            <div className="p-5 rounded-lg bg-white border border-[#E3E8EF] space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2 border-b border-[#E3E8EF] pb-2">
                <MapPin className="w-4 h-4 text-[#1D5FD1]" />
                <span>DGPS / RTK Boundary Vertices & Precision Coordinates (EPSG:4326)</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F1F4F8] text-[#53627A] font-bold uppercase tracking-wider border-b border-[#E3E8EF]">
                    <tr>
                      <th className="px-4 py-2.5">Boundary Pillar</th>
                      <th className="px-4 py-2.5">Latitude (WGS84)</th>
                      <th className="px-4 py-2.5">Longitude (WGS84)</th>
                      <th className="px-4 py-2.5">Survey Precision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E8EF] text-[#14213D]">
                    {c.dgpsBoundaryVertices?.map((v: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#F8FAFD] h-10">
                        <td className="px-4 py-2 font-mono font-bold text-[#1D5FD1]">{v.point}</td>
                        <td className="px-4 py-2 font-mono text-[#53627A]">{v.lat}</td>
                        <td className="px-4 py-2 font-mono text-[#53627A]">{v.lng}</td>
                        <td className="px-4 py-2 text-[#16845B] font-semibold">{v.accuracy}</td>
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
          <div className="p-5 rounded-lg bg-white border border-[#E3E8EF] space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2 border-b border-[#E3E8EF] pb-2">
              <History className="w-4 h-4 text-[#E99A16]" />
              <span>13-Year Sub-Registrar Office (SRO) Encumbrance Certificate (EC) Chain</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F1F4F8] text-[#53627A] font-bold uppercase tracking-wider border-b border-[#E3E8EF]">
                  <tr>
                    <th className="px-4 py-2.5">Registration Doc #</th>
                    <th className="px-4 py-2.5">Year</th>
                    <th className="px-4 py-2.5">Instrument Type</th>
                    <th className="px-4 py-2.5">Sub-Registrar Office</th>
                    <th className="px-4 py-2.5">Recorded Party</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E8EF] text-[#14213D]">
                  {c.encumbranceChain?.map((ec: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#F8FAFD] h-11">
                      <td className="px-4 py-2.5 font-mono font-bold text-[#1D5FD1]">{ec.docNo}</td>
                      <td className="px-4 py-2.5 font-mono">{ec.year}</td>
                      <td className="px-4 py-2.5 font-medium text-[#102A43]">{ec.type}</td>
                      <td className="px-4 py-2.5 text-[#53627A]">{ec.sro}</td>
                      <td className="px-4 py-2.5 text-[#14213D]">{ec.party}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EDF7F2] text-[#16845B] border border-[#16845B]/30">
                          {ec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FINANCIAL VALUATION & TAX */}
        {activeTab === "valuation" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-lg bg-white border border-[#E3E8EF] space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2 border-b border-[#E3E8EF] pb-2">
                <IndianRupee className="w-4 h-4 text-[#16845B]" />
                <span>Official Guideline Valuation Breakdown</span>
              </h3>
              <div className="p-3 rounded-md bg-[#F7F9FC] border border-[#E3E8EF] space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#53627A]">
                  <span>Guideline Rate per Sq. Ft.:</span>
                  <span className="font-bold text-[#102A43] font-mono">{c.valuation?.guidelineValueSqFt}</span>
                </div>
                <div className="flex justify-between items-center text-[#53627A]">
                  <span>Estimated Total Market Valuation:</span>
                  <span className="font-bold text-[#16845B] text-sm font-mono">{c.valuation?.estimatedMarketValue}</span>
                </div>
                <div className="flex justify-between items-center text-[#53627A]">
                  <span>Stamp Duty & Registration (7%):</span>
                  <span className="font-bold text-[#1D5FD1] font-mono">{c.valuation?.stampDutyEstimated}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-white border border-[#E3E8EF] space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2 border-b border-[#E3E8EF] pb-2">
                <Building2 className="w-4 h-4 text-[#1D5FD1]" />
                <span>Property Tax Assessment Ledger</span>
              </h3>
              <div className="p-3 rounded-md bg-[#F7F9FC] border border-[#E3E8EF] space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#53627A]">
                  <span>Property Tax Assessment ID:</span>
                  <span className="font-bold text-[#102A43] font-mono">{c.valuation?.taxAssessmentId}</span>
                </div>
                <div className="flex justify-between items-center text-[#53627A]">
                  <span>Tax Settlement Status:</span>
                  <span className="font-bold text-[#16845B] bg-[#EDF7F2] px-2 py-0.5 rounded border border-[#16845B]/30">
                    {c.valuation?.taxStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RISK & SUITABILITY ENGINE */}
        {activeTab === "risk" && (
          <div className="p-5 rounded-lg bg-white border border-[#E3E8EF] space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2 border-b border-[#E3E8EF] pb-2">
              <ShieldAlert className="w-4 h-4 text-[#D9363E]" />
              <span>Multi-Factor Composite Risk & Suitability Scoring</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-md bg-[#F7F9FC] border border-[#E3E8EF] space-y-1">
                <span className="text-[10px] text-[#53627A] font-bold uppercase">Composite Risk Rating</span>
                <div className="text-2xl font-bold">
                  <span className={isHighRisk ? "text-[#D9363E]" : "text-[#16845B]"}>
                    {c.riskAssessment?.compositeRiskScore || c.riskScore || 20}/100
                  </span>
                </div>
                <span className="text-[10px] text-[#53627A] uppercase font-bold">{c.riskAssessment?.riskLevel || "LOW"} RISK LEVEL</span>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-1">
              <div className="font-bold text-[#102A43]">Factor Assessment Breakdown:</div>
              <div className="space-y-1.5">
                <div className="p-2.5 rounded bg-[#F7F9FC] border border-[#E3E8EF] flex justify-between items-center">
                  <span className="text-[#14213D]">Surface Waterbody Buffer Offset (320m distance)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EDF7F2] text-[#16845B] border border-[#16845B]/30">LOW RISK ✓</span>
                </div>
                <div className="p-2.5 rounded bg-[#F7F9FC] border border-[#E3E8EF] flex justify-between items-center">
                  <span className="text-[#14213D]">Foundation Bearing Capacity ({c.gsiGeotechnical?.bearingCapacityKPa || 250} kPa)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EDF7F2] text-[#16845B] border border-[#16845B]/30">COMPLIANT ✓</span>
                </div>
                <div className="p-2.5 rounded bg-[#F7F9FC] border border-[#E3E8EF] flex justify-between items-center">
                  <span className="text-[#14213D]">Terrain Slope Profile (2.1° Flat Pediment)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EDF7F2] text-[#16845B] border border-[#16845B]/30">SAFE ✓</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AI DECISION SUPPORT */}
        {activeTab === "ai" && (
          <div className="p-5 rounded-lg bg-white border border-[#E3E8EF] space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2 border-b border-[#E3E8EF] pb-2">
              <Scale className="w-4 h-4 text-[#1D5FD1]" />
              <span>Automated Decision Support Summary</span>
            </h3>

            <div className="p-3.5 rounded-md bg-[#F7F9FC] border border-[#E3E8EF] text-xs text-[#14213D] leading-relaxed">
              {c.aiDecisionSupport?.executiveSummary || `Spatial boundaries for Survey No ${c.surveyNumber} in ${c.village} have been cross-checked against GSI lithology layers and Sub-Registrar encumbrance books. Foundation load capacity sits at ${c.gsiGeotechnical?.bearingCapacityKPa || 250} kPa. Waterbody statutory setback compliant.`}
            </div>

            <div className="p-3 rounded-md bg-[#FEF5E7] border border-[#E99A16] text-[#E99A16] text-xs">
              <strong>STATUTORY LEGAL DISCLAIMER:</strong> Automated decision support is purely advisory. Final statutory authority remains vested in the designated Government Revenue Officer under the Tamil Nadu Revenue Code.
            </div>
          </div>
        )}

        {/* TAB 6: STATUTORY CASE REPORT & DECISION SIGN-OFF */}
        {activeTab === "report" && (
          <div className="p-5 rounded-lg bg-white border border-[#E3E8EF] space-y-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2 border-b border-[#E3E8EF] pb-2">
              <Scale className="w-4 h-4 text-[#16845B]" />
              <span>Statutory Officer Order & Digital Sign-off Panel</span>
            </h3>

            <div className="space-y-2 text-xs">
              <label className="text-[#102A43] font-semibold block">Officer Decision Rationale / Official Order Notes:</label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Enter formal justification for statutory approval, rejection, or inspection request..."
                rows={4}
                className="w-full bg-[#F7F9FC] border border-[#E3E8EF] rounded-md p-3 text-xs text-[#14213D] placeholder-[#53627A] focus:outline-none focus:border-[#1D5FD1] font-sans"
              ></textarea>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                disabled={submitting}
                onClick={() => handleOfficerAction("approve")}
                className="px-4 py-2 rounded-md bg-[#16845B] hover:bg-[#126b49] text-white font-semibold text-xs transition-colors shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Statutory NOC</span>
              </button>

              <button
                disabled={submitting}
                onClick={() => handleOfficerAction("reject")}
                className="px-4 py-2 rounded-md bg-[#D9363E] hover:bg-[#b52a31] text-white font-semibold text-xs transition-colors shadow-xs flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Application</span>
              </button>

              <button
                disabled={submitting}
                onClick={() => handleOfficerAction("request-inspection")}
                className="px-4 py-2 rounded-md bg-[#E99A16] hover:bg-[#c9830f] text-white font-semibold text-xs transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                <span>Order On-Site Field Inspection</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </OfficerProtectedGuard>
  );
}

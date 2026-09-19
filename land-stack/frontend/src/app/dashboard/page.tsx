"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  MapPin, 
  UserCheck, 
  Landmark, 
  ShieldCheck, 
  Activity, 
  ArrowRight, 
  Search, 
  IndianRupee, 
  Layers, 
  Building2 
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";
import { fetchCasesList } from "@/services/landCasesService";
import { getDepartmentConfig } from "@/config/departmentDashboardConfig";
import DepartmentTimeline from "@/components/DepartmentTimeline";
import OfficerProtectedGuard from "@/components/OfficerProtectedGuard";

export default function OfficerDashboardPage() {
  const { officer } = useOfficerAuth();
  const deptProfile = getDepartmentConfig(officer?.role || officer?.title || 'REVENUE');

  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    underVerification: 0,
    inspectionsPending: 0,
    approved: 0,
    rejected: 0
  });

  const [summary, setSummary] = useState({
    totalLandAreaAcres: 0,
    totalValuationCrores: 0,
    riskBreakdown: { high: 0, moderate: 0, low: 0 }
  });

  const [casesList, setCasesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const [currentTime, setCurrentTime] = useState({
    date: "Wednesday, 16 September 2026",
    time: "12:25 PM"
  });

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
      setCurrentTime({ date: dateStr, time: timeStr });
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("landstack_officer_token") : null;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/dashboard`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          if (data.metrics) {
            setMetrics(data.metrics);
          }
          if (data.analyticsSummary) {
            setSummary(data.analyticsSummary);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch dashboard metrics from backend:", err);
      }

      try {
        const fetchedCases = await fetchCasesList();
        setCasesList(fetchedCases);
        if (fetchedCases.length > 0) {
          setSelectedCase(fetchedCases[0]);
        }
      } catch (err) {
        console.warn("Failed to fetch cases list:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleDepartmentAction = async (actionCode: string, label: string) => {
    if (!selectedCase) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("landstack_officer_token") : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/cases/${selectedCase.id}/department-review`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          departmentCode: deptProfile.departmentCode,
          verdict: actionCode.includes('REJECT') ? 'REJECTED' : actionCode.includes('CONDITIONAL') ? 'CONDITIONAL' : 'APPROVED',
          actionCode,
          remarks: `${deptProfile.departmentName} verdict submitted: ${label}`
        })
      });

      if (res.ok) {
        setActionSuccessMsg(`Action '${label}' submitted successfully for ${selectedCase.caseNumber}`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.warn("Action submission error:", err);
    }
  };

  const filteredCases = casesList.filter((c) => {
    if (deptProfile.gisOverlayFilter?.requiredIntersection === 'forest') {
      const isForest = (c.landClassification || '').toLowerCase().includes('reserve') || (c.title || '').toLowerCase().includes('eco');
      if (!isForest) return false;
    }
    if (deptProfile.gisOverlayFilter?.requiredIntersection === 'water_bodies') {
      const isWater = (c.title || '').toLowerCase().includes('water') || c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL';
      if (!isWater) return false;
    }

    const matchesSearch = 
      (c.caseNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.village || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.surveyNumber || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <OfficerProtectedGuard>
      <div className="max-w-7xl mx-auto px-6 py-7 sm:px-8 space-y-6 font-sans antialiased pb-20">
        {/* ================================================================= */}
        {/* WELCOME / HEADER SECTION (LEFT: OFFICER DETAILS, RIGHT: STATUS)   */}
        {/* ================================================================= */}
        <section className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E8EF]">
          {/* LEFT: GREETING, OFFICER DETAILS, POLICY MOTTO */}
          <div className="flex flex-col justify-center space-y-2 max-w-2xl">
            <div>
              <span className="text-xs sm:text-sm font-semibold text-[#53627A] tracking-wide block">
                Good Morning,
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14213D] tracking-tight leading-tight pt-1">
                {officer?.name || "Thiru K. Muthusamy, IAS"}
              </h1>
              <div className="text-xs sm:text-sm text-[#53627A] font-medium pt-1.5 leading-snug">
                <div>{officer?.title || "District Collector & District Magistrate"}</div>
                <div className="text-[#14213D] font-semibold pt-0.5">
                  {officer?.district ? `${officer.district} District` : "Kanchipuram District"}
                </div>
              </div>
            </div>

            <div className="text-xs sm:text-[13px] text-[#53627A] font-medium leading-relaxed italic border-l-2 border-[#1D5FD1] pl-3">
              &ldquo;Transparent land records. Stronger communities. A prosperous Tamil Nadu.&rdquo;
            </div>
          </div>

          {/* RIGHT: OPERATIONAL INFORMATION (DATE, TIME, SYSTEM STATUS) */}
          <div className="flex flex-col items-start sm:items-end justify-center space-y-1 sm:text-right shrink-0">
            <div className="text-xs sm:text-sm font-semibold text-[#14213D]">
              {currentTime.date}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#14213D] font-mono tracking-tight leading-none">
              {currentTime.time}
            </div>
            <Link 
              href="/integration"
              title="View Connected Government Systems (DPI Interoperability)"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#16845B] hover:text-[#126b49] pt-0.5 group transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#16845B] animate-pulse"></span>
              <span className="group-hover:underline">System Operational</span>
            </Link>
          </div>
        </section>

        {/* DEPARTMENT IDENTITY & GIS FILTER BANNER */}
        <div className="bg-white border border-[#E3E8EF] p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF]">
                {deptProfile.departmentCode}
              </span>
              <h2 className="text-sm font-bold text-[#102A43]">{deptProfile.departmentName}</h2>
            </div>
            <div className="text-xs text-[#53627A]">
              Sub-Units: <span className="text-[#14213D] font-medium">{deptProfile.subUnits.join(' • ')}</span>
            </div>
            <div className="text-[11px] text-[#1D5FD1] font-mono pt-0.5">
              Routing Rule: {deptProfile.gisOverlayFilter?.description}
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[#53627A]">Designated Role:</span>
            <span className="bg-[#F7F9FC] px-2.5 py-1 rounded border border-[#E3E8EF] font-mono font-bold text-[#102A43]">
              {officer?.role || 'DISTRICT_COLLECTOR'}
            </span>
          </div>
        </div>

        {/* FINANCIAL & SPATIAL SUMMARY KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E3E8EF] p-4 rounded-lg flex items-center space-x-3 shadow-xs">
            <div className="p-2.5 rounded bg-[#F1F5FB] border border-[#E3E8EF] text-[#1D5FD1]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#53627A] font-semibold">Total Jurisdiction Cases</div>
              <div className="text-xl font-bold text-[#102A43]">{metrics.total || casesList.length} Files</div>
            </div>
          </div>

          <div className="bg-white border border-[#E3E8EF] p-4 rounded-lg flex items-center space-x-3 shadow-xs">
            <div className="p-2.5 rounded bg-[#EDF7F2] border border-[#16845B]/30 text-[#16845B]">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#53627A] font-semibold">Jurisdiction Valuation</div>
              <div className="text-xl font-bold text-[#16845B]">₹ {(summary.totalValuationCrores || 1480.5).toLocaleString()} Cr</div>
            </div>
          </div>

          <div className="bg-white border border-[#E3E8EF] p-4 rounded-lg flex items-center space-x-3 shadow-xs">
            <div className="p-2.5 rounded bg-[#FEF5E7] border border-[#E99A16]/30 text-[#E99A16]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#53627A] font-semibold">Total Land Extent</div>
              <div className="text-xl font-bold text-[#102A43]">{(summary.totalLandAreaAcres || 1250.4).toLocaleString()} Acres</div>
            </div>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-lg bg-white border border-[#E3E8EF] space-y-1 shadow-xs">
            <div className="text-xs text-[#53627A] font-semibold flex items-center justify-between">
              <span>Total Files</span>
              <FileText className="w-3.5 h-3.5 text-[#1D5FD1]" />
            </div>
            <div className="text-2xl font-bold text-[#102A43]">{metrics.total || casesList.length}</div>
            <div className="text-[10px] text-[#53627A]">In jurisdiction</div>
          </div>

          <div className="p-3.5 rounded-lg bg-white border border-[#E3E8EF] space-y-1 shadow-xs">
            <div className="text-xs text-[#53627A] font-semibold flex items-center justify-between">
              <span>Pending Review</span>
              <Clock className="w-3.5 h-3.5 text-[#E99A16]" />
            </div>
            <div className="text-2xl font-bold text-[#E99A16]">{metrics.pending}</div>
            <div className="text-[10px] text-[#E99A16]">Action required</div>
          </div>

          <div className="p-3.5 rounded-lg bg-white border border-[#E3E8EF] space-y-1 shadow-xs">
            <div className="text-xs text-[#53627A] font-semibold flex items-center justify-between">
              <span>GIS Verification</span>
              <Activity className="w-3.5 h-3.5 text-[#1D5FD1]" />
            </div>
            <div className="text-2xl font-bold text-[#1D5FD1]">{metrics.underVerification}</div>
            <div className="text-[10px] text-[#53627A]">Processing</div>
          </div>

          <div className="p-3.5 rounded-lg bg-white border border-[#E3E8EF] space-y-1 shadow-xs">
            <div className="text-xs text-[#53627A] font-semibold flex items-center justify-between">
              <span>Inspections</span>
              <MapPin className="w-3.5 h-3.5 text-[#102A43]" />
            </div>
            <div className="text-2xl font-bold text-[#102A43]">{metrics.inspectionsPending}</div>
            <div className="text-[10px] text-[#53627A]">Field visit pending</div>
          </div>

          <div className="p-3.5 rounded-lg bg-white border border-[#E3E8EF] space-y-1 shadow-xs">
            <div className="text-xs text-[#53627A] font-semibold flex items-center justify-between">
              <span>Approved</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16845B]" />
            </div>
            <div className="text-2xl font-bold text-[#16845B]">{metrics.approved}</div>
            <div className="text-[10px] text-[#16845B]">Clearance issued</div>
          </div>

          <div className="p-3.5 rounded-lg bg-white border border-[#E3E8EF] space-y-1 shadow-xs">
            <div className="text-xs text-[#53627A] font-semibold flex items-center justify-between">
              <span>Rejected</span>
              <XCircle className="w-3.5 h-3.5 text-[#D9363E]" />
            </div>
            <div className="text-2xl font-bold text-[#D9363E]">{metrics.rejected}</div>
            <div className="text-[10px] text-[#D9363E]">Non-compliant</div>
          </div>
        </div>

        {/* RECENT CASES TABLE (48-54px row height) */}
        <div className="bg-white border border-[#E3E8EF] rounded-lg p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E8EF] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1D5FD1]" />
                <span>Active Land Cases & Registry Entries ({filteredCases.length})</span>
              </h3>
              <p className="text-xs text-[#53627A]">Real-time land conversion, NOC clearances, and survey demarcation files</p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 text-[#53627A] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search case, S.No, village..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-[#F7F9FC] border border-[#E3E8EF] rounded text-xs text-[#14213D] placeholder-[#53627A] focus:outline-none focus:border-[#1D5FD1] w-48 sm:w-60"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#F7F9FC] border border-[#E3E8EF] text-xs text-[#14213D] px-2.5 py-1.5 rounded focus:outline-none focus:border-[#1D5FD1]"
              >
                <option value="ALL">All Statuses</option>
                <option value="OFFICER_REVIEW">Officer Review</option>
                <option value="FIELD_INSPECTION">Field Inspection</option>
                <option value="DOCUMENT_VERIFICATION">Doc Verification</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <Link href="/officer/cases" className="text-xs text-[#1D5FD1] font-semibold hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F4F8] text-[#53627A] font-bold uppercase tracking-wider border-b border-[#E3E8EF]">
                <tr>
                  <th className="px-4 py-3">Case ID</th>
                  <th className="px-4 py-3">Case Title & Type</th>
                  <th className="px-4 py-3">District & Village</th>
                  <th className="px-4 py-3">Land Area</th>
                  <th className="px-4 py-3">Valuation</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8EF] text-[#14213D]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[#53627A]">
                      Loading real-time jurisdiction land cases...
                    </td>
                  </tr>
                ) : filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[#53627A]">
                      No cases found matching search filter.
                    </td>
                  </tr>
                ) : (
                  filteredCases.slice(0, 15).map((c) => (
                    <tr key={c.id} className="hover:bg-[#F8FAFD] transition-colors h-[50px]">
                      <td className="px-4 py-3 font-mono font-bold text-[#1D5FD1]">{c.caseNumber || c.caseNo}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#102A43]">{c.title}</div>
                        <div className="text-[10px] text-[#53627A]">{c.caseType || c.type}</div>
                      </td>
                      <td className="px-4 py-3 text-[#53627A]">
                        <div className="font-semibold text-[#102A43]">{c.district}</div>
                        <div className="text-[10px]">{c.village}</div>
                      </td>
                      <td className="px-4 py-3 text-[#14213D] font-mono">{c.areaAcres ? `${c.areaAcres} Acres` : c.area}</td>
                      <td className="px-4 py-3 text-[#16845B] font-mono font-bold">
                        {c.estimatedMarketValue || c.valuation?.estimatedMarketValue || "₹ 2.40 Cr"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          c.priority === 'URGENT' || c.priority === 'HIGH' || c.priority === 'CRITICAL' 
                            ? 'bg-[#FDEDEE] text-[#D9363E] border-[#D9363E]/30' 
                            : 'bg-[#F7F9FC] text-[#53627A] border-[#E3E8EF]'
                        }`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF] uppercase">
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedCase(c)}
                          className="px-3 py-1 rounded bg-[#1D5FD1] hover:bg-[#154CB0] text-white font-semibold text-xs transition-colors"
                        >
                          Inspect Case →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SELECTED CASE DEPARTMENTAL INSPECTION & UNIFIED TIMELINE */}
        {selectedCase && (
          <div className="bg-white border border-[#E3E8EF] rounded-lg p-5 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E8EF] pb-3">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF]">
                    {deptProfile.departmentCode} INSPECTION
                  </span>
                  <span className="font-mono text-xs text-[#16845B] font-bold">{selectedCase.caseNumber || selectedCase.caseNo}</span>
                </div>
                <h3 className="text-base font-bold text-[#102A43]">{selectedCase.title}</h3>
                <p className="text-xs text-[#53627A]">
                  Location: <strong className="text-[#102A43]">{selectedCase.surveyNumber} ({selectedCase.village}, {selectedCase.taluk}, {selectedCase.district})</strong>
                </p>
              </div>

              {actionSuccessMsg && (
                <div className="bg-[#EDF7F2] border border-[#16845B] text-[#16845B] text-xs px-3 py-2 rounded-md flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* DEPARTMENT-SPECIFIC AUDIT & REVIEW PARAMETERS */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#53627A] uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-[#1D5FD1]" />
                <span>{deptProfile.departmentName} — Audit & Review Parameters</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {deptProfile.departmentCode === 'REVENUE' && (
                  <>
                    <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                      <span className="text-[10px] text-[#53627A] block font-semibold">Patta Number</span>
                      <span className="font-mono text-[#16845B] font-bold">{selectedCase.pattaNumber || 'PATTA-2026-TN-991'}</span>
                    </div>
                    <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                      <span className="text-[10px] text-[#53627A] block font-semibold">Land Classification</span>
                      <span className="font-bold text-[#102A43]">{selectedCase.landClassification || 'Ryotwari Nanjai (Wet)'}</span>
                    </div>
                    <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                      <span className="text-[10px] text-[#53627A] block font-semibold">FMB Demarcation</span>
                      <span className="font-bold text-[#16845B] font-mono">DGPS Verified (0.02m accuracy)</span>
                    </div>
                  </>
                )}

                {deptProfile.departmentCode === 'REGISTRATION' && (
                  <>
                    <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                      <span className="text-[10px] text-[#53627A] block font-semibold">Encumbrance Status (13-Yr Ledger)</span>
                      <span className="font-mono text-[#16845B] font-bold">Nil Encumbrance (Clean Title)</span>
                    </div>
                    <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                      <span className="text-[10px] text-[#53627A] block font-semibold">TN Reginet Guideline Value</span>
                      <span className="font-bold text-[#1D5FD1] font-mono">{selectedCase.guidelineValue || '₹ 1,850 / sq.ft'}</span>
                    </div>
                    <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                      <span className="text-[10px] text-[#53627A] block font-semibold">Sub-Registrar Office</span>
                      <span className="font-bold text-[#102A43]">SRO {selectedCase.taluk}</span>
                    </div>
                  </>
                )}

                {deptProfile.departmentCode !== 'REVENUE' && deptProfile.departmentCode !== 'REGISTRATION' && (
                  <>
                    <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                      <span className="text-[10px] text-[#53627A] block font-semibold">Master Plan Category</span>
                      <span className="font-bold text-[#1D5FD1]">{selectedCase.landClassification || 'Industrial SIPCOT Zone'}</span>
                    </div>
                    <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                      <span className="text-[10px] text-[#53627A] block font-semibold">Permissible FSI Limit</span>
                      <span className="font-mono text-[#16845B] font-bold">1.75 FSI (DTCP Approved)</span>
                    </div>
                    <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                      <span className="text-[10px] text-[#53627A] block font-semibold">Max Building Height</span>
                      <span className="font-mono text-[#102A43] font-bold">18.0 Meters</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* DEPARTMENTAL VERDICT ACTION BUTTONS */}
            <div className="space-y-2 border-t border-[#E3E8EF] pt-4">
              <h4 className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
                {deptProfile.departmentName} — Statutory Verdict Actions
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {deptProfile.allowedActions.map((action: any) => (
                  <button
                    key={action.actionCode}
                    onClick={() => handleDepartmentAction(action.actionCode, action.label)}
                    className="px-4 py-2 rounded-md bg-[#1D5FD1] hover:bg-[#154CB0] text-white font-semibold text-xs transition-colors shadow-2xs"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* UNIFIED INTER-DEPARTMENTAL TIMELINE */}
            <div className="border-t border-[#E3E8EF] pt-4">
              <DepartmentTimeline caseId={selectedCase.id} />
            </div>
          </div>
        )}
      </div>
    </OfficerProtectedGuard>
  );
}

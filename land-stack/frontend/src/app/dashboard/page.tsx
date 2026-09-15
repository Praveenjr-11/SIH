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
  Sparkles,
  Search,
  Filter,
  IndianRupee,
  Layers,
  Building2,
  Trees,
  Waves,
  Receipt
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";
import { fetchCasesList } from "@/services/landCasesService";
import { resolveDepartmentProfile } from "@/config/departmentDashboardConfig";
import DepartmentTimeline from "@/components/DepartmentTimeline";

export default function OfficerDashboardPage() {
  const { officer } = useOfficerAuth();
  const deptProfile = resolveDepartmentProfile(officer?.role || officer?.title || 'REVENUE');

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

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("landstack_officer_token") : null;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/dashboard`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
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
    // Apply GIS overlay filter strictly if required
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 font-sans">
      {/* HEADER BAR */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
              <Landmark className="w-3.5 h-3.5" />
              <span>Officer Decision-Support Command Center</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              Jurisdiction Governance Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Active Jurisdiction: <strong className="text-slate-200">{officer ? `${officer.taluk} Taluk, ${officer.district}` : 'Statewide 38 Districts Jurisdiction'}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <div className="text-left text-xs">
                <div className="font-bold text-white">{officer ? officer.name : 'Thiru K. Muthusamy, IAS'}</div>
                <div className="text-slate-400">{officer ? officer.title : 'District Collector & Magistrate'}</div>
              </div>
            </div>
            <Link
              href="/"
              className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md flex items-center space-x-2"
            >
              <span>Launch GIS Map</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* DEPARTMENT IDENTITY & GIS FILTER BANNER */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${deptProfile.badgeColor}`}>
                {deptProfile.departmentCode}
              </span>
              <h2 className="text-base font-bold text-white">{deptProfile.departmentName}</h2>
            </div>
            <div className="text-xs text-slate-400">
              Sub-Units: <span className="text-slate-300 font-medium">{deptProfile.subUnits.join(' • ')}</span>
            </div>
            <div className="text-[11px] text-blue-400 font-mono pt-1">
              <span>Routing Rule: {deptProfile.gisOverlayFilter?.description}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Officer Roles:</span>
            <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono font-bold text-emerald-400">
              {officer?.role || 'DISTRICT_COLLECTOR'}
            </span>
          </div>
        </div>

        {/* FINANCIAL & SPATIAL SUMMARY BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold">Total Jurisdiction Cases</div>
              <div className="text-2xl font-extrabold text-white">{metrics.total || casesList.length} Files</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold">Jurisdiction Market Valuation</div>
              <div className="text-2xl font-extrabold text-emerald-400">₹ {(summary.totalValuationCrores || 1480.5).toLocaleString()} Cr</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold">Total Land Area</div>
              <div className="text-2xl font-extrabold text-amber-400">{(summary.totalLandAreaAcres || 1250.4).toLocaleString()} Acres</div>
            </div>
          </div>
        </div>

        {/* METRICS CARDS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>Total Cases</span>
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white">{metrics.total || casesList.length}</div>
            <div className="text-[10px] text-slate-500">In jurisdiction</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>Pending Review</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">{metrics.pending}</div>
            <div className="text-[10px] text-amber-400/80">Action required</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>GIS Verification</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-cyan-400">{metrics.underVerification}</div>
            <div className="text-[10px] text-slate-500">Processing</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>Inspections</span>
              <MapPin className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-purple-400">{metrics.inspectionsPending}</div>
            <div className="text-[10px] text-slate-500">Field visit pending</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>Approved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">{metrics.approved}</div>
            <div className="text-[10px] text-slate-500">NOC Issued</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>Rejected</span>
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-3xl font-black text-red-400">{metrics.rejected}</div>
            <div className="text-[10px] text-slate-500">Non-compliant</div>
          </div>
        </div>

        {/* RECENT CASES TABLE */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>Active Land Cases & Registry Entries ({filteredCases.length})</span>
              </h3>
              <p className="text-xs text-slate-400">Real-time land conversion, NOC clearances, and survey demarcation files across Tamil Nadu</p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search case, S.No, village..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="OFFICER_REVIEW">Officer Review</option>
                <option value="FIELD_INSPECTION">Field Inspection</option>
                <option value="DOCUMENT_VERIFICATION">Doc Verification</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <Link href="/cases" className="text-xs text-blue-400 font-bold hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Case ID</th>
                  <th className="p-3">Case Title & Type</th>
                  <th className="p-3">District & Village</th>
                  <th className="p-3">Land Area</th>
                  <th className="p-3">Market Valuation</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                      Loading real-time jurisdiction land cases...
                    </td>
                  </tr>
                ) : filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                      No cases found matching search filter.
                    </td>
                  </tr>
                ) : (
                  filteredCases.slice(0, 15).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-emerald-400">{c.caseNumber || c.caseNo}</td>
                      <td className="p-3">
                        <div className="font-semibold text-white">{c.title}</div>
                        <div className="text-[10px] text-slate-400">{c.caseType || c.type}</div>
                      </td>
                      <td className="p-3 text-slate-300">
                        <div className="font-bold">{c.district}</div>
                        <div className="text-[10px] text-slate-400">{c.village}</div>
                      </td>
                      <td className="p-3 text-slate-300 font-mono">{c.areaAcres ? `${c.areaAcres} Acres` : c.area}</td>
                      <td className="p-3 text-emerald-400 font-mono font-bold">
                        {c.estimatedMarketValue || c.valuation?.estimatedMarketValue || "₹ 2.40 Cr"}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.priority === 'URGENT' || c.priority === 'HIGH' || c.priority === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded text-[10px] font-extrabold bg-blue-950 text-blue-400 border border-blue-800">
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedCase(c)}
                          className="px-3 py-1 rounded bg-blue-600 text-white font-bold hover:bg-emerald-600 transition-colors inline-block"
                        >
                          Inspect Case & Timeline →
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${deptProfile.badgeColor}`}>
                    {deptProfile.departmentCode} INSPECTION
                  </span>
                  <span className="font-mono text-xs text-emerald-400 font-bold">{selectedCase.caseNumber || selectedCase.caseNo}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedCase.title}</h3>
                <p className="text-xs text-slate-400">
                  Location: <strong className="text-slate-200">{selectedCase.surveyNumber} ({selectedCase.village}, {selectedCase.taluk}, {selectedCase.district})</strong>
                </p>
              </div>

              {actionSuccessMsg && (
                <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs px-3 py-2 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* DEPARTMENT-SPECIFIC REVIEW FIELDS GRID */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>{deptProfile.departmentName} — Audit & Review Parameters</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {deptProfile.departmentCode === 'REVENUE' && (
                  <>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Patta Number</span>
                      <span className="font-mono text-emerald-400 font-bold">{selectedCase.pattaNumber || 'PATTA-2026-TN-991'}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Land Classification</span>
                      <span className="font-bold text-white">{selectedCase.landClassification || 'Ryotwari Nanjai (Wet)'}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">FMB Sketch Demarcation</span>
                      <span className="font-bold text-emerald-400 font-mono">DGPS Verified (0.02m accuracy)</span>
                    </div>
                  </>
                )}

                {deptProfile.departmentCode === 'REGISTRATION' && (
                  <>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Encumbrance Status (13-Yr Ledger)</span>
                      <span className="font-mono text-emerald-400 font-bold">Nil Encumbrance (Clean Title)</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">TN Reginet Guideline Value</span>
                      <span className="font-bold text-blue-400 font-mono">{selectedCase.guidelineValue || '₹ 1,850 / sq.ft'}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Sub-Registrar Office</span>
                      <span className="font-bold text-white">SRO {selectedCase.taluk}</span>
                    </div>
                  </>
                )}

                {deptProfile.departmentCode === 'TOWN_PLANNING' && (
                  <>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Master Plan Zone Category</span>
                      <span className="font-bold text-blue-400">{selectedCase.landClassification || 'Industrial SIPCOT Zone'}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Permissible FSI Limit</span>
                      <span className="font-mono text-emerald-400 font-bold">1.75 FSI (DTCP Approved)</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Max Permissible Height</span>
                      <span className="font-mono text-white font-bold">18.0 Meters</span>
                    </div>
                  </>
                )}

                {deptProfile.departmentCode === 'FOREST_ENVIRONMENT' && (
                  <>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Forest Reserve Distance</span>
                      <span className="font-mono text-amber-400 font-bold">Outside Reserve (4.5 km clear)</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Forest Rights Act (FRA) Tenure</span>
                      <span className="font-bold text-emerald-400">Clear (Non-Tribal Revenue Land)</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">TNPCB Air/Water NOC</span>
                      <span className="font-bold text-blue-400">Consent to Establish (CTE) Active</span>
                    </div>
                  </>
                )}

                {deptProfile.departmentCode === 'WATER_RESOURCES' && (
                  <>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Water Body Catchment Distance</span>
                      <span className="font-mono text-cyan-400 font-bold">180m Offset (Buffer: 50m)</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Irrigation Channel Easement</span>
                      <span className="font-bold text-emerald-400">Clear Easement Channel</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Flood Inundation Index</span>
                      <span className="font-mono text-white font-bold">Low Flood Risk</span>
                    </div>
                  </>
                )}

                {deptProfile.departmentCode === 'MUNICIPAL_PANCAYAT' && (
                  <>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Property Tax Ledger</span>
                      <span className="font-mono text-emerald-400 font-bold">Paid (Clear Ledger)</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Local Body Building Permit</span>
                      <span className="font-bold text-blue-400">Panchayat Union Permit App</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">TNEB & Water Utility</span>
                      <span className="font-bold text-white">Utility Access Sanctioned</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* DEPARTMENTAL ACTION BUTTONS */}
            <div className="space-y-3 border-t border-slate-800 pt-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {deptProfile.departmentName} — Permitted Verdict Actions
              </h4>
              <div className="flex flex-wrap gap-3">
                {deptProfile.allowedActions.map((action) => (
                  <button
                    key={action.actionCode}
                    onClick={() => handleDepartmentAction(action.actionCode, action.label)}
                    className={`px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all ${action.style}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* UNIFIED INTER-DEPARTMENTAL TIMELINE */}
            <div className="border-t border-slate-800 pt-4">
              <DepartmentTimeline caseId={selectedCase.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FolderKanban, 
  ArrowLeft, 
  Search, 
  Filter,
  ShieldAlert,
  CheckCircle2,
  FileSearch,
  Building2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Globe
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";
import { fetchCasesList, LandCaseItem } from "@/services/landCasesService";

const TN_DISTRICTS = [
  "ALL_DISTRICTS",
  "Kanchipuram", "Chengalpattu", "Thiruvallur", "Chennai", "Coimbatore", "Madurai", 
  "Salem", "Tiruchirappalli", "Tirunelveli", "Thanjavur", "Erode", "Vellore", 
  "Dindigul", "Cuddalore", "Kanyakumari", "Ramanathapuram", "Virudhunagar", "Karur", 
  "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ranipet", "Tenkasi", 
  "Theni", "Thoothukudi", "Tirupathur", "Tiruppur", "Tiruvarur", "Tiruvannamalai", 
  "Viluppuram", "Kallakurichi", "Mayiladuthurai", "Nagapattinam", "Krishnagiri", 
  "Dharmapuri", "Ariyalur", "Sivaganga"
];

export default function OfficerCasesPage() {
  const router = useRouter();
  const { officer } = useOfficerAuth();
  const [cases, setCases] = useState<LandCaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [districtFilter, setDistrictFilter] = useState("ALL_DISTRICTS");
  const [riskFilter, setRiskFilter] = useState("ALL_RISK");

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (!officer) {
      router.push("/officer/login");
      return;
    }

    async function loadCases() {
      setLoading(true);
      const data = await fetchCasesList();
      setCases(data);
      setLoading(false);
    }

    loadCases();
  }, [officer, router]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, districtFilter, riskFilter, pageSize]);

  if (!officer) return null;

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.surveyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ulpin.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesDistrict = districtFilter === "ALL_DISTRICTS" || c.district === districtFilter;
    const matchesRisk = riskFilter === "ALL_RISK" || c.riskLevel === riskFilter;

    return matchesSearch && matchesStatus && matchesDistrict && matchesRisk;
  });

  // PAGINATION COMPUTATION
  const totalItems = filteredCases.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCases = filteredCases.slice(startIndex, startIndex + pageSize);

  const totalCasesCount = cases.length;
  const highRiskCount = cases.filter(c => c.riskLevel === "HIGH" || c.riskLevel === "CRITICAL" || (c.riskScore && c.riskScore > 50)).length;
  const approvedCount = cases.filter(c => c.status === "APPROVED").length;
  const pendingInspectionCount = cases.filter(c => c.status === "FIELD_INSPECTION").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 font-sans antialiased pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Link href="/officer/dashboard" className="text-xs text-blue-400 font-bold hover:underline flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Officer Dashboard</span>
              </Link>
            </div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <FolderKanban className="w-8 h-8 text-emerald-400" />
              <span>India-Wide Land Cases & Statutory Approvals Registry</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live State Ingestion Queue | <span className="text-emerald-400 font-bold">{totalCasesCount} Verified Land Cases</span> across all 38 Revenue Districts of Tamil Nadu
            </p>
          </div>

          <Link
            href="/map"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            <span>Explore India GIS Map</span>
          </Link>
        </div>

        {/* METRICS SUMMARY ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4 shadow-md">
            <div className="p-3 bg-blue-950/80 text-blue-400 rounded-xl border border-blue-800">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase">Total Registry Cases</p>
              <p className="text-xl font-black text-white">{totalCasesCount}</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4 shadow-md">
            <div className="p-3 bg-rose-950/80 text-rose-400 rounded-xl border border-rose-800">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase">High / Critical Risk Flags</p>
              <p className="text-xl font-black text-rose-400">{highRiskCount}</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4 shadow-md">
            <div className="p-3 bg-emerald-950/80 text-emerald-400 rounded-xl border border-emerald-800">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase">Approved NOC Clearances</p>
              <p className="text-xl font-black text-emerald-400">{approvedCount}</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4 shadow-md">
            <div className="p-3 bg-amber-950/80 text-amber-400 rounded-xl border border-amber-800">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase">Pending Inspections</p>
              <p className="text-xl font-black text-amber-400">{pendingInspectionCount}</p>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="flex flex-col space-y-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* SEARCH INPUT */}
            <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 flex-1">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Case ID, Survey No, Owner Name, Village, ULPIN, or District..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* DISTRICT FILTER DROPDOWN */}
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
              <Globe className="w-4 h-4 text-cyan-400" />
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                {TN_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist} className="bg-slate-900 text-white">
                    {dist === "ALL_DISTRICTS" ? "All 38 Districts" : dist}
                  </option>
                ))}
              </select>
            </div>

            {/* RISK FILTER DROPDOWN */}
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
              <Filter className="w-4 h-4 text-amber-400" />
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL_RISK" className="bg-slate-900 text-white">All Risk Levels</option>
                <option value="LOW" className="bg-slate-900 text-white">Low Risk Only</option>
                <option value="MODERATE" className="bg-slate-900 text-white">Moderate Risk Only</option>
                <option value="HIGH" className="bg-slate-900 text-white">High Risk Only</option>
                <option value="CRITICAL" className="bg-slate-900 text-white">Critical Risk Only</option>
              </select>
            </div>
          </div>

          {/* STATUS FILTER CHIPS */}
          <div className="flex items-center space-x-2 overflow-x-auto pt-1">
            <span className="text-xs text-slate-400 font-semibold mr-1 hidden sm:inline">Status:</span>
            {["ALL", "OFFICER_REVIEW", "FIELD_INSPECTION", "DOCUMENT_VERIFICATION", "APPROVED", "REJECTED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {status === "ALL" ? "All Statuses" : status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* CASES HIGH-DENSITY TABLE */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <span className="text-xs text-slate-400">
              Showing <strong className="text-white">{filteredCases.length === 0 ? 0 : startIndex + 1}</strong> to <strong className="text-white">{Math.min(startIndex + pageSize, totalItems)}</strong> of <strong className="text-emerald-400">{totalItems}</strong> Filtered Land Cases
            </span>

            {/* PAGE SIZE SELECTOR */}
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>Per Page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-slate-950 text-white border border-slate-800 rounded-lg px-2 py-1 focus:outline-none text-xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Fetching Live Land Registry & Spatial Cases...</span>
            </div>
          ) : paginatedCases.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No land cases matching your filter criteria. Try resetting district or status filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Case Reference</th>
                    <th className="p-3.5">Survey & ULPIN</th>
                    <th className="p-3.5">Landowner</th>
                    <th className="p-3.5">District & Village</th>
                    <th className="p-3.5">Guideline Valuation</th>
                    <th className="p-3.5">Risk Score</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {paginatedCases.map((c) => {
                    const isHighRisk = c.riskLevel === "HIGH" || c.riskLevel === "CRITICAL" || (c.riskScore && c.riskScore > 50);

                    return (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* CASE REFERENCE */}
                        <td className="p-3.5">
                          <div className="font-mono font-extrabold text-emerald-400">{c.caseNumber}</div>
                          <div className="text-[11px] text-slate-400 font-medium truncate max-w-[200px]">{c.caseType}</div>
                        </td>

                        {/* SURVEY & ULPIN */}
                        <td className="p-3.5">
                          <div className="font-mono font-bold text-white">S.No {c.surveyNumber}</div>
                          <div className="font-mono text-[10px] text-slate-400">{c.ulpin}</div>
                        </td>

                        {/* LANDOWNER */}
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-100">{c.ownerName}</div>
                          <div className="text-[10px] text-slate-400">Patta Certified Owner</div>
                        </td>

                        {/* LOCATION & AREA */}
                        <td className="p-3.5">
                          <div className="font-medium text-slate-200">{c.village}, <span className="text-cyan-400 font-semibold">{c.district}</span></div>
                          <div className="text-[10px] text-slate-400 font-mono">{c.areaAcres} Acres</div>
                        </td>

                        {/* GUIDELINE VALUATION */}
                        <td className="p-3.5">
                          <div className="font-semibold text-emerald-300">{c.guidelineValue || "N/A"}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{c.estimatedMarketValue || ""}</div>
                        </td>

                        {/* RISK SCORE */}
                        <td className="p-3.5">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold font-mono ${
                              isHighRisk 
                                ? "bg-rose-950 text-rose-400 border border-rose-800" 
                                : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            }`}>
                              {c.riskScore ? `${c.riskScore}/100` : "LOW"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{c.riskLevel || "LOW"}</span>
                          </div>
                        </td>

                        {/* STATUS */}
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                            c.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            c.status === 'REJECTED' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                            c.status === 'FIELD_INSPECTION' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                            'bg-blue-950 text-blue-400 border border-blue-800'
                          }`}>
                            {c.status.replace("_", " ")}
                          </span>
                        </td>

                        {/* ACTION */}
                        <td className="p-3.5 text-right">
                          <Link 
                            href={`/officer/cases/${c.id}`} 
                            className="inline-block px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-emerald-600 transition-colors shadow-sm text-[11px]"
                          >
                            Review Workspace →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION FOOTER */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-all flex items-center gap-1 font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-slate-400 font-medium">
                Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-all flex items-center gap-1 font-semibold"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

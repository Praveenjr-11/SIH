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
      if (!officer) return;
      setLoading(true);
      const data = await fetchCasesList();
      
      const isStateLevel = officer.role === "SYSTEM_ADMIN" || officer.role === "STATE_OFFICER";
      const isDistrictLevel = ["DISTRICT_COLLECTOR", "DRO", "RDO", "SURVEY_OFFICER", "TOWN_PLANNER", "AD_SURVEY"].includes(officer.role);
      
      const authorizedCases = data.filter((c: any) => {
        if (isStateLevel) return true;
        if (isDistrictLevel) return c.district === officer.district;
        return c.district === officer.district && c.taluk === officer.taluk;
      });

      setCases(authorizedCases);
      
      if (!isStateLevel && officer.district) {
        setDistrictFilter(officer.district);
      }
      
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
    <div className="max-w-7xl mx-auto p-6 sm:p-10 space-y-6 font-sans antialiased pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Link href="/officer/dashboard" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Officer Dashboard</span>
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-8 h-8 text-blue-600" />
            <span>Land Cases & Statutory Approvals Registry</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Live State Ingestion Queue | <span className="text-emerald-700 font-bold">{totalCasesCount} Verified Land Cases</span> in your jurisdiction
          </p>
        </div>

        <Link
          href="/map"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          <span>Explore India GIS Map</span>
        </Link>
      </div>

      {/* METRICS SUMMARY ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center space-x-4 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">Total Registry Cases</p>
            <p className="text-xl font-black text-slate-900">{totalCasesCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center space-x-4 shadow-sm">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">High / Critical Risk Flags</p>
            <p className="text-xl font-black text-rose-600">{highRiskCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center space-x-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">Approved NOC Clearances</p>
            <p className="text-xl font-black text-emerald-600">{approvedCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center space-x-4 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
            <FileSearch className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">Pending Inspections</p>
            <p className="text-xl font-black text-amber-600">{pendingInspectionCount}</p>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="flex flex-col space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* SEARCH INPUT */}
          <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 flex-1 shadow-xs">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Case ID, Survey No, Owner Name, Village, ULPIN, or District..."
              className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* DISTRICT FILTER DROPDOWN */}
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs shadow-xs">
            <Globe className="w-4 h-4 text-blue-600" />
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              disabled={!(officer?.role === "SYSTEM_ADMIN" || officer?.role === "STATE_OFFICER")}
              className="bg-transparent text-xs text-slate-900 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {TN_DISTRICTS.map((dist) => (
                <option key={dist} value={dist} className="bg-white text-slate-900">
                  {dist === "ALL_DISTRICTS" ? "All 38 Districts" : dist}
                </option>
              ))}
            </select>
          </div>

          {/* RISK FILTER DROPDOWN */}
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs shadow-xs">
            <Filter className="w-4 h-4 text-amber-500" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL_RISK" className="bg-white text-slate-900">All Risk Levels</option>
              <option value="LOW" className="bg-white text-slate-900">Low Risk Only</option>
              <option value="MODERATE" className="bg-white text-slate-900">Moderate Risk Only</option>
              <option value="HIGH" className="bg-white text-slate-900">High Risk Only</option>
              <option value="CRITICAL" className="bg-white text-slate-900">Critical Risk Only</option>
            </select>
          </div>
        </div>

        {/* STATUS FILTER CHIPS */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-1">
          <span className="text-xs text-slate-500 font-semibold mr-1 hidden sm:inline">Status:</span>
          {["ALL", "OFFICER_REVIEW", "FIELD_INSPECTION", "DOCUMENT_VERIFICATION", "APPROVED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                statusFilter === status
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {status === "ALL" ? "All Statuses" : status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* CASES HIGH-DENSITY TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <span className="text-xs text-slate-500">
            Showing <strong className="text-slate-900">{filteredCases.length === 0 ? 0 : startIndex + 1}</strong> to <strong className="text-slate-900">{Math.min(startIndex + pageSize, totalItems)}</strong> of <strong className="text-blue-700">{totalItems}</strong> Filtered Land Cases
          </span>

          {/* PAGE SIZE SELECTOR */}
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Per Page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-slate-50 text-slate-900 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Fetching Live Land Registry & Spatial Cases...</span>
          </div>
        ) : paginatedCases.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No land cases matching your filter criteria. Try resetting district or status filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedCases.map((c) => {
                  const isHighRisk = c.riskLevel === "HIGH" || c.riskLevel === "CRITICAL" || (c.riskScore && c.riskScore > 50);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      {/* CASE REFERENCE */}
                      <td className="p-3.5">
                        <div className="font-mono font-extrabold text-emerald-700">{c.caseNumber}</div>
                        <div className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">{c.caseType}</div>
                      </td>

                      {/* SURVEY & ULPIN */}
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-900">S.No {c.surveyNumber}</div>
                        <div className="font-mono text-[10px] text-slate-500">{c.ulpin}</div>
                      </td>

                      {/* LANDOWNER */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{c.ownerName}</div>
                        <div className="text-[10px] text-slate-500">Patta Certified Owner</div>
                      </td>

                      {/* LOCATION & AREA */}
                      <td className="p-3.5">
                        <div className="font-medium text-slate-700">{c.village}, <span className="text-blue-700 font-semibold">{c.district}</span></div>
                        <div className="text-[10px] text-slate-500 font-mono">{c.areaAcres} Acres</div>
                      </td>

                      {/* GUIDELINE VALUATION */}
                      <td className="p-3.5">
                        <div className="font-semibold text-emerald-700">{c.guidelineValue || "N/A"}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{c.estimatedMarketValue || ""}</div>
                      </td>

                      {/* RISK SCORE */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold font-mono ${
                            isHighRisk 
                              ? "bg-rose-50 text-rose-700 border border-rose-200" 
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {c.riskScore ? `${c.riskScore}/100` : "LOW"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">{c.riskLevel || "LOW"}</span>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                          c.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          c.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          c.status === 'FIELD_INSPECTION' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {c.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="p-3.5 text-right">
                        <Link 
                          href={`/officer/cases/${c.id}`} 
                          className="inline-block px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm text-[11px]"
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
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center gap-1 font-semibold shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-slate-500 font-medium">
              Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center gap-1 font-semibold shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

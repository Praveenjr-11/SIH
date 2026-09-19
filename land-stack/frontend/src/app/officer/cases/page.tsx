"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Globe,
  ArrowRight,
  X,
  RotateCcw,
  Download,
  Plus,
  Copy,
  Check,
  Calendar,
  Layers,
  AlertTriangle,
  FileText
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";
import OfficerProtectedGuard from "@/components/OfficerProtectedGuard";
import StatusBadge from "@/components/StatusBadge";
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
  
  // SEARCH & FILTER STATE
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [districtFilter, setDistrictFilter] = useState("ALL_DISTRICTS");
  const [riskFilter, setRiskFilter] = useState("ALL_RISK");
  const [caseTypeFilter, setCaseTypeFilter] = useState("ALL_TYPES");
  const [dateFilter, setDateFilter] = useState("ALL_DATE");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // CLIPBOARD FEEDBACK
  const [copiedUlpin, setCopiedUlpin] = useState<string | null>(null);
  const [copiedCaseNo, setCopiedCaseNo] = useState<string | null>(null);

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
      try {
        const data = await fetchCasesList();
        
        const isStateLevel = officer.role === "SYSTEM_ADMIN" || officer.role === "STATE_OFFICER" || officer.role === "SUPER_ADMIN";
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
      } catch (err) {
        console.error("Failed to load land cases:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCases();
  }, [officer, router]);

  // RESET PAGE ON FILTER CHANGE
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, districtFilter, riskFilter, caseTypeFilter, dateFilter, customStartDate, customEndDate, pageSize]);

  // EXTRACT DYNAMIC CASE TYPES FROM DATASET
  const caseTypesList = useMemo(() => {
    const types = new Set<string>();
    cases.forEach(c => {
      if (c.caseType) types.add(c.caseType);
    });
    return Array.from(types).sort();
  }, [cases]);

  // ACTIVE FILTER COUNT & DETECTOR
  const isFiltered = useMemo(() => {
    const isStateLevel = officer?.role === "SYSTEM_ADMIN" || officer?.role === "STATE_OFFICER" || officer?.role === "SUPER_ADMIN";
    const defaultDistrict = isStateLevel ? "ALL_DISTRICTS" : (officer?.district || "ALL_DISTRICTS");
    return (
      searchTerm.trim() !== "" ||
      statusFilter !== "ALL" ||
      districtFilter !== defaultDistrict ||
      riskFilter !== "ALL_RISK" ||
      caseTypeFilter !== "ALL_TYPES" ||
      dateFilter !== "ALL_DATE" ||
      customStartDate !== "" ||
      customEndDate !== ""
    );
  }, [searchTerm, statusFilter, districtFilter, riskFilter, caseTypeFilter, dateFilter, customStartDate, customEndDate, officer]);

  // RESET ALL FILTERS
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    const isStateLevel = officer?.role === "SYSTEM_ADMIN" || officer?.role === "STATE_OFFICER" || officer?.role === "SUPER_ADMIN";
    setDistrictFilter(isStateLevel ? "ALL_DISTRICTS" : (officer?.district || "ALL_DISTRICTS"));
    setRiskFilter("ALL_RISK");
    setCaseTypeFilter("ALL_TYPES");
    setDateFilter("ALL_DATE");
    setCustomStartDate("");
    setCustomEndDate("");
    setCurrentPage(1);
  };

  // CLIPBOARD COPY
  const handleCopy = (text: string, type: "ulpin" | "caseNo") => {
    navigator.clipboard.writeText(text);
    if (type === "ulpin") {
      setCopiedUlpin(text);
      setTimeout(() => setCopiedUlpin(null), 2000);
    } else {
      setCopiedCaseNo(text);
      setTimeout(() => setCopiedCaseNo(null), 2000);
    }
  };

  // FILTER LOGIC
  const filteredCases = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return cases.filter(c => {
      // Search by Case ID, Survey No., Owner Name, Village, ULPIN or District
      if (q) {
        const matchCaseId = c.caseNumber?.toLowerCase().includes(q);
        const matchSurvey = c.surveyNumber?.toLowerCase().includes(q);
        const matchOwner = c.ownerName?.toLowerCase().includes(q);
        const matchVillage = c.village?.toLowerCase().includes(q);
        const matchUlpin = c.ulpin?.toLowerCase().includes(q);
        const matchDistrict = c.district?.toLowerCase().includes(q);
        const matchTaluk = c.taluk?.toLowerCase().includes(q);
        const matchType = c.caseType?.toLowerCase().includes(q);

        if (!matchCaseId && !matchSurvey && !matchOwner && !matchVillage && !matchUlpin && !matchDistrict && !matchTaluk && !matchType) {
          return false;
        }
      }

      // Filter: Status
      if (statusFilter !== "ALL") {
        if (c.status !== statusFilter) return false;
      }

      // Filter: District
      if (districtFilter !== "ALL_DISTRICTS") {
        if (c.district !== districtFilter) return false;
      }

      // Filter: Risk Level
      if (riskFilter !== "ALL_RISK") {
        if (riskFilter === "HIGH_CRITICAL") {
          const isHighOrCritical = c.riskLevel === "HIGH" || c.riskLevel === "CRITICAL" || (c.riskScore && c.riskScore > 50);
          if (!isHighOrCritical) return false;
        } else if (c.riskLevel !== riskFilter) {
          return false;
        }
      }

      // Filter: Case Type
      if (caseTypeFilter !== "ALL_TYPES") {
        if (c.caseType !== caseTypeFilter) return false;
      }

      // Filter: Date
      if (dateFilter !== "ALL_DATE" && c.created_at) {
        const caseDate = new Date(c.created_at);
        const refDate = new Date("2026-09-15T00:00:00");

        if (dateFilter === "TODAY") {
          if (c.created_at !== "2026-09-15") return false;
        } else if (dateFilter === "LAST_7") {
          const diffDays = (refDate.getTime() - caseDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays < 0 || diffDays > 7) return false;
        } else if (dateFilter === "LAST_30") {
          const diffDays = (refDate.getTime() - caseDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays < 0 || diffDays > 30) return false;
        } else if (dateFilter === "FY26") {
          const fyStart = new Date("2025-04-01T00:00:00");
          const fyEnd = new Date("2027-03-31T23:59:59");
          if (caseDate < fyStart || caseDate > fyEnd) return false;
        } else if (dateFilter === "CUSTOM") {
          if (customStartDate && c.created_at < customStartDate) return false;
          if (customEndDate && c.created_at > customEndDate) return false;
        }
      }

      return true;
    });
  }, [cases, searchTerm, statusFilter, districtFilter, riskFilter, caseTypeFilter, dateFilter, customStartDate, customEndDate]);

  // PAGINATION COMPUTATION
  const totalItems = filteredCases.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCases = filteredCases.slice(startIndex, startIndex + pageSize);

  // METRICS FOR 4 REQUIRED KPI CARDS
  const totalCasesCount = cases.length;
  const highRiskCount = cases.filter(c => c.riskLevel === "HIGH" || c.riskLevel === "CRITICAL" || (c.riskScore && c.riskScore > 50)).length;
  const approvedCount = cases.filter(c => c.status === "APPROVED").length;
  const pendingInspectionCount = cases.filter(c => c.status === "FIELD_INSPECTION").length;

  // EXPORT CSV HANDLER
  const handleExportCSV = () => {
    if (filteredCases.length === 0) return;
    const headers = [
      "Case Reference",
      "Case Type",
      "Survey Number",
      "ULPIN",
      "Landowner",
      "Village",
      "District",
      "Area (Acres)",
      "Guideline Value",
      "Estimated Market Value",
      "Risk Score",
      "Risk Level",
      "Status",
      "Date"
    ];
    const rows = filteredCases.map(c => [
      `"${c.caseNumber}"`,
      `"${c.caseType}"`,
      `"${c.surveyNumber}"`,
      `"${c.ulpin}"`,
      `"${c.ownerName}"`,
      `"${c.village}"`,
      `"${c.district}"`,
      `"${c.areaAcres}"`,
      `"${c.guidelineValue || ''}"`,
      `"${c.estimatedMarketValue || ''}"`,
      `"${c.riskScore || ''}"`,
      `"${c.riskLevel || ''}"`,
      `"${c.status}"`,
      `"${c.created_at || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Tamil_Nadu_Land_Cases_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!officer) return null;

  return (
    <OfficerProtectedGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6 font-sans antialiased pb-20">
        
        {/* PAGE TITLE & TOP ACTION BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3E8EF] pb-5">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <Link 
                href="/officer/dashboard" 
                className="text-xs text-[#1D5FD1] hover:text-[#154CB0] font-semibold flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Officer Dashboard</span>
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#102A43] flex items-center gap-2.5">
              <FolderKanban className="w-7 h-7 text-[#1D5FD1]" />
              <span>Land Cases & Statutory Approvals Registry</span>
            </h1>
            <p className="text-xs text-[#53627A] mt-1">
              Government of Tamil Nadu | Revenue & Statutory Adjudication Registry • <strong className="text-[#102A43]">{totalCasesCount} Cases</strong> in jurisdiction ({officer.district || "State Repository"})
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={filteredCases.length === 0}
              className="px-3.5 py-2 rounded-md bg-white hover:bg-[#F7F9FC] text-[#102A43] font-semibold text-xs border border-[#E3E8EF] transition-colors shadow-2xs flex items-center space-x-1.5 disabled:opacity-50"
              title="Download filtered cases as CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#53627A]" />
              <span>Export Registry</span>
            </button>

            <Link
              href="/map"
              className="px-3.5 py-2 rounded-md bg-[#F1F5FB] hover:bg-[#E2ECFA] text-[#1D5FD1] font-semibold text-xs border border-[#CCE0FD] transition-colors shadow-2xs flex items-center space-x-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Cadastral GIS Map</span>
            </Link>

            <Link
              href="/cases"
              className="px-4 py-2 rounded-md bg-[#1D5FD1] hover:bg-[#154CB0] text-white font-semibold text-xs transition-colors shadow-2xs flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Land Case</span>
            </Link>
          </div>
        </div>

        {/* FOUR PRIMARY KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* CARD 1: Total Registry Cases */}
          <div 
            onClick={() => handleResetFilters()}
            className="bg-white border border-[#E3E8EF] p-4 sm:p-5 rounded-xl flex items-center justify-between shadow-xs hover:border-[#1D5FD1] transition-all cursor-pointer group"
          >
            <div className="space-y-1">
              <p className="text-[11px] text-[#53627A] font-bold uppercase tracking-wider">Total Registry Cases</p>
              <p className="text-2xl font-bold text-[#102A43]">{totalCasesCount}</p>
              <p className="text-[11px] text-[#53627A] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D5FD1]"></span>
                <span>Active statutory applications</span>
              </p>
            </div>
            <div className="p-3 bg-[#F1F5FB] text-[#1D5FD1] rounded-lg border border-[#CCE0FD] group-hover:bg-[#1D5FD1] group-hover:text-white transition-colors">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>

          {/* CARD 2: High / Critical Flags */}
          <div 
            onClick={() => {
              setRiskFilter("HIGH_CRITICAL");
              setStatusFilter("ALL");
            }}
            className={`bg-white border p-4 sm:p-5 rounded-xl flex items-center justify-between shadow-xs transition-all cursor-pointer group ${
              riskFilter === "HIGH_CRITICAL" ? "border-[#D9363E] ring-1 ring-[#D9363E]/30 bg-[#FDEDEE]/20" : "border-[#E3E8EF] hover:border-[#D9363E]"
            }`}
          >
            <div className="space-y-1">
              <p className="text-[11px] text-[#53627A] font-bold uppercase tracking-wider">High / Critical Flags</p>
              <p className="text-2xl font-bold text-[#D9363E]">{highRiskCount}</p>
              <p className="text-[11px] text-[#D9363E] flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D9363E]"></span>
                <span>Overlapping claims & alerts</span>
              </p>
            </div>
            <div className="p-3 bg-[#FDEDEE] text-[#D9363E] rounded-lg border border-[#D9363E]/20 group-hover:bg-[#D9363E] group-hover:text-white transition-colors">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          {/* CARD 3: Approved NOC Clearances */}
          <div 
            onClick={() => {
              setStatusFilter("APPROVED");
              setRiskFilter("ALL_RISK");
            }}
            className={`bg-white border p-4 sm:p-5 rounded-xl flex items-center justify-between shadow-xs transition-all cursor-pointer group ${
              statusFilter === "APPROVED" ? "border-[#16845B] ring-1 ring-[#16845B]/30 bg-[#EDF7F2]/20" : "border-[#E3E8EF] hover:border-[#16845B]"
            }`}
          >
            <div className="space-y-1">
              <p className="text-[11px] text-[#53627A] font-bold uppercase tracking-wider">Approved NOC Clearances</p>
              <p className="text-2xl font-bold text-[#16845B]">{approvedCount}</p>
              <p className="text-[11px] text-[#16845B] flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16845B]"></span>
                <span>Clear titles & orders issued</span>
              </p>
            </div>
            <div className="p-3 bg-[#EDF7F2] text-[#16845B] rounded-lg border border-[#16845B]/20 group-hover:bg-[#16845B] group-hover:text-white transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* CARD 4: Pending Inspections */}
          <div 
            onClick={() => {
              setStatusFilter("FIELD_INSPECTION");
              setRiskFilter("ALL_RISK");
            }}
            className={`bg-white border p-4 sm:p-5 rounded-xl flex items-center justify-between shadow-xs transition-all cursor-pointer group ${
              statusFilter === "FIELD_INSPECTION" ? "border-[#E99A16] ring-1 ring-[#E99A16]/30 bg-[#FEF5E7]/20" : "border-[#E3E8EF] hover:border-[#E99A16]"
            }`}
          >
            <div className="space-y-1">
              <p className="text-[11px] text-[#53627A] font-bold uppercase tracking-wider">Pending Inspections</p>
              <p className="text-2xl font-bold text-[#E99A16]">{pendingInspectionCount}</p>
              <p className="text-[11px] text-[#E99A16] flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E99A16]"></span>
                <span>Field survey visits pending</span>
              </p>
            </div>
            <div className="p-3 bg-[#FEF5E7] text-[#E99A16] rounded-lg border border-[#E99A16]/20 group-hover:bg-[#E99A16] group-hover:text-white transition-colors">
              <FileSearch className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* SEARCH & FILTERS CONTAINER */}
        <div className="bg-white p-5 rounded-xl border border-[#E3E8EF] shadow-xs space-y-4">
          
          {/* SEARCH BAR */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#53627A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Case ID, Survey No., Owner Name, Village, ULPIN or District..."
                className="w-full pl-10 pr-9 py-2.5 bg-[#F8FAFD] hover:bg-[#F1F5FB] focus:bg-white text-xs text-[#102A43] placeholder-[#627D98] rounded-lg border border-[#E3E8EF] focus:border-[#1D5FD1] focus:outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#53627A] hover:text-[#102A43]"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* RESET FILTERS BUTTON */}
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-lg bg-[#FDEDEE] hover:bg-[#FCD8DA] text-[#D9363E] text-xs font-semibold border border-[#D9363E]/20 transition-colors flex items-center justify-center space-x-1.5 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* FIVE CORE FILTERS: Status, District, Risk Level, Case Type, Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-1 border-t border-[#F1F4F8]">
            
            {/* FILTER 1: STATUS */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] focus:border-[#1D5FD1] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="OFFICER_REVIEW">Officer Review</option>
                <option value="FIELD_INSPECTION">Field Inspection</option>
                <option value="DOCUMENT_VERIFICATION">Document Verification</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* FILTER 2: DISTRICT */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                District
              </label>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                disabled={!(officer?.role === "SYSTEM_ADMIN" || officer?.role === "STATE_OFFICER" || officer?.role === "SUPER_ADMIN")}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] focus:border-[#1D5FD1] focus:outline-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {TN_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist === "ALL_DISTRICTS" ? "All 38 Districts" : dist}
                  </option>
                ))}
              </select>
            </div>

            {/* FILTER 3: RISK LEVEL */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Risk Level
              </label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] focus:border-[#1D5FD1] focus:outline-none cursor-pointer font-medium"
              >
                <option value="ALL_RISK">All Risk Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MODERATE">Moderate Risk</option>
                <option value="HIGH">High Risk</option>
                <option value="CRITICAL">Critical Risk</option>
                <option value="HIGH_CRITICAL">High / Critical Flags</option>
              </select>
            </div>

            {/* FILTER 4: CASE TYPE */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Case Type
              </label>
              <select
                value={caseTypeFilter}
                onChange={(e) => setCaseTypeFilter(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] focus:border-[#1D5FD1] focus:outline-none cursor-pointer truncate"
              >
                <option value="ALL_TYPES">All Case Types</option>
                {caseTypesList.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* FILTER 5: DATE */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Date
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] focus:border-[#1D5FD1] focus:outline-none cursor-pointer"
              >
                <option value="ALL_DATE">All Dates</option>
                <option value="TODAY">Today (15 Sep 2026)</option>
                <option value="LAST_7">Last 7 Days</option>
                <option value="LAST_30">Last 30 Days</option>
                <option value="FY26">Current FY 2025-26</option>
                <option value="CUSTOM">Custom Range...</option>
              </select>
            </div>

          </div>

          {/* OPTIONAL CUSTOM DATE PICKERS (WHEN CUSTOM SELECTED) */}
          {dateFilter === "CUSTOM" && (
            <div className="flex flex-wrap items-center gap-3 pt-2 bg-[#F8FAFD] p-3 rounded-lg border border-[#E3E8EF]">
              <span className="text-xs font-semibold text-[#53627A] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#1D5FD1]" />
                <span>Custom Date Span:</span>
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#53627A]">From:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-white border border-[#E3E8EF] rounded px-2 py-1 text-xs text-[#102A43] focus:outline-none focus:border-[#1D5FD1]"
                />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#53627A]">To:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-white border border-[#E3E8EF] rounded px-2 py-1 text-xs text-[#102A43] focus:outline-none focus:border-[#1D5FD1]"
                />
              </div>
            </div>
          )}

        </div>

        {/* HIGH-DENSITY CASES TABLE */}
        <div className="bg-white border border-[#E3E8EF] rounded-xl shadow-xs overflow-hidden">
          
          {/* TABLE TOOLBAR */}
          <div className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E8EF] bg-white">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#53627A]">
                Showing <strong className="text-[#102A43]">{totalItems === 0 ? 0 : startIndex + 1}</strong> to <strong className="text-[#102A43]">{Math.min(startIndex + pageSize, totalItems)}</strong> of <strong className="text-[#1D5FD1]">{totalItems}</strong> Land Cases
              </span>
              {isFiltered && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF4FF] text-[#1D5FD1] border border-[#CCE0FD]">
                  Filtered
                </span>
              )}
            </div>

            {/* PAGE SIZE SELECTOR */}
            <div className="flex items-center space-x-2 text-xs text-[#53627A]">
              <span>Rows Per Page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-[#F8FAFD] text-[#102A43] border border-[#E3E8EF] rounded px-2.5 py-1 focus:outline-none text-xs cursor-pointer font-medium"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* TABLE CONTENT */}
          {loading ? (
            <div className="py-20 text-center space-y-2">
              <div className="w-8 h-8 border-2 border-[#1D5FD1] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-[#53627A]">Loading statutory land records & survey entries...</p>
            </div>
          ) : paginatedCases.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-4">
              <div className="w-12 h-12 rounded-full bg-[#F1F5FB] text-[#1D5FD1] flex items-center justify-center mx-auto">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#102A43]">No Land Cases Found</h3>
              <p className="text-xs text-[#53627A] max-w-md mx-auto">
                No land cases matched your search query or filter parameters. Try clearing your filters or searching by a different survey number, landowner or ULPIN.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-md bg-[#1D5FD1] text-white text-xs font-semibold hover:bg-[#154CB0] transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                
                {/* 7 EXACT REQUIRED COLUMNS */}
                <thead className="bg-[#F8FAFD] text-[#53627A] font-bold uppercase tracking-wider text-[11px] border-b border-[#E3E8EF]">
                  <tr>
                    <th className="px-4 py-3.5 whitespace-nowrap">Case Reference</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Survey & ULPIN</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Landowner</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">District & Village</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Guideline Value</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3.5 whitespace-nowrap text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E3E8EF] text-[#102A43]">
                  {paginatedCases.map((c) => {
                    const isHighRisk = c.riskLevel === "HIGH" || c.riskLevel === "CRITICAL" || (c.riskScore && c.riskScore > 50);

                    return (
                      <tr 
                        key={c.id} 
                        className="hover:bg-[#F8FAFD] transition-colors h-[54px] group"
                      >
                        
                        {/* COLUMN 1: CASE REFERENCE */}
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono font-bold text-[#1D5FD1] text-xs">
                              {c.caseNumber}
                            </span>
                            <button
                              onClick={() => handleCopy(c.caseNumber, "caseNo")}
                              title="Copy Case Number"
                              className="text-[#53627A] hover:text-[#1D5FD1] opacity-60 hover:opacity-100 transition-opacity"
                            >
                              {copiedCaseNo === c.caseNumber ? (
                                <Check className="w-3 h-3 text-[#16845B]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="text-[11px] text-[#53627A] truncate max-w-[200px]" title={c.caseType}>
                            {c.caseType}
                          </div>
                          {isHighRisk && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-[#FDEDEE] text-[#D9363E] border border-[#D9363E]/30">
                              {c.riskLevel || "FLAGGED"} {c.riskScore ? `(${c.riskScore}/100)` : ""}
                            </span>
                          )}
                        </td>

                        {/* COLUMN 2: SURVEY & ULPIN */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-mono font-bold text-[#102A43]">
                            S.No {c.surveyNumber}
                          </div>
                          <div className="flex items-center space-x-1 font-mono text-[11px] text-[#53627A]">
                            <span>{c.ulpin}</span>
                            <button
                              onClick={() => handleCopy(c.ulpin, "ulpin")}
                              title="Copy 14-Digit ULPIN"
                              className="text-[#53627A] hover:text-[#1D5FD1] opacity-60 hover:opacity-100 transition-opacity"
                            >
                              {copiedUlpin === c.ulpin ? (
                                <Check className="w-3 h-3 text-[#16845B]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* COLUMN 3: LANDOWNER */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-[#102A43] truncate max-w-[190px]" title={c.ownerName}>
                            {c.ownerName}
                          </div>
                          <div className="text-[10px] text-[#53627A]">
                            Patta Verified Title
                          </div>
                        </td>

                        {/* COLUMN 4: DISTRICT & VILLAGE */}
                        <td className="px-4 py-3">
                          <div className="text-[#102A43] font-medium truncate max-w-[180px]">
                            {c.village}, {c.district}
                          </div>
                          <div className="text-[10px] text-[#53627A] font-mono">
                            {c.areaAcres} Acres (~{Math.round(c.areaAcres * 4046.86).toLocaleString()} sq.m)
                          </div>
                        </td>

                        {/* COLUMN 5: GUIDELINE VALUE */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-semibold text-[#16845B]">
                            {c.guidelineValue || "₹ 3,450 / sq ft"}
                          </div>
                          <div className="text-[10px] text-[#53627A] font-mono">
                            Est. {c.estimatedMarketValue || "₹ 4.20 Cr"}
                          </div>
                        </td>

                        {/* COLUMN 6: STATUS */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={c.status} />
                        </td>

                        {/* COLUMN 7: ACTION */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <Link 
                            href={`/officer/cases/${c.id}`} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1D5FD1] hover:bg-[#154CB0] text-white font-semibold transition-colors shadow-2xs text-xs group"
                          >
                            <span>Review Workspace</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-[#E3E8EF] gap-3 text-xs bg-white">
              <span className="text-[#53627A]">
                Showing page <strong className="text-[#102A43]">{currentPage}</strong> of <strong className="text-[#102A43]">{totalPages}</strong>
              </span>

              <div className="flex items-center space-x-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-md bg-white border border-[#E3E8EF] text-[#102A43] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F9FC] transition-colors flex items-center gap-1 font-semibold shadow-2xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {/* VISIBLE PAGE BUTTONS */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i;
                    if (pageNum + (4 - i) > totalPages) {
                      pageNum = totalPages - 4 + i;
                    }
                  }
                  if (pageNum <= 0 || pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-md text-xs font-semibold transition-colors ${
                        currentPage === pageNum
                          ? "bg-[#1D5FD1] text-white shadow-2xs"
                          : "bg-white border border-[#E3E8EF] text-[#53627A] hover:bg-[#F7F9FC] hover:text-[#102A43]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-md bg-white border border-[#E3E8EF] text-[#102A43] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F9FC] transition-colors flex items-center gap-1 font-semibold shadow-2xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </OfficerProtectedGuard>
  );
}

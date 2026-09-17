"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Parcel } from "@/types";
import { fetchParcels } from "@/services/api";
import {
  Search,
  Filter,
  X,
  RotateCcw,
  FileText,
  Eye,
  Download,
  Layers,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Receipt,
  Calendar,
  MapPin,
  User,
  Scale,
  ChevronLeft,
  ChevronRight,
  Printer,
  ExternalLink,
  FileCheck,
  ArrowUpRight
} from "lucide-react";
import ParcelInspector from "@/components/ParcelInspector";
import OfficerProtectedGuard from "@/components/OfficerProtectedGuard";

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

const TRANSACTION_TYPES = [
  "ALL_TRANSACTIONS",
  "Sale Deed (Conveyance)",
  "Settlement Deed",
  "Partition Deed",
  "Mortgage Deed",
  "Gift Deed",
  "Exchange Deed"
];

const DATE_RANGES = [
  { id: "ALL", label: "All Dates" },
  { id: "2026", label: "2026 (Current Year)" },
  { id: "2025", label: "2025" },
  { id: "2024", label: "2024" },
  { id: "PRIOR", label: "2023 & Prior" }
];

export default function RegistryPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);

  // SEARCH STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"ALL" | "REG_NO" | "ULPIN" | "SURVEY_NO" | "OWNER" | "DATE">("ALL");

  // FILTER STATES
  const [districtFilter, setDistrictFilter] = useState("ALL_DISTRICTS");
  const [talukFilter, setTalukFilter] = useState("ALL_TALUKS");
  const [villageFilter, setVillageFilter] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("ALL_TRANSACTIONS");
  const [dateRangeFilter, setDateRangeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // MODAL / DRAWER STATES
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [viewRecordParcel, setViewRecordParcel] = useState<Parcel | null>(null);
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchParcels();
        setParcels(data);
      } catch (err) {
        console.warn("Error fetching parcels:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute dynamic taluks for selected district
  const availableTaluks = useMemo(() => {
    const taluksSet = new Set<string>();
    parcels.forEach((p) => {
      if (districtFilter === "ALL_DISTRICTS" || p.district === districtFilter) {
        if (p.taluk) taluksSet.add(p.taluk);
      }
    });
    return Array.from(taluksSet).sort();
  }, [parcels, districtFilter]);

  // Enrich parcels with deterministic SRO deed attributes if missing
  const enrichedParcels = useMemo(() => {
    return parcels.map((p, idx) => {
      const idNum = parseInt(p.id, 10) || 100000 + idx;
      const regDocNo = p.registrationDocNo || `DOC-2023-TN-${idNum}`;
      const regDate = p.registrationDate || (idx % 2 === 0 ? "15 May 2023" : "22 Oct 2024");
      
      let transactionType = "Sale Deed (Conveyance)";
      if (idNum % 5 === 0) transactionType = "Settlement Deed";
      else if (idNum % 4 === 0) transactionType = "Partition Deed";
      else if (idNum % 3 === 0) transactionType = "Mortgage Deed";
      else if (idNum % 7 === 0) transactionType = "Gift Deed";

      const prevOwner = idNum % 2 === 0 ? "Thiru R. Selvakumar, IRS" : "Praveen Infrastructure & Land Dev Ltd";

      return {
        ...p,
        registrationDocNo: regDocNo,
        registrationDate: regDate,
        transactionType,
        previousOwner: prevOwner
      };
    });
  }, [parcels]);

  // Filter logic
  const filteredParcels = useMemo(() => {
    return enrichedParcels.filter((p) => {
      const q = searchQuery.toLowerCase().trim();

      // 1. SEARCH FILTER (Search by: Registration Number, ULPIN, Survey Number, Owner, Date)
      if (q) {
        const regNoMatch = p.registrationDocNo?.toLowerCase().includes(q);
        const ulpinMatch = p.ulpin?.toLowerCase().includes(q);
        const surveyMatch = p.surveyNumber?.toLowerCase().includes(q);
        const ownerMatch = p.ownerName?.toLowerCase().includes(q);
        const dateMatch = p.registrationDate?.toLowerCase().includes(q);

        if (searchField === "REG_NO" && !regNoMatch) return false;
        if (searchField === "ULPIN" && !ulpinMatch) return false;
        if (searchField === "SURVEY_NO" && !surveyMatch) return false;
        if (searchField === "OWNER" && !ownerMatch) return false;
        if (searchField === "DATE" && !dateMatch) return false;
        if (searchField === "ALL" && !regNoMatch && !ulpinMatch && !surveyMatch && !ownerMatch && !dateMatch) {
          return false;
        }
      }

      // 2. DISTRICT FILTER
      if (districtFilter !== "ALL_DISTRICTS" && p.district !== districtFilter) {
        return false;
      }

      // 3. TALUK FILTER
      if (talukFilter !== "ALL_TALUKS" && p.taluk !== talukFilter) {
        return false;
      }

      // 4. VILLAGE FILTER
      if (villageFilter && !p.village?.toLowerCase().includes(villageFilter.toLowerCase().trim())) {
        return false;
      }

      // 5. TRANSACTION TYPE FILTER
      if (transactionTypeFilter !== "ALL_TRANSACTIONS" && p.transactionType !== transactionTypeFilter) {
        return false;
      }

      // 6. DATE RANGE FILTER
      if (dateRangeFilter !== "ALL") {
        const dateStr = p.registrationDate || "";
        if (dateRangeFilter === "2026" && !dateStr.includes("2026")) return false;
        if (dateRangeFilter === "2025" && !dateStr.includes("2025")) return false;
        if (dateRangeFilter === "2024" && !dateStr.includes("2024")) return false;
        if (dateRangeFilter === "PRIOR" && (dateStr.includes("2026") || dateStr.includes("2025") || dateStr.includes("2024"))) {
          return false;
        }
      }

      // 7. STATUS FILTER
      if (statusFilter !== "ALL") {
        const isDisputed = p.encumbranceStatus === "Disputed" || p.courtCaseDetails?.status?.includes("Stay");
        if (statusFilter === "VERIFIED" && (isDisputed || p.verificationStatus !== "Verified")) return false;
        if (statusFilter === "DISPUTED" && !isDisputed) return false;
        if (statusFilter === "PENDING" && p.verificationStatus !== "Pending") return false;
      }

      return true;
    });
  }, [
    enrichedParcels,
    searchQuery,
    searchField,
    districtFilter,
    talukFilter,
    villageFilter,
    transactionTypeFilter,
    dateRangeFilter,
    statusFilter
  ]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    searchField,
    districtFilter,
    talukFilter,
    villageFilter,
    transactionTypeFilter,
    dateRangeFilter,
    statusFilter,
    pageSize
  ]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSearchField("ALL");
    setDistrictFilter("ALL_DISTRICTS");
    setTalukFilter("ALL_TALUKS");
    setVillageFilter("");
    setTransactionTypeFilter("ALL_TRANSACTIONS");
    setDateRangeFilter("ALL");
    setStatusFilter("ALL");
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalItems = filteredParcels.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedParcels = filteredParcels.slice(startIndex, startIndex + pageSize);

  // Metrics for top cards
  const totalRegisteredCount = enrichedParcels.length;
  const clearTitlesCount = enrichedParcels.filter(p => p.encumbranceStatus !== "Disputed" && !p.courtCaseDetails?.status?.includes("Stay")).length;
  const disputesCount = enrichedParcels.filter(p => p.encumbranceStatus === "Disputed" || p.courtCaseDetails?.status?.includes("Stay")).length;
  const totalAcresCount = enrichedParcels.reduce((acc, p) => acc + (p.areaAcres || 0), 0).toFixed(1);

  const handleDownloadDoc = (parcel: any) => {
    setDownloadingDoc(parcel.registrationDocNo);
    setTimeout(() => {
      alert(`Download started for SRO Certified Deed Copy: ${parcel.registrationDocNo}.pdf`);
      setDownloadingDoc(null);
    }, 600);
  };

  return (
    <OfficerProtectedGuard>
      <div className="max-w-7xl mx-auto px-6 py-7 sm:px-8 space-y-6 font-sans antialiased pb-20">
        {/* ================================================================= */}
        {/* TOP HEADER SECTION                                                */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E8EF] pb-5">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#102A43] tracking-tight">
                Cadastral Land Registry Ledger
              </h1>
              <span className="text-[10px] bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                SIH26014 DPI
              </span>
            </div>
            <p className="text-xs text-[#53627A]">
              14-Digit ULPIN Key • Sub-Registrar Deeds, Patta Titles, Encumbrance Certificates & Stamp Duty Ledger
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <Link
              href="/map"
              className="px-3.5 py-2 rounded-lg bg-[#1D5FD1] hover:bg-[#154CB0] text-white font-semibold text-xs transition-colors shadow-xs flex items-center space-x-1.5"
            >
              <Layers className="w-4 h-4" />
              <span>Open Cadastral Map</span>
            </Link>
          </div>
        </div>

        {/* ================================================================= */}
        {/* TOP KPI CARDS (Consistent with Dashboard Style)                   */}
        {/* ================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E3E8EF] p-4 rounded-xl flex items-center space-x-3.5 shadow-xs">
            <div className="p-2.5 bg-[#F1F5FB] text-[#1D5FD1] rounded-lg border border-[#E3E8EF]">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-[#53627A] font-bold uppercase tracking-wider">Total Registered Deeds</p>
              <p className="text-xl font-bold text-[#102A43]">{totalRegisteredCount}</p>
            </div>
          </div>

          <div className="bg-white border border-[#E3E8EF] p-4 rounded-xl flex items-center space-x-3.5 shadow-xs">
            <div className="p-2.5 bg-[#EDF7F2] text-[#16845B] rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-[#53627A] font-bold uppercase tracking-wider">Clear Title Clearances</p>
              <p className="text-xl font-bold text-[#16845B]">{clearTitlesCount}</p>
            </div>
          </div>

          <div className="bg-white border border-[#E3E8EF] p-4 rounded-xl flex items-center space-x-3.5 shadow-xs">
            <div className="p-2.5 bg-[#FDEDEE] text-[#D9363E] rounded-lg border border-rose-200">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-[#53627A] font-bold uppercase tracking-wider">Active Injunctions / Stays</p>
              <p className="text-xl font-bold text-[#D9363E]">{disputesCount}</p>
            </div>
          </div>

          <div className="bg-white border border-[#E3E8EF] p-4 rounded-xl flex items-center space-x-3.5 shadow-xs">
            <div className="p-2.5 bg-[#FEF5E7] text-[#E99A16] rounded-lg border border-amber-200">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-[#53627A] font-bold uppercase tracking-wider">Registered Area</p>
              <p className="text-xl font-bold text-[#102A43]">{totalAcresCount} <span className="text-xs text-[#53627A]">Acres</span></p>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* REGISTRY SEARCH & ADVANCED FILTERS PANEL                          */}
        {/* ================================================================= */}
        <div className="bg-white border border-[#E3E8EF] rounded-xl p-5 space-y-4 shadow-xs">
          {/* SEARCH BAR (Registration Number, ULPIN, Survey Number, Owner, Date) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#53627A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Registration Number, ULPIN, Survey Number, Owner, Date..."
                className="w-full h-10 pl-9 pr-8 rounded-lg border border-[#E3E8EF] bg-white text-xs text-[#14213D] placeholder:text-[#53627A]/80 focus:outline-none focus:border-[#1D5FD1] focus:ring-1 focus:ring-[#1D5FD1] shadow-2xs transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Target Field Selector */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0 text-xs">
              <span className="text-[11px] font-semibold text-[#53627A] uppercase tracking-wider hidden sm:inline mr-1">
                Field:
              </span>
              {[
                { id: "ALL", label: "All Fields" },
                { id: "REG_NO", label: "Reg. No." },
                { id: "ULPIN", label: "ULPIN" },
                { id: "SURVEY_NO", label: "Survey No." },
                { id: "OWNER", label: "Owner" },
                { id: "DATE", label: "Date" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSearchField(f.id as any)}
                  className={`px-2.5 py-1.5 rounded-md font-semibold text-xs transition-colors whitespace-nowrap ${
                    searchField === f.id
                      ? "bg-[#1D5FD1] text-white"
                      : "bg-[#F7F9FC] text-[#53627A] hover:bg-slate-200 border border-[#E3E8EF]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* ADVANCED FILTERS (District, Taluk, Village, Transaction Type, Date Range, Status) */}
          <div className="pt-2 border-t border-[#E3E8EF]/80">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
              {/* Filter 1: District */}
              <div>
                <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                  District
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => {
                    setDistrictFilter(e.target.value);
                    setTalukFilter("ALL_TALUKS");
                  }}
                  className="w-full h-9 rounded-md border border-[#E3E8EF] bg-white px-2.5 text-xs text-[#14213D] focus:outline-none focus:border-[#1D5FD1] shadow-2xs font-medium cursor-pointer"
                >
                  {TN_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d === "ALL_DISTRICTS" ? "All Districts" : d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 2: Taluk */}
              <div>
                <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                  Taluk
                </label>
                <select
                  value={talukFilter}
                  onChange={(e) => setTalukFilter(e.target.value)}
                  className="w-full h-9 rounded-md border border-[#E3E8EF] bg-white px-2.5 text-xs text-[#14213D] focus:outline-none focus:border-[#1D5FD1] shadow-2xs font-medium cursor-pointer"
                >
                  <option value="ALL_TALUKS">All Taluks</option>
                  {availableTaluks.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 3: Village */}
              <div>
                <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                  Village
                </label>
                <input
                  type="text"
                  value={villageFilter}
                  onChange={(e) => setVillageFilter(e.target.value)}
                  placeholder="Filter village..."
                  className="w-full h-9 rounded-md border border-[#E3E8EF] bg-white px-2.5 text-xs text-[#14213D] focus:outline-none focus:border-[#1D5FD1] shadow-2xs font-medium placeholder:text-[#53627A]/75"
                />
              </div>

              {/* Filter 4: Transaction Type */}
              <div>
                <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                  Transaction Type
                </label>
                <select
                  value={transactionTypeFilter}
                  onChange={(e) => setTransactionTypeFilter(e.target.value)}
                  className="w-full h-9 rounded-md border border-[#E3E8EF] bg-white px-2.5 text-xs text-[#14213D] focus:outline-none focus:border-[#1D5FD1] shadow-2xs font-medium cursor-pointer"
                >
                  {TRANSACTION_TYPES.map((tt) => (
                    <option key={tt} value={tt}>
                      {tt === "ALL_TRANSACTIONS" ? "All Transactions" : tt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 5: Date Range */}
              <div>
                <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                  Date Range
                </label>
                <select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value)}
                  className="w-full h-9 rounded-md border border-[#E3E8EF] bg-white px-2.5 text-xs text-[#14213D] focus:outline-none focus:border-[#1D5FD1] shadow-2xs font-medium cursor-pointer"
                >
                  {DATE_RANGES.map((dr) => (
                    <option key={dr.id} value={dr.id}>
                      {dr.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 6: Status */}
              <div>
                <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-9 rounded-md border border-[#E3E8EF] bg-white px-2.5 text-xs text-[#14213D] focus:outline-none focus:border-[#1D5FD1] shadow-2xs font-medium cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="VERIFIED">Clear Title / Verified</option>
                  <option value="DISPUTED">Disputed / Stay Order</option>
                  <option value="PENDING">Pending Verification</option>
                </select>
              </div>
            </div>

            {/* Filter Summary & Reset Bar */}
            <div className="flex items-center justify-between pt-3 text-xs">
              <span className="text-[#53627A] text-[11px]">
                Showing <strong className="text-[#102A43]">{filteredParcels.length}</strong> matching records
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-[#1D5FD1] hover:text-[#154CB0] font-semibold flex items-center space-x-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* REGISTRY TABLE (Exact 9 Columns Requested)                        */}
        {/* ================================================================= */}
        <div className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center text-[#53627A] text-xs font-medium space-y-2">
              <div className="w-7 h-7 border-2 border-[#1D5FD1] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div>Loading cadastral registry ledger from database...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F8FAFD] border-b border-[#E3E8EF] text-[#53627A] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Registration No.</th>
                    <th className="px-4 py-3.5">ULPIN</th>
                    <th className="px-4 py-3.5">Survey No.</th>
                    <th className="px-4 py-3.5">Property</th>
                    <th className="px-4 py-3.5">Transaction Type</th>
                    <th className="px-4 py-3.5">Party</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E8EF] text-[#14213D]">
                  {paginatedParcels.map((parcel: any) => {
                    const isDisputed =
                      parcel.encumbranceStatus === "Disputed" ||
                      parcel.courtCaseDetails?.status?.includes("Stay");

                    return (
                      <tr
                        key={parcel.id || parcel.ulpin}
                        className="hover:bg-[#F8FAFD] transition-colors h-[54px]"
                      >
                        {/* 1. Registration No. */}
                        <td className="px-4 py-3 font-mono font-bold text-[#0E4A68] text-xs whitespace-nowrap">
                          {parcel.registrationDocNo}
                        </td>

                        {/* 2. ULPIN */}
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1D5FD1] whitespace-nowrap">
                          {parcel.ulpin}
                        </td>

                        {/* 3. Survey No. */}
                        <td className="px-4 py-3 font-mono font-bold text-[#102A43] text-xs whitespace-nowrap">
                          S.No {parcel.surveyNumber}
                        </td>

                        {/* 4. Property */}
                        <td className="px-4 py-3 min-w-[170px]">
                          <span className="font-semibold text-[#102A43] block truncate">
                            {parcel.village}, {parcel.district}
                          </span>
                          <span className="text-[11px] text-[#53627A] block truncate">
                            {parcel.areaAcres} Acres · {parcel.landClassification}
                          </span>
                        </td>

                        {/* 5. Transaction Type */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-medium text-[#102A43] block">
                            {parcel.transactionType}
                          </span>
                          <span className="text-[10px] text-[#53627A] block">
                            {parcel.taluk} SRO
                          </span>
                        </td>

                        {/* 6. Party */}
                        <td className="px-4 py-3 min-w-[150px]">
                          <span className="font-semibold text-[#102A43] block truncate">
                            {parcel.ownerName}
                          </span>
                          <span className="text-[10px] text-[#53627A] block truncate">
                            Prev: {parcel.previousOwner?.split(",")[0] || "Registered Owner"}
                          </span>
                        </td>

                        {/* 7. Date */}
                        <td className="px-4 py-3 text-xs text-[#53627A] whitespace-nowrap font-medium">
                          {parcel.registrationDate}
                        </td>

                        {/* 8. Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              isDisputed
                                ? "bg-rose-50 text-[#D9363E] border-rose-200"
                                : parcel.verificationStatus === "Verified" || parcel.verificationStatus === "IMMUTABLE"
                                ? "bg-emerald-50 text-[#16845B] border-emerald-200"
                                : "bg-blue-50 text-[#1D5FD1] border-blue-200"
                            }`}
                          >
                            {isDisputed ? (
                              <>
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>DISPUTED</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>{parcel.verificationStatus || "CLEAR TITLE"}</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* 9. Action (View Record, View Parcel, Download Document) */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center space-x-1.5">
                            {/* Action 1: View Record */}
                            <button
                              type="button"
                              onClick={() => setViewRecordParcel(parcel)}
                              className="px-2.5 py-1 bg-white hover:bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF] hover:border-[#1D5FD1] font-semibold text-[11px] rounded transition-colors shadow-2xs"
                              title="View SRO Deed Record"
                            >
                              View Record
                            </button>

                            {/* Action 2: View Parcel */}
                            <button
                              type="button"
                              onClick={() => setSelectedParcel(parcel)}
                              className="px-2.5 py-1 bg-[#102A43] hover:bg-[#0B1F33] text-white font-semibold text-[11px] rounded transition-colors shadow-2xs"
                              title="Open Parcel Details"
                            >
                              View Parcel
                            </button>

                            {/* Action 3: Download Document */}
                            <button
                              type="button"
                              onClick={() => handleDownloadDoc(parcel)}
                              className="p-1 text-[#53627A] hover:text-[#1D5FD1] hover:bg-[#F1F5FB] rounded transition-colors"
                              title="Download Certified SRO Deed PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredParcels.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-16 text-center text-[#53627A] text-xs">
                        <div className="space-y-2 max-w-sm mx-auto">
                          <div className="font-semibold text-sm text-[#102A43]">No matching registry records found</div>
                          <p className="text-[11px] leading-relaxed">
                            No land parcels or deeds matched your current query or filter combinations.
                          </p>
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="px-3.5 py-1.5 bg-[#1D5FD1] text-white font-semibold rounded-md text-xs hover:bg-[#154CB0] transition-colors"
                          >
                            Reset all filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION CONTROLS */}
          {!loading && filteredParcels.length > 0 && (
            <div className="px-4 py-3.5 bg-[#F8FAFD] border-t border-[#E3E8EF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#53627A]">
              <div className="flex items-center space-x-2">
                <span>Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white border border-[#E3E8EF] rounded px-2 py-1 text-xs font-semibold text-[#102A43] focus:outline-none focus:border-[#1D5FD1] cursor-pointer"
                >
                  <option value={10}>10 records</option>
                  <option value={25}>25 records</option>
                  <option value={50}>50 records</option>
                </select>
                <span>
                  | Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + pageSize, totalItems)}</strong> of <strong>{totalItems}</strong> records
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-2.5 py-1 bg-white border border-[#E3E8EF] rounded font-semibold text-[#102A43] hover:bg-[#F1F5FB] disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center space-x-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <span className="font-semibold text-[#102A43] px-2">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="px-2.5 py-1 bg-white border border-[#E3E8EF] rounded font-semibold text-[#102A43] hover:bg-[#F1F5FB] disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* PARCEL INSPECTOR DRAWER (When "View Parcel" is clicked)           */}
        {/* ================================================================= */}
        {selectedParcel && (
          <ParcelInspector
            parcel={selectedParcel}
            onClose={() => setSelectedParcel(null)}
          />
        )}

        {/* ================================================================= */}
        {/* VIEW RECORD MODAL (When "View Record" is clicked)                 */}
        {/* ================================================================= */}
        {viewRecordParcel && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-xl shadow-2xl border border-[#E3E8EF] max-w-2xl w-full overflow-hidden text-xs text-[#14213D] font-sans">
              {/* Modal Header */}
              <div className="p-4 bg-[#102A43] text-white flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-md bg-[#1C3D5D] flex items-center justify-center text-[#1D5FD1]">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      Certified SRO Deed Record
                    </h3>
                    <span className="text-[10px] font-mono text-slate-300">
                      {viewRecordParcel.registrationDocNo}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewRecordParcel(null)}
                  className="w-7 h-7 rounded-md bg-[#1C3D5D] hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {/* Status Bar */}
                <div className="flex items-center justify-between p-3 bg-[#F8FAFD] rounded-lg border border-[#E3E8EF]">
                  <div>
                    <span className="text-[10px] font-semibold text-[#53627A] uppercase block">Sub-Registrar Office</span>
                    <strong className="text-xs text-[#102A43]">{viewRecordParcel.taluk} Sub-District Office</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-[#53627A] uppercase block">Registration Date</span>
                    <strong className="text-xs text-[#102A43]">{viewRecordParcel.registrationDate}</strong>
                  </div>
                </div>

                {/* Key Attributes Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">ULPIN Key</span>
                    <strong className="font-mono text-[#1D5FD1] text-xs block truncate mt-0.5">{viewRecordParcel.ulpin}</strong>
                  </div>

                  <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Cadastral Survey Number</span>
                    <strong className="font-mono text-[#102A43] text-xs block mt-0.5">S.No {viewRecordParcel.surveyNumber}</strong>
                  </div>

                  <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Transaction Type</span>
                    <strong className="text-[#102A43] text-xs block mt-0.5">{(viewRecordParcel as any).transactionType}</strong>
                  </div>

                  <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Total Extent</span>
                    <strong className="text-[#102A43] text-xs block mt-0.5">
                      {viewRecordParcel.areaAcres} Acres ({viewRecordParcel.areaSqMeters?.toLocaleString() || Math.round(viewRecordParcel.areaAcres * 4046.86).toLocaleString()} m²)
                    </strong>
                  </div>

                  <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Registered Owner / Transferee</span>
                    <strong className="text-[#102A43] text-xs block mt-0.5">{viewRecordParcel.ownerName}</strong>
                    <span className="text-[10px] font-mono text-[#53627A]">Aadhaar: {viewRecordParcel.ownerAadhaarHash || "Verified"}</span>
                  </div>

                  <div className="bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Predecessor / Transferor</span>
                    <strong className="text-[#102A43] text-xs block mt-0.5">{(viewRecordParcel as any).previousOwner}</strong>
                  </div>
                </div>

                {/* Fiscal & Valuation Section */}
                <div className="p-3 bg-[#EDF7F2] border border-emerald-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#16845B] text-xs">Stamp Duty & Registration Fee Assessment</span>
                    <span className="text-[10px] bg-white text-[#16845B] font-bold px-2 py-0.5 rounded border border-emerald-300">
                      Paid · e-Challan Active
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#14213D] pt-1">
                    <div>Guideline Value: <strong>{viewRecordParcel.propertyTaxDetails?.guidelineValueSqFt || "₹ 2,450 / sq ft"}</strong></div>
                    <div>Market Valuation: <strong>{viewRecordParcel.propertyTaxDetails?.totalValuation || `₹ ${(viewRecordParcel.areaAcres * 1.45).toFixed(2)} Cr`}</strong></div>
                  </div>
                </div>

                {/* Encumbrance Note */}
                <div className="p-3 bg-[#F8FAFD] border border-[#E3E8EF] rounded-lg text-[11px] text-[#53627A] leading-relaxed">
                  Certified digitally under Inspector General of Registration (tnreginet.gov.in) and linked with the Revenue Tamil Nilam Patta Ledger.
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-[#F8FAFD] border-t border-[#E3E8EF] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const p = viewRecordParcel;
                    setViewRecordParcel(null);
                    setSelectedParcel(p);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF] rounded-md font-semibold text-xs transition-colors flex items-center space-x-1"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>View Full Parcel Profile →</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setViewRecordParcel(null)}
                    className="px-3.5 py-1.5 rounded-md border border-[#E3E8EF] bg-white hover:bg-slate-50 text-xs font-semibold text-[#102A43]"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadDoc(viewRecordParcel)}
                    className="px-3.5 py-1.5 rounded-md bg-[#1D5FD1] hover:bg-[#154CB0] text-white text-xs font-semibold flex items-center space-x-1 transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Deed PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </OfficerProtectedGuard>
  );
}

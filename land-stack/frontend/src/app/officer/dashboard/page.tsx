"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Clock, 
  MapPin, 
  LogOut, 
  FolderKanban, 
  FileCheck, 
  ArrowRight,
  ArrowUpRight,
  ArrowUp,
  ShieldCheck,
  CheckCircle2,
  Search,
  Filter,
  X,
  Plus,
  Map
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";
import OfficerProtectedGuard from "@/components/OfficerProtectedGuard";
import StatusBadge from "@/components/StatusBadge";
import { getDepartmentConfig } from "@/config/departmentDashboardConfig";

export default function OfficerDashboardPage() {
  const router = useRouter();
  const { officer, logoutOfficer } = useOfficerAuth();

  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [isSeniorDashboard, setIsSeniorDashboard] = useState(false);
  const [deptConfig, setDeptConfig] = useState<any>(null);

  const [metrics, setMetrics] = useState({
    total: 23,
    pending: 5,
    underVerification: 5,
    inspectionsPending: 5,
    approved: 2,
    rejected: 1
  });

  const [cases, setCases] = useState<any[]>([]);
  const [caseSearchQuery, setCaseSearchQuery] = useState("");
  const [caseStatusFilter, setCaseStatusFilter] = useState("ALL");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  useEffect(() => {
    if (!officer) {
      router.push("/officer/login");
      return;
    }

    const config = getDepartmentConfig(officer.role);
    setDeptConfig(config);

    async function loadDashboardData() {
      if (!officer) return;
      try {
        const { fetchCasesList, fetchDashboardMetrics } = await import("@/services/landCasesService");
        
        // 1. Fetch Department Metrics
        const metricsData = await fetchDashboardMetrics();
        if (metricsData && metricsData.success) {
          setDashboardMetrics(metricsData.metrics);
          setIsSeniorDashboard(metricsData.isSenior);
        }

        // 2. Fetch Cases (filtered by backend already based on role)
        const allCases = await fetchCasesList();
        setCases(allCases);

      } catch (err) {
        console.warn("Failed to load dashboard data", err);
      }
    }

    loadDashboardData();
  }, [officer, router]);

  const [currentTime, setCurrentTime] = useState({
    date: "Wednesday, 16 September 2026",
    time: "12:25 PM"
  });
  const [greeting, setGreeting] = useState("Good Morning,");

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

      const hour = now.getHours();
      if (hour >= 12 && hour < 17) {
        setGreeting("Good Afternoon,");
      } else if (hour >= 17) {
        setGreeting("Good Evening,");
      } else {
        setGreeting("Good Morning,");
      }
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logoutOfficer();
    router.push("/");
  };

  // DEFAULT EXEMPLAR CASES LIST (Matching government registry structure)
  const defaultRecentCases = [
    {
      id: "100001",
      caseNumber: "CASE-2026-TN-01-100001",
      surveyNumber: "171/3A",
      village: "Sriperumbudur",
      caseType: "Wetland Conversion Violation",
      status: "OFFICER_REVIEW",
      statusLabel: "Officer Review",
      dueDate: "Today"
    },
    {
      id: "100002",
      caseNumber: "CASE-2026-TN-01-100002",
      surveyNumber: "197/7B",
      village: "Pennalur",
      caseType: "Waterbody Encroachment Appeal",
      status: "FIELD_INSPECTION",
      statusLabel: "Field Inspection",
      dueDate: "18 Sep 2026"
    },
    {
      id: "100003",
      caseNumber: "CASE-2026-TN-01-100003",
      surveyNumber: "334/9C",
      village: "Irungattukottai",
      caseType: "Patta Transfer Dispute",
      status: "DOCUMENT_VERIFICATION",
      statusLabel: "Document Verification",
      dueDate: "20 Sep 2026"
    },
    {
      id: "100004",
      caseNumber: "CASE-2026-TN-01-100004",
      surveyNumber: "133/9D",
      village: "Oragadam",
      caseType: "Cadastral Boundary Discrepancy",
      status: "APPROVED",
      statusLabel: "Approved",
      dueDate: "—"
    },
    {
      id: "100005",
      caseNumber: "CASE-2026-TN-01-100005",
      surveyNumber: "101/5E",
      village: "Mambakkam",
      caseType: "Land Acquisition Valuation Claim",
      status: "REJECTED",
      statusLabel: "Rejected",
      dueDate: "—"
    }
  ];

  // Map existing case data if available, or fall back to exemplar cases
  const recentCasesList = cases.length > 0
    ? cases.slice(0, 10).map((c, idx) => {
        let statusLabel = "Officer Review";
        let dueDate = "Today";
        if (c.status === "FIELD_INSPECTION") {
          statusLabel = "Field Inspection";
          dueDate = "18 Sep 2026";
        } else if (c.status === "DOCUMENT_VERIFICATION") {
          statusLabel = "Document Verification";
          dueDate = "20 Sep 2026";
        } else if (c.status === "APPROVED") {
          statusLabel = "Approved";
          dueDate = "—";
        } else if (c.status === "REJECTED") {
          statusLabel = "Rejected";
          dueDate = "—";
        }

        return {
          id: String(c.id),
          caseNumber: c.caseNumber || `CASE-2026-TN-01-${100001 + idx}`,
          surveyNumber: c.surveyNumber || "171/3A",
          village: c.village || "Sriperumbudur",
          caseType: c.caseType || c.title || "Wetland Conversion Violation",
          status: c.status || "OFFICER_REVIEW",
          statusLabel,
          dueDate
        };
      })
    : defaultRecentCases;

  // Filter cases by search query and status filter
  const filteredRecentCases = recentCasesList.filter((item) => {
    const q = caseSearchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      item.caseNumber.toLowerCase().includes(q) ||
      item.surveyNumber.toLowerCase().includes(q) ||
      item.village.toLowerCase().includes(q) ||
      item.caseType.toLowerCase().includes(q)
    );
    const matchesStatus = caseStatusFilter === "ALL" || item.status === caseStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <OfficerProtectedGuard>
      <div className="w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-4 space-y-4 font-sans antialiased pb-16">
        {/* ================================================================= */}
        {/* ================================================================= */}
        {/* WELCOME / HEADER SECTION (LEFT: OFFICER DETAILS, RIGHT: STATUS)   */}
        {/* ================================================================= */}
        <section className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E8EF]">
          {/* LEFT: GREETING, OFFICER DETAILS, POLICY MOTTO */}
          <div className="flex flex-col justify-center space-y-2 max-w-2xl">
            <div>
              <span className="text-xs font-semibold text-[#53627A] tracking-wide block">
                {greeting}
              </span>
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#14213D] tracking-tight leading-tight pt-0.5">
                {officer?.name || "Thiru K. Muthusamy, IAS"}
              </h1>
              <div className="text-xs sm:text-[13px] text-[#53627A] font-medium pt-1 flex flex-wrap items-center gap-x-2">
                <span>{officer?.title || "District Collector & District Magistrate"}</span>
                <span className="text-slate-300">•</span>
                <span className="text-[#14213D] font-semibold">
                  {officer?.district ? `${officer.district} District` : "Kanchipuram District"}
                </span>
              </div>
            </div>

            <div className="text-xs text-[#53627A] font-medium leading-relaxed italic border-l-2 border-[#1D5FD1] pl-2.5">
              &ldquo;Transparent land records. Stronger communities. A prosperous Tamil Nadu.&rdquo;
            </div>
          </div>

          {/* RIGHT: OPERATIONAL INFORMATION (DATE, TIME, SYSTEM STATUS) */}
          <div className="flex flex-col items-start sm:items-end justify-center space-y-1 sm:text-right shrink-0">
            <div className="text-xs font-semibold text-[#14213D]">
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

        {/* ================================================================= */}
        {/* FOUR PRIMARY KPI CARDS (Desktop: 4 in row, Tablet: 2x2, Mobile: 1)*/}
        {/* ================================================================= */}
        {/* ================================================================= */}
        {/* FOUR PRIMARY KPI CARDS (Desktop: 4 in row, Tablet: 2x2, Mobile: 1)*/}
        {/* ================================================================= */}
        {!isSeniorDashboard ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* DEPARTMENT CARD 1: Pending Work */}
            <div className="group block p-4 rounded-xl bg-[#FFF9F9] border border-[#FADBD8] shadow-2xs transition-all h-[126px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#53627A] group-hover:text-[#102A43] transition-colors">
                    {deptConfig?.departmentCode === 'REGISTRATION' ? 'Pending EC Clearance' : 
                     deptConfig?.departmentCode === 'TOWN_PLANNING' ? 'Zoning Reviews' :
                     deptConfig?.departmentCode === 'FOREST_ENVIRONMENT' ? 'Encroachment Checks' :
                     'Pending Work'}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-rose-100/80 text-[#D9363E] flex items-center justify-center shrink-0 border border-rose-200/60">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight leading-none">
                  {dashboardMetrics?.pendingWork || metrics.pending}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-rose-200/60 text-[11px]">
                <span className="flex items-center gap-1.5 font-medium text-[#53627A]">
                  <span className="w-2 h-2 rounded-full bg-[#D9363E] shrink-0"></span>
                  <span>Requires action</span>
                </span>
              </div>
            </div>

            {/* DEPARTMENT CARD 2: Total Assigned */}
            <div className="group block p-4 rounded-xl bg-[#F7FAFF] border border-[#D4E6F1] shadow-2xs transition-all h-[126px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#53627A] group-hover:text-[#102A43] transition-colors">
                    Total Assigned
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-blue-100/80 text-[#1D5FD1] flex items-center justify-center shrink-0 border border-blue-200/60">
                    <FolderKanban className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight leading-none">
                  {dashboardMetrics?.totalAssigned || metrics.total}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-blue-200/60 text-[11px]">
                <span className="flex items-center gap-1.5 font-medium text-[#53627A]">
                  <span className="w-2 h-2 rounded-full bg-[#1D5FD1] shrink-0"></span>
                  <span>All jurisdiction cases</span>
                </span>
              </div>
            </div>

            {/* DEPARTMENT CARD 3: Completed Work */}
            <div className="group block p-4 rounded-xl bg-[#F5FBF8] border border-[#D5F5E3] shadow-2xs transition-all h-[126px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#53627A] group-hover:text-[#102A43] transition-colors">
                    Completed Verifications
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-[#16845B] flex items-center justify-center shrink-0 border border-emerald-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight leading-none">
                  {dashboardMetrics?.completedWork || metrics.approved}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 text-[11px]">
                <span className="flex items-center gap-1 font-semibold text-[#16845B]">
                  <ArrowUp className="w-3 h-3" />
                  <span>Verified output</span>
                </span>
              </div>
            </div>

            {/* DEPARTMENT CARD 4: Escalations */}
            <div className="group block p-4 rounded-xl bg-[#FFFAF5] border border-[#FDEBD0] shadow-2xs transition-all h-[126px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#53627A] group-hover:text-[#102A43] transition-colors">
                    Conflicts / Escalated
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-amber-100/80 text-[#E99A16] flex items-center justify-center shrink-0 border border-amber-200/60">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight leading-none">
                  {dashboardMetrics?.escalated || metrics.rejected}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 text-[11px]">
                <span className="flex items-center gap-1.5 font-medium text-[#53627A]">
                  <span className="w-2 h-2 rounded-full bg-[#E99A16] shrink-0"></span>
                  <span>Needs higher review</span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* SENIOR CARD 1: Total Cases */}
            <div className="group block p-4 rounded-xl bg-[#F7FAFF] border border-[#D4E6F1] shadow-2xs transition-all h-[126px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#53627A] group-hover:text-[#102A43] transition-colors">
                    District Total Cases
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-blue-100/80 text-[#1D5FD1] flex items-center justify-center shrink-0 border border-blue-200/60">
                    <FolderKanban className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight leading-none">
                  {dashboardMetrics?.totalCases || 0}
                </div>
              </div>
            </div>

            {/* SENIOR CARD 2: District Pending Reviews */}
            <div className="group block p-4 rounded-xl bg-[#FFF9F9] border border-[#FADBD8] shadow-2xs transition-all h-[126px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#53627A] group-hover:text-[#102A43] transition-colors">
                    Pending Reviews
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-rose-100/80 text-[#D9363E] flex items-center justify-center shrink-0 border border-rose-200/60">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight leading-none">
                  {dashboardMetrics?.pendingReviews || 0}
                </div>
              </div>
            </div>

            {/* SENIOR CARD 3: Escalated / Blocked */}
            <div className="group block p-4 rounded-xl bg-[#FFFAF5] border border-[#FDEBD0] shadow-2xs transition-all h-[126px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#53627A] group-hover:text-[#102A43] transition-colors">
                    Blocked / Conflicts
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-amber-100/80 text-[#E99A16] flex items-center justify-center shrink-0 border border-amber-200/60">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight leading-none">
                  {dashboardMetrics?.escalated || 0}
                </div>
              </div>
            </div>

            {/* SENIOR CARD 4: Completed Clearances */}
            <div className="group block p-4 rounded-xl bg-[#F5FBF8] border border-[#D5F5E3] shadow-2xs transition-all h-[126px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#53627A] group-hover:text-[#102A43] transition-colors">
                    Completed
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-[#16845B] flex items-center justify-center shrink-0 border border-emerald-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight leading-none">
                  {dashboardMetrics?.completed || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {isSeniorDashboard && dashboardMetrics?.departmentWiseCompletion && (
          <div className="bg-white border border-[#E3E8EF] rounded-xl p-4 sm:p-5 space-y-3 shadow-2xs mt-4">
            <h2 className="text-sm sm:text-base font-bold text-[#102A43]">Department-wise Verification Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {dashboardMetrics.departmentWiseCompletion.map((dept: any, idx: number) => (
                <div key={idx} className="bg-[#F8FAFD] p-3 rounded-lg border border-[#E3E8EF]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-xs text-[#14213D]">{dept.department}</span>
                    <span className="text-xs font-bold text-[#1D5FD1]">{dept.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div className="bg-[#1D5FD1] h-2 rounded-full" style={{ width: `${dept.percentage}%` }}></div>
                  </div>
                  <div className="text-[10px] text-[#53627A]">{dept.pending} cases pending review</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* QUICK ACTIONS SECTION (Compact Card, 2 x 2 Grid, ~165-175px)      */}
        {/* ================================================================= */}
        <div className="bg-white border border-[#E3E8EF] rounded-xl p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-[#102A43]">
              Quick Actions
            </h2>
            <span className="text-[10px] font-bold text-[#53627A] uppercase tracking-wider hidden sm:inline-block">
              Operational Shortcuts
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {/* ACTION 1: New Land Case */}
            <Link
              href="/cases"
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-white border border-[#E3E8EF] hover:border-[#1D5FD1] hover:bg-[#F1F5FB] transition-all group shadow-2xs"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-[#F1F5FB] group-hover:bg-[#1D5FD1] text-[#1D5FD1] group-hover:text-white flex items-center justify-center shrink-0 border border-[#E3E8EF] group-hover:border-[#1D5FD1] transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-[13px] font-semibold text-[#102A43] group-hover:text-[#1D5FD1] transition-colors truncate">
                  New Land Case
                </span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#53627A] group-hover:text-[#1D5FD1] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-1.5" />
            </Link>

            {/* ACTION 2: Search Records */}
            <Link
              href="/officer/registry"
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-white border border-[#E3E8EF] hover:border-[#1D5FD1] hover:bg-[#F1F5FB] transition-all group shadow-2xs"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-[#F1F5FB] group-hover:bg-[#1D5FD1] text-[#1D5FD1] group-hover:text-white flex items-center justify-center shrink-0 border border-[#E3E8EF] group-hover:border-[#1D5FD1] transition-colors">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-[13px] font-semibold text-[#102A43] group-hover:text-[#1D5FD1] transition-colors truncate">
                  Search Records
                </span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#53627A] group-hover:text-[#1D5FD1] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-1.5" />
            </Link>

            {/* ACTION 3: Open GIS Map */}
            <Link
              href="/gis"
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-white border border-[#E3E8EF] hover:border-[#1D5FD1] hover:bg-[#F1F5FB] transition-all group shadow-2xs"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-[#F1F5FB] group-hover:bg-[#1D5FD1] text-[#1D5FD1] group-hover:text-white flex items-center justify-center shrink-0 border border-[#E3E8EF] group-hover:border-[#1D5FD1] transition-colors">
                  <Map className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-[13px] font-semibold text-[#102A43] group-hover:text-[#1D5FD1] transition-colors truncate">
                  Open GIS Map
                </span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#53627A] group-hover:text-[#1D5FD1] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-1.5" />
            </Link>

            {/* ACTION 4: Generate Report */}
            <Link
              href="/reports"
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-white border border-[#E3E8EF] hover:border-[#1D5FD1] hover:bg-[#F1F5FB] transition-all group shadow-2xs"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-[#F1F5FB] group-hover:bg-[#1D5FD1] text-[#1D5FD1] group-hover:text-white flex items-center justify-center shrink-0 border border-[#E3E8EF] group-hover:border-[#1D5FD1] transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-[13px] font-semibold text-[#102A43] group-hover:text-[#1D5FD1] transition-colors truncate">
                  Generate Report
                </span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#53627A] group-hover:text-[#1D5FD1] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-1.5" />
            </Link>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RECENT LAND CASES TABLE (FULL WIDTH)                              */}
        {/* ================================================================= */}
        <div className="w-full bg-white border border-[#E3E8EF] rounded-xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
            {/* TITLE & VIEW ALL → */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#102A43]">
                  Recent Land Cases
                </h2>
                <p className="text-[11px] text-[#53627A] font-medium">
                  Statutory clearances and dispute resolutions in your jurisdiction
                </p>
              </div>
              <Link 
                href="/officer/cases" 
                className="text-xs font-semibold text-[#1D5FD1] hover:text-[#154CB0] inline-flex items-center space-x-1 transition-colors"
              >
                <span>View All</span>
                <span>→</span>
              </Link>
            </div>

            {/* SEARCH INPUT & FILTERS BUTTON */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-0.5">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#53627A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={caseSearchQuery}
                  onChange={(e) => setCaseSearchQuery(e.target.value)}
                  placeholder="Search by Case ID, Survey Number, Village..."
                  className="w-full h-9 pl-9 pr-8 rounded-md border border-[#E3E8EF] bg-white text-xs text-[#14213D] placeholder:text-[#53627A]/75 focus:outline-none focus:border-[#1D5FD1] focus:ring-1 focus:ring-[#1D5FD1] shadow-2xs transition-all"
                />
                {caseSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCaseSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Filters Button with Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                  className={`h-9 px-3 rounded-md border text-xs font-semibold flex items-center space-x-2 transition-colors shadow-2xs shrink-0 ${
                    caseStatusFilter !== "ALL"
                      ? "bg-[#F1F5FB] border-[#1D5FD1] text-[#1D5FD1]"
                      : "bg-white border-[#E3E8EF] text-[#14213D] hover:bg-[#F7F9FC]"
                  }`}
                >
                  <Filter className="w-3 h-3 text-[#53627A]" />
                  <span>Status Filter</span>
                  {caseStatusFilter !== "ALL" && (
                    <span className="w-2 h-2 rounded-full bg-[#1D5FD1]"></span>
                  )}
                </button>

                {/* Status Filter Popover */}
                {filterMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-20" 
                      onClick={() => setFilterMenuOpen(false)} 
                    />
                    <div className="absolute right-0 mt-1 w-52 bg-white border border-[#E3E8EF] rounded-lg shadow-lg py-1.5 z-30 text-xs text-[#14213D]">
                      <div className="px-3 py-1 text-[10px] font-bold text-[#53627A] uppercase tracking-wider border-b border-[#E3E8EF]">
                        Filter by Status
                      </div>
                      {[
                        { id: "ALL", label: "All Statuses" },
                        { id: "OFFICER_REVIEW", label: "Officer Review" },
                        { id: "FIELD_INSPECTION", label: "Field Inspection" },
                        { id: "DOCUMENT_VERIFICATION", label: "Document Verification" },
                        { id: "APPROVED", label: "Approved" },
                        { id: "REJECTED", label: "Rejected" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setCaseStatusFilter(opt.id);
                            setFilterMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#F7F9FC] transition-colors ${
                            caseStatusFilter === opt.id ? "text-[#1D5FD1] font-bold bg-[#F1F5FB]" : "text-[#14213D]"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {caseStatusFilter === opt.id && <span className="text-[#1D5FD1] font-bold">✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* TABLE: 7 COLUMNS (Case ID, Survey No., Village / Location, Case Type, Status, Due Date, Action) */}
            <div className="overflow-x-auto pt-0.5">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F8FAFD] text-[#53627A] font-semibold uppercase tracking-wider border-b border-[#E3E8EF]">
                  <tr>
                    <th className="px-3 py-2.5 font-bold">Case ID</th>
                    <th className="px-3 py-2.5 font-bold">Survey No.</th>
                    <th className="px-3 py-2.5 font-bold">Village</th>
                    <th className="px-3 py-2.5 font-bold">Case Type</th>
                    <th className="px-3 py-2.5 font-bold">Status</th>
                    <th className="px-3 py-2.5 font-bold">Due Date</th>
                    <th className="px-3 py-2.5 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E8EF] text-[#14213D]">
                  {filteredRecentCases.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F8FAFD] transition-colors h-12">
                      {/* Case ID */}
                      <td className="px-3 py-2 font-mono text-[11px] font-semibold text-[#0E4A68] whitespace-nowrap">
                        {c.caseNumber}
                      </td>

                      {/* Survey No. */}
                      <td className="px-3 py-2 font-mono text-xs text-[#14213D] font-medium whitespace-nowrap">
                        {c.surveyNumber}
                      </td>

                      {/* Village */}
                      <td className="px-3 py-2 text-xs text-[#53627A] font-medium whitespace-nowrap">
                        {c.village}
                      </td>

                      {/* Case Type */}
                      <td className="px-3 py-2 text-xs text-[#14213D] font-medium max-w-[150px] truncate" title={c.caseType}>
                        {c.caseType}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>

                      {/* Due Date */}
                      <td className="px-3 py-2 text-xs font-medium whitespace-nowrap">
                        {c.dueDate === "Today" ? (
                          <span className="text-[#D9363E] font-semibold">{c.dueDate}</span>
                        ) : c.dueDate === "—" ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <span className="text-[#53627A]">{c.dueDate}</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <Link 
                          href={`/officer/cases/${c.id}`} 
                          className="text-xs font-semibold text-[#1D5FD1] hover:text-[#154CB0] hover:underline inline-flex items-center space-x-1 transition-colors"
                        >
                          <span>View</span>
                          <span>→</span>
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {filteredRecentCases.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-[#53627A] text-xs">
                        <div className="space-y-1.5">
                          <div>No land cases match your search or filter criteria.</div>
                          <button
                            type="button"
                            onClick={() => {
                              setCaseSearchQuery("");
                              setCaseStatusFilter("ALL");
                            }}
                            className="text-[#1D5FD1] font-semibold hover:underline"
                          >
                            Clear search and filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </OfficerProtectedGuard>
  );
}

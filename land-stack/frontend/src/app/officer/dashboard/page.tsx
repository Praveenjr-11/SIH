"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Map, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  UserCheck, 
  LogOut, 
  FolderKanban, 
  LayoutDashboard, 
  FileCheck, 
  ArrowRight,
  Activity,
  Layers,
  BarChart2
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";
import OfficerProtectedGuard from "@/components/OfficerProtectedGuard";

export default function OfficerDashboardPage() {
  const router = useRouter();
  const { officer, logoutOfficer } = useOfficerAuth();


  const [metrics, setMetrics] = useState({
    total: 12,
    pending: 4,
    underVerification: 3,
    inspectionsPending: 2,
    approved: 2,
    rejected: 1
  });

  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    if (!officer) {
      router.push("/officer/login");
      return;
    }

    async function loadDashboardData() {
      if (!officer) return;
      try {
        const { fetchCasesList } = await import("@/services/landCasesService");
        const allCases = await fetchCasesList();

        // JURISDICTION FILTERING
        const isStateLevel = officer.role === "SYSTEM_ADMIN" || officer.role === "STATE_OFFICER";
        const isDistrictLevel = ["DISTRICT_COLLECTOR", "DRO", "RDO", "SURVEY_OFFICER", "TOWN_PLANNER", "AD_SURVEY"].includes(officer.role);
        
        const filteredCases = allCases.filter((c: any) => {
          if (isStateLevel) return true;
          if (isDistrictLevel) return c.district === officer.district;
          return c.district === officer.district && c.taluk === officer.taluk;
        });

        // COMPUTE METRICS
        const metricsData = {
          total: filteredCases.length,
          pending: filteredCases.filter((c: any) => c.status === "OFFICER_REVIEW").length,
          underVerification: filteredCases.filter((c: any) => c.status === "DOCUMENT_VERIFICATION").length,
          inspectionsPending: filteredCases.filter((c: any) => c.status === "FIELD_INSPECTION").length,
          approved: filteredCases.filter((c: any) => c.status === "APPROVED").length,
          rejected: filteredCases.filter((c: any) => c.status === "REJECTED").length
        };

        setCases(filteredCases);
        setMetrics(metricsData);

      } catch (err) {
        console.warn("Failed to load dashboard data", err);
      }
    }

    loadDashboardData();
  }, [officer, router]);

  const handleLogout = () => {
    logoutOfficer();
    router.push("/");
  };

  return (
    <OfficerProtectedGuard>
      <div className="max-w-7xl mx-auto p-6 sm:p-8 space-y-8 font-sans antialiased pb-20">

      
      {/* TOP WELCOME & JURISDICTION HEADER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900">Welcome, {officer?.name || 'Officer'}</h1>
          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
            <span>Role: <strong className="text-blue-700 font-semibold">{officer?.title}</strong></span>
            <span>•</span>
            <span>Jurisdiction: <strong className="text-emerald-700 font-semibold">{officer?.taluk} Taluk, {officer?.district} District</strong></span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-emerald-700 font-bold">
            ID: {officer?.badgeNo}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-red-600 font-bold text-xs border border-slate-200 transition-colors shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics.pending}</div>
          <div className="text-[10px] text-slate-500">Requires officer action</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Active Land Cases</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics.total}</div>
          <div className="text-[10px] text-slate-500">In assigned jurisdiction</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Field Inspections</span>
            <MapPin className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics.inspectionsPending}</div>
          <div className="text-[10px] text-slate-500">Scheduled on-site visits</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Docs Pending Verification</span>
            <FileCheck className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics.underVerification}</div>
          <div className="text-[10px] text-slate-500">Patta & OCR checks</div>
        </div>
      </div>

      {/* RECENT LAND CASES TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-600" />
            <span>Recent Land Cases & Approvals</span>
          </h3>
          <Link href="/officer/cases" className="text-xs text-blue-600 font-bold hover:underline">
            View All Cases →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Case ID</th>
                <th className="p-3">Survey Number</th>
                <th className="p-3">Location</th>
                <th className="p-3">Case Type</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {cases.slice(0, 5).map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-emerald-700">{c.caseNumber}</td>
                  <td className="p-3 font-mono font-semibold">{c.surveyNumber}</td>
                  <td className="p-3">{c.village}, {c.district}</td>
                  <td className="p-3">{c.caseType}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      c.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      c.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      c.status === 'FIELD_INSPECTION' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {c.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link href={`/officer/cases/${c.id}`} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-xs">
                      Review Case →
                    </Link>
                  </td>
                </tr>
              ))}
              {cases.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 text-xs">
                    No recent land cases found in your jurisdiction.
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


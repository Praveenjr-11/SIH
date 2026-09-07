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
  Filter
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";

export default function OfficerDashboardPage() {
  const { officer } = useOfficerAuth();
  const [metrics, setMetrics] = useState({
    total: 12,
    pending: 4,
    underVerification: 3,
    inspectionsPending: 2,
    approved: 2,
    rejected: 1
  });

  const sampleCases = [
    { id: 101, caseNo: "CASE-2026-489201", title: "SIPCOT Industrial Park Clearance — S.No 142/3B", status: "GIS_ANALYSIS", priority: "HIGH", village: "Irungattukottai", area: "12.50 Acres", type: "Zone Conversion" },
    { id: 102, caseNo: "CASE-2026-815072", title: "Residential Housing Colony Clearance — S.No 181/9A", status: "OFFICER_REVIEW", priority: "MEDIUM", village: "Pennalur", area: "2.55 Acres", type: "Patta Verification" },
    { id: 103, caseNo: "CASE-2026-302194", title: "Agriculture Buffer Boundary Demarcation — S.No 204/5C", status: "FIELD_INSPECTION", priority: "URGENT", village: "Sriperumbudur", area: "4.80 Acres", type: "Boundary Demarcation" },
    { id: 104, caseNo: "CASE-2026-904128", title: "Commercial CBD Complex FSI Clearance — S.No 88/1A", status: "APPROVED", priority: "LOW", village: "Mambakkam", area: "1.20 Acres", type: "FSI Clearance" }
  ];

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
            <p className="text-sm text-slate-400">
              Active Jurisdiction: <strong className="text-slate-200">{officer ? `${officer.taluk} Taluk, ${officer.district}` : 'Sriperumbudur Taluk, Kanchipuram District'}</strong>
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

        {/* METRICS CARDS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>Total Cases</span>
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white">{metrics.total}</div>
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
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>Active Land Cases in Jurisdiction</span>
              </h3>
              <p className="text-xs text-slate-400">Real-time land conversion, NOC clearances, and survey demarcation files</p>
            </div>
            <Link href="/cases" className="text-xs text-blue-400 font-bold hover:underline flex items-center gap-1">
              <span>View All Cases</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Case ID</th>
                  <th className="p-3">Case Title</th>
                  <th className="p-3">Village</th>
                  <th className="p-3">Land Area</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sampleCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-emerald-400">{c.caseNo}</td>
                    <td className="p-3 font-semibold text-white">{c.title}</td>
                    <td className="p-3 text-slate-300">{c.village}</td>
                    <td className="p-3 text-slate-300 font-mono">{c.area}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.priority === 'URGENT' || c.priority === 'HIGH' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-800 text-slate-300'
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
                      <Link href={`/cases?id=${c.id}`} className="px-3 py-1 rounded bg-blue-600 text-white font-bold hover:bg-emerald-600 transition-colors">
                        Inspect Case →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

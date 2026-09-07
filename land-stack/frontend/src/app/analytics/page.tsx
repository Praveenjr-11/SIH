"use client";

import { useEffect, useState } from "react";
import { LandAnalytics } from "@/types";
import { fetchAnalytics } from "@/services/api";
import { BarChart3, PieChart, ShieldCheck, AlertTriangle, Layers, Activity } from "lucide-react";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<LandAnalytics | null>(null);

  useEffect(() => {
    async function load() {
      const data = await fetchAnalytics();
      setAnalytics(data);
    }
    load();
  }, []);

  if (!analytics) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading governance analytics...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Land Governance & Spatial Analytics</h1>
        <p className="text-sm text-slate-500 font-medium">REST API Metrics — GSI Geohazard Risk & Zone Allocation</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Total Monitored Parcels</span>
          <span className="text-2xl font-extrabold text-slate-900">{analytics.totalParcels} Parcels</span>
          <span className="text-[11px] text-emerald-700 font-semibold block mt-1">{analytics.totalAreaAcres} Total Acres</span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Verified DPI Parcels</span>
          <span className="text-2xl font-extrabold text-emerald-600">{analytics.verifiedParcels}</span>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">100% Boundary Fixed</span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Disputed Parcels</span>
          <span className="text-2xl font-extrabold text-amber-600">{analytics.disputedParcels}</span>
          <span className="text-[11px] text-amber-700 font-medium block mt-1">Pending Spatial Audit</span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Active Mutation Applications</span>
          <span className="text-2xl font-extrabold text-blue-600">{analytics.pendingMutations}</span>
          <span className="text-[11px] text-blue-700 font-medium block mt-1">Realtime Workflow Active</span>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Zone Distribution */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Land Use Zone Allocation</span>
          </h3>
          <div className="space-y-3">
            {analytics.zoneDistribution.map((z) => (
              <div key={z.zone} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{z.zone}</span>
                <div className="text-right">
                  <span className="text-blue-700 font-bold block">{z.count} Parcels</span>
                  <span className="text-slate-500 text-[10px] font-medium">{z.area} Acres</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GSI Hazard Breakdown */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>GSI Geohazard Risk Assessment Breakdown</span>
          </h3>
          <div className="space-y-3">
            {analytics.gsiHazardRiskBreakdown.map((g) => (
              <div key={g.level} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{g.level}</span>
                <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                  {g.count} Parcels
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

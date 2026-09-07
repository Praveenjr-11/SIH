"use client";

import { useEffect, useState } from "react";
import { LandMutation } from "@/types";
import { fetchMutations } from "@/services/api";
import { Activity, ShieldCheck, AlertTriangle, FileCheck, CheckCircle2 } from "lucide-react";

export default function MutationPage() {
  const [mutations, setMutations] = useState<LandMutation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchMutations();
      setMutations(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Land Mutation Audit Ledger</h1>
          <p className="text-sm text-slate-500 font-medium">Automated Spatial Overlap Checks & GSI Geohazard Clearance</p>
        </div>
        <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-xs">
          <Activity className="w-4 h-4 animate-pulse text-blue-600" />
          <span>Realtime Backend Mutation Engine</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm font-medium">Loading mutation audit ledger...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {mutations.map((m) => (
            <div key={m.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg">
                    {m.applicationId}
                  </span>
                  <span className="text-sm font-bold text-slate-900">ULPIN: {m.ulpin} (S.No {m.surveyNumber})</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">Applied: {m.appliedDate}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">Buyer / Transferee</span>
                  <span className="text-slate-900 font-bold">{m.buyerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Seller / Transferor</span>
                  <span className="text-slate-900 font-bold">{m.sellerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Mutation Type</span>
                  <span className="text-indigo-700 font-bold">{m.mutationType}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100">
                <div className="flex items-center space-x-3">
                  <span className="text-slate-500 font-medium">Spatial Audit:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                    m.spatialAuditStatus === 'Passed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {m.spatialAuditStatus}
                  </span>

                  <span className="text-slate-500 font-medium ml-4">GSI Clearance:</span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {m.gsiClearance}
                  </span>
                </div>

                <div className="text-slate-500 italic text-[11px] font-medium">{m.remarks}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

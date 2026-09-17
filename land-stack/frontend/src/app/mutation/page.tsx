"use client";

import { useEffect, useState } from "react";
import { LandMutation } from "@/types";
import { fetchMutations } from "@/services/api";
import { Activity, ShieldCheck, AlertTriangle, FileCheck, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import OfficerProtectedGuard from "@/components/OfficerProtectedGuard";

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
    <OfficerProtectedGuard>
      <div className="max-w-7xl mx-auto px-6 py-7 sm:px-8 space-y-6 font-sans antialiased pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E8EF] pb-5">
          <div>
            <h1 className="text-2xl font-bold text-[#102A43]">Land Mutation Audit Ledger</h1>
            <p className="text-xs text-[#53627A] mt-0.5">Automated Spatial Overlap Checks, SRO Deed Linkage & GSI Geohazard Clearance</p>
          </div>
          <div className="px-3 py-1.5 bg-[#F1F5FB] border border-[#E3E8EF] text-[#1D5FD1] text-xs font-semibold rounded-md flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#1D5FD1]" />
            <span>Realtime Mutation Engine Active</span>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#53627A] text-xs font-medium">
            Loading mutation audit records from database...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {mutations.map((m) => (
              <div key={m.id} className="bg-white border border-[#E3E8EF] p-5 rounded-lg shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E3E8EF] pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-bold bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF] px-2.5 py-1 rounded">
                      {m.applicationId}
                    </span>
                    <span className="text-sm font-bold text-[#102A43]">ULPIN: {m.ulpin} (S.No {m.surveyNumber})</span>
                  </div>
                  <span className="text-xs text-[#53627A]">Applied Date: <strong className="text-[#14213D]">{m.appliedDate}</strong></span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-[#F7F9FC] p-3 rounded-md border border-[#E3E8EF]">
                  <div>
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Buyer / Transferee</span>
                    <span className="text-[#102A43] font-bold text-xs">{m.buyerName}</span>
                  </div>
                  <div>
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Seller / Transferor</span>
                    <span className="text-[#102A43] font-bold text-xs">{m.sellerName}</span>
                  </div>
                  <div>
                    <span className="text-[#53627A] block text-[10px] font-semibold uppercase">Mutation Category</span>
                    <span className="text-[#1D5FD1] font-bold text-xs">{m.mutationType}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="text-[#53627A] font-medium">Spatial Overlap Audit:</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                      m.spatialAuditStatus === 'Passed'
                        ? 'bg-[#EDF7F2] text-[#16845B] border-[#16845B]/30'
                        : 'bg-[#FEF5E7] text-[#E99A16] border-[#E99A16]/30'
                    }`}>
                      {m.spatialAuditStatus}
                    </span>

                    <span className="text-[#53627A] font-medium ml-2">GSI Clearance:</span>
                    <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-[#EDF7F2] text-[#16845B] border border-[#16845B]/30">
                      {m.gsiClearance}
                    </span>
                  </div>

                  <div className="text-[#53627A] text-[11px]">{m.remarks}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </OfficerProtectedGuard>
  );
}

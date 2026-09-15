"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Shield, Clock, FileText, Info } from "lucide-react";

interface DepartmentReviewItem {
  departmentCode: string;
  displayName: string;
  status: 'APPROVED' | 'REJECTED' | 'CONDITIONAL' | 'NOT_APPLICABLE' | string;
  officerTitle: string;
  officerName: string;
  reviewedAt?: string;
  remarks: string;
}

interface DepartmentTimelineProps {
  caseId: string | number;
}

export default function DepartmentTimeline({ caseId }: DepartmentTimelineProps) {
  const [timeline, setTimeline] = useState<DepartmentReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTimeline() {
      setLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("landstack_officer_token") : null;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/cases/${caseId}/department-timeline`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.timeline)) {
            setTimeline(data.timeline);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch department review timeline:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTimeline();
  }, [caseId]);

  if (loading) {
    return (
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
        Loading inter-departmental review timeline...
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
        No department reviews recorded for case #{caseId}.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 font-sans text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Unified Inter-Departmental Clearance Audit Timeline
          </h4>
        </div>
        <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-semibold">
          6 DEPARTMENTS AUDITED
        </span>
      </div>

      <div className="space-y-3">
        {timeline.map((item, idx) => {
          const isApproved = item.status === 'APPROVED';
          const isRejected = item.status === 'REJECTED';
          const isConditional = item.status === 'CONDITIONAL';
          const isNotApplicable = item.status === 'NOT_APPLICABLE';

          return (
            <div key={item.departmentCode || idx} className="relative pl-6 pb-3 border-l-2 border-slate-800 last:border-l-0 last:pb-0">
              {/* Status Circle */}
              <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isApproved ? 'bg-emerald-500 text-slate-950' :
                isRejected ? 'bg-red-500 text-white' :
                isConditional ? 'bg-amber-500 text-slate-950' :
                'bg-slate-700 text-slate-300'
              }`}>
                {idx + 1}
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{item.displayName}</span>
                  </span>
                  <span className={`inline-flex items-center space-x-1 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide border ${
                    isApproved ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                    isRejected ? 'bg-red-950 text-red-400 border-red-800' :
                    isConditional ? 'bg-amber-950 text-amber-400 border-amber-800' :
                    'bg-slate-900 text-slate-400 border-slate-800'
                  }`}>
                    {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {isRejected && <XCircle className="w-3 h-3 text-red-400" />}
                    {isConditional && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                    {isNotApplicable && <Info className="w-3 h-3 text-slate-400" />}
                    <span>{isNotApplicable ? 'NOT APPLICABLE (NO OVERLAP)' : item.status}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Officer: <strong className="text-slate-200 font-sans">{item.officerName}</strong> ({item.officerTitle})</span>
                  {item.reviewedAt && (
                    <span className="text-[10px] text-slate-500">{new Date(item.reviewedAt).toLocaleDateString()}</span>
                  )}
                </div>

                <p className={`text-[11px] leading-relaxed p-2 rounded border italic ${
                  isNotApplicable ? 'bg-slate-900/60 text-slate-400 border-slate-800 font-sans' : 'bg-slate-900 text-slate-300 border-slate-800 font-sans'
                }`}>
                  &quot;{item.remarks}&quot;
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

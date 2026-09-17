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
      <div className="p-4 bg-[#F7F9FC] border border-[#E3E8EF] rounded-md text-center text-xs text-[#53627A]">
        Loading inter-departmental review timeline...
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="p-4 bg-[#F7F9FC] border border-[#E3E8EF] rounded-md text-center text-xs text-[#53627A]">
        No department reviews recorded for case #{caseId}.
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E3E8EF] rounded-lg p-5 space-y-4 font-sans text-[#14213D] shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-3">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-[#1D5FD1]" />
          <h4 className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
            Unified Inter-Departmental Clearance Audit Timeline
          </h4>
        </div>
        <span className="text-[10px] font-mono bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF] px-2 py-0.5 rounded font-semibold">
          6 DEPARTMENTS AUDITED
        </span>
      </div>

      <div className="space-y-3">
        {timeline.map((item, idx) => {
          const isApproved = item.status === 'APPROVED';
          const isRejected = item.status === 'REJECTED';
          const isConditional = item.status === 'CONDITIONAL';

          return (
            <div key={item.departmentCode || idx} className="relative pl-6 pb-3 border-l-2 border-[#E3E8EF] last:border-l-0 last:pb-0">
              {/* Status Circle */}
              <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${
                isApproved ? 'bg-[#16845B]' :
                isRejected ? 'bg-[#D9363E]' :
                isConditional ? 'bg-[#E99A16]' :
                'bg-[#53627A]'
              }`}>
                {idx + 1}
              </div>

              <div className="bg-[#F7F9FC] p-3.5 rounded-md border border-[#E3E8EF] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#102A43]">{item.displayName}</span>
                    <span className="text-[10px] text-[#53627A] font-mono">({item.departmentCode})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border self-start sm:self-auto ${
                    isApproved ? 'bg-[#EDF7F2] text-[#16845B] border-[#16845B]/30' :
                    isRejected ? 'bg-[#FDEDEE] text-[#D9363E] border-[#D9363E]/30' :
                    isConditional ? 'bg-[#FEF5E7] text-[#E99A16] border-[#E99A16]/30' :
                    'bg-white text-[#53627A] border-[#E3E8EF]'
                  }`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs text-[#53627A] leading-relaxed">{item.remarks}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#53627A] pt-1 border-t border-[#E3E8EF]">
                  <span>Reviewing Officer: <strong className="text-[#14213D]">{item.officerName}</strong> ({item.officerTitle})</span>
                  {item.reviewedAt && (
                    <span className="font-mono text-[#53627A]">Timestamp: {item.reviewedAt}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

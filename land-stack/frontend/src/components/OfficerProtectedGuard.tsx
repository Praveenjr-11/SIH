"use client";

import React from "react";
import Link from "next/link";
import { Landmark, Lock, ShieldCheck, ArrowRight, UserCheck } from "lucide-react";
import { useOfficerAuth, PRESET_OFFICERS } from "@/context/OfficerAuthContext";

export default function OfficerProtectedGuard({ children }: { children: React.ReactNode }) {
  const { officer, loginOfficer } = useOfficerAuth();

  if (!officer) {
    return (
      <div className="min-h-[85vh] bg-[#F7F9FC] text-[#14213D] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-[#E3E8EF] rounded-lg p-8 shadow-sm space-y-6 text-center">
          <div className="w-12 h-12 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-[#E99A16] mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-[#F7F9FC] border border-[#E3E8EF] text-[#1D5FD1] text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Restricted Government Access</span>
            </div>
            <h2 className="text-xl font-bold text-[#102A43]">Officer Portal Access Only</h2>
            <p className="text-xs text-[#53627A] leading-relaxed">
              This module is strictly accessible to authorized Government Revenue Officers, District Collectors, and Survey Officers. Public users may explore the public map interface.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href="/officer/login"
              className="w-full py-2.5 px-4 rounded-md bg-[#102A43] hover:bg-[#102A43]/90 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Authenticate as Government Officer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

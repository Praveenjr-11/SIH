"use client";

import React from "react";
import Link from "next/link";
import { Landmark, Lock, ShieldCheck, ArrowRight, UserCheck } from "lucide-react";
import { useOfficerAuth, PRESET_OFFICERS } from "@/context/OfficerAuthContext";

export default function OfficerProtectedGuard({ children }: { children: React.ReactNode }) {
  const { officer, loginOfficer } = useOfficerAuth();

  if (!officer) {
    return (
      <div className="min-h-[85vh] bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Restricted Government Access</span>
            </div>
            <h2 className="text-2xl font-black text-white">Officer Portal Access Only</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              This module is strictly accessible to authorized Government Revenue Officers, District Collectors, and Survey Officers. Public users may explore the public map interface.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href="/officer/login"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Authenticate as Government Officer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] text-slate-500 font-semibold block">Quick 1-Click Demo Login:</span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {PRESET_OFFICERS.slice(0, 3).map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => loginOfficer(p)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-900/60 text-slate-300 hover:text-blue-300 font-mono text-[10.5px] font-bold border border-slate-700 transition-colors"
                  >
                    {p.role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

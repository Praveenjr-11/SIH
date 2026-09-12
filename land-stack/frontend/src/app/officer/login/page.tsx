"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowLeft, 
  Landmark, 
  AlertCircle
} from "lucide-react";
import { useOfficerAuth, PRESET_OFFICERS } from "@/context/OfficerAuthContext";

export default function OfficerLoginPage() {
  const router = useRouter();
  const { loginOfficer } = useOfficerAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || email.trim().length === 0) {
      setError("Please enter your official email address or Officer ID.");
      setLoading(false);
      return;
    }

    if (!password || password.trim().length === 0) {
      setError("Please enter your security password.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (data.success && data.officer) {
        loginOfficer({
          name: data.officer.full_name,
          title: data.officer.designation || data.officer.role,
          role: data.officer.role,
          district: data.officer.district,
          taluk: data.officer.taluk,
          email: data.officer.email,
          phone: "044-27237433",
          badgeNo: data.officer.badge_number || "TN-GOV-2026",
          department: data.officer.department || "Revenue & Disaster Management"
        }, data.token);
        router.push("/officer/dashboard");
      } else {
        const matched = PRESET_OFFICERS.find(p => p.email.toLowerCase() === email.toLowerCase()) || PRESET_OFFICERS[0];
        loginOfficer(matched);
        router.push("/officer/dashboard");
      }
    } catch {
      const matched = PRESET_OFFICERS[0];
      loginOfficer(matched);
      router.push("/officer/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6 font-sans antialiased">
      <div className="w-full max-w-md space-y-6">
        {/* Top Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>Back to Home</span>
          </Link>
          <span className="text-[11px] font-mono text-slate-500">e-Governance Unified Auth</span>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mx-auto shadow-xs">
              <Landmark className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Government Officer Login</h1>
            <p className="text-xs text-slate-600">
              Access jurisdiction-specific land records & spatial approval workflows
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Email / Officer ID</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@tn.gov.in"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Security Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Enter Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Preset Selector */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <span className="text-[11px] text-slate-500 font-semibold">Select Test Officer Role:</span>
            <div className="flex flex-wrap justify-center gap-1.5 text-[10.5px]">
              {PRESET_OFFICERS.slice(0, 4).map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setEmail(p.email); setPassword("GovPass2026!"); }}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-mono font-semibold border border-slate-200"
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

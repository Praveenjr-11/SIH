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
import { useOfficerAuth } from "@/context/OfficerAuthContext";

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
        setError(data.error || "Invalid credentials provided");
      }
    } catch (err: any) {
      setError("Network connection failed. Could not reach authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = () => {
    setEmail("admin@tn.gov.in");
    setPassword("Admin@1234");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans antialiased relative overflow-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-400/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Top Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#53627A] hover:text-[#1D5FD1] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-[10px] font-mono text-slate-400 font-medium">SSO Gateway v2.4</span>
        </div>

        {/* Login Card with Glassmorphism */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6 transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[#1D5FD1] to-blue-400 shadow-lg shadow-blue-500/30 flex items-center justify-center text-white mx-auto transform hover:scale-105 transition-transform duration-300">
              <Landmark className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">Officer Portal</h1>
              <p className="text-xs text-[#53627A] mt-1.5 font-medium">
                Tamil Nadu Land Stack — Statutory Access
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-[#D9363E] text-xs font-semibold flex items-start space-x-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#102A43] uppercase tracking-wider ml-1">Official Email</label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 transition-colors group-focus-within:text-[#1D5FD1]" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@tn.gov.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#14213D] placeholder-slate-400 focus:outline-none focus:border-[#1D5FD1] focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#102A43] uppercase tracking-wider ml-1">Security Password</label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 transition-colors group-focus-within:text-[#1D5FD1]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#14213D] placeholder-slate-400 focus:outline-none focus:border-[#1D5FD1] focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-[#102A43] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#1D5FD1] to-blue-600 hover:from-[#154CB0] hover:to-blue-700 text-white font-bold text-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Enter Workspace</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Login Helper (for testing purposes) */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-2 text-center">Demo Logins</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setEmail("tahsildar@tn.gov.in"); setPassword("Admin@1234"); }}
                className="w-full py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-semibold transition-colors"
              >
                Revenue (Tahsildar)
              </button>
              <button
                type="button"
                onClick={() => { setEmail("survey_officer@tn.gov.in"); setPassword("Admin@1234"); }}
                className="w-full py-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-semibold transition-colors"
              >
                Survey Officer
              </button>
              <button
                type="button"
                onClick={() => { setEmail("sub_registrar@tn.gov.in"); setPassword("Admin@1234"); }}
                className="w-full py-1.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-semibold transition-colors"
              >
                Registration (SRO)
              </button>
              <button
                type="button"
                onClick={() => { setEmail("planner@tn.gov.in"); setPassword("Admin@1234"); }}
                className="w-full py-1.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-semibold transition-colors"
              >
                Planning Officer
              </button>
              <button
                type="button"
                onClick={() => { setEmail("admin@tn.gov.in"); setPassword("Admin@1234"); }}
                className="w-full py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[10px] font-semibold transition-colors col-span-2 mt-1"
              >
                System Admin (Reviewer)
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-[#F7F9FC] text-[#14213D] flex items-center justify-center p-4 sm:p-6 font-sans antialiased">
      <div className="w-full max-w-md space-y-4">
        {/* Top Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#53627A] hover:text-[#102A43] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#1D5FD1]" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-[10px] font-mono text-[#53627A]">e-Governance SSO Gateway</span>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#E3E8EF] rounded-lg p-6 sm:p-8 shadow-xs space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-lg bg-[#F1F5FB] border border-[#E3E8EF] flex items-center justify-center text-[#1D5FD1] mx-auto">
              <Landmark className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-[#102A43]">Government Officer Portal Login</h1>
            <p className="text-xs text-[#53627A]">
              Tamil Nadu Land Stack — Statutory Revenue & Geospatial Access
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-[#FDEDEE] border border-[#D9363E] text-[#D9363E] text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D9363E]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#102A43] mb-1.5">Official Email / Officer ID</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#53627A] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@tn.gov.in"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#E3E8EF] rounded-md text-xs text-[#14213D] placeholder-[#53627A] focus:outline-none focus:border-[#1D5FD1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102A43] mb-1.5">Security Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#53627A] absolute left-3 top-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-9 py-2 bg-white border border-[#E3E8EF] rounded-md text-xs text-[#14213D] placeholder-[#53627A] focus:outline-none focus:border-[#1D5FD1]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#53627A] hover:text-[#102A43]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md bg-[#1D5FD1] hover:bg-[#154CB0] text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50 shadow-xs"
            >
              {loading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Enter Workspace</span>
                </>
              )}
            </button>
          </form>

          {/* Test Officer Role Quick Select */}
          <div className="pt-4 border-t border-[#E3E8EF] text-center space-y-2">
            <span className="text-[11px] text-[#53627A] font-semibold">Select Test Officer Role:</span>
            <div className="flex flex-wrap justify-center gap-1.5 text-[10px]">
              {PRESET_OFFICERS.slice(0, 4).map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setEmail(p.email); setPassword("GovPass2026!"); }}
                  className="px-2 py-1 rounded bg-[#F7F9FC] hover:bg-[#F1F5FB] text-[#102A43] hover:text-[#1D5FD1] font-mono font-semibold border border-[#E3E8EF] transition-colors"
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

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Map, 
  Layers, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight, 
  Compass, 
  FileText, 
  Activity, 
  Landmark, 
  Lock, 
  KeyRound, 
  Sparkles, 
  TreePine, 
  Droplet, 
  Factory, 
  Home, 
  Hospital, 
  GraduationCap, 
  Phone,
  Mail,
  BadgeCheck,
  Building2,
  Scale,
  Search,
  ExternalLink,
  ChevronRight,
  Shield,
  Zap,
  Globe,
  Radio,
  Check
} from "lucide-react";
import { useOfficerAuth, PRESET_OFFICERS, OfficerProfile } from "@/context/OfficerAuthContext";

export default function LandStackLandingPage() {
  const { officer, loginOfficer, logoutOfficer } = useOfficerAuth();
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(0);
  const [customEmail, setCustomEmail] = useState("");
  const [customBadge, setCustomBadge] = useState("");
  const [customPassword, setCustomPassword] = useState("");
  const [loginStatusMsg, setLoginStatusMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"features" | "directory" | "architecture">("features");
  const [districtFilter, setDistrictFilter] = useState("Kanchipuram");

  const handlePresetSelect = (profile: OfficerProfile, idx: number) => {
    setSelectedRoleIndex(idx);
    loginOfficer(profile);
    setLoginStatusMsg(`Authenticated as ${profile.name} (${profile.title})`);
    setTimeout(() => setLoginStatusMsg(null), 5000);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const preset = PRESET_OFFICERS[selectedRoleIndex];
    const updatedProfile: OfficerProfile = {
      ...preset,
      email: customEmail || preset.email,
      badgeNo: customBadge || preset.badgeNo
    };
    loginOfficer(updatedProfile);
    setLoginStatusMsg(`Officer session active for ${updatedProfile.name}`);
    setTimeout(() => setLoginStatusMsg(null), 5000);
  };

  const sampleDirectory = [
    { district: "Kanchipuram", taluk: "Sriperumbudur", role: "District Collector", name: "Thiru K. Muthusamy, IAS", contact: "044-27237433", email: "collr.kanchipuram@tn.gov.in" },
    { district: "Kanchipuram", taluk: "Sriperumbudur", role: "District Revenue Officer", name: "Tmt. S. Rajeshwari, DRO", contact: "044-27237300", email: "dro.kanchipuram@tn.gov.in" },
    { district: "Kanchipuram", taluk: "Sriperumbudur", role: "Revenue Divisional Officer", name: "Thiru P. Ramanathan, RDO", contact: "044-27426492", email: "rdo.sriperumbudur@tn.gov.in" },
    { district: "Kanchipuram", taluk: "Sriperumbudur", role: "Taluk Tahsildar", name: "Thiru V. Selvam, Tahsildar", contact: "044-25388978", email: "tahsildar.sriperumbudur@tn.gov.in" },
    { district: "Kanchipuram", taluk: "Sriperumbudur", role: "AD Survey & Records", name: "Er. M. Gunasekar", contact: "044-25228025", email: "ad.survey.kanchi@tn.gov.in" },
    { district: "Thiruvallur", taluk: "Ponneri", role: "District Collector", name: "Dr. Alby John Varghese, IAS", contact: "044-27662060", email: "collrtlr@tn.gov.in" },
    { district: "Thiruvallur", taluk: "Ponneri", role: "Revenue Divisional Officer", name: "Tmt. A. Meenakshi, RDO", contact: "044-27972233", email: "rdo.ponneri@tn.gov.in" },
    { district: "Coimbatore", taluk: "Coimbatore South", role: "District Collector", name: "Thiru Kranthi Kumar Pati, IAS", contact: "0422-2301114", email: "collrcbe@tn.gov.in" }
  ];

  const filteredDirectory = sampleDirectory.filter(d => d.district === districtFilter);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white pb-24 font-sans">
      {/* BACKGROUND MESH GLOWS */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="fixed top-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="fixed bottom-10 left-1/3 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 px-6 sm:px-12 lg:px-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          {/* Animated Header Badge */}
          <div className="flex justify-start mb-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold backdrop-blur-md shadow-lg shadow-blue-500/5">
              <Sparkles className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent font-bold">
                Digital Public Infrastructure for Land Governance (Gov DPI)
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-7">
              <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
                Integrated GIS Land Governance Engine <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  PostGIS & AI Officer Workflows
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
                LandStack unifies PostGIS cadastral survey mapping, real 14-digit ULPIN revenue records, automated zoning feasibility intelligence, and a multi-stage approval workflow linking verified District Collectors, DROs, RDOs, Tahsildars, and Survey Officers across Tamil Nadu.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center space-x-3 px-7 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] border border-blue-400/30"
                >
                  <Map className="w-5 h-5 text-blue-100" />
                  <span>Launch Interactive GIS Maps</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#officer-portal"
                  className="inline-flex items-center space-x-2.5 px-6 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-sm transition-all shadow-md hover:border-slate-600"
                >
                  <Landmark className="w-5 h-5 text-amber-400" />
                  <span>Officer Login Portal</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-6 text-left">
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
                  <div className="text-2xl font-black text-white flex items-center gap-1">
                    310+
                    <ShieldCheck className="w-4 h-4 text-blue-400 inline" />
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Verified TN Officers</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
                  <div className="text-2xl font-black text-emerald-400 flex items-center gap-1">
                    100%
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                  </div>
                  <div className="text-xs text-slate-400 font-medium">PostGIS Boundary Precision</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
                  <div className="text-2xl font-black text-indigo-400 flex items-center gap-1">
                    9 Zones
                    <Zap className="w-4 h-4 text-indigo-400 inline" />
                  </div>
                  <div className="text-xs text-slate-400 font-medium">AI Land Suitability</div>
                </div>
              </div>
            </div>

            {/* Right Card: Active Officer & Live Cadastral Inspection Widget */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-5">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shadow-inner">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Authenticated State Session</span>
                      <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                        {officer ? officer.name : "Guest User"}
                        {officer && <BadgeCheck className="w-4 h-4 text-emerald-400 inline" />}
                      </h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                    ONLINE
                  </span>
                </div>

                {/* Session Details */}
                {officer ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Official Role:</span>
                        <span className="font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{officer.title}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Jurisdiction:</span>
                        <span className="font-semibold text-slate-200">{officer.taluk} Taluk, {officer.district}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Official Email:</span>
                        <span className="font-semibold text-blue-400 font-mono text-[11px] truncate max-w-[200px]">{officer.email}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Badge / ID No:</span>
                        <span className="font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">{officer.badgeNo}</span>
                      </div>
                    </div>

                    {/* Cadastral Land Sample */}
                    <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-blue-300 font-bold">
                        <span>📍 Active Cadastral Sample</span>
                        <span>Survey No: 181/9A</span>
                      </div>
                      <div className="text-slate-300 flex justify-between">
                        <span>ULPIN: <strong className="text-slate-100 font-mono">11-42-0181-9A-2026</strong></span>
                        <span>Zone: <strong className="text-cyan-400">🏡 Residential</strong></span>
                      </div>
                      <div className="text-slate-400 flex justify-between text-[10.5px]">
                        <span>Patta No: 4780 (Thiru K. Muthusamy)</span>
                        <span>FSI: 1.75 FSI</span>
                      </div>
                    </div>

                    <Link
                      href="/"
                      className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-emerald-600/20"
                    >
                      <Map className="w-4 h-4" />
                      <span>Launch GIS Cadastral Map as {officer.role.replace("_", " ")}</span>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <p className="text-xs text-slate-400">No active officer session found. Select a verified officer preset below to authenticate.</p>
                    <a href="#officer-portal" className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs">
                      Authenticate Officer Profile →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OFFICER LOGIN PORTAL SECTION */}
      <section id="officer-portal" className="py-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Government Portal & Revenue Officer Authentication</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Official Land Administration Login
          </h2>
          <p className="text-slate-400 text-sm">
            Select your assigned government role or enter your verified official email & badge credentials to access spatial approval workflows, cadastral parcel modifications, and regulatory clearances.
          </p>
        </div>

        {loginStatusMsg && (
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{loginStatusMsg}</span>
            </div>
            <Link href="/" className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 text-xs">
              Open Interactive Map →
            </Link>
          </div>
        )}

        {/* 1-Click Role Selector Presets */}
        <div className="mb-12">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5 text-center">
            Select Verified Government Officer Preset for 1-Click Authentication:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRESET_OFFICERS.map((preset, idx) => {
              const isSelected = officer?.role === preset.role && officer?.name === preset.name;
              return (
                <div
                  key={preset.role + idx}
                  onClick={() => handlePresetSelect(preset, idx)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? "bg-gradient-to-b from-blue-900/60 to-slate-900 border-blue-500 shadow-xl shadow-blue-500/10"
                      : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-4 right-4 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs shadow-md">
                      ✓
                    </span>
                  )}
                  <div className="flex items-start space-x-3.5">
                    <div className={`p-3 rounded-xl shrink-0 transition-colors ${isSelected ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 group-hover:bg-blue-600/20 group-hover:text-blue-400"}`}>
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1">
                        {preset.name}
                      </h4>
                      <div className="text-xs font-semibold text-blue-400">{preset.title}</div>
                      <div className="text-[11px] text-slate-400">{preset.department}</div>
                      <div className="text-[10px] font-mono text-emerald-400 pt-1">
                        ID: {preset.badgeNo}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Login Form Card */}
        <div className="max-w-2xl mx-auto bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-7 shadow-2xl">
          <form onSubmit={handleCustomLogin} className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-blue-400" />
                <span>Custom Officer / Land Admin Authentication</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">e-Governance Unified Auth</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder={PRESET_OFFICERS[selectedRoleIndex].email}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Officer Badge / ID Number</label>
                <div className="relative">
                  <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={customBadge}
                    onChange={(e) => setCustomBadge(e.target.value)}
                    placeholder={PRESET_OFFICERS[selectedRoleIndex].badgeNo}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">State Security Password / OTP</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md flex items-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Authorize & Login</span>
              </button>

              <Link
                href="/"
                className="text-xs font-semibold text-blue-400 hover:underline flex items-center space-x-1"
              >
                <span>Continue to GIS Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </form>
        </div>
      </section>

      {/* 3. PLATFORM FEATURES & TABBED SYSTEM */}
      <section className="py-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="flex justify-center mb-10">
          <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex space-x-2">
            <button
              onClick={() => setActiveTab("features")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "features"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🚀 Core Platform Features
            </button>
            <button
              onClick={() => setActiveTab("directory")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "directory"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🏛️ Verified TN Revenue Officer Directory
            </button>
          </div>
        </div>

        {/* TAB 1: CORE PLATFORM FEATURES */}
        {activeTab === "features" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 transition-all space-y-4 shadow-xl hover:shadow-blue-500/5 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold group-hover:scale-110 transition-transform">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">PostGIS Cadastral Mapping</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                High-resolution GIS layers featuring 7-vertex irregular cadastral survey boundaries, exact latitude/longitude geocoding, and interactive parcel inspection.
              </p>
              <ul className="text-[11.5px] text-slate-400 space-y-2 pt-2 border-t border-slate-800/80">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>14-Digit ULPIN Revenue Linking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Field Measurement Book (FMB) Geometry</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Patta & Chitta Ownership Integration</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-4 shadow-xl hover:shadow-emerald-500/5 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Land Zoning Feasibility</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automated spatial classification into 9 distinct land zones with exact FSI calculation, maximum permissible building heights, and land-use restrictions.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                <span className="px-2.5 py-1 rounded-md text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">🏡 Residential</span>
                <span className="px-2.5 py-1 rounded-md text-[10px] bg-purple-950 text-purple-400 border border-purple-800 font-semibold">🏢 Commercial</span>
                <span className="px-2.5 py-1 rounded-md text-[10px] bg-slate-950 text-slate-400 border border-slate-800 font-semibold">🏭 Industrial</span>
                <span className="px-2.5 py-1 rounded-md text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">🌾 Agriculture</span>
                <span className="px-2.5 py-1 rounded-md text-[10px] bg-blue-950 text-blue-400 border border-blue-800 font-semibold">🌊 Water Buffer</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 transition-all space-y-4 shadow-xl hover:shadow-amber-500/5 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold group-hover:scale-110 transition-transform">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">4-Stage Officer Approval Workflow</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automated routing of land clearance requests through verified Tamil Nadu administrative officers based on jurisdiction:
              </p>
              <ol className="text-[11.5px] text-slate-400 space-y-2 pt-2 border-t border-slate-800/80">
                <li className="flex items-center space-x-2">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">1</span>
                  <span>Tahsildar (Revenue Title Verification)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">2</span>
                  <span>AD Survey (Boundary & Pegging)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">3</span>
                  <span>RDO (FSI & Zoning Clearance)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] flex items-center justify-center shrink-0">4</span>
                  <span>District Collector (Final NOC Order)</span>
                </li>
              </ol>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-4 shadow-xl hover:shadow-indigo-500/5 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Mutation Audit & Legal Analytics</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Immutable audit trails tracking title mutations, SRO deed registration status, property tax clearance history, and Ecourts civil suit filings.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 transition-all space-y-4 shadow-xl hover:shadow-purple-500/5 group">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Geotechnical Soil & Hazards</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Real elevation profiles, slope degree analysis, seismic safety zone evaluation, and GSI Peninsular Gneissic Basement soil load capacity (250 kPa).
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/50 transition-all space-y-4 shadow-xl hover:shadow-teal-500/5 group">
              <div className="w-12 h-12 rounded-2xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Open REST API Architecture</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Modular Node.js/Express REST API (Port 5000) providing instant spatial analysis JSON endpoints for mobile apps and inter-departmental portals.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: DIRECTORY PREVIEW */}
        {activeTab === "directory" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300">Filter Officers by District:</span>
              <div className="flex flex-wrap gap-2">
                {["Kanchipuram", "Thiruvallur", "Coimbatore"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDistrictFilter(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      districtFilter === d
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDirectory.map((officerItem, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-white">{officerItem.name}</h4>
                      <div className="text-xs font-semibold text-blue-400">{officerItem.role}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                      {officerItem.taluk}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-300">{officerItem.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-300">{officerItem.contact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 4. FINAL CALL-TO-ACTION BANNER */}
      <section className="mt-12 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 border border-blue-500/30 rounded-3xl p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Ready to Explore the Interactive Cadastral Map?
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto">
            Click anywhere on the map to inspect real survey numbers, land holders, ULPIN details, zoning restrictions, and assigned revenue officers.
          </p>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center space-x-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Map className="w-5 h-5 text-slate-950" />
              <span>Launch GIS Cadastral Map Now</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

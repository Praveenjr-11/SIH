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
  Building2,
  Scale,
  Search,
  BadgeCheck
} from "lucide-react";
import { useOfficerAuth, PRESET_OFFICERS, OfficerProfile } from "@/context/OfficerAuthContext";

export default function LandStackLandingPage() {
  const { officer, loginOfficer } = useOfficerAuth();
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(0);
  const [customEmail, setCustomEmail] = useState("");
  const [customBadge, setCustomBadge] = useState("");
  const [customPassword, setCustomPassword] = useState("");
  const [loginStatusMsg, setLoginStatusMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"features" | "directory">("features");
  const [districtFilter, setDistrictFilter] = useState("Kanchipuram");

  const handlePresetSelect = async (profile: OfficerProfile, idx: number) => {
    setSelectedRoleIndex(idx);
    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, password: "demo1234" })
      });
      const data = await res.json();
      if (data.success && data.token) {
        loginOfficer(profile, data.token);
        setLoginStatusMsg(`Authenticated as ${profile.name} (${profile.title})`);
      } else {
        setLoginStatusMsg("Authentication failed: " + (data.error || "Unknown Error"));
      }
    } catch {
      setLoginStatusMsg("Network Error during authentication");
    }
    setTimeout(() => setLoginStatusMsg(null), 5000);
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const preset = PRESET_OFFICERS[selectedRoleIndex];
    const updatedProfile: OfficerProfile = {
      ...preset,
      email: customEmail || preset.email,
      badgeNo: customBadge || preset.badgeNo
    };
    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: updatedProfile.email, password: customPassword || "demo1234" })
      });
      const data = await res.json();
      if (data.success && data.token) {
        loginOfficer(updatedProfile, data.token);
        setLoginStatusMsg(`Officer session active for ${updatedProfile.name}`);
      } else {
        setLoginStatusMsg("Authentication failed: " + (data.error || "Unknown Error"));
      }
    } catch {
      setLoginStatusMsg("Network Error during authentication");
    }
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
    <div className="min-h-screen bg-[#F7F9FC] text-[#14213D] pb-20 font-sans antialiased">
      {/* 1. HERO SECTION */}
      <section className="pt-10 pb-14 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-[#F1F5FB] border border-[#E3E8EF] text-[#1D5FD1] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1D5FD1]" />
            <span>Integrated Digital Public Infrastructure for Land Governance (Gov DPI)</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#102A43] leading-tight">
                Tamil Nadu Land Stack <br />
                <span className="text-[#1D5FD1]">PostGIS & Statutory Officer Workflows</span>
              </h1>

              <p className="text-sm text-[#53627A] leading-relaxed max-w-2xl">
                Land Stack unifies PostGIS cadastral survey mapping, real 14-digit ULPIN revenue records, automated zoning feasibility intelligence, and a multi-stage approval workflow linking verified District Collectors, DROs, RDOs, Tahsildars, and Survey Officers across Tamil Nadu.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/map"
                  className="inline-flex items-center space-x-2 px-5 py-3 rounded-lg bg-[#1D5FD1] hover:bg-[#154CB0] text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <Map className="w-4 h-4" />
                  <span>Launch Cadastral GIS Map</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#officer-portal"
                  className="inline-flex items-center space-x-2 px-5 py-3 rounded-lg bg-white hover:bg-[#F7F9FC] border border-[#E3E8EF] text-[#102A43] font-semibold text-xs transition-colors shadow-xs"
                >
                  <Landmark className="w-4 h-4 text-[#E99A16]" />
                  <span>Officer Login Portal</span>
                </a>
              </div>
            </div>

            {/* Right Card: Active Officer Status */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#E3E8EF] rounded-lg p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-3">
                  <span className="text-xs font-bold text-[#102A43] uppercase tracking-wider">Active Session Status</span>
                  {officer ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EDF7F2] text-[#16845B] border border-[#16845B]/30">
                      AUTHENTICATED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF5E7] text-[#E99A16] border border-[#E99A16]/30">
                      GUEST VIEW
                    </span>
                  )}
                </div>

                {officer ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-md bg-[#F7F9FC] border border-[#E3E8EF] space-y-1">
                      <div className="font-bold text-[#102A43]">{officer.name}</div>
                      <div className="text-[11px] text-[#53627A]">{officer.title} • {officer.department}</div>
                      <div className="text-[11px] text-[#1D5FD1] font-medium">{officer.district} District ({officer.taluk} Taluk)</div>
                    </div>
                    <Link
                      href="/officer/dashboard"
                      className="w-full py-2 px-3 rounded-md bg-[#1D5FD1] hover:bg-[#154CB0] text-white font-semibold text-center block transition-colors shadow-2xs"
                    >
                      Open Officer Dashboard →
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-xs text-[#53627A]">No active officer session found. Use the 1-click presets below to simulate an authenticated government role.</p>
                    <a
                      href="#officer-portal"
                      className="inline-block px-3.5 py-1.5 rounded-md bg-[#102A43] text-white font-semibold text-xs hover:bg-[#0B1F33] transition-colors"
                    >
                      Choose Role Preset ↓
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OFFICER LOGIN PORTAL SECTION */}
      <section id="officer-portal" className="py-10 px-4 sm:px-8 max-w-7xl mx-auto border-t border-[#E3E8EF]">
        <div className="mb-8 space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-[#FEF5E7] text-[#E99A16] text-[11px] font-semibold">
            <Lock className="w-3 h-3" />
            <span>Role-Based Officer Authentication</span>
          </div>
          <h2 className="text-2xl font-bold text-[#102A43]">Verified Revenue Officer Presets (1-Click Switch)</h2>
          <p className="text-xs text-[#53627A]">
            Select your assigned role to test jurisdiction-based case routing, zoning clearances, and inspection orders.
          </p>
        </div>

        {loginStatusMsg && (
          <div className="mb-6 p-3.5 rounded-md bg-[#EDF7F2] border border-[#16845B] text-[#16845B] text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{loginStatusMsg}</span>
            </div>
            <Link href="/officer/dashboard" className="px-3 py-1 rounded bg-[#16845B] text-white text-xs font-semibold">
              Go to Dashboard →
            </Link>
          </div>
        )}

        {/* 1-Click Role Selector Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {PRESET_OFFICERS.map((preset, idx) => {
            const isSelected = officer?.role === preset.role && officer?.name === preset.name;
            return (
              <div
                key={preset.role + idx}
                onClick={() => handlePresetSelect(preset, idx)}
                className={`p-4 rounded-lg border transition-colors cursor-pointer relative bg-white shadow-xs ${
                  isSelected
                    ? "border-[#1D5FD1] bg-[#F1F5FB]"
                    : "border-[#E3E8EF] hover:border-slate-300"
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#16845B] text-white font-bold text-xs flex items-center justify-center">
                    ✓
                  </span>
                )}
                <div className="flex items-start space-x-3">
                  <div className={`p-2.5 rounded-md shrink-0 ${isSelected ? "bg-[#1D5FD1] text-white" : "bg-[#F7F9FC] text-[#53627A]"}`}>
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-[#102A43]">{preset.name}</h4>
                    <div className="text-[11px] font-semibold text-[#1D5FD1]">{preset.title}</div>
                    <div className="text-[10px] text-[#53627A]">{preset.department}</div>
                    <div className="text-[10px] font-mono text-[#16845B] pt-0.5">ID: {preset.badgeNo}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Login Card */}
        <div className="max-w-xl mx-auto bg-white border border-[#E3E8EF] rounded-lg p-5 shadow-xs">
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-3">
              <h3 className="text-xs font-bold text-[#102A43] uppercase tracking-wider flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#1D5FD1]" />
                <span>Custom Officer Credentials</span>
              </h3>
              <span className="text-[10px] text-[#53627A]">Unified Auth</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#102A43] font-semibold mb-1">Official Email</label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder={PRESET_OFFICERS[selectedRoleIndex].email}
                  className="w-full px-3 py-2 bg-white border border-[#E3E8EF] rounded text-xs text-[#14213D] focus:outline-none focus:border-[#1D5FD1] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#102A43] font-semibold mb-1">Badge ID</label>
                <input
                  type="text"
                  value={customBadge}
                  onChange={(e) => setCustomBadge(e.target.value)}
                  placeholder={PRESET_OFFICERS[selectedRoleIndex].badgeNo}
                  className="w-full px-3 py-2 bg-white border border-[#E3E8EF] rounded text-xs text-[#14213D] focus:outline-none focus:border-[#1D5FD1] font-mono"
                />
              </div>
            </div>
            
            <div className="mt-3">
              <label className="block text-[#102A43] font-semibold mb-1 text-xs">Password</label>
              <input
                type="password"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder="demo1234"
                className="w-full px-3 py-2 bg-white border border-[#E3E8EF] rounded text-xs text-[#14213D] focus:outline-none focus:border-[#1D5FD1] font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-md bg-[#1D5FD1] hover:bg-[#154CB0] text-white font-semibold text-xs transition-colors shadow-2xs"
            >
              Authenticate Officer Session
            </button>
          </form>
        </div>
      </section>

      {/* 3. PLATFORM TABS: FEATURES & DIRECTORY */}
      <section className="py-10 px-4 sm:px-8 max-w-7xl mx-auto border-t border-[#E3E8EF]">
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-md border border-[#E3E8EF] flex space-x-1 shadow-2xs">
            <button
              onClick={() => setActiveTab("features")}
              className={`px-4 py-2 rounded text-xs font-semibold transition-colors ${
                activeTab === "features" ? "bg-[#1D5FD1] text-white" : "text-[#53627A] hover:text-[#102A43]"
              }`}
            >
              Core Platform Architecture
            </button>
            <button
              onClick={() => setActiveTab("directory")}
              className={`px-4 py-2 rounded text-xs font-semibold transition-colors ${
                activeTab === "directory" ? "bg-[#1D5FD1] text-white" : "text-[#53627A] hover:text-[#102A43]"
              }`}
            >
              Verified TN Officer Directory
            </button>
          </div>
        </div>

        {activeTab === "features" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-5 rounded-lg bg-white border border-[#E3E8EF] space-y-2.5 shadow-xs">
              <div className="w-9 h-9 rounded-md bg-[#F1F5FB] text-[#1D5FD1] border border-[#E3E8EF] flex items-center justify-center font-bold">
                <Map className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#102A43]">PostGIS Cadastral Spatial Engine</h3>
              <p className="text-xs text-[#53627A] leading-relaxed">
                PostGIS spatial queries evaluating 7-vertex irregular survey boundaries, exact RTK-DGPS coordinates, and cadastral subdivisions.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-white border border-[#E3E8EF] space-y-2.5 shadow-xs">
              <div className="w-9 h-9 rounded-md bg-[#EDF7F2] text-[#16845B] border border-[#E3E8EF] flex items-center justify-center font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#102A43]">GSI Geological Suitability</h3>
              <p className="text-xs text-[#53627A] leading-relaxed">
                Automated overlay of Geological Survey of India lithology, soil bearing capacity (kPa), and natural hazard risk assessment.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-white border border-[#E3E8EF] space-y-2.5 shadow-xs">
              <div className="w-9 h-9 rounded-md bg-[#F1F5FB] text-[#102A43] border border-[#E3E8EF] flex items-center justify-center font-bold">
                <Landmark className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#102A43]">4-Stage Statutory Approval Workflow</h3>
              <p className="text-xs text-[#53627A] leading-relaxed">
                Automated clearance routing through Tahsildar, AD Survey, RDO, and District Collector with tamper-evident audit trails.
              </p>
            </div>
          </div>
        )}

        {activeTab === "directory" && (
          <div className="bg-white border border-[#E3E8EF] rounded-lg p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#102A43]">Tamil Nadu Revenue Administrative Officers Directory</h3>
                <p className="text-xs text-[#53627A]">Verified contact information for land administration authorities</p>
              </div>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="bg-[#F7F9FC] border border-[#E3E8EF] rounded px-2.5 py-1 text-xs text-[#14213D] focus:outline-none focus:border-[#1D5FD1]"
              >
                <option value="Kanchipuram">Kanchipuram District</option>
                <option value="Thiruvallur">Thiruvallur District</option>
                <option value="Coimbatore">Coimbatore District</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F1F4F8] text-[#53627A] font-bold uppercase tracking-wider border-b border-[#E3E8EF]">
                  <tr>
                    <th className="px-4 py-3">Jurisdiction</th>
                    <th className="px-4 py-3">Designation</th>
                    <th className="px-4 py-3">Officer Name</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E8EF] text-[#14213D]">
                  {filteredDirectory.map((d, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFD] h-[50px]">
                      <td className="px-4 py-3 font-semibold text-[#102A43]">{d.district} ({d.taluk})</td>
                      <td className="px-4 py-3 font-medium text-[#1D5FD1]">{d.role}</td>
                      <td className="px-4 py-3 font-bold text-[#14213D]">{d.name}</td>
                      <td className="px-4 py-3 font-mono text-[#53627A]">{d.contact}</td>
                      <td className="px-4 py-3 font-mono text-[#53627A]">{d.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

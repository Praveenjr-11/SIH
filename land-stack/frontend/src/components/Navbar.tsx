"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Map, 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  BarChart3, 
  Settings, 
  Lock, 
  CheckCircle2, 
  Bell, 
  HelpCircle, 
  User, 
  ChevronDown, 
  LogOut, 
  ShieldCheck,
  Building2
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { officer, logoutOfficer } = useOfficerAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logoutOfficer();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 font-sans antialiased shadow-sm">
      {/* TIER 1: TOP DARK NAVY HEADER (Government Branding & Officer Session Header) */}
      <div className="bg-[#0F223A] text-white px-4 sm:px-8 py-3 flex items-center justify-between border-b border-[#1A3354]">
        {/* LEFT: TAMIL NADU GOVT EMBLEM & LAND STACK BRANDING */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center space-x-3.5 group cursor-pointer">
            {/* Tamil Nadu State Seal Badge Icon */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 via-emerald-600 to-emerald-800 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-full bg-[#0F223A] flex items-center justify-center p-0.5 shrink-0">
                <svg viewBox="0 0 100 100" width={36} height={36} className="w-9 h-9 text-amber-400 fill-current shrink-0" style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px' }}>
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#107049" strokeWidth="4" />
                  <path d="M50 10 L64 34 H36 Z M38 34 L62 34 L65 82 H35 Z" fill="#FBBF24" />
                  <path d="M41 43 H59 M41 51 H59 M41 59 H59 M41 67 H59 M41 75 H59" stroke="#0F223A" strokeWidth="2.5" fill="none" />
                  <circle cx="50" cy="22" r="3" fill="#F59E0B" />
                </svg>
              </div>
            </div>

            <div>
              <h1 className="font-black text-xl tracking-wider text-white group-hover:text-emerald-300 transition-colors leading-tight">
                LAND STACK
              </h1>
              <p className="text-[12px] font-medium text-slate-200 leading-tight">Government of Tamil Nadu</p>
              <p className="text-[10.5px] text-slate-400 font-medium leading-tight">Integrated Land Governance Platform</p>
            </div>
          </Link>

          {/* Vertical Divider */}
          <div className="h-10 w-px bg-slate-600/50 mx-6 hidden lg:block"></div>
        </div>

        {/* RIGHT: OFFICER SESSION BADGE & ACTION CONTROLS */}
        <div className="flex items-center space-x-4 shrink-0">
          {officer ? (
            <>
              {/* Green Officer Pill Badge */}
              <div className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#188A58] border border-[#20A66C] text-white font-extrabold text-xs shadow-xs">
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[#188A58]">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-[#188A58] text-white" />
                </div>
                <span>Officer</span>
              </div>

              {/* Officer Info & Role Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 text-left hover:bg-slate-800/60 px-2 py-1 rounded-xl transition-colors"
                >
                  <div className="text-right text-xs">
                    <div className="text-slate-200 font-normal text-[12.5px] leading-tight">
                      Welcome, <strong className="font-black text-white">{officer.name.split(",")[0]}</strong>
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium flex items-center justify-end gap-1 leading-tight">
                      <span>{officer.title}, {officer.district} {officer.taluk ? officer.taluk + ' Taluk' : ''}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    </div>
                  </div>
                </button>

                {/* DROPDOWN MENU */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#0F223A] border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-slate-100">
                    <div className="px-4 py-3 border-b border-slate-700 space-y-1">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{officer.name}</span>
                      </div>
                      <div className="text-[10.5px] text-slate-300">{officer.title}</div>
                      <div className="text-[9.5px] font-mono text-emerald-400 flex items-center gap-1 pt-1">
                        <Building2 className="w-3 h-3 text-emerald-400" />
                        <span>{officer.department}</span>
                      </div>
                      <div className="text-[9.5px] text-slate-400 pt-0.5">
                        Badge ID: <strong className="text-white">{officer.badgeNo}</strong>
                      </div>
                    </div>

                    <div className="py-1 text-xs">
                      <Link
                        href="/officer/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-slate-200 hover:bg-slate-800 font-semibold"
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                        <span>Officer Dashboard</span>
                      </Link>

                      <Link
                        href="/officer/cases"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-slate-200 hover:bg-slate-800 font-semibold"
                      >
                        <FolderKanban className="w-4 h-4 text-amber-400" />
                        <span>Land Cases</span>
                      </Link>

                      <Link
                        href="/officer/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-slate-200 hover:bg-slate-800 font-semibold"
                      >
                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                        <span>Switch Officer Role</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-700 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 font-bold text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out Officer Session</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Bell Icon with Red Counter Badge */}
              <button className="relative p-2 text-slate-300 hover:text-white transition-colors" title="Notifications">
                <Bell className="w-5 h-5 text-slate-200" />
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9.5px] font-black flex items-center justify-center shadow-xs">
                  3
                </span>
              </button>

              {/* Help Icon */}
              <button className="p-2 text-slate-300 hover:text-white transition-colors hidden sm:block" title="System Help">
                <HelpCircle className="w-5 h-5 text-slate-200" />
              </button>

              {/* Vertical Separator */}
              <div className="h-7 w-px bg-slate-600/50 mx-1"></div>

              {/* User Avatar Circle */}
              <div className="flex items-center space-x-1">
                <div className="w-9 h-9 rounded-full bg-[#3070AA] border border-blue-400/40 flex items-center justify-center text-white shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </>
          ) : (
            <Link
              href="/officer/login"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#188A58] hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md transition-all border border-emerald-400/30"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Officer Portal Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* TIER 2: BOTTOM NAVIGATION BAR (Light Mode Bar with Conditional Officer Menu Container) */}
      <div className="bg-[#F4F7FA] border-b border-slate-200 px-6 sm:px-10 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-6 w-full justify-between">
          {/* LEFT: NAVIGATION ITEMS */}
          <div className="flex items-center space-x-4 overflow-x-auto py-0.5">
            {/* PUBLIC ITEM: HOME */}
            <Link
              href="/"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
                pathname === "/" 
                  ? "text-[#0F223A] bg-white border border-slate-200 shadow-xs" 
                  : "text-[#2B3B4E] hover:text-[#0F223A] hover:bg-white/80"
              }`}
            >
              <Home className="w-4.5 h-4.5 text-[#2B3B4E]" />
              <span>Home</span>
            </Link>

            {/* PUBLIC ITEM: EXPLORE MAP */}
            <Link
              href="/map"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
                pathname === "/map" 
                  ? "bg-blue-600 text-white shadow-xs" 
                  : "text-[#2B3B4E] hover:text-[#0F223A] hover:bg-white/80"
              }`}
            >
              <Map className="w-4.5 h-4.5 text-blue-600" />
              <span>Explore India Map</span>
            </Link>

            {/* OFFICER-ONLY CONTAINER: VISIBLE ONLY TO AUTHENTICATED OFFICERS */}
            {officer && (
              <div className="relative flex items-center space-x-1.5 bg-[#E6F7F0] border border-[#107049] px-2 py-1 rounded-full shadow-xs">
                {/* Officer Dashboard */}
                <Link
                  href="/officer/dashboard"
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-[13.5px] font-black transition-all relative ${
                    pathname === "/officer/dashboard"
                      ? "text-[#043427] bg-emerald-200/60 shadow-xs"
                      : "text-[#0B5D37] hover:text-[#043427] hover:bg-emerald-100/60"
                  }`}
                >
                  <LayoutDashboard className="w-4.5 h-4.5 text-[#107049]" />
                  <span>Officer Dashboard</span>
                </Link>

                {/* Land Cases */}
                <Link
                  href="/officer/cases"
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-[13.5px] font-black transition-all relative ${
                    pathname === "/officer/cases" || pathname.startsWith("/officer/cases/")
                      ? "text-[#043427] bg-emerald-200/60 shadow-xs"
                      : "text-[#0B5D37] hover:text-[#043427] hover:bg-emerald-100/60"
                  }`}
                >
                  <FolderKanban className="w-4.5 h-4.5 text-[#107049]" />
                  <span>Land Cases</span>
                </Link>

                {/* Land Registry */}
                <Link
                  href="/registry"
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-[13.5px] font-black transition-all relative ${
                    pathname === "/registry"
                      ? "text-[#043427] bg-emerald-200/60 shadow-xs"
                      : "text-[#0B5D37] hover:text-[#043427] hover:bg-emerald-100/60"
                  }`}
                >
                  <FileText className="w-4.5 h-4.5 text-[#107049]" />
                  <span>Land Registry</span>
                </Link>

                {/* Governance Analytics */}
                <Link
                  href="/analytics"
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-[13.5px] font-black transition-all relative ${
                    pathname === "/analytics"
                      ? "text-[#043427] bg-emerald-200/60 shadow-xs"
                      : "text-[#0B5D37] hover:text-[#043427] hover:bg-emerald-100/60"
                  }`}
                >
                  <BarChart3 className="w-4.5 h-4.5 text-[#107049]" />
                  <span>Governance Analytics</span>
                </Link>

                {/* Green Floating Badge Tooltip matching screenshot */}
                <div className="hidden xl:flex absolute -bottom-9 left-1/2 -translate-x-1/2 flex-col items-center pointer-events-none z-30">
                  {/* Arrow Triangle pointing UP */}
                  <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[7px] border-b-[#107049]"></div>
                  {/* Dark green badge */}
                  <div className="bg-[#107049] text-white text-[11px] font-semibold px-3.5 py-1 rounded-lg flex items-center gap-2 shadow-lg border border-[#168759] whitespace-nowrap">
                    <Lock className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="font-bold">Officer-only menu</span>
                    <span className="text-emerald-300/80">|</span>
                    <span className="text-emerald-100 font-medium">Visible only to authenticated government officers</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: SETTINGS ITEM */}
          {officer && (
            <div className="shrink-0 pl-2">
              <button 
                onClick={() => router.push("/officer/dashboard")}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[13px] font-extrabold text-[#2B3B4E] hover:text-[#0F223A] hover:bg-white transition-colors"
              >
                <Settings className="w-4.5 h-4.5 text-[#2B3B4E]" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

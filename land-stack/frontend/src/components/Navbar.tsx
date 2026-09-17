"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Map, 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  BarChart3, 
  Lock, 
  CheckCircle2, 
  Bell, 
  ChevronDown, 
  LogOut, 
  ShieldCheck,
  Building2,
  Search,
  X,
  Globe,
  Menu,
  History,
  Users
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";

/**
 * Calculates initials from the officer name.
 * For "Thiru K. Muthusamy, IAS", returns "TK".
 */
function getOfficerInitials(name?: string): string {
  if (!name) return "TK";
  const clean = name.replace(/,/g, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (parts[0]?.slice(0, 2) || "TK").toUpperCase();
}

export interface NavbarProps {
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export default function Navbar({ onToggleSidebar, showSidebarToggle }: NavbarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { officer, logoutOfficer } = useOfficerAuth();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Check if current route is part of officer dashboard/management portal
  const isOfficerPortal = 
    pathname === "/" ||
    (pathname.startsWith("/officer") && pathname !== "/officer/login") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/cases") ||
    pathname === "/gis" ||
    (Boolean(officer) && (pathname === "/map" || pathname === "/registry" || pathname === "/analytics" || pathname === "/integration" || pathname === "/satellite" || pathname === "/reports" || pathname === "/audit" || pathname === "/users"));

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logoutOfficer();
    router.push("/");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/officer/cases?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  // Close popovers on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setNotificationsOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  // OFFICER DETAILS WITH AUTH BINDING & FALLBACKS
  const officerName = officer?.name || "Thiru K. Muthusamy, IAS";
  const officerTitle = officer 
    ? (officer.role === "DISTRICT_COLLECTOR" ? "District Collector" : officer.title.split("&")[0].trim())
    : "District Collector";
  const officerDistrict = officer?.district ? `${officer.district} District` : "Kanchipuram District";
  const officerInitials = getOfficerInitials(officer?.name);

  // =========================================================================
  // OFFICER DASHBOARD HEADER (CLEAN WHITE GOVERNMENT PORTAL HEADER)
  // =========================================================================
  if (isOfficerPortal) {
    return (
      <header className="sticky top-0 z-50 bg-white border-b border-[#E3E8EF] shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] font-sans antialiased">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* LEFT/TOP BRANDING */}
          <div className="flex items-center space-x-3 shrink-0">
            {showSidebarToggle && (
              <button
                onClick={onToggleSidebar}
                className="p-1.5 rounded-md text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC] focus:outline-none shrink-0 transition-colors"
                title="Toggle Sidebar Navigation"
                aria-label="Toggle Sidebar Navigation"
              >
                <Menu className="w-5 h-5 text-[#102A43]" />
              </button>
            )}

            <Link 
              href="/" 
              className="flex items-center space-x-3 group focus:outline-none"
              title="Tamil Nadu Land Stack - Officer Dashboard"
            >
              {/* Official Tamil Nadu Government State Emblem */}
              <img
                src="/assets/images/tn_state_emblem.svg"
                alt="Official Tamil Nadu Government Emblem"
                className="w-9 h-auto max-h-10 object-contain shrink-0"
                width={36}
                height={39}
              />

              {/* Branding and Slogan Display */}
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm sm:text-base tracking-wide text-[#102A43] leading-none">
                    LAND STACK
                  </span>
                  <span className="text-[9px] uppercase tracking-wider bg-[#F1F5FB] text-[#1D5FD1] px-1.5 py-0.5 rounded font-bold border border-blue-200/60 leading-none">
                    OFFICER
                  </span>
                </div>
                
                {/* Motto: Secure Land | Empowering People | A Prosperous Tamil Nadu */}
                <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-medium text-[#53627A] pt-1 leading-none whitespace-nowrap">
                  <span className="text-[#102A43] font-semibold">Secure Land</span>
                  <span className="text-[#CBD5E1]">|</span>
                  <span>Empowering People</span>
                  <span className="text-[#CBD5E1]">|</span>
                  <span className="text-[#102A43] font-semibold">A Prosperous Tamil Nadu</span>
                </div>
              </div>
            </Link>
          </div>

          {/* CENTER: LARGE GLOBAL SEARCH BAR (approx. 450–550px wide on desktop) */}
          <div className="hidden md:flex flex-1 justify-center max-w-[540px]">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative flex items-center w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#53627A]">
                  <Search className="w-4 h-4 text-[#53627A]" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Case ID / Survey No. / Village / Owner Name..."
                  className="w-full h-10 pl-9 pr-24 rounded-md border border-[#E3E8EF] bg-white text-xs sm:text-[13px] text-[#14213D] placeholder:text-[#53627A]/75 focus:outline-none focus:border-[#1D5FD1] focus:ring-1 focus:ring-[#1D5FD1] shadow-xs transition-all"
                />
                <div className="absolute right-1 inset-y-1 flex items-center">
                  <button
                    type="submit"
                    className="h-8 px-4 rounded bg-[#1D5FD1] hover:bg-[#154CB0] text-white text-xs font-semibold flex items-center space-x-1 shadow-xs transition-colors"
                  >
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* RIGHT: NOTIFICATION BELL, CIRCULAR AVATAR (TK), OFFICER INFORMATION & DROPDOWN */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2 text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC] rounded-lg transition-colors"
              title="Toggle search"
            >
              {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUserDropdownOpen(false);
                }}
                className="relative p-2 rounded-lg text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC] transition-colors border border-transparent hover:border-[#E3E8EF] focus:outline-none"
                title="Official Notifications"
                aria-label="Official Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D9363E] ring-2 ring-white"></span>
              </button>

              {/* NOTIFICATIONS POPOVER */}
              {notificationsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setNotificationsOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E3E8EF] rounded-lg shadow-lg py-2 z-50 text-[#14213D]">
                    <div className="px-4 py-2.5 border-b border-[#E3E8EF] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#102A43] uppercase tracking-wider">Statutory Notifications</span>
                      <span className="text-[11px] font-semibold bg-[#EDF7F2] text-[#16845B] px-2 py-0.5 rounded">3 New</span>
                    </div>
                    <div className="divide-y divide-[#E3E8EF] text-xs max-h-72 overflow-y-auto">
                      <div className="p-3 hover:bg-[#F7F9FC] transition-colors cursor-pointer">
                        <div className="font-semibold text-[#102A43]">NOC Clearance Required</div>
                        <div className="text-[11px] text-[#53627A] mt-0.5">Survey #142/2A, Sriperumbudur - Awaiting collector statutory review</div>
                        <div className="text-[10px] text-slate-400 mt-1">12 mins ago</div>
                      </div>
                      <div className="p-3 hover:bg-[#F7F9FC] transition-colors cursor-pointer">
                        <div className="font-semibold text-[#102A43]">Drone Cadastral Survey Ingestion</div>
                        <div className="text-[11px] text-[#53627A] mt-0.5">LiDAR orthophoto 1:500 dataset synchronized for Kanchipuram District</div>
                        <div className="text-[10px] text-slate-400 mt-1">1 hour ago</div>
                      </div>
                      <div className="p-3 hover:bg-[#F7F9FC] transition-colors cursor-pointer">
                        <div className="font-semibold text-[#102A43]">Encroachment Risk Alert</div>
                        <div className="text-[11px] text-[#53627A] mt-0.5">AI detected 12.4% boundary deviation on Government Poramboke parcel</div>
                        <div className="text-[10px] text-slate-400 mt-1">3 hours ago</div>
                      </div>
                    </div>
                    <div className="p-2 border-t border-[#E3E8EF] bg-[#F7F9FC] text-center">
                      <Link 
                        href="/officer/cases" 
                        onClick={() => setNotificationsOpen(false)}
                        className="text-[11px] text-[#1D5FD1] hover:underline font-semibold"
                      >
                        View All Jurisdictional Notices →
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Officer Profile Trigger & Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center space-x-2.5 px-2 py-1.5 rounded-lg hover:bg-[#F7F9FC] border border-transparent hover:border-[#E3E8EF] transition-colors focus:outline-none"
                title={`${officerName} - ${officerTitle}`}
              >
                {/* Circular Avatar: TK */}
                <div className="w-9 h-9 rounded-full bg-[#102A43] text-white font-bold text-xs flex items-center justify-center border border-[#102A43]/20 shadow-xs shrink-0 tracking-wider">
                  {officerInitials}
                </div>

                {/* Officer Information (3 lines) */}
                <div className="hidden lg:flex flex-col text-left leading-tight">
                  <span className="text-[12px] font-bold text-[#102A43] truncate max-w-[210px]">
                    {officerName}
                  </span>
                  <span className="text-[11px] font-medium text-[#53627A] truncate max-w-[210px]">
                    {officerTitle}
                  </span>
                  <span className="text-[10px] font-medium text-[#53627A] truncate max-w-[210px]">
                    {officerDistrict}
                  </span>
                </div>

                {/* Dropdown Arrow */}
                <ChevronDown className={`w-4 h-4 text-[#53627A] shrink-0 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* USER DROPDOWN POPOVER */}
              {userDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-[#E3E8EF] rounded-lg shadow-lg py-2 z-50 text-[#14213D]">
                    {/* Header with full officer info */}
                    <div className="px-4 py-3 border-b border-[#E3E8EF] space-y-1 bg-[#F7F9FC]">
                      <div className="text-xs font-bold text-[#102A43] flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#16845B]" />
                        <span>{officerName}</span>
                      </div>
                      <div className="text-[11px] text-[#53627A] font-semibold">{officerTitle}</div>
                      <div className="text-[10.5px] text-[#53627A]">{officerDistrict}</div>
                      {officer?.department && (
                        <div className="text-[10px] text-[#1D5FD1] flex items-center gap-1 pt-0.5">
                          <Building2 className="w-3 h-3 text-[#1D5FD1]" />
                          <span>{officer.department}</span>
                        </div>
                      )}
                      {officer?.badgeNo && (
                        <div className="text-[10px] text-[#53627A] font-mono pt-0.5">
                          Badge ID: <strong className="text-[#102A43]">{officer.badgeNo}</strong>
                        </div>
                      )}
                    </div>

                    {/* Navigation modules */}
                    <div className="py-1 text-xs">
                      <Link
                        href="/officer/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-[#14213D] hover:bg-[#F7F9FC] font-medium transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#16845B]" />
                        <span>Officer Dashboard</span>
                      </Link>

                      <Link
                        href="/officer/cases"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-[#14213D] hover:bg-[#F7F9FC] font-medium transition-colors"
                      >
                        <FolderKanban className="w-4 h-4 text-[#1D5FD1]" />
                        <span>Land Cases Registry</span>
                      </Link>

                      <Link
                        href="/map"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-[#14213D] hover:bg-[#F7F9FC] font-medium transition-colors"
                      >
                        <Map className="w-4 h-4 text-[#E99A16]" />
                        <span>Cadastral GIS Map</span>
                      </Link>

                      <Link
                        href="/officer/audit"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-[#14213D] hover:bg-[#F7F9FC] font-medium transition-colors"
                      >
                        <History className="w-4 h-4 text-[#1D5FD1]" />
                        <span>Audit Trail</span>
                      </Link>

                      <Link
                        href="/officer/users"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-[#14213D] hover:bg-[#F7F9FC] font-medium transition-colors"
                      >
                        <Users className="w-4 h-4 text-[#16845B]" />
                        <span>User Management</span>
                      </Link>

                      <Link
                        href="/"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-[#14213D] hover:bg-[#F7F9FC] font-medium transition-colors"
                      >
                        <Globe className="w-4 h-4 text-[#53627A]" />
                        <span>Citizen Public Portal</span>
                      </Link>

                      <Link
                        href="/officer/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-[#14213D] hover:bg-[#F7F9FC] font-medium transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#16845B]" />
                        <span>Switch Officer Role</span>
                      </Link>
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-[#E3E8EF] pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-[#D9363E] hover:bg-red-50 font-semibold text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-[#D9363E]" />
                        <span>Sign Out Officer Session</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE SEARCH EXPANDABLE ROW */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 py-2.5 border-t border-[#E3E8EF] bg-[#F7F9FC]">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Case ID / Survey No. / Village / Owner Name..."
                className="flex-1 h-9 px-3 rounded-md border border-[#E3E8EF] bg-white text-xs text-[#14213D] focus:outline-none focus:border-[#1D5FD1]"
                autoFocus
              />
              <button
                type="submit"
                className="h-9 px-4 rounded bg-[#1D5FD1] text-white text-xs font-semibold shrink-0"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </header>
    );
  }

  // =========================================================================
  // PUBLIC / CITIZEN NAVIGATION (Default)
  // =========================================================================
  return (
    <header className="sticky top-0 z-50 font-sans antialiased">
      {/* TIER 1: GOVERNMENT BRANDING & OFFICER SESSION HEADER (Primary Navy: #102A43) */}
      <div className="bg-[#102A43] text-white px-4 sm:px-8 py-2.5 flex items-center justify-between border-b border-[#1C3D5D]">
        {/* LEFT: TAMIL NADU STATE SEAL & LAND STACK BRANDING */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          {showSidebarToggle && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-[#1C3D5D] focus:outline-none shrink-0 transition-colors"
              title="Toggle Sidebar Navigation"
              aria-label="Toggle Sidebar Navigation"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          )}

          <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
            {/* Tamil Nadu State Seal Badge */}
            <div className="w-11 h-11 rounded-full bg-[#0D2237] border-2 border-[#E99A16] flex items-center justify-center p-1 shrink-0">
              <svg viewBox="0 0 100 100" width={32} height={32} className="w-8 h-8 text-[#E99A16] fill-current shrink-0">
                <circle cx="50" cy="50" r="46" fill="none" stroke="#16845B" strokeWidth="4" />
                <path d="M50 10 L64 34 H36 Z M38 34 L62 34 L65 82 H35 Z" fill="#E99A16" />
                <path d="M41 43 H59 M41 51 H59 M41 59 H59 M41 67 H59 M41 75 H59" stroke="#102A43" strokeWidth="2.5" fill="none" />
                <circle cx="50" cy="22" r="3" fill="#E99A16" />
              </svg>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-lg tracking-wider text-white leading-tight">
                  LAND STACK
                </h1>
                <span className="text-[10px] uppercase tracking-widest bg-[#1D5FD1] text-white px-1.5 py-0.5 rounded font-bold">
                  DPI
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium leading-tight">Government of Tamil Nadu</p>
              <p className="text-[10px] text-slate-400 leading-tight">Integrated Land Governance & Cadastral Geospatial Platform</p>
            </div>
          </Link>
        </div>

        {/* RIGHT: OFFICER SESSION BADGE & SESSION MANAGEMENT */}
        <div className="flex items-center space-x-3 shrink-0">
          {officer ? (
            <>
              {/* Green Verified Officer Pill */}
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded bg-[#16845B] border border-[#1FA875] text-white font-semibold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Verified Officer</span>
              </div>

              {/* Officer Profile & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 text-left hover:bg-[#1C3D5D] px-2.5 py-1.5 rounded-lg transition-colors border border-transparent hover:border-[#2C5277]"
                >
                  <div className="text-right text-xs">
                    <div className="text-slate-200 font-medium text-[12px] leading-tight">
                      {officer.name.split(",")[0]}
                    </div>
                    <div className="text-[10.5px] text-slate-300 flex items-center justify-end gap-1 leading-tight">
                      <span className="truncate max-w-[180px]">{officer.title}, {officer.district}</span>
                      <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#1D5FD1] border border-blue-400/40 flex items-center justify-center text-white shrink-0 font-bold text-xs">
                    {officer.name.charAt(0)}
                  </div>
                </button>

                {/* USER DROPDOWN POPOVER */}
                {userDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setUserDropdownOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-[#FFFFFF] border border-[#E3E8EF] rounded-lg shadow-lg py-2 z-50 text-[#14213D]">
                      <div className="px-4 py-3 border-b border-[#E3E8EF] space-y-1 bg-[#F7F9FC]">
                        <div className="text-xs font-bold text-[#102A43] flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-[#16845B]" />
                          <span>{officer.name}</span>
                        </div>
                        <div className="text-[11px] text-[#53627A] font-medium">{officer.title}</div>
                        <div className="text-[10px] text-[#1D5FD1] flex items-center gap-1 pt-0.5">
                          <Building2 className="w-3 h-3 text-[#1D5FD1]" />
                          <span>{officer.department}</span>
                        </div>
                        <div className="text-[10px] text-[#53627A] font-mono pt-0.5">
                          Badge ID: <strong className="text-[#102A43]">{officer.badgeNo}</strong>
                        </div>
                      </div>

                      <div className="py-1 text-xs">
                        <Link
                          href="/officer/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-[#14213D] hover:bg-[#F7F9FC] font-medium transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#1D5FD1]" />
                          <span>Officer Dashboard</span>
                        </Link>

                        <Link
                          href="/officer/cases"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-[#14213D] hover:bg-[#F7F9FC] font-medium transition-colors"
                        >
                          <FolderKanban className="w-4 h-4 text-[#E99A16]" />
                          <span>Land Cases Registry</span>
                        </Link>

                        <Link
                          href="/officer/login"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-[#14213D] hover:bg-[#F7F9FC] font-medium transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#16845B]" />
                          <span>Switch Officer Role</span>
                        </Link>
                      </div>

                      <div className="border-t border-[#E3E8EF] pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-[#D9363E] hover:bg-red-50 font-semibold text-left transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-[#D9363E]" />
                          <span>Sign Out Officer Session</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Notification Bell */}
              <button 
                className="relative p-2 text-slate-300 hover:text-white hover:bg-[#1C3D5D] rounded-lg transition-colors" 
                title="Official Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D9363E]"></span>
              </button>
            </>
          ) : (
            <Link
              href="/officer/login"
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-[#1D5FD1] hover:bg-[#154CB0] text-white font-semibold text-xs transition-colors border border-blue-400/20"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Officer Portal Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* TIER 2: PRIMARY NAVIGATION BAR (Card Background: #FFFFFF, Border: #E3E8EF) */}
      <div className="bg-[#FFFFFF] border-b border-[#E3E8EF] px-4 sm:px-8 py-1 flex items-center justify-between">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1 w-full">
          {/* Dashboard */}
          <Link
            href="/"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors whitespace-nowrap ${
              pathname === "/" || pathname === "/officer/dashboard" || pathname === "/dashboard"
                ? "text-[#1D5FD1] bg-[#F1F5FB] font-semibold" 
                : "text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC]"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#1D5FD1]" />
            <span>Dashboard</span>
          </Link>

          {/* Land Cases */}
          <Link
            href="/officer/cases"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors whitespace-nowrap ${
              pathname === "/officer/cases" || pathname.startsWith("/officer/cases/") || pathname === "/cases"
                ? "text-[#1D5FD1] bg-[#F1F5FB] font-semibold"
                : "text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC]"
            }`}
          >
            <FolderKanban className="w-4 h-4 text-[#1D5FD1]" />
            <span>Land Cases</span>
          </Link>

          {/* Land Registry */}
          <Link
            href="/officer/registry"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors whitespace-nowrap ${
              pathname === "/officer/registry" || pathname === "/registry"
                ? "text-[#1D5FD1] bg-[#F1F5FB] font-semibold"
                : "text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC]"
            }`}
          >
            <FileText className="w-4 h-4 text-[#53627A]" />
            <span>Land Registry</span>
          </Link>

          {/* GIS Map */}
          <Link
            href="/gis"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors whitespace-nowrap ${
              pathname === "/gis" || pathname === "/map"
                ? "text-[#1D5FD1] bg-[#F1F5FB] font-semibold" 
                : "text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC]"
            }`}
          >
            <Map className="w-4 h-4 text-[#1D5FD1]" />
            <span>GIS Map</span>
          </Link>

          {/* Governance Analytics */}
          <Link
            href="/analytics"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors whitespace-nowrap ${
              pathname === "/analytics"
                ? "text-[#1D5FD1] bg-[#F1F5FB] font-semibold"
                : "text-[#53627A] hover:text-[#102A43] hover:bg-[#F7F9FC]"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#53627A]" />
            <span>Governance Analytics</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

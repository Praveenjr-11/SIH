"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Map, 
  Layers, 
  FileText, 
  BarChart3, 
  ShieldCheck, 
  Activity, 
  UserCheck, 
  Sparkles,
  ChevronDown,
  FolderKanban,
  LayoutDashboard
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { officer } = useOfficerAuth();

  const navItems = [
    { label: "Home", href: "/", icon: Layers },
    { label: "Explore India Map", href: "/map", icon: Map },
    { label: "Officer Dashboard", href: "/officer/dashboard", icon: LayoutDashboard },
    { label: "Land Cases", href: "/officer/cases", icon: FolderKanban },
    { label: "Land Registry", href: "/registry", icon: FileText },
    { label: "Governance Analytics", href: "/analytics", icon: BarChart3 }
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 text-slate-900 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50 shadow-xs antialiased font-sans">
      {/* LEFT: BRANDING & GOV DPI BADGE */}
      <Link 
        href="/" 
        className="flex items-center space-x-3 group hover:opacity-90 transition-all cursor-pointer shrink-0"
        title="India Land & Geospatial Intelligence Platform"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-800 to-indigo-950 flex items-center justify-center shadow-md text-white group-hover:scale-105 transition-transform">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
              LAND STACK
            </h1>
            <span className="text-[9.5px] font-extrabold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3 text-blue-600" />
              GOV DPI
            </span>
          </div>
          <p className="text-[10.5px] text-slate-500 font-medium">India Land & Geospatial Intelligence Platform</p>
        </div>
      </Link>

      {/* CENTER: NAVIGATION LINKS */}
      <nav className="hidden xl:flex items-center space-x-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* RIGHT: AUTHENTICATED OFFICER PROFILE */}
      <div className="flex items-center space-x-3 shrink-0">
        <Link
          href={officer ? "/officer/dashboard" : "/officer/login"}
          className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-slate-100 hover:bg-slate-800 border border-slate-700 transition-all text-xs font-semibold shadow-xs"
          title="Authenticated Officer Profile"
        >
          <div className="w-6 h-6 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-[11px] font-bold leading-tight text-white flex items-center gap-1.5">
              {officer ? officer.name.split(",")[0] : "Officer Login"}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="text-[9.5px] text-slate-400 font-medium leading-tight truncate max-w-[130px]">
              {officer ? officer.title : "Revenue Portal"}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
        </Link>
      </div>
    </header>
  );
}

"use client";

import React from "react";
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
  Sparkles, 
  Building2,
  Globe,
  FileCheck,
  Scale
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";

export default function PublicLandingPage() {
  const { officer } = useOfficerAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white pb-16 font-sans antialiased">
      {/* LIGHT AMBIENT BACKGROUND GLOW */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="fixed top-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* HERO SECTION */}
      <section className="relative pt-14 pb-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Digital Public Infrastructure for Land Governance (Gov DPI)</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.14]">
              India Land & Geospatial <br />
              <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-600 bg-clip-text text-transparent">
                Intelligence Platform
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
              An enterprise decision-support system designed to assist government revenue officers, town planners, and land administration authorities by providing integrated spatial analysis, PostGIS cadastral parcel information, geological datasets, and transparent approval workflows.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/map"
                className="inline-flex items-center space-x-3 px-7 py-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-sm shadow-md shadow-blue-700/20 transition-all hover:scale-[1.02]"
              >
                <Map className="w-5 h-5 text-blue-100" />
                <span>Explore India Map</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/officer/login"
                className="inline-flex items-center space-x-2.5 px-6 py-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-sm transition-all shadow-xs"
              >
                <Landmark className="w-5 h-5 text-amber-600" />
                <span>Officer Login</span>
              </Link>
            </div>
          </div>

          {/* INDIA GIS PREVIEW WIDGET */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Interactive India GIS Viewport</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                  EPSG:4326
                </span>
              </div>

              <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center group cursor-pointer">
                <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>
                <div className="text-center space-y-3 p-4 z-10">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 mx-auto shadow-xs">
                    <Map className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-900">Click to Launch Full GIS Viewport</div>
                  <div className="text-[11px] text-slate-500">Pan, zoom, & query spatial datasets across India</div>
                </div>

                <Link
                  href="/map"
                  className="absolute inset-0 bg-blue-700/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-blue-900 font-extrabold text-xs backdrop-blur-xs"
                >
                  Launch Interactive Map →
                </Link>
              </div>

              <Link
                href="/map"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all text-center block shadow-xs"
              >
                Explore Interactive Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM CAPABILITIES */}
      <section id="capabilities" className="py-16 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Platform Core Capabilities</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900">Enterprise Spatial Decision Support</h2>
          <p className="text-slate-600 text-sm">
            Modular infrastructure linking PostGIS geometry engines, real revenue officer directories, legal verification audit trails, and rules-based suitability scoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
              <Map className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">1. India-Wide GIS</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nationwide PostGIS spatial query engine supporting bounded bounding-box GeoJSON queries, administrative hierarchy resolution, and vector layer rendering.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">2. Land Information</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Integration of 14-digit ULPIN land identification numbers, state Patta/Chitta revenue registries, and Sub-Registrar document references.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">3. Geological Intelligence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Geological Survey of India (GSI) spatial intersection providing foundation bearing capacity, lithology, and rock formation data.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-cyan-300 hover:shadow-md transition-all space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">4. Spatial Analysis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated evaluation of water body proximity buffers, arterial road access distances, elevation terrain slope, and environmental hazard risks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">5. Document Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              OCR field extraction and spatial cross-verification pipeline detecting survey number, village name, and measured area mismatches.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">6. Officer Decision Support</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent multi-factor suitability scoring engine and evidence-grounded advisory summaries for statutory revenue officer approval workflows.
            </p>
          </div>
        </div>
      </section>

      {/* OFFICER PORTAL SECTION */}
      <section className="py-16 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-900 rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-xl text-white">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Authorized Portal</span>
          </div>
          <h2 className="text-3xl font-black text-white">Government Officer Portal</h2>
          <p className="text-slate-200 text-sm max-w-2xl mx-auto leading-relaxed">
            Authorized government officers can securely access jurisdiction-specific land information, review active land cases, conduct spatial audits, and execute statutory approval workflows.
          </p>

          <div className="pt-2">
            <Link
              href="/officer/login"
              className="inline-flex items-center space-x-3 px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-lg transition-all"
            >
              <UserCheck className="w-4 h-4 text-blue-700" />
              <span>Officer Login</span>
              <ArrowRight className="w-4 h-4 text-slate-900" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-200 pt-8 pb-12 px-6 max-w-7xl mx-auto text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-bold text-slate-900 text-sm">LAND STACK</div>
          <div>India Land & Geospatial Intelligence Platform • Version 2.0.0</div>
        </div>

        <div className="flex space-x-6 font-semibold">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <Link href="/map" className="hover:text-slate-900">Map</Link>
          <Link href="/officer/login" className="hover:text-slate-900">Officer Login</Link>
          <a href="#privacy" className="hover:text-slate-900">Privacy</a>
          <a href="#terms" className="hover:text-slate-900">Terms</a>
        </div>
      </footer>
    </div>
  );
}

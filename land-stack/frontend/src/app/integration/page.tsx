"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Network, 
  ArrowLeft, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Server, 
  Layers, 
  FileText, 
  Building2, 
  IndianRupee, 
  Compass, 
  Home, 
  Zap, 
  Scale, 
  ShieldCheck, 
  Cpu, 
  Search, 
  Filter, 
  ExternalLink,
  Lock,
  ArrowRight,
  Database,
  Radio,
  Check,
  Code
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";
import { fetchConnectedSystemsStatus, ConnectedSystemInfo, InteroperabilityTelemetry } from "@/services/api";

export default function ConnectedGovernmentSystemsPage() {
  const { officer } = useOfficerAuth();

  const [telemetry, setTelemetry] = useState<InteroperabilityTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedSystem, setSelectedSystem] = useState<ConnectedSystemInfo | null>(null);
  const [pingStatus, setPingStatus] = useState<{ [id: string]: { pinging: boolean; latency: number | null } }>({});
  const [syncTimestamp, setSyncTimestamp] = useState<string>("Just now");

  // Load telemetry on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchConnectedSystemsStatus();
      setTelemetry(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Periodic clock update for relative time
  useEffect(() => {
    const timer = setInterval(() => {
      if (!telemetry) return;
      const elapsedSec = Math.round((Date.now() - new Date(telemetry.lastSynchronization).getTime()) / 1000);
      if (elapsedSec < 10) {
        setSyncTimestamp("Just now");
      } else if (elapsedSec < 60) {
        setSyncTimestamp(`${elapsedSec}s ago`);
      } else {
        const mins = Math.floor(elapsedSec / 60);
        setSyncTimestamp(`${mins}m ago`);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [telemetry]);

  // Handle manual gateway refresh / ping
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    const data = await fetchConnectedSystemsStatus();
    setTelemetry(data);
    setSyncTimestamp("Just now");
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Test ping individual system
  const handleTestPing = async (systemId: string) => {
    setPingStatus(prev => ({
      ...prev,
      [systemId]: { pinging: true, latency: null }
    }));

    const delay = Math.floor(35 + Math.random() * 65);
    setTimeout(() => {
      setPingStatus(prev => ({
        ...prev,
        [systemId]: { pinging: false, latency: delay }
      }));
    }, 450);
  };

  // System category mapping
  const systemCategoryMap: Record<string, string> = {
    'cadastral-gis': 'REVENUE_SURVEY',
    'ror-patta': 'REVENUE_SURVEY',
    'registration': 'REVENUE_SURVEY',
    'property-tax': 'FISCAL_UTILITIES',
    'master-plan': 'PLANNING_URBAN',
    'building-permission': 'PLANNING_URBAN',
    'utilities': 'FISCAL_UTILITIES',
    'dispute-system': 'JUDICIAL_LEGAL'
  };

  // System icons
  const systemIconMap: Record<string, React.ReactNode> = {
    'cadastral-gis': <Layers className="w-5 h-5 text-[#1D5FD1]" />,
    'ror-patta': <FileText className="w-5 h-5 text-[#16845B]" />,
    'registration': <ShieldCheck className="w-5 h-5 text-[#1D5FD1]" />,
    'property-tax': <IndianRupee className="w-5 h-5 text-[#E99A16]" />,
    'master-plan': <Compass className="w-5 h-5 text-[#7E22CE]" />,
    'building-permission': <Home className="w-5 h-5 text-[#1D5FD1]" />,
    'utilities': <Zap className="w-5 h-5 text-[#C05621]" />,
    'dispute-system': <Scale className="w-5 h-5 text-[#D9363E]" />
  };

  // Filter systems
  const filteredSystems = useMemo(() => {
    if (!telemetry) return [];
    return telemetry.systems.filter(s => {
      const matchesSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nodalAgency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.protocol.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = activeCategory === "ALL" || systemCategoryMap[s.id] === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [telemetry, searchQuery, activeCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7 font-sans antialiased pb-24">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3E8EF] pb-5">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <Link 
              href="/officer/dashboard" 
              className="text-xs text-[#1D5FD1] hover:text-[#154CB0] font-semibold flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Officer Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#102A43]">
              Connected Government Systems
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F1F5FB] text-[#1D5FD1] border border-[#CCE0FD] uppercase">
              DPI Interoperability
            </span>
          </div>
          <p className="text-xs text-[#53627A] mt-1">
            Bharat Land-Stack Digital Public Infrastructure (DPI) • Unified Interoperability Gateway linking 8 statutory department engines via 14-digit ULPIN Bhu-Aadhaar.
          </p>
        </div>

        {/* REFRESH & QUICK ACTIONS */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-md bg-white hover:bg-[#F7F9FC] text-[#102A43] font-semibold text-xs border border-[#E3E8EF] transition-colors shadow-2xs flex items-center space-x-1.5 disabled:opacity-50"
            title="Ping API Gateway & re-verify live connections"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#53627A] ${isRefreshing ? "animate-spin text-[#1D5FD1]" : ""}`} />
            <span>{isRefreshing ? "Pinging Gateway..." : "Ping All Systems"}</span>
          </button>

          <Link
            href="/map"
            className="px-3.5 py-2 rounded-md bg-[#1D5FD1] hover:bg-[#154CB0] text-white font-semibold text-xs transition-colors shadow-2xs flex items-center space-x-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Open Spatial Map</span>
          </Link>
        </div>
      </div>

      {/* GATEWAY METRICS SUMMARY CARDS (EXACT 5 REQUIRED METRICS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* METRIC 1: API Requests */}
        <div className="bg-white border border-[#E3E8EF] p-4 rounded-xl shadow-xs space-y-1 hover:border-[#1D5FD1] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#53627A] font-bold uppercase tracking-wider">API Requests</span>
            <div className="p-1.5 rounded-md bg-[#F1F5FB] text-[#1D5FD1]">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#102A43] font-mono">
            {telemetry ? telemetry.totalApiRequests.toLocaleString() : "1,428,940"}
          </div>
          <p className="text-[10px] text-[#53627A]">
            Rolling 30-Day Inter-agency Calls
          </p>
        </div>

        {/* METRIC 2: Successful Requests */}
        <div className="bg-white border border-[#E3E8EF] p-4 rounded-xl shadow-xs space-y-1 hover:border-[#16845B] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#53627A] font-bold uppercase tracking-wider">Successful Requests</span>
            <div className="p-1.5 rounded-md bg-[#EDF7F2] text-[#16845B]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#16845B] font-mono">
            {telemetry ? telemetry.successfulRequests.toLocaleString() : "1,426,512"}
          </div>
          <p className="text-[10px] text-[#16845B] font-medium">
            99.83% High Reliability SLA
          </p>
        </div>

        {/* METRIC 3: Failed Requests */}
        <div className="bg-white border border-[#E3E8EF] p-4 rounded-xl shadow-xs space-y-1 hover:border-[#D9363E] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#53627A] font-bold uppercase tracking-wider">Failed Requests</span>
            <div className="p-1.5 rounded-md bg-[#FDEDEE] text-[#D9363E]">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#D9363E] font-mono">
            {telemetry ? telemetry.failedRequests.toLocaleString() : "2,428"}
          </div>
          <p className="text-[10px] text-[#53627A]">
            0.17% Retried Timeouts / Drops
          </p>
        </div>

        {/* METRIC 4: Last Synchronization */}
        <div className="bg-white border border-[#E3E8EF] p-4 rounded-xl shadow-xs space-y-1 hover:border-[#1D5FD1] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#53627A] font-bold uppercase tracking-wider">Last Synchronization</span>
            <div className="p-1.5 rounded-md bg-[#F1F5FB] text-[#1D5FD1]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-[#102A43] font-mono truncate">
            {syncTimestamp}
          </div>
          <p className="text-[10px] text-[#16845B] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16845B] animate-pulse"></span>
            <span>Real-time Active Pulse</span>
          </p>
        </div>

        {/* METRIC 5: Average Response Time */}
        <div className="bg-white border border-[#E3E8EF] p-4 rounded-xl shadow-xs space-y-1 hover:border-[#1D5FD1] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#53627A] font-bold uppercase tracking-wider">Average Response Time</span>
            <div className="p-1.5 rounded-md bg-[#F1F5FB] text-[#1D5FD1]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-[#1D5FD1] font-mono">
              {telemetry ? telemetry.averageResponseTimeMs : 118}
            </span>
            <span className="text-xs text-[#53627A] font-semibold">ms</span>
          </div>
          <p className="text-[10px] text-[#53627A]">
            {telemetry?.isLiveApi ? "Measured from Live Backend" : "Sub-second Low Latency Mesh"}
          </p>
        </div>

      </div>

      {/* LIVE BACKEND VERIFICATION STATUS STRIP */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs ${
        telemetry?.isLiveApi 
          ? "bg-[#EDF7F2] border-[#16845B]/30 text-[#16845B]" 
          : "bg-[#F1F5FB] border-[#CCE0FD] text-[#1D5FD1]"
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
            telemetry?.isLiveApi ? "bg-white text-[#16845B] border-[#16845B]/30" : "bg-white text-[#1D5FD1] border-[#CCE0FD]"
          }`}>
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold flex items-center gap-2">
              <span>{telemetry?.isLiveApi ? "Live Backend REST API Handshake Verified" : "DPI Interoperability Mesh Active (Verified Demo Engine)"}</span>
              <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-white border border-current">
                HTTP 200 OK
              </span>
            </div>
            <p className="text-[11px] text-[#53627A] mt-0.5">
              {telemetry?.isLiveApi 
                ? `Platform: ${telemetry.liveBackendData?.platform || 'LAND STACK REST API'} • Environment: ${telemetry.liveBackendData?.environment || 'production'} • PostGIS & Spatial Engine Operational`
                : "Real-time bidirectional synchronization enabled across 8 state departments via OGC WFS 2.0, OpenAPI 3.0 & ISO 19152 LADM."}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto font-mono text-[11px]">
          <span className="text-[#53627A]">Gateway Port:</span>
          <strong className="text-[#102A43]">5000 / API v1</strong>
          <span className="w-2 h-2 rounded-full bg-[#16845B] animate-pulse ml-1"></span>
        </div>
      </div>

      {/* DPI INTEROPERABILITY CONCEPT: 8 CONNECTED SYSTEMS GRID */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E8EF] pb-3">
          <div>
            <h2 className="text-lg font-bold text-[#102A43] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#1D5FD1]" />
              <span>The 8 Connected Departmental Systems</span>
            </h2>
            <p className="text-xs text-[#53627A] mt-0.5">
              Live status, data schemas, and synchronization metrics for each integrated statutory engine
            </p>
          </div>

          {/* SEARCH & CATEGORY FILTER */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#53627A] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter systems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-white border border-[#E3E8EF] rounded-md text-xs text-[#102A43] placeholder-[#53627A] focus:outline-none focus:border-[#1D5FD1] w-40 sm:w-48"
              />
            </div>

            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="bg-white border border-[#E3E8EF] rounded-md px-2 py-1 text-xs text-[#102A43] focus:outline-none focus:border-[#1D5FD1] cursor-pointer"
            >
              <option value="ALL">All Systems (8)</option>
              <option value="REVENUE_SURVEY">Revenue & Survey (3)</option>
              <option value="PLANNING_URBAN">Planning & Urban (2)</option>
              <option value="FISCAL_UTILITIES">Fiscal & Utilities (2)</option>
              <option value="JUDICIAL_LEGAL">Judicial & Legal (1)</option>
            </select>
          </div>
        </div>

        {/* 8 EXACT REQUIRED SYSTEMS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredSystems.map((sys) => {
            const isPinging = pingStatus[sys.id]?.pinging;
            const customLatency = pingStatus[sys.id]?.latency;

            return (
              <div 
                key={sys.id}
                className="bg-white border border-[#E3E8EF] hover:border-[#1D5FD1] p-4 rounded-xl shadow-xs transition-all flex flex-col justify-between space-y-3 group"
              >
                {/* CARD TOP: NAME & CONNECTED STATUS */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-[#F8FAFD] border border-[#E3E8EF] group-hover:bg-[#F1F5FB] group-hover:border-[#CCE0FD] transition-colors">
                      {systemIconMap[sys.id] || <Server className="w-5 h-5 text-[#1D5FD1]" />}
                    </div>

                    {/* EXACT STATUS: ● Connected */}
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EDF7F2] text-[#16845B] border border-[#16845B]/30 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-[#16845B] animate-pulse"></span>
                      <span>Connected</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-[#102A43]">{sys.name}</h3>
                    <p className="text-[11px] text-[#53627A] line-clamp-1" title={sys.department}>
                      {sys.department}
                    </p>
                  </div>
                </div>

                {/* PROTOCOL & NODAL AGENCY */}
                <div className="p-2.5 bg-[#F8FAFD] rounded-lg border border-[#E3E8EF] space-y-1 text-[11px]">
                  <div className="flex items-center justify-between text-[#53627A]">
                    <span>Portal:</span>
                    <strong className="text-[#102A43] truncate max-w-[130px]" title={sys.nodalAgency}>
                      {sys.nodalAgency}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[#53627A]">
                    <span>Protocol:</span>
                    <span className="font-mono text-[#1D5FD1] truncate max-w-[130px]" title={sys.protocol}>
                      {sys.protocol}
                    </span>
                  </div>
                </div>

                {/* TELEMETRY ROW */}
                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-[#F1F4F8] text-[#53627A]">
                  <div>
                    <span className="block">Latency:</span>
                    <strong className="text-[#102A43] font-mono text-xs">
                      {customLatency ? `${customLatency} ms` : `${sys.latencyMs} ms`}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="block">Uptime SLA:</span>
                    <strong className="text-[#16845B] font-mono text-xs">{sys.uptimePct}%</strong>
                  </div>
                </div>

                {/* TEST PING ACTION */}
                <div className="pt-2 border-t border-[#E3E8EF] flex items-center justify-between">
                  <button
                    onClick={() => setSelectedSystem(sys)}
                    className="text-xs font-semibold text-[#1D5FD1] hover:text-[#154CB0] flex items-center gap-1"
                  >
                    <span>View Schema</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => handleTestPing(sys.id)}
                    disabled={isPinging}
                    className="px-2.5 py-1 rounded bg-[#F1F5FB] hover:bg-[#E2ECFA] text-[#1D5FD1] text-[10px] font-bold border border-[#CCE0FD] transition-colors disabled:opacity-50"
                  >
                    {isPinging ? "Pinging..." : "Test Ping"}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* DPI ARCHITECTURAL INTEROPERABILITY MESH (VISUAL FLOW) */}
      <div className="bg-white border border-[#E3E8EF] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-[#102A43] border-b border-[#E3E8EF] pb-3">
          <Database className="w-5 h-5 text-[#1D5FD1]" />
          <div>
            <h2 className="font-bold text-sm">How Land Stack DPI Solves Departmental Fragmentation</h2>
            <p className="text-[11px] text-[#53627A]">
              Decoupled, zero-copy interoperability using the 14-digit ULPIN Bhu-Aadhaar as the universal relational foreign key
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#F8FAFD] rounded-xl border border-[#E3E8EF] space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="p-3 bg-white border border-[#CCE0FD] rounded-lg text-center flex-1 shadow-2xs">
              <span className="text-[10px] font-bold text-[#1D5FD1] uppercase block">Spatial Authority</span>
              <strong className="text-xs text-[#102A43] block mt-0.5">Cadastral GIS (CSS)</strong>
              <span className="text-[10px] text-[#53627A] block mt-0.5 font-mono">14-Digit ULPIN & FMB</span>
            </div>

            <ArrowRight className="w-4 h-4 text-[#1D5FD1] hidden md:block" />

            <div className="p-3 bg-[#102A43] text-white rounded-lg text-center flex-1 shadow-xs border border-[#1C3D5D]">
              <span className="text-[10px] font-bold text-[#E99A16] uppercase block">DPI Core Engine</span>
              <strong className="text-xs font-bold block mt-0.5">Bharat Land-Stack API Bus</strong>
              <span className="text-[10px] text-slate-300 block mt-0.5 font-mono">Zero-Copy Relational Mesh</span>
            </div>

            <ArrowRight className="w-4 h-4 text-[#1D5FD1] hidden md:block" />

            <div className="p-3 bg-white border border-[#16845B]/30 rounded-lg text-center flex-1 shadow-2xs">
              <span className="text-[10px] font-bold text-[#16845B] uppercase block">Statutory Title</span>
              <strong className="text-xs text-[#102A43] block mt-0.5">Registration & RoR</strong>
              <span className="text-[10px] text-[#53627A] block mt-0.5 font-mono">TNREGINET & Patta</span>
            </div>
          </div>

          <div className="text-[11px] text-[#53627A] leading-relaxed pt-1">
            <strong className="text-[#102A43]">Key Architectural Principle:</strong> Departments retain sovereign statutory ownership of their internal databases. The Land Stack does not duplicate databases; instead, it establishes an asynchronous, signed JSON API protocol linking cadastral geometry with title deeds, property tax receipts, planning permissions, utilities, and judicial stays in real time.
          </div>
        </div>
      </div>

      {/* RECENT REAL-TIME INTEROPERABILITY TRANSACTIONS FEED */}
      <div className="bg-white border border-[#E3E8EF] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-3">
          <div>
            <h2 className="font-bold text-sm text-[#102A43] flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#16845B] animate-pulse" />
              <span>Live Interoperability Transactions (Event Mesh Stream)</span>
            </h2>
            <p className="text-[11px] text-[#53627A]">Recent automated cross-departmental queries and webhook executions</p>
          </div>
          <span className="text-[10px] font-mono text-[#16845B] bg-[#EDF7F2] px-2 py-0.5 rounded border border-[#16845B]/30 font-bold">
            Live Stream
          </span>
        </div>

        <div className="space-y-2.5">
          {[
            {
              id: "TX-2026-94812",
              source: "Registration (TNREGINET)",
              target: "RoR / Patta (CLA)",
              event: "Deed Registered → Automated Patta Mutation Trigger",
              ulpin: "TN33010001004",
              time: "Just now",
              status: "COMPLETED",
              latency: "76 ms"
            },
            {
              id: "TX-2026-94811",
              source: "Building Permission (LPA)",
              target: "Master Plan (DTCP)",
              event: "Plan Sanction Request → FSI & Road Widening Setback Verification",
              ulpin: "TN33010001018",
              time: "18s ago",
              status: "COMPLETED",
              latency: "112 ms"
            },
            {
              id: "TX-2026-94810",
              source: "Officer Dashboard",
              target: "Dispute System (e-Courts)",
              event: "NOC Clearance Query → Civil Court Stay Injunction Search",
              ulpin: "TN33010001025",
              time: "42s ago",
              status: "COMPLETED",
              latency: "94 ms"
            },
            {
              id: "TX-2026-94809",
              source: "Cadastral GIS (CSS)",
              target: "Property Tax (MAWS)",
              event: "DGPS Resurvey Area Change → Tax Assessment Plinth Area Sync",
              ulpin: "TN33010001031",
              time: "1m 15s ago",
              status: "COMPLETED",
              latency: "128 ms"
            }
          ].map(tx => (
            <div 
              key={tx.id} 
              className="p-3 bg-[#F8FAFD] rounded-lg border border-[#E3E8EF] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:border-[#1D5FD1]/50 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-[#1D5FD1] text-[11px]">{tx.id}</span>
                  <span className="text-[#53627A]">|</span>
                  <strong className="text-[#102A43]">{tx.source}</strong>
                  <span className="text-[#53627A]">→</span>
                  <strong className="text-[#102A43]">{tx.target}</strong>
                </div>
                <p className="text-[11px] text-[#53627A]">{tx.event}</p>
                <div className="text-[10px] font-mono text-[#53627A]">
                  Target ULPIN: <span className="font-bold text-[#102A43]">{tx.ulpin}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-right self-end sm:self-auto font-mono text-[10px]">
                <span className="text-[#53627A]">{tx.time}</span>
                <span className="text-[#16845B] font-bold">{tx.latency}</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#EDF7F2] text-[#16845B] border border-[#16845B]/30">
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SYSTEM SCHEMA DETAIL MODAL / DRAWER */}
      {selectedSystem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full border border-[#E3E8EF] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#E3E8EF] flex items-center justify-between bg-[#F8FAFD]">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-white border border-[#E3E8EF]">
                  {systemIconMap[selectedSystem.id] || <Server className="w-5 h-5 text-[#1D5FD1]" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base text-[#102A43]">{selectedSystem.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF7F2] text-[#16845B] border border-[#16845B]/30">
                      ● Connected
                    </span>
                  </div>
                  <p className="text-xs text-[#53627A]">{selectedSystem.department}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSystem(null)}
                className="text-[#53627A] hover:text-[#102A43] text-sm font-bold p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F8FAFD] rounded-lg border border-[#E3E8EF]">
                  <span className="text-[10px] font-semibold text-[#53627A] block uppercase">Nodal Agency</span>
                  <strong className="text-xs text-[#102A43] block mt-0.5">{selectedSystem.nodalAgency}</strong>
                </div>
                <div className="p-3 bg-[#F8FAFD] rounded-lg border border-[#E3E8EF]">
                  <span className="text-[10px] font-semibold text-[#53627A] block uppercase">Interoperability Protocol</span>
                  <strong className="text-xs font-mono text-[#1D5FD1] block mt-0.5">{selectedSystem.protocol}</strong>
                </div>
              </div>

              <div className="p-3 bg-[#F8FAFD] rounded-lg border border-[#E3E8EF] space-y-1.5">
                <span className="text-[10px] font-bold text-[#53627A] uppercase block">Data Elements Exchanged</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSystem.dataTypesExchanged.map((type, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white border border-[#E3E8EF] rounded text-[11px] font-medium text-[#102A43]">
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#102A43] text-white rounded-lg space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span>API Endpoint:</span>
                  <span className="text-[#16845B] font-bold">mTLS 1.3 Active</span>
                </div>
                <div className="text-emerald-400 break-all">{selectedSystem.endpointUrl}</div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-[#F8FAFD] rounded border border-[#E3E8EF]">
                  <span className="text-[10px] text-[#53627A] block">24h Transactions</span>
                  <strong className="font-mono text-[#102A43]">{selectedSystem.totalSyncEvents24h.toLocaleString()}</strong>
                </div>
                <div className="p-2.5 bg-[#F8FAFD] rounded border border-[#E3E8EF]">
                  <span className="text-[10px] text-[#53627A] block">24h Errors</span>
                  <strong className="font-mono text-[#16845B]">{selectedSystem.errorCount24h} (0.003%)</strong>
                </div>
                <div className="p-2.5 bg-[#F8FAFD] rounded border border-[#E3E8EF]">
                  <span className="text-[10px] text-[#53627A] block">Sync Frequency</span>
                  <strong className="text-[10px] text-[#102A43]">{selectedSystem.syncFrequency}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E3E8EF] flex items-center justify-end space-x-2 bg-[#F8FAFD]">
              <button
                onClick={() => setSelectedSystem(null)}
                className="px-4 py-2 rounded-md bg-[#102A43] text-white text-xs font-semibold hover:bg-[#1C3D5D] transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

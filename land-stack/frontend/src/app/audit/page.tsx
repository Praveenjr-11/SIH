"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  History, 
  ArrowLeft, 
  Search, 
  Filter, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  Laptop, 
  Download, 
  RefreshCw, 
  FileText, 
  Check, 
  X, 
  RotateCcw, 
  ChevronRight, 
  Code, 
  Lock, 
  Fingerprint, 
  Layers, 
  Database,
  ExternalLink
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";
import OfficerProtectedGuard from "@/components/OfficerProtectedGuard";

// AUDIT EVENT MODEL
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  timeOnly: string;
  dateOnly: string;
  user: string;
  role: string;
  action: string;
  module: string;
  ulpin: string;
  surveyNumber: string;
  previousValue: string;
  newValue: string;
  ipAddress: string;
  deviceInfo: string;
  status: "Completed" | "Verified" | "Pending Verification" | "Failed / Rollback";
  sha256Hash: string;
  provenanceNote: string;
  rawJsonDiff?: {
    previous: Record<string, any>;
    new: Record<string, any>;
  };
}

// REALISTIC CHRONOLOGICAL AUDIT TRAIL DATASET
const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "LOG-2026-90412",
    timestamp: "15 Sep 2026, 10:42 AM",
    timeOnly: "10:42 AM",
    dateOnly: "15 Sep 2026",
    user: "Officer 102",
    role: "District Collector & District Magistrate",
    action: "RoR Update",
    module: "RoR / Patta",
    ulpin: "TN33010001004",
    surveyNumber: "171/3A",
    previousValue: "Patta No: PATTA-2024-4780 • Status: UNVERIFIED",
    newValue: "Patta No: PATTA-2024-4780 • Status: VERIFIED (Digitally Endorsed)",
    ipAddress: "10.42.18.94",
    deviceInfo: "NIC VPN / Desktop Workstation (Kanchipuram Collectorate)",
    status: "Completed",
    sha256Hash: "7f9a8b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
    provenanceNote: "Statutory mutation validation verified against physical chitta register.",
    rawJsonDiff: {
      previous: { pattaNumber: "PATTA-2024-4780", verificationStatus: "UNVERIFIED", digitallySigned: false },
      new: { pattaNumber: "PATTA-2024-4780", verificationStatus: "VERIFIED", digitallySigned: true, signedBy: "Officer 102" }
    }
  },
  {
    id: "LOG-2026-90411",
    timestamp: "15 Sep 2026, 10:31 AM",
    timeOnly: "10:31 AM",
    dateOnly: "15 Sep 2026",
    user: "Registration System",
    role: "Automated Integration Gateway",
    action: "Data Synchronization",
    module: "Registration",
    ulpin: "TN33010001005",
    surveyNumber: "181/9A",
    previousValue: "Encumbrance Ledger: 12-Year History Cached",
    newValue: "Encumbrance Ledger: 13-Year SRO Deed DOC-2024-KNC-00102 Synchronized",
    ipAddress: "192.168.1.102",
    deviceInfo: "TNREGINET Dedicated SRO Node (Sriperumbudur)",
    status: "Completed",
    sha256Hash: "8b4c9d2e1f3a5b7c9e0a2b4c6d8f0a2b4c6d8e0f1a3b5c7d9e1f3a5b7c9e0a2b",
    provenanceNote: "Real-time event bus handshake via ISO 19152 LADM protocol.",
    rawJsonDiff: {
      previous: { ecLedgerYears: 12, latestDeedNo: "DOC-2023-KNC-00088" },
      new: { ecLedgerYears: 13, latestDeedNo: "DOC-2024-KNC-00102", stampDutyPaid: 485000 }
    }
  },
  {
    id: "LOG-2026-90410",
    timestamp: "15 Sep 2026, 10:15 AM",
    timeOnly: "10:15 AM",
    dateOnly: "15 Sep 2026",
    user: "Surveyor 44",
    role: "Taluk Revenue Surveyor",
    action: "Boundary Resurvey",
    module: "Cadastral GIS",
    ulpin: "TN33010001006",
    surveyNumber: "197/7B",
    previousValue: "Perimeter: 412.0m • Vertex Count: 8 Vertices (Legacy 1988 FMB)",
    newValue: "Perimeter: 418.5m • Vertex Count: 14 DGPS Vertices (0.02m Fixed)",
    ipAddress: "10.12.88.14",
    deviceInfo: "Trimble Geo7X DGPS Handheld (Field Survey Unit 04)",
    status: "Completed",
    sha256Hash: "9c5d1a3f5b7c9e0a2b4c6d8e0f1a3b5c7d9e1f3a5b7c9e0a2b4c6d8e0f1a3b5c",
    provenanceNote: "DGPS baseline tie-line fixed with Survey of India benchmark point #44.",
    rawJsonDiff: {
      previous: { perimeterMeters: 412.0, dgpsFixed: false, vertexPoints: 8 },
      new: { perimeterMeters: 418.5, dgpsFixed: true, vertexPoints: 14, precision: "0.02m" }
    }
  },
  {
    id: "LOG-2026-90409",
    timestamp: "15 Sep 2026, 09:50 AM",
    timeOnly: "09:50 AM",
    dateOnly: "15 Sep 2026",
    user: "Officer 108",
    role: "Revenue Divisional Officer (RDO)",
    action: "NOC Approval",
    module: "Statutory Approvals",
    ulpin: "TN33010001007",
    surveyNumber: "334/9C",
    previousValue: "Case Status: FIELD_INSPECTION",
    newValue: "Case Status: APPROVED (Statutory Order Order-2026-TN-418 Issued)",
    ipAddress: "10.42.22.61",
    deviceInfo: "RDO Sriperumbudur Secretariat (NIC Secured Network)",
    status: "Completed",
    sha256Hash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    provenanceNote: "NOC order sealed under Section 47-A of Tamil Nadu Town Planning Act.",
    rawJsonDiff: {
      previous: { status: "FIELD_INSPECTION", orderNumber: null },
      new: { status: "APPROVED", orderNumber: "ORDER-2026-TN-418", approvedDate: "2026-09-15" }
    }
  },
  {
    id: "LOG-2026-90408",
    timestamp: "15 Sep 2026, 09:22 AM",
    timeOnly: "09:22 AM",
    dateOnly: "15 Sep 2026",
    user: "Tax Assessment Engine",
    role: "Automated Tax Batch Processor",
    action: "Tax Recalculation",
    module: "Property Tax",
    ulpin: "TN33010001008",
    surveyNumber: "133/9D",
    previousValue: "Annual Tax: ₹ 2,850 • Land Class: Agricultural Dry",
    newValue: "Annual Tax: ₹ 8,400 • Land Class: Industrial Plinth (Assessed)",
    ipAddress: "172.16.4.88",
    deviceInfo: "MAWS Cloud Cluster Node (TNeGA Data Center)",
    status: "Completed",
    sha256Hash: "2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
    provenanceNote: "Automated reassessment triggered by DTCP industrial warehouse sanction.",
    rawJsonDiff: {
      previous: { annualTax: 2850, classification: "Agricultural Dry" },
      new: { annualTax: 8400, classification: "Industrial Plinth", demandNotice: "FORM-7" }
    }
  },
  {
    id: "LOG-2026-90407",
    timestamp: "15 Sep 2026, 08:45 AM",
    timeOnly: "08:45 AM",
    dateOnly: "15 Sep 2026",
    user: "Satellite AI Sentinel",
    role: "Autonomous Remote Sensing Engine",
    action: "Change Anomaly Flag",
    module: "Satellite Detection",
    ulpin: "TN33010001009",
    surveyNumber: "101/5E",
    previousValue: "Surface Anomaly: None Detected (Clean Baseline)",
    newValue: "Surface Anomaly: Plinth Excavation (+0.48 ΔNDBI in Open Zone)",
    ipAddress: "10.88.2.14",
    deviceInfo: "ISRO Bhuvan Pipeline Server (Cartosat-3 Optical Stream)",
    status: "Verified",
    sha256Hash: "3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
    provenanceNote: "Multi-pass pixel change confirmed (>90% spectral confidence).",
    rawJsonDiff: {
      previous: { anomalyDetected: false, deltaNdbi: "0.00" },
      new: { anomalyDetected: true, deltaNdbi: "+0.48", changeCategory: "Potential Construction" }
    }
  },
  {
    id: "LOG-2026-90406",
    timestamp: "14 Sep 2026, 05:14 PM",
    timeOnly: "05:14 PM",
    dateOnly: "14 Sep 2026",
    user: "Officer 102",
    role: "District Collector & District Magistrate",
    action: "Case Re-assignment",
    module: "Statutory Approvals",
    ulpin: "TN33010001010",
    surveyNumber: "214/2C",
    previousValue: "Assigned Officer: DRO Kanchipuram",
    newValue: "Assigned Officer: Special Tahsildar (Land Acquisition)",
    ipAddress: "10.42.18.94",
    deviceInfo: "NIC VPN / Desktop Workstation",
    status: "Completed",
    sha256Hash: "4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    provenanceNote: "Transferred due to highway widening compensation hearing jurisdiction.",
    rawJsonDiff: {
      previous: { assignedOfficer: "DRO Kanchipuram" },
      new: { assignedOfficer: "Special Tahsildar (Land Acquisition)" }
    }
  },
  {
    id: "LOG-2026-90405",
    timestamp: "14 Sep 2026, 03:40 PM",
    timeOnly: "03:40 PM",
    dateOnly: "14 Sep 2026",
    user: "Town Planner 12",
    role: "DTCP Planning Officer",
    action: "Master Plan Zone Tag",
    module: "Building Permission",
    ulpin: "TN33010001011",
    surveyNumber: "108/5B",
    previousValue: "Zone: Pending Master Plan Classification",
    newValue: "Zone: Residential Living Zone (1.75 FSI Max G+5)",
    ipAddress: "10.42.19.105",
    deviceInfo: "DTCP Chengalpattu Regional Office Terminal",
    status: "Completed",
    sha256Hash: "5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
    provenanceNote: "Conforming to Comprehensive Master Plan 2026 notification G.O. 142.",
    rawJsonDiff: {
      previous: { masterPlanZone: "Unclassified", maxFsi: "1.00" },
      new: { masterPlanZone: "Residential Living Zone", maxFsi: "1.75", maxHeight: "18m" }
    }
  },
  {
    id: "LOG-2026-90404",
    timestamp: "14 Sep 2026, 01:15 PM",
    timeOnly: "01:15 PM",
    dateOnly: "14 Sep 2026",
    user: "Judicial Sync Service",
    role: "High Court Interoperability Protocol",
    action: "Stay Order Registered",
    module: "Dispute System",
    ulpin: "TN33010001012",
    surveyNumber: "312/1",
    previousValue: "Title Status: Clear Title (Unencumbered)",
    newValue: "Title Status: Interim Stay Order OS-412/2025 Applied",
    ipAddress: "164.100.22.45",
    deviceInfo: "National Judicial Data Grid Node (High Court of Madras)",
    status: "Completed",
    sha256Hash: "6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
    provenanceNote: "Automated lis pendens injunction registered against revenue registry.",
    rawJsonDiff: {
      previous: { disputeStatus: "CLEAR", stayActive: false },
      new: { disputeStatus: "STAY_APPLIED", stayActive: true, courtCaseId: "OS-412/2025" }
    }
  },
  {
    id: "LOG-2026-90403",
    timestamp: "14 Sep 2026, 11:20 AM",
    timeOnly: "11:20 AM",
    dateOnly: "14 Sep 2026",
    user: "Operator 55",
    role: "SRO Data Entry Clerk",
    action: "Deed Registration",
    module: "Registration",
    ulpin: "TN33010001013",
    surveyNumber: "88/3B",
    previousValue: "Doc Status: Token Generated (Awaiting Execution)",
    newValue: "Doc Status: Registered Deed DOC-2024-KNC-00108 Issued",
    ipAddress: "192.168.1.110",
    deviceInfo: "Sriperumbudur SRO Sub-terminal",
    status: "Completed",
    sha256Hash: "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    provenanceNote: "Certified deed indexed with digital thumbprint & biometric hash.",
    rawJsonDiff: {
      previous: { docStatus: "PENDING_EXECUTION" },
      new: { docStatus: "REGISTERED", registeredDocNo: "DOC-2024-KNC-00108" }
    }
  },
  {
    id: "LOG-2026-90402",
    timestamp: "13 Sep 2026, 04:30 PM",
    timeOnly: "04:30 PM",
    dateOnly: "13 Sep 2026",
    user: "System Auto-Ingestion",
    role: "DPI Gateway Sync Agent",
    action: "Data Synchronization",
    module: "Cadastral GIS",
    ulpin: "TN33010001014",
    surveyNumber: "64/1A",
    previousValue: "LGD Village Code: Pending Resolution",
    newValue: "LGD Village Code: 629402 (Census 2011 Mapped)",
    ipAddress: "127.0.0.1",
    deviceInfo: "Local PostGIS Spatial Ingestion Job",
    status: "Completed",
    sha256Hash: "8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c",
    provenanceNote: "Official Ministry of Panchayati Raj Local Government Directory boundary sync.",
    rawJsonDiff: {
      previous: { lgdCode: null },
      new: { lgdCode: "629402", censusVillage: "Pollachi Rural" }
    }
  },
  {
    id: "LOG-2026-90401",
    timestamp: "13 Sep 2026, 02:10 PM",
    timeOnly: "02:10 PM",
    dateOnly: "13 Sep 2026",
    user: "Surveyor 44",
    role: "Taluk Revenue Surveyor",
    action: "Field Inspection",
    module: "Statutory Approvals",
    ulpin: "TN33010001015",
    surveyNumber: "171/3A",
    previousValue: "Inspection: Pending Ground Visit",
    newValue: "Inspection: Completed Ground Survey (Report INSP-2026-004 Filed)",
    ipAddress: "10.12.88.14",
    deviceInfo: "Trimble Geo7X DGPS Handheld",
    status: "Completed",
    sha256Hash: "9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d",
    provenanceNote: "Physical ground-truthing confirmed foundation excavation within approved plot boundaries.",
    rawJsonDiff: {
      previous: { inspectionStatus: "PENDING" },
      new: { inspectionStatus: "COMPLETED", fieldReportId: "INSP-2026-004" }
    }
  }
];

export default function AuditTrailPage() {
  const { officer } = useOfficerAuth();

  // STATE: 6 REQUIRED FILTERS (Date, User, Module, Action, Status, ULPIN)
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [userFilter, setUserFilter] = useState<string>("ALL");
  const [moduleFilter, setModuleFilter] = useState<string>("ALL");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [ulpinSearch, setUlpinSearch] = useState<string>("");

  // DETAIL MODAL
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // DYNAMIC LIST OF USERS, MODULES, ACTIONS
  const usersList = useMemo(() => {
    return Array.from(new Set(INITIAL_AUDIT_LOGS.map(l => l.user))).sort();
  }, []);

  const modulesList = useMemo(() => {
    return Array.from(new Set(INITIAL_AUDIT_LOGS.map(l => l.module))).sort();
  }, []);

  const actionsList = useMemo(() => {
    return Array.from(new Set(INITIAL_AUDIT_LOGS.map(l => l.action))).sort();
  }, []);

  // FILTERED CHRONOLOGICAL LOGS
  const filteredLogs = useMemo(() => {
    return INITIAL_AUDIT_LOGS.filter(entry => {
      // Date filter
      if (dateFilter !== "ALL") {
        if (dateFilter === "TODAY" && !entry.dateOnly.includes("15 Sep 2026")) return false;
        if (dateFilter === "YESTERDAY" && !entry.dateOnly.includes("14 Sep 2026")) return false;
      }

      // User filter
      if (userFilter !== "ALL" && entry.user !== userFilter) return false;

      // Module filter
      if (moduleFilter !== "ALL" && entry.module !== moduleFilter) return false;

      // Action filter
      if (actionFilter !== "ALL" && entry.action !== actionFilter) return false;

      // Status filter
      if (statusFilter !== "ALL" && entry.status !== statusFilter) return false;

      // ULPIN Search filter
      if (ulpinSearch.trim()) {
        const q = ulpinSearch.trim().toLowerCase();
        const matchesUlpin = entry.ulpin.toLowerCase().includes(q);
        const matchesSurvey = entry.surveyNumber.toLowerCase().includes(q);
        if (!matchesUlpin && !matchesSurvey) return false;
      }

      return true;
    });
  }, [dateFilter, userFilter, moduleFilter, actionFilter, statusFilter, ulpinSearch]);

  // RESET ALL FILTERS
  const handleResetFilters = () => {
    setDateFilter("ALL");
    setUserFilter("ALL");
    moduleFilter !== "ALL" && setModuleFilter("ALL");
    actionFilter !== "ALL" && setActionFilter("ALL");
    statusFilter !== "ALL" && setStatusFilter("ALL");
    setUlpinSearch("");
  };

  const isFiltered = dateFilter !== "ALL" || userFilter !== "ALL" || moduleFilter !== "ALL" || actionFilter !== "ALL" || statusFilter !== "ALL" || ulpinSearch.trim() !== "";

  // EXPORT CSV HANDLER
  const handleExportCSV = () => {
    const headers = ["Timestamp", "User", "Role", "Action", "Module", "Parcel / ULPIN", "Survey Number", "Previous Value", "New Value", "IP / Device", "Status", "SHA256 Hash"];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.user}"`,
      `"${l.role}"`,
      `"${l.action}"`,
      `"${l.module}"`,
      `"${l.ulpin}"`,
      `"${l.surveyNumber}"`,
      `"${l.previousValue.replace(/"/g, '""')}"`,
      `"${l.newValue.replace(/"/g, '""')}"`,
      `"${l.ipAddress} (${l.deviceInfo})"`,
      `"${l.status}"`,
      `"${l.sha256Hash}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Tamil_Nadu_Land_Stack_Audit_Trail_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <OfficerProtectedGuard>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-[#102A43] flex items-center gap-2.5">
                <History className="w-7 h-7 text-[#1D5FD1]" />
                <span>Audit Trail</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EDF7F2] text-[#16845B] border border-[#16845B]/30 uppercase">
                Immutable SHA-256
              </span>
            </div>
            <p className="text-xs text-[#53627A] mt-1">
              Tamper-evident chronological audit ledger • Recording every statutory mutation, SRO registration, spatial resurvey, and administrative determination across Tamil Nadu land records.
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-md bg-white hover:bg-[#F7F9FC] text-[#102A43] font-semibold text-xs border border-[#E3E8EF] transition-colors shadow-2xs flex items-center space-x-1.5"
              title="Download filtered audit log as CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#53627A]" />
              <span>Export Audit Log</span>
            </button>

            <Link
              href="/integration"
              className="px-3.5 py-2 rounded-md bg-[#F1F5FB] hover:bg-[#E2ECFA] text-[#1D5FD1] font-semibold text-xs border border-[#CCE0FD] transition-colors shadow-2xs flex items-center space-x-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Connected Systems</span>
            </Link>
          </div>
        </div>

        {/* SUMMARY CARDS STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-[#E3E8EF] shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#53627A] uppercase tracking-wider">Logged Audit Events</span>
              <History className="w-4 h-4 text-[#1D5FD1]" />
            </div>
            <div className="text-2xl font-bold text-[#102A43] font-mono">1,428,940</div>
            <span className="text-[11px] text-[#16845B] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Cryptographically Valid</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E3E8EF] shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#53627A] uppercase tracking-wider">Active Filter Match</span>
              <Filter className="w-4 h-4 text-[#16845B]" />
            </div>
            <div className="text-2xl font-bold text-[#102A43] font-mono">{filteredLogs.length} Events</div>
            <span className="text-[11px] text-[#53627A]">Displaying chronological records</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E3E8EF] shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#53627A] uppercase tracking-wider">Verification Authority</span>
              <ShieldCheck className="w-4 h-4 text-[#1D5FD1]" />
            </div>
            <div className="text-sm font-bold text-[#102A43] truncate">Tamil Nilam CLA & SRO Bus</div>
            <span className="text-[11px] text-[#16845B] font-medium">Secured with mTLS 1.3</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E3E8EF] shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#53627A] uppercase tracking-wider">Rolling Audit Window</span>
              <Clock className="w-4 h-4 text-[#E99A16]" />
            </div>
            <div className="text-2xl font-bold text-[#102A43] font-mono">30 Days</div>
            <span className="text-[11px] text-[#53627A]">Indefinite Cold Storage Mirror</span>
          </div>
        </div>

        {/* SIX REQUIRED FILTERS (Date, User, Module, Action, Status, ULPIN) */}
        <div className="bg-white border border-[#E3E8EF] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-3">
            <span className="text-xs font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#1D5FD1]" />
              <span>Audit Trail Filter Parameters</span>
            </span>

            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#D9363E] hover:underline font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            
            {/* 1. FILTER: DATE */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Date
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] font-semibold focus:border-[#1D5FD1] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Dates</option>
                <option value="TODAY">Today (15 Sep 2026)</option>
                <option value="YESTERDAY">Yesterday (14 Sep 2026)</option>
              </select>
            </div>

            {/* 2. FILTER: USER */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                User
              </label>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] font-semibold focus:border-[#1D5FD1] focus:outline-none cursor-pointer truncate"
              >
                <option value="ALL">All Users</option>
                {usersList.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            {/* 3. FILTER: MODULE */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Module
              </label>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] font-semibold focus:border-[#1D5FD1] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Modules</option>
                {modulesList.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* 4. FILTER: ACTION */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Action
              </label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] font-semibold focus:border-[#1D5FD1] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Actions</option>
                {actionsList.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* 5. FILTER: STATUS */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] font-semibold focus:border-[#1D5FD1] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Verified">Verified</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Failed / Rollback">Failed / Rollback</option>
              </select>
            </div>

            {/* 6. FILTER: ULPIN / SURVEY NUMBER */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Parcel / ULPIN
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#53627A] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ULPIN or Survey..."
                  value={ulpinSearch}
                  onChange={(e) => setUlpinSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-[#F8FAFD] border border-[#E3E8EF] rounded-md text-xs text-[#102A43] placeholder-[#53627A] focus:outline-none focus:border-[#1D5FD1] font-mono"
                />
              </div>
            </div>

          </div>
        </div>

        {/* CHRONOLOGICAL AUDIT TRAIL TABLE (ALL 10 REQUIRED COLUMNS) */}
        <div className="bg-white border border-[#E3E8EF] rounded-xl shadow-xs overflow-hidden space-y-0">
          
          <div className="p-4 bg-[#F8FAFD] border-b border-[#E3E8EF] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#53627A]">
                Showing <strong className="text-[#102A43]">{filteredLogs.length}</strong> chronological audit events
              </span>
              {isFiltered && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF4FF] text-[#1D5FD1] border border-[#CCE0FD]">
                  Filtered Active
                </span>
              )}
            </div>

            <span className="text-xs text-[#53627A] font-mono">
              Ordered: Newest First (Chronological)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              
              {/* 10 EXACT REQUIRED COLUMNS */}
              <thead className="bg-[#F1F4F8] text-[#53627A] font-bold uppercase tracking-wider text-[10px] border-b border-[#E3E8EF]">
                <tr>
                  <th className="px-3.5 py-3 whitespace-nowrap">Timestamp</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">User</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Role</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Action</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Module</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Parcel / ULPIN</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Previous Value</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">New Value</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">IP / Device</th>
                  <th className="px-3.5 py-3 whitespace-nowrap text-right">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E3E8EF] text-[#102A43]">
                {filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    onClick={() => setSelectedEntry(log)}
                    className="hover:bg-[#F8FAFD] transition-colors h-[54px] cursor-pointer group"
                  >
                    
                    {/* 1. TIMESTAMP */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-[#102A43] text-xs">
                        {log.timeOnly}
                      </div>
                      <div className="text-[10px] text-[#53627A]">
                        {log.dateOnly}
                      </div>
                    </td>

                    {/* 2. USER */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <div className="font-semibold text-[#102A43] flex items-center gap-1">
                        <User className="w-3 h-3 text-[#1D5FD1]" />
                        <span>{log.user}</span>
                      </div>
                    </td>

                    {/* 3. ROLE */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <span className="text-[11px] text-[#53627A] truncate max-w-[140px] block" title={log.role}>
                        {log.role}
                      </span>
                    </td>

                    {/* 4. ACTION */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <span className="font-bold text-[#102A43] text-xs">
                        {log.action}
                      </span>
                    </td>

                    {/* 5. MODULE */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F1F5FB] text-[#1D5FD1] border border-[#CCE0FD]">
                        {log.module}
                      </span>
                    </td>

                    {/* 6. PARCEL / ULPIN */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-[#1D5FD1] text-[11px]">
                        {log.ulpin}
                      </div>
                      <div className="font-mono text-[10px] text-[#53627A]">
                        S.No {log.surveyNumber}
                      </div>
                    </td>

                    {/* 7. PREVIOUS VALUE */}
                    <td className="px-3.5 py-2.5 max-w-[180px]">
                      <div className="text-[11px] text-[#53627A] truncate line-through decoration-red-400" title={log.previousValue}>
                        {log.previousValue}
                      </div>
                    </td>

                    {/* 8. NEW VALUE */}
                    <td className="px-3.5 py-2.5 max-w-[190px]">
                      <div className="text-[11px] font-medium text-[#16845B] truncate" title={log.newValue}>
                        {log.newValue}
                      </div>
                    </td>

                    {/* 9. IP / DEVICE */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <div className="font-mono text-[11px] text-[#102A43]">
                        {log.ipAddress}
                      </div>
                      <div className="text-[10px] text-[#53627A] truncate max-w-[130px]" title={log.deviceInfo}>
                        {log.deviceInfo}
                      </div>
                    </td>

                    {/* 10. STATUS */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        log.status === "Completed" || log.status === "Verified"
                          ? "bg-[#EDF7F2] text-[#16845B] border border-[#16845B]/30"
                          : log.status === "Pending Verification"
                          ? "bg-[#FEF5E7] text-[#E99A16] border border-[#E99A16]/30"
                          : "bg-[#FDEDEE] text-[#D9363E] border border-[#D9363E]/30"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          log.status === "Completed" || log.status === "Verified" ? "bg-[#16845B]" : "bg-[#E99A16]"
                        }`}></span>
                        <span>{log.status}</span>
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </div>

        {/* AUDIT LOG DETAIL & CRYPTOGRAPHIC INSPECTION MODAL */}
        {selectedEntry && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full border border-[#E3E8EF] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              
              {/* MODAL HEADER */}
              <div className="p-5 border-b border-[#E3E8EF] flex items-center justify-between bg-[#F8FAFD]">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-white border border-[#CCE0FD] text-[#1D5FD1]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-base text-[#102A43]">
                        Audit Event: {selectedEntry.action}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EDF7F2] text-[#16845B] border border-[#16845B]/30">
                        {selectedEntry.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#53627A]">
                      Event ID: <span className="font-mono font-bold">{selectedEntry.id}</span> • {selectedEntry.timestamp}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-[#53627A] hover:text-[#102A43] font-bold p-1 rounded"
                >
                  ✕
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="p-5 space-y-4 text-xs">
                
                {/* 4 SUMMARY BLOCKS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#F8FAFD] border border-[#E3E8EF] space-y-0.5">
                    <span className="text-[10px] text-[#53627A] uppercase font-bold block">User & Designated Role</span>
                    <strong className="text-[#102A43] block">{selectedEntry.user}</strong>
                    <span className="text-[10px] text-[#53627A] block">{selectedEntry.role}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F8FAFD] border border-[#E3E8EF] space-y-0.5">
                    <span className="text-[10px] text-[#53627A] uppercase font-bold block">Affected Parcel / ULPIN</span>
                    <strong className="font-mono text-[#1D5FD1] block">{selectedEntry.ulpin}</strong>
                    <span className="text-[10px] text-[#53627A] block">Survey Number {selectedEntry.surveyNumber}</span>
                  </div>
                </div>

                {/* VALUE DELTA COMPARISON */}
                <div className="p-3.5 rounded-lg bg-[#F8FAFD] border border-[#E3E8EF] space-y-2">
                  <span className="text-[10px] text-[#53627A] uppercase font-bold block">State Mutation Delta</span>
                  
                  <div className="space-y-1">
                    <div className="flex items-start space-x-2 text-xs">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#FDEDEE] text-[#D9363E] shrink-0">Previous</span>
                      <span className="text-[#53627A]">{selectedEntry.previousValue}</span>
                    </div>
                    <div className="flex items-start space-x-2 text-xs">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#EDF7F2] text-[#16845B] shrink-0">Updated</span>
                      <strong className="text-[#16845B]">{selectedEntry.newValue}</strong>
                    </div>
                  </div>
                </div>

                {/* DEVICE & PROVENANCE METADATA */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#F8FAFD] border border-[#E3E8EF] space-y-0.5">
                    <span className="text-[10px] text-[#53627A] uppercase font-bold block">IP Address & Network</span>
                    <span className="font-mono font-bold text-[#102A43] block">{selectedEntry.ipAddress}</span>
                    <span className="text-[10px] text-[#53627A] block">{selectedEntry.deviceInfo}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F8FAFD] border border-[#E3E8EF] space-y-0.5">
                    <span className="text-[10px] text-[#53627A] uppercase font-bold block">Module & Provenance Note</span>
                    <span className="font-bold text-[#1D5FD1] block">{selectedEntry.module}</span>
                    <span className="text-[10px] text-[#53627A] block">{selectedEntry.provenanceNote}</span>
                  </div>
                </div>

                {/* CRYPTOGRAPHIC AUDIT HASH */}
                <div className="p-3 rounded-lg bg-[#102A43] text-white space-y-1 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1">
                      <Fingerprint className="w-3.5 h-3.5 text-[#16845B]" />
                      <span>Cryptographic SHA-256 State Hash:</span>
                    </span>
                    <button
                      onClick={() => handleCopyHash(selectedEntry.sha256Hash)}
                      className="text-[#16845B] hover:text-emerald-300 text-[10px] font-bold"
                    >
                      {copiedHash === selectedEntry.sha256Hash ? "✓ Copied" : "Copy Hash"}
                    </button>
                  </div>
                  <div className="text-emerald-400 break-all text-[10px]">
                    {selectedEntry.sha256Hash}
                  </div>
                </div>

              </div>

              {/* MODAL FOOTER */}
              <div className="p-4 border-t border-[#E3E8EF] flex items-center justify-end space-x-2 bg-[#F8FAFD]">
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="px-4 py-2 rounded-md bg-[#102A43] text-white text-xs font-semibold hover:bg-[#1C3D5D] transition-colors"
                >
                  Close Inspection
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </OfficerProtectedGuard>
  );
}

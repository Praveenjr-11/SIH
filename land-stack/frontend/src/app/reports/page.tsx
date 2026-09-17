"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  FileText, 
  ArrowLeft, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  Eye, 
  Filter, 
  Search, 
  Building2, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  RotateCcw, 
  Check, 
  Sliders, 
  Compass, 
  IndianRupee, 
  Scale, 
  FileCheck2, 
  Clock, 
  QrCode,
  Share2,
  Table
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";
import OfficerProtectedGuard from "@/components/OfficerProtectedGuard";
import StatusBadge from "@/components/StatusBadge";

// THE 8 REQUIRED REPORT TYPES
export type ReportType = 
  | "Land Reports"
  | "Registry Reports"
  | "Ownership Reports"
  | "Land Use Reports"
  | "Case Reports"
  | "Tax Reports"
  | "GIS Reports"
  | "Data Quality Reports";

// DISTRICTS & TALUKS HIERARCHY
const TN_DISTRICTS_MAP: Record<string, string[]> = {
  "Kanchipuram": ["Sriperumbudur", "Pennalur", "Irungattukottai", "Oragadam", "Mambakkam"],
  "Chengalpattu": ["Tambaram", "Vandalur", "Chengalpattu Town", "Mahabalipuram", "Guduvancheri"],
  "Thiruvallur": ["Avadi", "Ponneri", "Gummidipoondi", "Tiruttani", "Thiruvallur Town"],
  "Chennai": ["Ambattur", "Guindy", "Velachery", "T. Nagar", "Perambur"],
  "Coimbatore": ["Singanallur", "Peelamedu", "Thudiyalur", "Pollachi", "Annur"],
  "Madurai": ["Thiruparankundram", "Melur", "Usilampatti", "Vadipatti", "Madurai North"],
  "Salem": ["Attur", "Mettur", "Omalur", "Sankari", "Salem South"],
  "Tiruchirappalli": ["Srirangam", "Lalgudi", "Manapparai", "Thottiyam", "Trichy Town"]
};

// REPORT CONFIGURATION
interface ReportConfig {
  type: ReportType;
  title: string;
  subtitle: string;
  department: string;
  refPrefix: string;
  icon: any;
  summaryMetrics: { label: string; value: string; subtext: string }[];
  columns: string[];
}

const REPORT_CONFIGS: Record<ReportType, ReportConfig> = {
  "Land Reports": {
    type: "Land Reports",
    title: "Statewide Cadastral Land Inventory & Boundary Demarcation Register",
    subtitle: "Consolidated register of revenue parcels, surveyed acreages & 14-digit ULPIN assignments",
    department: "Commissionerate of Survey and Settlement (CSS) • Department of Revenue Administration",
    refPrefix: "TN-LAND-INV",
    icon: Layers,
    summaryMetrics: [
      { label: "Total Monitored Parcels", value: "24,100", subtext: "100% Assigned ULPIN" },
      { label: "Total Surveyed Extent", value: "58,400 Acres", subtext: "DGPS Resurvey Verified" },
      { label: "Clear Boundary Titles", value: "94.2%", subtext: "Zero Spatial Intersections" },
      { label: "Active Revenue Villages", value: "48 Villages", subtext: "In Selected Jurisdiction" }
    ],
    columns: ["ULPIN", "Survey No", "Revenue Village", "Taluk", "Extent (Acres)", "Classification", "Verification Status", "Resurvey Year"]
  },
  "Registry Reports": {
    type: "Registry Reports",
    title: "Sub-Registrar Office (SRO) Certified Transactions & Deeds Register",
    subtitle: "Certified record of registered conveyance deeds, settlements, mortgages & stamp duty realization",
    department: "Commercial Taxes and Registration Department • TNREGINET SRO System",
    refPrefix: "TN-SRO-REG",
    icon: FileText,
    summaryMetrics: [
      { label: "Total Registered Deeds", value: "4,820 Deeds", subtext: "FY 2025-26 Indexed" },
      { label: "Stamp Duty Realization", value: "₹ 142.50 Cr", subtext: "State Exchequer Credited" },
      { label: "Average Turnaround", value: "4.2 Days", subtext: "Deed to Indexing" },
      { label: "Nil Encumbrance (EC)", value: "96.4%", subtext: "Clean 13-Year Ledgers" }
    ],
    columns: ["Registration Doc No", "ULPIN", "Survey No", "Executant / Claimant", "Transaction Type", "Consideration Value", "Stamp Duty", "Registration Date"]
  },
  "Ownership Reports": {
    type: "Ownership Reports",
    title: "Record of Rights (RoR) / Patta Chitta & Mutation Audit Register",
    subtitle: "Authoritative ledger of statutory freehold titles, joint-pattadar rights & approved mutations",
    department: "Commissionerate of Land Administration (CLA) • Tamil Nilam Revenue Portal",
    refPrefix: "TN-ROR-PATTA",
    icon: ShieldCheck,
    summaryMetrics: [
      { label: "Total Patta Passbooks", value: "18,450", subtext: "Digitally Signed Pattas" },
      { label: "Mutations Approved", value: "3,640", subtext: "Sub-second Auto Endorsements" },
      { label: "Joint Ownership Ratio", value: "24.8%", subtext: "Multiple Khatedar Titles" },
      { label: "A-Register Discrepancies", value: "0.4%", subtext: "Under Field Reconciliation" }
    ],
    columns: ["Patta Number", "ULPIN", "Survey No", "Registered Pattadar", "Joint Co-owners", "Mutation Status", "A-Register Classification", "Issuance Date"]
  },
  "Land Use Reports": {
    type: "Land Use Reports",
    title: "Statutory Master Plan & Land Use Zoning Compliance Register",
    subtitle: "Zoning conformity analysis, agricultural wetland conversion audit & FSI utilization review",
    department: "Directorate of Town and Country Planning (DTCP) & CMDA Master Plan Wing",
    refPrefix: "TN-LULC-ZONE",
    icon: Compass,
    summaryMetrics: [
      { label: "Zoned Land Parcels", value: "12,800", subtext: "Master Plan 2026 Conforming" },
      { label: "Agricultural Wetland", value: "43.5%", subtext: "Protected Nanjai / Punjai" },
      { label: "Industrial SIPCOT Area", value: "17.6%", subtext: "Active Manufacturing Zones" },
      { label: "Unauthorized Conversions", value: "14 Flags", subtext: "Section 47-A Enforced" }
    ],
    columns: ["ULPIN", "Survey No", "Master Plan Zone", "Permissible FSI", "Current Use", "Conversion NOC Status", "Buffer Requirement", "Compliance Status"]
  },
  "Case Reports": {
    type: "Case Reports",
    title: "Revenue Court & Statutory Adjudication Queue Register",
    subtitle: "Summary of contested titles, boundary disputes, interim stays & officer determinations",
    department: "Revenue Court Management System (RCMS) • Office of District Collector & Magistrate",
    refPrefix: "TN-REV-CASE",
    icon: Scale,
    summaryMetrics: [
      { label: "Active Revenue Cases", value: "1,420 Cases", subtext: "Under Adjudication" },
      { label: "High / Critical Risk", value: "18 Cases", subtext: "Civil Court Stays Active" },
      { label: "Field Inspections Due", value: "42 Visits", subtext: "Taluk Survey Mandates" },
      { label: "Disposal Rate (FY26)", value: "84.2%", subtext: "Within Statutory Timeframes" }
    ],
    columns: ["Case Reference", "Survey No & ULPIN", "Landowner / Claimant", "Case Category", "Risk Level", "Adjudication Status", "Hearing Date", "Bench"]
  },
  "Tax Reports": {
    type: "Tax Reports",
    title: "Urban Local Body & Village Panchayat Property Tax Ledger",
    subtitle: "Municipal tax assessments, plinth area reconciliation & revenue collection audit",
    department: "Municipal Administration & Water Supply (MAWS) & RDPR Panchayat Tax Gateway",
    refPrefix: "TN-TAX-AUDIT",
    icon: IndianRupee,
    summaryMetrics: [
      { label: "Total Assessed Units", value: "16,200", subtext: "Geo-referenced Plinth Areas" },
      { label: "Current Demand Raised", value: "₹ 24.80 Cr", subtext: "Annual Assessment" },
      { label: "Collection Efficiency", value: "91.8%", subtext: "₹ 22.76 Cr Realized" },
      { label: "Pending Defaulter Dues", value: "₹ 2.04 Cr", subtext: "Form 7 Demand Issued" }
    ],
    columns: ["Assessment ID", "ULPIN", "Survey No", "Assessee Name", "Ward / Village", "Annual Tax Dues", "Payment Status", "Last Payment Date"]
  },
  "GIS Reports": {
    type: "GIS Reports",
    title: "Spatial PostGIS Cadastre & Geohazard Buffer Zone Register",
    subtitle: "DGPS spatial vertex accuracy, GSI geotechnical load bearing & floodway buffer intersections",
    department: "TNGIS Nodal Engine & Geological Survey of India (GSI) Collaborative Grid",
    refPrefix: "TN-GIS-SPATIAL",
    icon: MapPin,
    summaryMetrics: [
      { label: "DGPS Fixed Parcels", value: "24,100", subtext: "0.02m Sub-centimeter Accuracy" },
      { label: "Stable Granitic Bedrock", value: "72.2%", subtext: ">250 kPa Bearing Capacity" },
      { label: "River Buffer Easements", value: "1,420 Parcels", subtext: "Water Resources Dept Clear" },
      { label: "Topological Errors", value: "0 Gaps", subtext: "Zero Silver/Overlap Faults" }
    ],
    columns: ["ULPIN", "Survey No", "Boundary Vertices", "Soil Bearing (kPa)", "Waterbody Distance", "Seismic Zone", "CRZ Buffer Status", "Spatial Topology"]
  },
  "Data Quality Reports": {
    type: "Data Quality Reports",
    title: "Cadastral Hygiene, ULPIN Deduplication & Anomaly Audit Register",
    subtitle: "Comprehensive algorithmic audit of geometry gaps, missing Aadhaar hashes & duplicate surveys",
    department: "State Data Governance Cell • Bharat Land Stack Core Integrity Engine",
    refPrefix: "TN-DATA-HYGIENE",
    icon: AlertTriangle,
    summaryMetrics: [
      { label: "Clean Records Ratio", value: "99.2%", subtext: "Passed All Schema Validations" },
      { label: "Missing Owner Hashes", value: "12 Records", subtext: "Under VAO Verification" },
      { label: "Boundary Sliver Gaps", value: "4 Parcels", subtext: "Pending Tie-Line Demarcation" },
      { label: "Duplicate Survey Flags", value: "0 Detected", subtext: "Unique ULPIN Enforced" }
    ],
    columns: ["Audit ID", "ULPIN / Survey No", "Discrepancy Category", "Severity Level", "Affected Area", "Reporting Agency", "Corrective Directive", "Action Assigned"]
  }
};

export default function ReportsPage() {
  const { officer } = useOfficerAuth();

  // REPORT SELECTION
  const [selectedReportType, setSelectedReportType] = useState<ReportType>("Land Reports");

  // FILTERS (District, Taluk, Village, Date Range, Land Type, Status)
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Kanchipuram");
  const [selectedTaluk, setSelectedTaluk] = useState<string>("Sriperumbudur");
  const [selectedVillage, setSelectedVillage] = useState<string>("Pennalur");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("FY_2025_26");
  const [selectedLandType, setSelectedLandType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // VIEW MODE: "DOCUMENT_VIEW" (Clean official document) vs "TABLE_VIEW"
  const [viewMode, setViewMode] = useState<"DOCUMENT_VIEW" | "TABLE_VIEW">("DOCUMENT_VIEW");
  const [reportGeneratedAt, setReportGeneratedAt] = useState<string>("16 Sep 2026, 11:00 AM");

  // Available taluks based on selected district
  const availableTaluks = useMemo(() => {
    return TN_DISTRICTS_MAP[selectedDistrict] || ["Sriperumbudur", "Pennalur", "Oragadam"];
  }, [selectedDistrict]);

  // Current active report config
  const activeConfig = useMemo(() => {
    return REPORT_CONFIGS[selectedReportType];
  }, [selectedReportType]);

  // Generate dynamic document reference number
  const reportDocRef = useMemo(() => {
    const distCode = selectedDistrict.slice(0, 3).toUpperCase();
    return `${activeConfig.refPrefix}-${distCode}-2026-00418`;
  }, [activeConfig, selectedDistrict]);

  // Generate mock tabular schedule data for the active report
  const reportRows = useMemo(() => {
    const baseSurveys = ["171/3A", "181/9A", "197/7B", "334/9C", "133/9D", "101/5E", "214/2C", "108/5B"];
    const owners = [
      "Thiru K. Muthusamy & Family",
      "Thiru K. Ramaswamy & Family",
      "SIPCOT Industrial Growth Centre",
      "Thiru M. Loganathan",
      "Renault-Nissan Suppliers Hub",
      "Tmt. V. Lakshmi Devi",
      "Ambattur Infrastructure Parks Ltd",
      "Public Works Dept (WRD) Buffer"
    ];

    return baseSurveys.map((sNo, idx) => {
      const ulpin = `TN3301000${1004 + idx}`;
      const owner = owners[idx % owners.length];

      switch (selectedReportType) {
        case "Land Reports":
          return [
            ulpin,
            sNo,
            selectedVillage,
            selectedTaluk,
            `${(2.1 + idx * 0.75).toFixed(2)} Acres`,
            idx % 3 === 0 ? "Nanjai (Wet)" : idx % 3 === 1 ? "Punjai (Dry)" : "Industrial SIPCOT",
            idx === 2 ? "Disputed" : "Verified Clear",
            "2024"
          ];
        case "Registry Reports":
          return [
            `DOC-2024-SRO-${1001 + idx}`,
            ulpin,
            sNo,
            owner,
            idx % 2 === 0 ? "Sale Deed Title" : "Settlement Deed",
            `₹ ${(48.5 + idx * 18.2).toFixed(2)} Lakhs`,
            `₹ ${(3.4 + idx * 1.25).toFixed(2)} Lakhs`,
            `${10 + idx}-Apr-2025`
          ];
        case "Ownership Reports":
          return [
            `PATTA-2024-${4780 + idx}`,
            ulpin,
            sNo,
            owner,
            idx % 2 === 0 ? "Single Title" : "3 Joint Co-owners",
            "Approved (Current)",
            idx % 3 === 0 ? "Ryotwari Nanjai" : "Ryotwari Punjai",
            `${14 + idx}-Jan-2024`
          ];
        case "Land Use Reports":
          return [
            ulpin,
            sNo,
            idx % 2 === 0 ? "Agricultural Living Zone" : "Industrial Corridor",
            idx % 2 === 0 ? "1.50 FSI" : "2.25 FSI",
            idx % 2 === 0 ? "Cultivation" : "Manufacturing",
            "Clearance Sanctioned",
            "15m Road Width",
            "100% Master Plan Conforming"
          ];
        case "Case Reports":
          return [
            `CASE-2026-TN-${100001 + idx}`,
            `S.No ${sNo} • ${ulpin}`,
            owner,
            idx % 2 === 0 ? "Zone Conversion NOC" : "Boundary Dispute",
            idx === 0 ? "HIGH" : idx === 3 ? "CRITICAL" : "LOW",
            idx === 0 ? "Officer Review" : idx === 1 ? "Field Inspection" : "Approved Clear",
            `${18 + idx}-Sep-2026`,
            "Collectorate Revenue Bench"
          ];
        case "Tax Reports":
          return [
            `PTAX-2026-${sNo.replace('/', '-')}`,
            ulpin,
            sNo,
            owner,
            `${selectedVillage} / Ward ${idx + 1}`,
            `₹ ${(3200 + idx * 650).toLocaleString()}`,
            idx === 3 ? "Pending Dues" : "Paid & Reconciled",
            `${12 + idx}-May-2026`
          ];
        case "GIS Reports":
          return [
            ulpin,
            sNo,
            "14 DGPS Vertices (Fixed)",
            "250 kPa (High Bearing)",
            `${280 + idx * 60}m to Waterbody`,
            "Zone II (Low Seismic)",
            "Outside CRZ (Safe)",
            "Valid Topo-Polygon"
          ];
        case "Data Quality Reports":
          return [
            `AUDIT-TN-${901 + idx}`,
            `${ulpin} (S.No ${sNo})`,
            idx % 2 === 0 ? "Minor Coordinate Micro-Gap" : "Legacy Name Spelling Mismatch",
            idx === 1 ? "HIGH" : "LOW",
            "0.01 Acres",
            "CSS Survey Audit Cell",
            "Update FMB Sheet Tie-Line",
            "Assigned to Taluk Surveyor"
          ];
      }
    });
  }, [selectedReportType, selectedVillage, selectedTaluk]);

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!searchFilter.trim()) return reportRows;
    const q = searchFilter.toLowerCase().trim();
    return reportRows.filter(row => row.some(cell => cell.toLowerCase().includes(q)));
  }, [reportRows, searchFilter]);

  // ACTIONS HANDLERS
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = activeConfig.columns;
    const csvContent = "data:text/csv;charset=utf-8," + [
      [`"GOVERNMENT OF TAMIL NADU - ${activeConfig.title.toUpperCase()}"`],
      [`"Reference: ${reportDocRef}"`, `"Jurisdiction: ${selectedVillage} Village, ${selectedTaluk} Taluk, ${selectedDistrict} District"`, `"Generated: ${reportGeneratedAt}"`],
      [],
      headers.map(h => `"${h}"`).join(","),
      ...filteredRows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportDocRef}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    // Generate clean tab-delimited XLS format
    const headers = activeConfig.columns;
    let excelContent = `<html><head><meta charset="utf-8"></head><body>`;
    excelContent += `<h2>GOVERNMENT OF TAMIL NADU</h2>`;
    excelContent += `<h3>${activeConfig.title}</h3>`;
    excelContent += `<p><strong>Reference:</strong> ${reportDocRef} | <strong>Jurisdiction:</strong> ${selectedVillage}, ${selectedTaluk}, ${selectedDistrict} | <strong>Date:</strong> ${reportGeneratedAt}</p>`;
    excelContent += `<table border="1"><thead><tr>`;
    headers.forEach(h => { excelContent += `<th style="background:#F1F4F8; color:#102A43;">${h}</th>`; });
    excelContent += `</tr></thead><tbody>`;
    filteredRows.forEach(row => {
      excelContent += `<tr>`;
      row.forEach(cell => { excelContent += `<td>${cell}</td>`; });
      excelContent += `</tr>`;
    });
    excelContent += `</tbody></table></body></html>`;

    const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportDocRef}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefreshReport = () => {
    setReportGeneratedAt(new Date().toLocaleString("en-IN", { 
      day: "numeric", 
      month: "short", 
      year: "numeric", 
      hour: "2-digit", 
      minute: "2-digit" 
    }));
  };

  return (
    <OfficerProtectedGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7 font-sans antialiased pb-24">
        
        {/* TOP NAVIGATION / HEADER (HIDDEN ON PRINT) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3E8EF] pb-5 no-print">
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
                <FileText className="w-7 h-7 text-[#1D5FD1]" />
                <span>Statutory Reports & Registers Module</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F1F5FB] text-[#1D5FD1] border border-[#CCE0FD] uppercase">
                Official Revenue Records
              </span>
            </div>
            <p className="text-xs text-[#53627A] mt-1">
              Government of Tamil Nadu • Authoritative revenue, SRO registration, spatial cadastre, and statutory audit registers.
            </p>
          </div>

          {/* ACTION BUTTONS (ACTIONS: View Report, Download PDF, Export Excel, Export CSV, Print) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "DOCUMENT_VIEW" ? "TABLE_VIEW" : "DOCUMENT_VIEW")}
              className="px-3.5 py-2 rounded-md bg-white hover:bg-[#F7F9FC] text-[#102A43] font-semibold text-xs border border-[#E3E8EF] transition-colors shadow-2xs flex items-center space-x-1.5"
              title="Toggle Document or Table view"
            >
              {viewMode === "DOCUMENT_VIEW" ? <Table className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{viewMode === "DOCUMENT_VIEW" ? "Table View" : "Document View"}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-md bg-white hover:bg-[#F7F9FC] text-[#102A43] font-semibold text-xs border border-[#E3E8EF] transition-colors shadow-2xs flex items-center space-x-1.5"
              title="Export as CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#53627A]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3 py-2 rounded-md bg-white hover:bg-[#F7F9FC] text-[#16845B] font-semibold text-xs border border-[#16845B]/30 hover:border-[#16845B] transition-colors shadow-2xs flex items-center space-x-1.5"
              title="Export as Excel spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#16845B]" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-md bg-[#1D5FD1] hover:bg-[#154CB0] text-white font-semibold text-xs transition-colors shadow-2xs flex items-center space-x-1.5"
              title="Download PDF / Print Document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>

        {/* 8 REPORT TYPES HORIZONTAL PILL SELECTOR (NO-PRINT) */}
        <div className="bg-white border border-[#E3E8EF] rounded-xl p-3 shadow-xs no-print space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-[#53627A] uppercase tracking-wider">
              Select Statutory Report Category (8 Official Modules)
            </span>
            <span className="text-xs text-[#1D5FD1] font-semibold font-mono">
              {selectedReportType}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {(Object.keys(REPORT_CONFIGS) as ReportType[]).map((rType) => {
              const cfg = REPORT_CONFIGS[rType];
              const Icon = cfg.icon;
              const isSelected = selectedReportType === rType;

              return (
                <button
                  key={rType}
                  onClick={() => setSelectedReportType(rType)}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between h-[72px] transition-all ${
                    isSelected
                      ? "bg-[#1D5FD1] text-white border-[#1D5FD1] shadow-xs"
                      : "bg-[#F8FAFD] text-[#102A43] border-[#E3E8EF] hover:border-[#1D5FD1]/50 hover:bg-[#F1F5FB]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-[#1D5FD1]"}`} />
                  <span className={`text-[11px] font-bold leading-tight line-clamp-2 ${isSelected ? "text-white" : "text-[#102A43]"}`}>
                    {rType}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* COMPREHENSIVE FILTER CONTROLS BAR (FILTERS: District, Taluk, Village, Date Range, Land Type, Status) */}
        <div className="bg-white border border-[#E3E8EF] rounded-xl p-5 shadow-xs space-y-4 no-print">
          <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-3">
            <span className="text-xs font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#1D5FD1]" />
              <span>Statutory Filter Parameters</span>
            </span>
            <button
              onClick={handleRefreshReport}
              className="text-xs text-[#1D5FD1] hover:underline font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Regenerate Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            
            {/* 1. DISTRICT */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  const firstT = TN_DISTRICTS_MAP[e.target.value]?.[0] || "Sriperumbudur";
                  setSelectedTaluk(firstT);
                }}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] font-semibold focus:border-[#1D5FD1] focus:outline-none cursor-pointer"
              >
                {Object.keys(TN_DISTRICTS_MAP).map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            {/* 2. TALUK */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Taluk
              </label>
              <select
                value={selectedTaluk}
                onChange={(e) => setSelectedTaluk(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] font-semibold focus:border-[#1D5FD1] focus:outline-none cursor-pointer"
              >
                {availableTaluks.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* 3. VILLAGE */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Village
              </label>
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] font-semibold focus:border-[#1D5FD1] focus:outline-none cursor-pointer"
              >
                <option value="Pennalur">Pennalur Village</option>
                <option value="Sriperumbudur">Sriperumbudur Village</option>
                <option value="Irungattukottai">Irungattukottai Village</option>
                <option value="Oragadam">Oragadam Village</option>
                <option value="Mambakkam">Mambakkam Village</option>
              </select>
            </div>

            {/* 4. DATE RANGE */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Date Range
              </label>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] font-semibold focus:border-[#1D5FD1] focus:outline-none cursor-pointer"
              >
                <option value="FY_2025_26">Current FY 2025-26</option>
                <option value="LAST_30_DAYS">Last 30 Days</option>
                <option value="LAST_QUARTER">Previous Quarter (Q1 FY26)</option>
                <option value="LAST_1_YEAR">Last 12 Calendar Months</option>
                <option value="HISTORICAL">All Time Historical</option>
              </select>
            </div>

            {/* 5. LAND TYPE */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Land Type
              </label>
              <select
                value={selectedLandType}
                onChange={(e) => setSelectedLandType(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] font-semibold focus:border-[#1D5FD1] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Land Types</option>
                <option value="NANJAI">Nanjai (Wet Agricultural)</option>
                <option value="PUNJAI">Punjai (Dry Agricultural)</option>
                <option value="INDUSTRIAL">Industrial SIPCOT</option>
                <option value="GRAMA_NATHAM">Grama Natham (Settlement)</option>
                <option value="COMMERCIAL">Commercial CBD</option>
                <option value="PORAMBOKE">Government Poramboke</option>
              </select>
            </div>

            {/* 6. STATUS */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] font-semibold focus:border-[#1D5FD1] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Clear Title / Approved</option>
                <option value="OFFICER_REVIEW">Officer Review</option>
                <option value="FIELD_INSPECTION">Field Inspection Due</option>
                <option value="DISPUTED">Court Litigation / Stay</option>
              </select>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* OFFICIAL STATUTORY REPORT DOCUMENT CANVAS (DESIGNED FOR VIEW & PRINT)    */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E3E8EF] rounded-xl shadow-md p-6 sm:p-10 space-y-8 font-sans print-document">
          
          {/* DOCUMENT OFFICIAL HEADER */}
          <div className="border-b-2 border-[#102A43] pb-6 space-y-4">
            
            {/* TOP EMBLEM & CONFIDENTIAL CLASSIFICATION */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* State Emblem Emblem Stamp */}
                <div className="w-14 h-14 rounded-full bg-[#F8FAFD] border-2 border-[#E99A16] flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                  <svg viewBox="0 0 100 100" width={38} height={38} className="w-10 h-10 text-[#E99A16] fill-current">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="#16845B" strokeWidth="4" />
                    <path d="M50 10 L64 34 H36 Z M38 34 L62 34 L65 82 H35 Z" fill="#E99A16" />
                    <path d="M41 43 H59 M41 51 H59 M41 59 H59 M41 67 H59 M41 75 H59" stroke="#102A43" strokeWidth="2.5" fill="none" />
                    <circle cx="50" cy="22" r="3" fill="#E99A16" />
                  </svg>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-[#53627A] uppercase tracking-widest">
                    Government of Tamil Nadu
                  </div>
                  <div className="text-base font-extrabold text-[#102A43] tracking-wide">
                    REVENUE ADMINISTRATION, DISASTER MANAGEMENT & LAND GOVERNANCE
                  </div>
                  <div className="text-[11px] text-[#53627A]">
                    {activeConfig.department}
                  </div>
                </div>
              </div>

              {/* CLASSIFICATION STAMP */}
              <div className="text-right">
                <span className="px-2.5 py-1 rounded bg-[#FDEDEE] text-[#D9363E] border border-[#D9363E]/30 font-mono text-[10px] font-bold uppercase tracking-widest block">
                  OFFICIAL STATUTORY RECORD
                </span>
                <span className="text-[10px] font-mono text-[#53627A] mt-1 block">
                  ISO 19152 LADM • Certified Digest
                </span>
              </div>
            </div>

            {/* TITLE & SCHEDULE SPECIFICATION */}
            <div className="pt-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#102A43] uppercase tracking-tight">
                {activeConfig.title}
              </h2>
              <p className="text-xs text-[#53627A] mt-0.5">
                {activeConfig.subtitle}
              </p>
            </div>

            {/* JURISDICTION & DISPATCH METADATA STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#F8FAFD] rounded-lg border border-[#E3E8EF] text-xs">
              <div>
                <span className="text-[10px] text-[#53627A] uppercase font-bold block">Document Ref No:</span>
                <strong className="font-mono text-[#1D5FD1] text-xs">{reportDocRef}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#53627A] uppercase font-bold block">Jurisdiction Scope:</span>
                <strong className="text-[#102A43] text-xs">{selectedVillage}, {selectedTaluk}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#53627A] uppercase font-bold block">Revenue District:</span>
                <strong className="text-[#102A43] text-xs">{selectedDistrict} District</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#53627A] uppercase font-bold block">Issue Timestamp:</span>
                <strong className="font-mono text-[#102A43] text-xs">{reportGeneratedAt}</strong>
              </div>
            </div>

          </div>

          {/* EXECUTIVE STATISTICAL SUMMARY TILES (4 REQUIRED METRICS) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {activeConfig.summaryMetrics.map((met, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-xl bg-[#F8FAFD] border border-[#E3E8EF] space-y-1"
              >
                <span className="text-[10px] font-bold text-[#53627A] uppercase tracking-wider block">
                  {met.label}
                </span>
                <div className="text-xl sm:text-2xl font-bold text-[#102A43] font-mono">
                  {met.value}
                </div>
                <span className="text-[10px] font-medium text-[#16845B] block">
                  ● {met.subtext}
                </span>
              </div>
            ))}
          </div>

          {/* SEARCH WITHIN GENERATED SCHEDULE (NO-PRINT) */}
          <div className="flex items-center justify-between gap-3 no-print pt-2">
            <span className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
              Schedule of Entries ({filteredRows.length} Records)
            </span>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#53627A] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search report schedule..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1 bg-[#F8FAFD] border border-[#E3E8EF] rounded text-xs text-[#102A43] placeholder-[#53627A] focus:outline-none focus:border-[#1D5FD1] w-48 sm:w-60"
              />
            </div>
          </div>

          {/* MAIN TABULAR SCHEDULE */}
          <div className="overflow-x-auto border border-[#E3E8EF] rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F1F4F8] text-[#53627A] font-bold uppercase tracking-wider text-[10px] border-b border-[#E3E8EF]">
                <tr>
                  <th className="px-3.5 py-3 w-10 text-center">#</th>
                  {activeConfig.columns.map((col, cIdx) => (
                    <th key={cIdx} className="px-3.5 py-3 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8EF] text-[#102A43]">
                {filteredRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[#F8FAFD] transition-colors h-[46px]">
                    <td className="px-3.5 py-2.5 text-center font-mono text-[10px] text-[#53627A]">
                      {rIdx + 1}
                    </td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3.5 py-2.5 whitespace-nowrap">
                        {cIdx === 0 && cell.includes("TN33") ? (
                          <span className="font-mono font-bold text-[#1D5FD1]">{cell}</span>
                        ) : cIdx === 1 && cell.includes("/") ? (
                          <span className="font-mono font-semibold text-[#102A43]">S.No {cell}</span>
                        ) : cell.includes("Verified") || cell.includes("Approved") || cell.includes("Conforming") ? (
                          <span className="inline-flex items-center gap-1 text-[#16845B] font-semibold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{cell}</span>
                          </span>
                        ) : cell.includes("Disputed") || cell.includes("Pending") || cell.includes("HIGH") ? (
                          <span className="inline-flex items-center gap-1 text-[#E99A16] font-semibold text-[11px]">
                            <Clock className="w-3 h-3" />
                            <span>{cell}</span>
                          </span>
                        ) : (
                          <span className="text-[#102A43]">{cell}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* OFFICIAL CERTIFICATION SIGN-OFF BLOCK */}
          <div className="pt-6 border-t-2 border-[#E3E8EF] grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            
            {/* DIGITAL QR VERIFICATION SEAL */}
            <div className="p-3.5 bg-[#F8FAFD] rounded-lg border border-[#E3E8EF] flex items-center space-x-3">
              <div className="w-12 h-12 bg-white border border-[#CCE0FD] rounded flex items-center justify-center shrink-0">
                <QrCode className="w-9 h-9 text-[#102A43]" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-[#53627A] uppercase block">Digital Audit Hash</span>
                <strong className="font-mono text-[10px] text-[#1D5FD1] block truncate max-w-[150px]">
                  SHA256:8f4b...c91a
                </strong>
                <span className="text-[9px] text-[#16845B] font-bold block">
                  ✓ Tamil Nilam Digitally Sealed
                </span>
              </div>
            </div>

            {/* STATUTORY JURISDICTION CODE */}
            <div className="text-center sm:text-left self-center">
              <span className="text-[10px] text-[#53627A] uppercase font-bold block">Revenue Act Compliance</span>
              <p className="text-[11px] text-[#53627A] mt-0.5 leading-tight">
                Generated under the authority of the Tamil Nadu Land Records & Revenue Code, 1898. Certified as an authentic extract from the live state spatial datastore.
              </p>
            </div>

            {/* OFFICER SIGNATURE BOX */}
            <div className="p-3.5 bg-[#F8FAFD] rounded-lg border border-[#E3E8EF] text-right space-y-1">
              <span className="text-[9px] text-[#53627A] uppercase font-bold block">Authorized Signatory</span>
              <strong className="text-xs text-[#102A43] block">
                {officer?.name || "Thiru K. Muthusamy, IAS"}
              </strong>
              <span className="text-[11px] text-[#53627A] block">
                {officer?.role ? officer.role.replace(/_/g, " ") : "District Collector & Magistrate"}
              </span>
              <span className="text-[10px] text-[#16845B] font-bold block">
                Digitally Signed on {reportGeneratedAt}
              </span>
            </div>

          </div>

        </div>

      </div>
    </OfficerProtectedGuard>
  );
}

"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ShieldCheck,
  Shield,
  Edit2,
  UserX,
  UserCheck,
  ArrowLeft,
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  Mail,
  Phone,
  BadgeAlert,
  Lock,
  X,
  Check,
  Info,
  ChevronRight,
  User
} from "lucide-react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";
import OfficerProtectedGuard from "@/components/OfficerProtectedGuard";

// 7 REQUIRED ROLES
export type UserRole =
  | "Administrator"
  | "District Collector"
  | "Revenue Officer"
  | "Registration Officer"
  | "Planning Officer"
  | "Survey Officer"
  | "Viewer";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  badgeNo: string;
  department: string;
  role: UserRole;
  jurisdiction: string;
  status: "Active" | "Deactivated";
  lastLogin: string;
  createdAt: string;
}

// RBAC PERMISSION ITEM DEFINITION
export interface RolePermissionItem {
  module: string;
  action: string;
  level: "Authorized" | "Statutory Approval" | "Review Only" | "Restricted";
  description: string;
}

// ROLE DEFINITIONS & APPLICATION RBAC MATRIX
export const ROLE_DEFINITIONS: Record<
  UserRole,
  {
    tagline: string;
    description: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    permissions: RolePermissionItem[];
  }
> = {
  "Administrator": {
    tagline: "System-Wide Administrative & Cryptographic Authority",
    description: "Full administrative jurisdiction over user provisioning, security key rotation, DPI interoperability gateways, system audit logs, and institutional configurations across Tamil Nadu Land Stack.",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-900",
    badgeBorder: "border-purple-300",
    permissions: [
      { module: "IAM & Users", action: "User Provisioning & Role Assignments", level: "Authorized", description: "Create, edit, and deactivate officer credentials across all departments." },
      { module: "DPI Gateways", action: "Interoperability API Synchronizations", level: "Authorized", description: "Configure mTLS certificates, webhooks, and national Land Stack pipelines." },
      { module: "Audit & Ledger", action: "Immutable Audit Trail Export & Trace", level: "Authorized", description: "Inspect SHA-256 cryptographic chain and export statutory compliance reports." },
      { module: "Land Records", action: "Registry Emergency State Rollback", level: "Authorized", description: "Execute administrative rollbacks under formal High Court / CLA mandates." },
      { module: "GIS & Planning", action: "Master Layer Catalog Ingestion", level: "Authorized", description: "Ingest state-wide Shapefiles, GeoJSONs, and Survey of India benchmarks." }
    ]
  },
  "District Collector": {
    tagline: "District Chief Executive & Statutory Magistrate",
    description: "Highest revenue and magistrate authority for the district. Exercises final statutory clearance on land acquisitions, wetland conversions, waterbody encroachments, and inter-departmental statutory disputes.",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-950",
    badgeBorder: "border-amber-400",
    permissions: [
      { module: "Statutory Approvals", action: "Final Collector Clearance Order (NOC)", level: "Statutory Approval", description: "Approve or reject high-risk cases, wetland reclassification, and industrial NOCs." },
      { module: "Dispute Resolution", action: "Collectorate Appellate Inquiries", level: "Statutory Approval", description: "Adjudicate contested title claims and boundary disputes under Revenue Acts." },
      { module: "Encroachment", action: "Eviction & Recovery Warrants", level: "Statutory Approval", description: "Mandate joint police-revenue field evictions on Government Poramboke land." },
      { module: "Land Records", action: "Inter-Taluk Case Reassignments", level: "Authorized", description: "Reassign pending cases across RDOs, Tahsildars, and Special Land Officers." },
      { module: "Audit Trail", action: "District Governance Trail Audit", level: "Review Only", description: "Inspect all statutory actions performed within jurisdictional district." }
    ]
  },
  "Revenue Officer": {
    tagline: "Tamil Nilam Land Records & Mutation Authority",
    description: "Custodians of Tamil Nilam land records (DRO, RDO, Tahsildar, VAO). Responsible for Patta/Chitta mutations, heirship transfers, Section 47-A guideline inspections, and physical revenue inquiry verification.",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-950",
    badgeBorder: "border-blue-300",
    permissions: [
      { module: "RoR & Patta", action: "Statutory Mutation Endorsement", level: "Authorized", description: "Verify chitta extracts, patta passbooks, and issue digital signature mutations." },
      { module: "Field Inspection", action: "Physical Ground Truthing & Chitta Verification", level: "Authorized", description: "Conduct site verification reports and enter boundary landmark findings." },
      { module: "Statutory Approvals", action: "Tahsil & RDO Recommendation Notes", level: "Authorized", description: "Submit statutory inquiry findings to Collectorate for final clearance." },
      { module: "Registration Deeds", action: "SRO Encumbrance Cross-Check", level: "Review Only", description: "Verify registered deeds prior to sanctioning revenue title alterations." },
      { module: "System Admin", action: "User Credentials Management", level: "Restricted", description: "Cannot provision or revoke system credentials." }
    ]
  },
  "Registration Officer": {
    tagline: "TNREGINET SRO Deed & Encumbrance Authority",
    description: "Sub-Registrar and District Registrar tier for TNREGINET. Oversees 13-year encumbrance certificates, biometric deed execution, stamp duty computation, and court lis pendens injunction attachments.",
    badgeBg: "bg-teal-100",
    badgeText: "text-teal-950",
    badgeBorder: "border-teal-400",
    permissions: [
      { module: "Deed Registration", action: "Execute & Index Registered Deeds", level: "Authorized", description: "Register conveyance deeds, mortgages, gifts, and leases into TNREGINET." },
      { module: "Encumbrance (EC)", action: "Issue 13/30-Year Encumbrance Certificates", level: "Authorized", description: "Audit digital encumbrance ledger and certify transaction continuity." },
      { module: "Valuation & Duty", action: "Guideline Value & Stamp Duty Assessment", level: "Authorized", description: "Compute statutory stamp duty and registration fees based on guideline rates." },
      { module: "Disputes & Liens", action: "Court Lis Pendens Attachment", level: "Authorized", description: "Register court stay orders and financial institution mortgage charges." },
      { module: "Land Mutation", action: "Direct Patta Record Modification", level: "Restricted", description: "Deed registration automatically queues mutation request to Revenue Department." }
    ]
  },
  "Planning Officer": {
    tagline: "DTCP & CMDA Urban/Rural Zoning Authority",
    description: "DTCP and CMDA statutory planning officers. Evaluates Comprehensive Master Plan 2026 zoning, floor space index (FSI) sanctions, maximum permissible building heights, layout clearances, and land use conversions.",
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-950",
    badgeBorder: "border-sky-300",
    permissions: [
      { module: "Master Plan", action: "Zoning Conformance Determination", level: "Statutory Approval", description: "Verify whether proposed parcel usage conforms to designated zoning categories." },
      { module: "Building Sanction", action: "FSI & Height Sanction Clearances", level: "Authorized", description: "Evaluate setbacks, maximum permissible FSI, and road width requirements." },
      { module: "Land Conversion", action: "Agricultural to Non-Agricultural Endorsement", level: "Review Only", description: "Issue planning recommendations for agricultural land conversion applications." },
      { module: "GIS Overlays", action: "Spatial Planning Buffer Verification", level: "Review Only", description: "Inspect infrastructure corridors, green belts, and proposed arterial alignments." },
      { module: "Revenue Mutation", action: "Alter Title Ownership Records", level: "Restricted", description: "Cannot modify revenue ownership or cadastral survey extents." }
    ]
  },
  "Survey Officer": {
    tagline: "Cadastral Survey, FMB & Geodetic Measurement Authority",
    description: "Department of Survey and Settlement surveyors and Assistant Directors. Conducts DGPS field surveys, drone LiDAR orthophoto demarcation, FMB sketch sub-divisions, and coordinates tie-ins with Survey of India geodetic control.",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-950",
    badgeBorder: "border-rose-300",
    permissions: [
      { module: "FMB Cadastre", action: "Sub-Division & Boundary Resurvey", level: "Authorized", description: "Demarcate vertices, establish boundary lengths, and update digital FMB vector." },
      { module: "DGPS Survey", action: "Geodetic Baseline Tie-In", level: "Authorized", description: "Fix precise millimeter coordinates tying into Survey of India CORS network." },
      { module: "Drone LiDAR", action: "High-Resolution Orthophoto Endorsement", level: "Authorized", description: "Verify drone survey orthomosaic and confirm physical fence lines." },
      { module: "Encroachment", action: "Boundary Discrepancy Pinpoint Analysis", level: "Authorized", description: "Certify exact encroachment area in square meters on statutory sketch." },
      { module: "Revenue Clearance", action: "Final Statutory NOC Issuance", level: "Restricted", description: "Survey findings are submitted to Revenue Officers / District Collector." }
    ]
  },
  "Viewer": {
    tagline: "Read-Only Inspection & Citizen Assistance Authority",
    description: "Read-only access tier for citizen facilitation counters, public information kiosks, legal assistants, and external auditing observers. Cannot mutate or approve any statutory record.",
    badgeBg: "bg-slate-200",
    badgeText: "text-slate-900",
    badgeBorder: "border-slate-400",
    permissions: [
      { module: "Public RoR", action: "View Certified RoR & Patta Extracts", level: "Review Only", description: "Search land records by ULPIN, Survey Number, and Village for citizen queries." },
      { module: "Public GIS", action: "Inspect Cadastral GIS & Zoning Maps", level: "Review Only", description: "Browse published parcel boundaries and Master Plan zoning layers." },
      { module: "Registry", action: "Public Guideline Value & Registration Lookup", level: "Review Only", description: "Check prevailing guideline rates and publicly indexed deed summaries." },
      { module: "Approvals", action: "Modify Case Status or Issue Orders", level: "Restricted", description: "No authorization to advance or resolve statutory approval workflows." },
      { module: "IAM & Admin", action: "Access Administrative System Settings", level: "Restricted", description: "Strictly forbidden from modifying any application configuration." }
    ]
  }
};

// INITIAL SEED DATASET OF REALISTIC TAMIL NADU OFFICIALS
const DEFAULT_USERS: SystemUser[] = [
  {
    id: "USR-TN-001",
    name: "Thiru K. Muthusamy, IAS",
    email: "collr.kanchipuram@tn.gov.in",
    phone: "044-27237433",
    badgeNo: "TN-IAS-2012-042",
    department: "Revenue & Disaster Management Department",
    role: "District Collector",
    jurisdiction: "Kanchipuram District",
    status: "Active",
    lastLogin: "Today, 10:42 AM",
    createdAt: "12 Jan 2024"
  },
  {
    id: "USR-TN-002",
    name: "Dr. V. Shanmugam",
    email: "admin.landstack@tn.gov.in",
    phone: "044-28521020",
    badgeNo: "TN-SYS-2010-001",
    department: "Information Technology & Digital Services (TNeGA)",
    role: "Administrator",
    jurisdiction: "Statewide (Tamil Nadu)",
    status: "Active",
    lastLogin: "Today, 11:01 AM",
    createdAt: "01 Jan 2024"
  },
  {
    id: "USR-TN-003",
    name: "Tmt. S. Rajeshwari, DRO",
    email: "dro.kanchipuram@tn.gov.in",
    phone: "044-27237300",
    badgeNo: "TN-DRO-2015-108",
    department: "Revenue & Disaster Management Department",
    role: "Revenue Officer",
    jurisdiction: "Kanchipuram District",
    status: "Active",
    lastLogin: "Today, 09:15 AM",
    createdAt: "18 Feb 2024"
  },
  {
    id: "USR-TN-004",
    name: "Thiru P. Ramanathan, RDO",
    email: "rdo.sriperumbudur@tn.gov.in",
    phone: "044-27426492",
    badgeNo: "TN-RDO-2018-074",
    department: "Commissionerate of Land Administration (CLA)",
    role: "Revenue Officer",
    jurisdiction: "Sriperumbudur Division",
    status: "Active",
    lastLogin: "Yesterday, 04:30 PM",
    createdAt: "05 Mar 2024"
  },
  {
    id: "USR-TN-005",
    name: "Thiru M. Balamurugan",
    email: "sro.sriperumbudur@tn.gov.in",
    phone: "044-27162234",
    badgeNo: "TN-SRO-2016-052",
    department: "Department of Commercial Taxes and Registration (TNREGINET)",
    role: "Registration Officer",
    jurisdiction: "Sriperumbudur SRO Sub-District",
    status: "Active",
    lastLogin: "Today, 10:30 AM",
    createdAt: "22 Apr 2024"
  },
  {
    id: "USR-TN-006",
    name: "Er. R. Anitha",
    email: "dtcp.kanchipuram@tn.gov.in",
    phone: "044-28414800",
    badgeNo: "TN-DTCP-2019-204",
    department: "Housing and Urban Development Department (DTCP / CMDA)",
    role: "Planning Officer",
    jurisdiction: "Chengalpattu & Kanchi Planning Region",
    status: "Active",
    lastLogin: "Yesterday, 02:10 PM",
    createdAt: "14 May 2024"
  },
  {
    id: "USR-TN-007",
    name: "Er. M. Gunasekar",
    email: "ad.survey.kanchi@tn.gov.in",
    phone: "044-25228025",
    badgeNo: "TN-SURV-2017-089",
    department: "Department of Survey and Land Records",
    role: "Survey Officer",
    jurisdiction: "Kanchipuram District (Taluks)",
    status: "Active",
    lastLogin: "Today, 08:45 AM",
    createdAt: "09 Jun 2024"
  },
  {
    id: "USR-TN-008",
    name: "Selvi P. Meenakshi",
    email: "helpdesk.sriperum@tn.gov.in",
    phone: "044-27168899",
    badgeNo: "TN-CSR-2023-911",
    department: "Public Citizen Facilitation",
    role: "Viewer",
    jurisdiction: "Sriperumbudur Citizen Counter",
    status: "Active",
    lastLogin: "13 Sep 2026, 11:00 AM",
    createdAt: "01 Jul 2024"
  },
  {
    id: "USR-TN-009",
    name: "Thiru S. Sundaravel",
    email: "tahsildar.tambaram@tn.gov.in",
    phone: "044-22265431",
    badgeNo: "TN-TAH-2019-214",
    department: "Revenue & Disaster Management Department",
    role: "Revenue Officer",
    jurisdiction: "Tambaram Taluk",
    status: "Deactivated",
    lastLogin: "10 Sep 2026, 05:20 PM",
    createdAt: "11 Aug 2024"
  },
  {
    id: "USR-TN-010",
    name: "Thiru K. Elango",
    email: "surveyor44.kanchi@tn.gov.in",
    phone: "044-25228029",
    badgeNo: "TN-SURV-2021-044",
    department: "Department of Survey and Land Records",
    role: "Survey Officer",
    jurisdiction: "Sriperumbudur Field Unit 04",
    status: "Active",
    lastLogin: "14 Sep 2026, 08:20 AM",
    createdAt: "19 Sep 2024"
  }
];

const DEPARTMENT_OPTIONS = [
  "Revenue & Disaster Management Department",
  "Department of Commercial Taxes and Registration (TNREGINET)",
  "Housing and Urban Development Department (DTCP / CMDA)",
  "Department of Survey and Land Records",
  "Information Technology & Digital Services (TNeGA)",
  "Commissionerate of Land Administration (CLA)",
  "Public Citizen Facilitation"
];

const ROLE_OPTIONS: UserRole[] = [
  "Administrator",
  "District Collector",
  "Revenue Officer",
  "Registration Officer",
  "Planning Officer",
  "Survey Officer",
  "Viewer"
];

export default function UserManagementPage() {
  const { officer } = useOfficerAuth();

  // STATE: USER LIST WITH LOCALSTORAGE PERSISTENCE
  const [users, setUsers] = useState<SystemUser[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("landstack_managed_users");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load users from localStorage", e);
      }
    }
    return DEFAULT_USERS;
  });

  // SAVE TO LOCALSTORAGE ON CHANGE
  useEffect(() => {
    try {
      localStorage.setItem("landstack_managed_users", JSON.stringify(users));
    } catch (e) {
      console.error("Failed to save users to localStorage", e);
    }
  }, [users]);

  // SEARCH AND FILTER STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // MODAL STATES
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [permissionsUser, setPermissionsUser] = useState<SystemUser | null>(null);
  const [deactivateConfirmUser, setDeactivateConfirmUser] = useState<SystemUser | null>(null);

  // NOTIFICATION BANNER
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setBannerMessage(msg);
    setTimeout(() => setBannerMessage(null), 3500);
  };

  // FORM STATE FOR ADD / EDIT USER
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    badgeNo: "",
    department: DEPARTMENT_OPTIONS[0],
    role: "Revenue Officer" as UserRole,
    jurisdiction: "",
    status: "Active" as "Active" | "Deactivated"
  });

  // INITIALIZE EDIT FORM
  const handleOpenEdit = (user: SystemUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      badgeNo: user.badgeNo,
      department: user.department,
      role: user.role,
      jurisdiction: user.jurisdiction,
      status: user.status
    });
  };

  // INITIALIZE ADD FORM
  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      badgeNo: `TN-OFF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      department: DEPARTMENT_OPTIONS[0],
      role: "Revenue Officer",
      jurisdiction: "Sriperumbudur Taluk",
      status: "Active"
    });
    setIsAddUserOpen(true);
  };

  // SAVE USER (ADD OR EDIT)
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Please provide the User's Full Name and Official Email address.");
      return;
    }

    if (editingUser) {
      // Update existing
      setUsers(prev =>
        prev.map(u =>
          u.id === editingUser.id
            ? {
                ...u,
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                badgeNo: formData.badgeNo.trim(),
                department: formData.department,
                role: formData.role,
                jurisdiction: formData.jurisdiction.trim(),
                status: formData.status
              }
            : u
        )
      );
      showBanner(`Officer profile for "${formData.name.trim()}" successfully updated.`);
      setEditingUser(null);
    } else {
      // Create new
      const newUser: SystemUser = {
        id: `USR-TN-${String(users.length + 1).padStart(3, "0")}`,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || "044-27237400",
        badgeNo: formData.badgeNo.trim() || `TN-NEW-${Date.now().toString().slice(-4)}`,
        department: formData.department,
        role: formData.role,
        jurisdiction: formData.jurisdiction.trim() || "Kanchipuram District",
        status: formData.status,
        lastLogin: "Never Logged In",
        createdAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      };
      setUsers(prev => [newUser, ...prev]);
      showBanner(`New user "${newUser.name}" successfully provisioned with role "${newUser.role}".`);
      setIsAddUserOpen(false);
    }
  };

  // TOGGLE DEACTIVATE / REACTIVATE USER
  const handleToggleDeactivate = (user: SystemUser) => {
    const newStatus = user.status === "Active" ? "Deactivated" : "Active";
    setUsers(prev =>
      prev.map(u => (u.id === user.id ? { ...u, status: newStatus } : u))
    );
    setDeactivateConfirmUser(null);
    showBanner(
      `Account for "${user.name}" has been ${newStatus === "Active" ? "reactivated" : "deactivated"}.`
    );
  };

  // RESET ALL FILTERS
  const handleResetFilters = () => {
    setSearchQuery("");
    setRoleFilter("ALL");
    setDepartmentFilter("ALL");
    setStatusFilter("ALL");
  };

  const isFiltered =
    searchQuery.trim() !== "" ||
    roleFilter !== "ALL" ||
    departmentFilter !== "ALL" ||
    statusFilter !== "ALL";

  // FILTERED USERS
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesBadge = u.badgeNo.toLowerCase().includes(q);
        const matchesJurisdiction = u.jurisdiction.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesBadge && !matchesJurisdiction) return false;
      }

      // Role Filter
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;

      // Department Filter
      if (departmentFilter !== "ALL" && u.department !== departmentFilter) return false;

      // Status Filter
      if (statusFilter !== "ALL" && u.status !== statusFilter) return false;

      return true;
    });
  }, [users, searchQuery, roleFilter, departmentFilter, statusFilter]);

  // EXPORT DIRECTORY AS CSV
  const handleExportCSV = () => {
    const headers = [
      "User ID",
      "User Name",
      "Department",
      "Role",
      "Jurisdiction",
      "Status",
      "Last Login",
      "Official Email",
      "Phone",
      "Badge No",
      "Created At"
    ];
    const rows = filteredUsers.map(u => [
      `"${u.id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.department.replace(/"/g, '""')}"`,
      `"${u.role}"`,
      `"${u.jurisdiction.replace(/"/g, '""')}"`,
      `"${u.status}"`,
      `"${u.lastLogin}"`,
      `"${u.email}"`,
      `"${u.phone}"`,
      `"${u.badgeNo}"`,
      `"${u.createdAt}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Tamil_Nadu_Land_Stack_User_Directory_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPI STATS
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(u => u.status === "Active").length;
  const deactivatedCount = users.filter(u => u.status === "Deactivated").length;

  return (
    <OfficerProtectedGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7 font-sans antialiased pb-24">
        
        {/* BANNER NOTIFICATION */}
        {bannerMessage && (
          <div className="p-3.5 rounded-lg bg-[#EDF7F2] border border-[#16845B]/30 text-[#16845B] text-xs font-semibold flex items-center justify-between shadow-xs transition-all animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0" />
              <span>{bannerMessage}</span>
            </div>
            <button
              onClick={() => setBannerMessage(null)}
              className="text-[#16845B] hover:opacity-75 p-1"
            >
              ✕
            </button>
          </div>
        )}

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
                <Users className="w-7 h-7 text-[#1D5FD1]" />
                <span>User Management</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F1F5FB] text-[#1D5FD1] border border-[#CCE0FD] uppercase">
                IAM & RBAC Control
              </span>
            </div>
            <p className="text-xs text-[#53627A] mt-1">
              Government Identity & Access Management (IAM) • Role-Based Access Control enforcing statutory jurisdiction, deed endorsements, cadastral surveys, and executive clearances across Tamil Nadu.
            </p>
          </div>

          {/* TOP ACTIONS */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-md bg-white hover:bg-[#F7F9FC] text-[#102A43] font-semibold text-xs border border-[#E3E8EF] transition-colors shadow-2xs flex items-center space-x-1.5"
              title="Download user directory as CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#53627A]" />
              <span>Export Directory</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-md bg-[#1D5FD1] hover:bg-[#154CB0] text-white font-semibold text-xs transition-colors shadow-xs flex items-center space-x-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* 4 SUMMARY KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-[#E3E8EF] shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#53627A] uppercase tracking-wider">Total Registered Users</span>
              <Users className="w-4 h-4 text-[#1D5FD1]" />
            </div>
            <div className="text-2xl font-bold text-[#102A43] font-mono">{totalUsersCount}</div>
            <span className="text-[11px] text-[#53627A]">Multi-departmental government directory</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E3E8EF] shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#53627A] uppercase tracking-wider">Active Authorized Officers</span>
              <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
            </div>
            <div className="text-2xl font-bold text-[#16845B] font-mono">{activeUsersCount} Active</div>
            <span className="text-[11px] text-[#16845B] font-medium flex items-center gap-1">
              <span>● Cryptographically Authenticated</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E3E8EF] shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#53627A] uppercase tracking-wider">Deactivated / Suspended</span>
              <UserX className="w-4 h-4 text-[#D9363E]" />
            </div>
            <div className="text-2xl font-bold text-[#102A43] font-mono">{deactivatedCount}</div>
            <span className="text-[11px] text-[#53627A]">Access revoked / transfer freeze</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E3E8EF] shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#53627A] uppercase tracking-wider">Configured Roles</span>
              <ShieldCheck className="w-4 h-4 text-[#E99A16]" />
            </div>
            <div className="text-2xl font-bold text-[#102A43] font-mono">7 Roles</div>
            <span className="text-[11px] text-[#53627A]">Enforced via OWASP & LADM Matrix</span>
          </div>
        </div>

        {/* SEARCH & FILTERS CONTROLS */}
        <div className="bg-white border border-[#E3E8EF] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-3">
            <span className="text-xs font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#1D5FD1]" />
              <span>User Directory Filters</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* SEARCH */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Search Users
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#53627A] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Name, email, badge, jurisdiction..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-2 bg-[#F8FAFD] border border-[#E3E8EF] rounded-md text-xs text-[#102A43] placeholder-[#53627A] focus:outline-none focus:border-[#1D5FD1]"
                />
              </div>
            </div>

            {/* FILTER: ROLE (7 ROLES) */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Filter by Role
              </label>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] font-semibold focus:border-[#1D5FD1] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Roles ({ROLE_OPTIONS.length})</option>
                {ROLE_OPTIONS.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* FILTER: DEPARTMENT */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Filter by Department
              </label>
              <select
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] font-semibold focus:border-[#1D5FD1] focus:outline-none cursor-pointer truncate"
              >
                <option value="ALL">All Departments</option>
                {DEPARTMENT_OPTIONS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* FILTER: STATUS */}
            <div>
              <label className="block text-[10px] font-bold text-[#53627A] uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-[#E3E8EF] rounded-md px-2.5 py-2 text-xs text-[#102A43] font-semibold focus:border-[#1D5FD1] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Deactivated">Deactivated</option>
              </select>
            </div>
          </div>
        </div>

        {/* USER MANAGEMENT TABLE */}
        <div className="bg-white border border-[#E3E8EF] rounded-xl shadow-xs overflow-hidden">
          
          <div className="p-4 bg-[#F8FAFD] border-b border-[#E3E8EF] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#53627A]">
                Showing <strong className="text-[#102A43]">{filteredUsers.length}</strong> government officers
              </span>
              {isFiltered && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF4FF] text-[#1D5FD1] border border-[#CCE0FD]">
                  Filtered
                </span>
              )}
            </div>

            <div className="text-xs text-[#53627A]">
              Role-Based Access Enforcement Enabled
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              {/* 7 REQUIRED COLUMNS: User Name, Department, Role, Jurisdiction, Status, Last Login, Actions */}
              <thead className="bg-[#F1F4F8] text-[#53627A] font-bold uppercase tracking-wider text-[10px] border-b border-[#E3E8EF]">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">User Name</th>
                  <th className="px-4 py-3 whitespace-nowrap">Department</th>
                  <th className="px-4 py-3 whitespace-nowrap">Role</th>
                  <th className="px-4 py-3 whitespace-nowrap">Jurisdiction</th>
                  <th className="px-4 py-3 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 whitespace-nowrap">Last Login</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E3E8EF] text-[#102A43]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-semibold text-[#53627A]">No officers found matching the filter criteria.</p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 text-xs text-[#1D5FD1] hover:underline font-semibold"
                      >
                        Reset filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const roleConfig = ROLE_DEFINITIONS[user.role] || ROLE_DEFINITIONS["Viewer"];
                    const isUserDeactivated = user.status === "Deactivated";

                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-[#F8FAFD] transition-colors ${
                          isUserDeactivated ? "bg-slate-50/60 opacity-80" : ""
                        }`}
                      >
                        {/* 1. USER NAME */}
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                              isUserDeactivated
                                ? "bg-slate-200 text-slate-600"
                                : "bg-[#102A43] text-white"
                            }`}>
                              {user.name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[#102A43] text-xs truncate max-w-[200px]" title={user.name}>
                                {user.name}
                              </div>
                              <div className="text-[11px] text-[#53627A] flex items-center gap-1 truncate max-w-[200px]" title={user.email}>
                                <Mail className="w-3 h-3 text-[#53627A] shrink-0" />
                                <span>{user.email}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                ID: {user.badgeNo}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. DEPARTMENT */}
                        <td className="px-4 py-3 max-w-[220px]">
                          <div className="flex items-start space-x-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#53627A] shrink-0 mt-0.5" />
                            <span className="text-[11px] font-medium text-[#102A43] leading-tight line-clamp-2" title={user.department}>
                              {user.department}
                            </span>
                          </div>
                        </td>

                        {/* 3. ROLE */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border ${roleConfig.badgeBg} ${roleConfig.badgeText} ${roleConfig.badgeBorder}`}>
                            <Shield className="w-3 h-3 mr-1" />
                            <span>{user.role}</span>
                          </span>
                        </td>

                        {/* 4. JURISDICTION */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-1 text-[11px] text-[#102A43] font-medium">
                            <MapPin className="w-3.5 h-3.5 text-[#E99A16] shrink-0" />
                            <span>{user.jurisdiction}</span>
                          </div>
                        </td>

                        {/* 5. STATUS */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            user.status === "Active"
                              ? "bg-[#EDF7F2] text-[#16845B] border border-[#16845B]/30"
                              : "bg-[#FDEDEE] text-[#D9363E] border border-[#D9363E]/30"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              user.status === "Active" ? "bg-[#16845B]" : "bg-[#D9363E]"
                            }`} />
                            <span>{user.status}</span>
                          </span>
                        </td>

                        {/* 6. LAST LOGIN */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-1 text-[11px] text-[#53627A]">
                            <Clock className="w-3.5 h-3.5 text-[#53627A] shrink-0" />
                            <span>{user.lastLogin}</span>
                          </div>
                        </td>

                        {/* 7. ACTIONS (Edit User, Deactivate User, View Permissions) */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="inline-flex items-center space-x-1.5">
                            {/* VIEW PERMISSIONS */}
                            <button
                              onClick={() => setPermissionsUser(user)}
                              className="px-2.5 py-1.5 rounded bg-[#F1F5FB] hover:bg-[#E2ECFA] text-[#1D5FD1] border border-[#CCE0FD] text-[11px] font-semibold transition-colors flex items-center space-x-1 shadow-2xs"
                              title="View role-based access permissions"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Permissions</span>
                            </button>

                            {/* EDIT USER */}
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="px-2.5 py-1.5 rounded bg-white hover:bg-[#F7F9FC] text-[#102A43] border border-[#E3E8EF] text-[11px] font-semibold transition-colors flex items-center space-x-1 shadow-2xs"
                              title="Edit user details"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#53627A]" />
                              <span className="hidden xl:inline">Edit</span>
                            </button>

                            {/* DEACTIVATE / REACTIVATE USER */}
                            <button
                              onClick={() => setDeactivateConfirmUser(user)}
                              className={`px-2.5 py-1.5 rounded border text-[11px] font-semibold transition-colors flex items-center space-x-1 shadow-2xs ${
                                user.status === "Active"
                                  ? "bg-white hover:bg-rose-50 text-[#D9363E] border-[#FADBD8]"
                                  : "bg-[#EDF7F2] hover:bg-[#D8F0E4] text-[#16845B] border-[#16845B]/30"
                              }`}
                              title={user.status === "Active" ? "Deactivate user account" : "Reactivate user account"}
                            >
                              {user.status === "Active" ? (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span className="hidden xl:inline">Deactivate</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span className="hidden xl:inline">Reactivate</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* ================================================================= */}
        {/* ADD / EDIT USER MODAL                                             */}
        {/* ================================================================= */}
        {(isAddUserOpen || editingUser) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-xl w-full border border-[#E3E8EF] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              
              {/* MODAL HEADER */}
              <div className="p-5 border-b border-[#E3E8EF] flex items-center justify-between bg-[#F8FAFD]">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-white border border-[#CCE0FD] text-[#1D5FD1]">
                    {editingUser ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#102A43]">
                      {editingUser ? "Edit Officer Profile" : "Provision New System User"}
                    </h3>
                    <p className="text-xs text-[#53627A]">
                      {editingUser ? `Updating credentials for ${editingUser.name}` : "Add an authorized revenue, planning, or registration official"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsAddUserOpen(false);
                    setEditingUser(null);
                  }}
                  className="text-[#53627A] hover:text-[#102A43] font-bold p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* FORM */}
              <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* FULL NAME */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#102A43]">
                      Officer Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Thiru K. Muthusamy, IAS"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F8FAFD] border border-[#E3E8EF] rounded-md text-[#102A43] focus:outline-none focus:border-[#1D5FD1] focus:bg-white"
                    />
                  </div>

                  {/* OFFICIAL EMAIL */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#102A43]">
                      Official Government Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. officer@tn.gov.in"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F8FAFD] border border-[#E3E8EF] rounded-md text-[#102A43] focus:outline-none focus:border-[#1D5FD1] focus:bg-white"
                    />
                  </div>

                  {/* PHONE NUMBER */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#102A43]">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 044-27237433"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F8FAFD] border border-[#E3E8EF] rounded-md text-[#102A43] focus:outline-none focus:border-[#1D5FD1] focus:bg-white"
                    />
                  </div>

                  {/* EMPLOYEE / BADGE ID */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#102A43]">
                      Employee / Badge ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TN-IAS-2012-042"
                      value={formData.badgeNo}
                      onChange={e => setFormData({ ...formData, badgeNo: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F8FAFD] border border-[#E3E8EF] rounded-md text-[#102A43] focus:outline-none focus:border-[#1D5FD1] focus:bg-white font-mono"
                    />
                  </div>

                  {/* ROLE (7 ROLES) */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#102A43]">
                      Designated Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                      className="w-full px-3 py-2 bg-[#F8FAFD] border border-[#E3E8EF] rounded-md text-[#102A43] font-semibold focus:outline-none focus:border-[#1D5FD1] focus:bg-white"
                    >
                      {ROLE_OPTIONS.map(r => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* STATUS */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#102A43]">
                      Account Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as "Active" | "Deactivated" })}
                      className="w-full px-3 py-2 bg-[#F8FAFD] border border-[#E3E8EF] rounded-md text-[#102A43] font-semibold focus:outline-none focus:border-[#1D5FD1] focus:bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Deactivated">Deactivated</option>
                    </select>
                  </div>

                </div>

                {/* DEPARTMENT */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#102A43]">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-[#E3E8EF] rounded-md text-[#102A43] font-medium focus:outline-none focus:border-[#1D5FD1] focus:bg-white"
                  >
                    {DEPARTMENT_OPTIONS.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* JURISDICTION */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#102A43]">
                    Administrative Jurisdiction *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kanchipuram District / Sriperumbudur Taluk / Statewide"
                    value={formData.jurisdiction}
                    onChange={e => setFormData({ ...formData, jurisdiction: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAFD] border border-[#E3E8EF] rounded-md text-[#102A43] focus:outline-none focus:border-[#1D5FD1] focus:bg-white"
                  />
                </div>

                {/* ROLE SUMMARY NOTICE */}
                <div className="p-3 rounded-lg bg-[#F1F5FB] border border-[#CCE0FD] text-[11px] text-[#102A43] space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-[#1D5FD1]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>RBAC Scope for {formData.role}:</span>
                  </div>
                  <p className="text-[#53627A]">
                    {ROLE_DEFINITIONS[formData.role]?.description || "Standard viewer access."}
                  </p>
                </div>

                {/* MODAL FOOTER */}
                <div className="pt-4 border-t border-[#E3E8EF] flex items-center justify-end space-x-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddUserOpen(false);
                      setEditingUser(null);
                    }}
                    className="px-4 py-2 rounded-md bg-white hover:bg-[#F7F9FC] text-[#53627A] font-semibold text-xs border border-[#E3E8EF] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-[#1D5FD1] hover:bg-[#154CB0] text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    {editingUser ? "Save Changes" : "Provision User"}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW PERMISSIONS MODAL                                            */}
        {/* ================================================================= */}
        {permissionsUser && (
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
                        Role Permissions: {permissionsUser.role}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ROLE_DEFINITIONS[permissionsUser.role]?.badgeBg} ${ROLE_DEFINITIONS[permissionsUser.role]?.badgeText} ${ROLE_DEFINITIONS[permissionsUser.role]?.badgeBorder}`}>
                        {permissionsUser.role}
                      </span>
                    </div>
                    <p className="text-xs text-[#53627A]">
                      Officer: <strong className="text-[#102A43]">{permissionsUser.name}</strong> • {permissionsUser.jurisdiction}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setPermissionsUser(null)}
                  className="text-[#53627A] hover:text-[#102A43] font-bold p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
                
                {/* ROLE MANDATE BANNER */}
                <div className="p-3.5 rounded-lg bg-[#F7F9FC] border border-[#E3E8EF] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#53627A] block">
                    Statutory Legal Mandate
                  </span>
                  <div className="font-bold text-xs text-[#102A43]">
                    {ROLE_DEFINITIONS[permissionsUser.role]?.tagline}
                  </div>
                  <p className="text-[11px] text-[#53627A] leading-relaxed">
                    {ROLE_DEFINITIONS[permissionsUser.role]?.description}
                  </p>
                </div>

                {/* DETAILED PERMISSION TABLE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
                      Module Access Breakdown
                    </span>
                    <span className="text-[11px] text-[#53627A]">
                      Application RBAC Policy Active
                    </span>
                  </div>

                  <div className="border border-[#E3E8EF] rounded-lg overflow-hidden divide-y divide-[#E3E8EF]">
                    {ROLE_DEFINITIONS[permissionsUser.role]?.permissions.map((perm, idx) => {
                      const isAuth = perm.level === "Authorized" || perm.level === "Statutory Approval";
                      const isReview = perm.level === "Review Only";
                      
                      return (
                        <div key={idx} className="p-3 hover:bg-[#F8FAFD] transition-colors flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-[10px] font-bold bg-[#EBF4FF] text-[#1D5FD1] px-1.5 py-0.5 rounded">
                                {perm.module}
                              </span>
                              <strong className="text-xs text-[#102A43]">{perm.action}</strong>
                            </div>
                            <p className="text-[11px] text-[#53627A] leading-tight">
                              {perm.description}
                            </p>
                          </div>

                          <div className="shrink-0">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              isAuth
                                ? "bg-[#EDF7F2] text-[#16845B] border border-[#16845B]/30"
                                : isReview
                                ? "bg-[#FEF5E7] text-[#E99A16] border border-[#E99A16]/30"
                                : "bg-[#FDEDEE] text-[#D9363E] border border-[#D9363E]/30"
                            }`}>
                              {perm.level}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* METADATA INFO */}
                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 flex items-start space-x-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Inter-Departmental Security Constraint:</span>
                    <span>
                      Modifications to land title, cadastral boundary vectors, or guideline valuations are validated through multi-signature cross-department consensus before committing to the immutable ledger.
                    </span>
                  </div>
                </div>

              </div>

              {/* MODAL FOOTER */}
              <div className="p-4 border-t border-[#E3E8EF] flex justify-end bg-[#F8FAFD]">
                <button
                  onClick={() => setPermissionsUser(null)}
                  className="px-4 py-2 rounded-md bg-[#102A43] hover:bg-[#102A43]/90 text-white font-semibold text-xs transition-colors"
                >
                  Close Permissions View
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* DEACTIVATE / REACTIVATE CONFIRMATION MODAL                        */}
        {/* ================================================================= */}
        {deactivateConfirmUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full border border-[#E3E8EF] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-full shrink-0 ${
                  deactivateConfirmUser.status === "Active"
                    ? "bg-red-50 text-[#D9363E] border border-red-200"
                    : "bg-emerald-50 text-[#16845B] border border-emerald-200"
                }`}>
                  {deactivateConfirmUser.status === "Active" ? <UserX className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#102A43]">
                    {deactivateConfirmUser.status === "Active" ? "Deactivate User Account?" : "Reactivate User Account?"}
                  </h3>
                  <p className="text-xs text-[#53627A]">
                    {deactivateConfirmUser.name} ({deactivateConfirmUser.role})
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#53627A] leading-relaxed">
                {deactivateConfirmUser.status === "Active" ? (
                  <>
                    Deactivating this account will immediately revoke access to all statutory revenue workflows, SRO endorsements, and GIS inspection tools in <strong>{deactivateConfirmUser.jurisdiction}</strong>.
                  </>
                ) : (
                  <>
                    Reactivating will restore full statutory operational privileges under the <strong>{deactivateConfirmUser.role}</strong> role.
                  </>
                )}
              </p>

              <div className="pt-2 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setDeactivateConfirmUser(null)}
                  className="px-4 py-2 rounded-md bg-white hover:bg-[#F7F9FC] text-[#53627A] font-semibold text-xs border border-[#E3E8EF] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleDeactivate(deactivateConfirmUser)}
                  className={`px-4 py-2 rounded-md font-semibold text-xs text-white shadow-xs transition-colors ${
                    deactivateConfirmUser.status === "Active"
                      ? "bg-[#D9363E] hover:bg-red-700"
                      : "bg-[#16845B] hover:bg-emerald-700"
                  }`}
                >
                  {deactivateConfirmUser.status === "Active" ? "Confirm Deactivation" : "Confirm Reactivation"}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </OfficerProtectedGuard>
  );
}

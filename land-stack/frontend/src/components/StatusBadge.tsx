"use client";

import React from "react";

export type LandCaseStatus =
  | "OFFICER_REVIEW"
  | "FIELD_INSPECTION"
  | "DOCUMENT_VERIFICATION"
  | "APPROVED"
  | "REJECTED"
  | string;

export interface StatusBadgeProps {
  status: LandCaseStatus;
  className?: string;
  showDot?: boolean;
}

interface StatusConfig {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotClass: string;
}

export const STATUS_CONFIGS: Record<string, StatusConfig> = {
  OFFICER_REVIEW: {
    label: "OFFICER REVIEW",
    bgClass: "bg-[#EFF6FF]",
    textClass: "text-[#1E40AF] font-bold",
    borderClass: "border-[#BFDBFE]",
    dotClass: "bg-[#1D5FD1]"
  },
  FIELD_INSPECTION: {
    label: "FIELD INSPECTION",
    bgClass: "bg-[#FFF7ED]",
    textClass: "text-[#9A3412] font-bold",
    borderClass: "border-[#FED7AA]",
    dotClass: "bg-[#C05621]"
  },
  DOCUMENT_VERIFICATION: {
    label: "DOCUMENT VERIFICATION",
    bgClass: "bg-[#FAF5FF]",
    textClass: "text-[#6B21A8] font-bold",
    borderClass: "border-[#E9D5FF]",
    dotClass: "bg-[#7E22CE]"
  },
  APPROVED: {
    label: "APPROVED",
    bgClass: "bg-[#F0FDF4]",
    textClass: "text-[#166534] font-bold",
    borderClass: "border-[#BBF7D0]",
    dotClass: "bg-[#15803D]"
  },
  REJECTED: {
    label: "REJECTED",
    bgClass: "bg-[#FEF2F2]",
    textClass: "text-[#991B1B] font-bold",
    borderClass: "border-[#FECDD3]",
    dotClass: "bg-[#DC2626]"
  }
};

/**
 * Normalizes input status string into one of the 5 canonical statuses.
 */
export function normalizeStatus(status?: string): string {
  if (!status) return "OFFICER_REVIEW";
  const clean = status.trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (clean.includes("OFFICER") || clean.includes("REVIEW") || clean === "PENDING") {
    return "OFFICER_REVIEW";
  }
  if (clean.includes("INSPECTION") || clean.includes("FIELD")) {
    return "FIELD_INSPECTION";
  }
  if (clean.includes("VERIF") || clean.includes("DOC")) {
    return "DOCUMENT_VERIFICATION";
  }
  if (clean.includes("APPROV") || clean.includes("CLEAR") || clean === "COMPLETED") {
    return "APPROVED";
  }
  if (clean.includes("REJECT") || clean.includes("DISMISS")) {
    return "REJECTED";
  }
  return clean in STATUS_CONFIGS ? clean : "OFFICER_REVIEW";
}

/**
 * Reusable Professional Government Status Badge
 * Styles:
 * - OFFICER REVIEW: Light blue background, Blue text
 * - FIELD INSPECTION: Light orange background, Orange text
 * - DOCUMENT VERIFICATION: Light purple background, Purple text
 * - APPROVED: Light green background, Green text
 * - REJECTED: Light red background, Red text
 */
export default function StatusBadge({ status, className = "", showDot = false }: StatusBadgeProps) {
  const normalizedKey = normalizeStatus(status);
  const config = STATUS_CONFIGS[normalizedKey] || {
    label: (status || "UNKNOWN").replace(/_/g, " ").toUpperCase(),
    bgClass: "bg-[#F1F5F9]",
    textClass: "text-[#475569]",
    borderClass: "border-[#CBD5E1]",
    dotClass: "bg-[#64748B]"
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider border whitespace-nowrap leading-none transition-colors ${config.bgClass} ${config.textClass} ${config.borderClass} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`} />}
      <span>{config.label}</span>
    </span>
  );
}

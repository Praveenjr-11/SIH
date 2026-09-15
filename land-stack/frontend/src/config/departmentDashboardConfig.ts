/**
 * departmentDashboardConfig.ts
 * 
 * Frontend Department-Specific Dashboard Configuration & Actions.
 * Defines the exact fields, actions, and GIS overlay requirements per department.
 */

export type DepartmentCode = 
  | 'REVENUE'
  | 'REGISTRATION'
  | 'TOWN_PLANNING'
  | 'FOREST_ENVIRONMENT'
  | 'WATER_RESOURCES'
  | 'MUNICIPAL_PANCAYAT';

export interface DepartmentDashboardProfile {
  departmentCode: DepartmentCode;
  departmentName: string;
  subUnits: string[];
  officerRoles: string[];
  badgeColor: string;
  iconName: string;
  gisOverlayFilter?: {
    requiredIntersection?: 'forest' | 'water_bodies' | 'none';
    description: string;
  };
  allowedActions: { actionCode: string; label: string; style: string }[];
}

export const DEPARTMENT_PROFILES: Record<DepartmentCode, DepartmentDashboardProfile> = {
  REVENUE: {
    departmentCode: 'REVENUE',
    departmentName: 'Revenue & Disaster Management Department (CLA / CSS / CRA)',
    subUnits: [
      'Commissionerate of Land Administration (CLA)',
      'Commissionerate of Survey and Settlement (CSS)',
      'Commissionerate of Revenue Administration (CRA)'
    ],
    officerRoles: ['DISTRICT_COLLECTOR', 'DRO', 'RDO', 'TAHSILDAR', 'VAO', 'SURVEY_OFFICER'],
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    iconName: 'Landmark',
    gisOverlayFilter: {
      requiredIntersection: 'none',
      description: 'Owns base land record. Sees all jurisdiction cases in assigned Taluk/Village.'
    },
    allowedActions: [
      { actionCode: 'VERIFY_ROR_PATTA', label: 'Verify RoR & Patta Record', style: 'bg-emerald-600 hover:bg-emerald-500' },
      { actionCode: 'TRANSITION_FIELD_SURVEYED', label: 'Advance State (FIELD_SURVEYED)', style: 'bg-blue-600 hover:bg-blue-500' },
      { actionCode: 'APPROVE_FINAL_COLLECTOR_NOC', label: 'Issue Final Collector Clearance Order', style: 'bg-indigo-600 hover:bg-indigo-500' }
    ]
  },

  REGISTRATION: {
    departmentCode: 'REGISTRATION',
    departmentName: 'Department of Commercial Taxes & Registration (TNREGINET / IGR)',
    subUnits: [
      'Inspector General of Registration (IGR)',
      'District Registrar Office',
      'Sub-Registrar Office (SRO)'
    ],
    officerRoles: ['SUB_REGISTRAR', 'DISTRICT_REGISTRAR'],
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-300',
    iconName: 'Receipt',
    gisOverlayFilter: {
      requiredIntersection: 'none',
      description: 'Encumbrance Certificate (EC) 13-Yr ledger check & stamp duty valuation.'
    },
    allowedActions: [
      { actionCode: 'APPROVE_ENCUMBRANCE_CLEARANCE', label: 'Approve Encumbrance (Clean 13-Yr Ledger)', style: 'bg-purple-600 hover:bg-purple-500' },
      { actionCode: 'FLAG_MORTGAGE_LIEN_DISPUTE', label: 'Flag Active Encumbrance / Lien', style: 'bg-red-600 hover:bg-red-500' }
    ]
  },

  TOWN_PLANNING: {
    departmentCode: 'TOWN_PLANNING',
    departmentName: 'Housing and Urban Development Department (DTCP / CMDA)',
    subUnits: [
      'Directorate of Town & Country Planning (DTCP)',
      'Chennai Metropolitan Development Authority (CMDA)'
    ],
    officerRoles: ['DTCP_PLANNING_OFFICER', 'CMDA_PLANNING_OFFICER', 'TOWN_PLANNER'],
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-300',
    iconName: 'Building2',
    gisOverlayFilter: {
      requiredIntersection: 'none',
      description: 'Master Plan land use zoning, FSI limit, building height & setback compliance.'
    },
    allowedActions: [
      { actionCode: 'APPROVE_ZONING_COMPLIANCE', label: 'Approve Zoning & FSI Clearance', style: 'bg-blue-600 hover:bg-blue-500' },
      { actionCode: 'REJECT_ZONING_NONCOMPLIANT', label: 'Reject Zone Violation', style: 'bg-red-600 hover:bg-red-500' }
    ]
  },

  FOREST_ENVIRONMENT: {
    departmentCode: 'FOREST_ENVIRONMENT',
    departmentName: 'Environment, Climate Change & Forests Dept (Forest & TNPCB)',
    subUnits: [
      'Tamil Nadu Forest Department',
      'Tamil Nadu Pollution Control Board (TNPCB)'
    ],
    officerRoles: ['FOREST_RANGE_OFFICER', 'CONSERVATOR_OF_FORESTS', 'TNPCB_OFFICER'],
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
    iconName: 'Trees',
    gisOverlayFilter: {
      requiredIntersection: 'forest',
      description: 'STRICT GIS FILTER: Only receives cases with GIS forest boundary intersection.'
    },
    allowedActions: [
      { actionCode: 'APPROVE_FOREST_CLEARANCE', label: 'Approve Forest Boundary Clearance', style: 'bg-amber-600 hover:bg-amber-500' },
      { actionCode: 'REJECT_FOREST_ENCROACHMENT', label: 'Reject Forest Encroachment', style: 'bg-red-600 hover:bg-red-500' }
    ]
  },

  WATER_RESOURCES: {
    departmentCode: 'WATER_RESOURCES',
    departmentName: 'Water Resources Department (PWD-WRD)',
    subUnits: [
      'Water Resources Organisation (WRO)',
      'Basin Division Executive Engineer'
    ],
    officerRoles: ['WRD_EXECUTIVE_ENGINEER', 'WRD_ASSISTANT_ENGINEER'],
    badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-300',
    iconName: 'Waves',
    gisOverlayFilter: {
      requiredIntersection: 'water_bodies',
      description: 'STRICT GIS FILTER: Only receives cases with GIS water_bodies intersection.'
    },
    allowedActions: [
      { actionCode: 'APPROVE_WATER_BUFFER_COMPLIANCE', label: 'Approve Buffer Compliance', style: 'bg-cyan-600 hover:bg-cyan-500' },
      { actionCode: 'REJECT_WATER_ENCROACHMENT', label: 'Reject Waterbody Encroachment', style: 'bg-red-600 hover:bg-red-500' }
    ]
  },

  MUNICIPAL_PANCAYAT: {
    departmentCode: 'MUNICIPAL_PANCAYAT',
    departmentName: 'MAWS (Urban Local Bodies) / Rural Development & Panchayat Raj',
    subUnits: [
      'Municipal Corporations / Municipalities (MAWS)',
      'Panchayat Unions / Village Panchayats (TNRD)'
    ],
    officerRoles: ['MUNICIPAL_COMMISSIONER', 'MUNICIPAL_REVENUE_OFFICER', 'BLOCK_DEVELOPMENT_OFFICER', 'PANCHAYAT_SECRETARY'],
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-300',
    iconName: 'Landmark',
    gisOverlayFilter: {
      requiredIntersection: 'none',
      description: 'Property tax payment status & local body building permit.'
    },
    allowedActions: [
      { actionCode: 'CONFIRM_PROPERTY_TAX_CLEARANCE', label: 'Confirm Tax Clearance', style: 'bg-teal-600 hover:bg-teal-500' },
      { actionCode: 'APPROVE_LOCAL_BUILDING_PERMIT', label: 'Approve Local Permit', style: 'bg-blue-600 hover:bg-blue-500' }
    ]
  }
};

export function resolveDepartmentProfile(roleOrDept?: string): DepartmentDashboardProfile {
  if (!roleOrDept) return DEPARTMENT_PROFILES.REVENUE;
  const norm = roleOrDept.toUpperCase();
  if (DEPARTMENT_PROFILES[norm as DepartmentCode]) {
    return DEPARTMENT_PROFILES[norm as DepartmentCode];
  }
  for (const p of Object.values(DEPARTMENT_PROFILES)) {
    if (p.officerRoles.includes(norm)) return p;
  }
  return DEPARTMENT_PROFILES.REVENUE;
}

/**
 * departmentDashboardConfig.ts
 * 
 * Department-Specific Dashboard Configurations & Filtering Rules for Tamil Nadu Land Stack.
 * 
 * Maps officer roles/departments to specific data views, GIS overlay filter rules,
 * permitted workflow actions, and department review schemas.
 */

export type DepartmentCode = 
  | 'REVENUE'
  | 'REGISTRATION'
  | 'TOWN_PLANNING'
  | 'FOREST_ENVIRONMENT'
  | 'WATER_RESOURCES'
  | 'MUNICIPAL_PANCAYAT';

export interface DepartmentActionDefinition {
  actionCode: string;
  label: string;
  targetReviewDept: DepartmentCode;
  requiresNotes?: boolean;
}

export interface DepartmentDashboardProfile {
  departmentCode: DepartmentCode;
  departmentName: string;
  subUnits: string[];
  officerRoles: string[];
  visibleDataFields: string[];
  gisOverlayFilter?: {
    requiredIntersection?: 'forest' | 'water_bodies' | 'none';
    description: string;
  };
  allowedActions: DepartmentActionDefinition[];
  stateMachineTransitions?: string[];
}

export const DEPARTMENT_DASHBOARD_CONFIGS: Record<DepartmentCode, DepartmentDashboardProfile> = {
  REVENUE: {
    departmentCode: 'REVENUE',
    departmentName: 'Revenue & Disaster Management Department',
    subUnits: [
      'Commissionerate of Land Administration (CLA)',
      'Commissionerate of Survey and Settlement (CSS)',
      'Commissionerate of Land Reforms',
      'Directorate of Urban Land Ceiling & Tax',
      'Commissionerate of Revenue Administration (CRA)'
    ],
    officerRoles: ['DISTRICT_COLLECTOR', 'DRO', 'RDO', 'TAHSILDAR', 'VAO', 'SURVEY_OFFICER'],
    visibleDataFields: [
      'rorRecord',
      'pattaNumber',
      'chittaExtract',
      'landClassification',
      'fmbSketchReference',
      'ulpin',
      'surveyNumber',
      'jurisdictionTaluk'
    ],
    gisOverlayFilter: {
      requiredIntersection: 'none',
      description: 'Owns base land record. Sees all jurisdiction cases in assigned Taluk/Village.'
    },
    allowedActions: [
      { actionCode: 'VERIFY_ROR_PATTA', label: 'Verify RoR & Patta Record', targetReviewDept: 'REVENUE' },
      { actionCode: 'ENDORSE_FMB_BOUNDARY', label: 'Endorse FMB Boundary Demarcation', targetReviewDept: 'REVENUE' },
      { actionCode: 'TRANSITION_VERIFICATION_STATE', label: 'Advance State Machine (FIELD_SURVEYED)', targetReviewDept: 'REVENUE' },
      { actionCode: 'APPROVE_FINAL_COLLECTOR_NOC', label: 'Issue Final Collector Clearance Order', targetReviewDept: 'REVENUE', requiresNotes: true }
    ],
    stateMachineTransitions: ['UNVERIFIED', 'FIELD_SURVEYED', 'REGISTRAR_ENDORSED', 'IMMUTABLE']
  },

  REGISTRATION: {
    departmentCode: 'REGISTRATION',
    departmentName: 'Department of Commercial Taxes and Registration (TNREGINET)',
    subUnits: [
      'Inspector General of Registration (IGR)',
      'District Registrar Office',
      'Sub-Registrar Office (SRO)'
    ],
    officerRoles: ['SUB_REGISTRAR', 'DISTRICT_REGISTRAR'],
    visibleDataFields: [
      'encumbranceCertificateStatus',
      'ec13YearLedger',
      'mortgageCourtLienDetails',
      'tnreginetGuidelineValue',
      'stampDutyAssessment',
      'pendingRegistrationDocNo'
    ],
    gisOverlayFilter: {
      requiredIntersection: 'none',
      description: 'Filters cases in GOVERNMENT_DATA_VERIFICATION status requiring title encumbrance audit.'
    },
    allowedActions: [
      { actionCode: 'APPROVE_ENCUMBRANCE_CLEARANCE', label: 'Approve Encumbrance Clearance (Clean 13-Yr Ledger)', targetReviewDept: 'REGISTRATION' },
      { actionCode: 'FLAG_MORTGAGE_LIEN_DISPUTE', label: 'Flag Active Encumbrance / Court Lien', targetReviewDept: 'REGISTRATION', requiresNotes: true },
      { actionCode: 'VERIFY_STAMP_DUTY', label: 'Endorse TN Reginet Guideline Valuation', targetReviewDept: 'REGISTRATION' }
    ]
  },

  TOWN_PLANNING: {
    departmentCode: 'TOWN_PLANNING',
    departmentName: 'Housing and Urban Development Department (DTCP / CMDA)',
    subUnits: [
      'Directorate of Town and Country Planning (DTCP)',
      'Chennai Metropolitan Development Authority (CMDA)',
      'Local Planning Authorities'
    ],
    officerRoles: ['DTCP_PLANNING_OFFICER', 'CMDA_PLANNING_OFFICER', 'TOWN_PLANNER'],
    visibleDataFields: [
      'masterPlanZoneCategory',
      'maxPermissibleFSI',
      'maxBuildingHeightMeters',
      'setbackRequirements',
      'proposedLandUseApplication'
    ],
    gisOverlayFilter: {
      requiredIntersection: 'none',
      description: 'Sees land conversion and zoning compliance clearance requests.'
    },
    allowedActions: [
      { actionCode: 'APPROVE_ZONING_COMPLIANCE', label: 'Approve Master Plan Zoning Clearance', targetReviewDept: 'TOWN_PLANNING' },
      { actionCode: 'CONDITIONAL_ZONING_APPROVAL', label: 'Issue Conditional Approval (FSI/Height Restrained)', targetReviewDept: 'TOWN_PLANNING', requiresNotes: true },
      { actionCode: 'REJECT_ZONING_NONCOMPLIANT', label: 'Reject (Master Plan Zone Violation)', targetReviewDept: 'TOWN_PLANNING', requiresNotes: true }
    ]
  },

  FOREST_ENVIRONMENT: {
    departmentCode: 'FOREST_ENVIRONMENT',
    departmentName: 'Environment, Climate Change and Forests Department',
    subUnits: [
      'Tamil Nadu Forest Department',
      'Tamil Nadu Pollution Control Board (TNPCB)',
      'State Environment Impact Assessment Authority (SEIAA)'
    ],
    officerRoles: ['FOREST_RANGE_OFFICER', 'CONSERVATOR_OF_FORESTS', 'TNPCB_OFFICER'],
    visibleDataFields: [
      'forestOverlayIntersection',
      'forestDistanceMeters',
      'forestRightsActTenureStatus',
      'satelliteChangeDetectionFlags',
      'tnpcbAirWaterConsentStatus'
    ],
    gisOverlayFilter: {
      requiredIntersection: 'forest',
      description: 'STRICT FILTER: Only receives cases where GIS overlay detects forest boundary intersection.'
    },
    allowedActions: [
      { actionCode: 'APPROVE_FOREST_CLEARANCE', label: 'Approve Forest Boundary Clearance', targetReviewDept: 'FOREST_ENVIRONMENT' },
      { actionCode: 'REJECT_FOREST_ENCROACHMENT', label: 'Reject (Inside Forest Reserve / FRA Encroachment)', targetReviewDept: 'FOREST_ENVIRONMENT', requiresNotes: true },
      { actionCode: 'ISSUE_TNPCB_NOC', label: 'Issue Environmental Pollution NOC (Air/Water Consent)', targetReviewDept: 'FOREST_ENVIRONMENT' }
    ]
  },

  WATER_RESOURCES: {
    departmentCode: 'WATER_RESOURCES',
    departmentName: 'Water Resources Department (PWD-WRD)',
    subUnits: [
      'Water Resources Organisation (WRO)',
      'Basin Division Executive Engineer',
      'Irrigation Tank & Channel Wing'
    ],
    officerRoles: ['WRD_EXECUTIVE_ENGINEER', 'WRD_ASSISTANT_ENGINEER'],
    visibleDataFields: [
      'waterBodyOverlayIntersection',
      'enforcedBufferZoneMeters',
      'irrigationChannelEasementData',
      'monsoonalFloodInundationIndex'
    ],
    gisOverlayFilter: {
      requiredIntersection: 'water_bodies',
      description: 'STRICT FILTER: Only receives cases where GIS overlay flags water_bodies intersection.'
    },
    allowedActions: [
      { actionCode: 'APPROVE_WATER_BUFFER_COMPLIANCE', label: 'Approve (Outside Prescribed Buffer Zone)', targetReviewDept: 'WATER_RESOURCES' },
      { actionCode: 'REJECT_WATER_ENCROACHMENT', label: 'Reject (Inside Waterbody Catchment / Buffer Zone)', targetReviewDept: 'WATER_RESOURCES', requiresNotes: true }
    ]
  },

  MUNICIPAL_PANCAYAT: {
    departmentCode: 'MUNICIPAL_PANCAYAT',
    departmentName: 'Municipal Administration & Water Supply (Urban) / Rural Development (Rural)',
    subUnits: [
      'Municipal Corporations / Municipalities / Town Panchayats (MAWS)',
      'Panchayat Unions / Village Panchayats (TNRD)'
    ],
    officerRoles: ['MUNICIPAL_COMMISSIONER', 'MUNICIPAL_REVENUE_OFFICER', 'BLOCK_DEVELOPMENT_OFFICER', 'PANCHAYAT_SECRETARY'],
    visibleDataFields: [
      'propertyTaxAssessmentLedger',
      'localBodyBuildingPermissionApp',
      'tnebElectricityConnectionStatus',
      'waterSewerageUtilityStatus',
      'ulbOrPanchayatClassification'
    ],
    gisOverlayFilter: {
      requiredIntersection: 'none',
      description: 'Routed based on village administrative classification (Urban Local Body vs Rural Panchayat).'
    },
    allowedActions: [
      { actionCode: 'CONFIRM_PROPERTY_TAX_CLEARANCE', label: 'Confirm Property Tax Ledger Status', targetReviewDept: 'MUNICIPAL_PANCAYAT' },
      { actionCode: 'APPROVE_LOCAL_BUILDING_PERMIT', label: 'Approve Local Body Building Permit', targetReviewDept: 'MUNICIPAL_PANCAYAT' },
      { actionCode: 'REJECT_LOCAL_PERMIT', label: 'Reject Local Body Application', targetReviewDept: 'MUNICIPAL_PANCAYAT', requiresNotes: true }
    ]
  }
};

/**
 * Utility function to get department dashboard config for a given officer role or department code
 */
export function getDepartmentConfig(deptCodeOrRole: string): DepartmentDashboardProfile {
  const norm = deptCodeOrRole.toUpperCase();

  // Try direct code match
  if (DEPARTMENT_DASHBOARD_CONFIGS[norm as DepartmentCode]) {
    return DEPARTMENT_DASHBOARD_CONFIGS[norm as DepartmentCode];
  }

  // Search by officer role
  for (const config of Object.values(DEPARTMENT_DASHBOARD_CONFIGS)) {
    if (config.officerRoles.includes(norm)) {
      return config;
    }
  }

  // Fallback to REVENUE
  return DEPARTMENT_DASHBOARD_CONFIGS.REVENUE;
}

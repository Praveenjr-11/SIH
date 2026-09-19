export interface LatLng {
  lat: number;
  lng: number;
}

export interface ZoningDetails {
  masterPlanAuthority: string;
  zoneCategory: string;
  permissibleFSI: string;
  maxHeightMeters: number;
  setbacks: string;
}

export interface PropertyTaxDetails {
  taxAssessmentId: string;
  taxStatus: 'Paid' | 'Pending' | 'Exempt';
  annualTaxAmount: string;
  guidelineValueSqFt: string;
  totalValuation: string;
  wardNo: string;
}

export interface CourtCaseDetails {
  status: 'Clear Title' | 'Active Litigation' | 'Stay Order Issued';
  caseId?: string;
  courtName?: string;
  caseType?: string;
  stayOrderDetails?: string;
  hearingDate?: string;
}

export interface Parcel {
  id: string;
  ulpin: string;
  surveyNumber: string;
  village: string;
  taluk: string;
  district: string;
  state: string;
  areaAcres: number;
  areaSqMeters: number;
  landClassification: 'Nanjai (Wet)' | 'Punjai (Dry)' | 'Industrial SIPCOT' | 'Commercial' | 'Waterbody Reserve' | 'Government Poramboke';
  currentUse: string;
  ownerName: string;
  ownerAadhaarHash: string;
  registrationDocNo: string;
  registrationDate: string;
  encumbranceStatus: 'Clear' | 'Mortgaged' | 'Disputed' | 'Government Encroachment Watch';
  verificationStatus: 'UNVERIFIED' | 'FIELD_SURVEYED' | 'REGISTRAR_ENDORSED' | 'IMMUTABLE' | 'Verified' | 'Pending' | 'Disputed' | string;
  disputeReason?: string;
  coordinates: [number, number][][];
  center: [number, number];

  zoningDetails?: ZoningDetails;
  propertyTaxDetails?: PropertyTaxDetails;
  courtCaseDetails?: CourtCaseDetails;
  
  gsiGeology: {
    rockFormation: string;
    lithology: string;
    geomorphologyUnit: string;
    soilBearingCapacityKPa: number;
    landslideRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
    seismicZone: 'Zone II' | 'Zone III' | 'Zone IV' | 'Zone V';
    floodHazardIndex: 'Low' | 'Moderate' | 'High';
    groundwaterDepthMeters: number;
    gsiReportId: string;
    lastSurveyYear: number;
  };

  digitalFacets: {
    ulpinCadastralId: string;
    rorOwnership: string;
    encumbranceCertificate: string;
    registrationHistory: string;
    taxAssessment: string;
    soilAndAgriculture: string;
    gisSpatialPolygon: string;
    gsiGeoscientificRisk: string;
    isroSatelliteLandUse: string;
    utilityInfrastructure: string;
    courtCaseStatus?: string;
    zoningMasterPlan?: string;
  };
}

export interface GSILayer {
  id: string;
  layerName: string;
  category: 'Geology' | 'Geomorphology' | 'Geohazard' | 'Mineral/Groundwater';
  provider: 'Geological Survey of India (GSI)';
  disclaimer: string;
  datasetVersion: string;
  features: {
    id: string;
    name: string;
    hazardScore: number;
    description: string;
    recommendedAction: string;
    coordinates: [number, number][][];
  }[];
}

export interface LandMutation {
  id: string;
  applicationId: string;
  ulpin: string;
  surveyNumber: string;
  buyerName: string;
  sellerName: string;
  mutationType: 'Sale Transfer' | 'Inheritance' | 'Subdivision' | 'Partition';
  status: 'Applied' | 'Spatial Verification' | 'Public Objection Notice' | 'Approved' | 'Rejected';
  appliedDate: string;
  updatedDate: string;
  spatialAuditStatus: 'Passed' | 'Overlapping Boundary Warning' | 'Pending Field Verification';
  gsiClearance: 'Cleared' | 'Geohazard Advisory Issued';
  remarks: string;
}

export interface DistrictGovernanceAnalytics {
  district: string;
  casesCount: number;
  parcelsCount: number;
  totalAreaAcres: number;
  totalValuationCrores: number;
  highRiskCases: number;
}

export interface LandAnalytics {
  totalParcels: number;
  verifiedParcels: number;
  disputedParcels: number;
  pendingMutations: number;
  totalAreaAcres: number;
  totalValuationCrores?: number;
  avgGuidelineRatePerSqFt?: number;
  zoneDistribution: { zone: string; count: number; area: number; percentage?: number; description?: string }[];
  gsiHazardRiskBreakdown: { level: string; count: number; description?: string; criteria?: string }[];
  districtDistribution?: DistrictGovernanceAnalytics[];
  recentMutationsCount: number;
  provenanceMetadata?: {
    administrativeBoundaries: string;
    reginetGuidelineRates: string;
    geologicalLayers: string;
    litigantNames: string;
  };
  transactionTrends?: { month: string; deedsCount: number; valuationCrores: number; avgRate: number }[];
  statutoryApplications?: { type: string; received: number; approved: number; pending: number; rejected: number }[];
  caseStatusBreakdown?: { status: string; label: string; count: number; percentage: number; color: string }[];
}

export type CaseStatus = 
  | 'NEW' | 'CASE_CREATED' | 'PARCEL_IDENTIFIED'
  | 'REVENUE_VERIFICATION' | 'SURVEY_VERIFICATION' | 'REGISTRATION_VERIFICATION'
  | 'GOVERNMENT_LAND_CHECK' | 'PLANNING_AND_CONSTRAINT_CHECK' | 'FIELD_INSPECTION'
  | 'CONSOLIDATED_REVIEW' | 'OFFICER_RECOMMENDATION' | 'CLARIFICATION_REQUIRED'
  | 'APPROVED' | 'REJECTED' | 'CLOSED';

export type DepartmentVerificationStatus = 
  | 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'CONFLICT_FOUND' | 'DOCUMENT_REQUIRED' 
  | 'FIELD_INSPECTION_REQUIRED' | 'SOURCE_UNAVAILABLE' | 'ACCESS_RESTRICTED' 
  | 'NOT_APPLICABLE' | 'REJECTED';

export interface VerificationFinding {
  field: string;
  status: 'MATCHED' | 'CONFLICT' | 'UNVERIFIED';
  source: string;
  message?: string;
}

export interface VerificationResult {
  id?: number;
  caseId: string | number;
  department: string;
  verificationStatus: DepartmentVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  findings?: VerificationFinding[];
  evidenceIds?: string[];
  remarks?: string;
  requiresFurtherReview?: boolean;
}

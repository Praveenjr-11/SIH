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
  verificationStatus: 'Verified' | 'Pending' | 'Disputed';
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

export interface LandAnalytics {
  totalParcels: number;
  verifiedParcels: number;
  disputedParcels: number;
  pendingMutations: number;
  totalAreaAcres: number;
  zoneDistribution: { zone: string; count: number; area: number }[];
  gsiHazardRiskBreakdown: { level: string; count: number }[];
  recentMutationsCount: number;
}

export interface AdminBoundary {
  id: string;
  name: string;
  level: 'State' | 'District' | 'Taluk';
  stateName: string;
  center: [number, number];
  bounds: [[number, number], [number, number]];
  coordinates: [number, number][][];
}

export interface GisLayerItem {
  id: string;
  name: string;
  category: 'GSI Geology' | 'Geohazard' | 'Soil' | 'LULC Satellite' | 'Waterbodies' | 'Elevation';
  provider: string;
  color: string;
  description: string;
}

export interface LocationAnalysisResult {
  location: {
    lat: number;
    lng: number;
    formattedAddress: string;
    state: string;
    district: string;
    taluk: string;
  };
  gsiGeology: {
    rockFormation: string;
    lithology: string;
    geomorphologyUnit: string;
    soilBearingCapacityKPa: number;
    landslideRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
    seismicZone: string;
    gsiReportId: string;
  };
  risks: {
    floodRisk: 'Low' | 'Moderate' | 'High';
    landslideRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
    droughtRisk: 'Low' | 'Moderate' | 'High';
    environmentalSensitivity: 'Low' | 'Moderate' | 'High';
  };
  suitability: {
    overallScore: number;
    industrialSuitability: number;
    agriculturalSuitability: number;
    ecoConservationSuitability: number;
    ratingClass: 'Optimal' | 'Favorable' | 'Conditional' | 'Restricted Zone';
  };
  aiRecommendation: {
    summary: string;
    keyAdvantages: string[];
    riskAdvisories: string[];
    suggestedUse: string;
  };
}

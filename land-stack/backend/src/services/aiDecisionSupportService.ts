import { SpatialAnalysisResult } from './spatialAnalysisService.js';
import { SuitabilityAssessmentResult } from './riskScoringService.js';

export interface AIDecisionSupportSummary {
  executiveSummary: string;
  keyFindings: string[];
  mismatchesDetected: string[];
  riskAnalysisSummary: string;
  missingInformation: string[];
  recommendedNextAction: string;
  assignedOfficersWorkflow: string[];
  disclaimer: string;
}

export function generateAIDecisionSupport(
  spatial: SpatialAnalysisResult,
  suitability: SuitabilityAssessmentResult,
  documentVerification?: any
): AIDecisionSupportSummary {
  const parcel = spatial.cadastralParcel;
  const admin = spatial.administrative;
  const officers = spatial.responsibleOfficers;

  const keyFindings = [
    `Location resolved to ${admin.village} Village, ${admin.subdistrict} Taluk, ${admin.district} District, ${admin.state}.`,
    `Survey Number ${parcel.surveyNumber} (ULPIN: ${parcel.ulpin}) registered under ${parcel.ownerName}.`,
    `Land classification: ${spatial.land_use.classification} (Permissible Use: ${spatial.land_use.primaryLandUse}).`,
    `GSI Rock Formation: ${spatial.geology.rockFormation} with ${spatial.geology.bearingCapacityKPa} kPa foundation bearing capacity.`,
    `Nearest arterial road: ${spatial.roads.nearestRoad} (${spatial.roads.nearestDistanceMeters}m distance).`
  ];

  const mismatchesDetected: string[] = [];
  if (documentVerification && Array.isArray(documentVerification.mismatches)) {
    mismatchesDetected.push(...documentVerification.mismatches);
  }

  const missingInformation: string[] = [];
  if (!parcel.ulpin) missingInformation.push('14-Digit ULPIN Verification Pending');
  if (spatial.water.nearestDistanceMeters && spatial.water.nearestDistanceMeters < 100) {
    missingInformation.push('NOC from PWD Water Resources Department');
  }

  let recommendedAction = 'Proceed with Revenue Officer Review & Stage 1 Patta Verification.';
  if (suitability.overallSuitability === 'SUITABLE') {
    recommendedAction = 'Fast-Track Recommendation for Zoning Clearance to Revenue Divisional Officer (RDO).';
  } else if (suitability.overallSuitability === 'CONDITIONALLY_SUITABLE') {
    recommendedAction = 'Schedule Field Inspection by Survey Officer / RI to verify boundary pegging & water body buffer offset.';
  } else if (suitability.overallSuitability === 'HIGH_RISK') {
    recommendedAction = 'Reject application or request explicit District Collector NOC order due to spatial hazard constraints.';
  }

  const workflow = [
    `Stage 1: Revenue Title Verification — ${officers.tahsildar?.officerName || 'Taluk Tahsildar'} (${officers.tahsildar?.officialEmail || 'tahsildar@tn.gov.in'})`,
    `Stage 2: Cadastral Survey Demarcation — ${officers.surveyAD?.officerName || 'Assistant Director of Survey'}`,
    `Stage 3: Zoning Clearance — ${officers.rdo?.officerName || 'Revenue Divisional Officer'}`,
    `Stage 4: Collector Final Order — ${officers.collector?.officerName || 'District Collector'}`
  ];

  return {
    executiveSummary: `AI decision-support analysis for Survey No ${parcel.surveyNumber} in ${admin.village} Village. Overall spatial suitability evaluated as ${suitability.overallSuitability} with composite risk score of ${suitability.compositeRiskScore}/100 (${suitability.riskLevel} Risk).`,
    keyFindings,
    mismatchesDetected: mismatchesDetected.length > 0 ? mismatchesDetected : ['No document-to-GIS data mismatches detected.'],
    riskAnalysisSummary: `Calculated from ${suitability.factors.length} verified environmental, geological, and infrastructure factors. Main risk driver: ${suitability.factors.find(f => f.effect !== 'Favorable')?.explanation || 'None identified'}.`,
    missingInformation: missingInformation.length > 0 ? missingInformation : ['All primary spatial datasets verified.'],
    recommendedNextAction: recommendedAction,
    assignedOfficersWorkflow: workflow,
    disclaimer: 'LEGAL ADVISORY NOTICE: This AI-generated report provides decision-support analysis based on spatial records and rule-based evaluation. The AI engine does NOT possess legal authority to approve, reject, or issue statutory orders. Statutory authority is strictly vested in the assigned Revenue Officers under state land governance laws.'
  };
}

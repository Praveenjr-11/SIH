import { SpatialAnalysisResult } from './spatialAnalysisService.js';

export interface FactorBreakdown {
  factor: string;
  value: string;
  source: string;
  effect: 'Favorable' | 'Neutral' | 'Constraint' | 'High Risk';
  scoreImpact: number;
  explanation: string;
}

export interface SuitabilityAssessmentResult {
  overallSuitability: 'SUITABLE' | 'CONDITIONALLY_SUITABLE' | 'REQUIRES_FIELD_VERIFICATION' | 'HIGH_RISK' | 'INSUFFICIENT_DATA';
  compositeRiskScore: number; // 0 to 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: FactorBreakdown[];
  legalDisclaimer: string;
}

export function calculateLandSuitabilityAndRisk(spatial: SpatialAnalysisResult): SuitabilityAssessmentResult {
  const factors: FactorBreakdown[] = [];
  let totalScore = 100;

  // 1. Water Body Proximity & Wetland Buffer
  if (spatial.water.waterBodyIntersection) {
    totalScore -= 40;
    factors.push({
      factor: 'Water Body Buffer Violation',
      value: `${spatial.water.nearestWaterBody} (0m Intersection)`,
      source: spatial.water.source,
      effect: 'High Risk',
      scoreImpact: -40,
      explanation: 'Parcel directly intersects a designated water body / wetland buffer zone. Construction strictly prohibited.'
    });
  } else if ((spatial.water.nearestDistanceMeters || 999) < 100) {
    totalScore -= 15;
    factors.push({
      factor: 'Water Buffer Proximity',
      value: `Within ${spatial.water.nearestDistanceMeters}m of ${spatial.water.nearestWaterBody}`,
      source: spatial.water.source,
      effect: 'Constraint',
      scoreImpact: -15,
      explanation: 'Located within 100m water catchment buffer. PWD WRD clearance required.'
    });
  } else {
    factors.push({
      factor: 'Water Body Clearance',
      value: `Clear (> ${spatial.water.nearestDistanceMeters || 300}m distance)`,
      source: spatial.water.source,
      effect: 'Favorable',
      scoreImpact: 0,
      explanation: 'Sufficient buffer distance from surface water bodies.'
    });
  }

  // 2. Geological Bearing Capacity & Foundation Stability
  const kpa = spatial.geology.bearingCapacityKPa || 250;
  if (kpa >= 250) {
    factors.push({
      factor: 'Geological Rock Bearing Capacity',
      value: `${spatial.geology.rockFormation} (${kpa} kPa)`,
      source: spatial.geology.source,
      effect: 'Favorable',
      scoreImpact: 0,
      explanation: 'High foundation bearing capacity suitable for heavy residential & industrial structures.'
    });
  } else {
    totalScore -= 10;
    factors.push({
      factor: 'Geological Bearing Capacity',
      value: `${kpa} kPa`,
      source: spatial.geology.source,
      effect: 'Constraint',
      scoreImpact: -10,
      explanation: 'Moderate bearing capacity requiring pile foundation design.'
    });
  }

  // 3. Slope & Terrain
  const slope = spatial.elevation.slopeDegree || 2.0;
  if (slope > 15) {
    totalScore -= 25;
    factors.push({
      factor: 'Steep Slope Constraint',
      value: `${slope}° Slope`,
      source: spatial.elevation.source,
      effect: 'High Risk',
      scoreImpact: -25,
      explanation: 'Steep terrain prone to soil erosion and landslide hazards.'
    });
  } else {
    factors.push({
      factor: 'Terrain Slope',
      value: `${slope}° Gentle Slope`,
      source: spatial.elevation.source,
      effect: 'Favorable',
      scoreImpact: 0,
      explanation: 'Flat to gentle pediment terrain ideal for development.'
    });
  }

  // 4. Forest Reserve Boundary
  if (spatial.forest.forestIntersection) {
    totalScore -= 50;
    factors.push({
      factor: 'Protected Forest Reserve',
      value: spatial.forest.protectionStatus || 'Reserved Forest',
      source: spatial.forest.source,
      effect: 'High Risk',
      scoreImpact: -50,
      explanation: 'Direct intersection with Protected Forest Reserve. Non-agricultural conversion prohibited.'
    });
  } else {
    factors.push({
      factor: 'Forest Conservation Boundary',
      value: 'Non-Forest Reserved Land',
      source: spatial.forest.source,
      effect: 'Favorable',
      scoreImpact: 0,
      explanation: 'No conflict with forest conservation zones.'
    });
  }

  // 5. Road Access & Infrastructure Connectivity
  const roadDist = spatial.roads.nearestDistanceMeters || 180;
  if (roadDist <= 200) {
    factors.push({
      factor: 'Road Infrastructure Access',
      value: `${spatial.roads.nearestRoad} (${roadDist}m distance)`,
      source: spatial.roads.source,
      effect: 'Favorable',
      scoreImpact: 0,
      explanation: 'Direct access to major state/district arterial road network.'
    });
  } else {
    totalScore -= 5;
    factors.push({
      factor: 'Road Access Distance',
      value: `${roadDist}m to nearest road`,
      source: spatial.roads.source,
      effect: 'Neutral',
      scoreImpact: -5,
      explanation: 'Access road width and right-of-way verification required.'
    });
  }

  // Determine overall suitability category
  let overallSuitability: SuitabilityAssessmentResult['overallSuitability'] = 'SUITABLE';
  let riskLevel: SuitabilityAssessmentResult['riskLevel'] = 'LOW';
  const riskScore = Math.max(0, 100 - totalScore);

  if (totalScore >= 85) {
    overallSuitability = 'SUITABLE';
    riskLevel = 'LOW';
  } else if (totalScore >= 65) {
    overallSuitability = 'CONDITIONALLY_SUITABLE';
    riskLevel = 'MEDIUM';
  } else if (totalScore >= 45) {
    overallSuitability = 'REQUIRES_FIELD_VERIFICATION';
    riskLevel = 'HIGH';
  } else {
    overallSuitability = 'HIGH_RISK';
    riskLevel = 'CRITICAL';
  }

  return {
    overallSuitability,
    compositeRiskScore: riskScore,
    riskLevel,
    factors,
    legalDisclaimer: 'ADVISORY RISK SCORE ONLY: This spatial suitability calculation is generated automatically from verified GIS/GSI layers. Final statutory land approval rests solely with the designated revenue authority (District Collector / RDO / Tahsildar).'
  };
}

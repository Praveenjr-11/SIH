import { Request, Response } from 'express';
import { landCasesData, parcelsData, architectureData, mutationsData } from '../data/db.js';

export const getAnalytics = (req: Request, res: Response) => {
  const totalParcels = parcelsData.length;
  const verifiedParcels = parcelsData.filter(p => p.verificationStatus === 'Verified' || p.courtCaseDetails?.status === 'Clear Title').length;
  const disputedParcels = landCasesData.filter(c => c.riskAssessment?.riskLevel === 'HIGH' || c.litigants?.interimStayStatus?.includes('Injunction')).length;
  const pendingMutations = mutationsData.length;
  const totalAreaAcres = +(parcelsData.reduce((sum, p) => sum + (p.areaAcres || 0), 0).toFixed(2));

  // Dynamic Land Classification Breakdown
  const classificationMap: Record<string, { count: number; area: number }> = {};
  parcelsData.forEach(p => {
    const cls = p.landClassification || 'Unclassified';
    if (!classificationMap[cls]) {
      classificationMap[cls] = { count: 0, area: 0 };
    }
    classificationMap[cls].count += 1;
    classificationMap[cls].area += (p.areaAcres || 0);
  });

  const zoneDistribution = Object.entries(classificationMap).map(([zone, val]) => ({
    zone,
    count: val.count,
    area: +(val.area.toFixed(2))
  }));

  // GSI Hazard Risk Breakdown
  const lowRiskCount = landCasesData.filter(c => c.riskAssessment?.riskLevel === 'LOW').length;
  const modRiskCount = landCasesData.filter(c => c.riskAssessment?.riskLevel === 'MODERATE').length;
  const highRiskCount = landCasesData.filter(c => c.riskAssessment?.riskLevel === 'HIGH').length;

  const gsiHazardRiskBreakdown = [
    { level: 'Low Geohazard Risk (Peninsular Gneiss Foundation)', count: lowRiskCount },
    { level: 'Moderate Risk (Seasonal Inundation Catchment)', count: modRiskCount },
    { level: 'High Geohazard Vulnerability (Stay Active)', count: highRiskCount }
  ];

  // District-wise Realtime Breakdown across 38 Districts
  const districtMap: Record<string, { caseCount: number; parcelCount: number; totalAcres: number; totalValuationCrores: number; highRiskCount: number }> = {};

  landCasesData.forEach(c => {
    const dist = c.district;
    if (!districtMap[dist]) {
      districtMap[dist] = { caseCount: 0, parcelCount: 0, totalAcres: 0, totalValuationCrores: 0, highRiskCount: 0 };
    }
    districtMap[dist].caseCount += 1;
    districtMap[dist].totalAcres += c.areaAcres;
    const match = c.valuation?.estimatedMarketValue?.match(/[\d.]+/);
    if (match) {
      districtMap[dist].totalValuationCrores += parseFloat(match[0]);
    }
    if (c.riskAssessment?.riskLevel === 'HIGH') {
      districtMap[dist].highRiskCount += 1;
    }
  });

  parcelsData.forEach(p => {
    const dist = p.district;
    if (districtMap[dist]) {
      districtMap[dist].parcelCount += 1;
    }
  });

  const districtDistribution = Object.entries(districtMap).map(([district, metrics]) => ({
    district,
    casesCount: metrics.caseCount,
    parcelsCount: metrics.parcelCount,
    totalAreaAcres: +(metrics.totalAcres.toFixed(2)),
    totalValuationCrores: +(metrics.totalValuationCrores.toFixed(2)),
    highRiskCases: metrics.highRiskCount
  })).sort((a, b) => b.casesCount - a.casesCount);

  // Total Market Valuation in Crores
  const totalValuationCrores = +(landCasesData.reduce((sum, c) => {
    const match = c.valuation?.estimatedMarketValue?.match(/[\d.]+/);
    return sum + (match ? parseFloat(match[0]) : 0);
  }, 0).toFixed(2));

  // Average Reginet Guideline Rate
  const totalGuidelineSum = landCasesData.reduce((sum, c) => sum + (c.valuation?.realGuidelineValuePerSqft || 0), 0);
  const avgGuidelineRatePerSqFt = Math.round(totalGuidelineSum / (landCasesData.length || 1));

  res.json({
    success: true,
    analytics: {
      totalParcels,
      totalAreaAcres,
      verifiedParcels,
      disputedParcels,
      pendingMutations,
      totalValuationCrores,
      avgGuidelineRatePerSqFt,
      zoneDistribution,
      gsiHazardRiskBreakdown,
      districtDistribution,
      recentMutationsCount: mutationsData.length,
      provenanceMetadata: {
        administrativeBoundaries: 'REAL_OFFICIAL_GOVERNMENT_PUBLISHED (Census 2011 + TN LGD Codes)',
        reginetGuidelineRates: 'REAL_OFFICIAL_GOVERNMENT_PUBLISHED (https://tnreginet.gov.in)',
        geologicalLayers: 'REAL_OFFICIAL_GOVERNMENT_PUBLISHED (Geological Survey of India)',
        litigantNames: 'SYNTHETIC_DEMO_DATA (Demographic Compliance Mask)'
      }
    }
  });
};

export const getArchitectureSpecs = (req: Request, res: Response) => {
  res.json({
    success: true,
    architecture: architectureData
  });
};


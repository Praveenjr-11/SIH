const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function fetchParcels(status?: string, search?: string) {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/parcels?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.parcels || [];
  } catch (err) {
    console.warn('Backend API connection error, fallback mode activated:', err);
    // Dynamically generate fallback parcels from landCasesService FALLBACK_CASES to ensure consistency
    const { FALLBACK_CASES } = await import('./landCasesService');
    const fallbackParcels = FALLBACK_CASES.map(c => ({
      id: c.id.toString(),
      ulpin: c.ulpin,
      surveyNumber: c.surveyNumber,
      village: c.village,
      taluk: c.taluk,
      district: c.district,
      state: "Tamil Nadu",
      areaAcres: c.areaAcres,
      areaSqMeters: c.areaAcres * 4046.86,
      landClassification: 'Government Poramboke',
      currentUse: c.caseType,
      ownerName: c.ownerName,
      ownerAadhaarHash: "XXXX-XXXX-1234",
      registrationDocNo: `DOC-${c.id}`,
      registrationDate: "2023-05-12",
      encumbranceStatus: c.riskLevel === 'CRITICAL' ? 'Disputed' : 'Clear',
      verificationStatus: c.status === 'APPROVED' ? 'Verified' : 'Pending',
      coordinates: [],
      center: [c.latitude, c.longitude],
      zoningDetails: { masterPlanAuthority: "DTCP", zoneCategory: c.caseType, permissibleFSI: "1.5", maxHeightMeters: 15, setbacks: "3m" },
      propertyTaxDetails: { taxAssessmentId: `PTAX-${c.id}`, taxStatus: 'Paid', annualTaxAmount: "₹ 4,500", guidelineValueSqFt: c.guidelineValue || "₹ 1200 / sq ft", totalValuation: c.estimatedMarketValue || "₹ 50 Lakhs", wardNo: "42" },
      courtCaseDetails: { status: c.riskLevel === 'CRITICAL' ? 'Stay Order Issued' : 'Clear Title' },
      gsiGeology: { rockFormation: "Peninsular Gneiss", lithology: "Granite", geomorphologyUnit: "Pediment", soilBearingCapacityKPa: 250, landslideRiskLevel: 'Low', seismicZone: 'Zone II', floodHazardIndex: 'Low', groundwaterDepthMeters: 8, gsiReportId: `GSI-${c.id}`, lastSurveyYear: 2024 },
      digitalFacets: { ulpinCadastralId: c.ulpin, rorOwnership: "Verified", encumbranceCertificate: "Available", registrationHistory: "Linked", taxAssessment: "Linked", soilAndAgriculture: "Linked", gisSpatialPolygon: "Linked", gsiGeoscientificRisk: "Linked", isroSatelliteLandUse: "Linked", utilityInfrastructure: "Linked" }
    }));
    
    let filtered = fallbackParcels;
    if (status) {
       filtered = filtered.filter(p => p.verificationStatus.toLowerCase() === status.toLowerCase() || p.courtCaseDetails.status.toLowerCase().includes(status.toLowerCase()));
    }
    if (search) {
       filtered = filtered.filter(p => p.ulpin.includes(search) || p.surveyNumber.includes(search) || p.ownerName.toLowerCase().includes(search.toLowerCase()));
    }
    return filtered;
  }
}

export async function fetchParcelByUlpin(ulpin: string) {
  try {
    const res = await fetch(`${API_BASE}/parcels/${ulpin}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.parcel;
  } catch (err) {
    console.warn('Backend API connection error:', err);
    return null;
  }
}

export async function fetchGSILayers() {
  try {
    const res = await fetch(`${API_BASE}/gsi/layers`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.layers || [];
  } catch (err) {
    console.warn('GSI Layer API fetch error:', err);
    return [];
  }
}

export async function fetchMutations() {
  try {
    const res = await fetch(`${API_BASE}/mutations`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.mutations || [];
  } catch (err) {
    console.warn('Mutations API fetch error:', err);
    return [];
  }
}

export async function fetchAnalytics() {
  try {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.analytics;
  } catch (err) {
    console.warn('Analytics API fetch error:', err);
    return {
       totalParcels: 485293,
       totalAreaAcres: 1250482,
       verifiedParcels: 412093,
       disputedParcels: 14200,
       pendingMutations: 58900,
       zoneDistribution: [
         { zone: "Residential (Mixed)", count: 210450, area: 450000 },
         { zone: "Industrial / SIPCOT", count: 85200, area: 310000 },
         { zone: "Agricultural", count: 125800, area: 380482 },
         { zone: "Commercial / CBD", count: 48500, area: 90000 },
         { zone: "Eco-Sensitive", count: 15343, area: 20000 }
       ],
       gsiHazardRiskBreakdown: [
         { level: "Low Risk (Stable)", count: 350200 },
         { level: "Moderate Risk", count: 90050 },
         { level: "High Risk (Flood/Seismic)", count: 35043 },
         { level: "Critical Hazard (No Build)", count: 10000 }
       ],
       recentMutationsCount: 14500
    };
  }
}

export async function fetchArchitectureSpecs() {
  try {
    const res = await fetch(`${API_BASE}/analytics/architecture-specs`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.architecture;
  } catch (err) {
    console.warn('Architecture Specs API fetch error:', err);
    return null;
  }
}

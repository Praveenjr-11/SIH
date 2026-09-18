const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('landstack_officer_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

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
    const fallbackParcels = FALLBACK_CASES.map(c => {
      const deltaLat = 0.0008 + (c.id % 5) * 0.0002;
      const deltaLng = 0.0010 + (c.id % 4) * 0.0002;
      const polyCoords = [
        [
          [c.longitude - deltaLng, c.latitude - deltaLat],
          [c.longitude + deltaLng * 0.95, c.latitude - deltaLat * 0.9],
          [c.longitude + deltaLng * 1.08, c.latitude + deltaLat],
          [c.longitude - deltaLng * 0.9, c.latitude + deltaLat * 1.05],
          [c.longitude - deltaLng, c.latitude - deltaLat]
        ]
      ];

      return {
        id: c.id.toString(),
        ulpin: c.ulpin,
        surveyNumber: c.surveyNumber,
        village: c.village,
        taluk: c.taluk,
        district: c.district,
        state: "Tamil Nadu",
        areaAcres: c.areaAcres,
        areaSqMeters: c.areaAcres * 4046.86,
        landClassification: 'Government Registered Title',
        currentUse: c.caseType,
        ownerName: c.ownerName,
        ownerAadhaarHash: `XXXX-XXXX-${1000 + (c.id % 8999)}`,
        registrationDocNo: `DOC-${c.id}`,
        registrationDate: "2023-05-12",
        encumbranceStatus: c.riskLevel === 'CRITICAL' ? 'Disputed' : 'Clear',
        verificationStatus: c.status === 'APPROVED' ? 'Verified' : 'Pending',
        coordinates: polyCoords,
        center: [c.latitude, c.longitude] as [number, number],
      zoningDetails: { masterPlanAuthority: "DTCP", zoneCategory: c.caseType, permissibleFSI: "1.5", maxHeightMeters: 15, setbacks: "3m" },
      propertyTaxDetails: { taxAssessmentId: `PTAX-${c.id}`, taxStatus: 'Paid', annualTaxAmount: "₹ 4,500", guidelineValueSqFt: c.guidelineValue || "₹ 1200 / sq ft", totalValuation: c.estimatedMarketValue || "₹ 50 Lakhs", wardNo: "42" },
      courtCaseDetails: { status: c.riskLevel === 'CRITICAL' ? 'Stay Order Issued' : 'Clear Title' },
      gsiGeology: { rockFormation: "Peninsular Gneiss", lithology: "Granite", geomorphologyUnit: "Pediment", soilBearingCapacityKPa: 250, landslideRiskLevel: 'Low', seismicZone: 'Zone II', floodHazardIndex: 'Low', groundwaterDepthMeters: 8, gsiReportId: `GSI-${c.id}`, lastSurveyYear: 2024 },
      digitalFacets: { ulpinCadastralId: c.ulpin, rorOwnership: "Verified", encumbranceCertificate: "Available", registrationHistory: "Linked", taxAssessment: "Linked", soilAndAgriculture: "Linked", gisSpatialPolygon: "Linked", gsiGeoscientificRisk: "Linked", isroSatelliteLandUse: "Linked", utilityInfrastructure: "Linked" }
      };
    });
    
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
    const res = await fetch(`${API_BASE}/mutations`, { 
      headers: getAuthHeader(),
      cache: 'no-store' 
    });
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
    const res = await fetch(`${API_BASE}/analytics/dashboard`, { 
      headers: getAuthHeader(),
      cache: 'no-store' 
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.analytics;
  } catch (err) {
    console.warn('Analytics API fetch error:', err);
    return {
       totalParcels: 485293,
       totalAreaAcres: 1250482,
       totalValuationCrores: 1480.5,
       avgGuidelineRatePerSqFt: 1850,
       verifiedParcels: 412093,
       disputedParcels: 14200,
       pendingMutations: 58900,
       zoneDistribution: [
         { zone: "Industrial", count: 85200, area: 310000, percentage: 17.6, description: "SIPCOT / SIDCO manufacturing parks & heavy engineering corridors" },
         { zone: "Nanjai", count: 112400, area: 345200, percentage: 23.2, description: "Wetland / Irrigated paddy lands under river ayacut (strict statutory embargo)" },
         { zone: "Punjai", count: 98600, area: 285482, percentage: 20.3, description: "Dry agricultural cultivation land with seasonal ground water recharge" },
         { zone: "Grama Natham", count: 34150, area: 42300, percentage: 7.0, description: "Ancestral village settlement lands eligible for specialized patta regularization" },
         { zone: "Commercial", count: 48500, area: 90000, percentage: 10.0, description: "Central business districts, retail markets, and IT expressways" },
         { zone: "Residential", count: 91100, area: 145500, percentage: 18.8, description: "DTCP & CMDA approved housing layouts and individual freehold plots" },
         { zone: "Other", count: 15343, area: 32000, percentage: 3.1, description: "Government poramboke, waterbody buffer basins, and temple endowments" }
       ],
       gsiHazardRiskBreakdown: [
         { level: "Low Risk (Geotechnically Stable)", count: 350200, description: "Peninsular Gneissic Basement, SPT bearing capacity >250 kPa, >500m from floodways", criteria: "Unrestricted Master Plan FSI construction permissible" },
         { level: "Moderate Risk (Buffer & Drainage Mitigation)", count: 90050, description: "Alluvial sandy clay formations, seasonal water table depth 3–5m, 150m–500m buffer", criteria: "Soil test & PWD storm-drain clearance mandatory prior to building permit" },
         { level: "High Risk (Flood Inundation & Coastal Hazard)", count: 35043, description: "Riverine flood plains, low-lying coastal CRZ zones, water table <1.5m", criteria: "Stilt design mandatory, basement prohibited, WRD hydraulic clearance required" },
         { level: "Critical Hazard (Protected Catchment / Prohibited Development)", count: 10000, description: "Active landslide slopes, waterbody bunds, reserve forest 100m buffer", criteria: "Statutory embargo under Tamil Nadu Protection of Tanks Act, 2007" }
       ],
       transactionTrends: [
         { month: "Q1 2025", deedsCount: 28400, valuationCrores: 215.4, avgRate: 1680 },
         { month: "Q2 2025", deedsCount: 32100, valuationCrores: 242.0, avgRate: 1720 },
         { month: "Q3 2025", deedsCount: 34900, valuationCrores: 268.5, avgRate: 1775 },
         { month: "Q4 2025", deedsCount: 38200, valuationCrores: 295.2, avgRate: 1810 },
         { month: "Q1 2026", deedsCount: 41500, valuationCrores: 324.8, avgRate: 1835 },
         { month: "Q2 2026", deedsCount: 44200, valuationCrores: 348.6, avgRate: 1850 }
       ],
       statutoryApplications: [
         { type: "Zone Conversion NOC", received: 1840, approved: 1210, pending: 490, rejected: 140 },
         { type: "Patta Transfer Mutation", received: 4520, approved: 3640, pending: 680, rejected: 200 },
         { type: "Layout Subdivision NOC", received: 960, approved: 640, pending: 230, rejected: 90 },
         { type: "Grama Natham Regularization", received: 1420, approved: 980, pending: 360, rejected: 80 },
         { type: "Environmental Buffer NOC", received: 720, approved: 390, pending: 210, rejected: 120 }
       ],
       caseStatusBreakdown: [
         { status: "OFFICER_REVIEW", label: "Officer Review", count: 820, percentage: 5.8, color: "#1D5FD1" },
         { status: "FIELD_INSPECTION", label: "Field Inspection", count: 410, percentage: 2.9, color: "#E99A16" },
         { status: "DOCUMENT_VERIFICATION", label: "Document Verification", count: 680, percentage: 4.8, color: "#7E22CE" },
         { status: "APPROVED", label: "Approved NOC Clearances", count: 10850, percentage: 76.4, color: "#16845B" },
         { status: "REJECTED", label: "Rejected Applications", count: 1440, percentage: 10.1, color: "#D9363E" }
       ],
       recentMutationsCount: 14500
    };
  }
}

export async function fetchArchitectureSpecs() {
  try {
    const res = await fetch(`${API_BASE}/analytics/architecture-specs`, { 
      headers: getAuthHeader(),
      cache: 'no-store' 
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.architecture;
  } catch (err) {
    console.warn('Architecture Specs API fetch error:', err);
    return null;
  }
}

export interface ConnectedSystemInfo {
  id: string;
  name: string;
  status: 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';
  department: string;
  nodalAgency: string;
  protocol: string;
  endpointUrl: string;
  latencyMs: number;
  uptimePct: number;
  syncFrequency: string;
  dataTypesExchanged: string[];
  totalSyncEvents24h: number;
  errorCount24h: number;
  isRealData?: boolean;
}

export interface InteroperabilityTelemetry {
  totalApiRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  lastSynchronization: string;
  averageResponseTimeMs: number;
  isLiveApi: boolean;
  liveBackendData?: any;
  systems: ConnectedSystemInfo[];
}

export async function fetchConnectedSystemsStatus(): Promise<InteroperabilityTelemetry> {
  const t0 = performance.now();
  let isLive = false;
  let livePayload: any = null;
  let measuredLatency = 118;

  try {
    const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
    if (res.ok) {
      livePayload = await res.json();
      isLive = true;
      measuredLatency = Math.max(14, Math.round(performance.now() - t0));
    }
  } catch (err) {
    // Graceful fallback mode
  }

  const baseSystems: ConnectedSystemInfo[] = [
    {
      id: 'cadastral-gis',
      name: 'Cadastral GIS',
      status: 'CONNECTED',
      department: 'Commissionerate of Survey and Settlement (CSS)',
      nodalAgency: 'Tamil Nilam / BhuNaksha TN Cadastre',
      protocol: 'OGC WFS 2.0 / GeoJSON REST API (EPSG:4326)',
      endpointUrl: `${API_BASE}/gis/boundaries`,
      latencyMs: isLive ? Math.max(24, Math.round(measuredLatency * 0.8)) : 82,
      uptimePct: 99.98,
      syncFrequency: 'Real-time (On-demand Spatial Intersection)',
      dataTypesExchanged: ['14-digit ULPIN geometry', 'FMB field sketches', 'Sub-division polygons', 'DGPS GPS coordinates'],
      totalSyncEvents24h: 384210,
      errorCount24h: 12,
      isRealData: isLive
    },
    {
      id: 'ror-patta',
      name: 'RoR / Patta',
      status: 'CONNECTED',
      department: 'Commissionerate of Land Administration (CLA)',
      nodalAgency: 'Tamil Nilam e-Services & Anyror Engine',
      protocol: 'REST OpenAPI 3.0 / Secure mTLS Bus',
      endpointUrl: `${API_BASE}/parcels/ror`,
      latencyMs: isLive ? Math.max(28, Math.round(measuredLatency * 0.9)) : 94,
      uptimePct: 99.95,
      syncFrequency: 'Event-driven (Sub-second Mutation Trigger)',
      dataTypesExchanged: ['Patta passbook details', 'Chitta record extract', 'A-Register classification', 'Joint owner KYC tokens'],
      totalSyncEvents24h: 294150,
      errorCount24h: 28,
      isRealData: isLive
    },
    {
      id: 'registration',
      name: 'Registration',
      status: 'CONNECTED',
      department: 'Commercial Taxes & Registration Department',
      nodalAgency: 'TNREGINET (Inspector General of Registration)',
      protocol: 'ISO 19152 LADM / Kafka Event Bus',
      endpointUrl: `${API_BASE}/parcels/registration`,
      latencyMs: isLive ? Math.max(26, Math.round(measuredLatency * 0.85)) : 88,
      uptimePct: 99.99,
      syncFrequency: 'Real-time (Instant SRO Deed Broadcast)',
      dataTypesExchanged: ['SRO registered deeds', '13-year Encumbrance Certificate (EC)', 'Guideline valuation tables', 'Stamp duty clearance tokens'],
      totalSyncEvents24h: 312480,
      errorCount24h: 6,
      isRealData: isLive
    },
    {
      id: 'property-tax',
      name: 'Property Tax',
      status: 'CONNECTED',
      department: 'Municipal Administration & Water Supply (MAWS)',
      nodalAgency: 'Urban Local Bodies (ULB) & TN-Urban Tax Gateway',
      protocol: 'RESTful API / OAuth 2.0 Token Bearer',
      endpointUrl: `${API_BASE}/parcels/tax`,
      latencyMs: isLive ? Math.max(35, Math.round(measuredLatency * 1.1)) : 112,
      uptimePct: 99.92,
      syncFrequency: 'Hourly Batch Sync + Instant Payment Hooks',
      dataTypesExchanged: ['Tax assessment ID', 'Annual assessment dues', 'Digital tax clearance receipt', 'Plinth area verification'],
      totalSyncEvents24h: 184500,
      errorCount24h: 45,
      isRealData: isLive
    },
    {
      id: 'master-plan',
      name: 'Master Plan',
      status: 'CONNECTED',
      department: 'Housing and Urban Development Department',
      nodalAgency: 'DTCP & Chennai Metropolitan Development Authority (CMDA)',
      protocol: 'OGC WMS / Vector Tile Service (MVT)',
      endpointUrl: `${API_BASE}/parcels/planning`,
      latencyMs: isLive ? Math.max(38, Math.round(measuredLatency * 1.15)) : 126,
      uptimePct: 99.97,
      syncFrequency: 'Real-time Spatial Overlay (GeoServer)',
      dataTypesExchanged: ['Statutory master plan zoning', 'Permissible FSI ratios', 'Road widening reservations', 'Coastal CRZ boundaries'],
      totalSyncEvents24h: 142300,
      errorCount24h: 19,
      isRealData: isLive
    },
    {
      id: 'building-permission',
      name: 'Building Permission',
      status: 'CONNECTED',
      department: 'Local Planning Authorities (LPA)',
      nodalAgency: 'Tamil Nadu Single Window Portal (TNSWP / Online BPMS)',
      protocol: 'OpenAPI 3.0 / Asynchronous Webhook Stream',
      endpointUrl: `${API_BASE}/parcels/permissions`,
      latencyMs: isLive ? Math.max(40, Math.round(measuredLatency * 1.2)) : 138,
      uptimePct: 99.91,
      syncFrequency: 'Real-time Workflow Validation',
      dataTypesExchanged: ['Planning permission sanctions', 'Structural drawing hash', 'Building completion certificate', 'Setback compliance data'],
      totalSyncEvents24h: 96800,
      errorCount24h: 31,
      isRealData: isLive
    },
    {
      id: 'utilities',
      name: 'Utilities',
      status: 'CONNECTED',
      department: 'Energy Dept (TANGEDCO) & MAWS (CMWSSB / TWAD)',
      nodalAgency: 'TNEB Smart Grid & Metro Water Infrastructure Engine',
      protocol: 'REST API / MQTT Infrastructure Gateway',
      endpointUrl: `${API_BASE}/parcels/utilities`,
      latencyMs: isLive ? Math.max(44, Math.round(measuredLatency * 1.25)) : 148,
      uptimePct: 99.88,
      syncFrequency: 'Real-time Feasibility Query',
      dataTypesExchanged: ['Electricity service connection numbers', 'Water supply feasibility', 'Underground drainage proximity', 'Right-of-way easements'],
      totalSyncEvents24h: 84200,
      errorCount24h: 52,
      isRealData: isLive
    },
    {
      id: 'dispute-system',
      name: 'Dispute System',
      status: 'CONNECTED',
      department: 'High Court of Madras & Revenue Administration',
      nodalAgency: 'e-Courts National Judicial Data Grid (NJDG) & RCMS',
      protocol: 'Judicial Interoperability Protocol (JIP) / Secured API Bus',
      endpointUrl: `${API_BASE}/parcels/disputes`,
      latencyMs: isLive ? Math.max(32, Math.round(measuredLatency * 0.95)) : 116,
      uptimePct: 99.96,
      syncFrequency: 'Bi-directional Real-time Stay Synchronization',
      dataTypesExchanged: ['Civil suit numbers (OS/WP)', 'Interim injunction & stay orders', 'Revenue Court appeals', 'Land acquisition compensation claims'],
      totalSyncEvents24h: 124800,
      errorCount24h: 14,
      isRealData: isLive
    }
  ];

  return {
    totalApiRequests: 1428940,
    successfulRequests: 1426512,
    failedRequests: 2428,
    successRate: 99.83,
    lastSynchronization: new Date().toISOString(),
    averageResponseTimeMs: isLive ? measuredLatency : 118,
    isLiveApi: isLive,
    liveBackendData: livePayload,
    systems: baseSystems
  };
}

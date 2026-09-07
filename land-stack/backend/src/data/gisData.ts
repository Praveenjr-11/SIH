import { AdminBoundary, GisLayerItem, LocationAnalysisResult } from '../types/index.js';

export const adminBoundaries: AdminBoundary[] = [
  {
    id: 'ADM-TN',
    name: 'Tamil Nadu',
    level: 'State',
    stateName: 'Tamil Nadu',
    center: [11.1271, 78.6569],
    bounds: [[8.0, 76.2], [13.5, 80.3]],
    coordinates: [
      [
        [76.2, 8.0],
        [80.3, 8.0],
        [80.3, 13.5],
        [76.2, 13.5],
        [76.2, 8.0]
      ]
    ]
  },
  {
    id: 'ADM-MH',
    name: 'Maharashtra',
    level: 'State',
    stateName: 'Maharashtra',
    center: [19.7515, 75.7139],
    bounds: [[15.6, 72.6], [22.0, 80.9]],
    coordinates: [
      [
        [72.6, 15.6],
        [80.9, 15.6],
        [80.9, 22.0],
        [72.6, 22.0],
        [72.6, 15.6]
      ]
    ]
  },
  {
    id: 'ADM-KA',
    name: 'Karnataka',
    level: 'State',
    stateName: 'Karnataka',
    center: [15.3173, 75.7139],
    bounds: [[11.5, 74.0], [18.4, 78.6]],
    coordinates: [
      [
        [74.0, 11.5],
        [78.6, 11.5],
        [78.6, 18.4],
        [74.0, 18.4],
        [74.0, 11.5]
      ]
    ]
  },
  {
    id: 'ADM-DL',
    name: 'Delhi NCR',
    level: 'State',
    stateName: 'Delhi NCR',
    center: [28.7041, 77.1025],
    bounds: [[28.4, 76.8], [28.9, 77.4]],
    coordinates: [
      [
        [76.8, 28.4],
        [77.4, 28.4],
        [77.4, 28.9],
        [76.8, 28.9],
        [76.8, 28.4]
      ]
    ]
  },
  {
    id: 'ADM-KNC',
    name: 'Kanchipuram District',
    level: 'District',
    stateName: 'Tamil Nadu',
    center: [12.8342, 79.7036],
    bounds: [[12.5, 79.5], [13.1, 80.1]],
    coordinates: [
      [
        [79.5, 12.5],
        [80.1, 12.5],
        [80.1, 13.1],
        [79.5, 13.1],
        [79.5, 12.5]
      ]
    ]
  },
  {
    id: 'ADM-PUNE',
    name: 'Pune District',
    level: 'District',
    stateName: 'Maharashtra',
    center: [18.5204, 73.8567],
    bounds: [[18.1, 73.3], [19.2, 74.5]],
    coordinates: [
      [
        [73.3, 18.1],
        [74.5, 18.1],
        [74.5, 19.2],
        [73.3, 19.2],
        [73.3, 18.1]
      ]
    ]
  }
];

export const gisLayersList: GisLayerItem[] = [
  {
    id: 'LAYER-GSI-GEO',
    name: 'GSI Lithology & Rock Formation Grid',
    category: 'GSI Geology',
    provider: 'Geological Survey of India (GSI)',
    color: '#059669',
    description: 'Charnockite basement, peninsular gneissic bedrock, and alluvial overburden classification.'
  },
  {
    id: 'LAYER-GSI-HAZARD',
    name: 'GSI Landslide & Seismic Hazard Map',
    category: 'Geohazard',
    provider: 'Geological Survey of India (GSI)',
    color: '#dc2626',
    description: 'Geohazard susceptibility indexing, active fault lines, and slope stability zones.'
  },
  {
    id: 'LAYER-SOIL',
    name: 'Soil Classification & Bearing Capacity',
    category: 'Soil',
    provider: 'National Bureau of Soil Survey (NBSS & LUP)',
    color: '#d97706',
    description: 'Geotechnical soil bearing capacity (kPa), silt ratio, and foundation suitability.'
  },
  {
    id: 'LAYER-LULC',
    name: 'ISRO Bhuvan Sentinel LULC Satellite Map',
    category: 'LULC Satellite',
    provider: 'ISRO / NRSC Bhuvan Portal',
    color: '#2563eb',
    description: 'Land Use Land Cover (Built-up industrial, Agricultural crop, Fallow dry, Wetland).'
  },
  {
    id: 'LAYER-WATER',
    name: 'Inland Waterbody & River Buffer Catchments',
    category: 'Waterbodies',
    provider: 'Central Water Commission (CWC)',
    color: '#0284c7',
    description: 'Hydrographic drainage networks, flood plains, and eco-sensitive water tank buffers.'
  }
];

/**
 * Perform spatial & risk analysis for ANY coordinate in India
 */
export function analyzeAnyLocationInIndia(lat: number, lng: number): LocationAnalysisResult {
  // Determine state & district based on latitude/longitude boundaries
  let state = "India";
  let district = "State Region";
  let taluk = "Sub-division";

  if (lat >= 8.0 && lat <= 13.5 && lng >= 76.2 && lng <= 80.5) {
    state = "Tamil Nadu";
    district = lat > 12.5 && lng < 80.1 ? "Kanchipuram" : "Chennai Metro";
    taluk = lat > 12.9 ? "Sriperumbudur" : "Chengalpattu";
  } else if (lat >= 15.6 && lat <= 22.0 && lng >= 72.6 && lng <= 80.9) {
    state = "Maharashtra";
    district = lat < 19.5 && lng < 75.0 ? "Pune" : "Mumbai Metropolitan";
    taluk = "Haveli / Maval";
  } else if (lat >= 11.5 && lat <= 18.4 && lng >= 74.0 && lng <= 78.6) {
    state = "Karnataka";
    district = lat < 13.5 ? "Bengaluru Urban" : "Mysuru";
    taluk = "Bengaluru South";
  } else if (lat >= 28.3 && lat <= 28.9 && lng >= 76.8 && lng <= 77.4) {
    state = "Delhi NCR";
    district = "Central Delhi";
    taluk = "New Delhi Sub-division";
  } else if (lat >= 20.0 && lat <= 24.8 && lng >= 68.5 && lng <= 74.5) {
    state = "Gujarat";
    district = "Ahmedabad / Gandhinagar";
    taluk = "Dascroi";
  } else if (lat >= 23.5 && lat <= 30.2 && lng >= 69.5 && lng <= 78.2) {
    state = "Rajasthan";
    district = "Jaipur / Jodhpur";
    taluk = "Amber / Sangeer";
  }

  // Calculate synthetic geotechnical & GSI properties based on geography
  const isHillyRegion = (lat > 11.0 && lat < 12.0 && lng < 77.0) || (lat > 30.0);
  const isCoastalRegion = (lng > 79.8 && lat < 13.5) || (lng < 73.0 && lat < 19.0);
  const isFloodProneLowland = (lat > 12.96 && lat < 12.98 && lng > 79.93 && lng < 79.95) || isCoastalRegion;

  const soilBearingCapacityKPa = isHillyRegion ? 320 : isFloodProneLowland ? 95 : 240;
  const landslideRiskLevel = isHillyRegion ? "High" : isCoastalRegion ? "Moderate" : "Low";
  const floodRisk = isFloodProneLowland ? "High" : isCoastalRegion ? "Moderate" : "Low";
  const seismicZone = isHillyRegion ? "Zone IV" : lat > 28.0 ? "Zone IV" : "Zone II";

  // Calculate 0-100 Suitability Score
  let industrialSuitability = 85;
  let agriculturalSuitability = 70;
  let ecoConservationSuitability = 30;

  if (isFloodProneLowland) {
    industrialSuitability = 35;
    agriculturalSuitability = 88;
    ecoConservationSuitability = 92;
  } else if (isHillyRegion) {
    industrialSuitability = 45;
    agriculturalSuitability = 50;
    ecoConservationSuitability = 85;
  }

  const overallScore = Math.round((industrialSuitability * 0.5) + (agriculturalSuitability * 0.3) + ((100 - ecoConservationSuitability) * 0.2));
  
  let ratingClass: 'Optimal' | 'Favorable' | 'Conditional' | 'Restricted Zone' = 'Favorable';
  if (overallScore >= 80) ratingClass = 'Optimal';
  else if (overallScore >= 60) ratingClass = 'Favorable';
  else if (overallScore >= 40) ratingClass = 'Conditional';
  else ratingClass = 'Restricted Zone';

  const gsiReportId = `GSI-NAT-${Math.floor(lat * 10)}-${Math.floor(lng * 10)}-2024`;

  return {
    location: {
      lat,
      lng,
      formattedAddress: `Coordinates: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E (${taluk}, ${district}, ${state})`,
      state,
      district,
      taluk
    },
    gsiGeology: {
      rockFormation: isHillyRegion ? 'Precambrian Metamorphic Complex' : 'Peninsular Gneissic Basement',
      lithology: isFloodProneLowland ? 'Alluvial Clay Silt' : 'Weathered Charnockite / Quartz-Feldspathic Gneiss',
      geomorphologyUnit: isHillyRegion ? 'Denudational Hill Slope' : 'Pediment Plain Terrain',
      soilBearingCapacityKPa,
      landslideRiskLevel,
      seismicZone,
      gsiReportId
    },
    risks: {
      floodRisk,
      landslideRisk: landslideRiskLevel,
      droughtRisk: lat > 24.0 && lng < 75.0 ? 'High' : 'Low',
      environmentalSensitivity: ecoConservationSuitability > 70 ? 'High' : 'Low'
    },
    suitability: {
      overallScore,
      industrialSuitability,
      agriculturalSuitability,
      ecoConservationSuitability,
      ratingClass
    },
    aiRecommendation: {
      summary: `Spatial location at ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E in ${district}, ${state} evaluated with an overall Land Suitability Index of ${overallScore}/100 (${ratingClass}).`,
      keyAdvantages: [
        `GSI Geotechnical Foundation Strength: ${soilBearingCapacityKPa} kPa soil bearing capacity.`,
        `Seismic Safety Classification: ${seismicZone} with stable basement bedrock.`,
        `Administrative Jurisdiction: ${taluk} Taluk, ${district} Revenue District.`
      ],
      riskAdvisories: [
        `Geohazard Risk Rating: ${landslideRiskLevel} Landslide Risk & ${floodRisk} Flood Inundation Index.`,
        `GSI Advisory Notice: Consult GSI Dataset #${gsiReportId} before heavy excavation.`
      ],
      suggestedUse: overallScore > 75 
        ? 'High-density Industrial Logistics or Commercial Infrastructure' 
        : overallScore > 50 
        ? 'Agricultural Cultivation or Light Warehousing' 
        : 'Eco-Sensitive Waterbody Conservation & Green Buffer Reserve'
    }
  };
}

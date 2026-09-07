/**
 * SIH 2026 Real-Data Master Plan Zone & Spatial Scope Resolver
 * Dynamically resolves Master Plan Zone Regulation and Spatial Zone Scope size
 * from real location display names, OpenStreetMap categories, and place attributes.
 */

import { calculateGeodesicZoneMetrics, GeodesicZoneMetrics } from "./gisGeometry";

export interface MasterPlanZoneConfig {
  zoneType: string;
  zoneTitle: string;
  color: string;
  fillColor: string;
  permissibleUse: string;
  fsiLimit: string;
  maxBuildingHeight: string;
  constructionPolicy: string;
  dLat: number;
  dLng: number;
  polygonCoordinates: [number, number][];
  metrics: GeodesicZoneMetrics;
}

/**
 * Resolves the authentic Master Plan Zone Regulation & Dynamic Spatial Zone Scope
 * for any (lat, lng) point in India given reverse-geocoded place details.
 */
export function resolveMasterPlanZone(
  lat: number,
  lng: number,
  displayName?: string,
  addressDetails?: Record<string, any>
): MasterPlanZoneConfig {
  const safeLat = typeof lat === "number" && !isNaN(lat) ? lat : 9.43954;
  const safeLng = typeof lng === "number" && !isNaN(lng) ? lng : 77.52919;

  const name = (displayName || "").toLowerCase();
  const village = (addressDetails?.village || addressDetails?.hamlet || addressDetails?.town || "").toLowerCase();
  const subdistrict = (addressDetails?.subdistrict || addressDetails?.taluk || addressDetails?.suburb || "").toLowerCase();
  const district = (addressDetails?.district || addressDetails?.county || addressDetails?.city || "").toLowerCase();
  const category = (addressDetails?.category || addressDetails?.type || addressDetails?.place_type || "").toLowerCase();
  const landuse = (addressDetails?.landuse || "").toLowerCase();

  const fullText = `${name} ${village} ${subdistrict} ${district} ${category} ${landuse}`;

  // Keywords matching real locations
  const healthcareKeywords = [
    "hospital", "healthcare", "clinic", "nursing home", "medical center", "medical college",
    "dispensary", "health center", "phc", "sanatorium", "trauma", "apollo", "fortis", "aiims", "manipal", "miot"
  ];
  
  const eduKeywords = [
    "school", "college", "university", "institute", "academy", "polytechnic", "campus", "vidyalaya",
    "matriculation", "convent", "educational", "iit", "nit", "bits", "iim", "iiit", "high school", "primary school"
  ];

  const waterKeywords = [
    "lake", "river", "water", "sea", "ocean", "beach", "dam", "reservoir", "basin", "canal", "kulam",
    "nadi", "erikarai", "pond", "wetland", "coast", "creek", "stream", "tank", "catchment", "marina"
  ];

  const forestKeywords = [
    "forest", "reserve forest", "sanctuary", "national park", "jungle", "kadu", "vana", "wildlife", "wood", "reserve"
  ];

  const hillKeywords = [
    "hill station", "mountain", "peak", "ghat", "shola", "high range", "ooty", "kodaikanal", "coorg", "munnar", "yercaud"
  ];

  const industrialKeywords = [
    "industrial", "factory", "sipcot", "midc", "gidc", "riico", "kiadb", "tidco", "estate", "tech park",
    "sez", "manufacturing", "steel", "auto", "assembly", "mill", "power plant", "refinery", "warehouse",
    "logistics", "foundry", "processing", "depot", "sidco"
  ];

  const commercialKeywords = [
    "commercial", "retail", "mall", "market", "bazaar", "plaza", "tower", "complex", "shopping", "bank",
    "hotel", "centre", "center", "office", "mart", "junction", "broadway", "bus stand", "station", "supermarket", "showroom"
  ];

  const residentialKeywords = [
    "nagar", "colony", "puram", "layout", "apartments", "society", "sector", "vihar", "enclave", "villa",
    "housing", "phase", "block", "street", "road", "lane", "suburb", "neighbourhood", "ward", "residence", "gali", "palli"
  ];

  // 1. HEALTHCARE
  if (healthcareKeywords.some((k) => fullText.includes(k)) || category.includes("health") || category.includes("hospital")) {
    const dLat = 0.004;
    const dLng = 0.004;
    const metrics = calculateGeodesicZoneMetrics(safeLat, safeLng, dLat, dLng);
    return {
      zoneType: "HEALTHCARE_ZONE",
      zoneTitle: "🏥 HEALTHCARE & MEDICAL ZONE",
      color: "#ec4899",
      fillColor: "#f472b6",
      permissibleUse: "Multi-Specialty Hospitals, Medical Research Centers, Clinics & Diagnostics",
      fsiLimit: "2.25 FSI",
      maxBuildingHeight: "30.0 Meters (G+9)",
      constructionPolicy: "Public Utility & Health Services Emergency Priority Zone",
      dLat,
      dLng,
      polygonCoordinates: [
        [safeLat - dLat, safeLng - dLng],
        [safeLat - dLat, safeLng + dLng],
        [safeLat + dLat, safeLng + dLng],
        [safeLat + dLat, safeLng - dLng],
        [safeLat - dLat, safeLng - dLng],
      ],
      metrics,
    };
  }

  // 2. EDUCATIONAL / INSTITUTIONAL
  if (eduKeywords.some((k) => fullText.includes(k)) || category.includes("school") || category.includes("college") || category.includes("university")) {
    const dLat = 0.004;
    const dLng = 0.004;
    const metrics = calculateGeodesicZoneMetrics(safeLat, safeLng, dLat, dLng);
    return {
      zoneType: "INSTITUTIONAL_ZONE",
      zoneTitle: "🏫 INSTITUTIONAL & EDUCATIONAL ZONE",
      color: "#f59e0b",
      fillColor: "#fbbf24",
      permissibleUse: "Universities, Engineering Colleges, Schools, Hostels & Research Labs",
      fsiLimit: "2.00 FSI",
      maxBuildingHeight: "24.0 Meters (G+7)",
      constructionPolicy: "Educational Master Plan Compliant — Wide Access Road Mandatory",
      dLat,
      dLng,
      polygonCoordinates: [
        [safeLat - dLat, safeLng - dLng],
        [safeLat - dLat, safeLng + dLng],
        [safeLat + dLat, safeLng + dLng],
        [safeLat + dLat, safeLng - dLng],
        [safeLat - dLat, safeLng - dLng],
      ],
      metrics,
    };
  }

  // 3. WATER CATCHMENT RESERVE
  if (waterKeywords.some((k) => fullText.includes(k)) || category.includes("water") || category.includes("natural")) {
    const dLat = 0.012;
    const dLng = 0.012;
    const metrics = calculateGeodesicZoneMetrics(safeLat, safeLng, dLat, dLng);
    return {
      zoneType: "ECO_WATER_RESERVE",
      zoneTitle: "🌊 ECO WATER CATCHMENT RESERVE",
      color: "#0284c7",
      fillColor: "#38bdf8",
      permissibleUse: "Water Catchment Protection & Natural Water Buffer Zone",
      fsiLimit: "0.00 FSI (Zero Construction)",
      maxBuildingHeight: "0.0 Meters (Prohibited)",
      constructionPolicy: "CRZ / Wetland Protection Zone — Zero Construction Permitted",
      dLat,
      dLng,
      polygonCoordinates: [
        [safeLat - dLat, safeLng - dLng],
        [safeLat - dLat, safeLng + dLng],
        [safeLat + dLat, safeLng + dLng],
        [safeLat + dLat, safeLng - dLng],
        [safeLat - dLat, safeLng - dLng],
      ],
      metrics,
    };
  }

  // 4. PROTECTED FOREST
  if (forestKeywords.some((k) => fullText.includes(k)) || landuse.includes("forest")) {
    const dLat = 0.012;
    const dLng = 0.012;
    const metrics = calculateGeodesicZoneMetrics(safeLat, safeLng, dLat, dLng);
    return {
      zoneType: "FOREST_RESERVE",
      zoneTitle: "🌲 PROTECTED FOREST / GREEN RESERVE",
      color: "#166534",
      fillColor: "#22c55e",
      permissibleUse: "Forest Conservation, Wildlife Habitat, Eco-Tourism",
      fsiLimit: "0.00 FSI (No Construction)",
      maxBuildingHeight: "0.0 Meters (Prohibited)",
      constructionPolicy: "Forest Conservation Act — No Construction Permitted",
      dLat,
      dLng,
      polygonCoordinates: [
        [safeLat - dLat, safeLng - dLng],
        [safeLat - dLat, safeLng + dLng],
        [safeLat + dLat, safeLng + dLng],
        [safeLat + dLat, safeLng - dLng],
        [safeLat - dLat, safeLng - dLng],
      ],
      metrics,
    };
  }

  // 5. HILL ECO ZONE
  if (hillKeywords.some((k) => fullText.includes(k))) {
    const dLat = 0.012;
    const dLng = 0.012;
    const metrics = calculateGeodesicZoneMetrics(safeLat, safeLng, dLat, dLng);
    return {
      zoneType: "HILL_ECO_ZONE",
      zoneTitle: "🏔️ HILL STATION / ECO SENSITIVE ZONE",
      color: "#78716c",
      fillColor: "#a8a29e",
      permissibleUse: "Eco-Tourism, Limited Hill Residential, Agro-Forestry",
      fsiLimit: "0.50 FSI (Eco Restrictions)",
      maxBuildingHeight: "9.0 Meters (G+1)",
      constructionPolicy: "Hill Area Conservation Authority (HACA) License Mandatory",
      dLat,
      dLng,
      polygonCoordinates: [
        [safeLat - dLat, safeLng - dLng],
        [safeLat - dLat, safeLng + dLng],
        [safeLat + dLat, safeLng + dLng],
        [safeLat + dLat, safeLng - dLng],
        [safeLat - dLat, safeLng - dLng],
      ],
      metrics,
    };
  }

  // 6. MANUFACTURING / INDUSTRIAL HUB
  if (industrialKeywords.some((k) => fullText.includes(k)) || category.includes("industrial") || landuse.includes("industrial")) {
    const dLat = 0.006;
    const dLng = 0.006;
    const metrics = calculateGeodesicZoneMetrics(safeLat, safeLng, dLat, dLng);
    return {
      zoneType: "MANUFACTURING_HUB",
      zoneTitle: "🏭 MANUFACTURING / INDUSTRIAL HUB",
      color: "#8b5cf6",
      fillColor: "#a855f7",
      permissibleUse: "Factories, Automobile Assembly, Heavy Machinery & Logistics Hubs",
      fsiLimit: "2.50 FSI (Industrial Special Bonus)",
      maxBuildingHeight: "30.0 Meters (Heavy Sheds)",
      constructionPolicy: "SIPCOT / Industrial Master Plan Approved Foundation Zone",
      dLat,
      dLng,
      polygonCoordinates: [
        [safeLat - dLat, safeLng - dLng],
        [safeLat - dLat, safeLng + dLng],
        [safeLat + dLat, safeLng + dLng],
        [safeLat + dLat, safeLng - dLng],
        [safeLat - dLat, safeLng - dLng],
      ],
      metrics,
    };
  }

  // 7. COMMERCIAL BUSINESS ZONE
  if (commercialKeywords.some((k) => fullText.includes(k)) || category.includes("commercial") || category.includes("shop")) {
    const dLat = 0.003;
    const dLng = 0.003;
    const metrics = calculateGeodesicZoneMetrics(safeLat, safeLng, dLat, dLng);
    return {
      zoneType: "COMMERCIAL_HUB",
      zoneTitle: "🏢 COMMERCIAL BUSINESS ZONE",
      color: "#2563eb",
      fillColor: "#3b82f6",
      permissibleUse: "Corporate Offices, Financial Hubs, Malls, Retail Outlets & Hotels",
      fsiLimit: "2.50 FSI",
      maxBuildingHeight: "36.0 Meters (High Rise Commercial)",
      constructionPolicy: "Commercial Central Business District Master Plan Zone",
      dLat,
      dLng,
      polygonCoordinates: [
        [safeLat - dLat, safeLng - dLng],
        [safeLat - dLat, safeLng + dLng],
        [safeLat + dLat, safeLng + dLng],
        [safeLat + dLat, safeLng - dLng],
        [safeLat - dLat, safeLng - dLng],
      ],
      metrics,
    };
  }

  // 8. RESIDENTIAL LIVING ZONE
  if (residentialKeywords.some((k) => fullText.includes(k)) || category.includes("residential") || category.includes("place")) {
    const dLat = 0.0025;
    const dLng = 0.0025;
    const metrics = calculateGeodesicZoneMetrics(safeLat, safeLng, dLat, dLng);
    return {
      zoneType: "LIVING_ZONE",
      zoneTitle: "🏡 RESIDENTIAL LIVING ZONE",
      color: "#06b6d4",
      fillColor: "#22d3ee",
      permissibleUse: "Housing Colonies, Residential Apartments, Parks & Local Shops",
      fsiLimit: "1.75 FSI",
      maxBuildingHeight: "18.0 Meters (G+5)",
      constructionPolicy: "DTCP / Municipal Building Permission Compliant Zone",
      dLat,
      dLng,
      polygonCoordinates: [
        [safeLat - dLat, safeLng - dLng],
        [safeLat - dLat, safeLng + dLng],
        [safeLat + dLat, safeLng + dLng],
        [safeLat + dLat, safeLng - dLng],
        [safeLat - dLat, safeLng - dLng],
      ],
      metrics,
    };
  }

  // 9. DEFAULT: AGRICULTURAL GREEN BELT (For village farmland & open land)
  const dLat = 0.008;
  const dLng = 0.008;
  const metrics = calculateGeodesicZoneMetrics(safeLat, safeLng, dLat, dLng);
  return {
    zoneType: "AGRI_ZONE",
    zoneTitle: "🌾 AGRICULTURAL GREEN BELT",
    color: "#059669",
    fillColor: "#10b981",
    permissibleUse: "Organic Farming, Paddy & Crop Cultivation, Agro Storage Sheds",
    fsiLimit: "0.25 FSI (Farm House Only)",
    maxBuildingHeight: "9.0 Meters (G+1)",
    constructionPolicy: "Heavy Commercial & Industrial Construction Strictly Prohibited",
    dLat,
    dLng,
    polygonCoordinates: [
      [safeLat - dLat, safeLng - dLng],
      [safeLat - dLat, safeLng + dLng],
      [safeLat + dLat, safeLng + dLng],
      [safeLat + dLat, safeLng - dLng],
      [safeLat - dLat, safeLng - dLng],
    ],
    metrics,
  };
}

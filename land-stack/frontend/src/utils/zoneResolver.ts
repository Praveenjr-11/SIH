/**
 * SIH 2026 Real-Data Master Plan Zone & Spatial Scope Resolver
 * Dynamically resolves Master Plan Zone Regulation and Spatial Zone Scope size
 * from real location display names, OpenStreetMap categories, and place attributes.
 *
 * Uses keyword matching on the FULL reverse-geocoded Nominatim data to correctly
 * classify any location in India into its proper Master Plan Zone.
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
 * Zone Scope Size Configuration
 * Maps every zone type to its correct dLat/dLng spatial scope extent.
 * Used to compute accurate geodesic perimeter, area, and radial buffer.
 */
export const ZONE_SCOPE_MAP: Record<string, { dLat: number; dLng: number }> = {
  // Values represent the indicative zone radius drawn on the map around the clicked point.
  // ~0.001° latitude ≈ 111 m | ~0.002° ≈ 222 m | ~0.003° ≈ 330 m
  HEALTHCARE_ZONE:     { dLat: 0.0015, dLng: 0.0015 }, // ~165m — specific building/campus
  INSTITUTIONAL_ZONE:  { dLat: 0.0018, dLng: 0.0018 }, // ~200m — school/college campus
  ECO_WATER_RESERVE:   { dLat: 0.0030, dLng: 0.0030 }, // ~330m — lake / reservoir buffer
  FOREST_RESERVE:      { dLat: 0.0040, dLng: 0.0040 }, // ~440m — forest patch
  HILL_ECO_ZONE:       { dLat: 0.0040, dLng: 0.0040 }, // ~440m — eco-sensitive hill zone
  MANUFACTURING_HUB:   { dLat: 0.0025, dLng: 0.0025 }, // ~275m — industrial plot / SIPCOT unit
  COMMERCIAL_HUB:      { dLat: 0.0015, dLng: 0.0015 }, // ~165m — commercial block
  LIVING_ZONE:         { dLat: 0.0012, dLng: 0.0012 }, // ~135m — residential plot cluster
  GOVERNMENT_ZONE:     { dLat: 0.0015, dLng: 0.0015 }, // ~165m — government premises
  TRANSPORT_HUB:       { dLat: 0.0020, dLng: 0.0020 }, // ~220m — station/terminal area
  RELIGIOUS_HERITAGE:  { dLat: 0.0012, dLng: 0.0012 }, // ~135m — temple/church premises
  AGRI_ZONE:           { dLat: 0.0030, dLng: 0.0030 }, // ~330m — field parcel
};

/**
 * Get scope size for a given zone type or location type.
 * Uses administrative level or place type if available to accurately size the spatial scope for cities, districts, states, etc.
 */
export function getZoneScopeConfig(zoneType: string, addressDetails?: Record<string, any>): { dLat: number; dLng: number } {
  // Always use the zone's own scope — never inflate to district/state size.
  // Admin boundary sizes are NOT used for zone indication on map.
  return ZONE_SCOPE_MAP[zoneType] || ZONE_SCOPE_MAP.AGRI_ZONE;
}

/**
 * Compute proper polygon coordinates and geodesic metrics for a given zone type at (lat, lng).
 */
export function computeZoneGeometry(
  lat: number,
  lng: number,
  zoneType: string,
  addressDetails?: Record<string, any>
): { dLat: number; dLng: number; polygonCoordinates: [number, number][]; metrics: GeodesicZoneMetrics } {
  const scope = getZoneScopeConfig(zoneType, addressDetails);
  const dLat = scope.dLat;
  const dLng = scope.dLng;
  const metrics = calculateGeodesicZoneMetrics(lat, lng, dLat, dLng);

  // Generate a smooth 16-point circular polygon buffer instead of a rectangle
  const numPoints = 16;
  const polygonCoordinates: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const pLat = lat + dLat * Math.sin(angle);
    const pLng = lng + dLng * Math.cos(angle);
    polygonCoordinates.push([pLat, pLng]);
  }

  return { dLat, dLng, polygonCoordinates, metrics };
}

// ─── Keyword Dictionaries ─────────────────────────────────────

const healthcareKeywords = [
  "hospital", "healthcare", "clinic", "nursing home", "medical center", "medical college",
  "dispensary", "health center", "phc", "sanatorium", "trauma", "apollo", "fortis", "aiims",
  "manipal", "miot", "meenakshi", "kauvery", "narayana", "medica", "aster", "max hospital",
  "care hospital", "blood bank", "diagnostic", "pathology", "pharmacy", "drugstore",
];

const eduKeywords = [
  "school", "college", "university", "institute", "academy", "polytechnic", "campus", "vidyalaya",
  "matriculation", "convent", "educational", "iit", "nit", "bits", "iim", "iiit", "high school",
  "primary school", "cbse", "icse", "kendriya", "navodaya", "madrasa", "montessori", "kindergarten",
  "nursery", "pre-school", "engineering college", "arts college", "law college", "b.ed",
];

const waterKeywords = [
  "lake", "river", "water", "sea", "ocean", "beach", "dam", "reservoir", "basin", "canal",
  "kulam", "nadi", "erikarai", "pond", "wetland", "coast", "creek", "stream", "tank",
  "catchment", "marina", "backwater", "estuary", "lagoon", "kere", "tataka", "sarovar",
  "jheel", "tal", "bund", "eri", "falls", "waterfall",
];

const forestKeywords = [
  "forest", "reserve forest", "sanctuary", "national park", "jungle", "kadu", "vana",
  "wildlife", "wood", "reserve", "biosphere", "tiger reserve", "elephant reserve",
  "deer park", "bird sanctuary", "botanical garden", "arboretum", "plantation", "grove",
  "mangrove", "shola",
];

const hillKeywords = [
  "hill station", "mountain", "peak", "ghat", "shola", "high range", "ooty", "kodaikanal",
  "coorg", "munnar", "yercaud", "coonoor", "valparai", "mahabaleshwar", "mount abu",
  "mussoorie", "shimla", "nainital", "darjeeling", "manali", "leh", "ladakh", "gangtok",
  "elevation", "altitude", "highland", "upland",
];

const industrialKeywords = [
  "industrial", "factory", "sipcot", "midc", "gidc", "riico", "kiadb", "tidco", "estate",
  "tech park", "sez", "manufacturing", "steel", "auto", "assembly", "mill", "power plant",
  "refinery", "warehouse", "logistics", "foundry", "processing", "depot", "sidco", "bhel",
  "ongc", "iocl", "bpcl", "hpcl", "ntpc", "cement", "chemical", "pharmaceutical",
  "textile mill", "sugar mill", "spinning mill", "it park", "technopark", "infosys campus",
  "wipro", "tcs", "elcot",
];

const commercialKeywords = [
  "commercial", "retail", "mall", "market", "bazaar", "plaza", "tower", "complex", "shopping",
  "bank", "hotel", "centre", "center", "office", "mart", "junction", "broadway", "bus stand",
  "station", "supermarket", "showroom", "cinema", "multiplex", "restaurant", "cafe",
  "dhaba", "lodge", "resort", "jewellery", "textile", "emporium", "petrol pump", "fuel",
  "petrol", "diesel", "atm", "sbi", "hdfc", "icici", "axis bank", "canara",
];

const residentialKeywords = [
  "nagar", "colony", "puram", "layout", "apartments", "society", "sector", "vihar",
  "enclave", "villa", "housing", "phase", "block", "street", "road", "lane", "suburb",
  "neighbourhood", "ward", "residence", "gali", "palli", "pet", "pettai", "theru",
  "salai", "cross", "main road", "bye lane", "chawl", "flat", "township", "palya",
  "halli", "pur", "ganj", "mohalla", "basti", "pada", "wadi",
];

const governmentKeywords = [
  "collectorate", "taluk office", "tahsildar", "sub-registrar", "sro", "court",
  "government", "municipality", "corporation", "panchayat", "block development",
  "revenue office", "district office", "police station", "fire station", "post office",
  "ration shop", "fair price", "pwd", "tneb", "electricity", "water board",
  "secretariat", "vidhana soudha", "mantralaya", "civil supplies",
  "registrar", "treasury", "rto", "passport office", "jail", "prison", "cantonment",
  "military", "army", "navy", "air force", "defence",
];

const transportKeywords = [
  "railway station", "airport", "aerodrome", "bus terminal", "bus depot",
  "port", "harbor", "harbour", "metro station", "freight", "cargo", "transit hub",
];

const religiousKeywords = [
  "temple", "kovil", "mandir", "church", "cathedral", "mosque", "masjid", "dargah",
  "gurudwara", "pagoda", "monastery", "ashram", "math", "mutt", "shrine", "tomb",
  "memorial", "fort", "palace", "heritage", "monument", "archaeological", "asi",
  "museum", "pilgrimage", "devasthanam", "tirumala", "meenakshi", "jagannath",
  "varanasi", "haridwar", "rishikesh", "bodh gaya", "golden temple",
];

// ─── Zone Classification Functions ─────────────────────────────

interface ZoneClassification {
  zoneType: string;
  zoneTitle: string;
  color: string;
  fillColor: string;
  permissibleUse: string;
  fsiLimit: string;
  maxBuildingHeight: string;
  constructionPolicy: string;
}

function classifyZone(fullText: string, category: string, landuse: string): ZoneClassification {
  // 1. HEALTHCARE
  if (healthcareKeywords.some(k => fullText.includes(k)) || category.includes("health") || category.includes("hospital")) {
    return {
      zoneType: "HEALTHCARE_ZONE",
      zoneTitle: "🏥 HEALTHCARE & MEDICAL ZONE",
      color: "#ec4899",
      fillColor: "#f472b6",
      permissibleUse: "Multi-Specialty Hospitals, Medical Research Centers, Clinics & Diagnostics",
      fsiLimit: "2.25 FSI",
      maxBuildingHeight: "30.0 Meters (G+9)",
      constructionPolicy: "Public Utility & Health Services Emergency Priority Zone",
    };
  }

  // 2. EDUCATIONAL / INSTITUTIONAL
  if (eduKeywords.some(k => fullText.includes(k)) || category.includes("school") || category.includes("college") || category.includes("university") || landuse.includes("education")) {
    return {
      zoneType: "INSTITUTIONAL_ZONE",
      zoneTitle: "🏫 INSTITUTIONAL & EDUCATIONAL ZONE",
      color: "#f59e0b",
      fillColor: "#fbbf24",
      permissibleUse: "Universities, Engineering Colleges, Schools, Hostels & Research Labs",
      fsiLimit: "2.00 FSI",
      maxBuildingHeight: "24.0 Meters (G+7)",
      constructionPolicy: "Educational Master Plan Compliant — Wide Access Road Mandatory",
    };
  }

  // 3. GOVERNMENT / CIVIC ZONE
  if (governmentKeywords.some(k => fullText.includes(k)) || category.includes("government") || category.includes("office")) {
    return {
      zoneType: "GOVERNMENT_ZONE",
      zoneTitle: "🏛️ GOVERNMENT & CIVIC ZONE",
      color: "#7c3aed",
      fillColor: "#a78bfa",
      permissibleUse: "Government Offices, Civic Administration, Courts, Revenue & Regulatory Bodies",
      fsiLimit: "2.00 FSI (Govt Special)",
      maxBuildingHeight: "30.0 Meters (G+9)",
      constructionPolicy: "State / Central Government Authorized Construction Zone",
    };
  }

  // 4. TRANSPORT HUB
  if (transportKeywords.some(k => fullText.includes(k)) || category.includes("railway") || category.includes("aeroway")) {
    return {
      zoneType: "TRANSPORT_HUB",
      zoneTitle: "🚉 TRANSPORT & INFRASTRUCTURE HUB",
      color: "#0891b2",
      fillColor: "#22d3ee",
      permissibleUse: "Railways, Airports, Bus Terminals, National Highways & Freight Corridors",
      fsiLimit: "2.00 FSI (Infrastructure)",
      maxBuildingHeight: "24.0 Meters (Transit Oriented)",
      constructionPolicy: "National Infrastructure Pipeline — Central / State Transit Authority Zone",
    };
  }

  // 5. RELIGIOUS / HERITAGE
  if (religiousKeywords.some(k => fullText.includes(k)) || category.includes("place_of_worship") || category.includes("historic") || category.includes("tourism")) {
    return {
      zoneType: "RELIGIOUS_HERITAGE",
      zoneTitle: "🛕 RELIGIOUS & HERITAGE ZONE",
      color: "#dc2626",
      fillColor: "#f87171",
      permissibleUse: "Religious Institutions, Heritage Conservation, Pilgrimage Tourism",
      fsiLimit: "1.00 FSI (Heritage Restricted)",
      maxBuildingHeight: "12.0 Meters (G+2)",
      constructionPolicy: "ASI / State Heritage Conservation Authority Restrictions Apply",
    };
  }

  // 6. WATER CATCHMENT RESERVE
  if (waterKeywords.some(k => fullText.includes(k)) || category.includes("water") || category.includes("natural") || category.includes("waterway")) {
    return {
      zoneType: "ECO_WATER_RESERVE",
      zoneTitle: "🌊 ECO WATER CATCHMENT RESERVE",
      color: "#0284c7",
      fillColor: "#38bdf8",
      permissibleUse: "Water Catchment Protection & Natural Water Buffer Zone",
      fsiLimit: "0.00 FSI (Zero Construction)",
      maxBuildingHeight: "0.0 Meters (Prohibited)",
      constructionPolicy: "CRZ / Wetland Protection Zone — Zero Construction Permitted",
    };
  }

  // 7. PROTECTED FOREST
  if (forestKeywords.some(k => fullText.includes(k)) || landuse.includes("forest") || landuse.includes("nature_reserve")) {
    return {
      zoneType: "FOREST_RESERVE",
      zoneTitle: "🌲 PROTECTED FOREST / GREEN RESERVE",
      color: "#166534",
      fillColor: "#22c55e",
      permissibleUse: "Forest Conservation, Wildlife Habitat, Eco-Tourism",
      fsiLimit: "0.00 FSI (No Construction)",
      maxBuildingHeight: "0.0 Meters (Prohibited)",
      constructionPolicy: "Forest Conservation Act — No Construction Permitted",
    };
  }

  // 8. HILL ECO ZONE
  if (hillKeywords.some(k => fullText.includes(k))) {
    return {
      zoneType: "HILL_ECO_ZONE",
      zoneTitle: "🏔️ HILL STATION / ECO SENSITIVE ZONE",
      color: "#78716c",
      fillColor: "#a8a29e",
      permissibleUse: "Eco-Tourism, Limited Hill Residential, Agro-Forestry",
      fsiLimit: "0.50 FSI (Eco Restrictions)",
      maxBuildingHeight: "9.0 Meters (G+1)",
      constructionPolicy: "Hill Area Conservation Authority (HACA) License Mandatory",
    };
  }

  // 9. MANUFACTURING / INDUSTRIAL HUB
  if (industrialKeywords.some(k => fullText.includes(k)) || category.includes("industrial") || landuse.includes("industrial") || landuse.includes("quarry") || landuse.includes("construction")) {
    return {
      zoneType: "MANUFACTURING_HUB",
      zoneTitle: "🏭 MANUFACTURING / INDUSTRIAL HUB",
      color: "#8b5cf6",
      fillColor: "#a855f7",
      permissibleUse: "Factories, Automobile Assembly, Heavy Machinery & Logistics Hubs",
      fsiLimit: "2.50 FSI (Industrial Special Bonus)",
      maxBuildingHeight: "30.0 Meters (Heavy Sheds)",
      constructionPolicy: "SIPCOT / Industrial Master Plan Approved Foundation Zone",
    };
  }

  // 10. COMMERCIAL BUSINESS ZONE
  if (commercialKeywords.some(k => fullText.includes(k)) || category.includes("commercial") || category.includes("shop") || category.includes("amenity") || landuse.includes("commercial") || landuse.includes("retail")) {
    return {
      zoneType: "COMMERCIAL_HUB",
      zoneTitle: "🏢 COMMERCIAL BUSINESS ZONE",
      color: "#2563eb",
      fillColor: "#3b82f6",
      permissibleUse: "Corporate Offices, Financial Hubs, Malls, Retail Outlets & Hotels",
      fsiLimit: "2.50 FSI",
      maxBuildingHeight: "36.0 Meters (High Rise Commercial)",
      constructionPolicy: "Commercial Central Business District Master Plan Zone",
    };
  }

  // 11. RESIDENTIAL LIVING ZONE
  if (residentialKeywords.some(k => fullText.includes(k)) || category.includes("residential") || category.includes("place") || category.includes("building") || landuse.includes("residential") || landuse.includes("built-up")) {
    return {
      zoneType: "LIVING_ZONE",
      zoneTitle: "🏡 RESIDENTIAL LIVING ZONE",
      color: "#06b6d4",
      fillColor: "#22d3ee",
      permissibleUse: "Housing Colonies, Residential Apartments, Parks & Local Shops",
      fsiLimit: "1.75 FSI",
      maxBuildingHeight: "18.0 Meters (G+5)",
      constructionPolicy: "DTCP / Municipal Building Permission Compliant Zone",
    };
  }

  // 12. DEFAULT: AGRICULTURAL GREEN BELT
  return {
    zoneType: "AGRI_ZONE",
    zoneTitle: "🌾 AGRICULTURAL GREEN BELT",
    color: "#059669",
    fillColor: "#10b981",
    permissibleUse: "Organic Farming, Paddy & Crop Cultivation, Agro Storage Sheds",
    fsiLimit: "0.25 FSI (Farm House Only)",
    maxBuildingHeight: "9.0 Meters (G+1)",
    constructionPolicy: "Heavy Commercial & Industrial Construction Strictly Prohibited",
  };
}

/**
 * Direct OSM tag → zone type mapping.
 * These come from Nominatim's category/type fields which map to OSM primary tags.
 * This is the most accurate classification — OSM category is ground truth.
 */
const OSM_CATEGORY_MAP: Record<string, string> = {
  // amenity
  "amenity/hospital": "HEALTHCARE_ZONE",
  "amenity/clinic": "HEALTHCARE_ZONE",
  "amenity/doctors": "HEALTHCARE_ZONE",
  "amenity/pharmacy": "HEALTHCARE_ZONE",
  "amenity/nursing_home": "HEALTHCARE_ZONE",
  "amenity/health_post": "HEALTHCARE_ZONE",
  "amenity/university": "INSTITUTIONAL_ZONE",
  "amenity/college": "INSTITUTIONAL_ZONE",
  "amenity/school": "INSTITUTIONAL_ZONE",
  "amenity/kindergarten": "INSTITUTIONAL_ZONE",
  "amenity/library": "INSTITUTIONAL_ZONE",
  "amenity/research_institute": "INSTITUTIONAL_ZONE",
  "amenity/police": "GOVERNMENT_ZONE",
  "amenity/fire_station": "GOVERNMENT_ZONE",
  "amenity/courthouse": "GOVERNMENT_ZONE",
  "amenity/townhall": "GOVERNMENT_ZONE",
  "amenity/post_office": "GOVERNMENT_ZONE",
  "amenity/bank": "COMMERCIAL_HUB",
  "amenity/restaurant": "COMMERCIAL_HUB",
  "amenity/cafe": "COMMERCIAL_HUB",
  "amenity/marketplace": "COMMERCIAL_HUB",
  "amenity/shopping_mall": "COMMERCIAL_HUB",
  "amenity/fuel": "COMMERCIAL_HUB",
  "amenity/bus_station": "TRANSPORT_HUB",
  "amenity/train_station": "TRANSPORT_HUB",
  "amenity/ferry_terminal": "TRANSPORT_HUB",
  "amenity/parking": "TRANSPORT_HUB",
  "amenity/place_of_worship": "RELIGIOUS_HERITAGE",
  "amenity/temple": "RELIGIOUS_HERITAGE",
  "amenity/church": "RELIGIOUS_HERITAGE",
  "amenity/mosque": "RELIGIOUS_HERITAGE",
  "amenity/stadium": "INSTITUTIONAL_ZONE",
  "amenity/sports_centre": "INSTITUTIONAL_ZONE",
  // landuse
  "landuse/hospital": "HEALTHCARE_ZONE",
  "landuse/education": "INSTITUTIONAL_ZONE",
  "landuse/institutional": "INSTITUTIONAL_ZONE",
  "landuse/industrial": "MANUFACTURING_HUB",
  "landuse/quarry": "MANUFACTURING_HUB",
  "landuse/commercial": "COMMERCIAL_HUB",
  "landuse/retail": "COMMERCIAL_HUB",
  "landuse/residential": "LIVING_ZONE",
  "landuse/farmland": "AGRI_ZONE",
  "landuse/farmyard": "AGRI_ZONE",
  "landuse/orchard": "AGRI_ZONE",
  "landuse/forest": "FOREST_RESERVE",
  "landuse/nature_reserve": "FOREST_RESERVE",
  "landuse/recreation_ground": "INSTITUTIONAL_ZONE",
  "landuse/cemetery": "RELIGIOUS_HERITAGE",
  // natural
  "natural/water": "ECO_WATER_RESERVE",
  "natural/wetland": "ECO_WATER_RESERVE",
  "natural/wood": "FOREST_RESERVE",
  "natural/scrub": "FOREST_RESERVE",
  "natural/beach": "ECO_WATER_RESERVE",
  "natural/peak": "HILL_ECO_ZONE",
  "natural/ridge": "HILL_ECO_ZONE",
  // leisure
  "leisure/park": "INSTITUTIONAL_ZONE",
  "leisure/garden": "INSTITUTIONAL_ZONE",
  "leisure/stadium": "INSTITUTIONAL_ZONE",
  "leisure/swimming_pool": "INSTITUTIONAL_ZONE",
  "leisure/sports_centre": "INSTITUTIONAL_ZONE",
  "leisure/golf_course": "INSTITUTIONAL_ZONE",
  // railway / aeroway
  "railway/station": "TRANSPORT_HUB",
  "railway/halt": "TRANSPORT_HUB",
  "aeroway/aerodrome": "TRANSPORT_HUB",
  "aeroway/terminal": "TRANSPORT_HUB",
  // tourism
  "tourism/museum": "RELIGIOUS_HERITAGE",
  "tourism/attraction": "RELIGIOUS_HERITAGE",
  "tourism/hotel": "COMMERCIAL_HUB",
  // building
  "building/hospital": "HEALTHCARE_ZONE",
  "building/school": "INSTITUTIONAL_ZONE",
  "building/university": "INSTITUTIONAL_ZONE",
  "building/government": "GOVERNMENT_ZONE",
  "building/industrial": "MANUFACTURING_HUB",
  "building/commercial": "COMMERCIAL_HUB",
  "building/retail": "COMMERCIAL_HUB",
  "building/house": "LIVING_ZONE",
  "building/apartments": "LIVING_ZONE",
  "building/residential": "LIVING_ZONE",
  // place
  "place/village": "LIVING_ZONE",
  "place/hamlet": "LIVING_ZONE",
  "place/suburb": "LIVING_ZONE",
  "place/neighbourhood": "LIVING_ZONE",
  "place/town": "LIVING_ZONE",
  "place/city": "COMMERCIAL_HUB",
};

/**
 * Resolves the authentic Master Plan Zone Regulation & Dynamic Spatial Zone Scope
 * for any (lat, lng) point in India given reverse-geocoded place details.
 *
 * Priority:
 * 1. Direct OSM category/type mapping (most accurate — ground truth from OSM tags)
 * 2. Keyword scan on full display name + address fields
 * 3. AGRI_ZONE fallback
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
  const village = (addressDetails?.village || addressDetails?.hamlet || addressDetails?.town || addressDetails?.villageOrCity || "").toLowerCase();
  const subdistrict = (addressDetails?.subdistrict || addressDetails?.suburb || addressDetails?.town || "").toLowerCase();
  const district = (addressDetails?.district || addressDetails?.county || addressDetails?.state_district || addressDetails?.city || "").toLowerCase();
  const state = (addressDetails?.state || "").toLowerCase();
  const category = (addressDetails?.category || "").toLowerCase();
  const osmType = (addressDetails?.type || "").toLowerCase();
  const landuse = (addressDetails?.landuse || "").toLowerCase();

  const fullText = `${name} ${village} ${subdistrict} ${district} ${state} ${category} ${osmType} ${landuse}`;

  // ── Priority 1: Direct OSM category/type mapping ──────────────
  // Try "category/type" key first (most specific), then "category" alone
  const osmKey = category && osmType ? `${category}/${osmType}` : "";
  const osmCategoryOnly = category ? `${category}/${osmType}` : "";
  let zoneTypeFromOSM: string | null = null;

  if (osmKey && OSM_CATEGORY_MAP[osmKey]) {
    zoneTypeFromOSM = OSM_CATEGORY_MAP[osmKey];
  } else if (category) {
    // Try to match just by category prefix
    const catMatch = Object.keys(OSM_CATEGORY_MAP).find(
      (k) => k.startsWith(category + "/") && OSM_CATEGORY_MAP[k]
    );
    if (catMatch) zoneTypeFromOSM = OSM_CATEGORY_MAP[catMatch];
  }
  if (landuse && !zoneTypeFromOSM) {
    const luKey = `landuse/${landuse}`;
    if (OSM_CATEGORY_MAP[luKey]) zoneTypeFromOSM = OSM_CATEGORY_MAP[luKey];
  }

  // ── Priority 2: Keyword classification ───────────────────────
  const classification = zoneTypeFromOSM
    ? getZoneConfigForType(zoneTypeFromOSM)
    : classifyZone(fullText, category, landuse);

  const { dLat, dLng, polygonCoordinates, metrics } = computeZoneGeometry(safeLat, safeLng, classification.zoneType, addressDetails);

  return {
    ...classification,
    dLat,
    dLng,
    polygonCoordinates,
    metrics,
  };
}

/**
 * Get a ZoneClassification config object for a known zoneType string.
 * Used when OSM category gives us the zone type directly.
 */
function getZoneConfigForType(zoneType: string): ZoneClassification {
  switch (zoneType) {
    case "HEALTHCARE_ZONE":
      return { zoneType, zoneTitle: "🏥 HEALTHCARE & MEDICAL ZONE", color: "#ec4899", fillColor: "#f472b6", permissibleUse: "Multi-Specialty Hospitals, Medical Research Centers, Clinics & Diagnostics", fsiLimit: "2.25 FSI", maxBuildingHeight: "30.0 Meters (G+9)", constructionPolicy: "Public Utility & Health Services Emergency Priority Zone" };
    case "INSTITUTIONAL_ZONE":
      return { zoneType, zoneTitle: "🏫 INSTITUTIONAL & EDUCATIONAL ZONE", color: "#f59e0b", fillColor: "#fbbf24", permissibleUse: "Universities, Engineering Colleges, Schools, Hostels & Research Labs", fsiLimit: "2.00 FSI", maxBuildingHeight: "24.0 Meters (G+7)", constructionPolicy: "Educational Master Plan Compliant — Wide Access Road Mandatory" };
    case "GOVERNMENT_ZONE":
      return { zoneType, zoneTitle: "🏛️ GOVERNMENT & CIVIC ZONE", color: "#7c3aed", fillColor: "#a78bfa", permissibleUse: "Government Offices, Civic Administration, Courts, Revenue & Regulatory Bodies", fsiLimit: "2.00 FSI (Govt Special)", maxBuildingHeight: "30.0 Meters (G+9)", constructionPolicy: "State / Central Government Authorized Construction Zone" };
    case "TRANSPORT_HUB":
      return { zoneType, zoneTitle: "🚉 TRANSPORT & INFRASTRUCTURE HUB", color: "#0891b2", fillColor: "#22d3ee", permissibleUse: "Railways, Airports, Bus Terminals, National Highways & Freight Corridors", fsiLimit: "2.00 FSI (Infrastructure)", maxBuildingHeight: "24.0 Meters (Transit Oriented)", constructionPolicy: "National Infrastructure Pipeline — Central / State Transit Authority Zone" };
    case "RELIGIOUS_HERITAGE":
      return { zoneType, zoneTitle: "🛕 RELIGIOUS & HERITAGE ZONE", color: "#dc2626", fillColor: "#f87171", permissibleUse: "Religious Institutions, Heritage Conservation, Pilgrimage Tourism", fsiLimit: "1.00 FSI (Heritage Restricted)", maxBuildingHeight: "12.0 Meters (G+2)", constructionPolicy: "ASI / State Heritage Conservation Authority Restrictions Apply" };
    case "ECO_WATER_RESERVE":
      return { zoneType, zoneTitle: "🌊 ECO WATER CATCHMENT RESERVE", color: "#0284c7", fillColor: "#38bdf8", permissibleUse: "Water Catchment Protection & Natural Water Buffer Zone", fsiLimit: "0.00 FSI (Zero Construction)", maxBuildingHeight: "0.0 Meters (Prohibited)", constructionPolicy: "CRZ / Wetland Protection Zone — Zero Construction Permitted" };
    case "FOREST_RESERVE":
      return { zoneType, zoneTitle: "🌲 PROTECTED FOREST / GREEN RESERVE", color: "#166534", fillColor: "#22c55e", permissibleUse: "Forest Conservation, Wildlife Habitat, Eco-Tourism", fsiLimit: "0.00 FSI (No Construction)", maxBuildingHeight: "0.0 Meters (Prohibited)", constructionPolicy: "Forest Conservation Act — No Construction Permitted" };
    case "HILL_ECO_ZONE":
      return { zoneType, zoneTitle: "🏔️ HILL STATION / ECO SENSITIVE ZONE", color: "#78716c", fillColor: "#a8a29e", permissibleUse: "Eco-Tourism, Limited Hill Residential, Agro-Forestry", fsiLimit: "0.50 FSI (Eco Restrictions)", maxBuildingHeight: "9.0 Meters (G+1)", constructionPolicy: "Hill Area Conservation Authority (HACA) License Mandatory" };
    case "MANUFACTURING_HUB":
      return { zoneType, zoneTitle: "🏭 MANUFACTURING / INDUSTRIAL HUB", color: "#8b5cf6", fillColor: "#a855f7", permissibleUse: "Factories, Automobile Assembly, Heavy Machinery & Logistics Hubs", fsiLimit: "2.50 FSI (Industrial Special Bonus)", maxBuildingHeight: "30.0 Meters (Heavy Sheds)", constructionPolicy: "SIPCOT / Industrial Master Plan Approved Foundation Zone" };
    case "COMMERCIAL_HUB":
      return { zoneType, zoneTitle: "🏢 COMMERCIAL BUSINESS ZONE", color: "#2563eb", fillColor: "#3b82f6", permissibleUse: "Corporate Offices, Financial Hubs, Malls, Retail Outlets & Hotels", fsiLimit: "2.50 FSI", maxBuildingHeight: "36.0 Meters (High Rise Commercial)", constructionPolicy: "Commercial Central Business District Master Plan Zone" };
    case "LIVING_ZONE":
      return { zoneType, zoneTitle: "🏡 RESIDENTIAL LIVING ZONE", color: "#06b6d4", fillColor: "#22d3ee", permissibleUse: "Housing Colonies, Residential Apartments, Parks & Local Shops", fsiLimit: "1.75 FSI", maxBuildingHeight: "18.0 Meters (G+5)", constructionPolicy: "DTCP / Municipal Building Permission Compliant Zone" };
    default:
      return { zoneType: "AGRI_ZONE", zoneTitle: "🌾 AGRICULTURAL GREEN BELT", color: "#059669", fillColor: "#10b981", permissibleUse: "Organic Farming, Paddy & Crop Cultivation, Agro Storage Sheds", fsiLimit: "0.25 FSI (Farm House Only)", maxBuildingHeight: "9.0 Meters (G+1)", constructionPolicy: "Heavy Commercial & Industrial Construction Strictly Prohibited" };
  }
}


/**
 * Resolve zone geometry from a backend zone type.
 * Used when the backend returns a more accurate zone classification from Overpass API data.
 */
export function resolveZoneWithBackendType(
  lat: number,
  lng: number,
  backendZoneType: string,
  backendZoning: any,
  addressDetails?: Record<string, any>
): MasterPlanZoneConfig {
  const { dLat, dLng, polygonCoordinates, metrics } = computeZoneGeometry(lat, lng, backendZoneType, addressDetails);

  return {
    zoneType: backendZoning.zoneType || backendZoneType,
    zoneTitle: backendZoning.zoneTitle || backendZoneType,
    color: backendZoning.color || "#059669",
    fillColor: backendZoning.fillColor || "#10b981",
    permissibleUse: backendZoning.permissibleUse || "",
    fsiLimit: backendZoning.fsiLimit || "N/A",
    maxBuildingHeight: backendZoning.maxBuildingHeight || "N/A",
    constructionPolicy: backendZoning.constructionPolicy || "",
    dLat,
    dLng,
    polygonCoordinates,
    metrics,
  };
}

import { SearchResult, ClickedLocation } from "@/types/gis";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

/**
 * Search locations across India using OpenStreetMap Nominatim Geocoding API
 */
export async function searchLocations(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const params = new URLSearchParams({
      format: "json",
      q: query.trim(),
      countrycodes: "in",
      addressdetails: "1",
      polygon_geojson: "1",
      limit: "6",
    });

    const response = await fetch(`${NOMINATIM_BASE}/search?${params.toString()}`, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "LAND-STACK-GIS-App/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API HTTP ${response.status}`);
    }

    const data: SearchResult[] = await response.json();
    return data;
  } catch (error) {
    console.error("GIS Geocoding search failed:", error);
    return [];
  }
}

/**
 * Reverse geocode clicked latitude and longitude to get FULL place details.
 * Returns all Nominatim fields so zoneResolver can do accurate keyword matching.
 * Also exposes osm_type / osm_id for subsequent Overpass geometry lookup.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<Partial<ClickedLocation>> {
  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: lat.toString(),
      lon: lng.toString(),
      addressdetails: "1",
      extratags: "1",
      namedetails: "1",
      polygon_geojson: "1",
      zoom: "18",
      "accept-language": "en",
    });

    const response = await fetch(`${NOMINATIM_BASE}/reverse?${params.toString()}`, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "LAND-STACK-GIS-App/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim Reverse API HTTP ${response.status}`);
    }

    const data = await response.json();
    const addr = data.address || {};
    const extratags = data.extratags || {};

    return {
      displayName: data.display_name || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
      geojson: data.geojson || null,
      // Expose raw Nominatim osm_type / osm_id for Overpass geometry lookup
      _osmType: data.osm_type || null,
      _osmId: data.osm_id || null,
      _nominatimCategory: data.category || null,
      _nominatimType: data.type || null,
      addressDetails: {
        village: addr.village || addr.hamlet || null,
        hamlet: addr.hamlet || null,
        town: addr.town || null,
        city: addr.city || null,
        suburb: addr.suburb || null,
        neighbourhood: addr.neighbourhood || null,
        county: addr.county || null,
        district: addr.county || addr.state_district || addr.city_district || null,
        subdistrict: addr.suburb || addr.town || addr.city || addr.municipality || null,
        state_district: addr.state_district || null,
        state: addr.state || "India",
        postcode: addr.postcode || null,
        country: addr.country || "India",
        category: data.category || null,
        type: data.type || null,
        landuse: extratags?.landuse || extratags?.["land_use"] || addr.landuse || null,
        villageOrCity: addr.village || addr.town || addr.city || addr.suburb || addr.neighbourhood || "Unknown Area",
        pincode: addr.postcode || null,
      },
    };
  } catch (error) {
    console.error("GIS Reverse Geocoding failed:", error);
    return {
      displayName: `Coordinates: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
      addressDetails: {
        villageOrCity: "Selected Coordinates",
        state: "India",
      },
    };
  }
}

/**
 * Fetch the EXACT OSM polygon geometry from Overpass API.
 *
 * Priority order:
 * 1. If osmType is "way" → fetch that specific way geometry
 * 2. If osmType is "relation" → fetch the relation's outer geometry
 * 3. If osmType is "node" → search for closest enclosing named polygon within 200m
 *
 * This gives real campus, lake, park, hospital and industrial unit outlines —
 * exactly like the actual feature boundary shown on the map.
 */
export async function fetchOverpassFeatureGeometry(
  osmType: string,
  osmId: number,
  lat: number,
  lng: number
): Promise<any | null> {
  try {
    let query = "";

    if (osmType === "way") {
      query = `[out:json][timeout:20];
way(${osmId});
out geom;`;
    } else if (osmType === "relation") {
      query = `[out:json][timeout:20];
relation(${osmId});
way(r);
out geom;`;
    } else {
      // Node: search for enclosing polygon features (amenity, landuse, natural, leisure, building)
      query = `[out:json][timeout:20];
(
  way["amenity"](around:250,${lat},${lng});
  way["landuse"](around:250,${lat},${lng});
  way["natural"](around:250,${lat},${lng});
  way["leisure"](around:250,${lat},${lng});
  way["building"](around:250,${lat},${lng});
  way["sport"](around:250,${lat},${lng});
  relation["amenity"](around:250,${lat},${lng});
  relation["landuse"](around:250,${lat},${lng});
  relation["leisure"](around:250,${lat},${lng});
);
out geom;`;
    }

    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) throw new Error(`Overpass HTTP ${response.status}`);
    const data = await response.json();
    const elements: any[] = data.elements || [];
    if (elements.length === 0) return null;

    // Filter elements that have actual polygon geometry
    const withGeom = elements.filter(
      (e: any) => e.geometry && Array.isArray(e.geometry) && e.geometry.length > 3
    );
    if (withGeom.length === 0) return null;

    // Score elements: prefer named features and those with most geometry nodes
    const scored = withGeom.map((e: any) => {
      let score = e.geometry.length;
      if (e.tags?.name) score += 1000; // Strong preference for named features
      if (e.tags?.amenity) score += 500;
      if (e.tags?.landuse) score += 300;
      if (e.tags?.natural) score += 300;
      if (e.tags?.leisure) score += 200;
      return { element: e, score };
    });

    const best = scored.sort((a, b) => b.score - a.score)[0].element;

    // Convert Overpass geometry (array of {lat, lon}) to GeoJSON Polygon
    const ring = best.geometry.map((pt: { lat: number; lon: number }) => [pt.lon, pt.lat]);
    // Ensure ring is closed
    if (
      ring.length > 0 &&
      (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])
    ) {
      ring.push([...ring[0]]);
    }
    if (ring.length < 4) return null;

    return {
      type: "Polygon",
      coordinates: [ring],
    };
  } catch (err) {
    console.warn("Overpass feature geometry fetch failed:", err);
    return null;
  }
}

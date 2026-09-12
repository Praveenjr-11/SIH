import { SearchResult, ClickedLocation } from "@/types/gis";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

/**
 * Search locations across India using OpenStreetMap Nominatim Geocoding API
 */
export async function searchLocations(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const params = new URLSearchParams({
      format: "json",
      q: query.trim(),
      countrycodes: "in", // Filter for India
      addressdetails: "1",
      polygon_geojson: "1", // Get actual boundary polygon for districts/cities
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
      addressDetails: {
        // Full Nominatim address fields
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
        // OSM classification fields — critical for zone identification
        category: data.category || null,
        type: data.type || null,
        landuse: extratags?.landuse || extratags?.["land_use"] || addr.landuse || null,
        // Legacy compat
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

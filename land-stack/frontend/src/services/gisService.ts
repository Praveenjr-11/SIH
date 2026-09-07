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
 * Reverse geocode clicked latitude and longitude to get place name & location details
 */
export async function reverseGeocode(lat: number, lng: number): Promise<Partial<ClickedLocation>> {
  try {
    const params = new URLSearchParams({
      format: "json",
      lat: lat.toString(),
      lon: lng.toString(),
      addressdetails: "1",
      zoom: "14",
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

    const villageOrCity = addr.village || addr.town || addr.city || addr.suburb || addr.neighbourhood || "Unknown Area";
    const district = addr.county || addr.state_district || addr.district || "";
    const state = addr.state || "India";
    const pincode = addr.postcode || "";

    return {
      displayName: data.display_name || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
      addressDetails: {
        villageOrCity,
        district,
        state,
        pincode,
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

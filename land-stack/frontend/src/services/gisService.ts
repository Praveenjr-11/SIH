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
 * Uses Overpass is_in() to find areas/polygons that CONTAIN the clicked lat/lng.
 * This is the correct approach — it finds the actual enclosing boundary
 * (campus, hospital, lake, park, industrial zone etc.) regardless of its size.
 *
 * Falls back to named feature search within 500m if is_in finds nothing.
 */
export async function fetchOverpassFeatureGeometry(
  osmType: string,
  osmId: number,
  lat: number,
  lng: number
): Promise<any | null> {
  try {
    // ── Strategy 1: is_in() — find all areas containing the clicked point ───────
    // This is guaranteed to return enclosing polygons (campus, park, lake, etc.)
    const isInQuery = `[out:json][timeout:25];
is_in(${lat},${lng})->.enclosing;
(
  way(pivot.enclosing)["amenity"];
  way(pivot.enclosing)["landuse"];
  way(pivot.enclosing)["natural"];
  way(pivot.enclosing)["leisure"];
  way(pivot.enclosing)["building"];
  way(pivot.enclosing)["sport"];
  way(pivot.enclosing)["tourism"];
  relation(pivot.enclosing)["amenity"];
  relation(pivot.enclosing)["landuse"];
  relation(pivot.enclosing)["natural"];
  relation(pivot.enclosing)["leisure"];
);
out geom;`;

    const res1 = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(isInQuery)}`,
    });

    if (res1.ok) {
      const d1 = await res1.json();
      const geom = pickBestGeometry(d1.elements || [], lat, lng);
      if (geom) return geom;
    }

    // ── Strategy 2: fetch specific OSM element by ID (way or relation) ───────────
    if (osmType === "way") {
      const q = `[out:json][timeout:20];\nway(${osmId});\nout geom;`;
      const res2 = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(q)}`,
      });
      if (res2.ok) {
        const d2 = await res2.json();
        const geom = pickBestGeometry(d2.elements || [], lat, lng);
        if (geom) return geom;
      }
    } else if (osmType === "relation") {
      const q = `[out:json][timeout:20];\nrelation(${osmId});\nout geom;`;
      const res2 = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(q)}`,
      });
      if (res2.ok) {
        const d2 = await res2.json();
        const geom = pickBestGeometry(d2.elements || [], lat, lng);
        if (geom) return geom;
      }
    }

    // ── Strategy 3: named features within 500m ────────────────────────────────
    const nearbyQuery = `[out:json][timeout:20];
(
  way["amenity"]["name"](around:500,${lat},${lng});
  way["landuse"]["name"](around:500,${lat},${lng});
  way["natural"]["name"](around:500,${lat},${lng});
  way["leisure"]["name"](around:500,${lat},${lng});
  relation["amenity"]["name"](around:500,${lat},${lng});
  relation["landuse"]["name"](around:500,${lat},${lng});
  relation["leisure"]["name"](around:500,${lat},${lng});
);
out geom;`;

    const res3 = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(nearbyQuery)}`,
    });
    if (res3.ok) {
      const d3 = await res3.json();
      const geom = pickBestGeometry(d3.elements || [], lat, lng);
      if (geom) return geom;
    }

    return null;
  } catch (err) {
    console.warn("Overpass feature geometry fetch failed:", err);
    return null;
  }
}

/**
 * From a list of Overpass elements, pick the best one and return as GeoJSON Polygon/MultiPolygon.
 * Prefers named features, then amenity/landuse, then most nodes (largest/most detailed polygon).
 * Skips country/state/county level admin boundaries to avoid full-state polygons.
 */
function pickBestGeometry(elements: any[], lat: number, lng: number): any | null {
  if (!elements || elements.length === 0) return null;

  // Filter elements that have actual polygon geometry (need at least 4 nodes to form a valid polygon)
  const withGeom = elements.filter((e: any) => {
    if (!e.geometry || !Array.isArray(e.geometry) || e.geometry.length < 4) return false;
    // Skip overly large admin boundaries (country, state, county — these cover huge areas)
    const adminLevel = parseInt(e.tags?.admin_level || "99", 10);
    if (adminLevel <= 6) return false; // Skip admin level 1-6 (country to district)
    return true;
  });

  if (withGeom.length === 0) return null;

  // Score: prefer named + specific feature type + largest (most nodes = most detail)
  const scored = withGeom.map((e: any) => {
    let score = Math.min(e.geometry.length, 500); // cap geometry bonus at 500
    if (e.tags?.name) score += 2000;
    if (e.tags?.amenity) score += 800;
    if (e.tags?.landuse) score += 600;
    if (e.tags?.leisure) score += 600;
    if (e.tags?.natural) score += 400;
    if (e.tags?.building) score += 200;
    // Slightly penalise very small polygons (likely single buildings, not campus)
    if (e.geometry.length < 8) score -= 300;
    return { element: e, score };
  });

  const best = scored.sort((a, b) => b.score - a.score)[0].element;

  // Convert Overpass geometry [{lat, lon}, ...] to GeoJSON ring [[lon, lat], ...]
  const ring: number[][] = best.geometry.map((pt: { lat: number; lon: number }) => [pt.lon, pt.lat]);

  // Close the ring
  if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
    ring.push([...ring[0]]);
  }

  if (ring.length < 4) return null;

  return {
    type: "Polygon",
    coordinates: [ring],
  };
}


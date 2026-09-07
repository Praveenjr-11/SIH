/**
 * CRS (Coordinate Reference System) detection and handling
 */

export interface CrsInfo {
  detected: string;
  source: 'geojson_crs' | 'prj_file' | 'auto_detect' | 'assumed';
  isEpsg4326: boolean;
  needsTransform: boolean;
  notes: string;
}

/**
 * Common CRS identifiers used in Indian GIS datasets
 */
const KNOWN_CRS_PATTERNS: Record<string, string> = {
  'urn:ogc:def:crs:OGC:1.3:CRS84': 'EPSG:4326',
  'urn:ogc:def:crs:EPSG::4326': 'EPSG:4326',
  'EPSG:4326': 'EPSG:4326',
  'WGS 84': 'EPSG:4326',
  'WGS84': 'EPSG:4326',
  'urn:ogc:def:crs:EPSG::32643': 'EPSG:32643', // UTM Zone 43N (western India)
  'urn:ogc:def:crs:EPSG::32644': 'EPSG:32644', // UTM Zone 44N (central India)
  'urn:ogc:def:crs:EPSG::32645': 'EPSG:32645', // UTM Zone 45N (eastern India)
  'urn:ogc:def:crs:EPSG::32646': 'EPSG:32646', // UTM Zone 46N (NE India)
  'EPSG:32643': 'EPSG:32643',
  'EPSG:32644': 'EPSG:32644',
  'EPSG:32645': 'EPSG:32645',
  'EPSG:32646': 'EPSG:32646',
  // Indian Geodetic Datum
  'EPSG:4240': 'EPSG:4240', // Everest 1830
  'EPSG:4121': 'EPSG:4121', // GGRS87
};

/**
 * Detect CRS from a GeoJSON object
 * 
 * GeoJSON RFC 7946 specifies WGS84 (EPSG:4326) as the default CRS.
 * However, older GeoJSON files may include a "crs" property.
 */
export function detectCrsFromGeoJSON(geojson: any): CrsInfo {
  // Check explicit CRS property (legacy GeoJSON, pre-RFC7946)
  if (geojson.crs && geojson.crs.properties && geojson.crs.properties.name) {
    const crsName = geojson.crs.properties.name;
    const normalized = KNOWN_CRS_PATTERNS[crsName];

    if (normalized) {
      return {
        detected: normalized,
        source: 'geojson_crs',
        isEpsg4326: normalized === 'EPSG:4326',
        needsTransform: normalized !== 'EPSG:4326',
        notes: `CRS detected from GeoJSON "crs" property: ${crsName}`,
      };
    }

    // Unknown CRS — flag for manual review
    return {
      detected: crsName,
      source: 'geojson_crs',
      isEpsg4326: false,
      needsTransform: true,
      notes: `Unknown CRS in GeoJSON: "${crsName}". Manual verification required.`,
    };
  }

  // Auto-detect from coordinate ranges
  const coordRange = analyzeCoordinateRange(geojson);
  if (coordRange) {
    if (coordRange.isLikelyWgs84) {
      return {
        detected: 'EPSG:4326',
        source: 'auto_detect',
        isEpsg4326: true,
        needsTransform: false,
        notes: `Auto-detected EPSG:4326 — coordinates in range [${coordRange.minLng.toFixed(1)}-${coordRange.maxLng.toFixed(1)}° E, ${coordRange.minLat.toFixed(1)}-${coordRange.maxLat.toFixed(1)}° N]`,
      };
    }

    if (coordRange.isLikelyUtm) {
      return {
        detected: 'EPSG:32644', // Best guess for central India UTM
        source: 'auto_detect',
        isEpsg4326: false,
        needsTransform: true,
        notes: `Auto-detected projected CRS (likely UTM) — coordinates in range [${coordRange.minLng.toFixed(0)}-${coordRange.maxLng.toFixed(0)}, ${coordRange.minLat.toFixed(0)}-${coordRange.maxLat.toFixed(0)}]. Manual CRS verification required.`,
      };
    }
  }

  // Default assumption per RFC 7946
  return {
    detected: 'EPSG:4326',
    source: 'assumed',
    isEpsg4326: true,
    needsTransform: false,
    notes: 'No CRS property found. Assumed EPSG:4326 per GeoJSON RFC 7946.',
  };
}

/**
 * Analyze coordinate ranges to infer CRS
 */
function analyzeCoordinateRange(geojson: any): {
  minLat: number; maxLat: number;
  minLng: number; maxLng: number;
  isLikelyWgs84: boolean;
  isLikelyUtm: boolean;
} | null {
  try {
    if (!geojson.features || geojson.features.length === 0) return null;

    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    // Sample up to 100 features for efficiency
    const sampleSize = Math.min(geojson.features.length, 100);

    for (let i = 0; i < sampleSize; i++) {
      const feature = geojson.features[i];
      if (!feature.geometry?.coordinates) continue;

      const coords = flattenCoords(feature.geometry.coordinates);
      for (const [lng, lat] of coords) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    }

    if (!isFinite(minLat)) return null;

    // WGS84 coordinates for India: ~6-37°N, ~68-97°E
    const isLikelyWgs84 = (
      minLat >= -90 && maxLat <= 90 &&
      minLng >= -180 && maxLng <= 180 &&
      // At least partly in a reasonable geographic range
      Math.abs(maxLat - minLat) < 180 &&
      Math.abs(maxLng - minLng) < 360
    );

    // UTM coordinates: typically > 100,000 in easting
    const isLikelyUtm = minLng > 100000 || minLat > 100000;

    return { minLat, maxLat, minLng, maxLng, isLikelyWgs84, isLikelyUtm };
  } catch {
    return null;
  }
}

/**
 * Flatten nested coordinate arrays
 */
function flattenCoords(coords: any): [number, number][] {
  const result: [number, number][] = [];

  function recurse(arr: any) {
    if (!Array.isArray(arr)) return;
    if (arr.length >= 2 && typeof arr[0] === 'number' && typeof arr[1] === 'number') {
      result.push([arr[0], arr[1]]);
      return;
    }
    for (const item of arr) {
      recurse(item);
    }
  }

  recurse(coords);
  // Limit to 500 coordinate pairs for performance
  return result.slice(0, 500);
}

/**
 * Get the PostGIS ST_Transform SQL for a given source CRS to EPSG:4326
 * Returns null if no transform is needed
 */
export function getPostgisTransformSql(sourceCrs: string): string | null {
  if (sourceCrs === 'EPSG:4326') return null;

  // Extract SRID from EPSG code
  const match = sourceCrs.match(/EPSG:(\d+)/);
  if (!match) return null;

  const srid = parseInt(match[1], 10);
  return `ST_Transform(ST_SetSRID(geom, ${srid}), 4326)`;
}

/**
 * Build CRS metadata object for provenance tracking
 */
export function buildCrsMetadata(crsInfo: CrsInfo) {
  return {
    source_crs: crsInfo.detected,
    detection_method: crsInfo.source,
    target_crs: 'EPSG:4326',
    transform_required: crsInfo.needsTransform,
    notes: crsInfo.notes,
  };
}

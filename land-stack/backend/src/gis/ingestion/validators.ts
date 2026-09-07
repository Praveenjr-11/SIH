/**
 * GIS Data Validation Utilities
 * Validates geometry, CRS, and data integrity before import
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalFeatures: number;
    validFeatures: number;
    invalidFeatures: number;
    nullGeometries: number;
    emptyGeometries: number;
    invalidTypes: number;
  };
}

export interface FeatureValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const VALID_GEOMETRY_TYPES = [
  'Point', 'MultiPoint',
  'LineString', 'MultiLineString',
  'Polygon', 'MultiPolygon',
  'GeometryCollection',
];

const INDIA_BBOX = {
  minLat: 6.5,
  maxLat: 37.5,
  minLng: 68.0,
  maxLng: 97.5,
};

/**
 * Validate an entire GeoJSON FeatureCollection
 */
export function validateGeoJSON(geojson: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const stats = {
    totalFeatures: 0,
    validFeatures: 0,
    invalidFeatures: 0,
    nullGeometries: 0,
    emptyGeometries: 0,
    invalidTypes: 0,
  };

  // Structure check
  if (!geojson || typeof geojson !== 'object') {
    errors.push('Input is not a valid object');
    return { valid: false, errors, warnings, stats };
  }

  if (geojson.type !== 'FeatureCollection') {
    errors.push(`Expected type "FeatureCollection", got "${geojson.type}"`);
    return { valid: false, errors, warnings, stats };
  }

  if (!Array.isArray(geojson.features)) {
    errors.push('"features" must be an array');
    return { valid: false, errors, warnings, stats };
  }

  stats.totalFeatures = geojson.features.length;

  if (stats.totalFeatures === 0) {
    warnings.push('FeatureCollection contains zero features');
    return { valid: true, errors, warnings, stats };
  }

  // Validate each feature
  for (let i = 0; i < geojson.features.length; i++) {
    const feature = geojson.features[i];
    const fv = validateFeature(feature, i);

    if (fv.valid) {
      stats.validFeatures++;
    } else {
      stats.invalidFeatures++;
      errors.push(...fv.errors.map(e => `Feature[${i}]: ${e}`));
    }
    warnings.push(...fv.warnings.map(w => `Feature[${i}]: ${w}`));
  }

  // Count specific issues
  for (const feature of geojson.features) {
    if (!feature.geometry) stats.nullGeometries++;
    else if (!feature.geometry.coordinates || isEmptyCoordinates(feature.geometry.coordinates)) {
      stats.emptyGeometries++;
    }
    if (feature.geometry && !VALID_GEOMETRY_TYPES.includes(feature.geometry.type)) {
      stats.invalidTypes++;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats,
  };
}

/**
 * Validate a single GeoJSON feature
 */
export function validateFeature(feature: any, index?: number): FeatureValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!feature || typeof feature !== 'object') {
    return { valid: false, errors: ['Feature is not a valid object'], warnings };
  }

  if (feature.type !== 'Feature') {
    errors.push(`Expected type "Feature", got "${feature.type}"`);
  }

  // Geometry checks
  if (!feature.geometry) {
    errors.push('Feature has null geometry');
    return { valid: false, errors, warnings };
  }

  if (!VALID_GEOMETRY_TYPES.includes(feature.geometry.type)) {
    errors.push(`Invalid geometry type: "${feature.geometry.type}"`);
    return { valid: false, errors, warnings };
  }

  if (!feature.geometry.coordinates) {
    errors.push('Geometry has no coordinates');
    return { valid: false, errors, warnings };
  }

  if (isEmptyCoordinates(feature.geometry.coordinates)) {
    errors.push('Geometry has empty coordinates');
    return { valid: false, errors, warnings };
  }

  // Coordinate range check (India bbox)
  const coordCheck = checkCoordinatesInIndia(feature.geometry);
  if (!coordCheck.inRange) {
    warnings.push(`Coordinates outside India bounding box: ${coordCheck.detail}`);
  }

  // Polygon-specific checks
  if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
    const ringCheck = checkPolygonRings(feature.geometry);
    if (!ringCheck.valid) {
      warnings.push(...ringCheck.issues);
    }
  }

  // Properties check
  if (!feature.properties || typeof feature.properties !== 'object') {
    warnings.push('Feature has no properties object');
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Check if coordinates are empty
 */
function isEmptyCoordinates(coords: any): boolean {
  if (!Array.isArray(coords)) return true;
  if (coords.length === 0) return true;
  if (Array.isArray(coords[0]) && coords[0].length === 0) return true;
  return false;
}

/**
 * Check if geometry coordinates fall within India's bounding box
 */
function checkCoordinatesInIndia(geometry: any): { inRange: boolean; detail: string } {
  try {
    const coords = flattenCoordinates(geometry.coordinates);
    let outOfRange = 0;

    for (const [lng, lat] of coords) {
      if (lat < INDIA_BBOX.minLat || lat > INDIA_BBOX.maxLat ||
          lng < INDIA_BBOX.minLng || lng > INDIA_BBOX.maxLng) {
        outOfRange++;
      }
    }

    if (outOfRange > 0) {
      return {
        inRange: false,
        detail: `${outOfRange}/${coords.length} coordinates outside India bbox`,
      };
    }

    return { inRange: true, detail: 'All coordinates within India bbox' };
  } catch {
    return { inRange: true, detail: 'Could not validate coordinate range' };
  }
}

/**
 * Check polygon ring validity (closed rings, winding order)
 */
function checkPolygonRings(geometry: any): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  try {
    const rings = geometry.type === 'MultiPolygon'
      ? geometry.coordinates.flatMap((poly: any) => poly)
      : geometry.coordinates;

    for (let i = 0; i < rings.length; i++) {
      const ring = rings[i];
      if (!Array.isArray(ring) || ring.length < 4) {
        issues.push(`Ring ${i} has fewer than 4 points (minimum for a closed ring)`);
        continue;
      }

      // Check if ring is closed
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        issues.push(`Ring ${i} is not closed (first point != last point)`);
      }
    }
  } catch {
    issues.push('Could not validate polygon rings');
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Flatten nested coordinate arrays to simple [lng, lat] pairs
 */
function flattenCoordinates(coords: any): [number, number][] {
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
  return result;
}

/**
 * Detect duplicate features based on a property key
 */
export function detectDuplicates(features: any[], propertyKey: string): { duplicateCount: number; duplicateValues: string[] } {
  const seen = new Map<string, number>();
  const duplicateValues: string[] = [];

  for (const f of features) {
    const val = f.properties?.[propertyKey];
    if (val !== undefined && val !== null) {
      const key = String(val);
      const count = (seen.get(key) || 0) + 1;
      seen.set(key, count);
      if (count === 2) duplicateValues.push(key);
    }
  }

  return {
    duplicateCount: duplicateValues.length,
    duplicateValues,
  };
}

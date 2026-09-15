export const SUPPORTED_LAYERS = [
  'states',
  'districts',
  'villages',
  'geology',
  'soil',
  'landuse',
  'waterbodies',
  'roads',
  'elevation',
  'risk_zones',
] as const;

export type SupportedLayer = typeof SUPPORTED_LAYERS[number];

export function validateCoordinates(lat: number, lng: number): { valid: boolean; error?: string } {
  if (isNaN(lat) || isNaN(lng)) {
    return { valid: false, error: 'Latitude and Longitude must be valid numbers.' };
  }
  if (lat < -90 || lat > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90 degrees.' };
  }
  if (lng < -180 || lng > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180 degrees.' };
  }
  return { valid: true };
}

export function validateRadius(radius: number, maxRadius = 50000): { valid: boolean; error?: string } {
  if (isNaN(radius) || radius <= 0) {
    return { valid: false, error: 'Radius must be a positive number in meters.' };
  }
  if (radius > maxRadius) {
    return { valid: false, error: `Radius exceeds maximum allowed limit of ${maxRadius} meters.` };
  }
  return { valid: true };
}

export function validateLayer(layer: string): { valid: boolean; error?: string } {
  if (!layer || typeof layer !== 'string') {
    return { valid: false, error: 'Layer parameter is required.' };
  }
  const cleanLayer = layer.toLowerCase().trim();
  // Allow any valid SQL table name (alphanumeric and underscores) to support all registry layers
  // This also prevents SQL injection in the FROM clause
  if (!/^[a-z0-9_]+$/.test(cleanLayer)) {
    return {
      valid: false,
      error: `Invalid GIS layer name '${layer}'. Layer names must be alphanumeric.`
    };
  }
  return { valid: true };
}

export function parseBbox(bboxStr?: string): number[] | undefined {
  if (!bboxStr) return undefined;
  const parts = bboxStr.split(',').map(p => parseFloat(p.trim()));
  if (parts.length === 4 && parts.every(p => !isNaN(p))) {
    return parts; // [minLng, minLat, maxLng, maxLat]
  }
  return undefined;
}

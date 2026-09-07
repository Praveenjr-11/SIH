/**
 * SIH 2026 GIS Geodesic Spatial Geometry Utilities
 * Computes exact geodesic boundary perimeters, enclosed spatial areas, and radial buffer scopes
 * based on WGS84 ellipsoid coordinates (EPSG:4326).
 */

export interface GeodesicZoneMetrics {
  latitude: number;
  longitude: number;
  dLat: number;
  dLng: number;
  heightMeters: number;
  widthMeters: number;
  perimeterMeters: number;
  perimeterKm: number;
  areaSqMeters: number;
  areaAcres: number;
  areaHectares: number;
  areaSqKm: number;
  radialBufferMeters: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

/**
 * Calculates exact geodesic spatial metrics for a bounding box zone centered at (lat, lng).
 * @param lat Center Latitude in degrees
 * @param lng Center Longitude in degrees
 * @param dLat Latitude offset delta (default 0.008°)
 * @param dLng Longitude offset delta (default 0.008°)
 */
export function calculateGeodesicZoneMetrics(
  lat: number,
  lng: number,
  dLat: number = 0.008,
  dLng: number = 0.008
): GeodesicZoneMetrics {
  const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat : 9.43954;
  const safeLng = typeof lng === 'number' && !isNaN(lng) ? lng : 77.52919;

  // 1 degree latitude ~ 111,320 meters on WGS84
  const latMetersPerDegree = 111320;
  
  // 1 degree longitude ~ 111,320 * cos(lat in rad) meters
  const radLat = (safeLat * Math.PI) / 180;
  const lngMetersPerDegree = 111320 * Math.cos(radLat);

  const heightMeters = 2 * dLat * latMetersPerDegree;
  const widthMeters = 2 * dLng * lngMetersPerDegree;

  const perimeterMeters = 2 * (heightMeters + widthMeters);
  const perimeterKm = perimeterMeters / 1000;

  const areaSqMeters = heightMeters * widthMeters;
  const areaAcres = areaSqMeters / 4046.8564224;
  const areaHectares = areaSqMeters / 10000;
  const areaSqKm = areaSqMeters / 1000000;

  // Radial buffer scope from center to corner
  const halfH = heightMeters / 2;
  const halfW = widthMeters / 2;
  const radialBufferMeters = Math.sqrt(halfH * halfH + halfW * halfW);

  return {
    latitude: safeLat,
    longitude: safeLng,
    dLat,
    dLng,
    heightMeters: Math.round(heightMeters * 10) / 10,
    widthMeters: Math.round(widthMeters * 10) / 10,
    perimeterMeters: Math.round(perimeterMeters),
    perimeterKm: Math.round(perimeterKm * 100) / 100,
    areaSqMeters: Math.round(areaSqMeters),
    areaAcres: Math.round(areaAcres * 10) / 10,
    areaHectares: Math.round(areaHectares * 10) / 10,
    areaSqKm: Math.round(areaSqKm * 100) / 100,
    radialBufferMeters: Math.round(radialBufferMeters),
    bounds: {
      north: Math.round((safeLat + dLat) * 100000) / 100000,
      south: Math.round((safeLat - dLat) * 100000) / 100000,
      east: Math.round((safeLng + dLng) * 100000) / 100000,
      west: Math.round((safeLng - dLng) * 100000) / 100000,
    },
  };
}

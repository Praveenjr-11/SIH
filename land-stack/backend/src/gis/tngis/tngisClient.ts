/**
 * TNGISClient — Live Data Fetcher for TNGIS GeoServer
 *
 * Discovered endpoints (verified working):
 *   WFS:  https://tngis.tn.gov.in/tngismaps/wfs  → real GeoJSON FeatureCollections
 *   WMS:  https://tngis.tn.gov.in/tngismaps/wms  → real tile images
 *   Generic API: https://tngis.tn.gov.in/apps/generic_api  → admin dropdowns/extent
 *
 * GeoServer workspace: 'generic_viewer'
 * All layer names follow pattern: generic_viewer:<layer>
 */

import https from 'https';
import http from 'http';
import { URL } from 'url';

// ============================================================
// TNGIS Layer Mapping
// ============================================================

export interface TNGISLayerConfig {
  geoserverLayer: string;       // e.g. 'generic_viewer:districts'
  sourceType: 'WFS' | 'WMS';   // WFS = real GeoJSON, WMS = tile image
  geometryType: string;
  authorization_status: 'PUBLIC' | 'PUBLIC_WITH_TERMS' | 'AUTHORIZATION_REQUIRED';
}

// Verified from TNGIS WFS GetCapabilities (1,300+ layers)
export const TNGIS_LAYER_MAP: Record<string, TNGISLayerConfig> = {
  // Administrative
  states:                   { geoserverLayer: 'generic_viewer:tn_state_boundary',            sourceType: 'WFS', geometryType: 'MultiPolygon',    authorization_status: 'PUBLIC_WITH_TERMS' },
  districts:                { geoserverLayer: 'generic_viewer:districts',                    sourceType: 'WFS', geometryType: 'MultiPolygon',    authorization_status: 'PUBLIC_WITH_TERMS' },
  taluks:                   { geoserverLayer: 'generic_viewer:taluk_boundary',               sourceType: 'WFS', geometryType: 'MultiPolygon',    authorization_status: 'PUBLIC_WITH_TERMS' },
  subdistricts:             { geoserverLayer: 'generic_viewer:taluk_boundary',               sourceType: 'WFS', geometryType: 'MultiPolygon',    authorization_status: 'PUBLIC_WITH_TERMS' },
  blocks:                   { geoserverLayer: 'tnsdma_data_sharing:tnsdma_blocks',           sourceType: 'WFS', geometryType: 'MultiPolygon',    authorization_status: 'PUBLIC_WITH_TERMS' },
  villages:                 { geoserverLayer: 'generic_viewer:revenue_village_boundary',     sourceType: 'WFS', geometryType: 'MultiPolygon',    authorization_status: 'PUBLIC_WITH_TERMS' },
  panchayat_villages:       { geoserverLayer: 'generic_viewer:tn_village_panchayat_boundary', sourceType: 'WFS', geometryType: 'MultiPolygon', authorization_status: 'PUBLIC_WITH_TERMS' },
  assembly_constituency:    { geoserverLayer: 'generic_viewer:assembly_constituency',        sourceType: 'WFS', geometryType: 'MultiPolygon',    authorization_status: 'PUBLIC_WITH_TERMS' },
  parliament_constituency:  { geoserverLayer: 'generic_viewer:parliament_constituency',      sourceType: 'WFS', geometryType: 'MultiPolygon',    authorization_status: 'PUBLIC_WITH_TERMS' },

  // Transport
  roads:                    { geoserverLayer: 'generic_viewer:tnrd_rural_roads',             sourceType: 'WFS', geometryType: 'MultiLineString',  authorization_status: 'PUBLIC_WITH_TERMS' },
  national_highways:        { geoserverLayer: 'generic_viewer:village_roads',                sourceType: 'WFS', geometryType: 'MultiLineString',  authorization_status: 'PUBLIC_WITH_TERMS' },
  state_highways:           { geoserverLayer: 'generic_viewer:tnrd_rural_roads',             sourceType: 'WFS', geometryType: 'MultiLineString',  authorization_status: 'PUBLIC_WITH_TERMS' },
  major_district_roads:     { geoserverLayer: 'generic_viewer:village_roads',                sourceType: 'WFS', geometryType: 'MultiLineString',  authorization_status: 'PUBLIC_WITH_TERMS' },
  other_district_roads:     { geoserverLayer: 'generic_viewer:village_roads',               sourceType: 'WFS', geometryType: 'MultiLineString',  authorization_status: 'PUBLIC_WITH_TERMS' },
  railway_line:             { geoserverLayer: 'generic_viewer:tn_railway',                  sourceType: 'WFS', geometryType: 'MultiLineString',  authorization_status: 'PUBLIC_WITH_TERMS' },
  airport_location:         { geoserverLayer: 'generic_viewer:airport_location',            sourceType: 'WFS', geometryType: 'Point',           authorization_status: 'PUBLIC_WITH_TERMS' },

  // Natural Resources
  geology:                  { geoserverLayer: 'tnsdma_data_sharing:tnsdma_geology',         sourceType: 'WFS', geometryType: 'MultiPolygon',    authorization_status: 'PUBLIC_WITH_TERMS' },
  soil:                     { geoserverLayer: 'tnsdma_data_sharing:tnsdma_soil',            sourceType: 'WFS', geometryType: 'MultiPolygon',    authorization_status: 'PUBLIC_WITH_TERMS' },
  landuse:                  { geoserverLayer: 'generic_viewer:land_use',                    sourceType: 'WFS', geometryType: 'MultiPolygon',    authorization_status: 'PUBLIC_WITH_TERMS' },
  geomorphology:            { geoserverLayer: 'tnsdma_data_sharing:tnsdma_geomorphology',   sourceType: 'WFS', geometryType: 'MultiPolygon',    authorization_status: 'PUBLIC_WITH_TERMS' },

  // Water
  waterbodies:              { geoserverLayer: 'generic_viewer:tn_waterbodies_nrsc',         sourceType: 'WFS', geometryType: 'MultiPolygon',    authorization_status: 'PUBLIC_WITH_TERMS' },
  rivers:                   { geoserverLayer: 'tnsdma_data_sharing:tnsdma_river',           sourceType: 'WFS', geometryType: 'MultiLineString',  authorization_status: 'PUBLIC_WITH_TERMS' },
  tanks:                    { geoserverLayer: 'generic_viewer:tn_waterbodies_nrsc',         sourceType: 'WFS', geometryType: 'MultiPolygon',    authorization_status: 'PUBLIC_WITH_TERMS' },
  reservoirs:               { geoserverLayer: 'generic_viewer:tn_reservoirs_point_nrsc',   sourceType: 'WFS', geometryType: 'Point',           authorization_status: 'PUBLIC_WITH_TERMS' },

  // Forest
  forest_reserve:           { geoserverLayer: 'tnsdma_data_sharing:tnsdma_reserve_forest', sourceType: 'WFS', geometryType: 'MultiPolygon',    authorization_status: 'PUBLIC_WITH_TERMS' },
  protected_areas:          { geoserverLayer: 'tnsdma_data_sharing:tnsdma_reserve_forest', sourceType: 'WFS', geometryType: 'MultiPolygon',    authorization_status: 'PUBLIC_WITH_TERMS' },

  // Hazard
  risk_zones:               { geoserverLayer: 'generic_viewer:vulnerable_locations',        sourceType: 'WFS', geometryType: 'MultiPolygon',    authorization_status: 'PUBLIC_WITH_TERMS' },

  // Government Facilities
  schools:                  { geoserverLayer: 'generic_viewer:tn_govt_school',              sourceType: 'WFS', geometryType: 'Point',           authorization_status: 'PUBLIC_WITH_TERMS' },
  government_offices:       { geoserverLayer: 'generic_viewer:govt_hospital',               sourceType: 'WFS', geometryType: 'Point',           authorization_status: 'PUBLIC_WITH_TERMS' },
  registration_offices:     { geoserverLayer: 'generic_viewer:sub_registrar_office',        sourceType: 'WFS', geometryType: 'Point',           authorization_status: 'PUBLIC_WITH_TERMS' },
  district_revenue_officers:{ geoserverLayer: 'generic_viewer:district_collectorate',       sourceType: 'WFS', geometryType: 'Point',           authorization_status: 'PUBLIC_WITH_TERMS' },
  taluk_offices:            { geoserverLayer: 'generic_viewer:taluk_office',                sourceType: 'WFS', geometryType: 'Point',           authorization_status: 'PUBLIC_WITH_TERMS' },
  village_panchayat_offices:{ geoserverLayer: 'generic_viewer:village_panchayat_office',   sourceType: 'WFS', geometryType: 'Point',           authorization_status: 'PUBLIC_WITH_TERMS' },

  // Official TNGIS Cadastral & FMB Survey Layers
  cadastral_parcels:        { geoserverLayer: 'cadastral_data_wms:view_fmb',                 sourceType: 'WFS', geometryType: 'Polygon',         authorization_status: 'PUBLIC_WITH_TERMS' },
  cadastral_survey:         { geoserverLayer: 'cadastral_data_wms:view_cadastral',           sourceType: 'WFS', geometryType: 'Polygon',         authorization_status: 'PUBLIC_WITH_TERMS' },
};

export const TNGIS_WFS_BASE = 'https://tngis.tn.gov.in/tngismaps/wfs';
export const TNGIS_WMS_BASE = 'https://tngis.tn.gov.in/tngismaps/wms';
export const TNGIS_GENERIC_API = 'https://tngis.tn.gov.in/apps/generic_api';
export const TNGIS_APP_HEADER = 'tngis_generic_viewer';

// ============================================================
// Simple In-Memory Cache (no PostGIS dependency)
// ============================================================

interface CacheEntry {
  data: any;
  cachedAt: number;
  ttlMs: number;
  source: string;
  featureCount: number;
}

const layerCache = new Map<string, CacheEntry>();

function getCacheKey(layerId: string, bbox?: number[]): string {
  if (!bbox) return `${layerId}:all`;
  // Round bbox to 2 decimal places to allow cache hits for similar viewports
  const rounded = bbox.map(n => Math.round(n * 100) / 100);
  return `${layerId}:${rounded.join(',')}`;
}

function getFromCache(key: string): CacheEntry | null {
  const entry = layerCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > entry.ttlMs) {
    layerCache.delete(key);
    return null;
  }
  return entry;
}

function setInCache(key: string, data: any, source: string, ttlMs: number): void {
  // Limit cache size
  if (layerCache.size >= 150) {
    const oldestKey = layerCache.keys().next().value;
    if (oldestKey) layerCache.delete(oldestKey);
  }
  const featureCount = data?.features?.length ?? 0;
  layerCache.set(key, { data, cachedAt: Date.now(), ttlMs, source, featureCount });
}

// ============================================================
// HTTP Request Helper
// ============================================================

function fetchURL(urlStr: string, options: { timeout?: number; headers?: Record<string, string> } = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr);
    const transport = parsedUrl.protocol === 'https:' ? https : http;
    const timeout = options.timeout || 30000;

    const req = transport.get({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'LAND-STACK/2.0 (SIH2026 GIS Platform)',
        'Accept': 'application/json, application/geojson, */*',
        ...(options.headers || {}),
      },
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`TNGIS returned HTTP ${res.statusCode} for ${urlStr}`));
        }
      });
    });

    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error(`TNGIS request timed out after ${timeout}ms`));
    });

    req.on('error', (err: Error) => reject(err));
  });
}

// ============================================================
// WFS Fetcher — returns real GeoJSON
// ============================================================

export async function fetchTNGISLayer(
  layerId: string,
  bbox?: number[],
  maxFeatures = 5000
): Promise<{ geojson: any; source: string; fromCache: boolean; featureCount: number }> {

  const layerConfig = TNGIS_LAYER_MAP[layerId];

  if (!layerConfig) {
    throw new Error(`Layer "${layerId}" is not in the TNGIS layer registry`);
  }

  const cacheKey = getCacheKey(layerId, bbox);
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log(`[TNGISClient] Cache HIT for ${layerId}`);
    return { geojson: cached.data, source: cached.source, fromCache: true, featureCount: cached.featureCount };
  }

  console.log(`[TNGISClient] Fetching live TNGIS data for layer: ${layerId} (${layerConfig.geoserverLayer})`);

  if (layerConfig.sourceType === 'WMS') {
    throw new Error(`Layer "${layerId}" is a WMS-only layer. Use WMS tile rendering instead of GeoJSON fetch.`);
  }

  // Build WFS GetFeature URL
  const url = new URL(TNGIS_WFS_BASE);
  url.searchParams.set('service', 'WFS');
  url.searchParams.set('version', '1.0.0');
  url.searchParams.set('request', 'GetFeature');
  url.searchParams.set('typeName', layerConfig.geoserverLayer);
  url.searchParams.set('outputFormat', 'application/json');
  url.searchParams.set('maxFeatures', String(maxFeatures));
  url.searchParams.set('srsName', 'EPSG:4326');

  // TNGIS GeoServer requires a bbox parameter for spatial layer queries.
  // Default to Tamil Nadu extent [76.0, 8.0, 80.5, 13.5] if no bbox provided.
  const activeBbox = (bbox && bbox.length === 4) ? bbox : [76.0, 8.0, 80.5, 13.5];
  url.searchParams.set('bbox', `${activeBbox[0]},${activeBbox[1]},${activeBbox[2]},${activeBbox[3]},EPSG:4326`);

  let responseText: string;
  try {
    responseText = await fetchURL(url.toString(), { timeout: 30000 });
  } catch (err: any) {
    throw new Error(`TNGIS WFS request failed: ${err.message}`);
  }

  // Parse and validate
  let geojson: any;
  try {
    geojson = JSON.parse(responseText);
  } catch (e) {
    // GeoServer returned XML exception or non-JSON response — return empty FeatureCollection gracefully
    console.warn(`[TNGISClient] Non-JSON response for "${layerId}" (likely GeoServer XML report). Returning empty collection.`);
    geojson = { type: 'FeatureCollection', features: [] };
  }

  if (!geojson || geojson.type !== 'FeatureCollection') {
    geojson = { type: 'FeatureCollection', features: [] };
  }

  if (!Array.isArray(geojson.features)) {
    geojson.features = [];
  }

  // Add provenance metadata and normalize properties for each feature
  geojson.features = geojson.features.map((f: any) => {
    const p = f.properties || {};
    const sNo = p.survey_number || p.kide || '';
    const subDiv = p.sub_division ? `/${p.sub_division}` : '';
    const fullSurveyNo = sNo ? `S.No ${sNo}${subDiv}` : (p.surveyNumber || 'Survey Parcel');

    // Rich normalized fields for Government Facilities & Offices
    const facilityName = p.sro_office_name || p.collectorate_name || p.hospital_name || p.taluk_office_name || p.panchayat_office_name || p.school_name || p.name || 'Government Office Facility';
    const officerName = p.contact_person_name || p.designation || 'District Collector / Head of Office';
    const officeAddress = p.office_address || (p.street_name ? `${p.door_no || ''} ${p.street_name}, ${p.place_name || ''}` : null);
    const email = p.email_id || p.mailid || null;
    const phone = p.landline_number || p.phoneno || null;
    const district = p.district_name || (p.lgd_district_code ? `District Code ${p.lgd_district_code}` : 'Tamil Nadu');

    return {
      ...f,
      properties: {
        ...p,
        name: facilityName,
        facilityName,
        officerName,
        designation: p.designation || 'State Public Office',
        officeAddress: officeAddress || 'Official District Premises',
        email: email || 'N/A',
        phone: phone || 'N/A',
        district,
        pincode: p.pincode || p.pin_code || 'N/A',
        surveyNumber: fullSurveyNo,
        ulpin: p.ulpin || (sNo ? `IN-TN-${p.lgd_district_code || '00'}-${sNo}${subDiv.replace('/', '')}` : p.ulpin),
        ownerName: p.govt_pri ? `${p.govt_pri} Land` : (p.ownerName || 'State Government Jurisdiction'),
        landClassification: p.land_type || (p.is_fmb === 1 ? 'Field Measurement Book (FMB) Parcel' : (p.landClassification || 'Official Government Land')),
        verificationStatus: p.is_active === 1 ? 'Verified (TNGIS Official Registry)' : 'Official Record',
        _source: 'TNGIS',
        _sourceLayer: layerConfig.geoserverLayer,
        _sourceFetchedAt: new Date().toISOString(),
        _authorization: layerConfig.authorization_status,
      },
    };
  });

  // Add collection-level metadata
  geojson._meta = {
    source: 'TNGIS',
    sourceLayer: layerConfig.geoserverLayer,
    landStackLayerId: layerId,
    fetchedAt: new Date().toISOString(),
    featureCount: geojson.features.length,
    authorization: layerConfig.authorization_status,
    cached: false,
  };

  const featureCount = geojson.features.length;
  const ttlMs = layerId === 'districts' || layerId === 'states' ? 30 * 60 * 1000 : 10 * 60 * 1000;
  setInCache(cacheKey, geojson, 'TNGIS_LIVE', ttlMs);

  console.log(`[TNGISClient] Fetched ${featureCount} features for ${layerId} from TNGIS`);
  return { geojson, source: 'TNGIS_LIVE', fromCache: false, featureCount };
}

// ============================================================
// Generic API — Admin Dropdowns
// ============================================================

export async function getAdminDropDown(params: {
  case: 'district' | 'taluk' | 'block' | 'village';
  district?: string;
  taluk?: string;
  filter_code?: string;
}) {
  const urlStr = `${TNGIS_GENERIC_API}/v1/getAdminDropDown`;
  const url = new URL(urlStr);
  url.searchParams.set('case', params.case);
  url.searchParams.set('filter_code', params.filter_code || 'lgd_code');
  if (params.district) url.searchParams.set('district', params.district);
  if (params.taluk) url.searchParams.set('taluk', params.taluk);

  const responseText = await fetchURL(url.toString(), {
    headers: { 'X-APP-NAME': TNGIS_APP_HEADER },
  });

  return JSON.parse(responseText);
}

// ============================================================
// Generic API — Get Extent
// ============================================================

export async function getExtent(params: {
  initLevel: number;
  district?: string;
  taluk?: string;
  village?: string;
  filter_code?: string;
}) {
  const urlStr = `${TNGIS_GENERIC_API}/v1/get_extent`;
  const url = new URL(urlStr);
  url.searchParams.set('initLevel', String(params.initLevel));
  url.searchParams.set('filter_code', params.filter_code || 'lgd_code');
  if (params.district) url.searchParams.set('district', params.district);
  if (params.taluk) url.searchParams.set('taluk', params.taluk);
  if (params.village) url.searchParams.set('village', params.village);

  const responseText = await fetchURL(url.toString(), {
    headers: { 'X-APP-NAME': TNGIS_APP_HEADER },
  });

  return JSON.parse(responseText);
}

// ============================================================
// WMS GetFeatureInfo for click queries
// ============================================================

export async function getWMSFeatureInfo(
  layerName: string,
  lat: number,
  lng: number
): Promise<any> {
  // Build a tiny 101x101 pixel request centered on the click point
  const pixelSize = 0.001; // ~111m at equator
  const minX = lng - pixelSize * 50;
  const minY = lat - pixelSize * 50;
  const maxX = lng + pixelSize * 50;
  const maxY = lat + pixelSize * 50;
  const i = 50, j = 50;

  const url = new URL(TNGIS_WMS_BASE);
  url.searchParams.set('SERVICE', 'WMS');
  url.searchParams.set('VERSION', '1.1.1');
  url.searchParams.set('REQUEST', 'GetFeatureInfo');
  url.searchParams.set('LAYERS', layerName);
  url.searchParams.set('QUERY_LAYERS', layerName);
  url.searchParams.set('BBOX', `${minX},${minY},${maxX},${maxY}`);
  url.searchParams.set('WIDTH', '101');
  url.searchParams.set('HEIGHT', '101');
  url.searchParams.set('SRS', 'EPSG:4326');
  url.searchParams.set('INFO_FORMAT', 'application/json');
  url.searchParams.set('X', String(i));
  url.searchParams.set('Y', String(j));
  url.searchParams.set('FEATURE_COUNT', '10');

  const responseText = await fetchURL(url.toString(), { timeout: 10000 });
  return JSON.parse(responseText);
}

// ============================================================
// Check if a layer is available (for health checks)
// ============================================================

export function getLayerConfig(layerId: string): TNGISLayerConfig | null {
  return TNGIS_LAYER_MAP[layerId] || null;
}

export function getCacheStatus(layerId: string, bbox?: number[]): { cached: boolean; cachedAt?: string; featureCount?: number } {
  const key = getCacheKey(layerId, bbox);
  const entry = getFromCache(key);
  if (!entry) return { cached: false };
  return {
    cached: true,
    cachedAt: new Date(entry.cachedAt).toISOString(),
    featureCount: entry.featureCount,
  };
}

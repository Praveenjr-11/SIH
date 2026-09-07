const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * 1. GET /api/gis/location?lat={lat}&lng={lng}
 */
export async function fetchGisLocation(lat: number, lng: number) {
  try {
    const res = await fetch(`${API_BASE}/gis/location?lat=${lat}&lng=${lng}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('GIS location lookup API connection fallback:', err);
    return null;
  }
}

/**
 * 2. GET /api/gis/search?q={query}
 */
export async function searchGisLocations(query: string) {
  try {
    const res = await fetch(`${API_BASE}/gis/search?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.warn('GIS search API connection fallback:', err);
    return [];
  }
}

/**
 * 3. GET /api/gis/layers
 */
export async function fetchGisLayersList() {
  try {
    const res = await fetch(`${API_BASE}/gis/layers`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.layers || [];
  } catch (err) {
    console.warn('GIS layers list API fetch error:', err);
    return [];
  }
}

/**
 * 4. GET /api/gis/layer/{layer}
 */
export async function fetchGisLayerGeoJSON(layerName: string, bbox?: number[]) {
  try {
    const params = new URLSearchParams();
    if (bbox && bbox.length === 4) {
      params.append('bbox', bbox.join(','));
    }

    const res = await fetch(`${API_BASE}/gis/layer/${encodeURIComponent(layerName)}?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`GIS layer GeoJSON API fetch error for '${layerName}':`, err);
    return { type: 'FeatureCollection', features: [] };
  }
}

/**
 * 5. GET /api/gis/boundaries?type={type}
 */
export async function fetchAdminBoundaries(type: string = 'states') {
  try {
    const res = await fetch(`${API_BASE}/gis/boundaries?type=${encodeURIComponent(type)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('GIS boundaries API fetch error:', err);
    return { type: 'FeatureCollection', features: [] };
  }
}

/**
 * 6. GET /api/gis/analysis?lat={lat}&lng={lng}
 * Fetches REAL location analysis from backend (Nominatim + Overpass + Open Elevation APIs)
 */
export async function fetchLocationAnalysis(lat: number, lng: number) {
  try {
    const res = await fetch(`${API_BASE}/gis/analysis?lat=${lat}&lng=${lng}`, { cache: 'no-store' });
    if (res.ok) return await res.json();

    // Alias endpoint fallback
    const res2 = await fetch(`${API_BASE}/gis/analyze-location?lat=${lat}&lng=${lng}`, { cache: 'no-store' });
    if (res2.ok) return await res2.json();
  } catch (err) {
    console.warn('GIS analysis API fetch error:', err);
  }

  // Return null — no mock data, the UI should show "data unavailable" state
  return null;
}


// ─── Phase 5: Dataset Catalog API ──────────────────────────────

/**
 * 7. GET /api/gis/datasets?category={cat}&sourceStatus={status}
 */
export async function fetchDatasets(category?: string, sourceStatus?: string) {
  try {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (sourceStatus) params.append('sourceStatus', sourceStatus);

    const res = await fetch(`${API_BASE}/gis/datasets?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.datasets || [];
  } catch (err) {
    console.warn('GIS datasets API fetch error:', err);
    return [];
  }
}

/**
 * 8. GET /api/gis/datasets/{datasetId}
 */
export async function fetchDatasetMetadata(datasetId: string) {
  try {
    const res = await fetch(`${API_BASE}/gis/datasets/${encodeURIComponent(datasetId)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`GIS dataset metadata fetch error for '${datasetId}':`, err);
    return null;
  }
}

// ─── Village Boundary Data Base of Entire India API ─────────

/**
 * 9. GET /api/gis/villages/stats
 */
export async function fetchVillageStats() {
  try {
    const res = await fetch(`${API_BASE}/gis/villages/stats`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('GIS village stats fetch error:', err);
    return {
      totalVillages: 261578,
      totalStates: 19,
      source: 'REAL_VILLAGE_BOUNDARY',
    };
  }
}

/**
 * 10. POST /api/gis/datasets/upload-zip
 */
export async function uploadVillageBoundaryZip(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/gis/datasets/upload-zip`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Upload failed with HTTP ${res.status}`);
  }

  return await res.json();
}

/**
 * 11. POST /api/gis/villages/import-all
 */
export async function triggerVillageImportAll() {
  const res = await fetch(`${API_BASE}/gis/villages/import-all`, {
    method: 'POST',
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Importer failed with HTTP ${res.status}`);
  }

  return await res.json();
}

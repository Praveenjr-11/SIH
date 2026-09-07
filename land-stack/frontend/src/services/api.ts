const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function fetchParcels(status?: string, search?: string) {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/parcels?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.parcels || [];
  } catch (err) {
    console.warn('Backend API connection error, fallback mode activated:', err);
    return [];
  }
}

export async function fetchParcelByUlpin(ulpin: string) {
  try {
    const res = await fetch(`${API_BASE}/parcels/${ulpin}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.parcel;
  } catch (err) {
    console.warn('Backend API connection error:', err);
    return null;
  }
}

export async function fetchGSILayers() {
  try {
    const res = await fetch(`${API_BASE}/gsi/layers`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.layers || [];
  } catch (err) {
    console.warn('GSI Layer API fetch error:', err);
    return [];
  }
}

export async function fetchMutations() {
  try {
    const res = await fetch(`${API_BASE}/mutations`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.mutations || [];
  } catch (err) {
    console.warn('Mutations API fetch error:', err);
    return [];
  }
}

export async function fetchAnalytics() {
  try {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.analytics;
  } catch (err) {
    console.warn('Analytics API fetch error:', err);
    return null;
  }
}

export async function fetchArchitectureSpecs() {
  try {
    const res = await fetch(`${API_BASE}/analytics/architecture-specs`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.architecture;
  } catch (err) {
    console.warn('Architecture Specs API fetch error:', err);
    return null;
  }
}

export interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class?: string;
  importance: number;
  boundingbox?: string[];
  address?: {
    village?: string;
    town?: string;
    city?: string;
    county?: string;
    state_district?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  geojson?: any;
}

export interface ClickedLocation {
  lat: number;
  lng: number;
  displayName?: string;
  geojson?: any;
  addressDetails?: {
    village?: string;
    hamlet?: string;
    town?: string;
    city?: string;
    suburb?: string;
    neighbourhood?: string;
    county?: string;
    district?: string;
    subdistrict?: string;
    state_district?: string;
    state?: string;
    postcode?: string;
    country?: string;
    category?: string;
    type?: string;
    landuse?: string;
    // Legacy compat
    villageOrCity?: string;
    pincode?: string;
  };
  loading?: boolean;
}

export type BasemapType = 'osm' | 'satellite' | 'topo';

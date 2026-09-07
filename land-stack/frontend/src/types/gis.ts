export interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
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
}

export interface ClickedLocation {
  lat: number;
  lng: number;
  displayName?: string;
  addressDetails?: {
    villageOrCity?: string;
    district?: string;
    state?: string;
    pincode?: string;
  };
  loading?: boolean;
}

export type BasemapType = 'osm' | 'satellite' | 'topo';

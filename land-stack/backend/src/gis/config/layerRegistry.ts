/** Central, declarative catalogue for map behaviour and provenance. */
export type LayerStatus = 'OFFICIAL' | 'OFFICIAL_API' | 'OFFICIAL_REFERENCE' | 'USER_UPLOADED' | 'PENDING_VERIFICATION' | 'DATA_UNAVAILABLE';
export type LayerSourceType = 'POSTGIS' | 'WMS' | 'WFS' | 'XYZ' | 'VECTOR_TILE' | 'GEOJSON';

export interface GisLayerDefinition {
  id: string; name: string; category: string; geometry_type: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon' | 'Mixed';
  source: string; source_type: LayerSourceType; table?: string; visibility: boolean; min_zoom: number; max_zoom: number;
  selectable: boolean; queryable: boolean; downloadable: boolean; searchable: boolean; style: Record<string, string | number>;
  attribution: string; update_frequency: string; data_status: LayerStatus; source_department: string; source_system: string;
  source_url?: string; dataset_name: string; last_verified?: string; license_or_usage_status: string; fields?: string[]; crs: 'EPSG:4326';
}

const unavailable = (id: string, name: string, category: string, geometry_type: GisLayerDefinition['geometry_type'], fields: string[] = []): GisLayerDefinition => ({
  id, name, category, geometry_type, source: 'Data unavailable', source_type: 'POSTGIS', visibility: false, min_zoom: 10, max_zoom: 22,
  selectable: false, queryable: false, downloadable: false, searchable: true, style: { color: '#94a3b8', opacity: 0.7 }, attribution: 'No official dataset connected',
  update_frequency: 'Unknown', data_status: 'DATA_UNAVAILABLE', source_department: 'Not connected', source_system: 'LAND STACK registry', dataset_name: name,
  license_or_usage_status: 'Requires legitimate official data ingestion', fields, crs: 'EPSG:4326',
});

const connected = (entry: Partial<GisLayerDefinition> & Pick<GisLayerDefinition, 'id' | 'name' | 'category' | 'geometry_type' | 'table'>): GisLayerDefinition => ({
  source: 'LAND STACK PostGIS catalogue', source_type: 'POSTGIS', visibility: false, min_zoom: 6, max_zoom: 22, selectable: true, queryable: true,
  downloadable: false, searchable: true, style: { color: '#2563eb', weight: 2, fillOpacity: 0.12 }, attribution: 'See dataset catalogue for record-level provenance',
  update_frequency: 'Dataset dependent', data_status: 'PENDING_VERIFICATION', source_department: 'LAND STACK data catalogue', source_system: 'PostGIS',
  dataset_name: entry.name, license_or_usage_status: 'Verify source status before operational use', fields: ['name'], crs: 'EPSG:4326', ...entry,
});

export const GIS_LAYER_REGISTRY: readonly GisLayerDefinition[] = [
  connected({ id: 'states', name: 'States', category: 'ADMINISTRATIVE', geometry_type: 'MultiPolygon', table: 'states', min_zoom: 4 }),
  connected({ id: 'districts', name: 'Districts', category: 'ADMINISTRATIVE', geometry_type: 'MultiPolygon', table: 'districts', min_zoom: 6 }),
  connected({ id: 'villages', name: 'Revenue Villages', category: 'ADMINISTRATIVE', geometry_type: 'MultiPolygon', table: 'villages', min_zoom: 10 }),
  unavailable('taluks', 'Taluks / Tehsils', 'ADMINISTRATIVE', 'MultiPolygon'), unavailable('blocks', 'Blocks', 'ADMINISTRATIVE', 'MultiPolygon'),
  unavailable('corporations', 'Corporations', 'ADMINISTRATIVE', 'MultiPolygon'), unavailable('municipalities', 'Municipalities', 'ADMINISTRATIVE', 'MultiPolygon'),
  unavailable('town_panchayats', 'Town Panchayats', 'ADMINISTRATIVE', 'MultiPolygon'), unavailable('panchayat_villages', 'Panchayat Villages', 'ADMINISTRATIVE', 'MultiPolygon'),
  unavailable('reserve_forests', 'Reserve Forest', 'FOREST', 'MultiPolygon'), unavailable('protected_areas', 'Protected Areas', 'FOREST', 'MultiPolygon'), unavailable('sanctuaries', 'Sanctuaries', 'FOREST', 'MultiPolygon'), unavailable('sipcot_estates', 'SIPCOT Estates', 'LAND_OWNERSHIP', 'MultiPolygon'),
  unavailable('national_highways', 'National Highways', 'TRANSPORT', 'LineString'), unavailable('state_highways', 'State Highways', 'TRANSPORT', 'LineString'), unavailable('major_district_roads', 'Major District Roads', 'TRANSPORT', 'LineString'), unavailable('other_district_roads', 'Other District Roads', 'TRANSPORT', 'LineString'),
  unavailable('schools', 'Schools', 'EDUCATION', 'Point'), unavailable('polytechnic_colleges', 'Polytechnic Colleges', 'EDUCATION', 'Point'), unavailable('arts_colleges', 'Arts Colleges', 'EDUCATION', 'Point'), unavailable('engineering_colleges', 'Engineering Colleges', 'EDUCATION', 'Point'),
  unavailable('bus_shelters', 'Bus Shelters', 'PUBLIC_UTILITIES', 'Point'), unavailable('tourism_locations', 'Tourism Locations', 'PUBLIC_UTILITIES', 'Point'), unavailable('government_offices', 'Government Offices', 'GOVERNMENT_FACILITIES', 'Point'), unavailable('warehouses', 'Warehouses', 'GOVERNMENT_FACILITIES', 'Point'),
  connected({ id: 'waterbodies', name: 'Water Bodies', category: 'WATER', geometry_type: 'MultiPolygon', table: 'waterbodies', min_zoom: 9 }), unavailable('drainage', 'Drainage', 'WATER', 'LineString'), unavailable('tanks', 'Tanks', 'WATER', 'Polygon'), unavailable('reservoirs', 'Reservoirs', 'WATER', 'Polygon'), unavailable('rivers', 'Rivers', 'WATER', 'LineString'),
  connected({ id: 'landuse', name: 'Land Use', category: 'LAND_USE', geometry_type: 'MultiPolygon', table: 'landuse', min_zoom: 8 }), unavailable('sis_dp_landuse', 'SIS-DP Land Use', 'LAND_USE', 'MultiPolygon'),
  connected({ id: 'roads', name: 'Road Network (catalogue)', category: 'TRANSPORT', geometry_type: 'LineString', table: 'roads', min_zoom: 8 }), connected({ id: 'geology', name: 'Geology', category: 'NATURAL_RESOURCES', geometry_type: 'MultiPolygon', table: 'geology' }), connected({ id: 'soil', name: 'Soil', category: 'NATURAL_RESOURCES', geometry_type: 'MultiPolygon', table: 'soil' }), connected({ id: 'elevation', name: 'Elevation', category: 'ENVIRONMENT', geometry_type: 'MultiPolygon', table: 'elevation' }), connected({ id: 'risk_zones', name: 'Risk Zones', category: 'ENVIRONMENT', geometry_type: 'MultiPolygon', table: 'risk_zones' }),
];
export const getLayerDefinition = (id: string) => GIS_LAYER_REGISTRY.find(layer => layer.id === id.toLowerCase().trim());

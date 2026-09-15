import { gisRepository } from '../repositories/gisRepository.js';
import { datasetCatalogService } from './datasetCatalog.js';
import { importVillageBoundaries, importVillageBoundaryZips } from '../scripts/villageBoundaryImporter.js';
import {
  validateCoordinates,
  validateRadius,
  validateLayer,
  parseBbox,
} from '../validators/gisValidator.js';
import { GIS_LAYER_REGISTRY, getLayerDefinition } from '../config/layerRegistry.js';

export class GisService {
  async getHealth() {
    return await gisRepository.checkHealth();
  }

  async search(query: string) {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return [];
    }
    return await gisRepository.searchLocations(query);
  }

  async getLocation(latStr: any, lngStr: any) {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    const coordVal = validateCoordinates(lat, lng);
    if (!coordVal.valid) {
      throw { status: 400, message: coordVal.error };
    }

    return await gisRepository.getLocationByPoint(lat, lng);
  }

  async getLayers() {
    const legacy = await gisRepository.getLayersList();
    return GIS_LAYER_REGISTRY.map(definition => {
      const old = legacy.find((layer: any) => layer.layer === definition.id);
      return { ...definition, layer: definition.id, displayName: definition.name, geometryType: definition.geometry_type, available: Boolean(definition.table), sourceStatus: old?.sourceStatus || definition.data_status, version: old?.version, organization: old?.organization, updatedAt: old?.updatedAt || definition.last_verified || null };
    });
  }

  async getLayerMetadata(layerId: string) {
    const layer = getLayerDefinition(layerId);
    if (!layer) throw { status: 404, message: `GIS layer '${layerId}' is not registered.` };
    return layer;
  }

  async getRegistryFeatures(layerId: string, bbox?: string) {
    const layer = await this.getLayerMetadata(layerId);
    if (!layer.table) return { type: 'FeatureCollection', features: [], metadata: layer, message: 'Data unavailable' };
    const geojson = await gisRepository.getLayerGeoJSON(layer.table, parseBbox(bbox));
    return { ...geojson, metadata: layer };
  }

  async pointQuery(latStr: any, lngStr: any, enabledLayerIds?: unknown) {
    const lat = Number(latStr), lng = Number(lngStr);
    const coordinate = validateCoordinates(lat, lng); if (!coordinate.valid) throw { status: 400, message: coordinate.error };
    const requested = Array.isArray(enabledLayerIds) ? enabledLayerIds.filter((id): id is string => typeof id === 'string') : GIS_LAYER_REGISTRY.filter(l => l.queryable).map(l => l.id);
    const administration = await this.getLocation(lat, lng);
    const layers = await Promise.all(requested.slice(0, 20).map(async id => {
      const layer = getLayerDefinition(id); if (!layer) return { id, status: 'UNKNOWN_LAYER', features: [] };
      if (!layer.table || !layer.queryable) return { id, status: 'DATA_UNAVAILABLE', features: [] };
      const result = await gisRepository.getFeatureInfoAtPoint(layer.table, lat, lng);
      return { id, status: 'OK', features: result?.found ? [result] : [] };
    }));
    return { location: { latitude: lat, longitude: lng }, administration, layers };
  }

  async withinDistance(latStr: any, lngStr: any, radiusStr: any, layerIds?: unknown) {
    const lat = Number(latStr), lng = Number(lngStr), radius = Number(radiusStr);
    const coordinate = validateCoordinates(lat, lng); if (!coordinate.valid) throw { status: 400, message: coordinate.error };
    const validRadius = validateRadius(radius); if (!validRadius.valid) throw { status: 400, message: validRadius.error };
    const ids = Array.isArray(layerIds) ? layerIds : ['roads', 'waterbodies'];
    const results: Record<string, unknown> = {};
    for (const id of ids) {
      if (id === 'roads') results.roads = await gisRepository.findNearbyRoads(lat, lng, radius);
      else if (id === 'waterbodies') results.waterbodies = await gisRepository.findNearbyWater(lat, lng, radius);
      else results[String(id)] = { status: 'DATA_UNAVAILABLE', features: [] };
    }
    return { location: { latitude: lat, longitude: lng }, radius_meters: radius, results };
  }

  async getLayerGeoJSON(layerName: string, bboxStr?: string) {
    const layerVal = validateLayer(layerName);
    if (!layerVal.valid) {
      throw { status: 400, message: layerVal.error };
    }

    const cleanLayer = layerName.toLowerCase().trim();
    const bbox = parseBbox(bboxStr);

    return await gisRepository.getLayerGeoJSON(cleanLayer, bbox);
  }

  async getBoundaries(type?: string, stateFilter?: string, districtFilter?: string) {
    const layerType = type ? type.toLowerCase().trim() : 'states';
    if (!['state', 'states', 'district', 'districts', 'village', 'villages'].includes(layerType)) {
      throw { status: 400, message: `Invalid boundary type '${type}'. Must be 'state', 'district', or 'village'.` };
    }

    const layerName = layerType.endsWith('s') ? layerType : `${layerType}s`;
    return await gisRepository.getLayerGeoJSON(layerName);
  }

  async getNearbyWater(latStr: any, lngStr: any, radiusStr: any) {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    const radius = parseFloat(radiusStr || '5000');

    const coordVal = validateCoordinates(lat, lng);
    if (!coordVal.valid) {
      throw { status: 400, message: coordVal.error };
    }

    const radVal = validateRadius(radius);
    if (!radVal.valid) {
      throw { status: 400, message: radVal.error };
    }

    const waterbodies = await gisRepository.findNearbyWater(lat, lng, radius);
    return {
      query: { latitude: lat, longitude: lng, radiusMeters: radius },
      totalFound: waterbodies.length,
      waterbodies,
    };
  }

  async getNearbyRoads(latStr: any, lngStr: any, radiusStr: any) {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    const radius = parseFloat(radiusStr || '5000');

    const coordVal = validateCoordinates(lat, lng);
    if (!coordVal.valid) {
      throw { status: 400, message: coordVal.error };
    }

    const radVal = validateRadius(radius);
    if (!radVal.valid) {
      throw { status: 400, message: radVal.error };
    }

    const roads = await gisRepository.findNearbyRoads(lat, lng, radius);
    return {
      query: { latitude: lat, longitude: lng, radiusMeters: radius },
      totalFound: roads.length,
      roads,
    };
  }

  async getCombinedAnalysis(latStr: any, lngStr: any) {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    const coordVal = validateCoordinates(lat, lng);
    if (!coordVal.valid) {
      throw { status: 400, message: coordVal.error };
    }

    return await gisRepository.getCombinedAnalysis(lat, lng);
  }

  // ─── Phase 5: Dataset Catalog API ──────────────────────────

  async getDatasets(category?: string, sourceStatus?: string) {
    return await datasetCatalogService.listDatasets({
      category,
      source_status: sourceStatus,
    });
  }

  async getDatasetById(datasetId: string) {
    if (!datasetId || typeof datasetId !== 'string') {
      throw { status: 400, message: 'Dataset ID is required.' };
    }

    const ds = await datasetCatalogService.getDatasetById(datasetId);
    if (!ds) {
      throw { status: 404, message: `Dataset '${datasetId}' not found.` };
    }

    return ds;
  }

  // ─── Village Boundary Data Base of Entire India API ─────────

  async getVillageStats() {
    return await gisRepository.getVillageSummaryStats();
  }

  async uploadVillageZip(buffer: Buffer, filename: string) {
    if (!buffer || buffer.length === 0) {
      throw { status: 400, message: 'Uploaded file is empty or invalid.' };
    }
    if (!filename.toLowerCase().endsWith('.zip')) {
      throw { status: 400, message: 'Only ZIP shapefile archives (.zip) are supported.' };
    }
    return await gisRepository.importVillageZipBuffer(buffer, filename);
  }

  async triggerVillageImporter() {
    return await importVillageBoundaryZips();
  }

  // ─── TNGIS Phase 1: Multi-Layer Spatial Overlay ────────────────

  async getParcelSpatialOverlay(ulpin: string, layersParam: string) {
    if (!ulpin || typeof ulpin !== 'string' || ulpin.trim().length === 0) {
      throw { status: 400, message: 'ULPIN parameter is required.' };
    }

    if (!layersParam || typeof layersParam !== 'string' || layersParam.trim().length === 0) {
      throw { status: 400, message: 'layers query parameter is required (comma-separated layer names).' };
    }

    const requestedLayers = layersParam.split(',').map(l => l.trim().toLowerCase()).filter(Boolean);
    if (requestedLayers.length === 0) {
      throw { status: 400, message: 'At least one layer must be specified.' };
    }
    if (requestedLayers.length > 3) {
      throw { status: 400, message: 'Maximum 3 layers per overlay request (same limit as TNGIS Area of Interest).' };
    }

    // Validate each layer name
    const allowedOverlayLayers = ['geology', 'soil', 'landuse', 'waterbodies', 'roads', 'elevation', 'risk_zones'];
    for (const layer of requestedLayers) {
      if (!allowedOverlayLayers.includes(layer)) {
        throw { status: 400, message: `Invalid overlay layer '${layer}'. Allowed: ${allowedOverlayLayers.join(', ')}.` };
      }
    }

    return await gisRepository.getParcelSpatialOverlay(ulpin.trim(), requestedLayers);
  }

  // ─── TNGIS Phase 2: Generic Click-to-Query ────────────────────

  async getFeatureInfo(layer: string, latStr: any, lngStr: any) {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    const coordVal = validateCoordinates(lat, lng);
    if (!coordVal.valid) {
      throw { status: 400, message: coordVal.error };
    }

    if (!layer || typeof layer !== 'string') {
      throw { status: 400, message: 'layer query parameter is required.' };
    }

    const cleanLayer = layer.toLowerCase().trim();
    const allowedInfoLayers = ['geology', 'soil', 'landuse', 'waterbodies', 'roads', 'elevation', 'risk_zones', 'parcels'];
    if (!allowedInfoLayers.includes(cleanLayer)) {
      throw { status: 400, message: `Invalid layer '${layer}'. Allowed: ${allowedInfoLayers.join(', ')}.` };
    }

    return await gisRepository.getFeatureInfoAtPoint(cleanLayer, lat, lng);
  }

  // ─── TNGIS Phase 5: Upload-and-Overlay Preview ────────────────

  async getOverlayPreview(buffer: Buffer, filename: string) {
    if (!buffer || buffer.length === 0) {
      throw { status: 400, message: 'Uploaded file is empty or invalid.' };
    }

    const lowerName = filename.toLowerCase();
    let features: any[] = [];

    if (lowerName.endsWith('.geojson') || lowerName.endsWith('.json')) {
      // Parse GeoJSON directly
      try {
        const parsed = JSON.parse(buffer.toString('utf-8'));
        if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
          features = parsed.features;
        } else if (parsed.type === 'Feature') {
          features = [parsed];
        } else {
          throw new Error('Invalid GeoJSON format.');
        }
      } catch (e: any) {
        throw { status: 400, message: `Failed to parse GeoJSON: ${e.message}` };
      }
    } else if (lowerName.endsWith('.zip')) {
      // Parse shapefile ZIP using existing AdmZip + shapefile pattern
      try {
        const AdmZip = (await import('adm-zip')).default;
        const shapefileLib = await import('shapefile');
        const zip = new AdmZip(buffer);
        const entries = zip.getEntries();
        const shpEntry = entries.find(e => e.entryName.toLowerCase().endsWith('.shp'));
        const dbfEntry = entries.find(e => e.entryName.toLowerCase().endsWith('.dbf'));
        if (!shpEntry || !dbfEntry) {
          throw new Error('ZIP must contain .shp and .dbf files.');
        }
        const geojson = await shapefileLib.read(shpEntry.getData(), dbfEntry.getData());
        features = geojson.features || [];
      } catch (e: any) {
        throw { status: 400, message: `Failed to parse Shapefile ZIP: ${e.message}` };
      }
    } else {
      throw { status: 400, message: 'Only .geojson, .json, and .zip (Shapefile) files are supported.' };
    }

    if (features.length === 0) {
      throw { status: 400, message: 'Uploaded file contains no valid features.' };
    }

    return await gisRepository.getOverlayPreview(features);
  }

  // ─── Hierarchy Drill-Down ─────────────────────────────────────

  async listDistricts(state: string) {
    if (!state || typeof state !== 'string' || state.trim().length === 0) {
      throw { status: 400, message: 'state query parameter is required.' };
    }
    return await gisRepository.listDistricts(state.trim());
  }

  async listTaluks(state: string, district: string) {
    if (!state || !district) {
      throw { status: 400, message: 'state and district query parameters are required.' };
    }
    return await gisRepository.listTaluks(state.trim(), district.trim());
  }

  async listVillages(state: string, district: string, taluk: string) {
    if (!state || !district || !taluk) {
      throw { status: 400, message: 'state, district, and taluk query parameters are required.' };
    }
    return await gisRepository.listVillages(state.trim(), district.trim(), taluk.trim());
  }

  async listSurveyNumbers(state: string, district: string, taluk: string, village: string) {
    if (!state || !district || !taluk || !village) {
      throw { status: 400, message: 'state, district, taluk, and village query parameters are required.' };
    }
    return await gisRepository.listSurveyNumbers(state.trim(), district.trim(), taluk.trim(), village.trim());
  }

  async getBoundaryGeometry(level: string, filters: Record<string, string>) {
    const validLevels = ['district', 'subdistrict', 'village'];
    if (!level || !validLevels.includes(level.toLowerCase())) {
      throw { status: 400, message: `level must be one of: ${validLevels.join(', ')}.` };
    }
    return await gisRepository.getBoundaryGeometry(level.toLowerCase() as 'district' | 'subdistrict' | 'village', filters);
  }
}

export const gisService = new GisService();

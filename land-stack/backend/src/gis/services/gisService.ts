import { gisRepository } from '../repositories/gisRepository.js';
import { datasetCatalogService } from './datasetCatalog.js';
import { importVillageBoundaryZips } from '../scripts/villageBoundaryImporter.js';
import {
  validateCoordinates,
  validateRadius,
  validateLayer,
  parseBbox,
} from '../validators/gisValidator.js';

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
    return await gisRepository.getLayersList();
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
}

export const gisService = new GisService();

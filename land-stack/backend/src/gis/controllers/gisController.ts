import { Request, Response } from 'express';
import { gisService } from '../services/gisService.js';

export class GisController {
  // 1. GET /api/gis/health
  async getHealth(req: Request, res: Response) {
    try {
      const health = await gisService.getHealth();
      res.json({
        status: 'HEALTHY',
        service: 'LAND STACK Spatial PostGIS API',
        phase: 5,
        postgisConnected: health.postgisConnected,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to verify GIS API health.' });
    }
  }

  // 2. GET /api/gis/search?q={query}
  async search(req: Request, res: Response) {
    try {
      const { q } = req.query;
      const queryStr = (q as string) || '';
      const results = await gisService.search(queryStr);
      res.json({
        query: queryStr,
        total: results.length,
        results,
      });
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || 'Spatial search failed.' });
    }
  }

  // 3. GET /api/gis/location?lat={latitude}&lng={longitude}
  async getLocation(req: Request, res: Response) {
    try {
      const { lat, lng } = req.query;
      const location = await gisService.getLocation(lat, lng);
      res.json(location);
    } catch (err: any) {
      res.status(err.status || 400).json({ error: err.message || 'Location lookup failed.' });
    }
  }

  // 4. GET /api/gis/layers
  async getLayers(req: Request, res: Response) {
    try {
      const layers = await gisService.getLayers();
      res.json({
        total: layers.length,
        layers,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve available GIS layers.' });
    }
  }

  // 5. GET /api/gis/layer/:layer
  async getLayer(req: Request, res: Response) {
    try {
      const { layer } = req.params;
      const { bbox } = req.query;
      const geojson = await gisService.getLayerGeoJSON(layer, bbox as string);
      res.json(geojson);
    } catch (err: any) {
      res.status(err.status || 400).json({ error: err.message || `Failed to fetch layer '${req.params.layer}'.` });
    }
  }

  // 6. GET /api/gis/boundaries?type={type}
  async getBoundaries(req: Request, res: Response) {
    try {
      const { type, state, district } = req.query;
      const geojson = await gisService.getBoundaries(type as string, state as string, district as string);
      res.json(geojson);
    } catch (err: any) {
      res.status(err.status || 400).json({ error: err.message || 'Failed to fetch administrative boundaries.' });
    }
  }

  // 7. GET /api/gis/nearby/water?lat={lat}&lng={lng}&radius={meters}
  async getNearbyWater(req: Request, res: Response) {
    try {
      const { lat, lng, radius } = req.query;
      const result = await gisService.getNearbyWater(lat, lng, radius);
      res.json(result);
    } catch (err: any) {
      res.status(err.status || 400).json({ error: err.message || 'Failed to query nearby waterbodies.' });
    }
  }

  // 8. GET /api/gis/nearby/roads?lat={lat}&lng={lng}&radius={meters}
  async getNearbyRoads(req: Request, res: Response) {
    try {
      const { lat, lng, radius } = req.query;
      const result = await gisService.getNearbyRoads(lat, lng, radius);
      res.json(result);
    } catch (err: any) {
      res.status(err.status || 400).json({ error: err.message || 'Failed to query nearby roads.' });
    }
  }

  // 9. GET /api/gis/analysis?lat={lat}&lng={lng}
  async getAnalysis(req: Request, res: Response) {
    try {
      const { lat, lng } = req.query;
      const analysis = await gisService.getCombinedAnalysis(lat, lng);
      res.json(analysis);
    } catch (err: any) {
      res.status(err.status || 400).json({ error: err.message || 'Failed to compute GIS location analysis.' });
    }
  }

  // ─── Phase 5: Dataset Catalog Endpoints ──────────────────────

  // 10. GET /api/gis/datasets?category={cat}&sourceStatus={status}
  async getDatasets(req: Request, res: Response) {
    try {
      const { category, sourceStatus } = req.query;
      const datasets = await gisService.getDatasets(
        category as string | undefined,
        sourceStatus as string | undefined,
      );
      res.json({
        total: datasets.length,
        datasets,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve dataset catalog.' });
    }
  }

  // 11. GET /api/gis/datasets/:datasetId
  async getDatasetById(req: Request, res: Response) {
    try {
      const { datasetId } = req.params;
      const dataset = await gisService.getDatasetById(datasetId);
      res.json(dataset);
    } catch (err: any) {
      res.status(err.status || 404).json({ error: err.message || 'Dataset not found.' });
    }
  }

  // ─── Village Boundary Data Base of Entire India Endpoints ────

  // 12. GET /api/gis/villages/stats
  async getVillageStats(req: Request, res: Response) {
    try {
      const stats = await gisService.getVillageStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch village boundary statistics.' });
    }
  }

  // 13. POST /api/gis/datasets/upload-zip
  async uploadVillageZip(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No ZIP file uploaded. Please send file in multipart field "file".' });
      }

      const result = await gisService.uploadVillageZip(file.buffer, file.originalname);
      res.json({
        message: `Successfully processed shapefile ZIP ${file.originalname}`,
        ...result,
      });
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || 'Failed to process uploaded ZIP file.' });
    }
  }

  // 14. POST /api/gis/villages/import-all
  async triggerVillageImporter(req: Request, res: Response) {
    try {
      const result = await gisService.triggerVillageImporter();
      res.json({
        message: 'Village boundary ZIP importer completed.',
        ...result,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to trigger village ZIP importer.' });
    }
  }
}

export const gisController = new GisController();

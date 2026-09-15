import { Router, Request, Response } from 'express';
import { envConfig } from '../config/envConfig.js';

const router = Router();

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'LAND STACK SIH 2026 Enterprise API',
    description: 'Decoupled Government DPI Architecture providing Parcel-Centric Land Administration & GIS Spatial Analysis.',
    version: '2.0.0'
  },
  servers: [
    { url: `http://localhost:${envConfig.port}/api/v1`, description: 'Local Development REST Server' }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'System Health Check',
        responses: { '200': { description: 'System status payload' } }
      }
    },
    '/health/database': {
      get: {
        summary: 'Database Health Check',
        responses: { '200': { description: 'PostgreSQL/PostGIS status' } }
      }
    },
    '/health/spatial': {
      get: {
        summary: 'Spatial Engine Health Check',
        responses: { '200': { description: 'PostGIS & TNGIS status' } }
      }
    },
    '/parcels': {
      get: {
        summary: 'List / Filter Cadastral Parcels',
        responses: { '200': { description: 'Array of land parcels' } }
      }
    },
    '/gis/layer/{layer}': {
      get: {
        summary: 'Retrieve Vector Layer GeoJSON',
        parameters: [{ name: 'layer', in: 'path', required: true }],
        responses: { '200': { description: 'GeoJSON FeatureCollection' } }
      }
    }
  }
};

router.get('/openapi.json', (_req: Request, res: Response) => {
  res.json(openApiSpec);
});

router.get('/docs', (_req: Request, res: Response) => {
  res.send(`
    <!Valid HTML>
    <html>
      <head>
        <title>LAND STACK API Specs</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
        <script>
          SwaggerUIBundle({
            url: '/api/v1/openapi.json',
            dom_id: '#swagger-ui',
          });
        </script>
      </body>
    </html>
  `);
});

export default router;

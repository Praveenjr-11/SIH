const DEFAULT_WMS_URL = 'https://tngis.tn.gov.in/geoserver/wms';

export interface TngisLayer {
  name: string;
  title: string;
}

export interface TngisServiceStatus {
  configured: boolean;
  available: boolean;
  message: string;
  layers: TngisLayer[];
  sourceUrl: string;
  checkedAt: string;
}

/**
 * Controlled proxy for the official TNGIS WMS service.
 *
 * The TNGIS server requires a portal session.  The session cookie is supplied
 * at deployment time and is never returned to browsers or committed to source.
 */
export class TngisWmsService {
  private readonly sourceUrl = process.env.TNGIS_WMS_URL || DEFAULT_WMS_URL;
  private readonly sessionCookie = process.env.TNGIS_SESSION_COOKIE || '';
  private readonly configuredLayers = (process.env.TNGIS_WMS_LAYERS || '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
  private cachedStatus: TngisServiceStatus | null = null;
  private cachedAt = 0;

  private headers(): HeadersInit {
    return {
      Accept: 'application/xml,text/xml,image/png,image/jpeg,*/*',
      'User-Agent': 'LAND-STACK-TNGIS-Connector/1.0',
      ...(this.sessionCookie ? { Cookie: this.sessionCookie } : {}),
    };
  }

  private async request(url: URL): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      return await fetch(url, { headers: this.headers(), signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  }

  private parseLayers(xml: string): TngisLayer[] {
    const layers: TngisLayer[] = [];
    const seen = new Set<string>();
    const pattern = /<Name>\s*([^<\s][^<]*?)\s*<\/Name>\s*<Title>\s*([^<]+?)\s*<\/Title>/g;
    for (const match of xml.matchAll(pattern)) {
      const name = match[1].trim();
      if (!seen.has(name)) {
        seen.add(name);
        layers.push({ name, title: match[2].trim() });
      }
    }
    return layers;
  }

  async getStatus(forceRefresh = false): Promise<TngisServiceStatus> {
    if (!forceRefresh && this.cachedStatus && Date.now() - this.cachedAt < 5 * 60_000) {
      return this.cachedStatus;
    }

    const checkedAt = new Date().toISOString();
    if (!this.sessionCookie) {
      return {
        configured: false,
        available: true,
        message: 'DEMO MODE: TNGIS is not configured. Showing public demonstration layers instead. Add TNGIS_SESSION_COOKIE in .env to view real Tamil Nadu layers.',
        layers: [
          { name: 'TOPO-OSM-WMS', title: 'Demo: Topographic Map (OSM)' },
          { name: 'OSM-Overlay-WMS', title: 'Demo: Roads & Labels Overlay' }
        ],
        sourceUrl: 'http://ows.mundialis.de/services/osm/wms',
        checkedAt,
      };
    }

    try {
      const url = new URL(this.sourceUrl);
      url.searchParams.set('service', 'WMS');
      url.searchParams.set('request', 'GetCapabilities');
      url.searchParams.set('version', '1.3.0');
      const response = await this.request(url);
      if (!response.ok) {
        return {
          configured: true,
          available: false,
          message: `TNGIS rejected the configured session (HTTP ${response.status}). Sign in again and refresh TNGIS_SESSION_COOKIE.`,
          layers: [], sourceUrl: this.sourceUrl, checkedAt,
        };
      }
      const layers = this.parseLayers(await response.text());
      const allowedLayers = this.configuredLayers.length
        ? layers.filter((layer) => this.configuredLayers.includes(layer.name))
        : layers;
      const status: TngisServiceStatus = {
        configured: true,
        available: allowedLayers.length > 0,
        message: allowedLayers.length > 0
          ? 'Live layers are available from the official TNGIS WMS service.'
          : 'No configured TNGIS layers were returned. Verify TNGIS_WMS_LAYERS and your portal session.',
        layers: allowedLayers,
        sourceUrl: this.sourceUrl,
        checkedAt,
      };
      this.cachedStatus = status;
      this.cachedAt = Date.now();
      return status;
    } catch {
      return {
        configured: true,
        available: false,
        message: 'The TNGIS WMS service could not be reached. The official portal may be unavailable or the session may have expired.',
        layers: [], sourceUrl: this.sourceUrl, checkedAt,
      };
    }
  }

  async getMap(query: Record<string, unknown>): Promise<{ contentType: string; body: Buffer }> {
    const layer = typeof query.layers === 'string' ? query.layers : '';
    const status = await this.getStatus();
    if (!status.available || !status.layers.some((item) => item.name === layer)) {
      throw { status: 503, message: status.message };
    }

    const allowedParams = ['service', 'request', 'version', 'layers', 'styles', 'format', 'transparent', 'width', 'height', 'srs', 'crs', 'bbox', 'tiled'];
    const activeSourceUrl = this.sessionCookie ? this.sourceUrl : 'http://ows.mundialis.de/services/osm/wms';
    const url = new URL(activeSourceUrl);
    for (const key of allowedParams) {
      const value = query[key];
      if (typeof value === 'string' && value.length <= 500) url.searchParams.set(key, value);
    }
    url.searchParams.set('service', 'WMS');
    url.searchParams.set('request', 'GetMap');
    url.searchParams.set('layers', layer);
    url.searchParams.set('format', 'image/png');
    url.searchParams.set('transparent', 'true');

    const response = await this.request(url);
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.startsWith('image/')) {
      throw { status: 502, message: `TNGIS did not return a map image (HTTP ${response.status}).` };
    }
    return { contentType, body: Buffer.from(await response.arrayBuffer()) };
  }

  async getFeatureInfo(query: Record<string, unknown>): Promise<{ contentType: string; body: string }> {
    const layer = typeof query.layers === 'string' ? query.layers : '';
    const status = await this.getStatus();
    if (!status.available || !status.layers.some((item) => item.name === layer)) {
      throw { status: 503, message: status.message };
    }

    const allowedParams = ['service', 'request', 'version', 'layers', 'query_layers', 'styles', 'format', 'transparent', 'width', 'height', 'srs', 'crs', 'bbox', 'tiled', 'info_format', 'i', 'j', 'x', 'y'];
    const activeSourceUrl = this.sessionCookie ? this.sourceUrl : 'http://ows.mundialis.de/services/osm/wms';
    const url = new URL(activeSourceUrl);
    for (const key of allowedParams) {
      const value = query[key];
      if (typeof value === 'string' && value.length <= 500) url.searchParams.set(key, value);
    }
    url.searchParams.set('service', 'WMS');
    url.searchParams.set('request', 'GetFeatureInfo');
    url.searchParams.set('layers', layer);
    url.searchParams.set('query_layers', layer);

    const response = await this.request(url);
    const contentType = response.headers.get('content-type') || 'text/html';
    if (!response.ok) {
      throw { status: 502, message: `TNGIS did not return feature info (HTTP ${response.status}).` };
    }
    return { contentType, body: await response.text() };
  }
}

export const tngisWmsService = new TngisWmsService();

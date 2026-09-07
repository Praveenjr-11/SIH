import { datasetRepository, DatasetRecord } from '../repositories/datasetRepository.js';

/**
 * Predefined mock dataset entries for Phase 4 mock data
 * These are registered when the seeder runs so mock data is properly cataloged
 */
export const MOCK_DATASET_DEFINITIONS: DatasetRecord[] = [
  {
    dataset_id: 'mock-states-v1',
    name: 'India State Boundaries (Mock)',
    category: 'administrative',
    source: 'MOCK_SURVEY',
    source_url: null as any,
    organization: 'Land Stack Development',
    version: '1.0.0-mock',
    license: 'Internal Development Use Only',
    attribution: 'Mock data for development — not real Survey of India data',
    crs: 'EPSG:4326',
    coverage: 'India (simplified bounding boxes)',
    scale: 'Not to scale',
    source_status: 'MOCK' as const,
    notes: 'Phase 4 mock state boundaries using simple bounding-box rectangles',
  },
  {
    dataset_id: 'mock-districts-v1',
    name: 'India District Boundaries (Mock)',
    category: 'administrative',
    source: 'MOCK_SURVEY',
    organization: 'Land Stack Development',
    version: '1.0.0-mock',
    license: 'Internal Development Use Only',
    attribution: 'Mock data for development',
    crs: 'EPSG:4326',
    coverage: 'Select districts (simplified bounding boxes)',
    source_status: 'MOCK' as const,
    notes: 'Phase 4 mock district boundaries',
  },
  {
    dataset_id: 'mock-geology-v1',
    name: 'GSI Geological Map (Mock)',
    category: 'geology',
    source: 'MOCK_GSI',
    organization: 'Land Stack Development',
    version: '1.0.0-mock',
    license: 'Internal Development Use Only',
    attribution: 'MOCK data — NOT real Geological Survey of India data',
    crs: 'EPSG:4326',
    coverage: 'Sriperumbudur & Pune regions (simplified)',
    source_status: 'MOCK' as const,
    notes: 'Phase 4 mock geology. Must be replaced with real GSI data from NGDR portal.',
  },
  {
    dataset_id: 'mock-soil-v1',
    name: 'Soil Classification (Mock)',
    category: 'soil',
    source: 'MOCK',
    organization: 'Land Stack Development',
    version: '1.0.0-mock',
    source_status: 'MOCK' as const,
    notes: 'Phase 4 mock soil data',
  },
  {
    dataset_id: 'mock-landuse-v1',
    name: 'Land Use / Land Cover (Mock)',
    category: 'landuse',
    source: 'MOCK',
    organization: 'Land Stack Development',
    version: '1.0.0-mock',
    source_status: 'MOCK' as const,
    notes: 'Phase 4 mock LULC data',
  },
  {
    dataset_id: 'mock-waterbodies-v1',
    name: 'Water Bodies (Mock)',
    category: 'water',
    source: 'MOCK',
    organization: 'Land Stack Development',
    version: '1.0.0-mock',
    source_status: 'MOCK' as const,
  },
  {
    dataset_id: 'mock-roads-v1',
    name: 'Road Network (Mock)',
    category: 'roads',
    source: 'MOCK',
    organization: 'Land Stack Development',
    version: '1.0.0-mock',
    source_status: 'MOCK' as const,
  },
  {
    dataset_id: 'mock-riskzones-v1',
    name: 'Risk Zones (Mock)',
    category: 'hazard',
    source: 'MOCK',
    organization: 'Land Stack Development',
    version: '1.0.0-mock',
    source_status: 'MOCK' as const,
  },
];

export class DatasetCatalogService {
  /**
   * Register all mock datasets into the catalog
   */
  async registerMockDatasets(): Promise<void> {
    for (const ds of MOCK_DATASET_DEFINITIONS) {
      await datasetRepository.registerDataset(ds);
    }
    console.log(`📋 Registered ${MOCK_DATASET_DEFINITIONS.length} mock datasets in catalog.`);
  }

  /**
   * Register a real dataset into the catalog
   */
  async registerRealDataset(ds: DatasetRecord): Promise<DatasetRecord> {
    return await datasetRepository.registerDataset(ds);
  }

  /**
   * List all datasets with optional filtering
   */
  async listDatasets(filters?: { category?: string; source_status?: string; status?: string }) {
    const datasets = await datasetRepository.listDatasets(filters);

    // If PostGIS is not available, return the predefined mock definitions
    if (datasets.length === 0) {
      return MOCK_DATASET_DEFINITIONS.map(ds => ({
        ...ds,
        ingested_at: new Date().toISOString(),
        status: 'active',
      }));
    }

    return datasets;
  }

  /**
   * Get a single dataset's full metadata
   */
  async getDatasetById(datasetId: string) {
    const ds = await datasetRepository.getDatasetById(datasetId);

    // Fallback to predefined definitions
    if (!ds) {
      return MOCK_DATASET_DEFINITIONS.find(d => d.dataset_id === datasetId) || null;
    }

    return ds;
  }

  /**
   * Get provenance for a specific layer
   */
  async getLayerProvenance(tableName: string) {
    const provenance = await datasetRepository.getLayerProvenance(tableName);

    if (!provenance) {
      // Return a default provenance based on table name
      const categoryMap: Record<string, DatasetRecord | undefined> = {
        states: MOCK_DATASET_DEFINITIONS.find(d => d.dataset_id === 'mock-states-v1'),
        districts: MOCK_DATASET_DEFINITIONS.find(d => d.dataset_id === 'mock-districts-v1'),
        geology: MOCK_DATASET_DEFINITIONS.find(d => d.dataset_id === 'mock-geology-v1'),
        soil: MOCK_DATASET_DEFINITIONS.find(d => d.dataset_id === 'mock-soil-v1'),
        landuse: MOCK_DATASET_DEFINITIONS.find(d => d.dataset_id === 'mock-landuse-v1'),
        waterbodies: MOCK_DATASET_DEFINITIONS.find(d => d.dataset_id === 'mock-waterbodies-v1'),
        roads: MOCK_DATASET_DEFINITIONS.find(d => d.dataset_id === 'mock-roads-v1'),
        risk_zones: MOCK_DATASET_DEFINITIONS.find(d => d.dataset_id === 'mock-riskzones-v1'),
      };
      return categoryMap[tableName] || null;
    }

    return provenance;
  }
}

export const datasetCatalogService = new DatasetCatalogService();

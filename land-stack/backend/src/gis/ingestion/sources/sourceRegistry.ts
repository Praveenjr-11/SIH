/**
 * Source Registry — documented provenance for every real data source
 * 
 * This is the authoritative list of datasets used by the platform.
 * Every dataset has a verified source, documented access conditions,
 * and tracked provenance metadata.
 */

import { DatasetRecord } from '../../repositories/datasetRepository.js';

/**
 * TIER 1: Administrative Boundaries
 * Source: geoBoundaries (open license)
 * https://www.geoboundaries.org/
 */
export const GEOBOUNDARIES_STATES: DatasetRecord = {
  dataset_id: 'geoboundaries-ind-adm1',
  name: 'India State & UT Boundaries (ADM1)',
  category: 'administrative',
  source: 'geoBoundaries',
  source_url: 'https://www.geoboundaries.org/api/current/gbOpen/IND/ADM1/',
  organization: 'geoBoundaries / William & Mary geoLab',
  version: '6.0.0',
  publication_date: '2024-03-15',
  license: 'CC BY 4.0 / Open Database License',
  attribution: 'geoBoundaries. https://www.geoboundaries.org. Accessed via gbOpen API.',
  crs: 'EPSG:4326',
  coverage: 'India — 36 States and Union Territories',
  scale: '1:250,000 to 1:1,000,000 (varies)',
  source_status: 'REAL',
  notes: 'Open-license standardized administrative boundaries. Derived from government sources with community verification.',
};

export const GEOBOUNDARIES_DISTRICTS: DatasetRecord = {
  dataset_id: 'geoboundaries-ind-adm2',
  name: 'India District Boundaries (ADM2)',
  category: 'administrative',
  source: 'geoBoundaries',
  source_url: 'https://www.geoboundaries.org/api/current/gbOpen/IND/ADM2/',
  organization: 'geoBoundaries / William & Mary geoLab',
  version: '6.0.0',
  publication_date: '2024-03-15',
  license: 'CC BY 4.0 / Open Database License',
  attribution: 'geoBoundaries. https://www.geoboundaries.org. Accessed via gbOpen API.',
  crs: 'EPSG:4326',
  coverage: 'India — 780+ Districts',
  scale: '1:250,000 to 1:1,000,000 (varies)',
  source_status: 'REAL',
  notes: 'Open-license standardized district boundaries.',
};

/**
 * TIER 2: GSI Geology
 * Source: GSI National Geoscience Data Repository (NGDR)
 * https://geodataindia.gov.in/
 * 
 * ACCESS REQUIREMENTS:
 * - User registration on NGDR portal required
 * - Some datasets may require approval from GSI
 * - Data must be downloaded manually and placed in gis-data/raw/gsi/
 * 
 * DO NOT fabricate API endpoints for NGDR.
 * DO NOT scrape the NGDR web map interface.
 */
export const GSI_GEOLOGY_MAP: DatasetRecord = {
  dataset_id: 'gsi-geology-india',
  name: 'Geological Map of India',
  category: 'geology',
  source: 'Geological Survey of India (GSI)',
  source_url: 'https://geodataindia.gov.in/',
  organization: 'Geological Survey of India (GSI), Ministry of Mines, Government of India',
  version: 'To be determined from downloaded dataset',
  license: 'Government of India — check NGDR portal terms of use',
  attribution: 'Geological Survey of India (GSI). National Geoscience Data Repository (NGDR).',
  crs: 'To be determined from downloaded dataset',
  coverage: 'India — national scale geological mapping',
  scale: 'To be determined (typically 1:50,000 to 1:5,000,000)',
  source_status: 'REAL',
  notes: [
    'Dataset must be downloaded manually from NGDR portal (geodataindia.gov.in).',
    'Registration required. Place downloaded files in: gis-data/raw/gsi/',
    'Expected format: Shapefile or GeoJSON.',
    'Expected attributes: lithology, rock type, geological age, formation name.',
    'Run the GSI importer after downloading: npm run gis:import-gsi',
  ].join('\n'),
};

/**
 * TIER 2: Soil Data
 * Source: National Bureau of Soil Survey and Land Use Planning (NBSS&LUP)
 * 
 * ACCESS REQUIREMENTS:
 * - Data may require formal request to NBSS&LUP
 * - Alternative: FAO Harmonized World Soil Database (open access)
 */
export const SOIL_DATA: DatasetRecord = {
  dataset_id: 'soil-india-placeholder',
  name: 'India Soil Classification',
  category: 'soil',
  source: 'NBSS&LUP / FAO',
  source_url: 'https://www.nbsslup.in/',
  organization: 'National Bureau of Soil Survey and Land Use Planning',
  source_status: 'MOCK',
  notes: 'Requires formal data request. Placeholder for future integration.',
};

/**
 * All registered data sources
 */
export const ALL_DATA_SOURCES = [
  GEOBOUNDARIES_STATES,
  GEOBOUNDARIES_DISTRICTS,
  GSI_GEOLOGY_MAP,
  SOIL_DATA,
];

/**
 * Get the source definition for a dataset ID
 */
export function getSourceDefinition(datasetId: string): DatasetRecord | undefined {
  return ALL_DATA_SOURCES.find(s => s.dataset_id === datasetId);
}

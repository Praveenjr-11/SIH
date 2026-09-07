import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import * as shapefile from 'shapefile';
import { queryPostGIS, testPostGISConnection } from '../config/db.js';

interface VillageFeature {
  name: string;
  subdistrict: string;
  district_name: string;
  state_name: string;
  village_lgd?: string;
  subdistrict_lgd?: string;
  district_lgd?: string;
  state_lgd?: string;
  category?: string;
  shape_area?: number;
  shape_leng?: number;
  remarks?: string;
  geometry: any;
}

export interface IngestionResult {
  totalFilesProcessed: number;
  totalVillagesParsed: number;
  totalVillagesIngested: number;
  statesCovered: string[];
  reportPath: string;
  summary: Record<string, number>;
}

/**
 * Extracts and parses a village boundary shapefile ZIP file into GeoJSON features.
 */
export async function parseVillageZip(zipPath: string): Promise<{ stateName: string; features: VillageFeature[] }> {
  const zipName = path.basename(zipPath, '.zip');
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();

  const shpEntry = entries.find((e) => e.entryName.toLowerCase().endsWith('.shp'));
  const dbfEntry = entries.find((e) => e.entryName.toLowerCase().endsWith('.dbf'));

  if (!shpEntry || !dbfEntry) {
    throw new Error(`Zip archive ${zipName} does not contain required .shp and .dbf files`);
  }

  const shpBuffer = shpEntry.getData();
  const dbfBuffer = dbfEntry.getData();

  const geojson = await shapefile.read(shpBuffer, dbfBuffer);
  const rawFeatures = geojson.features || [];

  let stateName = zipName.replace(/_/g, ' ').toUpperCase();
  const features: VillageFeature[] = [];

  for (const feat of rawFeatures) {
    const props = feat.properties || {};
    const geom = feat.geometry;
    if (!geom) continue;

    const featState = (props.STATE || props.STATE_UT || props.state || props.State || stateName).toString().trim();
    if (featState && featState !== 'Unknown') {
      stateName = featState;
    }

    const name = (props.Vill_name || props.VILL_NAME || props.village || props.NAME || props.Vill_Name || 'Unmapped Village').toString().trim();
    const subdistrict = (props.Sub_dist || props.SUB_DIST || props.subdistrict || props.Taluk || props.Tehsil || '').toString().trim();
    const district_name = (props.District || props.DISTRICT || props.dist || '').toString().trim();
    const state_name = featState;

    const village_lgd = (props.Vill_LGD || props.VILL_LGD || props.vill_lgd || '').toString().trim();
    const subdistrict_lgd = (props.Subdis_LGD || props.SUBDIS_LGD || props.subdis_lgd || '').toString().trim();
    const district_lgd = (props.Dist_LGD || props.DIST_LGD || props.dist_lgd || '').toString().trim();
    const state_lgd = (props.State_LGD || props.STATE_LGD || props.state_lgd || '').toString().trim();
    const category = (props.Vill_Cat || props.Vill_cat || props.VILL_CAT || props.vill_cat || '').toString().trim();
    const shape_area = parseFloat(props.SHAPE_Area || props.Shape_Area || props.AREA || 0) || 0;
    const shape_leng = parseFloat(props.SHAPE_Leng || props.Shape_Leng || props.PERIMETER || 0) || 0;
    const remarks = (props.Remarks || props.REMARKS || '').toString().trim();

    features.push({
      name,
      subdistrict,
      district_name,
      state_name,
      village_lgd,
      subdistrict_lgd,
      district_lgd,
      state_lgd,
      category,
      shape_area,
      shape_leng,
      remarks,
      geometry: geom,
    });
  }

  return { stateName, features };
}

/**
 * Main importer for Village Boundary Data Base of Entire India
 */
export async function importVillageBoundaryZips(customSearchDir?: string): Promise<IngestionResult> {
  console.log('====================================================');
  console.log('VILLAGE BOUNDARY DATA BASE OF ENTIRE INDIA IMPORTER');
  console.log('====================================================\n');

  const searchDirs = [
    customSearchDir,
    'D:\\SIH',
    path.join(process.cwd(), 'gis-data', 'raw', 'administrative', 'villages'),
    path.join(process.cwd(), '..', 'gis-data', 'raw', 'administrative', 'villages'),
  ].filter((d): d is string => typeof d === 'string' && d.length > 0 && fs.existsSync(d));

  const zipFiles: string[] = [];
  for (const dir of searchDirs) {
    try {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        if (f.toLowerCase().endsWith('.zip')) {
          const fullPath = path.join(dir, f);
          if (!zipFiles.includes(fullPath)) {
            zipFiles.push(fullPath);
          }
        }
      }
    } catch (err) {
      console.warn(`Warning reading search directory ${dir}:`, err);
    }
  }

  console.log(`Discovered ${zipFiles.length} Village Boundary ZIP files across search directories.`);
  zipFiles.forEach((z) => console.log(` - ${path.basename(z)} (${(fs.statSync(z).size / (1024 * 1024)).toFixed(2)} MB)`));

  if (zipFiles.length === 0) {
    console.log('No ZIP files found. Exiting importer.');
    return {
      totalFilesProcessed: 0,
      totalVillagesParsed: 0,
      totalVillagesIngested: 0,
      statesCovered: [],
      reportPath: '',
      summary: {},
    };
  }

  const isDbConnected = await testPostGISConnection();
  console.log(`Database status: ${isDbConnected ? 'PostGIS Connected' : 'PostGIS Disconnected (Fallback mode)'}\n`);

  let totalParsed = 0;
  let totalIngested = 0;
  const statesCoveredSet = new Set<string>();
  const summary: Record<string, number> = {};
  const processedFeatures: any[] = [];

  for (const zipPath of zipFiles) {
    const zipName = path.basename(zipPath);
    console.log(`Processing ${zipName}...`);
    try {
      const { stateName, features } = await parseVillageZip(zipPath);
      statesCoveredSet.add(stateName);
      summary[stateName] = features.length;
      totalParsed += features.length;
      console.log(`  └─ Parsed ${features.length} villages for ${stateName}`);

      if (isDbConnected) {
        // Insert into PostGIS
        for (const feat of features) {
          try {
            await queryPostGIS(
              `INSERT INTO villages 
               (name, subdistrict, district_name, state_name, village_lgd, subdistrict_lgd, district_lgd, state_lgd, category, shape_area, shape_leng, remarks, source, geom)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'REAL_VILLAGE_BOUNDARY', ST_SetSRID(ST_GeomFromGeoJSON($13), 4326))`,
              [
                feat.name,
                feat.subdistrict,
                feat.district_name,
                feat.state_name,
                feat.village_lgd || null,
                feat.subdistrict_lgd || null,
                feat.district_lgd || null,
                feat.state_lgd || null,
                feat.category || null,
                feat.shape_area || null,
                feat.shape_leng || null,
                feat.remarks || null,
                JSON.stringify(feat.geometry),
              ]
            );
            totalIngested++;
          } catch (dbErr) {
            // Ignore duplicate or invalid geom errors
          }
        }
      }

      // Collect lightweight geojson for processed fallback file
      for (const feat of features.slice(0, 100)) {
        processedFeatures.push({
          type: 'Feature',
          properties: {
            name: feat.name,
            subdistrict: feat.subdistrict,
            district_name: feat.district_name,
            state_name: feat.state_name,
            village_lgd: feat.village_lgd,
            subdistrict_lgd: feat.subdistrict_lgd,
            district_lgd: feat.district_lgd,
            state_lgd: feat.state_lgd,
            category: feat.category,
            shape_area: feat.shape_area,
            source: 'REAL_VILLAGE_BOUNDARY',
          },
          geometry: feat.geometry,
        });
      }
    } catch (err: any) {
      console.error(`  └─ Error processing ${zipName}:`, err.message);
    }
  }

  // Update Dataset Catalog
  if (isDbConnected) {
    try {
      await queryPostGIS(
        `INSERT INTO gis_datasets (dataset_id, name, category, source, source_url, organization, version, coverage, source_status, record_count, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (dataset_id) DO UPDATE SET
           record_count = EXCLUDED.record_count,
           last_updated = NOW(),
           notes = EXCLUDED.notes`,
        [
          'india-village-boundaries',
          'Village Boundary Data Base of Entire India',
          'Administrative',
          'Survey of India / LGD India Spatial Portal',
          'https://lgdirectory.gov.in',
          'Survey of India / Ministry of Panchayati Raj',
          '2026.1',
          'Entire India (States & UTs)',
          'REAL',
          totalParsed,
          'active',
          `Parsed ${totalParsed} village boundaries across ${statesCoveredSet.size} states/UTs.`,
        ]
      );
    } catch (catErr) {
      console.warn('Dataset catalog update error:', catErr);
    }
  }

  // Save processed fallback JSON
  const outputDir = path.join(process.cwd(), 'gis-data', 'processed', 'administrative');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const processedJsonPath = path.join(outputDir, 'india_villages_sample.json');
  fs.writeFileSync(
    processedJsonPath,
    JSON.stringify(
      {
        type: 'FeatureCollection',
        name: 'Village Boundary Data Base of Entire India (Sample)',
        totalVillages: totalParsed,
        statesCovered: Array.from(statesCoveredSet),
        features: processedFeatures,
      },
      null,
      2
    )
  );

  // Generate Report
  const reportsDir = path.join(process.cwd(), 'gis-data', 'metadata', 'ingestion-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, 'village-boundaries-report.json');
  const report = {
    title: 'Village Boundary Data Base of Entire India — Ingestion Summary Report',
    date: new Date().toISOString(),
    totalZipFilesProcessed: zipFiles.length,
    totalVillagesParsed: totalParsed,
    totalVillagesIngested: isDbConnected ? totalIngested : 0,
    statesCoveredCount: statesCoveredSet.size,
    statesCovered: Array.from(statesCoveredSet),
    stateBreakdown: summary,
    dbStatus: isDbConnected ? 'PostGIS Connected' : 'Fallback File Saved',
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n====================================================');
  console.log(`INGESTION COMPLETE: ${totalParsed} villages parsed across ${statesCoveredSet.size} states.`);
  console.log(`Report saved to: ${reportPath}`);
  console.log('====================================================\n');

  return {
    totalFilesProcessed: zipFiles.length,
    totalVillagesParsed: totalParsed,
    totalVillagesIngested: isDbConnected ? totalIngested : 0,
    statesCovered: Array.from(statesCoveredSet),
    reportPath,
    summary,
  };
}

// Allow direct execution
if (process.argv[1]?.endsWith('villageBoundaryImporter.ts') || process.argv[1]?.endsWith('villageBoundaryImporter.js')) {
  importVillageBoundaryZips().catch(console.error);
}

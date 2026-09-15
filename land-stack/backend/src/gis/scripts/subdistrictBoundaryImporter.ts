/**
 * Real Subdistrict (Taluk) Boundary Importer
 * 
 * Reads GeoJSONL files from the yashveeeeeeer/india-geodata project
 * (LGD boundaries from Ministry of Panchayati Raj + Survey of India).
 * 
 * Expected input format: GeoJSONL (one JSON Feature per line)
 * Source: https://github.com/yashveeeeeeer/india-geodata
 * 
 * Usage:
 *   npm run gis:import-subdistricts
 *   npm run gis:import-subdistricts -- --file=/path/to/tn_subdistricts.geojsonl
 *   npm run gis:import-subdistricts -- --file=/path/to/LGD_Subdistricts.geojsonl --state="Tamil Nadu"
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { queryPostGIS, testPostGISConnection } from '../config/db.js';

interface SubdistrictFeature {
  name: string;
  district_name: string;
  state_name: string;
  lgd_code: string;
  geometry: any;
  area_sqkm?: number;
}

const SEARCH_DIRS = [
  'gis-data/raw/administrative/subdistricts',
  'gis-data/raw',
  'gis-data',
  'D:\\SIH\\gis-data',
  'D:\\SIH',
];

/**
 * Find geojsonl files in known directories
 */
function findGeojsonlFiles(): string[] {
  const files: string[] = [];
  for (const dir of SEARCH_DIRS) {
    const absDir = path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
    if (!fs.existsSync(absDir)) continue;
    try {
      const entries = fs.readdirSync(absDir);
      for (const f of entries) {
        if (f.toLowerCase().endsWith('.geojsonl') || f.toLowerCase().endsWith('.geojson') || f.toLowerCase().endsWith('.jsonl')) {
          const fullPath = path.join(absDir, f);
          if (f.toLowerCase().includes('subdistrict') || f.toLowerCase().includes('taluk')) {
            files.push(fullPath);
          }
        }
      }
    } catch (err) {
      // skip inaccessible dirs
    }
  }
  return files;
}

/**
 * Parse a GeoJSONL file line by line, filtering to a specific state if given.
 * GeoJSONL = one GeoJSON Feature per line.
 */
async function parseGeojsonl(filePath: string, stateFilter?: string): Promise<SubdistrictFeature[]> {
  const features: SubdistrictFeature[] = [];
  const fileStream = fs.createReadStream(filePath, 'utf-8');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineNum = 0;
  let skippedNonMatch = 0;

  for await (const line of rl) {
    lineNum++;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    try {
      const feature = JSON.parse(trimmed);
      const props = feature.properties || {};
      const geom = feature.geometry;
      if (!geom) continue;

      // Extract state name — LGD uses various key names
      const stateName = (
        props.stname || props.STNAME || props.state_name || props.STATE_NAME || props.st_name ||
        props.State || props.STATE || props.state || ''
      ).toString().trim();

      // Apply state filter if provided
      if (stateFilter && stateName.toLowerCase() !== stateFilter.toLowerCase()) {
        skippedNonMatch++;
        continue;
      }

      // Extract subdistrict name
      const name = (
        props.sdtname || props.SDTNAME || props.subdistrict_name || props.SUBDISTRICT_NAME || props.sd_name ||
        props.Sub_dist || props.SUB_DIST || props.subdistrict ||
        props.Taluk || props.name || props.NAME || ''
      ).toString().trim();

      // Extract district name
      const districtName = (
        props.dtname || props.DTNAME || props.district_name || props.DISTRICT_NAME || props.dt_name ||
        props.District || props.DISTRICT || ''
      ).toString().trim();

      // Extract LGD code
      const lgdCode = (
        props.subdt_lgd || props.sdtcode11 || props.subdistrict_lgd_code || props.sd_lgd_code || props.lgd_code ||
        props.Subdis_LGD || props.SUBDIS_LGD || ''
      ).toString().trim();

      if (!name) {
        console.warn(`  Line ${lineNum}: Skipping — no subdistrict name found`);
        continue;
      }
      
      // Phase 1 filter: only ingest specific Phase 0 districts
      if (stateFilter && stateFilter.toLowerCase() === 'tamil nadu') {
        const lowerDistrict = districtName.toLowerCase();
        if (lowerDistrict !== 'kanchipuram' && lowerDistrict !== 'kancheepuram' && lowerDistrict !== 'virudhunagar') {
          skippedNonMatch++;
          continue;
        }
      }

      features.push({
        name,
        district_name: districtName,
        state_name: stateName,
        lgd_code: lgdCode,
        geometry: geom,
        area_sqkm: parseFloat(props.area_sqkm || props.AREA || 0) || undefined,
      });
    } catch (parseErr) {
      // Skip malformed JSON lines
      if (lineNum <= 5) {
        console.warn(`  Line ${lineNum}: Parse error (may be a header line), skipping`);
      }
    }
  }

  if (stateFilter) {
    console.log(`  Filtered: ${features.length} features matched "${stateFilter}", ${skippedNonMatch} other states skipped`);
  }

  return features;
}

/**
 * Main importer entry point
 */
export async function importSubdistrictBoundaries(customFile?: string, stateFilter?: string) {
  console.log('====================================================');
  console.log('REAL SUBDISTRICT (TALUK) BOUNDARY IMPORTER');
  console.log('Source: LGD / india-geodata (CC0 licensed)');
  console.log('====================================================\n');

  // Find input file
  let inputFile = customFile;
  if (!inputFile) {
    const found = findGeojsonlFiles();
    if (found.length > 0) {
      inputFile = found[0];
      console.log(`Auto-detected input file: ${inputFile}`);
    }
  }

  if (!inputFile || !fs.existsSync(inputFile)) {
    console.log('\nNo subdistrict GeoJSONL file found.');
    console.log('Download the file from:');
    console.log('  https://github.com/yashveeeeeeer/india-geodata/releases/download/admin%2Fsubdistricts/LGD_Subdistricts.geojsonl.7z');
    console.log('\nExtract and place it in one of these directories:');
    SEARCH_DIRS.forEach(d => console.log(`  ${d}`));
    console.log('\nOr specify a path directly:');
    console.log('  npm run gis:import-subdistricts -- --file=/path/to/file.geojsonl --state="Tamil Nadu"');
    return {
      totalParsed: 0,
      totalIngested: 0,
      message: 'No input file found. See console for download instructions.',
    };
  }

  const fileSizeMB = (fs.statSync(inputFile).size / (1024 * 1024)).toFixed(2);
  console.log(`\nInput: ${path.basename(inputFile)} (${fileSizeMB} MB)`);
  if (stateFilter) {
    console.log(`State filter: ${stateFilter}`);
  }

  // Parse the file
  console.log('Parsing GeoJSONL...');
  const features = await parseGeojsonl(inputFile, stateFilter || 'Tamil Nadu');
  console.log(`Parsed ${features.length} subdistrict features.\n`);

  if (features.length === 0) {
    return { totalParsed: 0, totalIngested: 0, message: 'No matching features found.' };
  }

  // Check DB connection
  const isDbConnected = await testPostGISConnection();
  console.log(`Database: ${isDbConnected ? 'PostGIS Connected' : 'PostGIS Disconnected'}\n`);

  let totalIngested = 0;
  const districtSet = new Set<string>();

  if (isDbConnected) {
    // Check if PostGIS ST_SetSRID function works
    let hasPostGisGeomCol = false;
    try {
      await queryPostGIS(`SELECT ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Point","coordinates":[0,0]}'), 4326)`);
      hasPostGisGeomCol = true;
    } catch {
      hasPostGisGeomCol = false;
    }

    for (const feat of features) {
      try {
        // Look up district_id from districts table
        let districtId: number | null = null;
        try {
          const distRes = await queryPostGIS(
            `SELECT id FROM districts WHERE LOWER(name) = LOWER($1) LIMIT 1;`,
            [feat.district_name]
          );
          if (distRes && distRes.rows.length > 0) {
            districtId = distRes.rows[0].id;
          }
        } catch (e) {
          // district lookup failed, proceed without it
        }

        const geomJsonStr = JSON.stringify(feat.geometry);

        if (hasPostGisGeomCol) {
          await queryPostGIS(
            `INSERT INTO subdistricts (name, district_id, district_name, state_name, lgd_code, source, source_url, geom_text, geom)
             VALUES ($1, $2, $3, $4, $5, 'LGD_REAL_BOUNDARY',
                     'https://lgdirectory.gov.in/', $6, ST_SetSRID(ST_GeomFromGeoJSON($6), 4326))
             ON CONFLICT DO NOTHING;`,
            [feat.name, districtId, feat.district_name, feat.state_name, feat.lgd_code || null, geomJsonStr]
          );
        } else {
          await queryPostGIS(
            `INSERT INTO subdistricts (name, district_id, district_name, state_name, lgd_code, source, source_url, geom_text)
             VALUES ($1, $2, $3, $4, $5, 'LGD_REAL_BOUNDARY',
                     'https://lgdirectory.gov.in/', $6)
             ON CONFLICT DO NOTHING;`,
            [feat.name, districtId, feat.district_name, feat.state_name, feat.lgd_code || null, geomJsonStr]
          );
        }
        totalIngested++;
        districtSet.add(feat.district_name);

        if (totalIngested % 50 === 0) {
          console.log(`  Ingested ${totalIngested}/${features.length}...`);
        }
      } catch (dbErr: any) {
        // Skip duplicates / invalid geometries
        if (!dbErr.message?.includes('duplicate')) {
          console.warn(`  Warning inserting ${feat.name}: ${dbErr.message}`);
        }
      }
    }

    // Update dataset catalog
    try {
      await queryPostGIS(
        `INSERT INTO gis_datasets (dataset_id, name, category, source, source_url, organization, version, coverage, source_status, record_count, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (dataset_id) DO UPDATE SET
           record_count = EXCLUDED.record_count,
           last_updated = NOW(),
           notes = EXCLUDED.notes`,
        [
          'india-subdistrict-boundaries',
          'Subdistrict (Taluk) Boundary Data — LGD India',
          'Administrative',
          'LGD / india-geodata',
          'https://github.com/yashveeeeeeer/india-geodata',
          'Ministry of Panchayati Raj / Survey of India',
          '2026.1',
          stateFilter || 'Entire India',
          'REAL',
          features.length,
          'active',
          `Ingested ${totalIngested} subdistrict boundaries from ${districtSet.size} districts.`,
        ]
      );
    } catch (catErr) {
      console.warn('Dataset catalog update warning:', catErr);
    }
  }

  // Save a processed summary file regardless of DB connection
  const outputDir = path.join(process.cwd(), 'gis-data', 'processed', 'administrative');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const summaryPath = path.join(outputDir, 'subdistricts_import_summary.json');
  const summary = {
    importDate: new Date().toISOString(),
    sourceFile: path.basename(inputFile),
    stateFilter: stateFilter || 'Tamil Nadu',
    totalParsed: features.length,
    totalIngested,
    districts: Array.from(districtSet).sort(),
    dbConnected: isDbConnected,
  };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  console.log('\n====================================================');
  console.log(`IMPORT COMPLETE: ${totalIngested}/${features.length} subdistricts ingested`);
  console.log(`Districts covered: ${districtSet.size}`);
  console.log(`Summary saved: ${summaryPath}`);
  console.log('====================================================\n');

  return summary;
}

// CLI entry point
if (process.argv[1]?.includes('subdistrictBoundaryImporter')) {
  const fileArg = process.argv.find(a => a.startsWith('--file='));
  const stateArg = process.argv.find(a => a.startsWith('--state='));
  const file = fileArg?.split('=')[1];
  const state = stateArg?.split('=')[1];
  importSubdistrictBoundaries(file, state).catch(console.error);
}

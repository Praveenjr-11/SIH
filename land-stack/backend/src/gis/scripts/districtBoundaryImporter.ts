/**
 * Real District Boundary Importer
 * 
 * Reads GeoJSONL district boundary files from india-geodata project.
 * Source: https://github.com/yashveeeeeeer/india-geodata
 * 
 * Usage:
 *   npm run gis:import-districts
 *   npm run gis:import-districts -- --file=/path/to/tn_districts.geojsonl
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { queryPostGIS, testPostGISConnection } from '../config/db.js';

const SEARCH_DIRS = [
  'gis-data/raw/administrative/districts',
  'gis-data/raw',
  'gis-data',
  'D:\\SIH\\gis-data',
  'D:\\SIH',
];

function findDistrictFiles(): string[] {
  const files: string[] = [];
  for (const dir of SEARCH_DIRS) {
    const absDir = path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
    if (!fs.existsSync(absDir)) continue;
    try {
      for (const f of fs.readdirSync(absDir)) {
        if ((f.toLowerCase().endsWith('.geojsonl') || f.toLowerCase().endsWith('.jsonl')) &&
            f.toLowerCase().includes('district') && !f.toLowerCase().includes('subdistrict')) {
          files.push(path.join(absDir, f));
        }
      }
    } catch { /* skip */ }
  }
  return files;
}

async function parseGeojsonl(filePath: string, stateFilter?: string) {
  const features: any[] = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, 'utf-8'),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const feature = JSON.parse(trimmed);
      const props = feature.properties || {};
      const geom = feature.geometry;
      if (!geom) continue;

      const stateName = (props.stname || props.STNAME || props.state_name || props.STATE_NAME || props.st_name || props.State || '').toString().trim();
      if (stateFilter && stateName.toLowerCase() !== stateFilter.toLowerCase()) continue;

      const name = (props.dtname || props.DTNAME || props.district_name || props.DISTRICT_NAME || props.dt_name || props.District || props.name || props.NAME || '').toString().trim();
      const lgdCode = (props.dist_lgd || props.dtcode11 || props.district_lgd_code || props.dt_lgd_code || props.lgd_code || props.Dist_LGD || '').toString().trim();

      if (!name) continue;
      
      features.push({ name, state_name: stateName, lgd_code: lgdCode, geometry: geom });
    } catch { /* skip */ }
  }
  return features;
}

export async function importDistrictBoundaries(customFile?: string, stateFilter?: string) {
  console.log('====================================================');
  console.log('REAL DISTRICT BOUNDARY IMPORTER (LGD)');
  console.log('====================================================\n');

  let inputFile = customFile || findDistrictFiles()[0];
  if (!inputFile || !fs.existsSync(inputFile)) {
    console.log('No district GeoJSONL file found. Download from:');
    console.log('  https://github.com/yashveeeeeeer/india-geodata/releases/download/admin%2Fdistricts/LGD_Districts.geojsonl.7z');
    return { totalParsed: 0, totalIngested: 0 };
  }

  console.log(`Input: ${path.basename(inputFile)}`);
  const features = await parseGeojsonl(inputFile, stateFilter || 'Tamil Nadu');
  console.log(`Parsed ${features.length} district features.\n`);

  const isDbConnected = await testPostGISConnection();
  let totalIngested = 0;

  if (isDbConnected && features.length > 0) {
    let hasPostGisGeomCol = false;
    try {
      await queryPostGIS(`SELECT ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Point","coordinates":[0,0]}'), 4326)`);
      hasPostGisGeomCol = true;
    } catch {
      hasPostGisGeomCol = false;
    }

    for (const feat of features) {
      try {
        const geomJsonStr = JSON.stringify(feat.geometry);
        if (hasPostGisGeomCol) {
          await queryPostGIS(
            `INSERT INTO districts (name, state_name, lgd_code, source, geom_text, geom)
             VALUES ($1, $2, $3, 'LGD_REAL_BOUNDARY', $4, ST_SetSRID(ST_GeomFromGeoJSON($4), 4326))
             ON CONFLICT DO NOTHING;`,
            [feat.name, feat.state_name, feat.lgd_code || null, geomJsonStr]
          );
        } else {
          await queryPostGIS(
            `INSERT INTO districts (name, state_name, lgd_code, source, geom_text)
             VALUES ($1, $2, $3, 'LGD_REAL_BOUNDARY', $4)
             ON CONFLICT DO NOTHING;`,
            [feat.name, feat.state_name, feat.lgd_code || null, geomJsonStr]
          );
        }
        totalIngested++;
      } catch (dbErr: any) {
        if (!dbErr.message?.includes('duplicate')) {
          console.warn(`  Warning inserting ${feat.name}: ${dbErr.message}`);
        }
      }
    }
  }

  console.log(`\nIMPORT COMPLETE: ${totalIngested}/${features.length} districts ingested`);
  return { totalParsed: features.length, totalIngested };
}

if (process.argv[1]?.includes('districtBoundaryImporter')) {
  const fileArg = process.argv.find(a => a.startsWith('--file='));
  const stateArg = process.argv.find(a => a.startsWith('--state='));
  importDistrictBoundaries(fileArg?.split('=')[1], stateArg?.split('=')[1]).catch(console.error);
}

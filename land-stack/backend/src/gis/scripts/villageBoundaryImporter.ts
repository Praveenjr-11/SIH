/**
 * Real Village Boundary Importer
 * 
 * Reads GeoJSONL files from the yashveeeeeeer/india-geodata project
 * (LGD boundaries from Ministry of Panchayati Raj + Survey of India).
 * 
 * Usage:
 *   npm run gis:import-villages
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { queryPostGIS, testPostGISConnection } from '../config/db.js';

interface VillageFeature {
  name: string;
  subdistrict: string;
  district_name: string;
  state_name: string;
  lgd_code: string;
  geometry: any;
}

const SEARCH_DIRS = [
  'gis-data/raw/administrative/villages',
  'gis-data/raw',
  'gis-data',
  'D:\\SIH\\gis-data',
  'D:\\SIH',
];

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
          if (f.toLowerCase().includes('village')) {
            files.push(fullPath);
          }
        }
      }
    } catch (err) { }
  }
  return files;
}

async function parseGeojsonl(filePath: string, stateFilter?: string): Promise<VillageFeature[]> {
  const features: VillageFeature[] = [];
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

      const stateName = (props.stname || props.STNAME || props.state_name || props.STATE_NAME || props.st_name || props.State || props.STATE || props.state || '').toString().trim();
      const districtName = (props.dtname || props.DTNAME || props.district_name || props.DISTRICT_NAME || props.dt_name || props.District || props.DISTRICT || '').toString().trim();
      
      if (stateFilter && stateFilter.toLowerCase() === 'tamil nadu') {
        const lowerDistrict = districtName.toLowerCase();
        if (lowerDistrict !== 'kanchipuram' && lowerDistrict !== 'kancheepuram' && lowerDistrict !== 'virudhunagar') {
          skippedNonMatch++;
          continue;
        }
      }

      const name = (props.vilname || props.VILNAME || props.village_name || props.VILLAGE_NAME || props.village || props.Village || props.name || props.NAME || '').toString().trim();
      const subdistrict = (props.sdtname || props.SDTNAME || props.subdistrict_name || props.SUBDISTRICT_NAME || props.sd_name || props.Sub_dist || props.SUB_DIST || props.subdistrict || props.Taluk || '').toString().trim();
      const lgdCode = (props.vil_lgd || props.vilcode11 || props.village_lgd_code || props.v_lgd_code || props.lgd_code || props.Vill_LGD || '').toString().trim();

      if (!name) continue;

      features.push({
        name,
        subdistrict,
        district_name: districtName,
        state_name: stateName,
        lgd_code: lgdCode,
        geometry: geom,
      });
    } catch (parseErr) {
      if (lineNum <= 5) console.warn(`  Line ${lineNum}: Parse error, skipping`);
    }
  }
  return features;
}

export async function importVillageBoundaries(customFile?: string, stateFilter?: string) {
  console.log('====================================================');
  console.log('REAL VILLAGE BOUNDARY IMPORTER (LGD)');
  console.log('====================================================\n');

  let inputFile = customFile || findGeojsonlFiles()[0];
  if (!inputFile || !fs.existsSync(inputFile)) {
    console.log('No village GeoJSONL file found.');
    return { totalParsed: 0, totalIngested: 0 };
  }

  console.log(`Input: ${path.basename(inputFile)}`);
  const features = await parseGeojsonl(inputFile, stateFilter || 'Tamil Nadu');
  console.log(`Parsed ${features.length} village features.\n`);

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

    // Try to empty the table first
    if (hasPostGisGeomCol) {
       await queryPostGIS(`DELETE FROM villages WHERE state_name = 'Tamil Nadu' AND (district_name ILIKE '%kanchipuram%' OR district_name ILIKE '%kancheepuram%' OR district_name ILIKE '%virudhunagar%')`);
    }

    for (const feat of features) {
      if (!feat.geometry) continue;
      
      const geomJson = JSON.stringify(feat.geometry);
      try {
        if (hasPostGisGeomCol) {
          const sql = `
            INSERT INTO villages (name, subdistrict, district_name, state_name, village_lgd, source, geom)
            VALUES ($1, $2, $3, $4, $5, 'LGD_YASHVEEEEEER', ST_SetSRID(ST_GeomFromGeoJSON($6), 4326))
          `;
          await queryPostGIS(sql, [feat.name, feat.subdistrict, feat.district_name, feat.state_name, feat.lgd_code, geomJson]);
        }
        totalIngested++;
      } catch (err: any) {
        console.warn(`Failed to insert village ${feat.name}: ${err.message}`);
      }
    }
  }

  console.log(`\nImport complete! Ingested ${totalIngested} real villages.`);
  return { totalParsed: features.length, totalIngested };
}

export async function parseVillageZip(zipPath: string): Promise<{ stateName: string; features: any[] }> {
  return { stateName: 'UNKNOWN', features: [] };
}

export async function importVillageBoundaryZips(): Promise<{ totalParsed: number; totalIngested: number }> {
  return importVillageBoundaries();
}

if (require.main === module) {
  importVillageBoundaries().catch(console.error);
}



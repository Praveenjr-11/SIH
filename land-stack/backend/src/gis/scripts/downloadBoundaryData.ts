/**
 * Boundary Data Downloader
 * 
 * Downloads real boundary GeoJSONL data from the yashveeeeeeer/india-geodata
 * GitHub releases and filters to Tamil Nadu.
 * 
 * This script handles the download, extraction (using node-7z or manual .7z handling),
 * and Tamil Nadu filtering in one step.
 * 
 * Usage:
 *   npm run gis:download-boundaries
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';

const OUTPUT_DIR = path.resolve(process.cwd(), 'gis-data', 'raw', 'administrative');

const DATASETS = [
  {
    name: 'districts',
    url: 'https://github.com/yashveeeeeeer/india-geodata/releases/download/admin%2Fdistricts/LGD_Districts.geojsonl.7z',
    archiveName: 'LGD_Districts.geojsonl.7z',
    extractedName: 'LGD_Districts.geojsonl',
    filteredName: 'tn_districts.geojsonl',
    subdir: 'districts',
  },
  {
    name: 'subdistricts',
    url: 'https://github.com/yashveeeeeeer/india-geodata/releases/download/admin%2Fsubdistricts/LGD_Subdistricts.geojsonl.7z',
    archiveName: 'LGD_Subdistricts.geojsonl.7z',
    extractedName: 'LGD_Subdistricts.geojsonl',
    filteredName: 'tn_subdistricts.geojsonl',
    subdir: 'subdistricts',
  },
  {
    name: 'villages',
    url: 'https://github.com/yashveeeeeeer/india-geodata/releases/download/admin%2Fvillages/LGD_Villages.geojsonl.7z',
    archiveName: 'LGD_Villages.geojsonl.7z',
    extractedName: 'LGD_Villages.geojsonl',
    filteredName: 'tn_villages.geojsonl',
    subdir: 'villages',
  },
];

/**
 * Follow redirects and download a file from GitHub releases
 */
function downloadFile(url: string, dest: string, maxRedirects = 10): Promise<void> {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));

    const request = https.get(url, { headers: { 'User-Agent': 'LandStack-GIS-Downloader/1.0' } }, (response) => {
      // Handle redirects (GitHub releases redirect to S3/CDN)
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log(`  Redirecting to ${response.headers.location.substring(0, 80)}...`);
        downloadFile(response.headers.location, dest, maxRedirects - 1).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const totalBytes = parseInt(response.headers['content-length'] || '0', 10);
      let downloadedBytes = 0;
      const file = fs.createWriteStream(dest);

      response.on('data', (chunk: Buffer) => {
        downloadedBytes += chunk.length;
        if (totalBytes > 0 && downloadedBytes % (1024 * 1024) < chunk.length) {
          const pct = ((downloadedBytes / totalBytes) * 100).toFixed(1);
          process.stdout.write(`\r  Downloaded ${(downloadedBytes / (1024 * 1024)).toFixed(1)} MB / ${(totalBytes / (1024 * 1024)).toFixed(1)} MB (${pct}%)`);
        }
      });

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`\n  Download complete: ${path.basename(dest)}`);
        resolve();
      });
    });

    request.on('error', reject);
  });
}

/**
 * Try to extract a .7z file using system 7z or PowerShell
 */
function extract7z(archivePath: string, outputDir: string): boolean {
  // Try 7zip-bin package binary (bundled cross-platform 7za executable)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sevenZipBin = require('7zip-bin');
    if (sevenZipBin && sevenZipBin.path7za && fs.existsSync(sevenZipBin.path7za)) {
      execSync(`"${sevenZipBin.path7za}" x "${archivePath}" -o"${outputDir}" -y`, { stdio: 'pipe' });
      console.log('  Extracted using 7zip-bin');
      return true;
    }
  } catch { /* 7zip-bin failed */ }

  // Try system 7z
  try {
    execSync(`7z x "${archivePath}" -o"${outputDir}" -y`, { stdio: 'pipe' });
    console.log('  Extracted using system 7z');
    return true;
  } catch { /* 7z not available */ }

  // Try using the 7-Zip installation path on Windows
  try {
    const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
    const sevenZipPath = path.join(programFiles, '7-Zip', '7z.exe');
    if (fs.existsSync(sevenZipPath)) {
      execSync(`"${sevenZipPath}" x "${archivePath}" -o"${outputDir}" -y`, { stdio: 'pipe' });
      console.log('  Extracted using 7-Zip from Program Files');
      return true;
    }
  } catch { /* not found */ }

  // Try x86 Program Files
  try {
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    const sevenZipPath = path.join(programFilesX86, '7-Zip', '7z.exe');
    if (fs.existsSync(sevenZipPath)) {
      execSync(`"${sevenZipPath}" x "${archivePath}" -o"${outputDir}" -y`, { stdio: 'pipe' });
      console.log('  Extracted using 7-Zip (x86) from Program Files');
      return true;
    }
  } catch { /* not found */ }

  return false;
}

/**
 * Filter a GeoJSONL file to Tamil Nadu only
 */
function filterToTamilNadu(inputPath: string, outputPath: string): number {
  const content = fs.readFileSync(inputPath, 'utf-8');
  const lines = content.split('\n');
  const filtered: string[] = [];

  // Check first few lines to find the actual state key name
  const stateKeys = ['stname', 'STNAME', 'state_name', 'STATE_NAME', 'st_name', 'State', 'STATE'];
  let detectedKey = 'stname'; // default

  for (const line of lines.slice(0, 5)) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line.trim());
      for (const key of stateKeys) {
        if (obj.properties && obj.properties[key]) {
          detectedKey = key;
          break;
        }
      }
      break;
    } catch { continue; }
  }

  console.log(`  State property key detected: "${detectedKey}"`);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const obj = JSON.parse(trimmed);
      const stateName = (obj.properties?.[detectedKey] || '').toString().trim();
      if (stateName.toLowerCase() === 'tamil nadu') {
        filtered.push(trimmed);
      }
    } catch { continue; }
  }

  fs.writeFileSync(outputPath, filtered.join('\n') + '\n');
  return filtered.length;
}

async function main() {
  console.log('====================================================');
  console.log('REAL BOUNDARY DATA DOWNLOADER');
  console.log('Source: yashveeeeeeer/india-geodata (CC0)');
  console.log('====================================================\n');

  // Only download subdistricts by default (smallest and most impactful)
  const targetDataset = process.argv.find(a => a.startsWith('--level='))?.split('=')[1] || 'subdistricts';
  const datasets = targetDataset === 'all' ? DATASETS : DATASETS.filter(d => d.name === targetDataset);

  if (datasets.length === 0) {
    console.log(`Unknown level "${targetDataset}". Use: districts, subdistricts, villages, or all`);
    return;
  }

  for (const dataset of datasets) {
    console.log(`\n─── ${dataset.name.toUpperCase()} ───`);

    const subDir = path.join(OUTPUT_DIR, dataset.subdir);
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }

    const archivePath = path.join(subDir, dataset.archiveName);
    const extractedPath = path.join(subDir, dataset.extractedName);
    const filteredPath = path.join(subDir, dataset.filteredName);

    // Skip if already filtered
    if (fs.existsSync(filteredPath)) {
      const lines = fs.readFileSync(filteredPath, 'utf-8').split('\n').filter(l => l.trim()).length;
      console.log(`  Already have ${filteredPath} (${lines} features). Skipping download.`);
      console.log('  Delete the file to re-download.');
      continue;
    }

    // Skip if already extracted
    if (fs.existsSync(extractedPath)) {
      console.log(`  Already extracted: ${extractedPath}`);
    } else {
      // Download
      if (fs.existsSync(archivePath)) {
        console.log(`  Already downloaded: ${archivePath}`);
      } else {
        console.log(`  Downloading ${dataset.url}...`);
        try {
          await downloadFile(dataset.url, archivePath);
        } catch (err: any) {
          console.error(`  ❌ Download failed: ${err.message}`);
          console.log('  You can manually download and place the file in:');
          console.log(`    ${subDir}`);
          continue;
        }
      }

      // Extract
      console.log('  Extracting .7z archive...');
      const extracted = extract7z(archivePath, subDir);
      if (!extracted) {
        console.log('  ❌ Could not extract .7z file.');
        console.log('  Please install 7-Zip (https://7-zip.org) and re-run,');
        console.log('  or manually extract the archive to:');
        console.log(`    ${subDir}`);
        continue;
      }
    }

    // Filter to Tamil Nadu
    if (!fs.existsSync(extractedPath)) {
      console.log(`  ❌ Expected extracted file not found: ${extractedPath}`);
      // List what IS in the directory
      const dirContents = fs.readdirSync(subDir);
      console.log(`  Directory contains: ${dirContents.join(', ')}`);
      continue;
    }

    console.log('  Filtering to Tamil Nadu...');
    const count = filterToTamilNadu(extractedPath, filteredPath);
    console.log(`  ✅ ${count} Tamil Nadu ${dataset.name} saved to ${path.basename(filteredPath)}`);
  }

  console.log('\n====================================================');
  console.log('DOWNLOAD COMPLETE');
  console.log('\nNext steps:');
  console.log('  npm run gis:import-districts');
  console.log('  npm run gis:import-subdistricts');
  console.log('====================================================\n');
}

main().catch(console.error);

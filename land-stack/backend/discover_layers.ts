// Discover the correct TNGIS WFS layer names
import 'dotenv/config';
import https from 'https';
import { URL } from 'url';

function fetchURL(urlStr: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr);
    const req = https.get({
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: { 'User-Agent': 'LAND-STACK/2.0' },
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
  });
}

async function main() {
  console.log('Fetching WFS GetCapabilities from TNGIS...');
  const caps = await fetchURL('https://tngis.tn.gov.in/tngismaps/wfs?service=WFS&version=1.0.0&request=GetCapabilities');
  
  // Extract all layer names
  const matches = [...caps.matchAll(/<Name>([^<]+)<\/Name>/g)];
  const layerNames = matches.map(m => m[1]).filter(n => n.includes(':'));
  
  console.log(`Found ${layerNames.length} layers:`);
  layerNames.forEach(n => console.log(' -', n));
}

main().catch(console.error);

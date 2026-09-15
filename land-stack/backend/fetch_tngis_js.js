const https = require('https');
const fs = require('fs');

const urls = [
  'https://tngis.tn.gov.in/generic_viewer/assets/js/tools/main.js',
  'https://tngis.tn.gov.in/generic_viewer/assets/js/wmslayer.js',
  'https://tngis.tn.gov.in/generic_viewer/assets/js/wfslayer.js',
  'https://tngis.tn.gov.in/generic_viewer/assets/js/tools/map.js',
];

async function fetchFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

(async () => {
  for (const url of urls) {
    const name = url.split('/').pop();
    console.log(`\n========== ${name} ==========`);
    try {
      const content = await fetchFile(url);
      fs.writeFileSync(`tngis_${name}`, content);
      console.log(`Saved: tngis_${name} (${content.length} bytes)`);
      // Print first 200 lines
      const lines = content.split('\n');
      console.log(lines.slice(0, 200).join('\n'));
      if (lines.length > 200) console.log(`... (${lines.length - 200} more lines)`);
    } catch (err) {
      console.error(`Failed: ${err.message}`);
    }
  }
})();

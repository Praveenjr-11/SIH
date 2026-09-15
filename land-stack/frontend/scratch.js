const fs = require('fs');
const content = fs.readFileSync('src/config/gisLayerRegistry.ts', 'utf8');
const matches = [...content.matchAll(/id:\s*"([^"]+)"/g)].map(m => m[1]);
console.log(matches.join(', '));

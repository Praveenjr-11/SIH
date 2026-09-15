const https = require('https');

// Test 1: TNGIS GeoServer WMS GetCapabilities
function testWMS() {
  const url = 'https://tngis.tn.gov.in/tngismaps/wms?service=WMS&request=GetCapabilities';
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 15000 }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`WMS Status: ${res.statusCode}`);
        console.log(`WMS Response length: ${data.length}`);
        console.log(`WMS Content starts with: ${data.substring(0, 300)}`);
        resolve(data);
      });
    }).on('error', err => { console.error('WMS Error:', err.message); resolve(null); });
  });
}

// Test 2: TNGIS Generic API 
function testGenericAPI() {
  const url = 'https://tngis.tn.gov.in/apps/generic_api/v1/getAdminDropDown';
  const postData = JSON.stringify({ case: 'district' });
  const options = {
    method: 'POST',
    hostname: 'tngis.tn.gov.in',
    path: '/apps/generic_api/v1/getAdminDropDown',
    headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length },
    timeout: 15000,
  };
  return new Promise((resolve) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\nGeneric API Status: ${res.statusCode}`);
        console.log(`Generic API Response length: ${data.length}`);
        console.log(`Generic API Response: ${data.substring(0, 500)}`);
        resolve(data);
      });
    });
    req.on('error', err => { console.error('Generic API Error:', err.message); resolve(null); });
    req.write(postData);
    req.end();
  });
}

// Test 3: TNGIS Generic Viewer API (PHP backend)
function testViewerAPI() {
  const postData = 'case=layer_list';
  const options = {
    method: 'POST',
    hostname: 'tngis.tn.gov.in',
    path: '/apps/generic_viewer_api/api/data.php',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': postData.length },
    timeout: 15000,
  };
  return new Promise((resolve) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\nViewer API Status: ${res.statusCode}`);
        console.log(`Viewer API Response length: ${data.length}`);
        console.log(`Viewer API Response: ${data.substring(0, 500)}`);
        resolve(data);
      });
    });
    req.on('error', err => { console.error('Viewer API Error:', err.message); resolve(null); });
    req.write(postData);
    req.end();
  });
}

// Test 4: WMS GetMap for districts layer
function testWMSGetMap() {
  const url = 'https://tngis.tn.gov.in/tngismaps/wms?service=WMS&version=1.1.1&request=GetMap&layers=generic_viewer:districts&bbox=76.0,8.0,81.0,14.0&width=256&height=256&srs=EPSG:4326&format=image/png&transparent=true';
  return new Promise((resolve) => {
    https.get(url, { timeout: 15000 }, res => {
      let chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        console.log(`\nWMS GetMap Status: ${res.statusCode}`);
        console.log(`WMS GetMap Content-Type: ${res.headers['content-type']}`);
        console.log(`WMS GetMap Response size: ${buf.length} bytes`);
        resolve(buf);
      });
    }).on('error', err => { console.error('WMS GetMap Error:', err.message); resolve(null); });
  });
}

// Test 5: WFS GetFeature for districts (GeoJSON)
function testWFS() {
  const url = 'https://tngis.tn.gov.in/tngismaps/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=generic_viewer:districts&outputFormat=application/json&maxFeatures=5';
  return new Promise((resolve) => {
    https.get(url, { timeout: 15000 }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\nWFS Status: ${res.statusCode}`);
        console.log(`WFS Content-Type: ${res.headers['content-type']}`);
        console.log(`WFS Response length: ${data.length}`);
        console.log(`WFS Response start: ${data.substring(0, 500)}`);
        resolve(data);
      });
    }).on('error', err => { console.error('WFS Error:', err.message); resolve(null); });
  });
}

(async () => {
  console.log('=== TNGIS API ENDPOINT DISCOVERY ===\n');
  await testWMS();
  await testGenericAPI();
  await testViewerAPI();
  await testWMSGetMap();
  await testWFS();
  console.log('\n=== DONE ===');
})();

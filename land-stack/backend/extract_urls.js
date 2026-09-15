const https = require('https');
https.get('https://tngis.tn.gov.in/generic_viewer/', res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const urls = data.match(/https?:\/\/[^\s"'><]+/g) || [];
        const unique = [...new Set(urls)];
        console.log("Found URLs:");
        console.log(unique.join('\n'));
    });
}).on('error', err => console.error(err));

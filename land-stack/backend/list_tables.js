const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'landstack_gis', password: 'Praveen@2005', port: 5432 });

client.connect(err => {
    if (err) console.error(err);
    else {
        client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';", (err, res) => {
            if (err) console.error(err);
            else console.log(res.rows.map(r => r.table_name).join(', '));
            client.end();
        });
    }
});

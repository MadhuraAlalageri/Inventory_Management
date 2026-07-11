const pool = require('./config/db');
const fs = require('fs');

async function dump() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tables = res.rows.map(r => r.table_name);
    const dbDump = {};
    
    for (const table of tables) {
      const tRes = await pool.query(`SELECT * FROM ${table}`);
      dbDump[table] = tRes.rows;
      
      // Also write CSV
      if (tRes.rows.length > 0) {
        const headers = Object.keys(tRes.rows[0]);
        let csv = headers.join(',') + '\n';
        for (const row of tRes.rows) {
          csv += headers.map(h => JSON.stringify(row[h])).join(',') + '\n';
        }
        fs.writeFileSync(`../${table}_data.csv`, csv);
      }
    }
    
    fs.writeFileSync('../database_dump.json', JSON.stringify(dbDump, null, 2));
    console.log('Database dumped successfully');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

dump();

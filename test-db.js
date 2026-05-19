const pool = require('./server/config/db');
pool.query('SELECT * FROM requests WHERE id = 77').then(res => { console.log(res.rows); pool.end(); }).catch(e => { console.error(e); pool.end(); });

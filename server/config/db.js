const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'inventory_db',
  password: '123456',   // use the one you set
  port: 5432,
});

module.exports = pool;
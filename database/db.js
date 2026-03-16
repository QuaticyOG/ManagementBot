const { Pool } = require('pg');

const isRailway = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRailway ? { rejectUnauthorized: false } : undefined,
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};

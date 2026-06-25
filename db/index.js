const { Pool } = require('pg');
require('dotenv').config();
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('[PASSWORD]')) {
  console.error('❌ ERROR: DATABASE_URL is not configured correctly in .env file.');
  console.error('Expected format: postgresql://postgres:password@host:port/database');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection on startup
(async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database Connected Successfully');
    console.log('Database Time:', result.rows[0].now);
  } catch (err) {
    console.error('❌ Database Connection Failed');
    console.error(err.message);
  }
})();

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
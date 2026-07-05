const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

const safeUrl = process.env.DATABASE_URL.replace(/:([^@:]+)@/, ':****@');
console.log('🔌 DB URL:', safeUrl);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => console.error('❌ Pool error:', err.message));

const testConnection = async () => {
  let tries = 3;
  while (tries > 0) {
    try {
      const client = await pool.connect();
      const res = await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Database connected:', res.rows[0].now);
      return;
    } catch (err) {
      tries--;
      console.error(`❌ DB attempt failed (${3-tries}/3):`, err.message);
      if (tries === 0) { console.error('❌ Giving up.'); process.exit(1); }
      await new Promise(r => setTimeout(r, 2000));
    }
  }
};

const query = (text, params) => pool.query(text, params);
const getClient = () => pool.connect();
module.exports = { query, getClient, pool, testConnection };

import { Pool } from 'pg';

const pool = new Pool({
  user: 'bana',
  password: 'superuser',
  host: 'localhost',
  port: 5432,
  database: 'sociolite'
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Connection successful:', result.rows[0]);
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await pool.end();
  }
}

testConnection(); 
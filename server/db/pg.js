require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  family: 4 // Use IPv4
});

/**
 * Execute a query with optional parameters
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<QueryResult>}
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('error executing query', { text, params, error: err.message });
    throw err;
  }
}

/**
 * Close the pool (useful for shutdown)
 */
async function shutdown() {
  await pool.end();
}

/**
 * Initialize the database by running the schema.sql
 * This is for initial setup or reset. In production, use migration scripts.
 */
async function initialize() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  try {
    await query(sql);
    console.log('Database schema initialized');
  } catch (err) {
    console.error('Error initializing database schema:', err);
    throw err;
  }
}

/**
 * Migrate data from SQLite to PostgreSQL
 * This is a placeholder for a more complex migration script.
 * In practice, you would export from SQLite and import to PostgreSQL.
 */
async function migrateFromSQLite() {
  // This would involve:
  // 1. Reading from the SQLite file (if exists)
  // 2. Transforming data to match PostgreSQL schema
  // 3. Inserting into PostgreSQL
  // For now, we'll just log that this needs to be implemented.
  console.log('SQLite to PostgreSQL migration not implemented in this layer.');
  console.log('Use a separate migration script for data transfer.');
}

module.exports = {
  query,
  shutdown,
  initialize,
  migrateFromSQLite,
  pool
};
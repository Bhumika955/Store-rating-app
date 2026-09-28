// backend/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Cloud DB connection error:', err.message);
  }
  console.log('Successfully connected to Cloud PostgreSQL database!');
  release();
});

module.exports = pool;
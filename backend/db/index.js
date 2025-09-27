const { Pool } = require('pg');
require('dotenv').config();

// Use environment variables for secure database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oQw9kLJVj4mx@ep-morning-bonus-adu1l8aa-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

// Test connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
};

testConnection();

// A wrapper function to execute queries
const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
  pool
};
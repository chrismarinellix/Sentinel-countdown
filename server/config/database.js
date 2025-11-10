/**
 * PostgreSQL Database Connection Pool Configuration
 */

const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'sentinel',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    // Connection pool settings
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    max: parseInt(process.env.DB_POOL_MAX) || 20,
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: 5000,

    // Error handling
    statement_timeout: 30000, // 30 seconds
    query_timeout: 30000
};

// Create connection pool
const pool = new Pool(config);

// Handle pool errors
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle database client', err);
    process.exit(-1);
});

// Handle pool connection
pool.on('connect', () => {
    console.log('✅ Database connection established');
});

// Helper function to execute queries
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Helper function for transactions
async function transaction(callback) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Helper function to get a client from pool
async function getClient() {
    return await pool.connect();
}

// Test database connection
async function testConnection() {
    try {
        const result = await query('SELECT NOW() as current_time, version() as version');
        console.log('📊 Database connection successful');
        console.log('   Server time:', result.rows[0].current_time);
        console.log('   PostgreSQL version:', result.rows[0].version.split(',')[0]);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// Graceful shutdown
async function close() {
    console.log('Closing database connection pool...');
    await pool.end();
    console.log('✅ Database connection pool closed');
}

module.exports = {
    pool,
    query,
    transaction,
    getClient,
    testConnection,
    close
};

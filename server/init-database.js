/**
 * Project Sentinel - Database Initialization Script
 * This script creates the PostgreSQL database, runs the schema, and hashes all passwords
 */

const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

async function initializeDatabase() {
    console.log('🛡️  Project Sentinel - Database Initialization\n');

    // First, connect to postgres database to create sentinel database
    const adminPool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: 'postgres'
    });

    try {
        // Check if database exists
        const dbCheck = await adminPool.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [process.env.DB_NAME || 'sentinel']
        );

        if (dbCheck.rows.length === 0) {
            console.log('📁 Creating database...');
            await adminPool.query(`CREATE DATABASE ${process.env.DB_NAME || 'sentinel'}`);
            console.log('✅ Database created');
        } else {
            console.log('✅ Database already exists');
        }
    } catch (error) {
        console.error('❌ Error creating database:', error.message);
    } finally {
        await adminPool.end();
    }

    // Now connect to the sentinel database
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'sentinel'
    });

    try {
        console.log('\n📋 Running schema...');
        const schemaPath = path.join(__dirname, 'database', 'schema-postgresql.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema
        await pool.query(schema);
        console.log('✅ Schema created successfully');

        // Hash all passwords
        console.log('\n🔐 Hashing passwords...');
        const defaultPassword = 'password';
        const hashedPassword = await bcrypt.hash(defaultPassword, BCRYPT_ROUNDS);

        const updateResult = await pool.query(
            "UPDATE users SET password_hash = $1 WHERE password_hash = 'PLACEHOLDER'",
            [hashedPassword]
        );

        console.log(`✅ Passwords hashed for ${updateResult.rowCount} users`);

        // Verify setup
        console.log('\n📊 Database Statistics:');
        const userCount = await pool.query('SELECT COUNT(*) FROM users');
        const prizeCount = await pool.query('SELECT COUNT(*) FROM prizes');
        const leaderboardCount = await pool.query('SELECT COUNT(*) FROM leaderboard');

        console.log(`   Users: ${userCount.rows[0].count}`);
        console.log(`   Prizes: ${prizeCount.rows[0].count}`);
        console.log(`   Leaderboard entries: ${leaderboardCount.rows[0].count}`);

        // List all users
        console.log('\n👥 Users created:');
        const users = await pool.query('SELECT username, full_name, role, is_sentinel FROM users ORDER BY user_id');
        users.rows.forEach(user => {
            const sentinel = user.is_sentinel ? '🛡️ ' : '   ';
            console.log(`   ${sentinel}${user.username} - ${user.full_name} (${user.role})`);
        });

        console.log('\n🎉 Database initialization complete!');
        console.log('\n📝 Next steps:');
        console.log('   1. Start the server: npm start');
        console.log('   2. Server will run on http://localhost:' + (process.env.PORT || 3000));
        console.log('   3. All users can login with:');
        console.log('      Username: firstname.lastname');
        console.log('      Password: password');
        console.log('\n⚠️  IMPORTANT: Change default passwords in production!');

    } catch (error) {
        console.error('\n❌ Error initializing database:', error);
        console.error('\nFull error:', error.stack);
    } finally {
        await pool.end();
    }
}

// Run initialization
initializeDatabase().catch(console.error);

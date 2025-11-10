/**
 * Project Sentinel - Database Initialization
 * This script initializes the SQLite database with the schema
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'sentinel.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

function initializeDatabase() {
    console.log('🛡️  Initializing Project Sentinel Database...\n');

    // Read the schema file
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

    // Create/open database
    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('❌ Error opening database:', err.message);
            process.exit(1);
        }
        console.log('✅ Database connection established');
    });

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON;');

    // Execute schema
    db.exec(schema, (err) => {
        if (err) {
            console.error('❌ Error executing schema:', err.message);
            process.exit(1);
        }
        console.log('✅ Database schema created successfully');
        console.log('✅ Initial users inserted');
        console.log('✅ Prize structure configured');
        console.log('✅ Leaderboard initialized');
        console.log('\n🎉 Database initialization complete!');
        console.log(`📁 Database location: ${DB_PATH}`);
        console.log('\n📊 Default credentials for all users:');
        console.log('   Username: [firstname].[lastname] (e.g., dominic.moncada)');
        console.log('   Password: password');
        console.log('\n⚠️  IMPORTANT: Change passwords in production!\n');

        // Close database
        db.close((err) => {
            if (err) {
                console.error('❌ Error closing database:', err.message);
            }
        });
    });
}

// Run initialization
initializeDatabase();

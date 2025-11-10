/**
 * Project Sentinel - Enterprise Backend Server
 * PostgreSQL + Express + Multi-Stage Verification System
 */

const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./config/database');
const { pool } = require('./config/database');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Allow inline scripts for frontend
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration with PostgreSQL store
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'sessions'
    }),
    secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
    name: process.env.SESSION_NAME || 'sentinel_session',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax'
    }
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: 'Database connection failed'
        });
    }
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/prizes', require('./routes/prizes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/verification', require('./routes/verification'));
app.use('/api/ai', require('./routes/ai'));

// Serve static files (frontend)
app.use(express.static('../'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Don't leak error details in production
    const error = process.env.NODE_ENV === 'production'
        ? { message: 'Internal server error' }
        : { message: err.message, stack: err.stack };

    res.status(err.status || 500).json({
        error: error,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path
    });
});

// Start server
async function startServer() {
    try {
        // Test database connection
        console.log('🔍 Testing database connection...');
        const dbConnected = await db.testConnection();

        if (!dbConnected) {
            console.error('❌ Failed to connect to database');
            console.error('   Please check your .env configuration');
            process.exit(1);
        }

        // Start listening
        app.listen(PORT, () => {
            console.log('\n🛡️  Project Sentinel Server Started!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`📡 Server:     http://localhost:${PORT}`);
            console.log(`🗄️  Database:   Connected (PostgreSQL)`);
            console.log(`🔐 Sessions:   PostgreSQL store`);
            console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            console.log('📝 API Endpoints:');
            console.log('   POST   /api/auth/login');
            console.log('   POST   /api/auth/logout');
            console.log('   GET    /api/auth/me');
            console.log('   GET    /api/submissions');
            console.log('   POST   /api/submissions');
            console.log('   GET    /api/leaderboard');
            console.log('   GET    /api/verification/milestones/:id');
            console.log('   POST   /api/verification/approve');
            console.log('   GET    /api/admin/gaming-report');
            console.log('\n✅ Server ready to accept connections\n');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM received, shutting down gracefully...');
    await db.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n🛑 SIGINT received, shutting down gracefully...');
    await db.close();
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;

/**
 * Authentication Middleware
 */

const db = require('../config/database');

// Check if user is authenticated
function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Please login to access this resource'
        });
    }
    next();
}

// Check if user is admin
async function requireAdmin(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Please login to access this resource'
        });
    }

    try {
        const result = await db.query(
            'SELECT username FROM users WHERE user_id = $1',
            [req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const adminUsers = ['chris.marinelli', 'admin'];
        if (!adminUsers.includes(result.rows[0].username)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Admin access required'
            });
        }

        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Check if user is a Sentinel
async function requireSentinel(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Please login to access this resource'
        });
    }

    try {
        const result = await db.query(
            'SELECT is_sentinel FROM users WHERE user_id = $1',
            [req.session.userId]
        );

        if (result.rows.length === 0 || !result.rows[0].is_sentinel) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Sentinel access required'
            });
        }

        next();
    } catch (error) {
        console.error('Sentinel check error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Audit logging middleware
async function logAudit(req, res, next) {
    const originalSend = res.send;

    res.send = function (data) {
        // Log successful actions (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300 && req.session?.userId) {
            const action = `${req.method} ${req.path}`;
            const details = JSON.stringify({
                body: req.body,
                params: req.params,
                query: req.query
            });

            db.query(
                `INSERT INTO audit_log (user_id, action, details, ip_address, user_agent)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    req.session.userId,
                    action,
                    details,
                    req.ip,
                    req.get('user-agent')
                ]
            ).catch(err => console.error('Audit log error:', err));
        }

        originalSend.call(this, data);
    };

    next();
}

module.exports = {
    requireAuth,
    requireAdmin,
    requireSentinel,
    logAudit
};

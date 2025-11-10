/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { requireAuth } = require('../middleware/auth');

// Login
router.post('/login', [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        // Find user
        const result = await db.query(
            'SELECT user_id, username, password_hash, full_name, email, region, role, is_sentinel, sentinel_role, is_active FROM users WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Username or password is incorrect'
            });
        }

        const user = result.rows[0];

        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({
                error: 'Account disabled',
                message: 'Your account has been disabled. Please contact an administrator.'
            });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Username or password is incorrect'
            });
        }

        // Update last login
        await db.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
            [user.user_id]
        );

        // Create session
        req.session.userId = user.user_id;
        req.session.username = user.username;

        // Return user data (without password)
        const userData = {
            user_id: user.user_id,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            region: user.region,
            role: user.role,
            is_sentinel: user.is_sentinel,
            sentinel_role: user.sentinel_role
        };

        res.json({
            success: true,
            message: 'Login successful',
            user: userData
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            message: 'An error occurred during login'
        });
    }
});

// Logout
router.post('/logout', requireAuth, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({
                error: 'Logout failed',
                message: 'An error occurred during logout'
            });
        }
        res.json({
            success: true,
            message: 'Logout successful'
        });
    });
});

// Get current user
router.get('/me', requireAuth, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT user_id, username, full_name, email, region, role, is_sentinel, sentinel_role, last_login FROM users WHERE user_id = $1',
            [req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            error: 'Failed to retrieve user information'
        });
    }
});

// Check session
router.get('/check', (req, res) => {
    res.json({
        authenticated: !!req.session?.userId,
        userId: req.session?.userId || null
    });
});

module.exports = router;

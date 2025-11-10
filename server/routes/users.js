const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { requireAuth } = require('../middleware/auth');

// Get all users
router.get('/', requireAuth, async (req, res) => {
    try {
        const result = await db.query('SELECT user_id, username, full_name, email, region, role, is_sentinel FROM users WHERE is_active = TRUE');
        res.json({ success: true, users: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

module.exports = router;

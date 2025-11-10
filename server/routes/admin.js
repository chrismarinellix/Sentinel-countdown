const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { requireAdmin } = require('../middleware/auth');

// Get gaming report
router.get('/gaming-report', requireAdmin, async (req, res) => {
    try {
        const flags = await db.query('SELECT * FROM gaming_detection_flags ORDER BY created_at DESC LIMIT 50');
        res.json({ success: true, flags: flags.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// Get statistics
router.get('/statistics', requireAdmin, async (req, res) => {
    try {
        const users = await db.query('SELECT COUNT(*) FROM users WHERE is_active = TRUE');
        const submissions = await db.query('SELECT COUNT(*) FROM submissions');
        const pending = await db.query("SELECT COUNT(*) FROM submissions WHERE status IN ('submitted', 'pending')");

        res.json({
            success: true,
            stats: {
                total_users: users.rows[0].count,
                total_submissions: submissions.rows[0].count,
                pending_submissions: pending.rows[0].count
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

module.exports = router;

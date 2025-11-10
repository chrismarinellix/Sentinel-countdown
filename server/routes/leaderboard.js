const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get leaderboard
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM active_leaderboard');
        res.json({ success: true, leaderboard: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get prizes
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM prizes WHERE is_active = TRUE ORDER BY quarter_name, is_sentinel_prize');
        res.json({ success: true, prizes: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch prizes' });
    }
});

module.exports = router;

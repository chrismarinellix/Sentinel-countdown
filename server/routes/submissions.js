const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { requireAuth } = require('../middleware/auth');

// Get all submissions
router.get('/', requireAuth, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT s.*, u.full_name as submitter_name
            FROM submissions s
            JOIN users u ON s.user_id = u.user_id
            ORDER BY s.submitted_date DESC
        `);
        res.json({ success: true, submissions: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

// Create submission
router.post('/', requireAuth, async (req, res) => {
    try {
        const { title, description, solution, category } = req.body;
        const result = await db.query(
            `INSERT INTO submissions (user_id, title, description, solution, category, status)
             VALUES ($1, $2, $3, $4, $5, 'submitted') RETURNING *`,
            [req.session.userId, title, description, solution || '', category]
        );
        res.json({ success: true, submission: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create submission' });
    }
});

module.exports = router;

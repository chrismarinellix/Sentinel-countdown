const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { requireAuth, requireSentinel } = require('../middleware/auth');

// Get milestones for submission
router.get('/milestones/:submissionId', requireAuth, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM submission_milestones WHERE submission_id = $1 ORDER BY created_at',
            [req.params.submissionId]
        );
        res.json({ success: true, milestones: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch milestones' });
    }
});

// Approve milestone (Sentinel only)
router.post('/approve', requireSentinel, async (req, res) => {
    try {
        const { milestone_id, notes } = req.body;
        const result = await db.query(
            `UPDATE submission_milestones
             SET status = 'approved', verified_by = $1, verification_date = NOW(), notes = $2
             WHERE milestone_id = $3 RETURNING *`,
            [req.session.userId, notes, milestone_id]
        );
        res.json({ success: true, milestone: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to approve milestone' });
    }
});

module.exports = router;

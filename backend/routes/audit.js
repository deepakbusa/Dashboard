const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get audit logs
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDatabase();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const action = req.query.action;
        const userId = req.query.userId;

        let query = {};
        if (action) {
            query.action = action;
        }
        if (userId) {
            query.userId = userId;
        }

        const [logs, total] = await Promise.all([
            db.collection('audit_logs')
                .find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            db.collection('audit_logs').countDocuments(query)
        ]);

        res.json({
            logs,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Audit logs error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch audit logs'
        });
    }
});

// Get audit actions summary
router.get('/summary', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDatabase();
        const days = parseInt(req.query.days) || 7;
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);

        const summary = await db.collection('audit_logs').aggregate([
            { $match: { timestamp: { $gte: dateFrom } } },
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();

        res.json({
            success: true,
            data: summary.map(s => ({
                action: s._id,
                count: s.count
            }))
        });

    } catch (error) {
        console.error('Audit summary error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch audit summary'
        });
    }
});

module.exports = router;

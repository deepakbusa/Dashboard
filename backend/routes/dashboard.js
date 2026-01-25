const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get dashboard overview stats
router.get('/overview', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDatabase();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalUsers,
            activeUsers,
            blockedUsers,
            activeSessions,
            todayRequests,
            todayChats,
            totalRequests,
            totalChats,
            gptRequests,
            speechRequests
        ] = await Promise.all([
            db.collection('users').countDocuments(),
            db.collection('users').countDocuments({ isActive: true, isBlocked: false }),
            db.collection('users').countDocuments({ isBlocked: true }),
            db.collection('sessions').countDocuments({ isActive: true }),
            db.collection('api_requests').countDocuments({ timestamp: { $gte: today } }),
            db.collection('api_requests').countDocuments({ 
                service: 'chat',
                timestamp: { $gte: today }
            }),
            db.collection('api_requests').countDocuments(),
            db.collection('api_requests').countDocuments({ service: 'chat' }),
            db.collection('api_requests').countDocuments({ 
                model: { $in: ['openai_gpt', 'gpt-4o', 'gpt-4o-vision'] } 
            }),
            db.collection('api_requests').countDocuments({ model: 'azure_speech' })
        ]);

        res.json({
            totalUsers,
            activeUsers,
            blockedUsers,
            activeSessions,
            todayRequests,
            todayChats,
            totalRequests,
            totalChats,
            gptRequests,
            speechRequests
        });

    } catch (error) {
        console.error('Dashboard overview error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard overview'
        });
    }
});

// Get recent activity
router.get('/activity', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDatabase();
        const limit = parseInt(req.query.limit) || 50;

        const recentActivity = await db.collection('audit_logs')
            .find({})
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();

        res.json(recentActivity);

    } catch (error) {
        console.error('Recent activity error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recent activity'
        });
    }
});

// Get top services
router.get('/top-services', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDatabase();
        const days = parseInt(req.query.days) || 7;
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);

        const topServices = await db.collection('api_requests').aggregate([
            { $match: { timestamp: { $gte: dateFrom } } },
            { $group: { _id: '$model', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]).toArray();

        res.json(topServices.map(s => ({
            service: s._id || 'unknown',
            count: s.count
        })));

    } catch (error) {
        console.error('Top services error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch top services'
        });
    }
});

// Get usage trends
router.get('/trends', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDatabase();
        const days = parseInt(req.query.days) || 7;
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);

        const trends = await db.collection('api_requests').aggregate([
            { $match: { timestamp: { $gte: dateFrom } } },
            { 
                $group: { 
                    _id: { 
                        $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                    },
                    requests: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]).toArray();

        res.json(trends.map(t => ({
            date: t._id,
            requests: t.requests
        })));

    } catch (error) {
        console.error('Trends error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch trends'
        });
    }
});

module.exports = router;

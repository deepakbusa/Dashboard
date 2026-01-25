const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get detailed analytics
router.get('/detailed', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDatabase();
        const days = parseInt(req.query.days) || 30;
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);

        // Get various analytics
        const [
            requestsByService,
            requestsByModel,
            requestsByProfile,
            userActivity,
            hourlyDistribution
        ] = await Promise.all([
            // Requests by service
            db.collection('api_requests').aggregate([
                { $match: { timestamp: { $gte: dateFrom } } },
                { $group: { _id: '$service', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]).toArray(),

            // Requests by model (normalize gpt-4o variants to openai_gpt)
            db.collection('api_requests').aggregate([
                { $match: { timestamp: { $gte: dateFrom } } },
                { 
                    $addFields: { 
                        normalizedModel: {
                            $cond: {
                                if: { $in: ['$model', ['gpt-4o', 'gpt-4o-vision', 'openai_gpt']] },
                                then: 'openai_gpt',
                                else: '$model'
                            }
                        }
                    }
                },
                { $group: { _id: '$normalizedModel', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]).toArray(),

            // Requests by profile
            db.collection('api_requests').aggregate([
                { $match: { timestamp: { $gte: dateFrom } } },
                { $group: { _id: '$profile', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]).toArray(),

            // User activity
            db.collection('api_requests').aggregate([
                { $match: { timestamp: { $gte: dateFrom } } },
                { $group: { _id: '$userId', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]).toArray(),

            // Hourly distribution
            db.collection('api_requests').aggregate([
                { $match: { timestamp: { $gte: dateFrom } } },
                { 
                    $group: { 
                        _id: { $hour: '$timestamp' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]).toArray()
        ]);

        res.json({
            requestsByService: requestsByService.map(r => ({ service: r._id || 'unknown', count: r.count })),
            requestsByModel: requestsByModel.map(r => ({ model: r._id || 'unknown', count: r.count })),
            requestsByProfile: requestsByProfile.map(r => ({ profile: r._id || 'unknown', count: r.count })),
            topUsers: await Promise.all(userActivity.map(async (r) => {
                const user = await db.collection('users').findOne({ userId: r._id });
                return { 
                    username: user?.userId || r._id, 
                    totalRequests: r.count 
                };
            })),
            hourlyDistribution: hourlyDistribution.map(r => ({ hour: `${r._id}:00`, count: r.count }))
        });

    } catch (error) {
        console.error('Detailed analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics'
        });
    }
});

// Get user statistics
router.get('/user-stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDatabase();

        const stats = await db.collection('users').aggregate([
            {
                $facet: {
                    byPlan: [
                        { $group: { _id: '$plan', count: { $sum: 1 } } }
                    ],
                    byRole: [
                        { $group: { _id: '$role', count: { $sum: 1 } } }
                    ],
                    byStatus: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ],
                    growth: [
                        {
                            $group: {
                                _id: {
                                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                                },
                                newUsers: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } },
                        { $limit: 7 },
                        {
                            $project: {
                                date: '$_id',
                                newUsers: 1,
                                _id: 0
                            }
                        }
                    ]
                }
            }
        ]).toArray();

        res.json(stats[0]);

    } catch (error) {
        console.error('User stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user statistics'
        });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all sessions
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDatabase();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status; // 'active', 'inactive', 'all'

        let query = {};
        if (status === 'active') {
            query.isActive = true;
        } else if (status === 'inactive' || status === 'ended') {
            query.isActive = false;
        }

        const [sessions, total] = await Promise.all([
            db.collection('sessions')
                .find(query)
                .sort({ loginAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            db.collection('sessions').countDocuments(query)
        ]);

        res.json({
            sessions,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sessions'
        });
    }
});

// End session
router.post('/:sessionId/end', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDatabase();
        const { sessionId } = req.params;

        const result = await db.collection('sessions').updateOne(
            { sessionId },
            { 
                $set: { 
                    isActive: false,
                    logoutAt: new Date(),
                    logoutReason: 'Terminated by admin'
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        // Log audit event
        await db.collection('audit_logs').insertOne({
            userId: req.user.username,
            action: 'admin.end_session',
            status: 'success',
            metadata: { sessionId },
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: 'Session ended successfully'
        });

    } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to end session'
        });
    }
});

// Clear all inactive sessions
router.post('/cleanup', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDatabase();
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const result = await db.collection('sessions').updateMany(
            { 
                isActive: true,
                loginAt: { $lt: twentyFourHoursAgo }
            },
            { 
                $set: { 
                    isActive: false,
                    logoutAt: new Date(),
                    logoutReason: 'Auto-cleanup: Session expired'
                }
            }
        );

        await db.collection('audit_logs').insertOne({
            userId: req.user.username,
            action: 'admin.cleanup_sessions',
            status: 'success',
            metadata: { cleanedCount: result.modifiedCount },
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: `Cleaned up ${result.modifiedCount} expired sessions`
        });

    } catch (error) {
        console.error('Cleanup sessions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cleanup sessions'
        });
    }
});

module.exports = router;

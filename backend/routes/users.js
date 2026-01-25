const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getDatabase } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all users with pagination
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDatabase();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const status = req.query.status; // 'active', 'blocked', 'all'

        // Build query
        let query = {};
        if (search) {
            query.$or = [
                { userId: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { fullName: { $regex: search, $options: 'i' } }
            ];
        }
        if (status === 'frozen' || status === 'blocked') {
            query.isBlocked = true;
        } else if (status === 'active') {
            query.isActive = true;
            query.isBlocked = false;
        } else if (status === 'inactive') {
            query.isActive = false;
            query.isBlocked = false;
        }

        const [users, total] = await Promise.all([
            db.collection('users')
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            db.collection('users').countDocuments(query)
        ]);

        // Get active sessions for each user
        const usersWithSessions = await Promise.all(users.map(async (user) => {
            const activeSessions = await db.collection('sessions')
                .countDocuments({ userId: user.userId, isActive: true });
            
            return {
                ...user,
                password: undefined, // Don't send password
                activeSessions
            };
        }));

        res.json({
            users: usersWithSessions,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
});

// Get single user details
router.get('/:userId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDatabase();
        const { userId } = req.params;

        const [user, sessions, requests] = await Promise.all([
            db.collection('users').findOne({ userId }),
            db.collection('sessions')
                .find({ userId })
                .sort({ loginAt: -1 })
                .toArray(),
            db.collection('api_requests')
                .find({ userId })
                .toArray()
        ]);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Calculate statistics
        const activeSessions = sessions.filter(s => s.isActive === true).length;
        const totalSessions = sessions.length;
        const totalRequests = requests.length;
        const gptRequests = requests.filter(r => 
            r.model === 'openai_gpt' || r.model === 'gpt-4o' || r.model === 'gpt-4o-vision'
        ).length;
        const speechRequests = requests.filter(r => r.model === 'azure_speech').length;
        
        // Calculate total time spent (sum of all session durations)
        const totalTimeSpent = sessions.reduce((total, session) => {
            if (session.loginAt) {
                const endTime = session.logoutAt ? new Date(session.logoutAt) : new Date();
                const startTime = new Date(session.loginAt);
                return total + (endTime - startTime);
            }
            return total;
        }, 0);

        // Remove password from response
        delete user.password;

        res.json({
            user,
            sessions: sessions.slice(0, 20), // Last 20 sessions
            stats: {
                totalRequests,
                totalSessions,
                activeSessions,
                totalTimeSpent,
                gptRequests,
                speechRequests
            }
        });

    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user details'
        });
    }
});

// Create new user
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDatabase();
        const { userId, password, email, fullName, role, plan } = req.body;

        if (!userId || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'User ID, email, and password are required'
            });
        }

        // Check if user exists
        const existingUser = await db.collection('users').findOne({ userId });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User ID already exists'
            });
        }

        // Create user
        const newUser = {
            userId,
            password: password, // Note: You may want to hash this
            email: email || null,
            fullName: fullName || null,
            role: role || 'user',
            plan: plan || 'free',
            isActive: true,
            isBlocked: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await db.collection('users').insertOne(newUser);

        // Log audit event
        await db.collection('audit_logs').insertOne({
            userId: req.user.username,
            action: 'admin.create_user',
            status: 'success',
            metadata: { createdUserId: userId },
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: 'User created successfully',
            data: { userId }
        });

    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create user'
        });
    }
});

// Update user
router.put('/:userId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDatabase();
        const { userId } = req.params;
        const { email, fullName, role, plan, isActive } = req.body;

        const updateData = {
            updatedAt: new Date()
        };

        if (email !== undefined) updateData.email = email;
        if (fullName !== undefined) updateData.fullName = fullName;
        if (role !== undefined) updateData.role = role;
        if (plan !== undefined) updateData.plan = plan;
        if (isActive !== undefined) updateData.isActive = isActive;

        const result = await db.collection('users').updateOne(
            { userId },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Log audit event
        await db.collection('audit_logs').insertOne({
            userId: req.user.username,
            action: 'admin.update_user',
            status: 'success',
            metadata: { updatedUserId: userId, changes: updateData },
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: 'User updated successfully'
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user'
        });
    }
});

// Delete user
router.delete('/:userId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDatabase();
        const { userId } = req.params;

        // Delete user and all related data
        const [userResult] = await Promise.all([
            db.collection('users').deleteOne({ userId }),
            db.collection('sessions').deleteMany({ userId }),
            db.collection('api_requests').deleteMany({ userId })
        ]);

        if (userResult.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Log audit event
        await db.collection('audit_logs').insertOne({
            userId: req.user.username,
            action: 'admin.delete_user',
            status: 'success',
            metadata: { deletedUserId: userId },
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete user'
        });
    }
});

// Block/Freeze user
router.post('/:userId/block', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDatabase();
        const { userId } = req.params;
        const { reason } = req.body;

        const result = await db.collection('users').updateOne(
            { userId },
            { 
                $set: { 
                    isBlocked: true,
                    isActive: false,
                    blockedAt: new Date(),
                    blockReason: reason || 'Blocked by admin',
                    blockedBy: req.user.username
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // End all active sessions
        await db.collection('sessions').updateMany(
            { userId, isActive: true },
            { 
                $set: { 
                    isActive: false,
                    logoutAt: new Date(),
                    logoutReason: 'User blocked by admin'
                }
            }
        );

        // Log audit event
        await db.collection('audit_logs').insertOne({
            userId: req.user.username,
            action: 'admin.block_user',
            status: 'success',
            metadata: { blockedUserId: userId, reason },
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: 'User blocked successfully'
        });

    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to block user'
        });
    }
});

// Unblock/Unfreeze user
router.post('/:userId/unblock', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDatabase();
        const { userId } = req.params;

        const result = await db.collection('users').updateOne(
            { userId },
            { 
                $set: { 
                    isBlocked: false,
                    isActive: true,
                    unblockedAt: new Date(),
                    unblockedBy: req.user.username
                },
                $unset: {
                    blockedAt: '',
                    blockReason: '',
                    blockedBy: ''
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Log audit event
        await db.collection('audit_logs').insertOne({
            userId: req.user.username,
            action: 'admin.unblock_user',
            status: 'success',
            metadata: { unblockedUserId: userId },
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: 'User unblocked successfully'
        });

    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to unblock user'
        });
    }
});

module.exports = router;

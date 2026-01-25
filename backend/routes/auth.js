const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../config/database');

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        const db = getDatabase();
        
        // Find admin user
        const admin = await db.collection('admins').findOne({ username });

        if (!admin) {
            // Check if this is first time setup with default credentials
            if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
                // Create default admin
                const hashedPassword = await bcrypt.hash(password, 10);
                const newAdmin = {
                    username,
                    password: hashedPassword,
                    role: 'admin',
                    createdAt: new Date()
                };
                
                await db.collection('admins').insertOne(newAdmin);
                
                // Generate token
                const token = jwt.sign(
                    { id: newAdmin._id, username, role: 'admin' },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );

                return res.json({
                    success: true,
                    token,
                    admin: { username, role: 'admin' }
                });
            }

            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, admin.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Log admin login
        await db.collection('audit_logs').insertOne({
            userId: admin.username,
            action: 'admin.login',
            status: 'success',
            timestamp: new Date()
        });

        res.json({
            success: true,
            token,
            admin: {
                username: admin.username,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

// Verify token
router.get('/verify', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ success: true, user });
    } catch (error) {
        res.status(403).json({ success: false, error: 'Invalid token' });
    }
});

module.exports = router;

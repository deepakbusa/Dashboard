const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('../routes/auth');
const dashboardRoutes = require('../routes/dashboard');
const usersRoutes = require('../routes/users');
const sessionsRoutes = require('../routes/sessions');
const analyticsRoutes = require('../routes/analytics');
const auditRoutes = require('../routes/audit');

// Import database connection
const { connectToMongoDB } = require('../config/database');

const app = express();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/', (req, res) => {
    res.json({ 
        message: 'Pulse Admin Dashboard API',
        status: 'running',
        timestamp: new Date()
    });
});

// Connect to MongoDB before handling requests
let dbConnected = false;

app.use(async (req, res, next) => {
    if (!dbConnected) {
        try {
            await connectToMongoDB();
            dbConnected = true;
        } catch (error) {
            console.error('MongoDB connection failed:', error);
            return res.status(500).json({
                success: false,
                error: 'Database connection failed'
            });
        }
    }
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

module.exports = app;

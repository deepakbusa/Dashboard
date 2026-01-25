const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const usersRoutes = require('./routes/users');
const sessionsRoutes = require('./routes/sessions');
const analyticsRoutes = require('./routes/analytics');
const auditRoutes = require('./routes/audit');

// Import database connection
const { connectToMongoDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
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

// Start server
async function startServer() {
    try {
        // Connect to MongoDB
        await connectToMongoDB();
        console.log('✅ MongoDB connected');

        // Start Express server with keepAlive
        const server = app.listen(PORT, () => {
            console.log(`🚀 Admin Dashboard API running on http://localhost:${PORT}`);
            console.log(`📊 Dashboard will connect from: ${process.env.CORS_ORIGIN}`);
        });

        // Configure server timeouts
        server.keepAliveTimeout = 65000; // 65 seconds (more than default 5s)
        server.headersTimeout = 66000; // 66 seconds (slightly more than keepAliveTimeout)
        server.timeout = 120000; // 2 minutes for long-running requests

        // Handle server errors
        server.on('error', (error) => {
            console.error('❌ Server error:', error);
        });

        // Monitor connections
        let connections = 0;
        server.on('connection', (socket) => {
            connections++;
            console.log(`📡 New connection. Total: ${connections}`);
            
            socket.on('close', () => {
                connections--;
                console.log(`📡 Connection closed. Total: ${connections}`);
            });
        });

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('🛑 SIGTERM received, closing server gracefully...');
            server.close(async () => {
                console.log('✅ Server closed');
                await connectToMongoDB.closeMongoDB();
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle shutdown gracefully
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});

startServer();

module.exports = app;

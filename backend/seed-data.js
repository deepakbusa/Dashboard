require('dotenv').config();
const mongoose = require('mongoose');

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        const db = mongoose.connection.db;

        // Create test users
        const users = [
            {
                username: 'john_doe',
                email: 'john@example.com',
                status: 'active',
                loginAttempts: 0,
                createdAt: new Date('2026-01-20'),
                lastLoginAt: new Date('2026-01-25')
            },
            {
                username: 'jane_smith',
                email: 'jane@example.com',
                status: 'active',
                loginAttempts: 0,
                createdAt: new Date('2026-01-22'),
                lastLoginAt: new Date('2026-01-24')
            },
            {
                username: 'bob_wilson',
                email: 'bob@example.com',
                status: 'frozen',
                loginAttempts: 5,
                frozenAt: new Date('2026-01-23'),
                createdAt: new Date('2026-01-18'),
                lastLoginAt: new Date('2026-01-23')
            },
            {
                username: 'alice_brown',
                email: 'alice@example.com',
                status: 'active',
                loginAttempts: 1,
                createdAt: new Date('2026-01-21'),
                lastLoginAt: new Date('2026-01-25')
            },
            {
                username: 'test_user',
                email: 'test@example.com',
                status: 'inactive',
                loginAttempts: 0,
                createdAt: new Date('2026-01-19'),
                lastLoginAt: null
            }
        ];

        console.log('\n📝 Inserting test users...');
        await db.collection('users').insertMany(users);
        console.log(`✓ Created ${users.length} test users`);

        // Create test sessions
        const sessions = [
            {
                userId: 'john_doe',
                username: 'john_doe',
                status: 'active',
                startTime: new Date('2026-01-25T08:30:00'),
                lastActivity: new Date('2026-01-25T09:15:00'),
                ipAddress: '192.168.1.101',
                userAgent: 'CrackMate-Desktop/1.0'
            },
            {
                userId: 'jane_smith',
                username: 'jane_smith',
                status: 'active',
                startTime: new Date('2026-01-25T07:00:00'),
                lastActivity: new Date('2026-01-25T09:00:00'),
                ipAddress: '192.168.1.102',
                userAgent: 'CrackMate-Desktop/1.0'
            },
            {
                userId: 'bob_wilson',
                username: 'bob_wilson',
                status: 'ended',
                startTime: new Date('2026-01-24T14:00:00'),
                endTime: new Date('2026-01-24T16:30:00'),
                lastActivity: new Date('2026-01-24T16:30:00'),
                ipAddress: '192.168.1.103',
                userAgent: 'CrackMate-Desktop/1.0'
            },
            {
                userId: 'alice_brown',
                username: 'alice_brown',
                status: 'ended',
                startTime: new Date('2026-01-24T10:00:00'),
                endTime: new Date('2026-01-24T12:00:00'),
                lastActivity: new Date('2026-01-24T12:00:00'),
                ipAddress: '192.168.1.104',
                userAgent: 'CrackMate-Desktop/1.0'
            }
        ];

        console.log('📝 Inserting test sessions...');
        await db.collection('sessions').insertMany(sessions);
        console.log(`✓ Created ${sessions.length} test sessions`);

        // Create test API requests
        const apiRequests = [
            {
                userId: 'john_doe',
                username: 'john_doe',
                service: 'gemini',
                timestamp: new Date('2026-01-25T09:00:00'),
                success: true,
                responseTime: 1250
            },
            {
                userId: 'john_doe',
                username: 'john_doe',
                service: 'gemini',
                timestamp: new Date('2026-01-25T09:05:00'),
                success: true,
                responseTime: 980
            },
            {
                userId: 'jane_smith',
                username: 'jane_smith',
                service: 'gemini',
                timestamp: new Date('2026-01-25T08:30:00'),
                success: true,
                responseTime: 1100
            },
            {
                userId: 'jane_smith',
                username: 'jane_smith',
                service: 'gemini',
                timestamp: new Date('2026-01-25T08:45:00'),
                success: false,
                responseTime: 0,
                error: 'Rate limit exceeded'
            },
            {
                userId: 'alice_brown',
                username: 'alice_brown',
                service: 'gemini',
                timestamp: new Date('2026-01-24T11:00:00'),
                success: true,
                responseTime: 1350
            },
            {
                userId: 'bob_wilson',
                username: 'bob_wilson',
                service: 'gemini',
                timestamp: new Date('2026-01-24T15:00:00'),
                success: true,
                responseTime: 890
            }
        ];

        console.log('📝 Inserting test API requests...');
        await db.collection('api_requests').insertMany(apiRequests);
        console.log(`✓ Created ${apiRequests.length} test API requests`);

        // Create test audit logs
        const auditLogs = [
            {
                action: 'user_login',
                userId: 'john_doe',
                username: 'john_doe',
                details: { ipAddress: '192.168.1.101' },
                timestamp: new Date('2026-01-25T08:30:00')
            },
            {
                action: 'user_login',
                userId: 'jane_smith',
                username: 'jane_smith',
                details: { ipAddress: '192.168.1.102' },
                timestamp: new Date('2026-01-25T07:00:00')
            },
            {
                action: 'account_frozen',
                userId: 'bob_wilson',
                username: 'bob_wilson',
                details: { reason: 'Too many failed login attempts' },
                timestamp: new Date('2026-01-23T10:30:00')
            },
            {
                action: 'user_logout',
                userId: 'alice_brown',
                username: 'alice_brown',
                details: { ipAddress: '192.168.1.104' },
                timestamp: new Date('2026-01-24T12:00:00')
            }
        ];

        console.log('📝 Inserting test audit logs...');
        await db.collection('audit_logs').insertMany(auditLogs);
        console.log(`✓ Created ${auditLogs.length} test audit logs`);

        // Summary
        console.log('\n✅ Database seeded successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Test Data Summary:');
        console.log(`   • ${users.length} users (3 active, 1 frozen, 1 inactive)`);
        console.log(`   • ${sessions.length} sessions (2 active, 2 ended)`);
        console.log(`   • ${apiRequests.length} API requests`);
        console.log(`   • ${auditLogs.length} audit log entries`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n👉 Refresh your admin dashboard to see the data!');

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();

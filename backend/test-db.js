require('dotenv').config();
const mongoose = require('mongoose');

async function testDatabase() {
    try {
        // Connect with database name already in URI
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');
        console.log(`📂 Database: ${mongoose.connection.db.databaseName}`);

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📋 Available collections:');
        collections.forEach(col => console.log(`   • ${col.name}`));

        const db = mongoose.connection.db;

        // Check each collection
        console.log('\n📊 Document counts:');
        
        const userCount = await db.collection('users').countDocuments();
        console.log(`   • users: ${userCount}`);
        
        const sessionCount = await db.collection('sessions').countDocuments();
        console.log(`   • sessions: ${sessionCount}`);
        
        const apiRequestCount = await db.collection('api_requests').countDocuments();
        console.log(`   • api_requests: ${apiRequestCount}`);
        
        const auditLogCount = await db.collection('audit_logs').countDocuments();
        console.log(`   • audit_logs: ${auditLogCount}`);
        
        const chatHistoryCount = await db.collection('chat_history').countDocuments();
        console.log(`   • chat_history: ${chatHistoryCount}`);
        
        const usageStatsCount = await db.collection('usage_statistics').countDocuments();
        console.log(`   • usage_statistics: ${usageStatsCount}`);

        // Check field structure
        if (userCount > 0) {
            console.log('\n👤 Sample user document:');
            const sampleUser = await db.collection('users').findOne({});
            console.log(JSON.stringify(sampleUser, null, 2));
        }

        if (sessionCount > 0) {
            console.log('\n🔐 Sample session document:');
            const sampleSession = await db.collection('sessions').findOne({});
            console.log(JSON.stringify(sampleSession, null, 2));
        }

        await mongoose.connection.close();
        console.log('\n✓ Database test complete');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testDatabase();

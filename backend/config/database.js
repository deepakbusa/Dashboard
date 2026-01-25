const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'pulse_crackmate';

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is required!');
}

let cachedClient = null;
let cachedDb = null;

async function connectToMongoDB() {
    // Return cached connection if available
    if (cachedClient && cachedDb) {
        return cachedDb;
    }

    try {
        console.log('🔌 Connecting to MongoDB...');
        
        const client = new MongoClient(MONGODB_URI, {
            maxPoolSize: 1,
            minPoolSize: 0,
            maxIdleTimeMS: 30000,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 30000,
        });

        await client.connect();
        const db = client.db(DATABASE_NAME);
        
        // Cache for reuse in serverless
        cachedClient = client;
        cachedDb = db;
        
        console.log('✅ Connected to MongoDB successfully');
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        cachedClient = null;
        cachedDb = null;
        throw error;
    }
}

function getDatabase() {
    if (!cachedDb) {
        throw new Error('Database not connected. Call connectToMongoDB() first.');
    }
    return cachedDb;
}

async function closeMongoDB() {
    if (cachedClient) {
        await cachedClient.close();
        cachedClient = null;
        cachedDb = null;
        console.log('🔌 MongoDB connection closed');
    }
}

module.exports = {
    connectToMongoDB,
    getDatabase,
    closeMongoDB,
    ObjectId
};

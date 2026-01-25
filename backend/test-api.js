require('dotenv').config();
const axios = require('axios');

async function testAPI() {
    try {
        // First login
        console.log('🔐 Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        
        const token = loginRes.data.token;
        console.log('✓ Logged in successfully');

        // Test dashboard overview
        console.log('\n📊 Testing dashboard overview...');
        const overviewRes = await axios.get('http://localhost:5000/api/dashboard/overview', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Overview data:', JSON.stringify(overviewRes.data, null, 2));

        // Test users endpoint
        console.log('\n👥 Testing users endpoint...');
        const usersRes = await axios.get('http://localhost:5000/api/users?page=1&limit=5', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Users response structure:', Object.keys(usersRes.data));
        if (usersRes.data.users && usersRes.data.users.length > 0) {
            console.log('First user sample:', JSON.stringify(usersRes.data.users[0], null, 2));
        }

        // Test sessions endpoint
        console.log('\n🔐 Testing sessions endpoint...');
        const sessionsRes = await axios.get('http://localhost:5000/api/sessions?page=1&limit=5', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Sessions response structure:', Object.keys(sessionsRes.data));
        if (sessionsRes.data.sessions && sessionsRes.data.sessions.length > 0) {
            console.log('First session sample:', JSON.stringify(sessionsRes.data.sessions[0], null, 2));
        }

        console.log('\n✅ All API tests completed!');
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testAPI();

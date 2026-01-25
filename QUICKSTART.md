# Quick Start Guide

## Prerequisites
- Node.js 16+ installed
- MongoDB connection URI ready
- Terminal/Command Prompt access

## First-Time Setup

### 1. Backend Setup
```bash
cd admin-dashboard/backend
npm install
```

Edit `backend/.env` with your MongoDB credentials:
```env
MONGODB_URI=your_mongodb_uri
MONGODB_DATABASE=pulse_crackmate
PORT=5000
JWT_SECRET=your_secret_key_here_min_32_chars
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
CORS_ORIGIN=http://localhost:3000
```

### 2. Frontend Setup
```bash
cd admin-dashboard/frontend
npm install
```

The `.env` is already configured:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

### Option 1: Two Separate Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
cd admin-dashboard/backend
npm run dev
```
Backend will start on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd admin-dashboard/frontend
npm start
```
Frontend will open automatically on: http://localhost:3000

### Option 2: Using npm scripts (from project root)

```bash
# From admin-dashboard folder
npm run start:backend    # Starts backend only
npm run start:frontend   # Starts frontend only
```

## First Login

1. Open http://localhost:3000 in your browser
2. You'll see the login page
3. Use default credentials:
   - **Username:** admin
   - **Password:** admin123

4. **IMPORTANT:** Change the default password immediately after first login!

## What You Can Do

### Dashboard Overview
- View total users, active users, blocked users
- Monitor active sessions
- See usage trends (last 7 days)
- View recent activity
- Top services used

### User Management (`/users`)
- Search and filter users
- View user details
- Block/Unblock users (freeze accounts)
- Delete users
- View active sessions per user

### Session Management (`/sessions`)
- View all active and ended sessions
- End specific sessions manually
- Cleanup expired sessions (>24 hours)
- Filter by session status

### Analytics (`/analytics`)
- Detailed request analytics by service
- Requests by AI model (pie chart)
- Hourly distribution of requests
- User statistics by plan (free/premium)
- User growth trends
- Top active users

### Audit Logs (`/audit`)
- Complete audit trail of all actions
- Filter by action type (login, logout, block, unblock, etc.)
- Search by username
- View IP addresses
- Timestamp for every action

## Troubleshooting

### Backend Issues

**Port 5000 already in use:**
```bash
# Change PORT in backend/.env to 5001 or another port
# Update REACT_APP_API_URL in frontend/.env accordingly
```

**MongoDB connection failed:**
- Verify MONGODB_URI in backend/.env
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for development)
- Ensure MongoDB database user has read/write permissions

**JWT errors:**
- Ensure JWT_SECRET is at least 32 characters
- Generate a secure secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Frontend Issues

**Can't connect to backend:**
- Ensure backend is running on port 5000
- Check REACT_APP_API_URL in frontend/.env
- Clear browser cache and cookies
- Check browser console for CORS errors

**Login fails:**
- Check if MongoDB is connected (backend console)
- Verify admin credentials in backend/.env
- Check browser console for errors

**Blank page/won't load:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Common Errors

**"Cannot find module 'react-router-dom'"**
```bash
cd frontend
npm install react-router-dom
```

**CORS errors in browser console:**
- Ensure CORS_ORIGIN in backend/.env matches frontend URL
- Default: `CORS_ORIGIN=http://localhost:3000`

**"Failed to fetch" errors:**
- Backend is not running - start it first
- Wrong API URL in frontend/.env
- Firewall blocking port 5000

## Security Notes

### For Development:
- Default credentials are fine
- CORS set to localhost:3000
- JWT tokens stored in localStorage

### For Production:
1. **Change admin credentials immediately**
2. **Use strong JWT_SECRET** (64+ random characters)
3. **Enable HTTPS** for both frontend and backend
4. **Update CORS_ORIGIN** to your production domain
5. **Use environment-specific .env files**
6. **Enable rate limiting** (already configured)
7. **Implement IP whitelisting** for admin panel
8. **Use httpOnly cookies** instead of localStorage for tokens
9. **Regular security audits** of audit logs
10. **Keep dependencies updated:** `npm audit fix`

## Building for Production

### Frontend Build:
```bash
cd frontend
npm run build
```
Creates optimized build in `build/` folder.

Serve with:
```bash
npm install -g serve
serve -s build -l 3000
```

### Backend Production:
```bash
cd backend
NODE_ENV=production npm start
```

Or use PM2:
```bash
npm install -g pm2
pm2 start server.js --name "pulse-admin-backend"
```

## Database Collections Used

The admin dashboard connects to the same MongoDB database as the main Electron app:

- **users** - User accounts, credentials, plans
- **sessions** - Active/ended user sessions
- **api_requests** - Request logs and counts
- **audit_logs** - Complete audit trail
- **admins** - Admin user accounts (auto-created on first run)

## Next Steps

1. Log in to the dashboard
2. Change default admin password
3. Review existing users
4. Check active sessions
5. Explore analytics
6. Set up monitoring alerts (future feature)

## Support

If you encounter issues:
1. Check this guide first
2. Review backend console logs
3. Check browser console (F12)
4. Verify .env files are configured correctly
5. Ensure MongoDB is accessible

## Version

Admin Dashboard v1.0.0
Last Updated: 2024

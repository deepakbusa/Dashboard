# Pulse Admin Dashboard

Complete admin dashboard for monitoring and managing the Pulse Crackmate application.

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB
- JWT Authentication
- RESTful API

**Frontend:**
- React 18
- Tailwind CSS
- Recharts (analytics)
- Axios (API calls)
- React Router v6

## Project Structure

```
admin-dashboard/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── users.js
│   │   ├── sessions.js
│   │   ├── analytics.js
│   │   └── audit.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── utils/
    │   ├── App.js
    │   └── index.js
    ├── .env
    └── package.json
```

## Setup Instructions

### 1. Backend Setup

```bash
cd admin-dashboard/backend
npm install
```

Edit `.env` file with your MongoDB credentials:
```env
MONGODB_URI=your_mongodb_uri
MONGODB_DATABASE=pulse_crackmate
PORT=5000
JWT_SECRET=your_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
CORS_ORIGIN=http://localhost:3000
```

Start the backend:
```bash
npm run dev
```

Backend will run on: http://localhost:5000

### 2. Frontend Setup

```bash
cd admin-dashboard/frontend
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```

Frontend will run on: http://localhost:3000

## Default Login Credentials

**Username:** admin  
**Password:** admin123

**⚠️ Change these immediately after first login!**

## Features

### Dashboard Overview
- Total users, active users, blocked users
- Active sessions count
- Today's requests and chats
- Real-time activity feed
- Usage trends charts
- Top services

### User Management
- View all users with pagination
- Search and filter users
- View detailed user profile
- Add new users
- Edit user information
- Delete users
- Block/Freeze users
- Unblock/Unfreeze users
- View user activity history

### Session Management
- View all active/inactive sessions
- End individual sessions
- Cleanup expired sessions
- View session details

### Analytics
- Detailed analytics dashboard
- Requests by service
- Requests by model
- Requests by profile
- Top active users
- Hourly distribution
- User statistics by plan
- User growth trends

### Audit Logs
- Complete audit trail
- Filter by action/user
- View security events
- Admin actions log
- User login/logout history

### Security Features
- JWT-based authentication
- Protected API routes
- Admin-only access
- Rate limiting
- CORS protection
- Password hashing
- Session management

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token

### Dashboard
- `GET /api/dashboard/overview` - Overview stats
- `GET /api/dashboard/activity` - Recent activity
- `GET /api/dashboard/top-services` - Top services
- `GET /api/dashboard/trends` - Usage trends

### Users
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:userId` - Get user details
- `POST /api/users` - Create new user
- `PUT /api/users/:userId` - Update user
- `DELETE /api/users/:userId` - Delete user
- `POST /api/users/:userId/block` - Block user
- `POST /api/users/:userId/unblock` - Unblock user

### Sessions
- `GET /api/sessions` - Get all sessions
- `POST /api/sessions/:sessionId/end` - End session
- `POST /api/sessions/cleanup` - Cleanup expired sessions

### Analytics
- `GET /api/analytics/detailed` - Detailed analytics
- `GET /api/analytics/user-stats` - User statistics

### Audit
- `GET /api/audit` - Get audit logs
- `GET /api/audit/summary` - Audit summary

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start  # React development server
```

### Running Both Together

**Terminal 1 (Backend):**
```bash
cd admin-dashboard/backend && npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd admin-dashboard/frontend && npm start
```

## Build for Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

Serve the built files using Express or any static file server.

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=          # MongoDB connection string
MONGODB_DATABASE=     # Database name
PORT=5000            # Backend port
NODE_ENV=development # Environment
JWT_SECRET=          # JWT secret key
ADMIN_USERNAME=      # Default admin username
ADMIN_PASSWORD=      # Default admin password
CORS_ORIGIN=         # Frontend URL
```

### Frontend (.env)
```env
REACT_APP_API_URL=   # Backend API URL
```

## Security Recommendations

1. **Change default admin credentials** immediately
2. **Use strong JWT_SECRET** (random 64-character string)
3. **Enable HTTPS** in production
4. **Set secure CORS_ORIGIN** to your domain
5. **Use environment-specific .env files**
6. **Never commit .env files** to version control
7. **Implement IP whitelisting** for admin access
8. **Enable rate limiting** (already configured)
9. **Regular security audits** of audit logs
10. **Keep dependencies updated**

## Troubleshooting

### Backend won't start
- Check if MongoDB URI is correct
- Verify port 5000 is not in use
- Check all required env variables are set

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check REACT_APP_API_URL in frontend .env
- Verify CORS settings in backend .env

### Login fails
- Check MongoDB connection
- Verify admin credentials in .env
- Check JWT_SECRET is set
- View browser console for errors

### Can't see data
- Verify MongoDB database name matches
- Check if collections have data
- Run populate script if needed

## Support

For issues or questions:
1. Check audit logs for errors
2. View backend console for API errors
3. Check browser console for frontend errors
4. Verify all environment variables

## License

MIT

## Version

1.0.0 - Initial Release

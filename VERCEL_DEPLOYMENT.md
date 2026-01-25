# Vercel Deployment Guide for Pulse Admin Dashboard

## 🚀 Deployment Options

You have **two deployment approaches**:

### Option 1: Separate Deployments (Recommended)
Deploy backend and frontend as separate Vercel projects.

### Option 2: Monorepo Deployment
Deploy both together (more complex, may have limitations).

---

## ✅ Option 1: Separate Deployments (Recommended)

### Step 1: Deploy Backend API

#### 1.1 Login to Vercel
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

#### 1.2 Deploy Backend
```bash
cd backend
vercel --prod
```

During deployment, configure:
- **Project Name**: `pulse-admin-backend` (or your choice)
- **Framework Preset**: Other
- **Root Directory**: `./` (current directory)
- **Build Command**: Leave empty
- **Output Directory**: Leave empty

#### 1.3 Add Environment Variables in Vercel Dashboard

Go to your backend project in Vercel Dashboard → Settings → Environment Variables

Add these variables:

```
MONGODB_URI=mongodb+srv://deepakbussa_db_user:jjouhWx8uYnDMRDn@cluster0.rjcpj3y.mongodb.net/pulse_crackmate?retryWrites=true&w=majority
MONGODB_DATABASE=pulse_crackmate
PORT=5000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

**Important**: Update `CORS_ORIGIN` after deploying frontend!

#### 1.4 Get Your Backend URL
After deployment, you'll get a URL like:
```
https://pulse-admin-backend.vercel.app
```

---

### Step 2: Deploy Frontend

#### 2.1 Update Frontend Environment Variable

Before deploying, you need to update the API URL. Create a `.env.production` file in the frontend folder:

```bash
cd frontend
```

Create `frontend/.env.production`:
```env
REACT_APP_API_URL=https://pulse-admin-backend.vercel.app/api
```

Replace `pulse-admin-backend.vercel.app` with your actual backend URL from Step 1.4.

#### 2.2 Update package.json Build Script

Make sure `frontend/package.json` has the correct build script:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "vercel-build": "react-scripts build"
  }
}
```

#### 2.3 Deploy Frontend
```bash
cd frontend
vercel --prod
```

During deployment, configure:
- **Project Name**: `pulse-admin-dashboard` (or your choice)
- **Framework Preset**: Create React App
- **Root Directory**: `./` (current directory)
- **Build Command**: `npm run build` or `yarn build`
- **Output Directory**: `build`

#### 2.4 Get Your Frontend URL
After deployment, you'll get a URL like:
```
https://pulse-admin-dashboard.vercel.app
```

---

### Step 3: Update CORS Settings

#### 3.1 Update Backend CORS_ORIGIN
Go to Vercel Dashboard → Your Backend Project → Settings → Environment Variables

Update `CORS_ORIGIN` to your frontend URL:
```
CORS_ORIGIN=https://pulse-admin-dashboard.vercel.app
```

#### 3.2 Redeploy Backend
```bash
cd backend
vercel --prod
```

---

## 🌐 Option 2: Monorepo Deployment

### Step 1: Prepare the Project

The root `vercel.json` is already configured. Just ensure your GitHub repo has the correct structure:

```
Dashboard/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── vercel.json
├── frontend/
│   ├── package.json
│   └── src/
├── vercel.json (root)
└── README.md
```

### Step 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure Project:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty

### Step 3: Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
MONGODB_URI=mongodb+srv://...
MONGODB_DATABASE=pulse_crackmate
JWT_SECRET=your-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
NODE_ENV=production
REACT_APP_API_URL=/api
```

### Step 4: Deploy
Click **"Deploy"**

---

## 📝 Important Notes

### 1. MongoDB Atlas Configuration
- **IP Whitelist**: Add `0.0.0.0/0` to allow Vercel's IP addresses
- Go to MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere

### 2. Environment Variables Security
- Never commit `.env` files to GitHub
- Always use Vercel Dashboard to add sensitive variables
- Change default admin credentials in production

### 3. Custom Domain (Optional)
- Go to Vercel Dashboard → Your Project → Settings → Domains
- Add your custom domain

### 4. API Rate Limits
- Consider increasing rate limits for production
- Update in `backend/server.js`

### 5. CORS Configuration
- Ensure CORS_ORIGIN matches your frontend domain exactly
- Include `https://` in the URL

---

## 🔧 Troubleshooting

### Issue: API calls failing from frontend
**Solution**: Check that `REACT_APP_API_URL` points to the correct backend URL and includes `/api`

### Issue: CORS errors
**Solution**: Verify `CORS_ORIGIN` in backend environment variables matches frontend URL exactly

### Issue: MongoDB connection timeout
**Solution**: 
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Verify connection string is correct
- Check MongoDB cluster is not paused

### Issue: 500 Internal Server Error
**Solution**: Check Vercel Function Logs in Dashboard → Your Project → Deployments → [Latest] → Functions

---

## 🎯 Quick Deploy Commands

### Deploy Backend Only
```bash
cd backend
vercel --prod
```

### Deploy Frontend Only
```bash
cd frontend
vercel --prod
```

### Deploy Both (from root)
```bash
vercel --prod
```

---

## 🔄 Redeployment

After making changes:

```bash
# Push to GitHub
git add .
git commit -m "Your changes"
git push

# Or manual deploy
vercel --prod
```

Vercel will automatically redeploy on GitHub push if you've connected your repo.

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas IP whitelist configured (`0.0.0.0/0`)
- [ ] Backend deployed and URL noted
- [ ] Frontend `.env.production` updated with backend URL
- [ ] Frontend deployed
- [ ] Backend `CORS_ORIGIN` updated with frontend URL
- [ ] Environment variables added in Vercel Dashboard
- [ ] Tested login with admin credentials
- [ ] Changed default admin password
- [ ] Custom domain configured (optional)
- [ ] SSL/HTTPS enabled (automatic on Vercel)

---

## 🎉 Success!

Your admin dashboard should now be live at:
- **Frontend**: `https://your-frontend.vercel.app`
- **Backend API**: `https://your-backend.vercel.app/api`

Test by visiting your frontend URL and logging in with admin credentials.

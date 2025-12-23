# Deployment Guide

This guide explains how to deploy the Restaurant Management System to various platforms.

## 🚀 Quick Deployment Options

### Option 1: GitHub Pages (Frontend) + Railway/Render (Backend) - Recommended

#### Frontend Deployment to GitHub Pages

1. **Set up GitHub Secrets:** 
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.railway.app/api`)
     - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID

2. **Enable GitHub Pages:**
   - Go to repository → Settings → Pages
   - Source: `GitHub Actions`
   - Save

3. **Update Repository Name (if needed):**
   - If your repository name is not the default, update `GITHUB_REPO_NAME` in the workflow file
   - Or set it as a GitHub Secret

4. **Deploy:**
   - Push code to `main` branch
   - GitHub Actions will automatically build and deploy
   - Your site will be available at: `https://yourusername.github.io/your-repo-name/`

#### Backend Deployment to Railway/Render

**Railway:**
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repository
4. Add Service → Select `server` folder
5. Add environment variables (see below)
6. Deploy

**Render:**
1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Root Directory: `server`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add environment variables (see below)

---

### Option 2: Vercel (Frontend) + Railway (Backend)

#### Frontend to Vercel:
1. Go to [vercel.com](https://vercel.com)
2. Import Project → Select repository
3. Root Directory: `client`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   - `VITE_API_URL`: Your backend URL
   - `VITE_GOOGLE_CLIENT_ID`: Your Google Client ID

#### Backend to Railway:
Same as Option 1

---

## 📋 Required Environment Variables

### Backend Environment Variables

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# Server
PORT=10000 (or provided by platform)
NODE_ENV=production

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Client URL (your frontend URL)
CLIENT_URL=https://your-frontend-url.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# eSewa Payment
ESEWA_MERCHANT_ID=your_esewa_merchant_id
ESEWA_SECRET_KEY=your_esewa_secret_key
ESEWA_SUCCESS_URL=https://your-backend-url.com/api/esewa/success
ESEWA_FAILURE_URL=https://your-backend-url.com/api/esewa/failure

# Khalti Payment
KHALTI_SECRET_KEY=your_khalti_secret_key
KHALTI_RETURN_URL=https://your-backend-url.com/api/khalti/return
WEBSITE_URL=https://your-frontend-url.com

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@yourdomain.com
```

### Frontend Environment Variables

```bash
# Backend API URL
VITE_API_URL=https://your-backend-url.com/api

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# GitHub Repo Name (only for GitHub Pages)
GITHUB_REPO_NAME=your-repo-name
```

---

## 🔧 Setup Steps

### 1. MongoDB Database

**Option A: MongoDB Atlas (Recommended)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (or specific IPs)
5. Get connection string

**Option B: Render MongoDB**
1. Render Dashboard → New → MongoDB
2. Create database
3. Copy connection string

### 2. Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Credentials
3. Edit OAuth 2.0 Client ID
4. Add Authorized JavaScript origins:
   - `https://your-frontend-url.com`
5. Add Authorized redirect URIs:
   - `https://your-frontend-url.com`
   - `https://your-backend-url.com/api/auth/google/callback`

### 3. Update Payment Gateway URLs

Update success/failure URLs in:
- eSewa merchant dashboard
- Khalti merchant dashboard

---

## 📁 File Structure for Deployment

```
restaurant-management-system/
├── client/                 # Frontend
│   ├── .env.production    # Production env vars (not in git)
│   ├── vite.config.js     # Updated for GitHub Pages
│   └── dist/              # Build output (not in git)
├── server/                # Backend
│   ├── .env              # Environment variables (not in git)
│   └── server.js
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml  # GitHub Actions workflow
└── DEPLOYMENT.md         # This file
```

---

## 🐛 Troubleshooting

### GitHub Pages Issues

**Problem: Assets not loading (404 errors)**
- Solution: Check `base` path in `vite.config.js` matches your repository name
- Ensure `GITHUB_REPO_NAME` is set correctly in GitHub Secrets

**Problem: API calls failing**
- Solution: Verify `VITE_API_URL` is set correctly in GitHub Secrets
- Check CORS settings on backend

**Problem: Build fails**
- Solution: Check GitHub Actions logs
- Verify all environment variables are set
- Ensure `package.json` scripts are correct

### Backend Issues

**Problem: MongoDB connection fails**
- Solution: Verify connection string is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

**Problem: CORS errors**
- Solution: Update `CLIENT_URL` in backend environment variables
- Check CORS configuration in `server.js`

**Problem: Socket.IO not connecting**
- Solution: Verify Socket.IO CORS settings
- Check WebSocket support on hosting platform

---

## ✅ Post-Deployment Checklist

- [ ] Backend health check: `https://your-backend-url.com/api/health`
- [ ] Frontend loads correctly
- [ ] User registration/login works
- [ ] Google OAuth works
- [ ] API calls from frontend work
- [ ] Real-time features (Socket.IO) work
- [ ] Payment gateways configured
- [ ] File uploads work (if using Cloudinary)
- [ ] All environment variables set
- [ ] Custom domain configured (if applicable)

---

## 🔗 Useful Links

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## 📝 Notes

- GitHub Pages is free but only supports static sites (frontend only)
- Backend must be deployed separately (Railway, Render, etc.)
- Environment variables in GitHub Actions are set as Secrets
- Always test locally before deploying
- Keep production environment variables secure (never commit to git)


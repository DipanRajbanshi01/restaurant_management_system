# Railway Deployment Fix

## Problem
Railway is failing with "Error creating build plan with Railpack" because it's trying to build from the root directory instead of the `server` directory.

## Solution

### Option 1: Set Root Directory in Railway (Easiest)

1. **Go to Railway Dashboard:**
   - Open your project: `restaurant_management_system`
   - Click on the service

2. **Set Root Directory:**
   - Go to **Settings** tab
   - Scroll to **"Root Directory"**
   - Set it to: `server`
   - Click **Save**

3. **Redeploy:**
   - Go to **Deployments** tab
   - Click **"Redeploy"** or push a new commit

### Option 2: Use railway.json (Already Created)

I've created a `railway.json` file that tells Railway to:
- Build from `server` directory
- Run `npm install` in server directory
- Start with `npm start` from server directory

**Just push the file and Railway will use it automatically.**

---

## Step-by-Step Fix

### 1. Update Railway Settings

1. Go to: https://railway.app/project/[your-project-id]
2. Click on your service: `restaurant_management_system`
3. Go to **Settings** tab
4. Find **"Root Directory"** section
5. Enter: `server`
6. Click **Save**

### 2. Add Environment Variables

Go to **Variables** tab and add:

```bash
# Database (REQUIRED)
MONGODB_URI=mongodb+srv://zero:zero@cluster0.pokpvpc.mongodb.net/restaurant-management?retryWrites=true&w=majority

# Server (Railway provides PORT automatically)
NODE_ENV=production

# JWT Secret (REQUIRED)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# Client URL (your GitHub Pages URL)
CLIENT_URL=https://dipanrajbanshi01.github.io/restaurant_management_system

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# eSewa Payment (if using)
ESEWA_MERCHANT_ID=your_esewa_merchant_id
ESEWA_SECRET_KEY=your_esewa_secret_key
ESEWA_SUCCESS_URL=https://your-backend-url.railway.app/api/esewa/success
ESEWA_FAILURE_URL=https://your-backend-url.railway.app/api/esewa/failure

# Khalti Payment (if using)
KHALTI_SECRET_KEY=your_khalti_secret_key
KHALTI_RETURN_URL=https://your-backend-url.railway.app/api/khalti/return
WEBSITE_URL=https://dipanrajbanshi01.github.io/restaurant_management_system
```

### 3. Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** button
3. Or push a new commit to trigger deployment

---

## Verification

After deployment, check:

1. **Build Logs:**
   - Should show: `cd server && npm install`
   - Should complete successfully

2. **Deploy Logs:**
   - Should show: `cd server && npm start`
   - Should see: `MongoDB Connected: ...`
   - Should see: `Server running on port ...`

3. **Health Check:**
   - Visit: `https://your-app.railway.app/api/health`
   - Should return: `{"status":"OK","message":"Server is running"}`

---

## Common Issues

### Still Failing?

1. **Check Build Logs:**
   - Look for specific error messages
   - Verify `package.json` exists in `server/` directory

2. **Verify Root Directory:**
   - Settings → Root Directory should be: `server`
   - Not: `.` or empty

3. **Check Environment Variables:**
   - All required variables should be set
   - `MONGODB_URI` is most critical

4. **Try Manual Redeploy:**
   - Deployments → Click three dots → Redeploy

---

## Quick Checklist

- [ ] Root Directory set to `server` in Railway Settings
- [ ] `railway.json` file committed (optional but helpful)
- [ ] Environment variables added (especially `MONGODB_URI`)
- [ ] Redeployed service
- [ ] Build completes successfully
- [ ] Health check works: `/api/health`



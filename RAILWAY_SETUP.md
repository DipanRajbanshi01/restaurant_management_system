# Railway Backend Setup Guide

## 🚨 Critical: Fix Crashed Deployment

Your Railway deployment is crashing because **environment variables are missing**.

## Step 1: Add Environment Variables in Railway

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app
   - Click on your project: `restaurant_management_system`
   - Click on your service (the backend service)

2. **Open Variables Tab:**
   - Click **"Variables"** tab at the top
   - Click **"New Variable"** button

3. **Add These REQUIRED Variables:**

### ✅ Required Variables (Minimum to Fix Crash)

```bash
# 1. MongoDB Atlas Connection (CRITICAL - Fixes MongoDB error)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant-management?retryWrites=true&w=majority

# 2. JWT Secret (CRITICAL - Fixes JWT warning)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long

# 3. Client URL (Your GitHub Pages frontend)
CLIENT_URL=https://dipanrajbanshi01.github.io/restaurant_management_system
```

### 📋 How to Get Each Value:

#### MONGODB_URI:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
5. Replace `<username>` and `<password>` with your actual credentials
6. Add database name: `/restaurant-management?retryWrites=true&w=majority`
7. **Example:**
   ```
   mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/restaurant-management?retryWrites=true&w=majority
   ```

#### JWT_SECRET:
- Generate a random secure string (minimum 32 characters)
- You can use: https://randomkeygen.com/ (use "CodeIgniter Encryption Keys")
- Or run in terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **Example:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

#### CLIENT_URL:
- Your GitHub Pages URL: `https://dipanrajbanshi01.github.io/restaurant_management_system`

---

## Step 2: Add Optional Variables (Recommended)

These are not required to fix the crash, but needed for full functionality:

```bash
# Google OAuth (if using Google login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Payment Gateways (if using)
ESEWA_MERCHANT_ID=your_esewa_merchant_id
ESEWA_SECRET_KEY=your_esewa_secret_key
ESEWA_SUCCESS_URL=https://restaurantmanagementsystem-production-1c6f.up.railway.app/api/esewa/success
ESEWA_FAILURE_URL=https://restaurantmanagementsystem-production-1c6f.up.railway.app/api/esewa/failure

KHALTI_SECRET_KEY=your_khalti_secret_key
KHALTI_RETURN_URL=https://restaurantmanagementsystem-production-1c6f.up.railway.app/api/khalti/callback

# Email (if using email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@yourdomain.com
```

---

## Step 3: Verify Deployment

1. **After adding variables, Railway will automatically redeploy**
2. **Check Deploy Logs:**
   - Go to **"Deploy Logs"** tab
   - You should see:
     - ✅ `MongoDB Connected: cluster0.xxxxx.mongodb.net`
     - ✅ `Server running on port 8080` (or whatever PORT Railway assigns)
     - ❌ No more "Error connecting to MongoDB" errors
     - ❌ No more "JWT_SECRET is not set" warnings

3. **Test Health Endpoint:**
   - Visit: `https://restaurantmanagementsystem-production-1c6f.up.railway.app/api/health`
   - Should return: `{"status":"OK","message":"Server is running"}`

---

## Step 4: Update GitHub Secret (If Not Done)

1. Go to: https://github.com/DipanRajbanshi01/restaurant_management_system/settings/secrets/actions
2. Update `VITE_API_URL` to:
   ```
   https://restaurantmanagementsystem-production-1c6f.up.railway.app/api
   ```
3. Rebuild frontend (trigger GitHub Actions workflow)

---

## 🐛 Troubleshooting

### Still Getting MongoDB Error?
- ✅ Check `MONGODB_URI` is correct (no extra spaces)
- ✅ Verify username/password are correct
- ✅ Check MongoDB Atlas Network Access allows `0.0.0.0/0`
- ✅ Make sure database name is included: `/restaurant-management`

### Still Getting JWT_SECRET Warning?
- ✅ Check `JWT_SECRET` is at least 32 characters
- ✅ No spaces before/after the value
- ✅ Railway has redeployed after adding the variable

### Server Still Crashed?
- ✅ Check all 3 required variables are set
- ✅ Check Deploy Logs for new errors
- ✅ Try redeploying manually (Settings → Redeploy)

---

## ✅ Quick Checklist

- [ ] Added `MONGODB_URI` in Railway Variables
- [ ] Added `JWT_SECRET` in Railway Variables
- [ ] Added `CLIENT_URL` in Railway Variables
- [ ] Railway automatically redeployed
- [ ] Deploy Logs show "MongoDB Connected"
- [ ] Deploy Logs show "Server running on port XXXX"
- [ ] Health endpoint works: `/api/health`
- [ ] Updated `VITE_API_URL` in GitHub Secrets
- [ ] Frontend rebuilt and working

---

## 📝 Notes

- Railway automatically sets `PORT` environment variable (you don't need to set it)
- Railway automatically sets `NODE_ENV=production` (you don't need to set it)
- After adding variables, Railway redeploys automatically (wait 1-2 minutes)
- Your backend URL: `https://restaurantmanagementsystem-production-1c6f.up.railway.app`
- Your frontend URL: `https://dipanrajbanshi01.github.io/restaurant_management_system`


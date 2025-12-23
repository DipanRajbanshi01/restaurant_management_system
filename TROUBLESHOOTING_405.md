# Troubleshooting 405 Method Not Allowed Error

## 🔍 Current Issue
Getting `405 Method Not Allowed` when trying to register on GitHub Pages frontend.

## ✅ Quick Checks

### 1. Is Railway Backend Running?
**Test the health endpoint:**
```
https://restaurantmanagementsystem-production-1c6f.up.railway.app/api/health
```

**Expected Response:**
```json
{"status":"OK","message":"Server is running"}
```

**If you get an error:**
- Backend is not running
- Check Railway Deploy Logs for errors
- Verify environment variables are set (see below)

---

### 2. Test POST Endpoint
**Test if POST requests work:**
```
https://restaurantmanagementsystem-production-1c6f.up.railway.app/api/test
```

**Method:** POST  
**Body:** `{"test": "data"}`

**Expected Response:**
```json
{"status":"OK","message":"POST request received","body":{"test":"data"}}
```

**If this works but `/api/auth/register` doesn't:**
- Route registration issue
- Check Railway Deploy Logs

---

### 3. Check Railway Deploy Logs

1. Go to Railway Dashboard
2. Click on your service
3. Click "Deploy Logs" tab
4. Look for:
   - ✅ `MongoDB Connected: cluster0.xxxxx.mongodb.net`
   - ✅ `Server running on port XXXX`
   - ❌ Any errors (especially MongoDB connection errors)

**If you see MongoDB errors:**
- `MONGODB_URI` is not set or incorrect
- See "Environment Variables" section below

---

### 4. Verify Environment Variables in Railway

**Required Variables:**
1. **MONGODB_URI** (CRITICAL)
   - Format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant-management?retryWrites=true&w=majority`
   - Get from MongoDB Atlas → Connect → Connect your application

2. **JWT_SECRET** (CRITICAL)
   - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Or use: https://randomkeygen.com/
   - Minimum 32 characters

3. **CLIENT_URL** (IMPORTANT for CORS)
   - Value: `https://dipanrajbanshi01.github.io/restaurant_management_system`
   - Or: `https://dipanrajbanshi01.github.io`

**How to Set:**
1. Railway Dashboard → Your Service
2. Click "Variables" tab
3. Click "New Variable"
4. Add each variable
5. Railway will auto-redeploy

---

### 5. Check if Railway Has Redeployed

**Recent Changes:**
- Added explicit OPTIONS handling for CORS
- Fixed phone field in Register form
- Updated CORS configuration

**Verify Deployment:**
1. Railway Dashboard → Your Service
2. Check "Deployments" tab
3. Latest deployment should be after the latest git push
4. Status should be "Active" (green)

**If not deployed:**
- Click "Redeploy" button
- Or trigger a new deployment by pushing to GitHub

---

### 6. Browser Network Tab Debugging

1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Try to register
4. Find the failed request to `/api/auth/register`
5. Check:
   - **Request Method:** Should be `POST`
   - **Request URL:** Should be `https://restaurantmanagementsystem-production-1c6f.up.railway.app/api/auth/register`
   - **Status Code:** 405
   - **Response Headers:** Check for `Allow` header (shows allowed methods)
   - **Request Headers:** Check `Origin` header

**If Request Method is not POST:**
- Frontend issue
- Check `authService.js` - should use `api.post()`

**If URL is wrong:**
- `VITE_API_URL` in GitHub Secrets is incorrect
- Should be: `https://restaurantmanagementsystem-production-1c6f.up.railway.app/api`

---

### 7. CORS Preflight Check

**Check OPTIONS Request:**
1. Network tab → Filter by "OPTIONS"
2. Look for OPTIONS request to `/api/auth/register`
3. Should return `204 No Content`
4. Response headers should include:
   - `Access-Control-Allow-Origin: https://dipanrajbanshi01.github.io`
   - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type, Authorization`

**If OPTIONS fails:**
- CORS configuration issue
- Check `server.js` CORS settings

---

## 🔧 Common Fixes

### Fix 1: Backend Not Running
**Problem:** Backend crashed due to missing environment variables

**Solution:**
1. Add `MONGODB_URI` in Railway Variables
2. Add `JWT_SECRET` in Railway Variables
3. Add `CLIENT_URL` in Railway Variables
4. Wait for Railway to redeploy (1-2 minutes)
5. Check Deploy Logs for success

---

### Fix 2: Route Not Registered
**Problem:** Route exists but method not allowed

**Solution:**
1. Check Railway Deploy Logs for route registration errors
2. Verify `server.js` has: `app.use('/api/auth', require('./src/routes/auth'));`
3. Verify `auth.js` has: `router.post('/register', validateRegister, register);`
4. Redeploy if needed

---

### Fix 3: CORS Preflight Failing
**Problem:** OPTIONS request not handled

**Solution:**
- Already fixed in latest code
- Ensure Railway has latest deployment
- Check `server.js` has `app.options('*', cors());`

---

### Fix 4: Frontend Calling Wrong URL
**Problem:** Frontend using wrong API URL

**Solution:**
1. Check GitHub Secrets → `VITE_API_URL`
2. Should be: `https://restaurantmanagementsystem-production-1c6f.up.railway.app/api`
3. Rebuild frontend (trigger GitHub Actions)

---

## 📋 Step-by-Step Resolution

1. **Check Backend Health:**
   ```
   https://restaurantmanagementsystem-production-1c6f.up.railway.app/api/health
   ```
   - If fails → Backend not running → Fix environment variables

2. **Check Railway Deploy Logs:**
   - Look for MongoDB connection errors
   - Look for server startup errors
   - Fix any errors found

3. **Verify Environment Variables:**
   - `MONGODB_URI` ✅
   - `JWT_SECRET` ✅
   - `CLIENT_URL` ✅

4. **Test POST Endpoint:**
   ```
   POST https://restaurantmanagementsystem-production-1c6f.up.railway.app/api/test
   ```
   - If works → Route registration is fine
   - If fails → Backend issue

5. **Check Frontend:**
   - Verify `VITE_API_URL` in GitHub Secrets
   - Rebuild frontend if needed

6. **Try Registration Again:**
   - Clear browser cache
   - Hard refresh (Ctrl+Shift+R)
   - Try again

---

## 🆘 Still Not Working?

If after all these steps it still doesn't work:

1. **Share Railway Deploy Logs** (last 50 lines)
2. **Share Browser Network Tab** (failed request details)
3. **Share Health Endpoint Response**
4. **Share Test POST Endpoint Response**

This will help identify the exact issue.


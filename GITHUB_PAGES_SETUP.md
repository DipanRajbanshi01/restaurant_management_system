# GitHub Pages Setup Guide

## Current Issue: 404 Error

If you're seeing a 404 error on `https://dipanrajbanshi01.github.io/restaurant_management_system/`, follow these steps:

## Step 1: Verify GitHub Pages is Enabled

1. Go to your repository: `https://github.com/dipanrajbanshi01/restaurant_management_system`
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions** (NOT "Deploy from a branch")
4. Click **Save**

## Step 2: Check GitHub Actions Workflow

1. Go to **Actions** tab in your repository
2. Check if the workflow "Deploy Frontend to GitHub Pages" has run
3. If it hasn't run, push a commit to trigger it:
   ```bash
   git add .
   git commit -m "fix: update base path for GitHub Pages"
   git push origin main
   ```
4. If it failed, check the logs to see what went wrong

## Step 3: Set GitHub Secrets

1. Go to repository → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets (if not already added):
   - `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.railway.app/api`)
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID

## Step 4: Manual Workflow Trigger (If Needed)

1. Go to **Actions** tab
2. Click on "Deploy Frontend to GitHub Pages" workflow
3. Click **Run workflow** → **Run workflow** (manual trigger)

## Step 5: Verify Build Output

After the workflow completes:

1. Go to **Actions** → Click on the latest workflow run
2. Check the "Build application" step - it should show:
   ```
   ✓ built in Xs
   ```
3. Check the "Deploy to GitHub Pages" step - it should show:
   ```
   ✅ Deployment successful
   ```

## Step 6: Wait for Deployment

- GitHub Pages deployments can take 1-5 minutes
- Check your site: `https://dipanrajbanshi01.github.io/restaurant_management_system/`
- If still 404, wait a few more minutes and refresh

## Troubleshooting

### Issue: Workflow not running
**Solution:** 
- Make sure you're pushing to `main` or `master` branch
- Check if workflow file is in `.github/workflows/deploy-frontend.yml`

### Issue: Build fails
**Solution:**
- Check GitHub Actions logs
- Verify all dependencies are in `package.json`
- Make sure `VITE_API_URL` secret is set

### Issue: 404 after successful deployment
**Solution:**
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check if base path in `vite.config.js` matches repository name exactly
- Verify GitHub Pages source is set to "GitHub Actions"

### Issue: Assets not loading (CSS/JS 404)
**Solution:**
- Base path must match repository name: `restaurant_management_system`
- Check browser console for exact 404 paths
- Verify `base` in `vite.config.js` is `/restaurant_management_system/`

## Quick Fix Commands

```bash
# 1. Make sure you're on main branch
git checkout main

# 2. Pull latest changes
git pull origin main

# 3. Add and commit changes
git add .
git commit -m "fix: configure GitHub Pages deployment"

# 4. Push to trigger workflow
git push origin main

# 5. Check Actions tab for deployment status
```

## Verification Checklist

- [ ] GitHub Pages source is set to "GitHub Actions"
- [ ] GitHub Secrets are configured (`VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`)
- [ ] Workflow has run successfully (green checkmark)
- [ ] Base path in `vite.config.js` is `/restaurant_management_system/`
- [ ] Waited 2-5 minutes after deployment
- [ ] Cleared browser cache
- [ ] Checked site URL: `https://dipanrajbanshi01.github.io/restaurant_management_system/`

## Expected Result

After successful deployment:
- Site should load at: `https://dipanrajbanshi01.github.io/restaurant_management_system/`
- All assets (CSS, JS, images) should load correctly
- React Router should work for navigation
- API calls should work (if backend is deployed)

## Need Help?

If you're still seeing 404 after following these steps:
1. Check GitHub Actions logs for errors
2. Verify repository name matches base path exactly
3. Make sure GitHub Pages is enabled and using GitHub Actions
4. Wait a few minutes - deployments can be delayed


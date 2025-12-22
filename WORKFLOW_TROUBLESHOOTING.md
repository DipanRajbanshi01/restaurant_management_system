# GitHub Actions Workflow Troubleshooting

## How to Check Workflow Errors

1. **Go to Actions Tab:**
   - Visit: `https://github.com/DipanRajbanshi01/restaurant_management_system/actions`

2. **Click on the Failed Workflow:**
   - Click on the red X icon next to the failed run

3. **Click on the Job:**
   - Click on "build-and-deploy" job

4. **Check Each Step:**
   - Expand each step to see detailed logs
   - Look for error messages in red

## Common Issues and Solutions

### Issue 1: "Environment 'github-pages' not found"

**Error Message:**
```
Environment 'github-pages' could not be found
```

**Solution:**
1. Go to: `https://github.com/DipanRajbanshi01/restaurant_management_system/settings/pages`
2. Under **Source**, select **GitHub Actions**
3. Click **Save**
4. This will create the `github-pages` environment automatically
5. Re-run the workflow

### Issue 2: Build Fails with npm errors

**Error Message:**
```
npm ERR! code ELIFECYCLE
npm ERR! errno 1
```

**Solution:**
- Check if `package-lock.json` is committed to git
- Verify all dependencies in `package.json` are valid
- Check the build log for specific package errors

### Issue 3: "Build output directory not found"

**Error Message:**
```
❌ Build output directory not found!
```

**Solution:**
- The build step failed before creating the `dist` folder
- Check the "Build application" step logs for errors
- Common causes:
  - TypeScript/compilation errors
  - Missing dependencies
  - Environment variable issues

### Issue 4: Permission Denied

**Error Message:**
```
Permission denied
Error: Resource not accessible by integration
```

**Solution:**
1. Go to repository → **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select **Read and write permissions**
3. Check **Allow GitHub Actions to create and approve pull requests**
4. Click **Save**

### Issue 5: Deployment Fails

**Error Message:**
```
Deployment failed
```

**Solution:**
- Ensure GitHub Pages is enabled (Settings → Pages → Source: GitHub Actions)
- Check if the artifact was uploaded successfully
- Verify the path `./client/dist` is correct

## Step-by-Step Debugging

### Step 1: Enable GitHub Pages (CRITICAL)

**This is the most common issue!**

1. Go to: `https://github.com/DipanRajbanshi01/restaurant_management_system/settings/pages`
2. Under **Source**, you should see options:
   - ❌ **Deploy from a branch** (don't use this)
   - ✅ **GitHub Actions** (use this)
3. Select **GitHub Actions**
4. Click **Save**
5. Wait a moment for the environment to be created

### Step 2: Check Workflow Permissions

1. Go to: `https://github.com/DipanRajbanshi01/restaurant_management_system/settings/actions`
2. Scroll to **Workflow permissions**
3. Select **Read and write permissions**
4. Save

### Step 3: Manually Trigger Workflow

1. Go to **Actions** tab
2. Click **Deploy Frontend to GitHub Pages** workflow
3. Click **Run workflow** button (top right)
4. Select branch: **main**
5. Click **Run workflow**

### Step 4: Check Build Logs

After workflow runs, check each step:

1. **Install dependencies** - Should show `npm ci` completing
2. **Build application** - Should show build output and "Build completed successfully"
3. **Verify build output** - Should show files in `client/dist/`
4. **Upload artifact** - Should upload successfully
5. **Deploy to GitHub Pages** - Should deploy successfully

## Quick Fix Checklist

- [ ] GitHub Pages enabled with "GitHub Actions" as source
- [ ] Workflow permissions set to "Read and write"
- [ ] `package-lock.json` is committed to git
- [ ] No TypeScript/compilation errors in code
- [ ] Workflow file is in `.github/workflows/deploy-frontend.yml`
- [ ] Repository name matches base path: `restaurant_management_system`

## Still Having Issues?

1. **Copy the exact error message** from the workflow logs
2. **Check which step failed** (Install, Build, Verify, Upload, or Deploy)
3. **Share the error** and I can help debug further

## Expected Successful Workflow

When everything works, you should see:
- ✅ All steps with green checkmarks
- ✅ "Deploy to GitHub Pages" step shows deployment URL
- ✅ Site accessible at: `https://dipanrajbanshi01.github.io/restaurant_management_system/`


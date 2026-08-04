# Render.com Deployment Guide

This guide walks you through deploying MirrorPro to Render.com (Pro plan).

## 📋 Prerequisites

- A Render.com account (Pro plan recommended)
- Your code pushed to GitHub: `https://github.com/stephenmarcus89s-star/androidfk.git`
- ~5 minutes

---

## 🚀 Option A: One-Click Deploy via render.yaml (Recommended)

### Step 1: Push to GitHub

```bash
cd /path/to/androidfk
git remote add origin https://github.com/stephenmarcus89s-star/androidfk.git
git push -u origin main
```

### Step 2: Create a new Web Service on Render

1. Go to https://dashboard.render.com
2. Click **New +** → **Blueprint**
3. Select your `androidfk` repository
4. Render will detect `render.yaml` and show the configuration
5. Review the settings:
   - **Name:** `mirrorpro` (or whatever you want)
   - **Region:** Choose closest to your users
   - **Plan:** Pro
   - **Branch:** `main`
6. Click **Apply**

Render will:
- Install backend dependencies
- Build the admin React panel
- Start the Express server
- Provision a 5GB persistent disk for SQLite + uploads

### Step 3: Wait for first deploy

The first build takes ~3-5 minutes. Watch the logs — you should see:

```
✅ Database migrations applied
🌱 Seeded admin: admin@mirrorpro.app
🎨 Admin panel served from admin-dist
🚀 MirrorPro backend running on port 10000
   Public URL:  https://mirrorpro-xxxx.onrender.com
```

### Step 4: Get your Render URL

Once deployed, Render gives you a URL like:
```
https://mirrorpro-xxxx.onrender.com
```

This is your `BASE_URL` for the Android app.

### Step 5: Configure environment variables (optional)

In the Render dashboard → your service → **Environment**:

| Variable | Default | Purpose |
|----------|---------|---------|
| `ADMIN_EMAIL` | `admin@mirrorpro.app` | Change admin login email |
| `ADMIN_PASSWORD` | `MirrorPro@2026!` | **Change this immediately in production!** |
| `JWT_SECRET` | (auto-generated) | Already secure by default |
| `MAX_APK_SIZE_MB` | `200` | Max APK file size |

To change the admin password after first deploy, do ONE of:
1. Set `ADMIN_PASSWORD` env var → restart (only seeds if no admin exists yet)
2. Better: log into admin panel → Account → Change Password

---

## 🔧 Option B: Manual Setup (if render.yaml doesn't work)

### Step 1: Create Web Service

1. Render Dashboard → **New +** → **Web Service**
2. Connect your GitHub repo `androidfk`
3. Configure:
   - **Name:** `mirrorpro`
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     cd backend && npm install && cd ../admin && npm install && npm run build
     ```
   - **Start Command:**
     ```bash
     cd backend && node src/server.js
     ```
   - **Plan:** Pro
   - **Health Check Path:** `/health`

### Step 2: Add Persistent Disk

**Critical:** Without a disk, your SQLite DB and uploaded APKs will be LOST on every deploy.

1. Go to your service → **Disks** tab
2. Click **Add Disk**
3. Configure:
   - **Name:** `mirrorpro-data`
   - **Mount Path:** `/opt/render/project/src/backend/data`
   - **Size:** 5 GB (or more if you expect large APKs)

### Step 3: Add Environment Variables

Add these in **Environment** tab:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `ADMIN_EMAIL` | `admin@mirrorpro.app` |
| `ADMIN_PASSWORD` | `MirrorPro@2026!` (change in production) |
| `ADMIN_NAME` | `MirrorPro Admin` |
| `JWT_SECRET` | (click "Generate" to create a random 32+ char secret) |
| `MAX_APK_SIZE_MB` | `200` |
| `CLIENT_URL` | `*` |

### Step 4: Deploy

Click **Create Web Service** → wait for build to finish.

---

## ⚠️ Important: First Deploy Behavior

On first deploy:
1. Backend boots, runs migrations (creates tables)
2. Seeds the default admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars
3. Seeds default settings (site name, defaults, theme)
4. The `data/` directory is empty — your first admin login will be with the seeded credentials

On subsequent redeploys:
1. Backend boots, runs migrations (idempotent — safe to re-run)
2. **Does NOT** re-seed admin (only seeds if no admin exists)
3. Your DB + uploads persist via the Render disk

---

## 🧪 Verify Deployment

Once deployed, test these URLs:

1. **Health check:** `https://your-app.onrender.com/health`
   ```json
   { "ok": true, "ts": 1785828300807 }
   ```

2. **Latest API:** `https://your-app.onrender.com/api/latest`
   Should return JSON with app info.

3. **Admin panel:** `https://your-app.onrender.com/`
   Should show the login page.

4. **Login:** Use `admin@mirrorpro.app` / `MirrorPro@2026!`

---

## 📱 Pointing the Android App at Your Render URL

After deployment, update the Android app's `BASE_URL`:

1. Open `android/app/src/main/java/com/mirrorpro/appupdate/di/NetworkModule.kt`
2. Change line ~28:
   ```kotlin
   private const val BASE_URL = "https://mirrorpro-xxxx.onrender.com/"
   ```
3. Commit and push → GitHub Actions will auto-build a new APK with the correct URL

---

## 🔄 Updating the App

### To push a new APK version:

1. Log into the admin panel
2. Go to **Uploads**
3. Fill in version name, code, release date, changelog
4. Drag your APK file → click **Publish Version**
5. The new version is immediately available via `/api/latest`

### To change app metadata:

1. Go to **Manage App**
2. Edit fields, upload new logo, manage screenshots
3. Click **Save Changes**

### To make an update mandatory:

1. Go to **Manage App**
2. Toggle **Mandatory Update** to on
3. Save

Users will be locked to the update screen until they install.

---

## 🆘 Troubleshooting

### Build fails on Render

Check the build logs. Common issues:
- **`sharp` install fails:** Shouldn't happen on Render's Linux runtime, but if it does, add `--include=optional` to npm install
- **Admin build fails:** Check that `tailwind.config.js` is committed

### Uploads disappear after redeploy

You didn't add a persistent disk, OR the disk isn't mounted at `/opt/render/project/src/backend/data`.
Fix: add the disk per Step 2 above.

### `401 Unauthorized` on every API call

Your JWT secret changed between deploys (maybe you regenerated it). Users need to log in again.
Fix: log out of admin panel, log back in.

### APK download fails with 404

The APK file doesn't exist on disk. Either:
- It was uploaded before you added the persistent disk (lost on redeploy)
- The disk is full

Check the disk usage in Render dashboard.

### Admin panel shows blank page

The admin build didn't run. Check the build command output. You should see `✅ Admin panel served from admin-dist` in the server logs.

---

## 💰 Render Pro Plan Costs

- **Web Service (Pro):** $0.034/hour (~$25/month for always-on)
- **Persistent Disk (5GB):** $0.25/GB/month (~$1.25/month)
- **Total:** ~$26/month

If you want to save money:
- Use the **Free** plan for testing (web service sleeps after 15 min idle)
- Note: Free plan does NOT support persistent disks, so uploads/DB will be lost on sleep

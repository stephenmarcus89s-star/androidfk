# MirrorPro — Android APK Update Distribution System

A complete, production-ready system for distributing Android app updates. Users install your Android app, open it, and see the latest APK version with download/install support. Includes a beautiful admin panel for managing versions, uploads, and screenshots.

## 📦 What's Inside

This monorepo contains three integrated projects:

| Project | Path | Tech |
|---------|------|------|
| **Backend API** | `backend/` | Node.js + Express + SQLite + JWT |
| **Admin Panel** | `admin/` | React + Vite + TailwindCSS (served by backend) |
| **Android App** | `android/` | Kotlin + Jetpack Compose + Material 3 + Hilt |

## ✨ Features

### Backend
- JWT admin authentication with bcrypt password hashing
- SQLite database (zero-config, fast, persisted on Render disk)
- APK upload with automatic version promotion
- Logo & screenshot uploads (max 10 screenshots)
- Public `/api/latest` endpoint consumed by the Android app
- Helmet, CORS, rate limiting, input validation (zod), file sanitization
- Auto-generated rating distribution & believable review counts

### Admin Panel
- Modern dark dashboard with gradient accents
- Sidebar navigation (Dashboard, Manage App, Uploads, Account, Settings)
- Drag-and-drop file uploads with progress
- Live preview for logo & screenshots
- Stats cards (version, downloads, rating, mandatory status, last update)
- Recent download activity feed
- JWT auth with auto-logout on 401
- Fully responsive (mobile bottom-nav included)

### Android App
- Material 3 + Material You (dynamic color on Android 12+)
- Splash screen, edge-to-edge, dark/light themes
- Gradient header with logo, app name, version pills
- Description, version info, changelog, screenshots carousel, ratings card
- **Download with pause / resume / cancel** via foreground service
- Notification progress with Pause/Cancel actions
- Resumable downloads (HTTP Range header, survives interruption)
- APK install via FileProvider (handles Android 8/11/13/14+ permissions)
- Remembers downloaded APK — "Install Downloaded APK" if file exists
- "You're Up To Date" state when installed version matches backend
- Mandatory update mode (hides Continue Later, blocks back press)
- Pull-to-refresh, shimmer skeleton loading, error/retry, offline state
- Clean architecture: data/domain/ui layers, Hilt DI, sealed UI states

## 🚀 Quick Start

### 1. Backend (local)

```bash
cd backend
cp .env.example .env
npm install
npm start
```

Server runs on http://localhost:10000

Default admin:
- Email: `admin@mirrorpro.app`
- Password: `MirrorPro@2026!`

### 2. Admin Panel (local dev)

```bash
cd admin
npm install
npm run dev
```

Opens on http://localhost:5173 — proxies API calls to backend on :10000.

To build admin for production (outputs to `backend/admin-dist/`):

```bash
cd admin
npm run build
```

Then the backend serves the admin at `http://localhost:10000/`.

### 3. Android App

See [`docs/ANDROID_BUILD.md`](docs/ANDROID_BUILD.md) for full instructions.

**Quick option (no Android Studio needed):** Push to GitHub → the included GitHub Actions workflow auto-builds the APK → download it from the Actions tab or Releases page.

**Local build:** Open `android/` in Android Studio, sync Gradle, click Run.

⚠️ **Important:** Before building, update `BASE_URL` in `android/app/src/main/java/com/mirrorpro/appupdate/di/NetworkModule.kt` to point to your deployed backend URL.

## 📚 Documentation

- [`docs/API.md`](docs/API.md) — Full backend API reference
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Render.com deployment guide
- [`docs/ANDROID_BUILD.md`](docs/ANDROID_BUILD.md) — How to build the APK
- [`docs/SCHEMA.sql`](docs/SCHEMA.sql) — Database schema

## 🔐 Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens (7-day expiry)
- Helmet security headers
- Rate limiting on login (20/15min) and uploads (30/min)
- File type whitelist (only .apk for APKs, only images for logos/screenshots)
- Filename sanitization (random suffix + timestamp, prevents traversal)
- File size limits (200MB APK, 10MB images)
- Input validation on every endpoint (zod schemas)
- JWT auth required on all admin routes

## 📁 Project Structure

```
androidfk/
├── backend/               # Node.js + Express + SQLite
│   ├── src/
│   │   ├── config/        # db, upload, schema, env
│   │   ├── controllers/   # auth, app, upload, settings
│   │   ├── middleware/    # auth, rateLimit, validate, error
│   │   ├── models/        # Admin, App, Version, Asset, Settings
│   │   ├── routes/        # index.js + uploads.js
│   │   ├── scripts/       # seed.js, migrate.js
│   │   ├── utils/         # jwt, hash, format
│   │   └── server.js
│   ├── data/              # SQLite DB + uploads (gitignored)
│   ├── .env.example
│   └── package.json
│
├── admin/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/    # Layout, ui/, Dropzone
│   │   ├── pages/         # Login, Dashboard, ManageApp, Uploads, Users, Settings
│   │   ├── hooks/         # useApi
│   │   ├── lib/           # api client
│   │   ├── store/         # zustand auth store
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── android/               # Kotlin + Compose
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/mirrorpro/appupdate/
│   │   │   │   ├── di/            # Hilt modules
│   │   │   │   ├── data/          # remote, repository, dto, model
│   │   │   │   ├── domain/        # repository, usecase
│   │   │   │   ├── ui/            # theme, components, home, download
│   │   │   │   ├── util/          # ApkInstallHelper, ApkFileStorage, etc.
│   │   │   │   ├── MainActivity.kt
│   │   │   │   └── MirrorProApp.kt
│   │   │   └── res/               # themes, strings, xml configs
│   │   └── build.gradle.kts
│   ├── gradle/libs.versions.toml
│   └── settings.gradle.kts
│
├── .github/workflows/
│   └── build-apk.yml      # Auto-build APK on push
│
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── ANDROID_BUILD.md
│   └── SCHEMA.sql
│
├── render.yaml            # Render.com blueprint
└── README.md
```

## 🆘 Support

If you hit any issues:

1. Check [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for Render-specific gotchas
2. Check [`docs/ANDROID_BUILD.md`](docs/ANDROID_BUILD.md) for APK build issues
3. Check the GitHub Actions logs if the APK build fails

## 📄 License

MIT — use this for any purpose, commercial or otherwise.

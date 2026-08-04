# MirrorPro API Reference

Base URL: `https://your-render-app.onrender.com/api`

## Authentication

All admin endpoints (except `/login`) require a JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are obtained via `POST /login` and expire after 7 days.

---

## Public Endpoints

### GET /latest

Returns the latest app info + version. This is the endpoint the Android app calls on launch.

**Auth:** None

**Response 200:**
```json
{
  "name": "MirrorPro",
  "developer": "MirrorPro Inc.",
  "package": "com.mirrorpro.app",
  "description": "A modern Android application.",
  "currentVersion": "2.5.0",
  "versionCode": 25,
  "releaseDate": "2026-08-01",
  "apkUrl": "https://server.com/uploads/apk/app_v25.apk",
  "apkSize": 60817408,
  "size": "58 MB",
  "logo": "https://server.com/uploads/logos/logo.png",
  "screenshots": [
    { "id": 1, "url": "https://...", "caption": "Home screen" }
  ],
  "minAndroid": "8.0",
  "downloads": "124K",
  "rating": 4.8,
  "reviews": 983,
  "ratingBreakdown": { "5": 733, "4": 220, "3": 18, "2": 9, "1": 10 },
  "mandatory": false,
  "changelog": ["Bug fixes", "Performance improvements", "New UI"]
}
```

### GET /download/track

Increments the download counter. Call this when the user starts downloading the APK.

**Auth:** None

**Response 200:**
```json
{ "tracked": true, "versionId": 5 }
```

---

## Auth Endpoints

### POST /login

**Body:**
```json
{ "email": "admin@mirrorpro.app", "password": "MirrorPro@2026!" }
```

**Response 200:**
```json
{
  "token": "eyJ...",
  "admin": { "id": 1, "email": "admin@mirrorpro.app", "name": "MirrorPro Admin", "role": "admin" }
}
```

**Response 401:**
```json
{ "error": "Invalid email or password" }
```

Rate-limited: 20 attempts per 15 minutes per IP.

### GET /me

Returns the currently authenticated admin.

### PUT /me/password

**Body:**
```json
{ "current_password": "...", "new_password": "..." }
```
New password must be ≥ 8 characters.

### PUT /me/profile

**Body:**
```json
{ "name": "New Name", "email": "new@email.com" }
```

---

## App Endpoints

### GET /app

Returns full app info + versions + screenshots + logo (admin view).

### PUT /app

**Body (all fields optional):**
```json
{
  "name": "New App Name",
  "developer": "New Developer",
  "package_name": "com.new.package",
  "description": "Updated description (Markdown supported)",
  "min_android": "8.0",
  "rating_override": 4.9,
  "downloads_override": "150K",
  "mandatory_update": true
}
```

---

## Upload Endpoints

### POST /upload-apk

Multipart form-data:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `apk` | file | ✅ | APK file (max 200MB, .apk only) |
| `version_name` | string | ✅ | e.g. "2.5.0" |
| `version_code` | int | ✅ | e.g. 25 |
| `release_date` | string | ✅ | ISO date e.g. "2026-08-01" |
| `changelog` | string | ❌ | Newline-separated or single text |

**Response 200:**
```json
{
  "success": true,
  "version": {
    "id": 5,
    "version_name": "2.5.0",
    "version_code": 25,
    "apk_filename": "app_1785828343852_abc.apk",
    "apk_size": 60817408,
    "apk_size_text": "58 MB",
    "release_date": "2026-08-01",
    "is_latest": true,
    "apk_url": "https://server.com/uploads/apk/app_1785828343852_abc.apk"
  }
}
```

Uploading a new APK automatically marks previous versions as non-latest.

### POST /upload-logo

Multipart form-data: `logo` field (PNG/JPG/WEBP, max 10MB).

### POST /upload-screenshot

Multipart form-data: `screenshot` field (PNG/JPG/WEBP, max 10MB).
Maximum 10 screenshots per app — uploads beyond this return 400.

### DELETE /screenshot/:id

Removes a screenshot (and deletes the file).

### DELETE /version/:id

Deletes a version (and its APK file). If the deleted version was the latest, the next-most-recent version is promoted to latest.

---

## Settings Endpoints

### GET /settings

Returns all settings as key-value pairs.

### PUT /settings

**Body (all optional):**
```json
{
  "site_name": "MirrorPro Admin",
  "api_base_url": "https://...",
  "default_rating": "4.8",
  "default_downloads": "124K",
  "theme": "dark"
}
```

---

## Stats Endpoint

### GET /stats

Returns dashboard stats.

**Response:**
```json
{
  "currentVersion": "2.5.0",
  "versionCode": 25,
  "apkSize": "58 MB",
  "apkSizeBytes": 60817408,
  "totalDownloads": 124,
  "downloadsLabel": "124K",
  "rating": 4.8,
  "mandatoryUpdate": false,
  "lastUpdate": "2026-08-01",
  "screenshotsCount": 4,
  "recentDownloads": [
    { "id": 1, "version_id": 5, "version_name": "2.5.0", "version_code": 25, "ip": "1.2.3.4", "user_agent": "...", "created_at": "2026-08-04 12:34:56" }
  ]
}
```

---

## Static Files

Uploaded files are served at:
- `GET /uploads/apk/<filename>` — APK files
- `GET /uploads/logos/<filename>` — Logo images
- `GET /uploads/screenshots/<filename>` — Screenshot images

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Human-readable message",
  "detail": "Optional additional info"
}
```

Validation errors:
```json
{
  "error": "Validation failed",
  "details": [
    { "path": "email", "message": "Valid email required" }
  ]
}
```

Common status codes:
- `200` — Success
- `400` — Bad request (validation, bad file type, etc.)
- `401` — Not authenticated
- `403` — Not authorized (not used currently)
- `404` — Not found
- `413` — File too large
- `429` — Rate limited
- `500` — Server error

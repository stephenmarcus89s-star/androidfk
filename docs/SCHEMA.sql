-- MirrorPro Database Schema
-- Used by SQLite on first run (via src/config/schema.js).
-- This file is for reference only — the app creates tables automatically.

-- Admin users
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,           -- bcrypt hash, 10 rounds
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',    -- 'admin' for now, future-proof for roles
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- The single app being distributed
CREATE TABLE IF NOT EXISTS apps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  developer TEXT NOT NULL,
  package_name TEXT NOT NULL,
  description TEXT,
  min_android TEXT DEFAULT '8.0',
  rating_override REAL,                  -- NULL = use default from settings
  downloads_override TEXT,               -- NULL = compute from downloads table
  mandatory_update INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Each APK upload creates a version row
CREATE TABLE IF NOT EXISTS versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  version_name TEXT NOT NULL,            -- e.g. "2.5.0"
  version_code INTEGER NOT NULL,         -- e.g. 25
  apk_filename TEXT NOT NULL,            -- sanitized filename in uploads/apk/
  apk_size INTEGER NOT NULL DEFAULT 0,   -- bytes
  apk_size_text TEXT,                    -- human-readable e.g. "58 MB"
  release_date TEXT NOT NULL,            -- ISO date
  changelog TEXT,                        -- newline-separated or JSON array
  is_latest INTEGER NOT NULL DEFAULT 0,  -- 1 = currently the latest
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Screenshots — many per app
CREATE TABLE IF NOT EXISTS screenshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Logo history — single active per app (most recent wins)
CREATE TABLE IF NOT EXISTS logos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Download tracking
CREATE TABLE IF NOT EXISTS downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version_id INTEGER REFERENCES versions(id) ON DELETE SET NULL,
  ip TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Settings (key-value)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_versions_app_latest ON versions(app_id, is_latest);
CREATE INDEX IF NOT EXISTS idx_screenshots_app ON screenshots(app_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_downloads_created ON downloads(created_at);

-- Default settings (seeded on first run)
-- site_name: 'MirrorPro Admin'
-- api_base_url: <auto-detected from RENDER_EXTERNAL_URL or APP_BASE_URL>
-- default_rating: '4.8'
-- default_downloads: '124K'
-- theme: 'dark'

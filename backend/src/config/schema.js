import { db } from './database.js';

const SCHEMA = `
-- Admin users
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- The single app being distributed (only one row expected, but kept as a table for flexibility)
CREATE TABLE IF NOT EXISTS apps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  developer TEXT NOT NULL,
  package_name TEXT NOT NULL,
  description TEXT,
  min_android TEXT DEFAULT '8.0',
  rating_override REAL,
  downloads_override TEXT,
  mandatory_update INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Versions — each APK upload creates a version row
CREATE TABLE IF NOT EXISTS versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  version_name TEXT NOT NULL,
  version_code INTEGER NOT NULL,
  apk_filename TEXT NOT NULL,
  apk_size INTEGER NOT NULL DEFAULT 0,
  apk_size_text TEXT,
  release_date TEXT NOT NULL,
  changelog TEXT,             -- newline-separated or JSON array
  is_latest INTEGER NOT NULL DEFAULT 0,
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

-- Logo — single per app (most recent wins)
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
`;

export async function migrate() {
  const statements = SCHEMA.split(';').map(s => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    await db.run(stmt + ';');
  }
  console.log('✅ Database migrations applied');
}

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..', '..');

dotenv.config({ path: path.join(rootDir, '.env') });

// On Render, RENDER_EXTERNAL_URL gives the public base (no trailing slash)
const renderExternalUrl = process.env.RENDER_EXTERNAL_URL;
const localBase = process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 10000}`;

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '10000', 10),
  clientUrl: process.env.CLIENT_URL || '*',

  db: {
    path: process.env.DB_PATH || path.join(rootDir, 'data', 'mirrorpro.db'),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-only-secret-change-me-32-chars-long!!!',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@mirrorpro.app',
    password: process.env.ADMIN_PASSWORD || 'MirrorPro@2026!',
    name: process.env.ADMIN_NAME || 'MirrorPro Admin',
  },

  uploads: {
    // Default: place uploads inside data/ so they persist on Render's disk
    dir: process.env.UPLOAD_DIR || path.join(rootDir, 'data', 'uploads'),
    maxApkSize: parseInt(process.env.MAX_APK_SIZE_MB || '200', 10) * 1024 * 1024,
    maxImageSize: parseInt(process.env.MAX_IMAGE_SIZE_MB || '10', 10) * 1024 * 1024,
    maxScreenshots: parseInt(process.env.MAX_SCREENSHOTS || '10', 10),
    apkDir: 'apk',
    logoDir: 'logos',
    screenshotDir: 'screenshots',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  // The public base URL where this server is reachable.
  // On Render this is auto-detected; locally falls back to APP_BASE_URL.
  baseUrl: (renderExternalUrl || localBase).replace(/\/$/, ''),

  rootDir,
};

export default config;

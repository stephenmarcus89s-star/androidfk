import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { config } from './index.js';

// Ensure upload dirs exist
const subDirs = [config.uploads.apkDir, config.uploads.logoDir, config.uploads.screenshotDir];
for (const d of subDirs) {
  const full = path.join(config.uploads.dir, d);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
}

// Sanitize filename to prevent directory traversal and weird chars
function sanitizeFilename(name) {
  // Keep extension, sanitize base
  const ext = path.extname(name).toLowerCase();
  const base = path.basename(name, ext).replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 60);
  const random = crypto.randomBytes(6).toString('hex');
  const ts = Date.now();
  return `${base}_${ts}_${random}${ext}`;
}

function storageFor(subDir) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(config.uploads.dir, subDir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      try {
        cb(null, sanitizeFilename(file.originalname));
      } catch (e) {
        cb(e);
      }
    },
  });
}

function fileFilter(allowedExts, allowedMimes) {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();
    if (allowedExts.includes(ext) && allowedMimes.some(m => mime.startsWith(m.split('/')[0]))) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${ext || mime}`));
    }
  };
}

export const uploadApk = multer({
  storage: storageFor(config.uploads.apkDir),
  limits: { fileSize: config.uploads.maxApkSize },
  fileFilter: fileFilter(['.apk'], ['application/vnd.android.package-archive', 'application/octet-stream']),
});

export const uploadLogo = multer({
  storage: storageFor(config.uploads.logoDir),
  limits: { fileSize: config.uploads.maxImageSize },
  fileFilter: fileFilter(['.png', '.jpg', '.jpeg', '.webp'], ['image/png', 'image/jpeg', 'image/webp']),
});

export const uploadScreenshot = multer({
  storage: storageFor(config.uploads.screenshotDir),
  limits: { fileSize: config.uploads.maxImageSize },
  fileFilter: fileFilter(['.png', '.jpg', '.jpeg', '.webp'], ['image/png', 'image/jpeg', 'image/webp']),
});

// Helper: build public URL for an uploaded file
export function fileUrl(subDir, filename) {
  if (!filename) return null;
  return `${config.baseUrl}/uploads/${subDir}/${filename}`;
}

// Helper: delete a file safely
export function safeDelete(subDir, filename) {
  if (!filename) return;
  const full = path.join(config.uploads.dir, subDir, filename);
  if (!full.startsWith(config.uploads.dir)) return; // prevent traversal
  fs.unlink(full, () => {});
}

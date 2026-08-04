import path from 'path';
import fs from 'fs';
import { AppModel } from '../models/App.js';
import { VersionModel } from '../models/Version.js';
import { ScreenshotModel, LogoModel } from '../models/Asset.js';
import { config } from '../config/index.js';
import { safeDelete, fileUrl } from '../config/upload.js';
import { asyncHandler } from '../middleware/error.js';
import { formatBytes } from '../utils/format.js';
import { schemas, validate } from '../middleware/validate.js';

// POST /upload-apk — also creates a new version
export const uploadApkHandler = [
  validate(schemas.createVersion),
  (req, res, next) => {
    // multer middleware will have been applied on the route
    next();
  },
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No APK file received' });
    const { version_name, version_code, release_date, changelog } = req.validated;
    const app = await AppModel.get();

    // Compute size
    const stat = fs.statSync(req.file.path);
    const sizeBytes = stat.size;
    const sizeText = formatBytes(sizeBytes);

    // Delete previous APK file (optional cleanup) — we keep old rows for history but unlink file
    // To keep it simple, we keep all APK files (Render has disk). Comment-out if you want to delete.

    const version = await VersionModel.create({
      appId: app.id,
      versionName: version_name,
      versionCode: Number(version_code),
      apkFilename: req.file.filename,
      apkSize: sizeBytes,
      apkSizeText: sizeText,
      releaseDate: release_date,
      changelog: changelog || '',
    });

    res.json({
      success: true,
      version: {
        ...version,
        apk_url: fileUrl('apk', version.apk_filename),
        is_latest: !!version.is_latest,
      },
    });
  }),
];

// POST /upload-logo
export const uploadLogoHandler = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No logo file received' });
  const app = await AppModel.get();
  const logo = await LogoModel.create({ appId: app.id, filename: req.file.filename });
  res.json({
    success: true,
    logo: { id: logo.id, url: fileUrl('logos', logo.filename), filename: logo.filename },
  });
});

// POST /upload-screenshot
export const uploadScreenshotHandler = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No screenshot file received' });
  const app = await AppModel.get();
  const existingCount = await ScreenshotModel.countByApp(app.id);
  if (existingCount >= config.uploads.maxScreenshots) {
    safeDelete('screenshots', req.file.filename);
    return res.status(400).json({ error: `Maximum ${config.uploads.maxScreenshots} screenshots allowed` });
  }
  const screenshot = await ScreenshotModel.create({
    appId: app.id,
    filename: req.file.filename,
    sortOrder: existingCount,
  });
  res.json({
    success: true,
    screenshot: {
      id: screenshot.id,
      url: fileUrl('screenshots', screenshot.filename),
      filename: screenshot.filename,
      caption: screenshot.caption,
      sortOrder: screenshot.sort_order,
    },
  });
});

// DELETE /screenshot/:id
export const deleteScreenshot = asyncHandler(async (req, res) => {
  const s = await ScreenshotModel.delete(Number(req.params.id));
  if (!s) return res.status(404).json({ error: 'Screenshot not found' });
  safeDelete('screenshots', s.filename);
  res.json({ success: true });
});

// DELETE /version/:id — delete a version (and its APK file)
export const deleteVersion = asyncHandler(async (req, res) => {
  const v = await VersionModel.delete(Number(req.params.id));
  if (!v) return res.status(404).json({ error: 'Version not found' });
  safeDelete('apk', v.apk_filename);
  res.json({ success: true });
});

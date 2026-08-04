import { AppModel } from '../models/App.js';
import { VersionModel } from '../models/Version.js';
import { ScreenshotModel, LogoModel, DownloadModel } from '../models/Asset.js';
import { SettingsModel } from '../models/Settings.js';
import { fileUrl } from '../config/upload.js';
import { ratingDistribution, parseChangelog } from '../utils/format.js';
import { asyncHandler } from '../middleware/error.js';
import { schemas, validate } from '../middleware/validate.js';

// GET /latest — public endpoint consumed by the Android app
export const getLatest = asyncHandler(async (req, res) => {
  const app = await AppModel.get();
  const version = await VersionModel.findLatest();
  const logo = await LogoModel.findLatest(app.id);
  const screenshots = await ScreenshotModel.findByApp(app.id);
  const settings = await SettingsModel.getAll();

  const rating = app.rating_override !== null && app.rating_override !== undefined
    ? Number(app.rating_override)
    : Number(settings.default_rating || 4.8);

  let downloadsLabel = app.downloads_override;
  if (!downloadsLabel) {
    const totalDl = await VersionModel.totalDownloads();
    if (totalDl > 0) {
      downloadsLabel = totalDl >= 1000 ? `${(totalDl / 1000).toFixed(0)}K` : String(totalDl);
    } else {
      downloadsLabel = settings.default_downloads || '0';
    }
  }

  const { total: reviewCount, breakdown } = ratingDistribution(rating);

  const response = {
    name: app.name,
    developer: app.developer,
    package: app.package_name,
    description: app.description || '',
    currentVersion: version ? version.version_name : '1.0.0',
    versionCode: version ? version.version_code : 1,
    releaseDate: version ? version.release_date : new Date().toISOString().slice(0, 10),
    apkUrl: version ? fileUrl('apk', version.apk_filename) : null,
    apkSize: version ? version.apk_size : 0,
    size: version ? version.apk_size_text : '0 KB',
    logo: logo ? fileUrl('logos', logo.filename) : null,
    screenshots: screenshots.map(s => ({
      id: s.id,
      url: fileUrl('screenshots', s.filename),
      caption: s.caption,
    })),
    minAndroid: app.min_android || '8.0',
    downloads: downloadsLabel,
    rating: Number(rating.toFixed(1)),
    reviews: reviewCount,
    ratingBreakdown: breakdown,
    mandatory: !!app.mandatory_update,
    changelog: parseChangelog(version?.changelog),
  };

  res.json(response);
});

// GET /app — admin: full app info
export const getAppAdmin = asyncHandler(async (req, res) => {
  const app = await AppModel.get();
  const version = await VersionModel.findLatest();
  const logo = await LogoModel.findLatest(app.id);
  const screenshots = await ScreenshotModel.findByApp(app.id);
  const versions = await VersionModel.findAll();

  res.json({
    app: {
      ...app,
      mandatory_update: !!app.mandatory_update,
      rating_override: app.rating_override,
      downloads_override: app.downloads_override,
    },
    logo: logo ? { id: logo.id, url: fileUrl('logos', logo.filename), filename: logo.filename } : null,
    latestVersion: version,
    screenshots: screenshots.map(s => ({
      id: s.id,
      url: fileUrl('screenshots', s.filename),
      filename: s.filename,
      caption: s.caption,
      sortOrder: s.sort_order,
    })),
    versions: versions.map(v => ({
      ...v,
      apk_url: fileUrl('apk', v.apk_filename),
      is_latest: !!v.is_latest,
    })),
  });
});

// PUT /app — admin: update app fields
export const updateApp = [
  validate(schemas.updateApp),
  asyncHandler(async (req, res) => {
    const updated = await AppModel.update(req.validated);
    res.json({ app: updated });
  }),
];

// GET /stats — admin dashboard
export const getStats = asyncHandler(async (req, res) => {
  const app = await AppModel.get();
  const version = await VersionModel.findLatest();
  const screenshots = await ScreenshotModel.findByApp(app.id);
  const settings = await SettingsModel.getAll();
  const recentDownloads = await DownloadModel.recent(10);
  const totalDownloads = await VersionModel.totalDownloads();

  const rating = app.rating_override !== null && app.rating_override !== undefined
    ? Number(app.rating_override)
    : Number(settings.default_rating || 4.8);

  res.json({
    currentVersion: version ? version.version_name : '—',
    versionCode: version ? version.version_code : 0,
    apkSize: version ? version.apk_size_text : '—',
    apkSizeBytes: version ? version.apk_size : 0,
    totalDownloads,
    downloadsLabel: app.downloads_override || (totalDownloads >= 1000 ? `${(totalDownloads / 1000).toFixed(0)}K` : String(totalDownloads)) || settings.default_downloads,
    rating: Number(rating.toFixed(1)),
    mandatoryUpdate: !!app.mandatory_update,
    lastUpdate: version ? version.release_date : '—',
    screenshotsCount: screenshots.length,
    recentDownloads,
  });
});

// Track download (called when user hits /download)
export const trackDownload = asyncHandler(async (req, res) => {
  const version = await VersionModel.findLatest();
  if (!version) return res.status(404).json({ error: 'No version available' });
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const ua = req.headers['user-agent'] || '';
  await DownloadModel.create({ versionId: version.id, ip, userAgent: ua });
  res.json({ tracked: true, versionId: version.id });
});

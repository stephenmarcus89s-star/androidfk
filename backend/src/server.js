import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

import { config } from './config/index.js';
import { getDb } from './config/database.js';
import { migrate } from './config/schema.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { notFound, errorHandler } from './middleware/error.js';
import apiRoutes from './routes/index.js';

import { AdminModel } from './models/Admin.js';
import { AppModel } from './models/App.js';
import { SettingsModel } from './models/Settings.js';
import { hashPassword } from './utils/hash.js';

async function bootstrap() {
  // Init DB + migrations
  getDb();
  await migrate();

  // Seed defaults if first run
  const adminCount = await AdminModel.count();
  if (adminCount === 0) {
    const hash = await hashPassword(config.admin.password);
    await AdminModel.create({
      email: config.admin.email,
      passwordHash: hash,
      name: config.admin.name,
    });
    console.log(`🌱 Seeded admin: ${config.admin.email}`);
  }
  await AppModel.get();
  await SettingsModel.getAll();

  const app = express();

  // Trust proxy (Render / reverse proxies)
  app.set('trust proxy', 1);

  // Security & middlewares
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  }));
  app.use(compression());
  app.use(cors({ origin: config.clientUrl === '*' ? true : config.clientUrl, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

  // Static: uploaded files
  app.use('/uploads', express.static(config.uploads.dir, {
    maxAge: '7d',
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  }));

  // Health check for Render
  app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

  // API
  app.use('/api', apiLimiter, apiRoutes);

  // Serve built admin panel (if present)
  const adminDist = path.join(config.rootDir, 'admin-dist');
  if (fs.existsSync(adminDist)) {
    app.use(express.static(adminDist));
    app.get(/^\/(?!api|uploads|health).*/, (req, res) => {
      res.sendFile(path.join(adminDist, 'index.html'));
    });
    console.log('🎨 Admin panel served from admin-dist');
  } else {
    console.log('ℹ️  No admin-dist folder — admin panel not served. Build it via `npm run build:admin`.');
  }

  // 404 + errors
  app.use(notFound);
  app.use(errorHandler);

  app.listen(config.port, () => {
    console.log(`\n🚀 MirrorPro backend running on port ${config.port}`);
    console.log(`   Environment: ${config.env}`);
    console.log(`   Public URL:  ${config.baseUrl}`);
    console.log(`   Admin login: ${config.admin.email}`);
    console.log(`   Latest API:  ${config.baseUrl}/api/latest\n`);
  });
}

bootstrap().catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  process.exit(0);
});

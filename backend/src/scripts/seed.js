import { db } from '../config/database.js';
import { migrate } from '../config/schema.js';
import { AdminModel } from '../models/Admin.js';
import { AppModel } from '../models/App.js';
import { VersionModel } from '../models/Version.js';
import { SettingsModel } from '../models/Settings.js';
import { config } from '../config/index.js';
import { hashPassword } from '../utils/hash.js';
import { formatBytes, parseChangelog } from '../utils/format.js';
import fs from 'fs';
import path from 'path';

async function seed() {
  console.log('🌱 Running seed...');
  await migrate();

  // Admin
  const existing = await AdminModel.findByEmail(config.admin.email);
  if (!existing) {
    const hash = await hashPassword(config.admin.password);
    await AdminModel.create({
      email: config.admin.email,
      passwordHash: hash,
      name: config.admin.name,
    });
    console.log(`✅ Admin created: ${config.admin.email}`);
  } else {
    console.log(`ℹ️  Admin already exists: ${config.admin.email}`);
  }

  // Settings defaults
  await SettingsModel.setMany({
    site_name: 'MirrorPro Admin',
    api_base_url: config.baseUrl,
    default_rating: '4.8',
    default_downloads: '124K',
    theme: 'dark',
  });
  console.log('✅ Settings seeded');

  // App
  const app = await AppModel.get();
  console.log(`✅ App row ensured: ${app.name}`);

  console.log('\n🎉 Seed complete');
  console.log(`   Admin email: ${config.admin.email}`);
  console.log(`   Admin password: ${config.admin.password}`);
  console.log(`   Server URL: ${config.baseUrl}`);
  await db.run('PRAGMA wal_checkpoint(TRUNCATE);');
  process.exit(0);
}

seed().catch(e => {
  console.error('Seed failed:', e);
  process.exit(1);
});

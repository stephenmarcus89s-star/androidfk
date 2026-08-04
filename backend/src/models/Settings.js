import { db } from '../config/database.js';

const DEFAULTS = {
  site_name: 'MirrorPro Admin',
  api_base_url: '',
  default_rating: '4.8',
  default_downloads: '124K',
  theme: 'dark',
};

export const SettingsModel = {
  async get(key) {
    const row = await db.get('SELECT value FROM settings WHERE key = ?', [key]);
    return row?.value ?? DEFAULTS[key] ?? null;
  },
  async getAll() {
    const rows = await db.all('SELECT key, value FROM settings');
    const out = { ...DEFAULTS };
    for (const r of rows) out[r.key] = r.value;
    return out;
  },
  async set(key, value) {
    await db.run(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [key, String(value ?? '')]
    );
    return value;
  },
  async setMany(obj) {
    for (const [k, v] of Object.entries(obj)) {
      await this.set(k, v);
    }
    return this.getAll();
  },
};

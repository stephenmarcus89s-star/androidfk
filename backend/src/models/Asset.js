import { db } from '../config/database.js';

export const ScreenshotModel = {
  async findByApp(appId) {
    return db.all('SELECT * FROM screenshots WHERE app_id = ? ORDER BY sort_order ASC, id ASC', [appId]);
  },
  async create({ appId, filename, caption = '', sortOrder = 0 }) {
    const { lastID } = await db.run(
      'INSERT INTO screenshots (app_id, filename, caption, sort_order) VALUES (?, ?, ?, ?)',
      [appId, filename, caption, sortOrder]
    );
    return db.get('SELECT * FROM screenshots WHERE id = ?', [lastID]);
  },
  async findById(id) {
    return db.get('SELECT * FROM screenshots WHERE id = ?', [id]);
  },
  async delete(id) {
    const s = await this.findById(id);
    if (!s) return null;
    await db.run('DELETE FROM screenshots WHERE id = ?', [id]);
    return s;
  },
  async reorder(id, sortOrder) {
    await db.run('UPDATE screenshots SET sort_order = ? WHERE id = ?', [sortOrder, id]);
    return this.findById(id);
  },
  async countByApp(appId) {
    const row = await db.get('SELECT COUNT(*) as c FROM screenshots WHERE app_id = ?', [appId]);
    return row?.c || 0;
  },
};

export const LogoModel = {
  async findLatest(appId) {
    return db.get('SELECT * FROM logos WHERE app_id = ? ORDER BY id DESC LIMIT 1', [appId]);
  },
  async create({ appId, filename }) {
    const { lastID } = await db.run('INSERT INTO logos (app_id, filename) VALUES (?, ?)', [appId, filename]);
    return db.get('SELECT * FROM logos WHERE id = ?', [lastID]);
  },
};

export const DownloadModel = {
  async create({ versionId, ip, userAgent }) {
    const { lastID } = await db.run(
      'INSERT INTO downloads (version_id, ip, user_agent) VALUES (?, ?, ?)',
      [versionId, ip, userAgent]
    );
    return lastID;
  },
  async recent(limit = 10) {
    return db.all(
      `SELECT d.*, v.version_name, v.version_code
       FROM downloads d
       LEFT JOIN versions v ON d.version_id = v.id
       ORDER BY d.id DESC LIMIT ?`,
      [limit]
    );
  },
};

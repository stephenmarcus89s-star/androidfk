import { db } from '../config/database.js';

export const VersionModel = {
  async findLatest() {
    return db.get('SELECT * FROM versions WHERE is_latest = 1 ORDER BY id DESC LIMIT 1');
  },
  async findById(id) {
    return db.get('SELECT * FROM versions WHERE id = ?', [id]);
  },
  async findAll() {
    return db.all('SELECT * FROM versions ORDER BY id DESC');
  },
  async create({ appId, versionName, versionCode, apkFilename, apkSize, apkSizeText, releaseDate, changelog }) {
    // Mark all previous as non-latest
    await db.run('UPDATE versions SET is_latest = 0 WHERE app_id = ?', [appId]);
    const { lastID } = await db.run(
      `INSERT INTO versions (app_id, version_name, version_code, apk_filename, apk_size, apk_size_text, release_date, changelog, is_latest)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [appId, versionName, versionCode, apkFilename, apkSize, apkSizeText, releaseDate, changelog]
    );
    return this.findById(lastID);
  },
  async delete(id) {
    const v = await this.findById(id);
    if (!v) return null;
    await db.run('DELETE FROM versions WHERE id = ?', [id]);
    // If we deleted the latest, promote the next one
    if (v.is_latest) {
      const next = await db.get('SELECT id FROM versions ORDER BY id DESC LIMIT 1');
      if (next) await db.run('UPDATE versions SET is_latest = 1 WHERE id = ?', [next.id]);
    }
    return v;
  },
  async countDownloads(versionId) {
    const row = await db.get('SELECT COUNT(*) as c FROM downloads WHERE version_id = ?', [versionId]);
    return row?.c || 0;
  },
  async totalDownloads() {
    const row = await db.get('SELECT COUNT(*) as c FROM downloads');
    return row?.c || 0;
  },
};

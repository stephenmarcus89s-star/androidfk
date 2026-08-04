import { db } from '../config/database.js';

export const AppModel = {
  async get() {
    // There's only one app row in this system
    let row = await db.get('SELECT * FROM apps WHERE id = 1');
    if (!row) {
      // Auto-create default row
      await db.run(
        `INSERT INTO apps (id, name, developer, package_name, description, min_android, mandatory_update)
         VALUES (1, 'MirrorPro', 'MirrorPro Inc.', 'com.mirrorpro.app', 'MirrorPro — your modern Android updater.', '8.0', 0)`
      );
      row = await db.get('SELECT * FROM apps WHERE id = 1');
    }
    return row;
  },
  async update(fields) {
    const allowed = ['name', 'developer', 'package_name', 'description', 'min_android', 'rating_override', 'downloads_override', 'mandatory_update'];
    const sets = [];
    const values = [];
    for (const k of allowed) {
      if (fields[k] !== undefined) {
        sets.push(`${k} = ?`);
        values.push(fields[k]);
      }
    }
    if (sets.length === 0) return this.get();
    sets.push("updated_at = datetime('now')");
    values.push(1);
    await db.run(`UPDATE apps SET ${sets.join(', ')} WHERE id = ?`, values);
    return this.get();
  },
};

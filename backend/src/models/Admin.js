import { db } from '../config/database.js';

export const AdminModel = {
  async findByEmail(email) {
    return db.get('SELECT * FROM admins WHERE email = ?', [email]);
  },
  async findById(id) {
    return db.get('SELECT id, email, name, role, created_at, updated_at FROM admins WHERE id = ?', [id]);
  },
  async create({ email, passwordHash, name, role = 'admin' }) {
    const { lastID } = await db.run(
      'INSERT INTO admins (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [email, passwordHash, name, role]
    );
    return this.findById(lastID);
  },
  async updatePassword(id, passwordHash) {
    await db.run('UPDATE admins SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?', [passwordHash, id]);
    return this.findById(id);
  },
  async updateProfile(id, { name, email }) {
    await db.run('UPDATE admins SET name = ?, email = ?, updated_at = datetime(\'now\') WHERE id = ?', [name, email, id]);
    return this.findById(id);
  },
  async count() {
    const row = await db.get('SELECT COUNT(*) as c FROM admins');
    return row?.c || 0;
  },
};

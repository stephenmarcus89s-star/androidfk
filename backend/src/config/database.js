import sqlite3 from 'sqlite3';
const { Database } = sqlite3;
import { config } from './index.js';
import path from 'path';
import fs from 'fs';

let dbInstance = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  // Make sure the data directory exists
  const dir = path.dirname(config.db.path);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  dbInstance = new Database(config.db.path, (err) => {
    if (err) {
      console.error('❌ SQLite connection error:', err.message);
      process.exit(1);
    }
    // Enable WAL for better concurrency and durability
    dbInstance.run('PRAGMA journal_mode = WAL;');
    dbInstance.run('PRAGMA foreign_keys = ON;');
  });

  return dbInstance;
}

// Promise wrappers so controllers can use async/await
export const db = {
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      getDb().all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
  },
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      getDb().get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
    });
  },
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      getDb().run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
};

export async function closeDb() {
  if (!dbInstance) return;
  return new Promise((resolve) => dbInstance.close(() => resolve()));
}

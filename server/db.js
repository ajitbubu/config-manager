import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.FCC_DB_PATH || join(__dirname, 'fcc.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function jsonRow(row, ...keys) {
  if (!row) return row;
  const out = { ...row };
  for (const k of keys) if (typeof out[k] === 'string') out[k] = JSON.parse(out[k]);
  return out;
}

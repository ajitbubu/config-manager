import { db } from './db.js';

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      industry TEXT,
      envs TEXT NOT NULL,
      modules TEXT NOT NULL,
      theme TEXT
    );

    CREATE TABLE IF NOT EXISTS envs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT,
      "order" INTEGER
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT NOT NULL,
      avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS flags (
      key TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      "default" TEXT NOT NULL,
      module TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      owner TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT,
      dependencies TEXT NOT NULL DEFAULT '[]',
      overrides TEXT NOT NULL DEFAULT '{}',
      rollout TEXT NOT NULL DEFAULT '{}',
      options TEXT,
      kill_switch INTEGER NOT NULL DEFAULT 0,
      min REAL,
      max REAL
    );

    CREATE TABLE IF NOT EXISTS deployments (
      id TEXT PRIMARY KEY,
      tenant TEXT NOT NULL,
      env TEXT NOT NULL,
      version TEXT NOT NULL,
      status TEXT NOT NULL,
      at TEXT NOT NULL,
      by TEXT,
      items INTEGER NOT NULL DEFAULT 0,
      cdn TEXT,
      duration REAL NOT NULL DEFAULT 0,
      note TEXT,
      snapshot TEXT NOT NULL DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      at TEXT NOT NULL,
      user TEXT,
      action TEXT NOT NULL,
      entity TEXT,
      tenant TEXT,
      env TEXT,
      before TEXT,
      after TEXT,
      version TEXT
    );

    CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY,
      flag TEXT NOT NULL,
      tenant TEXT NOT NULL,
      "from" TEXT NOT NULL,
      "to" TEXT NOT NULL,
      requested_by TEXT,
      requested_at TEXT NOT NULL,
      reviewers TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'pending',
      diff INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_audit_at ON audit_log(at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity);
    CREATE INDEX IF NOT EXISTS idx_deploy_at ON deployments(at DESC);
    CREATE INDEX IF NOT EXISTS idx_deploy_tenant_env ON deployments(tenant, env, at DESC);
  `);
}

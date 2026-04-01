import Database from 'better-sqlite3';

const db = new Database('./semvi.db');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      repo TEXT NOT NULL,
      commit_hash TEXT NOT NULL,
      branch TEXT NOT NULL,
      author TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS findings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scan_id INTEGER NOT NULL,
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      path TEXT NOT NULL,
      line INTEGER,
      summary TEXT NOT NULL,
      remediation TEXT NOT NULL,
      evidence TEXT,
      snippet TEXT,
      lane TEXT NOT NULL,
      owners TEXT,
      status TEXT DEFAULT 'open',
      FOREIGN KEY(scan_id) REFERENCES scans(id)
    );

    CREATE TABLE IF NOT EXISTS repositories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      health_score INTEGER NOT NULL DEFAULT 100
    );
    
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL
    );
  `);
}

export function getDb() {
  return db;
}

import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Directorio para la base de datos
const dbDir = join(process.cwd(), 'data');
if (!existsSync(dbDir)) {
	mkdirSync(dbDir, { recursive: true });
}

const dbPath = join(dbDir, 'auth.db');

// Crear/abrir base de datos
const db = new Database(dbPath);

// Crear tabla de usuarios si no existe
db.exec(`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		last_login DATETIME
	)
`);

// Crear tabla de sesiones
db.exec(`
	CREATE TABLE IF NOT EXISTS sessions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		token TEXT UNIQUE NOT NULL,
		expires_at DATETIME NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	)
`);

// Crear índices
db.exec(`
	CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
	CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
`);

export default db;

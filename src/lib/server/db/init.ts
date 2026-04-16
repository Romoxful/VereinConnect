import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { createPasswordHash } from '../auth.js';

const DB_PATH = process.env.DB_PATH || './data/foerderverein.db';

export function initDatabase() {
	const dir = dirname(DB_PATH);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}

	const sqlite = new Database(DB_PATH);
	sqlite.pragma('journal_mode = WAL');
	sqlite.pragma('foreign_keys = ON');

	sqlite.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			email TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			name TEXT NOT NULL,
			role TEXT NOT NULL DEFAULT 'mitglied' CHECK(role IN ('vorstand', 'mitglied')),
			created_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS sessions (
			id TEXT PRIMARY KEY,
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			expires_at TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS members (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			first_name TEXT NOT NULL,
			last_name TEXT NOT NULL,
			email TEXT,
			phone TEXT,
			street TEXT,
			zip TEXT,
			city TEXT,
			member_since TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'aktiv' CHECK(status IN ('aktiv', 'inaktiv', 'ausgetreten')),
			notes TEXT,
			created_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS events (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			description TEXT,
			location TEXT,
			date TEXT NOT NULL,
			time TEXT,
			created_by INTEGER REFERENCES users(id),
			created_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS rsvps (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			status TEXT NOT NULL DEFAULT 'zugesagt' CHECK(status IN ('zugesagt', 'abgesagt', 'vielleicht')),
			created_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS documents (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			filename TEXT NOT NULL,
			original_name TEXT NOT NULL,
			category TEXT NOT NULL DEFAULT 'sonstiges' CHECK(category IN ('satzung', 'bescheide', 'finanzen', 'sonstiges')),
			uploaded_by INTEGER REFERENCES users(id),
			created_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS protocols (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			date TEXT NOT NULL,
			title TEXT NOT NULL,
			attendees TEXT NOT NULL,
			content TEXT NOT NULL,
			created_by INTEGER REFERENCES users(id),
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			updated_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS dues (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
			amount TEXT NOT NULL,
			due_date TEXT NOT NULL,
			paid_date TEXT,
			status TEXT NOT NULL DEFAULT 'offen' CHECK(status IN ('offen', 'bezahlt', 'überfällig')),
			year INTEGER NOT NULL,
			notes TEXT,
			created_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS password_resets (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			token_hash TEXT NOT NULL UNIQUE,
			expires_at TEXT NOT NULL,
			used_at TEXT,
			created_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS sent_emails (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			to_email TEXT NOT NULL,
			subject TEXT NOT NULL,
			body TEXT NOT NULL,
			sent_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS consents (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
			consent_type TEXT NOT NULL CHECK(consent_type IN ('datenverarbeitung', 'newsletter', 'foto_freigabe')),
			given_at TEXT NOT NULL DEFAULT (datetime('now')),
			withdrawn_at TEXT
		);
	`);

	// Seed default admin user if no users exist
	const userCount = sqlite.prepare('SELECT COUNT(*) as count FROM users').get() as {
		count: number;
	};
	if (userCount.count === 0) {
		const hash = createPasswordHash('admin123');
		sqlite
			.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)')
			.run('admin@foerderverein.de', hash, 'Administrator', 'vorstand');
	}

	sqlite.close();
}

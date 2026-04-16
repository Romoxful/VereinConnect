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
			birth_date TEXT,
			profession TEXT,
			member_since TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'aktiv' CHECK(status IN ('aktiv', 'inaktiv', 'ausgetreten', 'beantragt', 'abgelehnt')),
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

		CREATE TABLE IF NOT EXISTS document_versions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
			filename TEXT NOT NULL,
			original_name TEXT NOT NULL,
			size INTEGER NOT NULL DEFAULT 0,
			mime_type TEXT NOT NULL DEFAULT '',
			version_number INTEGER NOT NULL,
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			UNIQUE(document_id, version_number)
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

		CREATE TABLE IF NOT EXISTS consents (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
			consent_type TEXT NOT NULL CHECK(consent_type IN ('datenverarbeitung', 'newsletter', 'foto_freigabe')),
			given_at TEXT NOT NULL DEFAULT (datetime('now')),
			withdrawn_at TEXT
		);

		CREATE TABLE IF NOT EXISTS tasks (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			description TEXT,
			status TEXT NOT NULL DEFAULT 'offen' CHECK(status IN ('offen', 'in_bearbeitung', 'erledigt')),
			priority TEXT NOT NULL DEFAULT 'mittel' CHECK(priority IN ('niedrig', 'mittel', 'hoch')),
			due_date TEXT,
			assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
			created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
			veranstaltung_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			updated_at TEXT NOT NULL DEFAULT (datetime('now'))
		);
	`);

	// Backfill: ensure every existing document has at least a v1 row in document_versions
	sqlite.exec(`
		INSERT INTO document_versions (document_id, filename, original_name, size, mime_type, version_number, created_at)
		SELECT id, filename, original_name, 0, '', 1, created_at
		FROM documents
		WHERE id NOT IN (SELECT document_id FROM document_versions);
	`);

	// Migration: extend members table for membership applications (beantragt/abgelehnt statuses, birth_date, profession)
	const membersTableSql = sqlite
		.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='members'`)
		.get() as { sql: string } | undefined;
	if (membersTableSql && !membersTableSql.sql.includes("'beantragt'")) {
		sqlite.exec(`
			PRAGMA foreign_keys = OFF;
			BEGIN TRANSACTION;
			CREATE TABLE members_new (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				first_name TEXT NOT NULL,
				last_name TEXT NOT NULL,
				email TEXT,
				phone TEXT,
				street TEXT,
				zip TEXT,
				city TEXT,
				birth_date TEXT,
				profession TEXT,
				member_since TEXT NOT NULL,
				status TEXT NOT NULL DEFAULT 'aktiv' CHECK(status IN ('aktiv', 'inaktiv', 'ausgetreten', 'beantragt', 'abgelehnt')),
				notes TEXT,
				created_at TEXT NOT NULL DEFAULT (datetime('now'))
			);
			INSERT INTO members_new (id, first_name, last_name, email, phone, street, zip, city, member_since, status, notes, created_at)
				SELECT id, first_name, last_name, email, phone, street, zip, city, member_since, status, notes, created_at FROM members;
			DROP TABLE members;
			ALTER TABLE members_new RENAME TO members;
			COMMIT;
			PRAGMA foreign_keys = ON;
		`);
	}

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

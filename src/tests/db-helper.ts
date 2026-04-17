import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '$lib/server/db/schema.js';

const SCHEMA_SQL = `
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
		email_verified_at TEXT,
		created_at TEXT NOT NULL DEFAULT (datetime('now'))
	);

	CREATE TABLE IF NOT EXISTS email_verification_tokens (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
		token TEXT NOT NULL UNIQUE,
		expires_at TEXT NOT NULL,
		used_at TEXT,
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

	CREATE TABLE IF NOT EXISTS inventory_categories (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL UNIQUE,
		description TEXT,
		created_at TEXT NOT NULL DEFAULT (datetime('now'))
	);

	CREATE TABLE IF NOT EXISTS inventory_items (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		description TEXT,
		category_id INTEGER REFERENCES inventory_categories(id) ON DELETE SET NULL,
		quantity INTEGER NOT NULL DEFAULT 1,
		location TEXT,
		condition TEXT NOT NULL DEFAULT 'gut' CHECK(condition IN ('neu', 'gut', 'befriedigend', 'mangelhaft', 'defekt')),
		acquisition_date TEXT,
		value TEXT,
		notes TEXT,
		created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
		created_at TEXT NOT NULL DEFAULT (datetime('now')),
		updated_at TEXT NOT NULL DEFAULT (datetime('now'))
	);
`;

export function createTestDb() {
	const sqlite = new Database(':memory:');
	sqlite.pragma('journal_mode = WAL');
	sqlite.pragma('foreign_keys = ON');
	sqlite.exec(SCHEMA_SQL);
	const db = drizzle(sqlite, { schema });
	return { db, sqlite };
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import { users, sessions } from './db/schema.js';
import { eq } from 'drizzle-orm';
import { createPasswordHash } from './auth.js';

// Mock the db module with an async factory that creates its own in-memory DB
vi.mock('$lib/server/db/index.js', async () => {
	const Database = (await import('better-sqlite3')).default;
	const { drizzle } = await import('drizzle-orm/better-sqlite3');
	const schema = await import('./db/schema.js');

	const sqlite = new Database(':memory:');
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
	`);
	const db = drizzle(sqlite, { schema });

	// Expose sqlite handle for cleanup in tests
	(globalThis as any).__testSqlite = sqlite;

	return { db };
});

// Dynamic import so the mock is applied when auth.ts loads
const { createSession, validateSession, deleteSession } = await import('./auth.js');
// Get the mocked db for seeding test data
const { db } = await import('$lib/server/db/index.js');

function cleanup() {
	const sqlite = (globalThis as any).__testSqlite;
	sqlite.exec('DELETE FROM sessions');
	sqlite.exec('DELETE FROM users');
}

describe('createSession', () => {
	let userId: number;

	beforeEach(() => {
		const hash = createPasswordHash('test123');
		const result = db
			.insert(users)
			.values({ email: 'session@test.de', passwordHash: hash, name: 'Test User', role: 'mitglied' })
			.run();
		userId = Number(result.lastInsertRowid);
	});

	afterEach(cleanup);

	it('returns a 64-char hex session ID', () => {
		const sessionId = createSession(userId);
		expect(sessionId).toHaveLength(64);
	});

	it('stores session in database', () => {
		const sessionId = createSession(userId);
		const session = db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
		expect(session).toBeDefined();
		expect(session!.userId).toBe(userId);
	});

	it('sets expiration 30 days in the future', () => {
		const sessionId = createSession(userId);
		const session = db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
		const expires = new Date(session!.expiresAt);
		const now = new Date();
		const diffDays = (expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
		expect(diffDays).toBeGreaterThan(29);
		expect(diffDays).toBeLessThanOrEqual(30);
	});

	it('creates unique session IDs for same user', () => {
		const id1 = createSession(userId);
		const id2 = createSession(userId);
		expect(id1).not.toBe(id2);
	});
});

describe('validateSession', () => {
	let userId: number;

	beforeEach(() => {
		const hash = createPasswordHash('test123');
		const result = db
			.insert(users)
			.values({ email: 'validate@test.de', passwordHash: hash, name: 'Validator', role: 'vorstand' })
			.run();
		userId = Number(result.lastInsertRowid);
	});

	afterEach(cleanup);

	it('returns user data for valid session', () => {
		const sessionId = createSession(userId);
		const result = validateSession(sessionId);
		expect(result).not.toBeNull();
		expect(result!.user.email).toBe('validate@test.de');
		expect(result!.user.name).toBe('Validator');
		expect(result!.user.role).toBe('vorstand');
	});

	it('returns null for nonexistent session', () => {
		const result = validateSession('nonexistent-session-id');
		expect(result).toBeNull();
	});

	it('returns null and deletes expired session', () => {
		const sessionId = crypto.randomBytes(32).toString('hex');
		const expired = new Date(Date.now() - 1000).toISOString();
		db.insert(sessions).values({ id: sessionId, userId, expiresAt: expired }).run();

		const result = validateSession(sessionId);
		expect(result).toBeNull();

		const session = db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
		expect(session).toBeUndefined();
	});
});

describe('deleteSession', () => {
	let userId: number;

	beforeEach(() => {
		const hash = createPasswordHash('test123');
		const result = db
			.insert(users)
			.values({ email: 'delete@test.de', passwordHash: hash, name: 'Deleter', role: 'mitglied' })
			.run();
		userId = Number(result.lastInsertRowid);
	});

	afterEach(cleanup);

	it('removes session from database', () => {
		const sessionId = createSession(userId);
		deleteSession(sessionId);
		const session = db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
		expect(session).toBeUndefined();
	});

	it('does not throw for nonexistent session', () => {
		expect(() => deleteSession('does-not-exist')).not.toThrow();
	});
});

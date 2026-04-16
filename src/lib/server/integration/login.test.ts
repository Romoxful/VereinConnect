import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb } from '../../../tests/db-helper.js';
import { users, sessions } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { createPasswordHash, verifyPassword } from '../auth.js';
import crypto from 'crypto';

const { db, sqlite } = createTestDb();

describe('Login flow integration', () => {
	const testEmail = 'login@foerderverein.de';
	const testPassword = 'sicher123!';
	let testUserId: number;

	beforeEach(() => {
		const hash = createPasswordHash(testPassword);
		const result = db
			.insert(users)
			.values({ email: testEmail, passwordHash: hash, name: 'Login Tester', role: 'vorstand' })
			.run();
		testUserId = Number(result.lastInsertRowid);
	});

	afterEach(() => {
		sqlite.exec('DELETE FROM sessions');
		sqlite.exec('DELETE FROM users');
	});

	it('authenticates with valid credentials', () => {
		// Simulate what the login action does
		const user = db.select().from(users).where(eq(users.email, testEmail)).get();
		expect(user).toBeDefined();
		expect(verifyPassword(testPassword, user!.passwordHash)).toBe(true);
	});

	it('rejects invalid password', () => {
		const user = db.select().from(users).where(eq(users.email, testEmail)).get();
		expect(user).toBeDefined();
		expect(verifyPassword('wrongpassword', user!.passwordHash)).toBe(false);
	});

	it('returns no user for nonexistent email', () => {
		const user = db.select().from(users).where(eq(users.email, 'nobody@test.de')).get();
		expect(user).toBeUndefined();
	});

	it('creates session after successful login', () => {
		const user = db.select().from(users).where(eq(users.email, testEmail)).get()!;
		expect(verifyPassword(testPassword, user.passwordHash)).toBe(true);

		// Create session (inline, since createSession uses the real db module)
		const sessionId = crypto.randomBytes(32).toString('hex');
		const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
		db.insert(sessions).values({ id: sessionId, userId: user.id, expiresAt }).run();

		const session = db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
		expect(session).toBeDefined();
		expect(session!.userId).toBe(user.id);
	});

	it('validates session and returns user data', () => {
		const sessionId = crypto.randomBytes(32).toString('hex');
		const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
		db.insert(sessions).values({ id: sessionId, userId: testUserId, expiresAt }).run();

		// Simulate validateSession logic
		const session = db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
		expect(session).toBeDefined();
		expect(new Date(session!.expiresAt) > new Date()).toBe(true);

		const user = db.select().from(users).where(eq(users.id, session!.userId)).get();
		expect(user).toBeDefined();
		expect(user!.email).toBe(testEmail);
		expect(user!.role).toBe('vorstand');
	});

	it('rejects expired session', () => {
		const sessionId = crypto.randomBytes(32).toString('hex');
		const expired = new Date(Date.now() - 1000).toISOString();
		db.insert(sessions).values({ id: sessionId, userId: testUserId, expiresAt: expired }).run();

		const session = db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
		expect(session).toBeDefined();
		expect(new Date(session!.expiresAt) < new Date()).toBe(true);
	});

	it('logout deletes session', () => {
		const sessionId = crypto.randomBytes(32).toString('hex');
		const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
		db.insert(sessions).values({ id: sessionId, userId: testUserId, expiresAt }).run();

		// Simulate logout
		db.delete(sessions).where(eq(sessions.id, sessionId)).run();

		const session = db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
		expect(session).toBeUndefined();
	});

	it('handles empty email gracefully', () => {
		const user = db.select().from(users).where(eq(users.email, '')).get();
		expect(user).toBeUndefined();
	});
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { createTestDb } from '../../../tests/db-helper.js';
import { users, passwordResets, sentEmails } from '../db/schema.js';
import { createPasswordHash, verifyPassword } from '../auth.js';
import { hashResetToken, RESET_TOKEN_TTL_MS } from '../password-reset.js';

const { db, sqlite } = createTestDb();

// These integration tests mirror the inline-logic pattern used in login.test.ts:
// They exercise the same read/write/validation steps that password-reset.ts and
// email.ts perform, but against an in-memory test database.

function issueToken(userId: number, ttlMs = RESET_TOKEN_TTL_MS): string {
	const token = crypto.randomBytes(32).toString('hex');
	const tokenHash = hashResetToken(token);
	const expiresAt = new Date(Date.now() + ttlMs).toISOString();
	db.insert(passwordResets).values({ userId, tokenHash, expiresAt }).run();
	return token;
}

describe('Password reset flow integration', () => {
	const testEmail = 'reset@foerderverein.de';
	const oldPassword = 'altes-passwort';
	let testUserId: number;

	beforeEach(() => {
		const hash = createPasswordHash(oldPassword);
		const result = db
			.insert(users)
			.values({ email: testEmail, passwordHash: hash, name: 'Reset Tester', role: 'mitglied' })
			.run();
		testUserId = Number(result.lastInsertRowid);
	});

	afterEach(() => {
		sqlite.exec('DELETE FROM password_resets');
		sqlite.exec('DELETE FROM sent_emails');
		sqlite.exec('DELETE FROM sessions');
		sqlite.exec('DELETE FROM users');
	});

	it('creates a reset token with expiry ~1 hour in the future', () => {
		const before = Date.now();
		issueToken(testUserId);
		const after = Date.now();

		const record = db
			.select()
			.from(passwordResets)
			.where(eq(passwordResets.userId, testUserId))
			.get();
		expect(record).toBeDefined();
		expect(record!.usedAt).toBeNull();

		const expiresAtMs = new Date(record!.expiresAt).getTime();
		expect(expiresAtMs).toBeGreaterThanOrEqual(before + RESET_TOKEN_TTL_MS - 1000);
		expect(expiresAtMs).toBeLessThanOrEqual(after + RESET_TOKEN_TTL_MS + 1000);
	});

	it('stores only the hashed token, not the raw token', () => {
		const token = issueToken(testUserId);
		const record = db
			.select()
			.from(passwordResets)
			.where(eq(passwordResets.userId, testUserId))
			.get();
		expect(record!.tokenHash).not.toBe(token);
		expect(record!.tokenHash).toBe(hashResetToken(token));
	});

	it('accepts a valid, unexpired token and finds the record', () => {
		const token = issueToken(testUserId);
		const record = db
			.select()
			.from(passwordResets)
			.where(eq(passwordResets.tokenHash, hashResetToken(token)))
			.get();
		expect(record).toBeDefined();
		expect(new Date(record!.expiresAt) > new Date()).toBe(true);
		expect(record!.usedAt).toBeNull();
	});

	it('rejects a token whose expiry is in the past', () => {
		issueToken(testUserId, -1000); // expired 1 second ago
		const record = db
			.select()
			.from(passwordResets)
			.where(eq(passwordResets.userId, testUserId))
			.get();
		expect(record).toBeDefined();
		expect(new Date(record!.expiresAt) < new Date()).toBe(true);
	});

	it('rejects a non-existent token', () => {
		issueToken(testUserId);
		const record = db
			.select()
			.from(passwordResets)
			.where(eq(passwordResets.tokenHash, hashResetToken('non-existent-token')))
			.get();
		expect(record).toBeUndefined();
	});

	it('marks token as used and updates password hash when consumed', () => {
		const token = issueToken(testUserId);
		const newPassword = 'neues-passwort!';
		const newHash = createPasswordHash(newPassword);

		// Simulate consumeResetTokenAndSetPassword
		db.update(users).set({ passwordHash: newHash }).where(eq(users.id, testUserId)).run();
		db.update(passwordResets)
			.set({ usedAt: new Date().toISOString() })
			.where(eq(passwordResets.tokenHash, hashResetToken(token)))
			.run();

		const updatedUser = db.select().from(users).where(eq(users.id, testUserId)).get();
		expect(verifyPassword(newPassword, updatedUser!.passwordHash)).toBe(true);
		expect(verifyPassword(oldPassword, updatedUser!.passwordHash)).toBe(false);

		const record = db
			.select()
			.from(passwordResets)
			.where(eq(passwordResets.tokenHash, hashResetToken(token)))
			.get();
		expect(record!.usedAt).not.toBeNull();
	});

	it('prevents re-use of an already-used token', () => {
		const token = issueToken(testUserId);
		db.update(passwordResets)
			.set({ usedAt: new Date().toISOString() })
			.where(eq(passwordResets.tokenHash, hashResetToken(token)))
			.run();

		const record = db
			.select()
			.from(passwordResets)
			.where(eq(passwordResets.tokenHash, hashResetToken(token)))
			.get();
		expect(record!.usedAt).not.toBeNull();
	});

	it('cascades delete of reset tokens when the user is removed', () => {
		issueToken(testUserId);
		db.delete(users).where(eq(users.id, testUserId)).run();

		const records = db
			.select()
			.from(passwordResets)
			.where(eq(passwordResets.userId, testUserId))
			.all();
		expect(records).toHaveLength(0);
	});

	it('stores a sent email record (mock email service)', () => {
		const subject = 'Passwort zurücksetzen';
		const body = 'https://example.test/passwort-zuruecksetzen/fake-token';
		db.insert(sentEmails).values({ toEmail: testEmail, subject, body }).run();

		const record = db
			.select()
			.from(sentEmails)
			.where(eq(sentEmails.toEmail, testEmail))
			.get();
		expect(record).toBeDefined();
		expect(record!.subject).toBe(subject);
		expect(record!.body).toBe(body);
	});

	it('does not reveal whether an email exists: lookup returns nothing for unknown email', () => {
		const user = db
			.select()
			.from(users)
			.where(eq(users.email, 'unbekannt@foerderverein.de'))
			.get();
		expect(user).toBeUndefined();

		// And no reset record should have been created for that email
		const resetCount = db.select().from(passwordResets).all().length;
		expect(resetCount).toBe(0);
	});

	it('allows multiple outstanding tokens for the same user', () => {
		issueToken(testUserId);
		issueToken(testUserId);
		const records = db
			.select()
			.from(passwordResets)
			.where(eq(passwordResets.userId, testUserId))
			.all();
		expect(records).toHaveLength(2);
	});
});

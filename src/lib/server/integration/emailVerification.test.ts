import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb } from '../../../tests/db-helper.js';
import { emailVerificationTokens, members } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import {
	TOKEN_TTL_MS,
	createEmailVerificationToken,
	generateVerificationToken,
	hasPendingVerificationForEmail,
	verifyEmailToken
} from '../emailVerification.js';

const { db, sqlite } = createTestDb();

function insertApplicant(email: string | null = 'applicant@example.de') {
	const res = db
		.insert(members)
		.values({
			firstName: 'Ver',
			lastName: 'Ifikation',
			email,
			memberSince: '2026-04-17',
			status: 'beantragt'
		})
		.returning({ id: members.id })
		.get();
	return res.id;
}

describe('Email verification token lifecycle', () => {
	afterEach(() => {
		sqlite.exec('DELETE FROM email_verification_tokens');
		sqlite.exec('DELETE FROM members');
	});

	it('generates tokens that are unique and 64 hex chars long', () => {
		const a = generateVerificationToken();
		const b = generateVerificationToken();
		expect(a).toMatch(/^[0-9a-f]{64}$/);
		expect(b).toMatch(/^[0-9a-f]{64}$/);
		expect(a).not.toBe(b);
	});

	it('creates a token tied to a member with 24h expiry', () => {
		const memberId = insertApplicant();
		const now = new Date('2026-04-17T10:00:00.000Z');
		const { token, expiresAt } = createEmailVerificationToken(memberId, now, db);

		const stored = db
			.select()
			.from(emailVerificationTokens)
			.where(eq(emailVerificationTokens.token, token))
			.get();
		expect(stored).toBeDefined();
		expect(stored!.memberId).toBe(memberId);
		expect(stored!.usedAt).toBeNull();
		expect(new Date(expiresAt).getTime() - now.getTime()).toBe(TOKEN_TTL_MS);
	});

	it('marks member as verified when a valid token is presented', () => {
		const memberId = insertApplicant();
		const now = new Date('2026-04-17T10:00:00.000Z');
		const { token } = createEmailVerificationToken(memberId, now, db);

		const result = verifyEmailToken(token, now, db);
		expect(result).toEqual({ status: 'verified', memberId });

		const member = db.select().from(members).where(eq(members.id, memberId)).get();
		expect(member!.emailVerifiedAt).not.toBeNull();

		const used = db
			.select()
			.from(emailVerificationTokens)
			.where(eq(emailVerificationTokens.token, token))
			.get();
		expect(used!.usedAt).not.toBeNull();
	});

	it('returns already_used when the same token is presented twice', () => {
		const memberId = insertApplicant();
		const now = new Date('2026-04-17T10:00:00.000Z');
		const { token } = createEmailVerificationToken(memberId, now, db);

		verifyEmailToken(token, now, db);
		const second = verifyEmailToken(token, now, db);
		expect(second).toEqual({ status: 'already_used', memberId });
	});

	it('returns expired when the token is past its TTL', () => {
		const memberId = insertApplicant();
		const issuedAt = new Date('2026-04-17T10:00:00.000Z');
		const { token } = createEmailVerificationToken(memberId, issuedAt, db);

		const afterExpiry = new Date(issuedAt.getTime() + TOKEN_TTL_MS + 1000);
		const result = verifyEmailToken(token, afterExpiry, db);
		expect(result).toEqual({ status: 'expired' });

		const member = db.select().from(members).where(eq(members.id, memberId)).get();
		expect(member!.emailVerifiedAt).toBeNull();
	});

	it('returns not_found for unknown or empty tokens', () => {
		expect(verifyEmailToken('', new Date(), db)).toEqual({ status: 'not_found' });
		expect(verifyEmailToken('does-not-exist', new Date(), db)).toEqual({ status: 'not_found' });
	});
});

describe('hasPendingVerificationForEmail', () => {
	beforeEach(() => {
		sqlite.exec('DELETE FROM members');
	});

	afterEach(() => {
		sqlite.exec('DELETE FROM members');
	});

	it('returns true for an applicant whose email is not yet verified', () => {
		insertApplicant('pending@example.de');
		expect(hasPendingVerificationForEmail('pending@example.de', db)).toBe(true);
	});

	it('returns false once the applicant is verified', () => {
		const memberId = insertApplicant('confirmed@example.de');
		db.update(members)
			.set({ emailVerifiedAt: new Date().toISOString() })
			.where(eq(members.id, memberId))
			.run();
		expect(hasPendingVerificationForEmail('confirmed@example.de', db)).toBe(false);
	});

	it('returns false for an email that has no membership application at all', () => {
		expect(hasPendingVerificationForEmail('noone@example.de', db)).toBe(false);
	});

	it('returns false for an empty email', () => {
		expect(hasPendingVerificationForEmail('', db)).toBe(false);
	});
});

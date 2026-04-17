import crypto from 'crypto';
import { and, eq, isNull } from 'drizzle-orm';
import { db as defaultDb } from './db/index.js';
import { emailVerificationTokens, members } from './db/schema.js';

export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

type Db = typeof defaultDb;

export function generateVerificationToken(): string {
	return crypto.randomBytes(32).toString('hex');
}

export function createEmailVerificationToken(
	memberId: number,
	now: Date = new Date(),
	db: Db = defaultDb
): { token: string; expiresAt: string } {
	const token = generateVerificationToken();
	const expiresAt = new Date(now.getTime() + TOKEN_TTL_MS).toISOString();
	db.insert(emailVerificationTokens)
		.values({ memberId, token, expiresAt })
		.run();
	return { token, expiresAt };
}

export type VerifyResult =
	| { status: 'verified'; memberId: number }
	| { status: 'already_used'; memberId: number }
	| { status: 'expired' }
	| { status: 'not_found' };

export function verifyEmailToken(
	token: string,
	now: Date = new Date(),
	db: Db = defaultDb
): VerifyResult {
	if (!token) return { status: 'not_found' };

	const row = db
		.select()
		.from(emailVerificationTokens)
		.where(eq(emailVerificationTokens.token, token))
		.get();

	if (!row) return { status: 'not_found' };

	if (row.usedAt) {
		return { status: 'already_used', memberId: row.memberId };
	}

	if (new Date(row.expiresAt) < now) {
		return { status: 'expired' };
	}

	const nowIso = now.toISOString();
	db.update(emailVerificationTokens)
		.set({ usedAt: nowIso })
		.where(eq(emailVerificationTokens.id, row.id))
		.run();
	db.update(members)
		.set({ emailVerifiedAt: nowIso })
		.where(eq(members.id, row.memberId))
		.run();

	return { status: 'verified', memberId: row.memberId };
}

export function hasPendingVerificationForEmail(
	email: string,
	db: Db = defaultDb
): boolean {
	if (!email) return false;
	const row = db
		.select({ id: members.id })
		.from(members)
		.where(and(eq(members.email, email), isNull(members.emailVerifiedAt)))
		.get();
	return !!row;
}

import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from './db/index.js';
import { passwordResets, users } from './db/schema.js';
import { createPasswordHash } from './auth.js';

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export function hashResetToken(token: string): string {
	return crypto.createHash('sha256').update(token).digest('hex');
}

export function createPasswordResetToken(userId: number): string {
	const token = crypto.randomBytes(32).toString('hex');
	const tokenHash = hashResetToken(token);
	const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();
	db.insert(passwordResets).values({ userId, tokenHash, expiresAt }).run();
	return token;
}

export type ResetTokenStatus =
	| { valid: true; userId: number; resetId: number }
	| { valid: false; reason: 'not_found' | 'expired' | 'used' };

export function validateResetToken(token: string): ResetTokenStatus {
	if (!token) return { valid: false, reason: 'not_found' };
	const tokenHash = hashResetToken(token);
	const record = db
		.select()
		.from(passwordResets)
		.where(eq(passwordResets.tokenHash, tokenHash))
		.get();
	if (!record) return { valid: false, reason: 'not_found' };
	if (record.usedAt) return { valid: false, reason: 'used' };
	if (new Date(record.expiresAt) < new Date()) return { valid: false, reason: 'expired' };
	return { valid: true, userId: record.userId, resetId: record.id };
}

export function consumeResetTokenAndSetPassword(token: string, newPassword: string): boolean {
	const status = validateResetToken(token);
	if (!status.valid) return false;
	const passwordHash = createPasswordHash(newPassword);
	db.update(users).set({ passwordHash }).where(eq(users.id, status.userId)).run();
	db.update(passwordResets)
		.set({ usedAt: new Date().toISOString() })
		.where(eq(passwordResets.id, status.resetId))
		.run();
	return true;
}

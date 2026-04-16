import { db } from './db/index.js';
import { users, sessions } from './db/schema.js';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

function hashPassword(password: string, salt: string): string {
	return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function createPasswordHash(password: string): string {
	const salt = crypto.randomBytes(16).toString('hex');
	const hash = hashPassword(password, salt);
	return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
	const [salt, hash] = stored.split(':');
	const computed = hashPassword(password, salt);
	return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'));
}

export function createSession(userId: number): string {
	const sessionId = crypto.randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
	db.insert(sessions).values({ id: sessionId, userId, expiresAt }).run();
	return sessionId;
}

export function validateSession(sessionId: string) {
	const session = db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
	if (!session) return null;

	if (new Date(session.expiresAt) < new Date()) {
		db.delete(sessions).where(eq(sessions.id, sessionId)).run();
		return null;
	}

	const user = db.select().from(users).where(eq(users.id, session.userId)).get();
	if (!user) return null;

	return { session, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
}

export function deleteSession(sessionId: string) {
	db.delete(sessions).where(eq(sessions.id, sessionId)).run();
}

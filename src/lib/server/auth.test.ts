import { describe, it, expect } from 'vitest';
import { createPasswordHash, verifyPassword } from './auth.js';

describe('createPasswordHash', () => {
	it('returns a salt:hash string', () => {
		const result = createPasswordHash('testpassword');
		expect(result).toContain(':');
		const [salt, hash] = result.split(':');
		expect(salt).toHaveLength(32); // 16 bytes hex
		expect(hash).toHaveLength(128); // 64 bytes hex
	});

	it('produces different hashes for same password (different salts)', () => {
		const hash1 = createPasswordHash('samepassword');
		const hash2 = createPasswordHash('samepassword');
		expect(hash1).not.toBe(hash2);
	});

	it('produces different hashes for different passwords', () => {
		const hash1 = createPasswordHash('password1');
		const hash2 = createPasswordHash('password2');
		const [, h1] = hash1.split(':');
		const [, h2] = hash2.split(':');
		expect(h1).not.toBe(h2);
	});
});

describe('verifyPassword', () => {
	it('returns true for correct password', () => {
		const stored = createPasswordHash('correctpassword');
		expect(verifyPassword('correctpassword', stored)).toBe(true);
	});

	it('returns false for incorrect password', () => {
		const stored = createPasswordHash('correctpassword');
		expect(verifyPassword('wrongpassword', stored)).toBe(false);
	});

	it('returns false for empty password against stored hash', () => {
		const stored = createPasswordHash('somepassword');
		expect(verifyPassword('', stored)).toBe(false);
	});

	it('handles special characters in passwords', () => {
		const password = 'p@$$w0rd!#%^&*()_+{}|:<>?';
		const stored = createPasswordHash(password);
		expect(verifyPassword(password, stored)).toBe(true);
		expect(verifyPassword('p@$$w0rd', stored)).toBe(false);
	});

	it('handles unicode passwords', () => {
		const password = 'Passwört_über_Straße';
		const stored = createPasswordHash(password);
		expect(verifyPassword(password, stored)).toBe(true);
	});
});

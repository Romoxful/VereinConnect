import { describe, it, expect } from 'vitest';
import { hashResetToken, RESET_TOKEN_TTL_MS } from './password-reset.js';

describe('hashResetToken', () => {
	it('returns a 64-char hex string (sha256)', () => {
		const hash = hashResetToken('some-random-token');
		expect(hash).toMatch(/^[0-9a-f]{64}$/);
	});

	it('produces same hash for same input', () => {
		expect(hashResetToken('abc')).toBe(hashResetToken('abc'));
	});

	it('produces different hashes for different inputs', () => {
		expect(hashResetToken('token-a')).not.toBe(hashResetToken('token-b'));
	});

	it('does not leak the raw token value', () => {
		const token = 'super-secret-token-value';
		const hash = hashResetToken(token);
		expect(hash).not.toContain(token);
	});
});

describe('RESET_TOKEN_TTL_MS', () => {
	it('is one hour', () => {
		expect(RESET_TOKEN_TTL_MS).toBe(60 * 60 * 1000);
	});
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb } from '../../../tests/db-helper.js';
import { users, members } from '../db/schema.js';
import { eq, and, ne } from 'drizzle-orm';
import { createPasswordHash, verifyPassword } from '../auth.js';

const { db, sqlite } = createTestDb();

describe('Profile self-service integration', () => {
	const initialPassword = 'originalPW123';
	let userId: number;

	beforeEach(() => {
		const hash = createPasswordHash(initialPassword);
		const res = db
			.insert(users)
			.values({
				email: 'max@foerderverein.de',
				passwordHash: hash,
				name: 'Max Müller',
				role: 'mitglied'
			})
			.run();
		userId = Number(res.lastInsertRowid);

		db.insert(members)
			.values({
				firstName: 'Max',
				lastName: 'Müller',
				email: 'max@foerderverein.de',
				phone: '+49111',
				street: 'Alte Str. 1',
				zip: '12345',
				city: 'Köln',
				memberSince: '2024-01-01'
			})
			.run();
	});

	afterEach(() => {
		sqlite.exec('DELETE FROM sessions');
		sqlite.exec('DELETE FROM members');
		sqlite.exec('DELETE FROM users');
	});

	describe('Profile update', () => {
		it('updates user name and email', () => {
			db.update(users)
				.set({ name: 'Max Mustermann', email: 'max.m@foerderverein.de' })
				.where(eq(users.id, userId))
				.run();

			const updated = db.select().from(users).where(eq(users.id, userId)).get();
			expect(updated!.name).toBe('Max Mustermann');
			expect(updated!.email).toBe('max.m@foerderverein.de');
		});

		it('updates linked member record when email matches', () => {
			const member = db
				.select()
				.from(members)
				.where(eq(members.email, 'max@foerderverein.de'))
				.get();
			expect(member).toBeDefined();

			db.update(members)
				.set({
					firstName: 'Maximilian',
					lastName: 'Mustermann',
					email: 'max.m@foerderverein.de',
					phone: '+49222',
					street: 'Neue Str. 2',
					zip: '54321',
					city: 'Bonn'
				})
				.where(eq(members.id, member!.id))
				.run();

			const updated = db.select().from(members).where(eq(members.id, member!.id)).get();
			expect(updated!.firstName).toBe('Maximilian');
			expect(updated!.city).toBe('Bonn');
			expect(updated!.phone).toBe('+49222');
		});

		it('detects email uniqueness conflicts', () => {
			db.insert(users)
				.values({
					email: 'other@foerderverein.de',
					passwordHash: createPasswordHash('pw'),
					name: 'Other',
					role: 'mitglied'
				})
				.run();

			const conflict = db
				.select()
				.from(users)
				.where(and(eq(users.email, 'other@foerderverein.de'), ne(users.id, userId)))
				.get();
			expect(conflict).toBeDefined();
		});

		it('allows user to keep their own email', () => {
			const conflict = db
				.select()
				.from(users)
				.where(and(eq(users.email, 'max@foerderverein.de'), ne(users.id, userId)))
				.get();
			expect(conflict).toBeUndefined();
		});

		it('finds no linked member when email does not match any member', () => {
			sqlite.exec('DELETE FROM members');
			const member = db
				.select()
				.from(members)
				.where(eq(members.email, 'max@foerderverein.de'))
				.get();
			expect(member).toBeUndefined();
		});
	});

	describe('Password change', () => {
		it('verifies current password before allowing change', () => {
			const user = db.select().from(users).where(eq(users.id, userId)).get()!;
			expect(verifyPassword(initialPassword, user.passwordHash)).toBe(true);
			expect(verifyPassword('wrongpassword', user.passwordHash)).toBe(false);
		});

		it('updates password hash', () => {
			const newPassword = 'brandNewPW456';
			const newHash = createPasswordHash(newPassword);

			db.update(users).set({ passwordHash: newHash }).where(eq(users.id, userId)).run();

			const updated = db.select().from(users).where(eq(users.id, userId)).get();
			expect(verifyPassword(newPassword, updated!.passwordHash)).toBe(true);
			expect(verifyPassword(initialPassword, updated!.passwordHash)).toBe(false);
		});

		it('does not affect other users passwords', () => {
			const otherHash = createPasswordHash('otherPW');
			const res = db
				.insert(users)
				.values({
					email: 'other@test.de',
					passwordHash: otherHash,
					name: 'Other',
					role: 'mitglied'
				})
				.run();
			const otherId = Number(res.lastInsertRowid);

			const newHash = createPasswordHash('newPW999');
			db.update(users).set({ passwordHash: newHash }).where(eq(users.id, userId)).run();

			const other = db.select().from(users).where(eq(users.id, otherId)).get();
			expect(verifyPassword('otherPW', other!.passwordHash)).toBe(true);
		});
	});

	describe('Access control', () => {
		it('members cannot modify other users profiles via update scoped to own id', () => {
			const otherRes = db
				.insert(users)
				.values({
					email: 'stranger@test.de',
					passwordHash: createPasswordHash('pw'),
					name: 'Stranger',
					role: 'mitglied'
				})
				.run();
			const otherId = Number(otherRes.lastInsertRowid);

			db.update(users)
				.set({ name: 'Hacked' })
				.where(eq(users.id, userId))
				.run();

			const other = db.select().from(users).where(eq(users.id, otherId)).get();
			expect(other!.name).toBe('Stranger');
		});
	});
});

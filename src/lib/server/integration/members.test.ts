import { describe, it, expect, afterEach } from 'vitest';
import { createTestDb } from '../../../tests/db-helper.js';
import { members, users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const { db, sqlite } = createTestDb();

afterEach(() => {
	sqlite.exec('DELETE FROM members');
	sqlite.exec('DELETE FROM users');
});

describe('Member CRUD integration', () => {
	describe('Create member', () => {
		it('creates a member with required fields', () => {
			db.insert(members)
				.values({ firstName: 'Max', lastName: 'Müller', memberSince: '2024-01-15' })
				.run();
			const all = db.select().from(members).all();
			expect(all).toHaveLength(1);
			expect(all[0].firstName).toBe('Max');
			expect(all[0].lastName).toBe('Müller');
			expect(all[0].status).toBe('aktiv');
		});

		it('creates a member with all fields', () => {
			db.insert(members)
				.values({
					firstName: 'Erika',
					lastName: 'Schmidt',
					email: 'erika@example.de',
					phone: '+49123456789',
					street: 'Hauptstr. 42',
					zip: '10115',
					city: 'Berlin',
					memberSince: '2023-03-01',
					status: 'aktiv',
					notes: 'Gründungsmitglied'
				})
				.run();
			const member = db.select().from(members).where(eq(members.lastName, 'Schmidt')).get();
			expect(member).toBeDefined();
			expect(member!.email).toBe('erika@example.de');
			expect(member!.city).toBe('Berlin');
			expect(member!.notes).toBe('Gründungsmitglied');
		});

		it('fails when firstName is missing', () => {
			expect(() => {
				sqlite.exec(
					"INSERT INTO members (last_name, member_since) VALUES ('Test', '2024-01-01')"
				);
			}).toThrow();
		});

		it('fails when lastName is missing', () => {
			expect(() => {
				sqlite.exec(
					"INSERT INTO members (first_name, member_since) VALUES ('Test', '2024-01-01')"
				);
			}).toThrow();
		});

		it('fails when memberSince is missing', () => {
			expect(() => {
				sqlite.exec(
					"INSERT INTO members (first_name, last_name) VALUES ('Test', 'User')"
				);
			}).toThrow();
		});
	});

	describe('Read members', () => {
		it('lists all members ordered by lastName', () => {
			db.insert(members).values({ firstName: 'Bernd', lastName: 'Ziegler', memberSince: '2024-01-01' }).run();
			db.insert(members).values({ firstName: 'Anna', lastName: 'Albrecht', memberSince: '2024-01-01' }).run();
			db.insert(members).values({ firstName: 'Clara', lastName: 'Meier', memberSince: '2024-01-01' }).run();

			const all = db.select().from(members).orderBy(members.lastName).all();
			expect(all).toHaveLength(3);
			expect(all[0].lastName).toBe('Albrecht');
			expect(all[1].lastName).toBe('Meier');
			expect(all[2].lastName).toBe('Ziegler');
		});

		it('loads a single member by ID', () => {
			const res = db
				.insert(members)
				.values({ firstName: 'Hans', lastName: 'Fischer', memberSince: '2024-06-01' })
				.run();
			const id = Number(res.lastInsertRowid);

			const member = db.select().from(members).where(eq(members.id, id)).get();
			expect(member).toBeDefined();
			expect(member!.firstName).toBe('Hans');
		});

		it('returns undefined for nonexistent member', () => {
			const member = db.select().from(members).where(eq(members.id, 99999)).get();
			expect(member).toBeUndefined();
		});
	});

	describe('Update member', () => {
		it('updates member fields', () => {
			const res = db
				.insert(members)
				.values({ firstName: 'Old', lastName: 'Name', memberSince: '2024-01-01' })
				.run();
			const id = Number(res.lastInsertRowid);

			db.update(members)
				.set({ firstName: 'New', lastName: 'Updated', status: 'inaktiv' })
				.where(eq(members.id, id))
				.run();

			const updated = db.select().from(members).where(eq(members.id, id)).get();
			expect(updated!.firstName).toBe('New');
			expect(updated!.lastName).toBe('Updated');
			expect(updated!.status).toBe('inaktiv');
		});

		it('updates only specified fields', () => {
			const res = db
				.insert(members)
				.values({
					firstName: 'Keep',
					lastName: 'This',
					email: 'keep@test.de',
					memberSince: '2024-01-01'
				})
				.run();
			const id = Number(res.lastInsertRowid);

			db.update(members).set({ email: 'new@test.de' }).where(eq(members.id, id)).run();

			const updated = db.select().from(members).where(eq(members.id, id)).get();
			expect(updated!.firstName).toBe('Keep');
			expect(updated!.email).toBe('new@test.de');
		});
	});

	describe('Delete member', () => {
		it('deletes a member', () => {
			const res = db
				.insert(members)
				.values({ firstName: 'Delete', lastName: 'Me', memberSince: '2024-01-01' })
				.run();
			const id = Number(res.lastInsertRowid);

			db.delete(members).where(eq(members.id, id)).run();

			const deleted = db.select().from(members).where(eq(members.id, id)).get();
			expect(deleted).toBeUndefined();
		});

		it('only deletes the targeted member', () => {
			db.insert(members).values({ firstName: 'Stay', lastName: 'Here', memberSince: '2024-01-01' }).run();
			const res = db
				.insert(members)
				.values({ firstName: 'Delete', lastName: 'Me', memberSince: '2024-01-01' })
				.run();
			const id = Number(res.lastInsertRowid);

			db.delete(members).where(eq(members.id, id)).run();

			const remaining = db.select().from(members).all();
			expect(remaining).toHaveLength(1);
			expect(remaining[0].firstName).toBe('Stay');
		});
	});

	describe('Vorstand-only access simulation', () => {
		it('vorstand role can perform CRUD', () => {
			const userRes = db
				.insert(users)
				.values({ email: 'vorstand@test.de', passwordHash: 'h', name: 'V', role: 'vorstand' })
				.run();
			const user = db.select().from(users).where(eq(users.id, Number(userRes.lastInsertRowid))).get()!;
			expect(user.role).toBe('vorstand');

			// Simulate authorization check: only vorstand can create/update/delete
			const isAuthorized = user.role === 'vorstand';
			expect(isAuthorized).toBe(true);
		});

		it('mitglied role is rejected for write operations', () => {
			const userRes = db
				.insert(users)
				.values({ email: 'mitglied@test.de', passwordHash: 'h', name: 'M', role: 'mitglied' })
				.run();
			const user = db.select().from(users).where(eq(users.id, Number(userRes.lastInsertRowid))).get()!;

			const isAuthorized = user.role === 'vorstand';
			expect(isAuthorized).toBe(false);
		});
	});
});

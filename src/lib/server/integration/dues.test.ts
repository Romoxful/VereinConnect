import { describe, it, expect, afterEach } from 'vitest';
import { createTestDb } from '../../../tests/db-helper.js';
import { dues, members } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';

const { db, sqlite } = createTestDb();

function createMember(firstName = 'Max', lastName = 'Müller') {
	const res = db
		.insert(members)
		.values({ firstName, lastName, memberSince: '2024-01-15' })
		.run();
	return Number(res.lastInsertRowid);
}

afterEach(() => {
	sqlite.exec('DELETE FROM dues');
	sqlite.exec('DELETE FROM members');
});

describe('Dues integration', () => {
	describe('Create due', () => {
		it('creates a due with required fields', () => {
			const memberId = createMember();
			db.insert(dues)
				.values({ memberId, amount: '50.00', dueDate: '2026-01-01', year: 2026 })
				.run();
			const all = db.select().from(dues).all();
			expect(all).toHaveLength(1);
			expect(all[0].amount).toBe('50.00');
			expect(all[0].status).toBe('offen');
			expect(all[0].year).toBe(2026);
		});

		it('creates a due with all fields', () => {
			const memberId = createMember();
			db.insert(dues)
				.values({
					memberId,
					amount: '100.00',
					dueDate: '2026-03-01',
					paidDate: '2026-03-15',
					status: 'bezahlt',
					year: 2026,
					notes: 'Per Überweisung'
				})
				.run();
			const due = db.select().from(dues).get();
			expect(due).toBeDefined();
			expect(due!.paidDate).toBe('2026-03-15');
			expect(due!.status).toBe('bezahlt');
			expect(due!.notes).toBe('Per Überweisung');
		});

		it('rejects invalid status', () => {
			const memberId = createMember();
			expect(() => {
				sqlite.exec(
					`INSERT INTO dues (member_id, amount, due_date, status, year) VALUES (${memberId}, '50', '2026-01-01', 'invalid', 2026)`
				);
			}).toThrow();
		});

		it('rejects missing member_id', () => {
			expect(() => {
				sqlite.exec(
					"INSERT INTO dues (amount, due_date, year) VALUES ('50', '2026-01-01', 2026)"
				);
			}).toThrow();
		});

		it('rejects non-existent member (FK constraint)', () => {
			expect(() => {
				sqlite.exec(
					"INSERT INTO dues (member_id, amount, due_date, year) VALUES (99999, '50', '2026-01-01', 2026)"
				);
			}).toThrow();
		});
	});

	describe('Read dues', () => {
		it('lists dues ordered by year descending', () => {
			const memberId = createMember();
			db.insert(dues).values({ memberId, amount: '50', dueDate: '2024-01-01', year: 2024 }).run();
			db.insert(dues).values({ memberId, amount: '50', dueDate: '2026-01-01', year: 2026 }).run();
			db.insert(dues).values({ memberId, amount: '50', dueDate: '2025-01-01', year: 2025 }).run();

			const all = db.select().from(dues).orderBy(desc(dues.year)).all();
			expect(all).toHaveLength(3);
			expect(all[0].year).toBe(2026);
			expect(all[1].year).toBe(2025);
			expect(all[2].year).toBe(2024);
		});

		it('filters dues by status', () => {
			const memberId = createMember();
			db.insert(dues).values({ memberId, amount: '50', dueDate: '2026-01-01', year: 2026, status: 'offen' }).run();
			db.insert(dues).values({ memberId, amount: '50', dueDate: '2026-01-01', year: 2026, status: 'bezahlt' }).run();

			const open = db.select().from(dues).where(eq(dues.status, 'offen')).all();
			expect(open).toHaveLength(1);
			expect(open[0].status).toBe('offen');
		});

		it('filters dues by member', () => {
			const member1 = createMember('Anna', 'Schmidt');
			const member2 = createMember('Bernd', 'Meier');
			db.insert(dues).values({ memberId: member1, amount: '50', dueDate: '2026-01-01', year: 2026 }).run();
			db.insert(dues).values({ memberId: member2, amount: '50', dueDate: '2026-01-01', year: 2026 }).run();

			const filtered = db.select().from(dues).where(eq(dues.memberId, member1)).all();
			expect(filtered).toHaveLength(1);
		});

		it('filters dues by year', () => {
			const memberId = createMember();
			db.insert(dues).values({ memberId, amount: '50', dueDate: '2025-01-01', year: 2025 }).run();
			db.insert(dues).values({ memberId, amount: '50', dueDate: '2026-01-01', year: 2026 }).run();

			const filtered = db.select().from(dues).where(eq(dues.year, 2026)).all();
			expect(filtered).toHaveLength(1);
			expect(filtered[0].year).toBe(2026);
		});
	});

	describe('Update due', () => {
		it('marks a due as paid', () => {
			const memberId = createMember();
			const res = db
				.insert(dues)
				.values({ memberId, amount: '50', dueDate: '2026-01-01', year: 2026 })
				.run();
			const id = Number(res.lastInsertRowid);

			db.update(dues)
				.set({ status: 'bezahlt', paidDate: '2026-02-15' })
				.where(eq(dues.id, id))
				.run();

			const updated = db.select().from(dues).where(eq(dues.id, id)).get();
			expect(updated!.status).toBe('bezahlt');
			expect(updated!.paidDate).toBe('2026-02-15');
		});

		it('updates amount and notes', () => {
			const memberId = createMember();
			const res = db
				.insert(dues)
				.values({ memberId, amount: '50', dueDate: '2026-01-01', year: 2026 })
				.run();
			const id = Number(res.lastInsertRowid);

			db.update(dues)
				.set({ amount: '75.00', notes: 'Erhöhung beschlossen' })
				.where(eq(dues.id, id))
				.run();

			const updated = db.select().from(dues).where(eq(dues.id, id)).get();
			expect(updated!.amount).toBe('75.00');
			expect(updated!.notes).toBe('Erhöhung beschlossen');
		});
	});

	describe('Delete due', () => {
		it('deletes a due', () => {
			const memberId = createMember();
			const res = db
				.insert(dues)
				.values({ memberId, amount: '50', dueDate: '2026-01-01', year: 2026 })
				.run();
			const id = Number(res.lastInsertRowid);

			db.delete(dues).where(eq(dues.id, id)).run();

			const deleted = db.select().from(dues).where(eq(dues.id, id)).get();
			expect(deleted).toBeUndefined();
		});

		it('cascade-deletes dues when member is deleted', () => {
			const memberId = createMember();
			db.insert(dues).values({ memberId, amount: '50', dueDate: '2026-01-01', year: 2026 }).run();
			db.insert(dues).values({ memberId, amount: '50', dueDate: '2025-01-01', year: 2025 }).run();

			db.delete(members).where(eq(members.id, memberId)).run();

			const remaining = db.select().from(dues).all();
			expect(remaining).toHaveLength(0);
		});
	});
});

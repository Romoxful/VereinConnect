import { describe, it, expect, afterEach } from 'vitest';
import { createTestDb } from '../../../tests/db-helper.js';
import { consents, members } from '../db/schema.js';
import { eq, and, isNull } from 'drizzle-orm';

const { db, sqlite } = createTestDb();

function createMember(firstName = 'Max', lastName = 'Müller') {
	const res = db
		.insert(members)
		.values({ firstName, lastName, memberSince: '2024-01-15' })
		.run();
	return Number(res.lastInsertRowid);
}

afterEach(() => {
	sqlite.exec('DELETE FROM consents');
	sqlite.exec('DELETE FROM members');
});

describe('Consent tracking (DSGVO)', () => {
	describe('Grant consent', () => {
		it('creates a datenverarbeitung consent', () => {
			const memberId = createMember();
			db.insert(consents)
				.values({ memberId, consentType: 'datenverarbeitung' })
				.run();
			const all = db.select().from(consents).all();
			expect(all).toHaveLength(1);
			expect(all[0].consentType).toBe('datenverarbeitung');
			expect(all[0].withdrawnAt).toBeNull();
		});

		it('creates a newsletter consent', () => {
			const memberId = createMember();
			db.insert(consents)
				.values({ memberId, consentType: 'newsletter' })
				.run();
			const c = db.select().from(consents).get();
			expect(c!.consentType).toBe('newsletter');
		});

		it('creates a foto_freigabe consent', () => {
			const memberId = createMember();
			db.insert(consents)
				.values({ memberId, consentType: 'foto_freigabe' })
				.run();
			const c = db.select().from(consents).get();
			expect(c!.consentType).toBe('foto_freigabe');
		});

		it('rejects invalid consent type', () => {
			const memberId = createMember();
			expect(() => {
				sqlite.exec(
					`INSERT INTO consents (member_id, consent_type) VALUES (${memberId}, 'invalid_type')`
				);
			}).toThrow();
		});

		it('allows multiple consent types per member', () => {
			const memberId = createMember();
			db.insert(consents).values({ memberId, consentType: 'datenverarbeitung' }).run();
			db.insert(consents).values({ memberId, consentType: 'newsletter' }).run();
			db.insert(consents).values({ memberId, consentType: 'foto_freigabe' }).run();

			const all = db.select().from(consents).where(eq(consents.memberId, memberId)).all();
			expect(all).toHaveLength(3);
		});
	});

	describe('Withdraw consent', () => {
		it('withdraws a consent by setting withdrawnAt', () => {
			const memberId = createMember();
			const res = db
				.insert(consents)
				.values({ memberId, consentType: 'newsletter' })
				.run();
			const id = Number(res.lastInsertRowid);
			const now = new Date().toISOString();

			db.update(consents)
				.set({ withdrawnAt: now })
				.where(eq(consents.id, id))
				.run();

			const updated = db.select().from(consents).where(eq(consents.id, id)).get();
			expect(updated!.withdrawnAt).toBe(now);
		});

		it('active consent query excludes withdrawn consents', () => {
			const memberId = createMember();
			// Active consent
			db.insert(consents).values({ memberId, consentType: 'datenverarbeitung' }).run();
			// Withdrawn consent
			db.insert(consents).values({ memberId, consentType: 'newsletter', givenAt: '2025-01-01', withdrawnAt: '2025-06-01' }).run();

			const active = db
				.select()
				.from(consents)
				.where(and(eq(consents.memberId, memberId), isNull(consents.withdrawnAt)))
				.all();
			expect(active).toHaveLength(1);
			expect(active[0].consentType).toBe('datenverarbeitung');
		});
	});

	describe('Cascade delete', () => {
		it('deletes consents when member is deleted', () => {
			const memberId = createMember();
			db.insert(consents).values({ memberId, consentType: 'datenverarbeitung' }).run();
			db.insert(consents).values({ memberId, consentType: 'newsletter' }).run();

			db.delete(members).where(eq(members.id, memberId)).run();

			const remaining = db.select().from(consents).all();
			expect(remaining).toHaveLength(0);
		});
	});

	describe('GDPR data export', () => {
		it('exports all member data including consents', () => {
			const memberId = createMember('Erika', 'Schmidt');
			db.insert(consents).values({ memberId, consentType: 'datenverarbeitung' }).run();
			db.insert(consents).values({ memberId, consentType: 'foto_freigabe' }).run();

			const member = db.select().from(members).where(eq(members.id, memberId)).get();
			const memberConsents = db.select().from(consents).where(eq(consents.memberId, memberId)).all();

			const exportData = {
				exportDate: new Date().toISOString(),
				member,
				consents: memberConsents
			};

			expect(exportData.member).toBeDefined();
			expect(exportData.member!.firstName).toBe('Erika');
			expect(exportData.consents).toHaveLength(2);
		});
	});

	describe('GDPR data deletion (Art. 17)', () => {
		it('completely removes member and all associated data', () => {
			const memberId = createMember('Delete', 'Me');
			db.insert(consents).values({ memberId, consentType: 'datenverarbeitung' }).run();

			// Simulate Art. 17 deletion
			db.delete(consents).where(eq(consents.memberId, memberId)).run();
			db.delete(members).where(eq(members.id, memberId)).run();

			const member = db.select().from(members).where(eq(members.id, memberId)).get();
			const remaining = db.select().from(consents).where(eq(consents.memberId, memberId)).all();

			expect(member).toBeUndefined();
			expect(remaining).toHaveLength(0);
		});
	});
});

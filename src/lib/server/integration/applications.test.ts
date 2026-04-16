import { describe, it, expect, afterEach } from 'vitest';
import { createTestDb } from '../../../tests/db-helper.js';
import { members, consents } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const { db, sqlite } = createTestDb();

afterEach(() => {
	sqlite.exec('DELETE FROM consents');
	sqlite.exec('DELETE FROM members');
});

describe('Membership application workflow', () => {
	it('creates a member with status "beantragt" and a datenverarbeitung consent', () => {
		const res = db
			.insert(members)
			.values({
				firstName: 'Neu',
				lastName: 'Antragsteller',
				email: 'neu@example.de',
				birthDate: '1990-05-12',
				profession: 'Mechaniker',
				memberSince: '2026-04-16',
				status: 'beantragt',
				notes: 'Freue mich mitzuwirken.'
			})
			.returning({ id: members.id })
			.get();

		db.insert(consents)
			.values({ memberId: res.id, consentType: 'datenverarbeitung' })
			.run();

		const applicant = db.select().from(members).where(eq(members.id, res.id)).get();
		expect(applicant).toBeDefined();
		expect(applicant!.status).toBe('beantragt');
		expect(applicant!.birthDate).toBe('1990-05-12');
		expect(applicant!.profession).toBe('Mechaniker');

		const c = db.select().from(consents).where(eq(consents.memberId, res.id)).all();
		expect(c).toHaveLength(1);
		expect(c[0].consentType).toBe('datenverarbeitung');
	});

	it('accepting an application changes status to "aktiv"', () => {
		const res = db
			.insert(members)
			.values({
				firstName: 'Accept',
				lastName: 'Me',
				email: 'accept@example.de',
				memberSince: '2026-04-16',
				status: 'beantragt'
			})
			.returning({ id: members.id })
			.get();

		db.update(members).set({ status: 'aktiv' }).where(eq(members.id, res.id)).run();

		const updated = db.select().from(members).where(eq(members.id, res.id)).get();
		expect(updated!.status).toBe('aktiv');
	});

	it('rejecting an application sets status to "abgelehnt"', () => {
		const res = db
			.insert(members)
			.values({
				firstName: 'Reject',
				lastName: 'Me',
				email: 'reject@example.de',
				memberSince: '2026-04-16',
				status: 'beantragt'
			})
			.returning({ id: members.id })
			.get();

		db.update(members).set({ status: 'abgelehnt' }).where(eq(members.id, res.id)).run();

		const updated = db.select().from(members).where(eq(members.id, res.id)).get();
		expect(updated!.status).toBe('abgelehnt');
	});

	it('rejects invalid status values via CHECK constraint', () => {
		expect(() => {
			sqlite.exec(
				"INSERT INTO members (first_name, last_name, member_since, status) VALUES ('X', 'Y', '2026-04-16', 'invalid_status')"
			);
		}).toThrow();
	});
});

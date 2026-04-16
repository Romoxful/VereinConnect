import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb } from '../../../tests/db-helper.js';
import { users, events, rsvps } from '../db/schema.js';
import { eq, and, sql } from 'drizzle-orm';

const { db, sqlite } = createTestDb();

let vorstandId: number;
let mitgliedId: number;

beforeEach(() => {
	const vRes = db
		.insert(users)
		.values({ email: 'vorstand@test.de', passwordHash: 'h', name: 'Vorstand User', role: 'vorstand' })
		.run();
	vorstandId = Number(vRes.lastInsertRowid);

	const mRes = db
		.insert(users)
		.values({ email: 'mitglied@test.de', passwordHash: 'h', name: 'Mitglied User', role: 'mitglied' })
		.run();
	mitgliedId = Number(mRes.lastInsertRowid);
});

afterEach(() => {
	sqlite.exec('DELETE FROM rsvps');
	sqlite.exec('DELETE FROM events');
	sqlite.exec('DELETE FROM users');
});

describe('Event creation integration', () => {
	it('creates an event with required fields', () => {
		db.insert(events)
			.values({ title: 'Jahreshauptversammlung', date: '2025-03-15', createdBy: vorstandId })
			.run();

		const all = db.select().from(events).all();
		expect(all).toHaveLength(1);
		expect(all[0].title).toBe('Jahreshauptversammlung');
		expect(all[0].createdBy).toBe(vorstandId);
	});

	it('creates an event with all optional fields', () => {
		db.insert(events)
			.values({
				title: 'Sommerfest',
				description: 'Jährliches Sommerfest im Park',
				location: 'Stadtpark',
				date: '2025-07-20',
				time: '14:00',
				createdBy: vorstandId
			})
			.run();

		const event = db.select().from(events).where(eq(events.title, 'Sommerfest')).get();
		expect(event!.description).toBe('Jährliches Sommerfest im Park');
		expect(event!.location).toBe('Stadtpark');
		expect(event!.time).toBe('14:00');
	});

	it('fails without title', () => {
		expect(() => {
			sqlite.exec("INSERT INTO events (date) VALUES ('2025-01-01')");
		}).toThrow();
	});

	it('fails without date', () => {
		expect(() => {
			sqlite.exec("INSERT INTO events (title) VALUES ('No Date')");
		}).toThrow();
	});

	it('lists events ordered by date descending', () => {
		db.insert(events).values({ title: 'Old', date: '2024-01-01' }).run();
		db.insert(events).values({ title: 'New', date: '2025-12-01' }).run();
		db.insert(events).values({ title: 'Middle', date: '2025-06-01' }).run();

		const all = db
			.select()
			.from(events)
			.orderBy(sql`${events.date} DESC`)
			.all();
		expect(all[0].title).toBe('New');
		expect(all[1].title).toBe('Middle');
		expect(all[2].title).toBe('Old');
	});
});

describe('RSVP integration', () => {
	let eventId: number;

	beforeEach(() => {
		const res = db
			.insert(events)
			.values({ title: 'RSVP Test Event', date: '2025-09-01', createdBy: vorstandId })
			.run();
		eventId = Number(res.lastInsertRowid);
	});

	it('creates an RSVP with zugesagt status', () => {
		db.insert(rsvps).values({ eventId, userId: mitgliedId, status: 'zugesagt' }).run();
		const rsvp = db.select().from(rsvps).all();
		expect(rsvp).toHaveLength(1);
		expect(rsvp[0].status).toBe('zugesagt');
	});

	it('creates an RSVP with abgesagt status', () => {
		db.insert(rsvps).values({ eventId, userId: mitgliedId, status: 'abgesagt' }).run();
		const rsvp = db.select().from(rsvps).all();
		expect(rsvp[0].status).toBe('abgesagt');
	});

	it('creates an RSVP with vielleicht status', () => {
		db.insert(rsvps).values({ eventId, userId: mitgliedId, status: 'vielleicht' }).run();
		const rsvp = db.select().from(rsvps).all();
		expect(rsvp[0].status).toBe('vielleicht');
	});

	it('updates existing RSVP (simulates re-RSVP)', () => {
		db.insert(rsvps).values({ eventId, userId: mitgliedId, status: 'zugesagt' }).run();

		// Simulate the RSVP update logic from the route handler
		const existing = db
			.select()
			.from(rsvps)
			.where(and(eq(rsvps.eventId, eventId), eq(rsvps.userId, mitgliedId)))
			.get();

		expect(existing).toBeDefined();

		db.update(rsvps).set({ status: 'abgesagt' }).where(eq(rsvps.id, existing!.id)).run();

		const updated = db.select().from(rsvps).where(eq(rsvps.id, existing!.id)).get();
		expect(updated!.status).toBe('abgesagt');
	});

	it('counts zugesagt RSVPs for an event', () => {
		db.insert(rsvps).values({ eventId, userId: vorstandId, status: 'zugesagt' }).run();
		db.insert(rsvps).values({ eventId, userId: mitgliedId, status: 'abgesagt' }).run();

		// Count zugesagt directly
		const zugesagtCount = db
			.select()
			.from(rsvps)
			.where(and(eq(rsvps.eventId, eventId), eq(rsvps.status, 'zugesagt')))
			.all();

		expect(zugesagtCount).toHaveLength(1);

		// Also verify total RSVPs
		const allRsvps = db.select().from(rsvps).where(eq(rsvps.eventId, eventId)).all();
		expect(allRsvps).toHaveLength(2);
	});

	it('loads RSVPs with user names (join)', () => {
		db.insert(rsvps).values({ eventId, userId: vorstandId, status: 'zugesagt' }).run();
		db.insert(rsvps).values({ eventId, userId: mitgliedId, status: 'vielleicht' }).run();

		const eventRsvps = db
			.select({
				id: rsvps.id,
				status: rsvps.status,
				userName: users.name,
				userId: rsvps.userId
			})
			.from(rsvps)
			.innerJoin(users, eq(rsvps.userId, users.id))
			.where(eq(rsvps.eventId, eventId))
			.all();

		expect(eventRsvps).toHaveLength(2);
		const names = eventRsvps.map((r) => r.userName);
		expect(names).toContain('Vorstand User');
		expect(names).toContain('Mitglied User');
	});

	it('finds current user RSVP for an event', () => {
		db.insert(rsvps).values({ eventId, userId: mitgliedId, status: 'zugesagt' }).run();

		const eventRsvps = db
			.select({ userId: rsvps.userId, status: rsvps.status })
			.from(rsvps)
			.where(eq(rsvps.eventId, eventId))
			.all();

		const myRsvp = eventRsvps.find((r) => r.userId === mitgliedId);
		expect(myRsvp).toBeDefined();
		expect(myRsvp!.status).toBe('zugesagt');

		const otherRsvp = eventRsvps.find((r) => r.userId === vorstandId);
		expect(otherRsvp).toBeUndefined();
	});

	it('loads events with per-user RSVP status (calendar query)', () => {
		db.insert(rsvps).values({ eventId, userId: mitgliedId, status: 'vielleicht' }).run();

		const userId = mitgliedId;
		const rows = db
			.select({
				id: events.id,
				title: events.title,
				date: events.date,
				myRsvpStatus: sql<
					'zugesagt' | 'abgesagt' | 'vielleicht' | null
				>`(SELECT status FROM rsvps WHERE rsvps.event_id = events.id AND rsvps.user_id = ${userId} LIMIT 1)`
			})
			.from(events)
			.all();

		expect(rows).toHaveLength(1);
		expect(rows[0].myRsvpStatus).toBe('vielleicht');

		const otherUserRows = db
			.select({
				id: events.id,
				myRsvpStatus: sql<
					'zugesagt' | 'abgesagt' | 'vielleicht' | null
				>`(SELECT status FROM rsvps WHERE rsvps.event_id = events.id AND rsvps.user_id = ${vorstandId} LIMIT 1)`
			})
			.from(events)
			.all();
		expect(otherUserRows[0].myRsvpStatus).toBeNull();
	});

	it('deleting event cascades to RSVPs', () => {
		db.insert(rsvps).values({ eventId, userId: mitgliedId, status: 'zugesagt' }).run();
		db.insert(rsvps).values({ eventId, userId: vorstandId, status: 'zugesagt' }).run();

		db.delete(events).where(eq(events.id, eventId)).run();

		const remaining = db.select().from(rsvps).all();
		expect(remaining).toHaveLength(0);
	});

	it('vorstand can delete event', () => {
		const user = db.select().from(users).where(eq(users.id, vorstandId)).get()!;
		expect(user.role).toBe('vorstand');

		db.delete(events).where(eq(events.id, eventId)).run();
		const event = db.select().from(events).where(eq(events.id, eventId)).get();
		expect(event).toBeUndefined();
	});
});

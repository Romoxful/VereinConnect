import { describe, it, expect, afterEach } from 'vitest';
import { createTestDb } from '../../../tests/db-helper.js';
import { users, sessions, members, events, rsvps, documents, protocols, tasks } from './schema.js';
import { eq } from 'drizzle-orm';

const { db, sqlite } = createTestDb();

afterEach(() => {
	sqlite.exec('DELETE FROM tasks');
	sqlite.exec('DELETE FROM protocols');
	sqlite.exec('DELETE FROM documents');
	sqlite.exec('DELETE FROM rsvps');
	sqlite.exec('DELETE FROM sessions');
	sqlite.exec('DELETE FROM events');
	sqlite.exec('DELETE FROM members');
	sqlite.exec('DELETE FROM users');
});

describe('users table', () => {
	it('inserts a user with all fields', () => {
		db.insert(users)
			.values({ email: 'test@test.de', passwordHash: 'hash', name: 'Test', role: 'vorstand' })
			.run();
		const user = db.select().from(users).where(eq(users.email, 'test@test.de')).get();
		expect(user).toBeDefined();
		expect(user!.name).toBe('Test');
		expect(user!.role).toBe('vorstand');
	});

	it('defaults role to mitglied', () => {
		db.insert(users)
			.values({ email: 'default@test.de', passwordHash: 'hash', name: 'Default' })
			.run();
		const user = db.select().from(users).where(eq(users.email, 'default@test.de')).get();
		expect(user!.role).toBe('mitglied');
	});

	it('enforces unique email constraint', () => {
		db.insert(users)
			.values({ email: 'dup@test.de', passwordHash: 'hash', name: 'First' })
			.run();
		expect(() => {
			db.insert(users)
				.values({ email: 'dup@test.de', passwordHash: 'hash2', name: 'Second' })
				.run();
		}).toThrow();
	});

	it('rejects invalid role', () => {
		expect(() => {
			sqlite.exec(
				"INSERT INTO users (email, password_hash, name, role) VALUES ('bad@test.de', 'hash', 'Bad', 'admin')"
			);
		}).toThrow();
	});

	it('auto-increments id', () => {
		db.insert(users).values({ email: 'a@test.de', passwordHash: 'h', name: 'A' }).run();
		db.insert(users).values({ email: 'b@test.de', passwordHash: 'h', name: 'B' }).run();
		const all = db.select().from(users).all();
		expect(all[1].id).toBeGreaterThan(all[0].id);
	});
});

describe('sessions table', () => {
	it('creates a session linked to a user', () => {
		const res = db.insert(users).values({ email: 'u@test.de', passwordHash: 'h', name: 'U' }).run();
		const userId = Number(res.lastInsertRowid);
		db.insert(sessions).values({ id: 'sess-1', userId, expiresAt: '2099-01-01T00:00:00Z' }).run();
		const session = db.select().from(sessions).where(eq(sessions.id, 'sess-1')).get();
		expect(session).toBeDefined();
		expect(session!.userId).toBe(userId);
	});

	it('cascades delete when user is deleted', () => {
		const res = db.insert(users).values({ email: 'cascade@test.de', passwordHash: 'h', name: 'C' }).run();
		const userId = Number(res.lastInsertRowid);
		db.insert(sessions).values({ id: 'sess-cascade', userId, expiresAt: '2099-01-01T00:00:00Z' }).run();
		db.delete(users).where(eq(users.id, userId)).run();
		const session = db.select().from(sessions).where(eq(sessions.id, 'sess-cascade')).get();
		expect(session).toBeUndefined();
	});

	it('rejects session with nonexistent user', () => {
		expect(() => {
			db.insert(sessions).values({ id: 'orphan', userId: 99999, expiresAt: '2099-01-01' }).run();
		}).toThrow();
	});
});

describe('members table', () => {
	it('inserts a member with required fields', () => {
		db.insert(members)
			.values({ firstName: 'Max', lastName: 'Mustermann', memberSince: '2024-01-01' })
			.run();
		const member = db.select().from(members).all();
		expect(member).toHaveLength(1);
		expect(member[0].firstName).toBe('Max');
		expect(member[0].status).toBe('aktiv');
	});

	it('inserts a member with all optional fields', () => {
		db.insert(members)
			.values({
				firstName: 'Erika',
				lastName: 'Musterfrau',
				email: 'erika@test.de',
				phone: '+491234567',
				street: 'Musterstr. 1',
				zip: '12345',
				city: 'Berlin',
				memberSince: '2023-06-15',
				status: 'inaktiv',
				notes: 'Some notes'
			})
			.run();
		const member = db.select().from(members).where(eq(members.lastName, 'Musterfrau')).get();
		expect(member!.email).toBe('erika@test.de');
		expect(member!.city).toBe('Berlin');
		expect(member!.status).toBe('inaktiv');
	});

	it('rejects invalid status', () => {
		expect(() => {
			sqlite.exec(
				"INSERT INTO members (first_name, last_name, member_since, status) VALUES ('X', 'Y', '2024-01-01', 'deleted')"
			);
		}).toThrow();
	});
});

describe('events table', () => {
	it('inserts an event with required fields', () => {
		db.insert(events).values({ title: 'Sommerfest', date: '2025-07-20' }).run();
		const event = db.select().from(events).all();
		expect(event).toHaveLength(1);
		expect(event[0].title).toBe('Sommerfest');
	});

	it('links event to creating user', () => {
		const res = db.insert(users).values({ email: 'creator@test.de', passwordHash: 'h', name: 'Creator' }).run();
		const userId = Number(res.lastInsertRowid);
		db.insert(events).values({ title: 'Treffen', date: '2025-08-01', createdBy: userId }).run();
		const event = db.select().from(events).where(eq(events.title, 'Treffen')).get();
		expect(event!.createdBy).toBe(userId);
	});
});

describe('rsvps table', () => {
	let userId: number;
	let eventId: number;

	function setupUserAndEvent() {
		const uRes = db.insert(users).values({ email: 'rsvp@test.de', passwordHash: 'h', name: 'Rsvp' }).run();
		userId = Number(uRes.lastInsertRowid);
		const eRes = db.insert(events).values({ title: 'Party', date: '2025-12-31' }).run();
		eventId = Number(eRes.lastInsertRowid);
	}

	it('creates an RSVP', () => {
		setupUserAndEvent();
		db.insert(rsvps).values({ eventId, userId, status: 'zugesagt' }).run();
		const rsvp = db.select().from(rsvps).all();
		expect(rsvp).toHaveLength(1);
		expect(rsvp[0].status).toBe('zugesagt');
	});

	it('defaults status to zugesagt', () => {
		setupUserAndEvent();
		db.insert(rsvps).values({ eventId, userId }).run();
		const rsvp = db.select().from(rsvps).all();
		expect(rsvp[0].status).toBe('zugesagt');
	});

	it('rejects invalid RSVP status', () => {
		setupUserAndEvent();
		expect(() => {
			sqlite.exec(
				`INSERT INTO rsvps (event_id, user_id, status) VALUES (${eventId}, ${userId}, 'maybe')`
			);
		}).toThrow();
	});

	it('cascades delete when event is deleted', () => {
		setupUserAndEvent();
		db.insert(rsvps).values({ eventId, userId }).run();
		db.delete(events).where(eq(events.id, eventId)).run();
		const remaining = db.select().from(rsvps).all();
		expect(remaining).toHaveLength(0);
	});

	it('cascades delete when user is deleted', () => {
		setupUserAndEvent();
		db.insert(rsvps).values({ eventId, userId }).run();
		db.delete(users).where(eq(users.id, userId)).run();
		const remaining = db.select().from(rsvps).all();
		expect(remaining).toHaveLength(0);
	});
});

describe('documents table', () => {
	it('inserts a document with required fields', () => {
		db.insert(documents)
			.values({ title: 'Satzung', filename: 'abc.pdf', originalName: 'satzung.pdf', category: 'satzung' })
			.run();
		const all = db.select().from(documents).all();
		expect(all).toHaveLength(1);
		expect(all[0].title).toBe('Satzung');
	});

	it('defaults category to sonstiges', () => {
		db.insert(documents)
			.values({ title: 'Doc', filename: 'f.pdf', originalName: 'f.pdf' })
			.run();
		const doc = db.select().from(documents).all();
		expect(doc[0].category).toBe('sonstiges');
	});

	it('rejects invalid category', () => {
		expect(() => {
			sqlite.exec(
				"INSERT INTO documents (title, filename, original_name, category) VALUES ('X', 'f', 'f', 'invalid')"
			);
		}).toThrow();
	});
});

describe('protocols table', () => {
	it('inserts a protocol with required fields', () => {
		db.insert(protocols)
			.values({ title: 'Sitzung', date: '2025-01-01', attendees: 'A, B', content: 'Notes' })
			.run();
		const all = db.select().from(protocols).all();
		expect(all).toHaveLength(1);
		expect(all[0].title).toBe('Sitzung');
	});

	it('links protocol to creating user', () => {
		const res = db.insert(users).values({ email: 'p@test.de', passwordHash: 'h', name: 'P' }).run();
		const userId = Number(res.lastInsertRowid);
		db.insert(protocols)
			.values({ title: 'Linked', date: '2025-02-01', attendees: 'A', content: 'C', createdBy: userId })
			.run();
		const protocol = db.select().from(protocols).where(eq(protocols.title, 'Linked')).get();
		expect(protocol!.createdBy).toBe(userId);
	});
});

describe('tasks table', () => {
	it('inserts a task with required fields', () => {
		db.insert(tasks).values({ title: 'Raum buchen' }).run();
		const all = db.select().from(tasks).all();
		expect(all).toHaveLength(1);
		expect(all[0].title).toBe('Raum buchen');
		expect(all[0].status).toBe('offen');
		expect(all[0].priority).toBe('mittel');
	});

	it('defaults status to offen and priority to mittel', () => {
		db.insert(tasks).values({ title: 'Default' }).run();
		const t = db.select().from(tasks).get();
		expect(t!.status).toBe('offen');
		expect(t!.priority).toBe('mittel');
	});

	it('rejects invalid status', () => {
		expect(() => {
			sqlite.exec("INSERT INTO tasks (title, status) VALUES ('X', 'done')");
		}).toThrow();
	});

	it('rejects invalid priority', () => {
		expect(() => {
			sqlite.exec("INSERT INTO tasks (title, priority) VALUES ('X', 'urgent')");
		}).toThrow();
	});

	it('links task to assigned user and creator', () => {
		const aRes = db.insert(users).values({ email: 'a@test.de', passwordHash: 'h', name: 'A' }).run();
		const cRes = db.insert(users).values({ email: 'c@test.de', passwordHash: 'h', name: 'C' }).run();
		const assignedTo = Number(aRes.lastInsertRowid);
		const createdBy = Number(cRes.lastInsertRowid);
		db.insert(tasks).values({ title: 'Linked', assignedTo, createdBy }).run();
		const t = db.select().from(tasks).get();
		expect(t!.assignedTo).toBe(assignedTo);
		expect(t!.createdBy).toBe(createdBy);
	});

	it('sets assigned_to to null when assigned user is deleted', () => {
		const res = db.insert(users).values({ email: 'del@test.de', passwordHash: 'h', name: 'D' }).run();
		const userId = Number(res.lastInsertRowid);
		db.insert(tasks).values({ title: 'Orphan', assignedTo: userId }).run();
		db.delete(users).where(eq(users.id, userId)).run();
		const t = db.select().from(tasks).get();
		expect(t!.assignedTo).toBeNull();
	});

	it('links task to an event and nulls on event delete', () => {
		const eRes = db.insert(events).values({ title: 'Sitzung', date: '2025-05-01' }).run();
		const eventId = Number(eRes.lastInsertRowid);
		db.insert(tasks).values({ title: 'Vorbereiten', veranstaltungId: eventId }).run();
		let t = db.select().from(tasks).get();
		expect(t!.veranstaltungId).toBe(eventId);
		db.delete(events).where(eq(events.id, eventId)).run();
		t = db.select().from(tasks).get();
		expect(t!.veranstaltungId).toBeNull();
	});
});

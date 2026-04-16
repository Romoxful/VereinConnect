import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb } from '../../../tests/db-helper.js';
import { users, protocols } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';

const { db, sqlite } = createTestDb();

let vorstandId: number;

beforeEach(() => {
	const vRes = db
		.insert(users)
		.values({ email: 'vorstand@test.de', passwordHash: 'h', name: 'Vorstand User', role: 'vorstand' })
		.run();
	vorstandId = Number(vRes.lastInsertRowid);
});

afterEach(() => {
	sqlite.exec('DELETE FROM protocols');
	sqlite.exec('DELETE FROM users');
});

describe('Protocol CRUD integration', () => {
	it('creates a protocol with all fields', () => {
		db.insert(protocols)
			.values({
				title: 'Vorstandssitzung Januar',
				date: '2025-01-15',
				attendees: 'Max Mustermann, Erika Musterfrau',
				content: '## Tagesordnung\n1. Begrüßung\n2. Kassenbericht',
				createdBy: vorstandId
			})
			.run();

		const all = db.select().from(protocols).all();
		expect(all).toHaveLength(1);
		expect(all[0].title).toBe('Vorstandssitzung Januar');
		expect(all[0].attendees).toBe('Max Mustermann, Erika Musterfrau');
		expect(all[0].createdBy).toBe(vorstandId);
	});

	it('fails without title', () => {
		expect(() => {
			sqlite.exec(
				"INSERT INTO protocols (date, attendees, content) VALUES ('2025-01-01', 'Test', 'Content')"
			);
		}).toThrow();
	});

	it('fails without date', () => {
		expect(() => {
			sqlite.exec(
				"INSERT INTO protocols (title, attendees, content) VALUES ('Test', 'Test', 'Content')"
			);
		}).toThrow();
	});

	it('fails without attendees', () => {
		expect(() => {
			sqlite.exec(
				"INSERT INTO protocols (title, date, content) VALUES ('Test', '2025-01-01', 'Content')"
			);
		}).toThrow();
	});

	it('fails without content', () => {
		expect(() => {
			sqlite.exec(
				"INSERT INTO protocols (title, date, attendees) VALUES ('Test', '2025-01-01', 'Test')"
			);
		}).toThrow();
	});

	it('updates a protocol', () => {
		const res = db
			.insert(protocols)
			.values({
				title: 'Original',
				date: '2025-01-01',
				attendees: 'Person A',
				content: 'Original content',
				createdBy: vorstandId
			})
			.run();
		const id = Number(res.lastInsertRowid);

		db.update(protocols)
			.set({
				title: 'Updated',
				content: 'Updated content',
				updatedAt: new Date().toISOString()
			})
			.where(eq(protocols.id, id))
			.run();

		const updated = db.select().from(protocols).where(eq(protocols.id, id)).get();
		expect(updated!.title).toBe('Updated');
		expect(updated!.content).toBe('Updated content');
	});

	it('deletes a protocol', () => {
		const res = db
			.insert(protocols)
			.values({
				title: 'To Delete',
				date: '2025-01-01',
				attendees: 'Person A',
				content: 'Delete me',
				createdBy: vorstandId
			})
			.run();
		const id = Number(res.lastInsertRowid);

		db.delete(protocols).where(eq(protocols.id, id)).run();
		const protocol = db.select().from(protocols).where(eq(protocols.id, id)).get();
		expect(protocol).toBeUndefined();
	});

	it('lists protocols ordered by date descending', () => {
		db.insert(protocols)
			.values({ title: 'Old', date: '2024-01-01', attendees: 'A', content: 'C' })
			.run();
		db.insert(protocols)
			.values({ title: 'New', date: '2025-12-01', attendees: 'B', content: 'C' })
			.run();
		db.insert(protocols)
			.values({ title: 'Middle', date: '2025-06-01', attendees: 'C', content: 'C' })
			.run();

		const all = db
			.select()
			.from(protocols)
			.orderBy(sql`${protocols.date} DESC`)
			.all();
		expect(all[0].title).toBe('New');
		expect(all[1].title).toBe('Middle');
		expect(all[2].title).toBe('Old');
	});

	it('stores markdown content correctly', () => {
		const markdownContent = `## Tagesordnung
1. Begrüßung
2. Kassenbericht
3. Wahlen

## Beschlüsse
- Antrag 1 angenommen
- Antrag 2 abgelehnt

## Nächste Schritte
- [ ] Brief an Mitglieder
- [ ] Konto prüfen`;

		db.insert(protocols)
			.values({
				title: 'Markdown Test',
				date: '2025-03-01',
				attendees: 'Alle',
				content: markdownContent
			})
			.run();

		const protocol = db.select().from(protocols).where(eq(protocols.title, 'Markdown Test')).get();
		expect(protocol!.content).toBe(markdownContent);
		expect(protocol!.content).toContain('## Tagesordnung');
		expect(protocol!.content).toContain('## Beschlüsse');
	});

	it('loads protocol with creator name via join', () => {
		db.insert(protocols)
			.values({
				title: 'Join Test',
				date: '2025-02-01',
				attendees: 'Test',
				content: 'Content',
				createdBy: vorstandId
			})
			.run();

		const result = db
			.select({
				id: protocols.id,
				title: protocols.title,
				creatorName: users.name
			})
			.from(protocols)
			.leftJoin(users, eq(protocols.createdBy, users.id))
			.all();

		expect(result).toHaveLength(1);
		expect(result[0].creatorName).toBe('Vorstand User');
	});
});

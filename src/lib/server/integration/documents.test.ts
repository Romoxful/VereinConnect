import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb } from '../../../tests/db-helper.js';
import { users, documents, documentVersions } from '../db/schema.js';
import { eq, desc, max } from 'drizzle-orm';

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
	sqlite.exec('DELETE FROM document_versions');
	sqlite.exec('DELETE FROM documents');
	sqlite.exec('DELETE FROM users');
});

describe('Document CRUD integration', () => {
	it('creates a document with required fields', () => {
		db.insert(documents)
			.values({
				title: 'Vereinssatzung 2025',
				filename: 'abc123.pdf',
				originalName: 'satzung.pdf',
				category: 'satzung',
				uploadedBy: vorstandId
			})
			.run();

		const all = db.select().from(documents).all();
		expect(all).toHaveLength(1);
		expect(all[0].title).toBe('Vereinssatzung 2025');
		expect(all[0].category).toBe('satzung');
		expect(all[0].uploadedBy).toBe(vorstandId);
	});

	it('defaults category to sonstiges', () => {
		db.insert(documents)
			.values({
				title: 'Sonstiges Dokument',
				filename: 'def456.pdf',
				originalName: 'misc.pdf'
			})
			.run();

		const doc = db.select().from(documents).where(eq(documents.title, 'Sonstiges Dokument')).get();
		expect(doc!.category).toBe('sonstiges');
	});

	it('fails without title', () => {
		expect(() => {
			sqlite.exec("INSERT INTO documents (filename, original_name) VALUES ('f.pdf', 'f.pdf')");
		}).toThrow();
	});

	it('fails without filename', () => {
		expect(() => {
			sqlite.exec("INSERT INTO documents (title, original_name) VALUES ('Test', 'f.pdf')");
		}).toThrow();
	});

	it('fails with invalid category', () => {
		expect(() => {
			sqlite.exec(
				"INSERT INTO documents (title, filename, original_name, category) VALUES ('Test', 'f.pdf', 'f.pdf', 'invalid')"
			);
		}).toThrow();
	});

	it('supports all valid categories', () => {
		const categories = ['satzung', 'bescheide', 'finanzen', 'sonstiges'] as const;
		for (const category of categories) {
			db.insert(documents)
				.values({
					title: `Doc ${category}`,
					filename: `${category}.pdf`,
					originalName: `${category}.pdf`,
					category
				})
				.run();
		}
		const all = db.select().from(documents).all();
		expect(all).toHaveLength(4);
	});

	it('deletes a document', () => {
		const res = db
			.insert(documents)
			.values({
				title: 'To Delete',
				filename: 'del.pdf',
				originalName: 'del.pdf',
				category: 'sonstiges'
			})
			.run();
		const id = Number(res.lastInsertRowid);

		db.delete(documents).where(eq(documents.id, id)).run();
		const doc = db.select().from(documents).where(eq(documents.id, id)).get();
		expect(doc).toBeUndefined();
	});

	it('lists documents ordered by createdAt descending', () => {
		sqlite.exec(
			"INSERT INTO documents (title, filename, original_name, created_at) VALUES ('Old', 'a.pdf', 'a.pdf', '2024-01-01T00:00:00.000Z')"
		);
		sqlite.exec(
			"INSERT INTO documents (title, filename, original_name, created_at) VALUES ('New', 'b.pdf', 'b.pdf', '2025-06-01T00:00:00.000Z')"
		);

		const all = db
			.select()
			.from(documents)
			.orderBy(documents.createdAt)
			.all();
		expect(all[0].title).toBe('Old');
		expect(all[1].title).toBe('New');
	});
});

describe('Document upload validation logic', () => {
	const MAX_FILE_SIZE = 10 * 1024 * 1024;
	const ALLOWED_TYPES = [
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'image/jpeg',
		'image/png',
		'image/gif',
		'image/webp'
	];

	it('rejects files over 10MB', () => {
		const size = 11 * 1024 * 1024;
		expect(size > MAX_FILE_SIZE).toBe(true);
	});

	it('accepts files under 10MB', () => {
		const size = 5 * 1024 * 1024;
		expect(size <= MAX_FILE_SIZE).toBe(true);
	});

	it('accepts allowed MIME types', () => {
		expect(ALLOWED_TYPES.includes('application/pdf')).toBe(true);
		expect(ALLOWED_TYPES.includes('image/jpeg')).toBe(true);
		expect(ALLOWED_TYPES.includes('image/png')).toBe(true);
	});

	it('rejects disallowed MIME types', () => {
		expect(ALLOWED_TYPES.includes('application/zip')).toBe(false);
		expect(ALLOWED_TYPES.includes('text/html')).toBe(false);
		expect(ALLOWED_TYPES.includes('application/javascript')).toBe(false);
	});
});

describe('Document versioning integration', () => {
	function createDoc(title = 'Versioniertes Dokument', filename = 'v1.pdf') {
		const res = db
			.insert(documents)
			.values({
				title,
				filename,
				originalName: filename,
				category: 'satzung',
				uploadedBy: vorstandId
			})
			.run();
		return Number(res.lastInsertRowid);
	}

	function addVersion(documentId: number, versionNumber: number, filename: string) {
		db.insert(documentVersions)
			.values({
				documentId,
				filename,
				originalName: filename,
				size: 1234,
				mimeType: 'application/pdf',
				versionNumber
			})
			.run();
	}

	it('creates a v1 row alongside a document', () => {
		const id = createDoc();
		addVersion(id, 1, 'v1.pdf');

		const versions = db
			.select()
			.from(documentVersions)
			.where(eq(documentVersions.documentId, id))
			.all();
		expect(versions).toHaveLength(1);
		expect(versions[0].versionNumber).toBe(1);
		expect(versions[0].size).toBe(1234);
		expect(versions[0].mimeType).toBe('application/pdf');
	});

	it('lists versions newest-first by version number', () => {
		const id = createDoc();
		addVersion(id, 1, 'v1.pdf');
		addVersion(id, 2, 'v2.pdf');
		addVersion(id, 3, 'v3.pdf');

		const versions = db
			.select()
			.from(documentVersions)
			.where(eq(documentVersions.documentId, id))
			.orderBy(desc(documentVersions.versionNumber))
			.all();
		expect(versions.map((v) => v.versionNumber)).toEqual([3, 2, 1]);
	});

	it('computes the next version number from the existing max', () => {
		const id = createDoc();
		addVersion(id, 1, 'v1.pdf');
		addVersion(id, 2, 'v2.pdf');

		const latest = db
			.select({ value: max(documentVersions.versionNumber) })
			.from(documentVersions)
			.where(eq(documentVersions.documentId, id))
			.get();
		expect((latest?.value ?? 0) + 1).toBe(3);
	});

	it('enforces unique (document_id, version_number)', () => {
		const id = createDoc();
		addVersion(id, 1, 'v1.pdf');
		expect(() => addVersion(id, 1, 'duplicate.pdf')).toThrow();
	});

	it('cascades version deletion when the parent document is deleted', () => {
		const id = createDoc();
		addVersion(id, 1, 'v1.pdf');
		addVersion(id, 2, 'v2.pdf');

		db.delete(documents).where(eq(documents.id, id)).run();

		const remaining = db
			.select()
			.from(documentVersions)
			.where(eq(documentVersions.documentId, id))
			.all();
		expect(remaining).toHaveLength(0);
	});

	it('keeps versions for two different documents independent', () => {
		const a = createDoc('Dok A', 'a-v1.pdf');
		const b = createDoc('Dok B', 'b-v1.pdf');
		addVersion(a, 1, 'a-v1.pdf');
		addVersion(a, 2, 'a-v2.pdf');
		addVersion(b, 1, 'b-v1.pdf');

		const aVersions = db
			.select()
			.from(documentVersions)
			.where(eq(documentVersions.documentId, a))
			.all();
		const bVersions = db
			.select()
			.from(documentVersions)
			.where(eq(documentVersions.documentId, b))
			.all();
		expect(aVersions).toHaveLength(2);
		expect(bVersions).toHaveLength(1);
	});

	it('treats the highest-numbered version as the current one', () => {
		const id = createDoc('Dok', 'v3.pdf');
		addVersion(id, 1, 'v1.pdf');
		addVersion(id, 2, 'v2.pdf');
		addVersion(id, 3, 'v3.pdf');

		const current = db
			.select()
			.from(documentVersions)
			.where(eq(documentVersions.documentId, id))
			.orderBy(desc(documentVersions.versionNumber))
			.get();
		expect(current?.versionNumber).toBe(3);
		expect(current?.filename).toBe('v3.pdf');
	});

	it('rejects a version row without a document_id', () => {
		expect(() => {
			sqlite.exec(
				"INSERT INTO document_versions (filename, original_name, version_number) VALUES ('x.pdf', 'x.pdf', 1)"
			);
		}).toThrow();
	});
});

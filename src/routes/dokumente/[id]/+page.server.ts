import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { documents, documentVersions, users } from '$lib/server/db/schema.js';
import { eq, desc, max } from 'drizzle-orm';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = './data/uploads';
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

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!id) error(404, 'Dokument nicht gefunden');

	const document = db
		.select({
			id: documents.id,
			title: documents.title,
			filename: documents.filename,
			originalName: documents.originalName,
			category: documents.category,
			uploadedBy: documents.uploadedBy,
			createdAt: documents.createdAt,
			uploaderName: users.name
		})
		.from(documents)
		.leftJoin(users, eq(documents.uploadedBy, users.id))
		.where(eq(documents.id, id))
		.get();

	if (!document) error(404, 'Dokument nicht gefunden');

	const versions = db
		.select()
		.from(documentVersions)
		.where(eq(documentVersions.documentId, id))
		.orderBy(desc(documentVersions.versionNumber))
		.all();

	return { document, versions };
};

export const actions: Actions = {
	uploadVersion: async ({ request, params, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}

		const id = Number(params.id);
		if (!id) return fail(400, { error: 'Ungültige ID.' });

		const doc = db.select().from(documents).where(eq(documents.id, id)).get();
		if (!doc) return fail(404, { error: 'Dokument nicht gefunden.' });

		const data = await request.formData();
		const file = data.get('file') as File | null;

		if (!file || file.size === 0) {
			return fail(400, { error: 'Bitte eine Datei auswählen.' });
		}

		if (file.size > MAX_FILE_SIZE) {
			return fail(400, { error: 'Die Datei darf maximal 10 MB groß sein.' });
		}

		if (!ALLOWED_TYPES.includes(file.type)) {
			return fail(400, {
				error: 'Nur PDF, DOCX und Bilddateien (JPG, PNG, GIF, WebP) sind erlaubt.'
			});
		}

		if (!existsSync(UPLOAD_DIR)) {
			mkdirSync(UPLOAD_DIR, { recursive: true });
		}

		const ext = file.name.split('.').pop() || 'bin';
		const filename = `${randomUUID()}.${ext}`;
		const buffer = Buffer.from(await file.arrayBuffer());
		writeFileSync(join(UPLOAD_DIR, filename), buffer);

		const latest = db
			.select({ value: max(documentVersions.versionNumber) })
			.from(documentVersions)
			.where(eq(documentVersions.documentId, id))
			.get();
		const nextVersion = (latest?.value ?? 0) + 1;

		db.insert(documentVersions)
			.values({
				documentId: id,
				filename,
				originalName: file.name,
				size: file.size,
				mimeType: file.type,
				versionNumber: nextVersion
			})
			.run();

		// Update the parent document to point at the new current version
		db.update(documents)
			.set({ filename, originalName: file.name })
			.where(eq(documents.id, id))
			.run();

		redirect(303, `/dokumente/${id}`);
	}
};

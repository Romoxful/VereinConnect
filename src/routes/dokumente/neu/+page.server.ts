import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db/index.js';
import { documents, documentVersions } from '$lib/server/db/schema.js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = './data/uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
	'application/pdf',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp'
];

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();

		const title = data.get('title')?.toString()?.trim() ?? '';
		const category = (data.get('category')?.toString() ?? 'sonstiges').toLowerCase();
		const file = data.get('file') as File | null;

		if (!title) {
			return fail(400, { error: 'Titel ist ein Pflichtfeld.', title, category });
		}

		if (!file || file.size === 0) {
			return fail(400, { error: 'Bitte eine Datei auswählen.', title, category });
		}

		if (file.size > MAX_FILE_SIZE) {
			return fail(400, { error: 'Die Datei darf maximal 10 MB groß sein.', title, category });
		}

		if (!ALLOWED_TYPES.includes(file.type)) {
			return fail(400, {
				error: 'Nur PDF, DOCX und Bilddateien (JPG, PNG, GIF, WebP) sind erlaubt.',
				title,
				category
			});
		}

		if (!existsSync(UPLOAD_DIR)) {
			mkdirSync(UPLOAD_DIR, { recursive: true });
		}

		const ext = file.name.split('.').pop() || 'bin';
		const filename = `${randomUUID()}.${ext}`;
		const buffer = Buffer.from(await file.arrayBuffer());
		writeFileSync(join(UPLOAD_DIR, filename), buffer);

		const insertResult = db
			.insert(documents)
			.values({
				title,
				filename,
				originalName: file.name,
				category,
				uploadedBy: locals.user?.id ?? null
			})
			.run();

		const documentId = Number(insertResult.lastInsertRowid);

		db.insert(documentVersions)
			.values({
				documentId,
				filename,
				originalName: file.name,
				size: file.size,
				mimeType: file.type,
				versionNumber: 1
			})
			.run();

		redirect(302, '/dokumente');
	}
};

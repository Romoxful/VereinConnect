import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { documents, users } from '$lib/server/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

const UPLOAD_DIR = './data/uploads';

export const load: PageServerLoad = async () => {
	const allDocs = db
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
		.orderBy(desc(documents.createdAt))
		.all();
	return { documents: allDocs };
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}

		const data = await request.formData();
		const id = Number(data.get('id'));
		if (!id) return fail(400, { error: 'Ungültige ID.' });

		const doc = db.select().from(documents).where(eq(documents.id, id)).get();
		if (!doc) return fail(404, { error: 'Dokument nicht gefunden.' });

		const filePath = join(UPLOAD_DIR, doc.filename);
		if (existsSync(filePath)) {
			unlinkSync(filePath);
		}

		db.delete(documents).where(eq(documents.id, id)).run();
		return { success: true };
	}
};

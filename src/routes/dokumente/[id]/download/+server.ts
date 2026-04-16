import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { documents } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const UPLOAD_DIR = './data/uploads';

const MIME_TYPES: Record<string, string> = {
	pdf: 'application/pdf',
	doc: 'application/msword',
	docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	gif: 'image/gif',
	webp: 'image/webp'
};

export const GET: RequestHandler = async ({ params }) => {
	const doc = db.select().from(documents).where(eq(documents.id, Number(params.id))).get();
	if (!doc) {
		error(404, 'Dokument nicht gefunden');
	}

	const filePath = join(UPLOAD_DIR, doc.filename);
	if (!existsSync(filePath)) {
		error(404, 'Datei nicht gefunden');
	}

	const fileBuffer = readFileSync(filePath);
	const ext = doc.originalName.split('.').pop()?.toLowerCase() || '';
	const contentType = MIME_TYPES[ext] || 'application/octet-stream';

	return new Response(fileBuffer, {
		headers: {
			'Content-Type': contentType,
			'Content-Disposition': `attachment; filename="${doc.originalName}"`,
			'Content-Length': fileBuffer.length.toString()
		}
	});
};

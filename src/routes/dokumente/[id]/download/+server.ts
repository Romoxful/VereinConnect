import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { documents, documentVersions } from '$lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';
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

export const GET: RequestHandler = async ({ params, url }) => {
	const docId = Number(params.id);
	const doc = db.select().from(documents).where(eq(documents.id, docId)).get();
	if (!doc) {
		error(404, 'Dokument nicht gefunden');
	}

	let filename = doc.filename;
	let originalName = doc.originalName;
	let mimeType = '';

	const versionParam = url.searchParams.get('version');
	if (versionParam !== null) {
		const versionNumber = Number(versionParam);
		if (!Number.isInteger(versionNumber) || versionNumber < 1) {
			error(400, 'Ungültige Versionsnummer');
		}
		const version = db
			.select()
			.from(documentVersions)
			.where(
				and(eq(documentVersions.documentId, docId), eq(documentVersions.versionNumber, versionNumber))
			)
			.get();
		if (!version) {
			error(404, 'Version nicht gefunden');
		}
		filename = version.filename;
		originalName = version.originalName;
		mimeType = version.mimeType;
	}

	const filePath = join(UPLOAD_DIR, filename);
	if (!existsSync(filePath)) {
		error(404, 'Datei nicht gefunden');
	}

	const fileBuffer = readFileSync(filePath);
	if (!mimeType) {
		const ext = originalName.split('.').pop()?.toLowerCase() || '';
		mimeType = MIME_TYPES[ext] || 'application/octet-stream';
	}

	return new Response(fileBuffer, {
		headers: {
			'Content-Type': mimeType,
			'Content-Disposition': `attachment; filename="${originalName}"`,
			'Content-Length': fileBuffer.length.toString()
		}
	});
};

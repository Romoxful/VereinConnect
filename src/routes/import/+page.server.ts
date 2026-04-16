import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { members } from '$lib/server/db/schema.js';
import { buildPreview, type PreviewResult } from '$lib/server/memberImport.js';

const MAX_CSV_BYTES = 2 * 1024 * 1024; // 2 MB

export const load: PageServerLoad = async ({ locals }) => {
	return { canImport: locals.user?.role === 'vorstand' };
};

function requireVorstand(locals: App.Locals) {
	if (locals.user?.role !== 'vorstand') {
		return fail(403, { error: 'Keine Berechtigung.' });
	}
	return null;
}

export const actions: Actions = {
	preview: async ({ request, locals }) => {
		const denied = requireVorstand(locals);
		if (denied) return denied;

		const data = await request.formData();
		const file = data.get('file');

		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { error: 'Bitte eine CSV-Datei auswählen.' });
		}
		if (file.size > MAX_CSV_BYTES) {
			return fail(400, { error: 'Datei zu groß (max. 2 MB).' });
		}

		const csvText = await file.text();
		const preview = buildPreview(csvText);

		// Pre-compute which rows would be duplicates by email
		const existingEmails = new Set(
			db
				.select({ email: members.email })
				.from(members)
				.all()
				.map((m) => m.email?.toLowerCase())
				.filter((e): e is string => !!e)
		);

		const rowsWithDupe = preview.rows.map((r) => ({
			...r,
			duplicateEmail:
				!!r.data?.email && existingEmails.has(r.data.email.toLowerCase())
		}));

		return {
			stage: 'preview' as const,
			csvText,
			preview: { ...preview, rows: rowsWithDupe } as PreviewResult & {
				rows: (PreviewResult['rows'][number] & { duplicateEmail: boolean })[];
			}
		};
	},

	import: async ({ request, locals }) => {
		const denied = requireVorstand(locals);
		if (denied) return denied;

		const data = await request.formData();
		const csvText = data.get('csvText')?.toString() ?? '';
		if (!csvText) return fail(400, { error: 'Keine Import-Daten gefunden.' });

		const preview = buildPreview(csvText);

		if (preview.missingRequired.length > 0) {
			return fail(400, {
				error: 'Pflichtfelder fehlen im Header: ' + preview.missingRequired.join(', ')
			});
		}

		const existingEmails = new Set(
			db
				.select({ email: members.email })
				.from(members)
				.all()
				.map((m) => m.email?.toLowerCase())
				.filter((e): e is string => !!e)
		);

		let imported = 0;
		let skippedDuplicates = 0;
		let skippedErrors = 0;
		const seenEmailsInBatch = new Set<string>();

		for (const row of preview.rows) {
			if (!row.data || row.errors.length > 0) {
				skippedErrors++;
				continue;
			}
			const emailKey = row.data.email?.toLowerCase() ?? null;
			if (emailKey && (existingEmails.has(emailKey) || seenEmailsInBatch.has(emailKey))) {
				skippedDuplicates++;
				continue;
			}

			db.insert(members).values(row.data).run();
			imported++;
			if (emailKey) seenEmailsInBatch.add(emailKey);
		}

		return {
			stage: 'done' as const,
			imported,
			skippedDuplicates,
			skippedErrors
		};
	}
};

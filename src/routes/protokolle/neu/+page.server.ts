import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db/index.js';
import { protocols } from '$lib/server/db/schema.js';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();

		const title = data.get('title')?.toString()?.trim() ?? '';
		const date = data.get('date')?.toString() ?? '';
		const attendees = data.get('attendees')?.toString()?.trim() ?? '';
		const content = data.get('content')?.toString()?.trim() ?? '';

		if (!title || !date || !attendees || !content) {
			return fail(400, {
				error: 'Alle Felder sind Pflichtfelder.',
				title,
				date,
				attendees,
				content
			});
		}

		db.insert(protocols)
			.values({
				title,
				date,
				attendees,
				content,
				createdBy: locals.user?.id ?? null
			})
			.run();

		redirect(302, '/protokolle');
	}
};

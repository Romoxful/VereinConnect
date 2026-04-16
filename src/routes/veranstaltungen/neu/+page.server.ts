import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db/index.js';
import { events } from '$lib/server/db/schema.js';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();

		const title = data.get('title')?.toString()?.trim() ?? '';
		const description = data.get('description')?.toString()?.trim() || null;
		const location = data.get('location')?.toString()?.trim() || null;
		const date = data.get('date')?.toString() ?? '';
		const time = data.get('time')?.toString()?.trim() || null;

		if (!title || !date) {
			return fail(400, { error: 'Titel und Datum sind Pflichtfelder.', title, description, location, date, time });
		}

		db.insert(events)
			.values({ title, description, location, date, time, createdBy: locals.user?.id ?? null })
			.run();

		redirect(302, '/veranstaltungen');
	}
};

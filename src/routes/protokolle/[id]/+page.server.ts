import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { protocols, users } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const result = db
		.select({
			id: protocols.id,
			date: protocols.date,
			title: protocols.title,
			attendees: protocols.attendees,
			content: protocols.content,
			createdBy: protocols.createdBy,
			createdAt: protocols.createdAt,
			updatedAt: protocols.updatedAt,
			creatorName: users.name
		})
		.from(protocols)
		.leftJoin(users, eq(protocols.createdBy, users.id))
		.where(eq(protocols.id, Number(params.id)))
		.get();

	if (!result) {
		error(404, 'Protokoll nicht gefunden');
	}
	return { protocol: result };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}

		const data = await request.formData();
		const title = data.get('title')?.toString()?.trim() ?? '';
		const date = data.get('date')?.toString() ?? '';
		const attendees = data.get('attendees')?.toString()?.trim() ?? '';
		const content = data.get('content')?.toString()?.trim() ?? '';

		if (!title || !date || !attendees || !content) {
			return fail(400, { error: 'Alle Felder sind Pflichtfelder.' });
		}

		db.update(protocols)
			.set({
				title,
				date,
				attendees,
				content,
				updatedAt: new Date().toISOString()
			})
			.where(eq(protocols.id, Number(params.id)))
			.run();

		redirect(302, '/protokolle');
	},
	delete: async ({ params, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}

		db.delete(protocols).where(eq(protocols.id, Number(params.id))).run();
		redirect(302, '/protokolle');
	}
};

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { members } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const allMembers = db.select().from(members).orderBy(members.lastName).all();
	return { members: allMembers };
};

export const actions: Actions = {
	accept: async ({ request, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}
		const data = await request.formData();
		const id = Number(data.get('id'));
		if (!id) return fail(400, { error: 'Ungültige ID.' });

		db.update(members)
			.set({ status: 'aktiv', memberSince: new Date().toISOString().slice(0, 10) })
			.where(eq(members.id, id))
			.run();

		redirect(302, '/mitglieder?tab=beantragt');
	},
	reject: async ({ request, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}
		const data = await request.formData();
		const id = Number(data.get('id'));
		if (!id) return fail(400, { error: 'Ungültige ID.' });

		db.update(members).set({ status: 'abgelehnt' }).where(eq(members.id, id)).run();

		redirect(302, '/mitglieder?tab=beantragt');
	}
};

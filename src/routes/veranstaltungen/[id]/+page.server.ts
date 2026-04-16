import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { events, rsvps, users } from '$lib/server/db/schema.js';
import { eq, and, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
	const event = db.select().from(events).where(eq(events.id, Number(params.id))).get();
	if (!event) {
		error(404, 'Veranstaltung nicht gefunden');
	}

	const eventRsvps = db
		.select({
			id: rsvps.id,
			status: rsvps.status,
			userName: users.name,
			userId: rsvps.userId
		})
		.from(rsvps)
		.innerJoin(users, eq(rsvps.userId, users.id))
		.where(eq(rsvps.eventId, event.id))
		.all();

	const myRsvp = locals.user
		? eventRsvps.find((r) => r.userId === locals.user!.id)
		: null;

	return { event, rsvps: eventRsvps, myRsvp: myRsvp ?? null };
};

export const actions: Actions = {
	rsvp: async ({ request, params, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Nicht angemeldet.' });
		}

		const data = await request.formData();
		const status = data.get('status')?.toString() ?? 'zugesagt';

		if (!['zugesagt', 'abgesagt', 'vielleicht'].includes(status)) {
			return fail(400, { error: 'Ungültiger Status.' });
		}

		const eventId = Number(params.id);
		const existing = db
			.select()
			.from(rsvps)
			.where(and(eq(rsvps.eventId, eventId), eq(rsvps.userId, locals.user.id)))
			.get();

		if (existing) {
			db.update(rsvps)
				.set({ status })
				.where(eq(rsvps.id, existing.id))
				.run();
		} else {
			db.insert(rsvps)
				.values({ eventId, userId: locals.user.id, status })
				.run();
		}

		return { success: true };
	},
	delete: async ({ params, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}

		db.delete(events).where(eq(events.id, Number(params.id))).run();
		redirect(302, '/veranstaltungen');
	}
};

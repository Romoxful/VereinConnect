import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { events } from '$lib/server/db/schema.js';
import { sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id ?? 0;

	const allEvents = db
		.select({
			id: events.id,
			title: events.title,
			date: events.date,
			time: events.time,
			location: events.location,
			rsvpCount: sql<number>`(SELECT COUNT(*) FROM rsvps WHERE rsvps.event_id = events.id AND rsvps.status = 'zugesagt')`,
			myRsvpStatus: sql<'zugesagt' | 'abgesagt' | 'vielleicht' | null>`(SELECT status FROM rsvps WHERE rsvps.event_id = events.id AND rsvps.user_id = ${userId} LIMIT 1)`
		})
		.from(events)
		.orderBy(sql`${events.date} ASC`)
		.all();

	return { events: allEvents };
};

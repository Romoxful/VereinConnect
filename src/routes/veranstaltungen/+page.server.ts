import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { events, rsvps } from '$lib/server/db/schema.js';
import { sql, eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const allEvents = db
		.select({
			id: events.id,
			title: events.title,
			description: events.description,
			location: events.location,
			date: events.date,
			time: events.time,
			createdAt: events.createdAt,
			rsvpCount: sql<number>`(SELECT COUNT(*) FROM rsvps WHERE rsvps.event_id = ${events.id} AND rsvps.status = 'zugesagt')`
		})
		.from(events)
		.orderBy(sql`${events.date} DESC`)
		.all();

	return { events: allEvents };
};

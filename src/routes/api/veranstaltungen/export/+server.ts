import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { events } from '$lib/server/db/schema.js';
import { buildIcsCalendar, type IcsEvent } from '$lib/server/ics.js';

export const GET: RequestHandler = async () => {
	const all = db.select().from(events).orderBy(events.date).all();

	const icsEvents: IcsEvent[] = all.map((e) => ({
		uid: `event-${e.id}@foerderverein-ff.local`,
		title: e.title,
		description: e.description,
		location: e.location,
		date: e.date,
		time: e.time,
		createdAt: e.createdAt
	}));

	const ics = buildIcsCalendar(icsEvents, 'Förderverein FF – Veranstaltungen');

	return new Response(ics, {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': 'attachment; filename="veranstaltungen.ics"'
		}
	});
};

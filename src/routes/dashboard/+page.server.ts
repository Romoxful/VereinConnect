import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { members, events, dues } from '$lib/server/db/schema.js';
import { eq, gte, sql } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const today = new Date().toISOString().split('T')[0];

	const memberCount = db
		.select({ count: sql<number>`count(*)` })
		.from(members)
		.where(eq(members.status, 'aktiv'))
		.get();

	const totalMembers = db
		.select({ count: sql<number>`count(*)` })
		.from(members)
		.get();

	const upcomingEventCount = db
		.select({ count: sql<number>`count(*)` })
		.from(events)
		.where(gte(events.date, today))
		.get();

	const upcomingEvents = db
		.select()
		.from(events)
		.where(gte(events.date, today))
		.orderBy(events.date)
		.limit(5)
		.all();

	const openDues = db
		.select({ count: sql<number>`count(*)` })
		.from(dues)
		.where(eq(dues.status, 'offen'))
		.get();

	const overdueDues = db
		.select({ count: sql<number>`count(*)` })
		.from(dues)
		.where(eq(dues.status, 'überfällig'))
		.get();

	return {
		stats: {
			memberCount: memberCount?.count ?? 0,
			totalMembers: totalMembers?.count ?? 0,
			upcomingEvents: upcomingEventCount?.count ?? 0,
			openDues: openDues?.count ?? 0,
			overdueDues: overdueDues?.count ?? 0
		},
		upcomingEvents
	};
};

import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { protocols, users } from '$lib/server/db/schema.js';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const allProtocols = db
		.select({
			id: protocols.id,
			date: protocols.date,
			title: protocols.title,
			attendees: protocols.attendees,
			createdBy: protocols.createdBy,
			createdAt: protocols.createdAt,
			creatorName: users.name
		})
		.from(protocols)
		.leftJoin(users, eq(protocols.createdBy, users.id))
		.orderBy(desc(protocols.date))
		.all();
	return { protocols: allProtocols };
};

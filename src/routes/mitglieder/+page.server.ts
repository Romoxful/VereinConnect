import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { members } from '$lib/server/db/schema.js';

export const load: PageServerLoad = async () => {
	const allMembers = db.select().from(members).orderBy(members.lastName).all();
	return { members: allMembers };
};

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { members } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const member = db.select().from(members).where(eq(members.id, Number(params.id))).get();
	if (!member) {
		error(404, 'Mitglied nicht gefunden');
	}
	return { member };
};

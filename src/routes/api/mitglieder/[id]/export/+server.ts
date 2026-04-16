import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { members, dues, consents } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		error(401, 'Nicht authentifiziert');
	}

	const memberId = Number(params.id);

	const member = db.select().from(members).where(eq(members.id, memberId)).get();
	if (!member) {
		error(404, 'Mitglied nicht gefunden');
	}

	const memberDues = db.select().from(dues).where(eq(dues.memberId, memberId)).all();
	const memberConsents = db.select().from(consents).where(eq(consents.memberId, memberId)).all();

	const exportData = {
		exportDate: new Date().toISOString(),
		member,
		dues: memberDues,
		consents: memberConsents
	};

	return json(exportData, {
		headers: {
			'Content-Disposition': `attachment; filename="mitglied-${memberId}-daten.json"`
		}
	});
};

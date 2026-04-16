import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { members, dues, consents } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (locals.user?.role !== 'vorstand') {
		error(403, 'Keine Berechtigung');
	}

	const memberId = Number(params.id);

	const member = db.select().from(members).where(eq(members.id, memberId)).get();
	if (!member) {
		error(404, 'Mitglied nicht gefunden');
	}

	// Delete all associated data (GDPR Art. 17 - Right to erasure)
	// Dues and consents are cascade-deleted via FK, but be explicit
	db.delete(consents).where(eq(consents.memberId, memberId)).run();
	db.delete(dues).where(eq(dues.memberId, memberId)).run();
	db.delete(members).where(eq(members.id, memberId)).run();

	return json({ success: true, message: 'Mitglied und alle zugehörigen Daten wurden gelöscht.' });
};

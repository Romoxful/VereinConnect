import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { members } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { buildMembershipCertificate } from '$lib/server/certificates.js';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (locals.user?.role !== 'vorstand') {
		error(403, 'Keine Berechtigung');
	}

	const memberId = Number(params.id);
	const member = db.select().from(members).where(eq(members.id, memberId)).get();
	if (!member) {
		error(404, 'Mitglied nicht gefunden');
	}

	const pdf = buildMembershipCertificate(member);
	const filename = `mitgliedsbescheinigung-${member.lastName.toLowerCase()}-${memberId}.pdf`;

	return new Response(pdf as BodyInit, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `attachment; filename="${filename}"`,
			'Cache-Control': 'no-store'
		}
	});
};

import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { members, dues, consents } from '$lib/server/db/schema.js';
import { eq, desc, and, isNull } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const member = db.select().from(members).where(eq(members.id, Number(params.id))).get();
	if (!member) {
		error(404, 'Mitglied nicht gefunden');
	}

	const memberDues = db
		.select()
		.from(dues)
		.where(eq(dues.memberId, Number(params.id)))
		.orderBy(desc(dues.year))
		.all();

	const memberConsents = db
		.select()
		.from(consents)
		.where(eq(consents.memberId, Number(params.id)))
		.all();

	// Build active consent map
	const activeConsents: Record<string, boolean> = {
		datenverarbeitung: false,
		newsletter: false,
		foto_freigabe: false
	};
	for (const c of memberConsents) {
		if (!c.withdrawnAt) {
			activeConsents[c.consentType] = true;
		}
	}

	return { member, memberDues, memberConsents, activeConsents };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}

		const data = await request.formData();
		const firstName = data.get('firstName')?.toString()?.trim() ?? '';
		const lastName = data.get('lastName')?.toString()?.trim() ?? '';
		const email = data.get('email')?.toString()?.trim() || null;
		const phone = data.get('phone')?.toString()?.trim() || null;
		const street = data.get('street')?.toString()?.trim() || null;
		const zip = data.get('zip')?.toString()?.trim() || null;
		const city = data.get('city')?.toString()?.trim() || null;
		const memberSince = data.get('memberSince')?.toString() ?? '';
		const status = data.get('status')?.toString() ?? 'aktiv';
		const notes = data.get('notes')?.toString()?.trim() || null;

		if (!firstName || !lastName || !memberSince) {
			return fail(400, { error: 'Pflichtfelder ausfüllen.' });
		}

		db.update(members)
			.set({ firstName, lastName, email, phone, street, zip, city, memberSince, status, notes })
			.where(eq(members.id, Number(params.id)))
			.run();

		redirect(302, '/mitglieder');
	},
	delete: async ({ params, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}

		db.delete(members).where(eq(members.id, Number(params.id))).run();
		redirect(302, '/mitglieder');
	},

	updateConsents: async ({ request, params, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}

		const data = await request.formData();
		const memberId = Number(params.id);
		const consentTypes = ['datenverarbeitung', 'newsletter', 'foto_freigabe'] as const;
		const now = new Date().toISOString();

		for (const type of consentTypes) {
			const checked = data.get(type) === 'on';
			const existing = db
				.select()
				.from(consents)
				.where(and(eq(consents.memberId, memberId), eq(consents.consentType, type), isNull(consents.withdrawnAt)))
				.get();

			if (checked && !existing) {
				db.insert(consents).values({ memberId, consentType: type, givenAt: now }).run();
			} else if (!checked && existing) {
				db.update(consents)
					.set({ withdrawnAt: now })
					.where(eq(consents.id, existing.id))
					.run();
			}
		}

		redirect(302, `/mitglieder/${memberId}`);
	}
};

import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db/index.js';
import { members } from '$lib/server/db/schema.js';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const firstName = data.get('firstName')?.toString()?.trim() ?? '';
		const lastName = data.get('lastName')?.toString()?.trim() ?? '';
		const email = data.get('email')?.toString()?.trim() || null;
		const phone = data.get('phone')?.toString()?.trim() || null;
		const street = data.get('street')?.toString()?.trim() || null;
		const zip = data.get('zip')?.toString()?.trim() || null;
		const city = data.get('city')?.toString()?.trim() || null;
		const birthDate = data.get('birthDate')?.toString()?.trim() || null;
		const profession = data.get('profession')?.toString()?.trim() || null;
		const memberSince = data.get('memberSince')?.toString() ?? '';
		const status = (data.get('status')?.toString() ?? 'aktiv') as
			| 'aktiv'
			| 'inaktiv'
			| 'ausgetreten'
			| 'beantragt'
			| 'abgelehnt';
		const notes = data.get('notes')?.toString()?.trim() || null;

		if (!firstName || !lastName || !memberSince) {
			return fail(400, {
				error: 'Vorname, Nachname und Mitglied seit sind Pflichtfelder.',
				firstName, lastName, email, phone, street, zip, city, birthDate, profession, memberSince, status, notes
			});
		}

		db.insert(members).values({
			firstName, lastName, email, phone, street, zip, city, birthDate, profession, memberSince, status, notes
		}).run();

		redirect(302, '/mitglieder');
	}
};

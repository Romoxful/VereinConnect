import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db/index.js';
import { members, consents } from '$lib/server/db/schema.js';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const firstName = data.get('firstName')?.toString()?.trim() ?? '';
		const lastName = data.get('lastName')?.toString()?.trim() ?? '';
		const email = data.get('email')?.toString()?.trim() ?? '';
		const phone = data.get('phone')?.toString()?.trim() || null;
		const street = data.get('street')?.toString()?.trim() || null;
		const zip = data.get('zip')?.toString()?.trim() || null;
		const city = data.get('city')?.toString()?.trim() || null;
		const birthDate = data.get('birthDate')?.toString()?.trim() || null;
		const profession = data.get('profession')?.toString()?.trim() || null;
		const message = data.get('message')?.toString()?.trim() || null;
		const consent = data.get('consent') === 'on';

		const values = {
			firstName, lastName, email, phone, street, zip, city,
			birthDate, profession, message
		};

		if (!firstName || !lastName || !email) {
			return fail(400, {
				...values,
				consent,
				error: 'Vorname, Nachname und E-Mail sind Pflichtfelder.'
			});
		}

		if (!consent) {
			return fail(400, {
				...values,
				consent,
				error: 'Bitte bestätigen Sie die Einwilligung zur Datenverarbeitung (DSGVO).'
			});
		}

		const result = db
			.insert(members)
			.values({
				firstName,
				lastName,
				email,
				phone,
				street,
				zip,
				city,
				birthDate,
				profession,
				memberSince: new Date().toISOString().slice(0, 10),
				status: 'beantragt',
				notes: message
			})
			.returning({ id: members.id })
			.get();

		db.insert(consents)
			.values({ memberId: result.id, consentType: 'datenverarbeitung' })
			.run();

		return { success: true };
	}
};

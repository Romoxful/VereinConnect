import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { members } from '$lib/server/db/schema.js';
import { stringifyCsv } from '$lib/server/csv.js';

const HEADERS = [
	'Vorname',
	'Nachname',
	'E-Mail',
	'Telefon',
	'Straße',
	'PLZ',
	'Ort',
	'Geburtsdatum',
	'Beruf',
	'Mitglied seit',
	'Status',
	'Notizen'
];

export const GET: RequestHandler = async ({ locals }) => {
	if (locals.user?.role !== 'vorstand') {
		error(403, 'Keine Berechtigung');
	}

	const all = db.select().from(members).orderBy(members.lastName).all();

	const rows: (string | null)[][] = [HEADERS];
	for (const m of all) {
		rows.push([
			m.firstName,
			m.lastName,
			m.email,
			m.phone,
			m.street,
			m.zip,
			m.city,
			m.birthDate,
			m.profession,
			m.memberSince,
			m.status,
			m.notes
		]);
	}

	const csv = stringifyCsv(rows);
	const today = new Date().toISOString().slice(0, 10);

	return new Response('\uFEFF' + csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="mitglieder-${today}.csv"`
		}
	});
};

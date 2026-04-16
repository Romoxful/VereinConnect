import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { dues, members } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const allMembers = db
		.select({ id: members.id, firstName: members.firstName, lastName: members.lastName })
		.from(members)
		.where(eq(members.status, 'aktiv'))
		.orderBy(members.lastName)
		.all();

	return { members: allMembers };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}

		const data = await request.formData();
		const memberId = Number(data.get('memberId'));
		const amount = data.get('amount')?.toString()?.trim() ?? '';
		const dueDate = data.get('dueDate')?.toString() ?? '';
		const year = Number(data.get('year'));
		const status = (data.get('status')?.toString() ?? 'offen') as 'offen' | 'bezahlt' | 'überfällig';
		const notes = data.get('notes')?.toString()?.trim() || null;
		const paidDate = data.get('paidDate')?.toString()?.trim() || null;

		if (!memberId || !amount || !dueDate || !year) {
			return fail(400, { error: 'Pflichtfelder ausfüllen.', memberId, amount, dueDate, year, notes });
		}

		db.insert(dues)
			.values({ memberId, amount, dueDate, paidDate: status === 'bezahlt' ? (paidDate || new Date().toISOString().split('T')[0]) : null, status, year, notes })
			.run();

		redirect(302, '/beitraege');
	}
};

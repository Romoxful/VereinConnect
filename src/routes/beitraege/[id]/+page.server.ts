import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { dues, members } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const due = db
		.select({
			id: dues.id,
			memberId: dues.memberId,
			amount: dues.amount,
			dueDate: dues.dueDate,
			paidDate: dues.paidDate,
			status: dues.status,
			year: dues.year,
			notes: dues.notes,
			createdAt: dues.createdAt,
			memberFirstName: members.firstName,
			memberLastName: members.lastName
		})
		.from(dues)
		.innerJoin(members, eq(dues.memberId, members.id))
		.where(eq(dues.id, Number(params.id)))
		.get();

	if (!due) {
		error(404, 'Beitrag nicht gefunden');
	}

	return { due };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}

		const data = await request.formData();
		const amount = data.get('amount')?.toString()?.trim() ?? '';
		const dueDate = data.get('dueDate')?.toString() ?? '';
		const year = Number(data.get('year'));
		const status = (data.get('status')?.toString() ?? 'offen') as 'offen' | 'bezahlt' | 'überfällig';
		const notes = data.get('notes')?.toString()?.trim() || null;
		const paidDate = data.get('paidDate')?.toString()?.trim() || null;

		if (!amount || !dueDate || !year) {
			return fail(400, { error: 'Pflichtfelder ausfüllen.' });
		}

		db.update(dues)
			.set({
				amount,
				dueDate,
				paidDate: status === 'bezahlt' ? (paidDate || new Date().toISOString().split('T')[0]) : null,
				status,
				year,
				notes
			})
			.where(eq(dues.id, Number(params.id)))
			.run();

		redirect(302, '/beitraege');
	},

	markPaid: async ({ params, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}

		db.update(dues)
			.set({
				status: 'bezahlt',
				paidDate: new Date().toISOString().split('T')[0]
			})
			.where(eq(dues.id, Number(params.id)))
			.run();

		redirect(302, '/beitraege');
	},

	delete: async ({ params, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}

		db.delete(dues).where(eq(dues.id, Number(params.id))).run();
		redirect(302, '/beitraege');
	}
};

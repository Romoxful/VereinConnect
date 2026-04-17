import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { inventoryItems, inventoryCategories } from '$lib/server/db/schema.js';
import { asc } from 'drizzle-orm';

const CONDITIONS = ['neu', 'gut', 'befriedigend', 'mangelhaft', 'defekt'] as const;
type Condition = (typeof CONDITIONS)[number];

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.role !== 'vorstand') {
		redirect(302, '/inventar');
	}

	const categories = db
		.select({ id: inventoryCategories.id, name: inventoryCategories.name })
		.from(inventoryCategories)
		.orderBy(asc(inventoryCategories.name))
		.all();

	return { categories };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();

		const name = data.get('name')?.toString()?.trim() ?? '';
		const description = data.get('description')?.toString()?.trim() || null;
		const categoryIdRaw = data.get('categoryId')?.toString()?.trim();
		const quantityRaw = data.get('quantity')?.toString()?.trim() ?? '1';
		const location = data.get('location')?.toString()?.trim() || null;
		const condition = data.get('condition')?.toString() ?? 'gut';
		const acquisitionDate = data.get('acquisitionDate')?.toString()?.trim() || null;
		const value = data.get('value')?.toString()?.trim() || null;
		const notes = data.get('notes')?.toString()?.trim() || null;

		const categoryId = categoryIdRaw ? Number(categoryIdRaw) : null;
		const quantity = Number(quantityRaw);

		const formState = {
			name,
			description,
			categoryId,
			quantity,
			location,
			condition,
			acquisitionDate,
			value,
			notes
		};

		if (locals.user?.role !== 'vorstand') {
			return fail(403, { ...formState, error: 'Keine Berechtigung.' });
		}

		if (!name) {
			return fail(400, { ...formState, error: 'Name ist ein Pflichtfeld.' });
		}

		if (!Number.isInteger(quantity) || quantity < 1) {
			return fail(400, { ...formState, error: 'Menge muss eine positive ganze Zahl sein.' });
		}

		if (!CONDITIONS.includes(condition as Condition)) {
			return fail(400, { ...formState, error: 'Ungültiger Zustand.' });
		}

		if (value !== null && isNaN(parseFloat(value))) {
			return fail(400, { ...formState, error: 'Wert muss eine Zahl sein.' });
		}

		db.insert(inventoryItems)
			.values({
				name,
				description,
				categoryId,
				quantity,
				location,
				condition: condition as Condition,
				acquisitionDate,
				value,
				notes,
				createdBy: locals.user?.id ?? null
			})
			.run();

		redirect(302, '/inventar');
	}
};

import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { inventoryItems, inventoryCategories, users } from '$lib/server/db/schema.js';
import { eq, asc } from 'drizzle-orm';

const CONDITIONS = ['neu', 'gut', 'befriedigend', 'mangelhaft', 'defekt'] as const;
type Condition = (typeof CONDITIONS)[number];

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	const item = db
		.select({
			id: inventoryItems.id,
			name: inventoryItems.name,
			description: inventoryItems.description,
			categoryId: inventoryItems.categoryId,
			categoryName: inventoryCategories.name,
			quantity: inventoryItems.quantity,
			location: inventoryItems.location,
			condition: inventoryItems.condition,
			acquisitionDate: inventoryItems.acquisitionDate,
			value: inventoryItems.value,
			notes: inventoryItems.notes,
			createdBy: inventoryItems.createdBy,
			creatorName: users.name,
			createdAt: inventoryItems.createdAt,
			updatedAt: inventoryItems.updatedAt
		})
		.from(inventoryItems)
		.leftJoin(inventoryCategories, eq(inventoryItems.categoryId, inventoryCategories.id))
		.leftJoin(users, eq(inventoryItems.createdBy, users.id))
		.where(eq(inventoryItems.id, Number(params.id)))
		.get();

	if (!item) {
		error(404, 'Artikel nicht gefunden');
	}

	const categories =
		locals.user?.role === 'vorstand'
			? db
					.select({ id: inventoryCategories.id, name: inventoryCategories.name })
					.from(inventoryCategories)
					.orderBy(asc(inventoryCategories.name))
					.all()
			: [];

	return { item, categories };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}

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

		if (!name) {
			return fail(400, { error: 'Name ist ein Pflichtfeld.' });
		}
		if (!Number.isInteger(quantity) || quantity < 1) {
			return fail(400, { error: 'Menge muss eine positive ganze Zahl sein.' });
		}
		if (!CONDITIONS.includes(condition as Condition)) {
			return fail(400, { error: 'Ungültiger Zustand.' });
		}
		if (value !== null && isNaN(parseFloat(value))) {
			return fail(400, { error: 'Wert muss eine Zahl sein.' });
		}

		db.update(inventoryItems)
			.set({
				name,
				description,
				categoryId,
				quantity,
				location,
				condition: condition as Condition,
				acquisitionDate,
				value,
				notes,
				updatedAt: new Date().toISOString()
			})
			.where(eq(inventoryItems.id, Number(params.id)))
			.run();

		redirect(302, `/inventar/${params.id}`);
	},
	delete: async ({ params, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}
		db.delete(inventoryItems).where(eq(inventoryItems.id, Number(params.id))).run();
		redirect(302, '/inventar');
	}
};

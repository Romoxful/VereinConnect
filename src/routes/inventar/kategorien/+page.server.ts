import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { inventoryCategories, inventoryItems } from '$lib/server/db/schema.js';
import { eq, asc, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.role !== 'vorstand') {
		redirect(302, '/inventar');
	}

	const categories = db
		.select({
			id: inventoryCategories.id,
			name: inventoryCategories.name,
			description: inventoryCategories.description,
			itemCount: sql<number>`(SELECT COUNT(*) FROM ${inventoryItems} WHERE ${inventoryItems.categoryId} = ${inventoryCategories.id})`
		})
		.from(inventoryCategories)
		.orderBy(asc(inventoryCategories.name))
		.all();

	return { categories };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}
		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim() ?? '';
		const description = data.get('description')?.toString()?.trim() || null;

		if (!name) {
			return fail(400, { error: 'Name ist ein Pflichtfeld.', name, description });
		}

		const existing = db
			.select({ id: inventoryCategories.id })
			.from(inventoryCategories)
			.where(eq(inventoryCategories.name, name))
			.get();
		if (existing) {
			return fail(400, { error: 'Kategorie mit diesem Namen existiert bereits.', name, description });
		}

		db.insert(inventoryCategories).values({ name, description }).run();
		return { success: true };
	},
	update: async ({ request, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}
		const data = await request.formData();
		const idRaw = data.get('id')?.toString()?.trim() ?? '';
		const id = Number(idRaw);
		const name = data.get('name')?.toString()?.trim() ?? '';
		const description = data.get('description')?.toString()?.trim() || null;

		if (!Number.isInteger(id) || id < 1) {
			return fail(400, { error: 'Ungültige Kategorie.' });
		}
		if (!name) {
			return fail(400, { error: 'Name ist ein Pflichtfeld.' });
		}

		db.update(inventoryCategories)
			.set({ name, description })
			.where(eq(inventoryCategories.id, id))
			.run();
		return { success: true };
	},
	delete: async ({ request, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}
		const data = await request.formData();
		const idRaw = data.get('id')?.toString()?.trim() ?? '';
		const id = Number(idRaw);
		if (!Number.isInteger(id) || id < 1) {
			return fail(400, { error: 'Ungültige Kategorie.' });
		}
		db.delete(inventoryCategories).where(eq(inventoryCategories.id, id)).run();
		return { success: true };
	}
};

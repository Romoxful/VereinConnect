import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { inventoryItems, inventoryCategories } from '$lib/server/db/schema.js';
import { eq, desc, asc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	const items = db
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
			value: inventoryItems.value
		})
		.from(inventoryItems)
		.leftJoin(inventoryCategories, eq(inventoryItems.categoryId, inventoryCategories.id))
		.orderBy(desc(inventoryItems.createdAt))
		.all();

	const categories = db
		.select({ id: inventoryCategories.id, name: inventoryCategories.name })
		.from(inventoryCategories)
		.orderBy(asc(inventoryCategories.name))
		.all();

	return { items, categories };
};

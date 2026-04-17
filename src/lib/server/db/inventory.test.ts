import { describe, it, expect, afterEach } from 'vitest';
import { createTestDb } from '../../../tests/db-helper.js';
import { users, inventoryCategories, inventoryItems } from './schema.js';
import { eq } from 'drizzle-orm';

const { db, sqlite } = createTestDb();

afterEach(() => {
	sqlite.exec('DELETE FROM inventory_items');
	sqlite.exec('DELETE FROM inventory_categories');
	sqlite.exec('DELETE FROM users');
});

describe('inventory_categories table', () => {
	it('inserts a category with required fields', () => {
		db.insert(inventoryCategories).values({ name: 'Ausrüstung' }).run();
		const all = db.select().from(inventoryCategories).all();
		expect(all).toHaveLength(1);
		expect(all[0].name).toBe('Ausrüstung');
	});

	it('enforces unique name constraint', () => {
		db.insert(inventoryCategories).values({ name: 'Fahrzeuge' }).run();
		expect(() => {
			db.insert(inventoryCategories).values({ name: 'Fahrzeuge' }).run();
		}).toThrow();
	});
});

describe('inventory_items table', () => {
	it('inserts an item with defaults', () => {
		db.insert(inventoryItems).values({ name: 'Bohrmaschine' }).run();
		const item = db.select().from(inventoryItems).get();
		expect(item!.name).toBe('Bohrmaschine');
		expect(item!.quantity).toBe(1);
		expect(item!.condition).toBe('gut');
	});

	it('links item to category', () => {
		const cat = db.insert(inventoryCategories).values({ name: 'Werkzeuge' }).run();
		const categoryId = Number(cat.lastInsertRowid);
		db.insert(inventoryItems).values({ name: 'Säge', categoryId }).run();
		const item = db.select().from(inventoryItems).get();
		expect(item!.categoryId).toBe(categoryId);
	});

	it('sets category_id to null when category is deleted', () => {
		const cat = db.insert(inventoryCategories).values({ name: 'Temp' }).run();
		const categoryId = Number(cat.lastInsertRowid);
		db.insert(inventoryItems).values({ name: 'Hammer', categoryId }).run();
		db.delete(inventoryCategories).where(eq(inventoryCategories.id, categoryId)).run();
		const item = db.select().from(inventoryItems).get();
		expect(item!.categoryId).toBeNull();
	});

	it('rejects invalid condition', () => {
		expect(() => {
			sqlite.exec(
				"INSERT INTO inventory_items (name, condition) VALUES ('Bad', 'unbekannt')"
			);
		}).toThrow();
	});

	it('sets created_by to null when user is deleted', () => {
		const u = db.insert(users).values({ email: 'inv@test.de', passwordHash: 'h', name: 'I' }).run();
		const userId = Number(u.lastInsertRowid);
		db.insert(inventoryItems).values({ name: 'Helm', createdBy: userId }).run();
		db.delete(users).where(eq(users.id, userId)).run();
		const item = db.select().from(inventoryItems).get();
		expect(item!.createdBy).toBeNull();
	});

	it('stores all full item fields', () => {
		db.insert(inventoryItems)
			.values({
				name: 'Beamer',
				description: 'HD Projektor',
				quantity: 2,
				location: 'Vereinsheim',
				condition: 'neu',
				acquisitionDate: '2024-06-15',
				value: '499.99',
				notes: 'In Tasche'
			})
			.run();
		const item = db.select().from(inventoryItems).get();
		expect(item!.name).toBe('Beamer');
		expect(item!.quantity).toBe(2);
		expect(item!.condition).toBe('neu');
		expect(item!.value).toBe('499.99');
		expect(item!.location).toBe('Vereinsheim');
	});
});

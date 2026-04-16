import { test, expect } from '@playwright/test';
import { disableHtml5Validation, loginAsAdmin } from './helpers';

test.describe('Protocols management', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
		await expect(page).toHaveURL(/\/dashboard/);
	});

	test('can navigate to protocols list', async ({ page }) => {
		await page.goto('/protokolle');
		await expect(page).toHaveURL(/\/protokolle/);
	});

	test('shows server validation error in UI for missing required fields', async ({ page }) => {
		await page.goto('/protokolle/neu');
		await disableHtml5Validation(page);
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/protokolle\/neu/);
		await expect(page.getByTestId('form-error')).toBeVisible();
		await expect(page.getByTestId('form-error')).toContainText('Pflichtfelder');
	});

	test('can create a new protocol', async ({ page }) => {
		await page.goto('/protokolle/neu');
		await page.fill('input[name="title"]', 'Sitzung März');
		await page.fill('input[name="date"]', '2025-03-15');
		await page.fill('input[name="attendees"]', 'Max Mustermann, Erika Musterfrau');
		await page.fill('textarea[name="content"]', '## Tagesordnung\n1. Begrüßung');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/protokolle$/);
	});
});

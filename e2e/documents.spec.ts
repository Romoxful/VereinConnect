import { test, expect } from '@playwright/test';
import { disableHtml5Validation, loginAsAdmin } from './helpers';

test.describe('Documents management', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
		await expect(page).toHaveURL(/\/dashboard/);
	});

	test('can navigate to documents list', async ({ page }) => {
		await page.goto('/dokumente');
		await expect(page).toHaveURL(/\/dokumente/);
	});

	test('shows server validation error in UI for missing required fields', async ({ page }) => {
		await page.goto('/dokumente/neu');
		await disableHtml5Validation(page);
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/dokumente\/neu/);
		await expect(page.getByTestId('form-error')).toBeVisible();
		await expect(page.getByTestId('form-error')).toContainText('Titel');
	});

	test('shows server validation error when title is provided but file is missing', async ({ page }) => {
		await page.goto('/dokumente/neu');
		await disableHtml5Validation(page);
		await page.fill('input[name="title"]', 'Test Dokument');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/dokumente\/neu/);
		await expect(page.getByTestId('form-error')).toBeVisible();
		await expect(page.getByTestId('form-error')).toContainText('Datei');
	});
});

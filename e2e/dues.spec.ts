import { test, expect } from '@playwright/test';
import { disableHtml5Validation, loginAsAdmin } from './helpers';

test.describe('Dues management', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
		await expect(page).toHaveURL(/\/dashboard/);
	});

	test('can navigate to dues list', async ({ page }) => {
		await page.goto('/beitraege');
		await expect(page).toHaveURL(/\/beitraege/);
	});

	test('shows server validation error in UI for missing required fields', async ({ page }) => {
		await page.goto('/beitraege/neu');
		await disableHtml5Validation(page);
		// Clear the year input (it has a default value)
		await page.fill('input[name="year"]', '');
		await page.fill('input[name="amount"]', '');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/beitraege\/neu/);
		await expect(page.getByTestId('form-error')).toBeVisible();
		await expect(page.getByTestId('form-error')).toContainText('Pflichtfelder');
	});
});

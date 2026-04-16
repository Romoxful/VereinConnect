import { test, expect } from '@playwright/test';
import { disableHtml5Validation, loginAsAdmin } from './helpers';

test.describe('Members management', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
		await expect(page).toHaveURL(/\/dashboard/);
	});

	test('can navigate to members list', async ({ page }) => {
		await page.goto('/mitglieder');
		await expect(page).toHaveURL(/\/mitglieder/);
	});

	test('can create a new member', async ({ page }) => {
		await page.goto('/mitglieder/neu');
		await page.fill('input[name="firstName"]', 'Test');
		await page.fill('input[name="lastName"]', 'Mitglied');
		await page.fill('input[name="memberSince"]', '2025-01-01');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/mitglieder$/);
		await expect(page.getByRole('heading', { name: 'Mitglieder' })).toBeVisible();
	});

	test('shows server validation error in UI for missing required fields', async ({ page }) => {
		await page.goto('/mitglieder/neu');
		await disableHtml5Validation(page);
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/mitglieder\/neu/);
		await expect(page.getByTestId('form-error')).toBeVisible();
		await expect(page.getByTestId('form-error')).toContainText('Pflichtfelder');
	});
});

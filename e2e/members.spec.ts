import { test, expect } from '@playwright/test';

test.describe('Members management', () => {
	test.beforeEach(async ({ page }) => {
		// Login as admin (vorstand)
		await page.goto('/login');
		await page.fill('input[name="email"]', 'admin@foerderverein.de');
		await page.fill('input[name="password"]', 'admin123');
		await page.click('button[type="submit"]');
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

	test('shows validation error for missing required fields', async ({ page }) => {
		await page.goto('/mitglieder/neu');
		await page.click('button[type="submit"]');
		// HTML5 validation keeps us on the form page
		await expect(page).toHaveURL(/\/mitglieder\/neu/);
	});
});
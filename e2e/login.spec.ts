import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
	test('shows login form', async ({ page }) => {
		await page.goto('/login');
		await expect(page.locator('input[name="email"]')).toBeVisible();
		await expect(page.locator('input[name="password"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toBeVisible();
	});

	test('redirects unauthenticated user to login', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page).toHaveURL(/\/login/);
	});

	test('shows error for invalid credentials', async ({ page }) => {
		await page.goto('/login');
		await page.fill('input[name="email"]', 'wrong@test.de');
		await page.fill('input[name="password"]', 'wrongpassword');
		await page.click('button[type="submit"]');
		await expect(page.locator('text=Ungültige Anmeldedaten')).toBeVisible();
	});

	test('shows error for empty fields', async ({ page }) => {
		await page.goto('/login');
		// Bypass HTML5 validation so the request reaches the server-side validator.
		await page.locator('form').evaluate((form: HTMLFormElement) => (form.noValidate = true));
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/login/);
		await expect(page.getByText('Bitte E-Mail und Passwort eingeben.')).toBeVisible();
	});

	test('logs in with valid credentials and redirects to dashboard', async ({ page }) => {
		await page.goto('/login');
		await page.fill('input[name="email"]', 'admin@foerderverein.de');
		await page.fill('input[name="password"]', 'admin123');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/dashboard/);
	});

	test('redirects authenticated user from login to dashboard', async ({ page }) => {
		// First login
		await page.goto('/login');
		await page.fill('input[name="email"]', 'admin@foerderverein.de');
		await page.fill('input[name="password"]', 'admin123');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/dashboard/);

		// Try to visit login again
		await page.goto('/login');
		await expect(page).toHaveURL(/\/dashboard/);
	});
});

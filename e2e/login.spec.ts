import { test, expect } from '@playwright/test';
import { disableHtml5Validation } from './helpers';

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
		await expect(page.getByTestId('form-error')).toBeVisible();
		await expect(page.getByTestId('form-error')).toContainText('Ungültige Anmeldedaten');
	});

	test('shows server validation error for empty fields', async ({ page }) => {
		await page.goto('/login');
		await disableHtml5Validation(page);
		await page.click('button[type="submit"]');
		await expect(page.getByTestId('form-error')).toBeVisible();
		await expect(page.getByTestId('form-error')).toContainText('E-Mail und Passwort');
	});

	test('logs in with valid credentials and redirects to dashboard', async ({ page }) => {
		await page.goto('/login');
		await page.fill('input[name="email"]', 'admin@foerderverein.de');
		await page.fill('input[name="password"]', 'admin123');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/dashboard/);
	});

	test('redirects authenticated user from login to dashboard', async ({ page }) => {
		await page.goto('/login');
		await page.fill('input[name="email"]', 'admin@foerderverein.de');
		await page.fill('input[name="password"]', 'admin123');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/dashboard/);

		await page.goto('/login');
		await expect(page).toHaveURL(/\/dashboard/);
	});
});

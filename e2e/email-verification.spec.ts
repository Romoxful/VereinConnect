import { test, expect } from '@playwright/test';

test.describe('Email verification on registration', () => {
	test('submitting the application shows the verification link', async ({ page }) => {
		const unique = Date.now();
		await page.goto('/aufnahme');
		await page.fill('input[name="firstName"]', 'Test');
		await page.fill('input[name="lastName"]', `Verify${unique}`);
		await page.fill('input[name="email"]', `verify${unique}@example.de`);
		await page.check('input[name="consent"]');
		await page.click('button[type="submit"]');

		await expect(page.getByText('Vielen Dank für Ihren Aufnahmeantrag!')).toBeVisible();
		const link = page.getByTestId('verify-link');
		await expect(link).toBeVisible();
		const href = await link.getAttribute('href');
		expect(href).toMatch(/\/aufnahme\/bestaetigen\?token=[0-9a-f]{64}$/);
	});

	test('clicking the verification link confirms the email', async ({ page }) => {
		const unique = Date.now();
		await page.goto('/aufnahme');
		await page.fill('input[name="firstName"]', 'Click');
		await page.fill('input[name="lastName"]', `Verify${unique}`);
		await page.fill('input[name="email"]', `click${unique}@example.de`);
		await page.check('input[name="consent"]');
		await page.click('button[type="submit"]');

		const href = await page.getByTestId('verify-link').getAttribute('href');
		expect(href).not.toBeNull();
		await page.goto(href!);

		await expect(page.getByTestId('verify-success')).toBeVisible();
		await expect(page.getByText('E-Mail-Adresse erfolgreich bestätigt.')).toBeVisible();
	});

	test('verification link can only be used once', async ({ page }) => {
		const unique = Date.now();
		await page.goto('/aufnahme');
		await page.fill('input[name="firstName"]', 'Once');
		await page.fill('input[name="lastName"]', `Verify${unique}`);
		await page.fill('input[name="email"]', `once${unique}@example.de`);
		await page.check('input[name="consent"]');
		await page.click('button[type="submit"]');

		const href = await page.getByTestId('verify-link').getAttribute('href');
		await page.goto(href!);
		await expect(page.getByTestId('verify-success')).toBeVisible();

		await page.goto(href!);
		await expect(page.getByTestId('verify-already-used')).toBeVisible();
	});

	test('invalid token shows error page', async ({ page }) => {
		await page.goto('/aufnahme/bestaetigen?token=definitely-not-a-real-token');
		await expect(page.getByTestId('verify-invalid')).toBeVisible();
	});

	test('missing token shows error page', async ({ page }) => {
		await page.goto('/aufnahme/bestaetigen');
		await expect(page.getByTestId('verify-invalid')).toBeVisible();
	});

	test('login shows verification hint for an unverified applicant', async ({ page }) => {
		const unique = Date.now();
		const email = `login-hint${unique}@example.de`;

		await page.goto('/aufnahme');
		await page.fill('input[name="firstName"]', 'Hint');
		await page.fill('input[name="lastName"]', `Verify${unique}`);
		await page.fill('input[name="email"]', email);
		await page.check('input[name="consent"]');
		await page.click('button[type="submit"]');
		await expect(page.getByText('Vielen Dank für Ihren Aufnahmeantrag!')).toBeVisible();

		await page.goto('/login');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', 'whatever');
		await page.click('button[type="submit"]');

		await expect(
			page.getByText('Ihre E-Mail-Adresse wurde noch nicht bestätigt.', { exact: false })
		).toBeVisible();
	});
});

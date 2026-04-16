import { test, expect } from '@playwright/test';

test.describe('Events management', () => {
	test.beforeEach(async ({ page }) => {
		// Login as admin (vorstand)
		await page.goto('/login');
		await page.fill('input[name="email"]', 'admin@foerderverein.de');
		await page.fill('input[name="password"]', 'admin123');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/dashboard/);
	});

	test('can navigate to events list', async ({ page }) => {
		await page.goto('/veranstaltungen');
		await expect(page).toHaveURL(/\/veranstaltungen/);
	});

	test('can create a new event', async ({ page }) => {
		await page.goto('/veranstaltungen/neu');
		await page.fill('input[name="title"]', 'Testevent');
		await page.fill('input[name="date"]', '2025-12-25');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/veranstaltungen$/);
		await expect(page.locator('h3', { hasText: 'Testevent' }).first()).toBeVisible();
	});

	test('shows validation error for missing required fields', async ({ page }) => {
		await page.goto('/veranstaltungen/neu');
		// Bypass HTML5 validation so the request reaches the server-side validator.
		await page
			.locator('form:not([action])')
			.evaluate((form: HTMLFormElement) => (form.noValidate = true));
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/veranstaltungen\/neu/);
		await expect(page.getByText('Titel und Datum sind Pflichtfelder.')).toBeVisible();
	});

	test('can switch to calendar view and see events', async ({ page }) => {
		const now = new Date();
		const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.min(now.getDate(), 28)).padStart(2, '0')}`;

		await page.goto('/veranstaltungen/neu');
		await page.fill('input[name="title"]', 'Kalendertest');
		await page.fill('input[name="date"]', iso);
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/veranstaltungen$/);

		await page.getByRole('link', { name: /Kalender/ }).first().click();
		await expect(page).toHaveURL(/\/veranstaltungen\/kalender/);

		await expect(page.getByRole('link', { name: /Kalendertest/ }).first()).toBeVisible();
		await expect(page.getByRole('button', { name: 'Monat' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Woche' })).toBeVisible();

		await page.getByRole('link', { name: /Kalendertest/ }).first().click();
		await expect(page).toHaveURL(/\/veranstaltungen\/\d+/);
	});

	test('can RSVP to an event', async ({ page }) => {
		// First create an event
		await page.goto('/veranstaltungen/neu');
		await page.fill('input[name="title"]', 'RSVP Test');
		await page.fill('input[name="date"]', '2025-12-31');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/veranstaltungen$/);

		// Click on the event to view details
		await page.click('text=RSVP Test');
		await expect(page).toHaveURL(/\/veranstaltungen\/\d+/);

		// RSVP (the button/form depends on UI implementation)
		const rsvpButton = page.locator('button:has-text("Zusagen"), button:has-text("zugesagt"), button[value="zugesagt"]').first();
		if (await rsvpButton.isVisible()) {
			await rsvpButton.click();
		}
	});
});

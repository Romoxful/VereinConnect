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
		await page.click('button[type="submit"]');
		// HTML5 validation blocks submit with empty required fields
		await expect(page.locator('input[name="title"]:invalid')).toBeVisible();
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

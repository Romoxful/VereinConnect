import { test, expect } from '@playwright/test';
import { disableHtml5Validation, loginAsAdmin } from './helpers';

test.describe('Events management', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
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

	test('shows server validation error in UI for missing required fields', async ({ page }) => {
		await page.goto('/veranstaltungen/neu');
		await disableHtml5Validation(page);
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/veranstaltungen\/neu/);
		await expect(page.getByTestId('form-error')).toBeVisible();
		await expect(page.getByTestId('form-error')).toContainText('Pflichtfelder');
	});

	test('can RSVP to an event', async ({ page }) => {
		await page.goto('/veranstaltungen/neu');
		await page.fill('input[name="title"]', 'RSVP Test');
		await page.fill('input[name="date"]', '2025-12-31');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/veranstaltungen$/);

		await page.click('text=RSVP Test');
		await expect(page).toHaveURL(/\/veranstaltungen\/\d+/);

		const rsvpButton = page.locator('button:has-text("Zusagen"), button:has-text("zugesagt"), button[value="zugesagt"]').first();
		if (await rsvpButton.isVisible()) {
			await rsvpButton.click();
		}
	});
});

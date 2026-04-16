import { test, expect } from '@playwright/test';

test.describe('Document upload', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
		await page.fill('input[name="email"]', 'admin@foerderverein.de');
		await page.fill('input[name="password"]', 'admin123');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/dashboard/);
	});

	test('uploads a document with a lowercase category via the form', async ({ page }) => {
		await page.goto('/dokumente/neu');
		await page.fill('input[name="title"]', 'E2E Satzung');
		await page.selectOption('select[name="category"]', 'satzung');
		await page.setInputFiles('input[name="file"]', {
			name: 'satzung.pdf',
			mimeType: 'application/pdf',
			buffer: Buffer.from('%PDF-1.4\n%%EOF\n')
		});
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/dokumente$/);
		await expect(page.locator('td', { hasText: 'E2E Satzung' }).first()).toBeVisible();
	});

	test('regression #21: uploads successfully when category value is uppercase', async ({ page }) => {
		await page.goto('/dokumente/neu');

		// Simulate the regression: force the <select> to submit an uppercase
		// value that would hit the CHECK constraint unless the server
		// normalizes it. Without the server-side toLowerCase() the request
		// would produce a CHECK-constraint failure and return a 500/error.
		await page.evaluate(() => {
			const select = document.querySelector<HTMLSelectElement>('select[name="category"]');
			if (!select) throw new Error('category select not found');
			for (const opt of Array.from(select.options)) {
				opt.value = opt.value.toUpperCase();
			}
			select.value = 'SATZUNG';
		});

		await page.fill('input[name="title"]', 'Regression Issue 21');
		await page.setInputFiles('input[name="file"]', {
			name: 'regression.pdf',
			mimeType: 'application/pdf',
			buffer: Buffer.from('%PDF-1.4\n%%EOF\n')
		});
		await page.click('button[type="submit"]');

		await expect(page).toHaveURL(/\/dokumente$/);
		await expect(page.locator('td', { hasText: 'Regression Issue 21' }).first()).toBeVisible();
	});
});

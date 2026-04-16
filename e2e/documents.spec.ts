import { test, expect } from '@playwright/test';

test.describe('Documents upload', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
		await page.fill('input[name="email"]', 'admin@foerderverein.de');
		await page.fill('input[name="password"]', 'admin123');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/dashboard/);
	});

	// Regression test for #21: uploading a document with a mixed-case category
	// value must succeed because the server normalizes it to lowercase before
	// inserting. Without that normalization, the DB CHECK constraint on the
	// lowercase enum would reject the row.
	test('normalizes mixed-case category on upload', async ({ page }) => {
		await page.goto('/dokumente/neu');

		await page.fill('input[name="title"]', 'Case Test Dokument');

		// Force a mixed-case value into the select — the form UI only exposes
		// lowercase options, so we rewrite the option's value to prove the
		// server-side toLowerCase() is what keeps the upload working.
		await page.locator('select[name="category"]').evaluate((el) => {
			const select = el as HTMLSelectElement;
			const option = Array.from(select.options).find((o) => o.value === 'satzung');
			if (!option) throw new Error('expected satzung option');
			option.value = 'Satzung';
			select.value = 'Satzung';
		});

		await page.setInputFiles('input[name="file"]', {
			name: 'case-test.pdf',
			mimeType: 'application/pdf',
			buffer: Buffer.from('%PDF-1.4\n% test\n')
		});

		await page.click('button[type="submit"]');

		await expect(page).toHaveURL(/\/dokumente$/);
		const row = page.locator('tr', { hasText: 'Case Test Dokument' }).first();
		await expect(row).toBeVisible();
		await expect(row).toContainText('Satzung');
	});
});

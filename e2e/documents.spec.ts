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

	// Issue #7: Document versioning. Uploading a new file on an existing
	// document must produce a v2 entry while preserving v1 as a separate
	// downloadable file.
	test('uploads a new version and lists both versions', async ({ page }) => {
		// Initial upload — creates v1
		await page.goto('/dokumente/neu');
		await page.fill('input[name="title"]', 'Versions Dokument');
		await page.locator('select[name="category"]').selectOption('sonstiges');
		await page.setInputFiles('input[name="file"]', {
			name: 'version1.pdf',
			mimeType: 'application/pdf',
			buffer: Buffer.from('%PDF-1.4\n% v1 content\n')
		});
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/dokumente$/);

		// Navigate to detail page via title link (desktop table row, mobile card is hidden)
		await page
			.locator('table a', { hasText: 'Versions Dokument' })
			.first()
			.click();
		await expect(page).toHaveURL(/\/dokumente\/\d+$/);
		await expect(page.locator('h1')).toHaveText('Versions Dokument');
		await expect(page.locator('text=1 Version')).toBeVisible();

		// Upload a new version
		await page.setInputFiles('input[name="file"]', {
			name: 'version2.pdf',
			mimeType: 'application/pdf',
			buffer: Buffer.from('%PDF-1.4\n% v2 content updated\n')
		});
		await page.locator('button', { hasText: 'Neue Version hochladen' }).click();

		// Detail page should now show 2 versions and current = v2
		await expect(page.getByText('2 Versionen')).toBeVisible();
		await expect(page.getByText('v2', { exact: true })).toBeVisible();
		await expect(page.getByText('v1', { exact: true })).toBeVisible();
		await expect(page.getByText('Aktuell', { exact: true })).toBeVisible();

		// Both version download links should be present
		const v1Link = page.locator('a[href*="version=1"]');
		const v2Link = page.locator('a[href*="version=2"]');
		await expect(v1Link).toHaveCount(1);
		await expect(v2Link).toHaveCount(1);
	});
});

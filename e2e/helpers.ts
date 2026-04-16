import type { Page } from '@playwright/test';

/**
 * Disable HTML5 validation on all forms in the page so we can submit
 * empty required fields and observe server-side validation errors.
 */
export async function disableHtml5Validation(page: Page) {
	await page.evaluate(() => {
		for (const f of Array.from(document.querySelectorAll('form'))) {
			(f as HTMLFormElement).noValidate = true;
		}
	});
}

export async function loginAsAdmin(page: Page) {
	await page.goto('/login');
	await page.fill('input[name="email"]', 'admin@foerderverein.de');
	await page.fill('input[name="password"]', 'admin123');
	await page.click('button[type="submit"]');
}

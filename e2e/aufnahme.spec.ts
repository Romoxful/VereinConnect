import { test, expect } from '@playwright/test';

test.describe('Public membership application', () => {
	test('is accessible without login', async ({ page }) => {
		await page.goto('/aufnahme');
		await expect(page).toHaveURL(/\/aufnahme/);
		await expect(page.getByRole('heading', { name: 'Antrag auf Mitgliedschaft' })).toBeVisible();
	});

	test('login page links to application form', async ({ page }) => {
		await page.goto('/login');
		await expect(page.getByRole('link', { name: 'Mitgliedsantrag stellen' })).toBeVisible();
	});

	test('submits an application and admin can accept it', async ({ page }) => {
		const unique = Date.now();
		const lastName = `Testantrag${unique}`;

		// Submit the public application form
		await page.goto('/aufnahme');
		await page.fill('input[name="firstName"]', 'Öffentlich');
		await page.fill('input[name="lastName"]', lastName);
		await page.fill('input[name="email"]', `antrag${unique}@example.de`);
		await page.fill('input[name="phone"]', '+49 170 1234567');
		await page.fill('input[name="street"]', 'Musterstr. 1');
		await page.fill('input[name="zip"]', '12345');
		await page.fill('input[name="city"]', 'Musterstadt');
		await page.fill('input[name="birthDate"]', '1985-06-15');
		await page.fill('input[name="profession"]', 'Tischler');
		await page.fill('textarea[name="message"]', 'Ich möchte gerne beitreten.');
		await page.check('input[name="consent"]');
		await page.click('button[type="submit"]');

		await expect(page.getByText('Vielen Dank für Ihren Aufnahmeantrag!')).toBeVisible();

		// Log in as admin and verify application appears under "beantragt"
		await page.goto('/login');
		await page.fill('input[name="email"]', 'admin@foerderverein.de');
		await page.fill('input[name="password"]', 'admin123');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/dashboard/);

		await page.goto('/mitglieder?tab=beantragt');
		await expect(page.getByRole('link', { name: `${lastName}, Öffentlich` })).toBeVisible();
		await expect(page.getByText('Ich möchte gerne beitreten.')).toBeVisible();

		// Accept the application
		await page
			.locator('div', { hasText: `${lastName}, Öffentlich` })
			.locator('form[action="?/accept"] button')
			.first()
			.click();

		// After accepting, applicant should move off the "beantragt" tab
		await expect(page).toHaveURL(/\/mitglieder\?tab=beantragt/);
		await expect(page.getByRole('link', { name: `${lastName}, Öffentlich` })).toHaveCount(0);

		// And be visible in the "alle" tab as active
		await page.goto('/mitglieder');
		await expect(page.getByRole('link', { name: `${lastName}, Öffentlich` })).toBeVisible();
	});

	test('rejects submission without DSGVO consent', async ({ page }) => {
		await page.goto('/aufnahme');
		// Bypass HTML5 validation so the request reaches the server-side validator.
		await page
			.locator('form')
			.evaluate((form: HTMLFormElement) => (form.noValidate = true));
		await page.fill('input[name="firstName"]', 'Ohne');
		await page.fill('input[name="lastName"]', 'Einwilligung');
		await page.fill('input[name="email"]', 'ohne@example.de');
		// Don't check the consent box
		await page.click('button[type="submit"]');

		await expect(
			page.getByText('Bitte bestätigen Sie die Einwilligung zur Datenverarbeitung (DSGVO).')
		).toBeVisible();
	});

	test('shows validation error for missing required fields', async ({ page }) => {
		await page.goto('/aufnahme');
		await page
			.locator('form')
			.evaluate((form: HTMLFormElement) => (form.noValidate = true));
		await page.click('button[type="submit"]');
		await expect(
			page.getByText('Vorname, Nachname und E-Mail sind Pflichtfelder.')
		).toBeVisible();
	});
});

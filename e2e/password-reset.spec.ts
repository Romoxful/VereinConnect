import { test, expect } from '@playwright/test';
import Database from 'better-sqlite3';
import crypto from 'crypto';

const DB_PATH = process.env.DB_PATH || './data/test-e2e.db';

function hashPassword(password: string): string {
	const salt = crypto.randomBytes(16).toString('hex');
	const hash = crypto.scryptSync(password, salt, 64).toString('hex');
	return `${salt}:${hash}`;
}

function openDb(readonly = false): Database.Database {
	return new Database(DB_PATH, readonly ? { readonly: true } : undefined);
}

function upsertUser(email: string, password: string, name: string) {
	const db = openDb();
	try {
		const hash = hashPassword(password);
		db.prepare('DELETE FROM users WHERE email = ?').run(email);
		db.prepare(
			'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
		).run(email, hash, name, 'mitglied');
	} finally {
		db.close();
	}
}

function deleteEmailsAndResets(email: string) {
	const db = openDb();
	try {
		db.prepare('DELETE FROM sent_emails WHERE to_email = ?').run(email);
		const row = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as
			| { id: number }
			| undefined;
		if (row) {
			db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(row.id);
		}
	} finally {
		db.close();
	}
}

function latestEmailFor(toEmail: string): { subject: string; body: string } | null {
	const db = openDb(true);
	try {
		const row = db
			.prepare(
				'SELECT subject, body FROM sent_emails WHERE to_email = ? ORDER BY id DESC LIMIT 1'
			)
			.get(toEmail) as { subject: string; body: string } | undefined;
		return row ?? null;
	} finally {
		db.close();
	}
}

function extractResetPath(body: string): string | null {
	const match = body.match(/https?:\/\/\S+\/passwort-zuruecksetzen\/[A-Fa-f0-9]+/);
	if (!match) return null;
	try {
		return new URL(match[0]).pathname;
	} catch {
		return null;
	}
}

const TEST_USER_EMAIL = 'reset-e2e@foerderverein.de';
const TEST_USER_INITIAL_PW = 'startpasswort1';

test.describe('Password reset', () => {
	test.beforeEach(() => {
		upsertUser(TEST_USER_EMAIL, TEST_USER_INITIAL_PW, 'Reset E2E Tester');
		deleteEmailsAndResets(TEST_USER_EMAIL);
	});

	test('request form is reachable without authentication', async ({ page }) => {
		await page.goto('/passwort-zuruecksetzen');
		await expect(page).toHaveURL(/\/passwort-zuruecksetzen/);
		await expect(page.getByRole('heading', { name: 'Passwort zurücksetzen' })).toBeVisible();
		await expect(page.locator('input[name="email"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toBeVisible();
	});

	test('login page links to password reset', async ({ page }) => {
		await page.goto('/login');
		await page.getByRole('link', { name: 'Passwort vergessen?' }).click();
		await expect(page).toHaveURL(/\/passwort-zuruecksetzen$/);
	});

	test('shows generic confirmation for unknown email (no info leak)', async ({ page }) => {
		await page.goto('/passwort-zuruecksetzen');
		await page.fill('input[name="email"]', 'gibts-nicht@foerderverein.de');
		await page.click('button[type="submit"]');
		await expect(page.getByTestId('reset-confirmation')).toBeVisible();
		await expect(page.getByTestId('reset-confirmation')).toContainText(
			'Wenn ein Konto mit dieser E-Mail-Adresse existiert'
		);
	});

	test('shows generic confirmation for known email (no info leak)', async ({ page }) => {
		await page.goto('/passwort-zuruecksetzen');
		await page.fill('input[name="email"]', TEST_USER_EMAIL);
		await page.click('button[type="submit"]');
		await expect(page.getByTestId('reset-confirmation')).toBeVisible();
	});

	test('does not create a reset token for unknown emails', async () => {
		// Confirm no email was stored for an unknown address across the previous test
		const mail = latestEmailFor('gibts-nicht@foerderverein.de');
		expect(mail).toBeNull();
	});

	test('invalid token shows error page with link to request a new one', async ({ page }) => {
		await page.goto(
			'/passwort-zuruecksetzen/0000000000000000000000000000000000000000000000000000000000000000'
		);
		await expect(page.getByTestId('token-error')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Neuen Link anfordern' })).toBeVisible();
	});

	test('full reset flow: request -> email stored -> set new password -> login', async ({
		page
	}) => {
		const newPassword = 'neuesP@ssw0rt2026';

		// 1. Request reset
		await page.goto('/passwort-zuruecksetzen');
		await page.fill('input[name="email"]', TEST_USER_EMAIL);
		await page.click('button[type="submit"]');
		await expect(page.getByTestId('reset-confirmation')).toBeVisible();

		// 2. Fetch the reset link from the mock email table
		const mail = latestEmailFor(TEST_USER_EMAIL);
		expect(mail).not.toBeNull();
		expect(mail!.subject).toContain('Passwort');
		const resetPath = extractResetPath(mail!.body);
		expect(resetPath).not.toBeNull();

		// 3. Visit reset link and set new password
		await page.goto(resetPath!);
		await expect(page.getByRole('heading', { name: 'Neues Passwort vergeben' })).toBeVisible();
		await page.fill('input[name="password"]', newPassword);
		await page.fill('input[name="passwordConfirm"]', newPassword);
		await page.click('button[type="submit"]');

		// 4. Redirected to login with success indicator
		await expect(page).toHaveURL(/\/login\?reset=1/);
		await expect(page.getByTestId('reset-success')).toBeVisible();

		// 5. Login with new password succeeds
		await page.fill('input[name="email"]', TEST_USER_EMAIL);
		await page.fill('input[name="password"]', newPassword);
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/dashboard/);

		// 6. Re-using the same reset link must fail
		await page.context().clearCookies();
		await page.goto(resetPath!);
		await expect(page.getByTestId('token-error')).toBeVisible();

		// 7. Old password must no longer work
		await page.goto('/login');
		await page.fill('input[name="email"]', TEST_USER_EMAIL);
		await page.fill('input[name="password"]', TEST_USER_INITIAL_PW);
		await page.click('button[type="submit"]');
		await expect(page.locator('text=Ungültige Anmeldedaten')).toBeVisible();
	});

	test('rejects mismatched passwords', async ({ page }) => {
		await page.goto('/passwort-zuruecksetzen');
		await page.fill('input[name="email"]', TEST_USER_EMAIL);
		await page.click('button[type="submit"]');
		await expect(page.getByTestId('reset-confirmation')).toBeVisible();

		const mail = latestEmailFor(TEST_USER_EMAIL);
		const resetPath = extractResetPath(mail!.body);

		await page.goto(resetPath!);
		await page.fill('input[name="password"]', 'passwortEins1');
		await page.fill('input[name="passwordConfirm"]', 'passwortZwei2');
		await page.click('button[type="submit"]');
		await expect(page.locator('text=stimmen nicht überein')).toBeVisible();
	});

	test('HTML5 validation enforces minimum password length', async ({ page }) => {
		await page.goto('/passwort-zuruecksetzen');
		await page.fill('input[name="email"]', TEST_USER_EMAIL);
		await page.click('button[type="submit"]');
		await expect(page.getByTestId('reset-confirmation')).toBeVisible();

		const mail = latestEmailFor(TEST_USER_EMAIL);
		const resetPath = extractResetPath(mail!.body);

		await page.goto(resetPath!);
		await page.fill('input[name="password"]', 'kurz');
		await page.fill('input[name="passwordConfirm"]', 'kurz');
		// HTML5 minlength keeps us on the form page (no network submit)
		await expect(page.locator('input[name="password"]:invalid')).toBeVisible();
	});

	test('empty email shows validation error', async ({ page }) => {
		await page.goto('/passwort-zuruecksetzen');
		await page.click('button[type="submit"]');
		// HTML5 required blocks submit
		await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
	});
});

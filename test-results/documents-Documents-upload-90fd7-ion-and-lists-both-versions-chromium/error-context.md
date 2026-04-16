# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: documents.spec.ts >> Documents upload >> uploads a new version and lists both versions
- Location: e2e/documents.spec.ts:49:2

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Aktuell')
Expected: visible
Error: strict mode violation: locator('text=Aktuell') resolved to 3 elements:
    1) <a href="/dokumente/2/download" class="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800">Aktuelle Version herunterladen</a> aka getByRole('link', { name: 'Aktuelle Version herunterladen' })
    2) <p class="text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Aktuelle Datei</p> aka getByText('Aktuelle Datei')
    3) <span class="rounded bg-green-100 dark:bg-green-900/40 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">Aktuell</span> aka getByText('Aktuell', { exact: true })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Aktuell')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "Förderverein FF" [ref=e6] [cursor=pointer]:
        - /url: /dashboard
      - generic [ref=e7]:
        - generic [ref=e8]: Administrator
        - generic [ref=e9]: vorstand
        - button "Zum dunklen Modus wechseln" [ref=e10]:
          - img [ref=e11]
  - generic [ref=e13]:
    - navigation [ref=e14]:
      - list [ref=e15]:
        - listitem [ref=e16]:
          - link "📊 Dashboard" [ref=e17] [cursor=pointer]:
            - /url: /dashboard
        - listitem [ref=e18]:
          - link "👥 Mitglieder" [ref=e19] [cursor=pointer]:
            - /url: /mitglieder
        - listitem [ref=e20]:
          - link "💶 Beiträge" [ref=e21] [cursor=pointer]:
            - /url: /beitraege
        - listitem [ref=e22]:
          - link "📅 Veranstaltungen" [ref=e23] [cursor=pointer]:
            - /url: /veranstaltungen
        - listitem [ref=e24]:
          - link "📄 Dokumente" [ref=e25] [cursor=pointer]:
            - /url: /dokumente
        - listitem [ref=e26]:
          - link "📝 Protokolle" [ref=e27] [cursor=pointer]:
            - /url: /protokolle
        - listitem [ref=e28]:
          - link "📥 Import" [ref=e29] [cursor=pointer]:
            - /url: /import
      - button "Zum dunklen Modus wechseln" [ref=e31]:
        - img [ref=e32]
        - generic [ref=e34]: Dunkler Modus
      - button "Abmelden" [ref=e37]
      - generic [ref=e38]:
        - link "Datenschutz" [ref=e39] [cursor=pointer]:
          - /url: /datenschutz
        - link "Impressum" [ref=e40] [cursor=pointer]:
          - /url: /impressum
    - main [ref=e41]:
      - link "← Zurück" [ref=e43] [cursor=pointer]:
        - /url: /dokumente
      - generic [ref=e44]:
        - generic [ref=e45]:
          - generic [ref=e46]:
            - heading "Versions Dokument" [level=1] [ref=e47]
            - generic [ref=e48]:
              - generic [ref=e49]: Sonstiges
              - generic [ref=e50]: 2 Versionen
          - link "Aktuelle Version herunterladen" [ref=e51] [cursor=pointer]:
            - /url: /dokumente/2/download
        - generic [ref=e53]:
          - generic [ref=e54]:
            - paragraph [ref=e55]: Aktuelle Datei
            - paragraph [ref=e56]: version2.pdf
          - generic [ref=e57]:
            - paragraph [ref=e58]: Hochgeladen von
            - paragraph [ref=e59]: Administrator
          - generic [ref=e60]:
            - paragraph [ref=e61]: Erstellt am
            - paragraph [ref=e62]: 16.4.2026
        - generic [ref=e63]:
          - heading "Neue Version hochladen" [level=2] [ref=e64]
          - generic [ref=e65]:
            - generic [ref=e66]:
              - generic [ref=e67]: Datei * (max. 10 MB)
              - button "Datei * (max. 10 MB)" [ref=e68]
              - paragraph [ref=e69]: "Erlaubt: PDF, DOCX, JPG, PNG, GIF, WebP"
            - button "Neue Version hochladen" [ref=e70]
        - generic [ref=e71]:
          - heading "Versionshistorie" [level=2] [ref=e72]
          - list [ref=e73]:
            - listitem [ref=e74]:
              - generic [ref=e75]:
                - generic [ref=e76]:
                  - generic [ref=e77]: v2
                  - generic [ref=e78]: Aktuell
                - paragraph [ref=e79]: version2.pdf
                - paragraph [ref=e80]: 16.4.2026, 23:30:46 · 30 B
              - link "Herunterladen" [ref=e81] [cursor=pointer]:
                - /url: /dokumente/2/download?version=2
            - listitem [ref=e82]:
              - generic [ref=e83]:
                - generic [ref=e85]: v1
                - paragraph [ref=e86]: version1.pdf
                - paragraph [ref=e87]: 16.4.2026, 23:30:46 · 22 B
              - link "Herunterladen" [ref=e88] [cursor=pointer]:
                - /url: /dokumente/2/download?version=1
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Documents upload', () => {
  4  | 	test.beforeEach(async ({ page }) => {
  5  | 		await page.goto('/login');
  6  | 		await page.fill('input[name="email"]', 'admin@foerderverein.de');
  7  | 		await page.fill('input[name="password"]', 'admin123');
  8  | 		await page.click('button[type="submit"]');
  9  | 		await expect(page).toHaveURL(/\/dashboard/);
  10 | 	});
  11 | 
  12 | 	// Regression test for #21: uploading a document with a mixed-case category
  13 | 	// value must succeed because the server normalizes it to lowercase before
  14 | 	// inserting. Without that normalization, the DB CHECK constraint on the
  15 | 	// lowercase enum would reject the row.
  16 | 	test('normalizes mixed-case category on upload', async ({ page }) => {
  17 | 		await page.goto('/dokumente/neu');
  18 | 
  19 | 		await page.fill('input[name="title"]', 'Case Test Dokument');
  20 | 
  21 | 		// Force a mixed-case value into the select — the form UI only exposes
  22 | 		// lowercase options, so we rewrite the option's value to prove the
  23 | 		// server-side toLowerCase() is what keeps the upload working.
  24 | 		await page.locator('select[name="category"]').evaluate((el) => {
  25 | 			const select = el as HTMLSelectElement;
  26 | 			const option = Array.from(select.options).find((o) => o.value === 'satzung');
  27 | 			if (!option) throw new Error('expected satzung option');
  28 | 			option.value = 'Satzung';
  29 | 			select.value = 'Satzung';
  30 | 		});
  31 | 
  32 | 		await page.setInputFiles('input[name="file"]', {
  33 | 			name: 'case-test.pdf',
  34 | 			mimeType: 'application/pdf',
  35 | 			buffer: Buffer.from('%PDF-1.4\n% test\n')
  36 | 		});
  37 | 
  38 | 		await page.click('button[type="submit"]');
  39 | 
  40 | 		await expect(page).toHaveURL(/\/dokumente$/);
  41 | 		const row = page.locator('tr', { hasText: 'Case Test Dokument' }).first();
  42 | 		await expect(row).toBeVisible();
  43 | 		await expect(row).toContainText('Satzung');
  44 | 	});
  45 | 
  46 | 	// Issue #7: Document versioning. Uploading a new file on an existing
  47 | 	// document must produce a v2 entry while preserving v1 as a separate
  48 | 	// downloadable file.
  49 | 	test('uploads a new version and lists both versions', async ({ page }) => {
  50 | 		// Initial upload — creates v1
  51 | 		await page.goto('/dokumente/neu');
  52 | 		await page.fill('input[name="title"]', 'Versions Dokument');
  53 | 		await page.locator('select[name="category"]').selectOption('sonstiges');
  54 | 		await page.setInputFiles('input[name="file"]', {
  55 | 			name: 'version1.pdf',
  56 | 			mimeType: 'application/pdf',
  57 | 			buffer: Buffer.from('%PDF-1.4\n% v1 content\n')
  58 | 		});
  59 | 		await page.click('button[type="submit"]');
  60 | 		await expect(page).toHaveURL(/\/dokumente$/);
  61 | 
  62 | 		// Navigate to detail page via title link (desktop table row, mobile card is hidden)
  63 | 		await page
  64 | 			.locator('table a', { hasText: 'Versions Dokument' })
  65 | 			.first()
  66 | 			.click();
  67 | 		await expect(page).toHaveURL(/\/dokumente\/\d+$/);
  68 | 		await expect(page.locator('h1')).toHaveText('Versions Dokument');
  69 | 		await expect(page.locator('text=1 Version')).toBeVisible();
  70 | 
  71 | 		// Upload a new version
  72 | 		await page.setInputFiles('input[name="file"]', {
  73 | 			name: 'version2.pdf',
  74 | 			mimeType: 'application/pdf',
  75 | 			buffer: Buffer.from('%PDF-1.4\n% v2 content updated\n')
  76 | 		});
  77 | 		await page.locator('button', { hasText: 'Neue Version hochladen' }).click();
  78 | 
  79 | 		// Detail page should now show 2 versions and current = v2
  80 | 		await expect(page.locator('text=2 Versionen')).toBeVisible();
  81 | 		await expect(page.locator('text=v2').first()).toBeVisible();
  82 | 		await expect(page.locator('text=v1').first()).toBeVisible();
> 83 | 		await expect(page.locator('text=Aktuell')).toBeVisible();
     |                                              ^ Error: expect(locator).toBeVisible() failed
  84 | 
  85 | 		// Both version download links should be present
  86 | 		const v1Link = page.locator('a[href*="version=1"]');
  87 | 		const v2Link = page.locator('a[href*="version=2"]');
  88 | 		await expect(v1Link).toHaveCount(1);
  89 | 		await expect(v2Link).toHaveCount(1);
  90 | 	});
  91 | });
  92 | 
```
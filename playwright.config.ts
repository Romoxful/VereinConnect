import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: 'e2e',
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: 'html',
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],
	webServer: {
		command: 'DB_PATH=./data/test-e2e.db npm run build && DB_PATH=./data/test-e2e.db npm run preview',
		url: 'http://localhost:4173',
		reuseExistingServer: !process.env.CI,
		env: {
			DB_PATH: './data/test-e2e.db'
		}
	}
});

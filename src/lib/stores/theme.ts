import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function getInitialTheme(): Theme {
	if (!browser) return 'light';
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark') return stored;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
	if (!browser) return;
	const root = document.documentElement;
	if (theme === 'dark') root.classList.add('dark');
	else root.classList.remove('dark');
}

function createThemeStore() {
	const initial = getInitialTheme();
	const { subscribe, set, update } = writable<Theme>(initial);

	if (browser) {
		applyTheme(initial);

		const media = window.matchMedia('(prefers-color-scheme: dark)');
		media.addEventListener('change', (e) => {
			if (localStorage.getItem(STORAGE_KEY) === null) {
				const next: Theme = e.matches ? 'dark' : 'light';
				applyTheme(next);
				set(next);
			}
		});
	}

	return {
		subscribe,
		set: (value: Theme) => {
			if (browser) {
				localStorage.setItem(STORAGE_KEY, value);
				applyTheme(value);
			}
			set(value);
		},
		toggle: () => {
			update((current) => {
				const next: Theme = current === 'dark' ? 'light' : 'dark';
				if (browser) {
					localStorage.setItem(STORAGE_KEY, next);
					applyTheme(next);
				}
				return next;
			});
		}
	};
}

export const theme = createThemeStore();

<script lang="ts">
	import { theme } from '$lib/stores/theme';

	let { variant = 'header' }: { variant?: 'header' | 'sidebar' } = $props();

	const headerClasses =
		'rounded p-1.5 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-white';
	const sidebarClasses =
		'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700';
</script>

<button
	type="button"
	class={variant === 'header' ? headerClasses : sidebarClasses}
	onclick={() => theme.toggle()}
	aria-label={$theme === 'dark' ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'}
	title={$theme === 'dark' ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'}
	data-testid="theme-toggle"
>
	{#if $theme === 'dark'}
		<!-- Sun icon -->
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 3v1m0 16v1m8.485-8.485h-1M4.515 12h-1m14.142-5.657l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
			/>
		</svg>
		{#if variant === 'sidebar'}<span>Heller Modus</span>{/if}
	{:else}
		<!-- Moon icon -->
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
			/>
		</svg>
		{#if variant === 'sidebar'}<span>Dunkler Modus</span>{/if}
	{/if}
</button>

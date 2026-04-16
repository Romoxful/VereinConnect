<script lang="ts">
	import type { PageData } from './$types';
	import EventCalendar from '$lib/components/EventCalendar.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Kalender - Veranstaltungen - Förderverein FF</title>
</svelte:head>

<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100">Veranstaltungen</h1>
	<div class="flex flex-wrap gap-2">
		<div class="inline-flex rounded-lg border border-gray-300 dark:border-slate-600 text-sm">
			<a
				href="/veranstaltungen"
				class="rounded-l-lg px-3 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
			>
				📋 Liste
			</a>
			<a
				href="/veranstaltungen/kalender"
				class="rounded-r-lg bg-red-700 px-3 py-2 text-white dark:bg-red-800"
				aria-current="page"
			>
				🗓️ Kalender
			</a>
		</div>
		<a
			href="/api/veranstaltungen/export"
			class="inline-flex items-center rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
		>
			📅 Kalender (ICS)
		</a>
		{#if data.user?.role === 'vorstand'}
			<a
				href="/veranstaltungen/neu"
				class="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
			>
				+ Neue Veranstaltung
			</a>
		{/if}
	</div>
</div>

<EventCalendar events={data.events} />

{#if data.events.length === 0}
	<p class="mt-4 text-sm text-gray-500 dark:text-slate-400">Noch keine Veranstaltungen erstellt.</p>
{/if}

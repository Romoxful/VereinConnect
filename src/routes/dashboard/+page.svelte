<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dashboard - Förderverein FF</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-slate-100">Dashboard</h1>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	<a href="/mitglieder" class="rounded-lg bg-white dark:bg-slate-800 p-6 shadow hover:shadow-md transition-shadow">
		<div class="text-3xl">👥</div>
		<h2 class="mt-2 text-lg font-semibold text-gray-900 dark:text-slate-100">Mitglieder</h2>
		<p class="text-3xl font-bold text-red-700 dark:text-red-400">{data.stats.memberCount}</p>
		<p class="text-sm text-gray-500 dark:text-slate-400">Aktive Mitglieder</p>
	</a>

	<a href="/veranstaltungen" class="rounded-lg bg-white dark:bg-slate-800 p-6 shadow hover:shadow-md transition-shadow">
		<div class="text-3xl">📅</div>
		<h2 class="mt-2 text-lg font-semibold text-gray-900 dark:text-slate-100">Veranstaltungen</h2>
		<p class="text-3xl font-bold text-red-700 dark:text-red-400">{data.stats.upcomingEvents}</p>
		<p class="text-sm text-gray-500 dark:text-slate-400">Kommende Termine</p>
	</a>

	<div class="rounded-lg bg-white dark:bg-slate-800 p-6 shadow">
		<div class="text-3xl">📊</div>
		<h2 class="mt-2 text-lg font-semibold text-gray-900 dark:text-slate-100">Gesamtmitglieder</h2>
		<p class="text-3xl font-bold text-red-700 dark:text-red-400">{data.stats.totalMembers}</p>
		<p class="text-sm text-gray-500 dark:text-slate-400">Insgesamt registriert</p>
	</div>

	<a href="/beitraege" class="rounded-lg bg-white dark:bg-slate-800 p-6 shadow hover:shadow-md transition-shadow">
		<div class="text-3xl">💶</div>
		<h2 class="mt-2 text-lg font-semibold text-gray-900 dark:text-slate-100">Offene Beiträge</h2>
		<p class="text-3xl font-bold text-red-700 dark:text-red-400">{data.stats.openDues}</p>
		<p class="text-sm text-gray-500 dark:text-slate-400">Noch nicht bezahlt</p>
	</a>

	<div class="rounded-lg bg-white dark:bg-slate-800 p-6 shadow">
		<div class="text-3xl">⚠️</div>
		<h2 class="mt-2 text-lg font-semibold text-gray-900 dark:text-slate-100">Überfällig</h2>
		<p class="text-3xl font-bold text-red-700 dark:text-red-400">{data.stats.overdueDues}</p>
		<p class="text-sm text-gray-500 dark:text-slate-400">Überfällige Beiträge</p>
	</div>
</div>

{#if data.upcomingEvents.length > 0}
	<h2 class="mt-8 mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Nächste Veranstaltungen</h2>
	<div class="space-y-3">
		{#each data.upcomingEvents as event}
			<a href="/veranstaltungen/{event.id}" class="block rounded-lg bg-white dark:bg-slate-800 p-4 shadow hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between">
					<div>
						<h3 class="font-medium text-gray-900 dark:text-slate-100">{event.title}</h3>
						<p class="text-sm text-gray-500 dark:text-slate-400">
							{new Date(event.date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
							{#if event.time} um {event.time}{/if}
						</p>
						{#if event.location}
							<p class="text-sm text-gray-400 dark:text-slate-500">{event.location}</p>
						{/if}
					</div>
				</div>
			</a>
		{/each}
	</div>
{/if}

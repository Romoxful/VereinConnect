<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const today = new Date().toISOString().split('T')[0];
	const upcoming = $derived(data.events.filter((e) => e.date >= today));
	const past = $derived(data.events.filter((e) => e.date < today));
</script>

<svelte:head>
	<title>Veranstaltungen - Förderverein FF</title>
</svelte:head>

<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
	<h1 class="text-2xl font-bold text-gray-900">Veranstaltungen</h1>
	{#if data.user?.role === 'vorstand'}
		<a
			href="/veranstaltungen/neu"
			class="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
		>
			+ Neue Veranstaltung
		</a>
	{/if}
</div>

{#if upcoming.length > 0}
	<h2 class="mb-3 text-lg font-semibold text-gray-700">Kommende Termine</h2>
	<div class="mb-8 space-y-3">
		{#each upcoming as event}
			<a href="/veranstaltungen/{event.id}" class="block rounded-lg bg-white p-4 shadow hover:shadow-md transition-shadow">
				<div class="flex items-start justify-between gap-3">
					<div>
						<h3 class="font-medium text-gray-900">{event.title}</h3>
						<p class="text-sm text-gray-500">
							{new Date(event.date).toLocaleDateString('de-DE', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
							{#if event.time} um {event.time}{/if}
						</p>
						{#if event.location}
							<p class="text-sm text-gray-400">{event.location}</p>
						{/if}
					</div>
					<span class="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
						{event.rsvpCount} Zusage{event.rsvpCount !== 1 ? 'n' : ''}
					</span>
				</div>
			</a>
		{/each}
	</div>
{/if}

{#if past.length > 0}
	<h2 class="mb-3 text-lg font-semibold text-gray-700">Vergangene Termine</h2>
	<div class="space-y-3">
		{#each past as event}
			<a href="/veranstaltungen/{event.id}" class="block rounded-lg bg-white p-4 shadow opacity-75 hover:opacity-100 transition-opacity">
				<div class="flex items-start justify-between gap-3">
					<div>
						<h3 class="font-medium text-gray-900">{event.title}</h3>
						<p class="text-sm text-gray-500">
							{new Date(event.date).toLocaleDateString('de-DE', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
						</p>
					</div>
					<span class="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
						{event.rsvpCount} Zusage{event.rsvpCount !== 1 ? 'n' : ''}
					</span>
				</div>
			</a>
		{/each}
	</div>
{/if}

{#if data.events.length === 0}
	<p class="text-gray-500">Noch keine Veranstaltungen erstellt.</p>
{/if}

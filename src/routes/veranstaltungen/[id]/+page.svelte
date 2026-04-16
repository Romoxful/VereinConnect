<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let e = $derived(data.event);
	let isVorstand = $derived(data.user?.role === 'vorstand');
	let confirmDelete = $state(false);

	const statusLabels: Record<string, string> = {
		zugesagt: 'Zugesagt',
		abgesagt: 'Abgesagt',
		vielleicht: 'Vielleicht'
	};

	const statusColors: Record<string, string> = {
		zugesagt: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
		abgesagt: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
		vielleicht: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'
	};
</script>

<svelte:head>
	<title>{e.title} - Förderverein FF</title>
</svelte:head>

<div class="mb-6">
	<a href="/veranstaltungen" class="text-sm text-red-700 dark:text-red-400 hover:underline">&larr; Zurück</a>
</div>

<div class="max-w-2xl">
	<h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-slate-100">{e.title}</h1>
	<p class="mb-1 text-sm text-gray-500 dark:text-slate-400">
		{new Date(e.date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
		{#if e.time} um {e.time}{/if}
	</p>
	{#if e.location}
		<p class="mb-4 text-sm text-gray-400 dark:text-slate-500">{e.location}</p>
	{/if}
	{#if e.description}
		<p class="mb-6 text-gray-700 dark:text-slate-300">{e.description}</p>
	{/if}

	<!-- RSVP Section -->
	<div class="mb-6 rounded-lg bg-white dark:bg-slate-800 p-4 shadow">
		<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-slate-100">Rückmeldung</h2>

		{#if data.myRsvp}
			<p class="mb-3 text-sm text-gray-500 dark:text-slate-400">
				Dein Status: <span class="rounded-full px-2 py-0.5 text-xs font-medium {statusColors[data.myRsvp.status]}">{statusLabels[data.myRsvp.status]}</span>
			</p>
		{/if}

		<form method="POST" action="?/rsvp" class="flex flex-wrap gap-2">
			<button type="submit" name="status" value="zugesagt"
				class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
				Zusagen
			</button>
			<button type="submit" name="status" value="vielleicht"
				class="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600">
				Vielleicht
			</button>
			<button type="submit" name="status" value="abgesagt"
				class="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600">
				Absagen
			</button>
		</form>
	</div>

	<!-- RSVP List -->
	{#if data.rsvps.length > 0}
		<div class="rounded-lg bg-white dark:bg-slate-800 p-4 shadow">
			<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-slate-100">
				Rückmeldungen ({data.rsvps.length})
			</h2>
			<ul class="space-y-2">
				{#each data.rsvps as rsvp}
					<li class="flex items-center justify-between text-sm">
						<span class="text-gray-700 dark:text-slate-300">{rsvp.userName}</span>
						<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusColors[rsvp.status]}">
							{statusLabels[rsvp.status]}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Delete (Vorstand only) -->
	{#if isVorstand}
		<div class="mt-8 border-t border-gray-200 dark:border-slate-700 pt-6">
			{#if !confirmDelete}
				<button
					onclick={() => (confirmDelete = true)}
					class="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
				>
					Veranstaltung löschen
				</button>
			{:else}
				<div class="rounded-lg bg-red-50 dark:bg-red-950 p-4">
					<p class="mb-3 text-sm text-red-700 dark:text-red-400">Veranstaltung wirklich löschen?</p>
					<form method="POST" action="?/delete" class="inline">
						<button type="submit" class="rounded-lg bg-red-700 px-4 py-2 text-sm text-white hover:bg-red-800">
							Ja, löschen
						</button>
					</form>
					<button
						onclick={() => (confirmDelete = false)}
						class="ml-2 rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
					>
						Abbrechen
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

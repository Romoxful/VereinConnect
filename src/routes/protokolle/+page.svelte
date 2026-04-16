<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search = $state('');
	let dateFilter = $state('');

	let filtered = $derived(
		data.protocols.filter((p) => {
			const term = search.toLowerCase();
			const matchesSearch =
				p.title.toLowerCase().includes(term) ||
				p.attendees.toLowerCase().includes(term);
			const matchesDate = !dateFilter || p.date.startsWith(dateFilter);
			return matchesSearch && matchesDate;
		})
	);
</script>

<svelte:head>
	<title>Protokolle - Förderverein FF</title>
</svelte:head>

<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
	<h1 class="text-2xl font-bold text-gray-900">Sitzungsprotokolle</h1>
	{#if data.user?.role === 'vorstand'}
		<a
			href="/protokolle/neu"
			class="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
		>
			+ Neues Protokoll
		</a>
	{/if}
</div>

<div class="mb-4 flex flex-col gap-3 sm:flex-row">
	<input
		type="search"
		placeholder="Suchen..."
		bind:value={search}
		class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none sm:max-w-xs"
	/>
	<input
		type="month"
		bind:value={dateFilter}
		class="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none sm:max-w-xs"
	/>
</div>

{#if filtered.length === 0}
	<p class="text-gray-500">Keine Protokolle gefunden.</p>
{:else}
	<!-- Mobile cards -->
	<div class="space-y-3 sm:hidden">
		{#each filtered as protocol}
			<a href="/protokolle/{protocol.id}" class="block rounded-lg bg-white p-4 shadow">
				<p class="font-medium text-gray-900">{protocol.title}</p>
				<p class="text-sm text-gray-500">
					{new Date(protocol.date).toLocaleDateString('de-DE')}
				</p>
				<p class="mt-1 text-xs text-gray-400">
					Teilnehmer: {protocol.attendees}
				</p>
			</a>
		{/each}
	</div>

	<!-- Desktop table -->
	<div class="hidden overflow-x-auto rounded-lg bg-white shadow sm:block">
		<table class="w-full text-left text-sm">
			<thead class="border-b bg-gray-50 text-xs uppercase text-gray-500">
				<tr>
					<th class="px-4 py-3">Datum</th>
					<th class="px-4 py-3">Titel</th>
					<th class="px-4 py-3">Teilnehmer</th>
					<th class="px-4 py-3">Erstellt von</th>
				</tr>
			</thead>
			<tbody class="divide-y">
				{#each filtered as protocol}
					<tr class="hover:bg-gray-50">
						<td class="px-4 py-3 text-gray-500">
							{new Date(protocol.date).toLocaleDateString('de-DE')}
						</td>
						<td class="px-4 py-3">
							<a href="/protokolle/{protocol.id}" class="font-medium text-red-700 hover:underline">
								{protocol.title}
							</a>
						</td>
						<td class="px-4 py-3 text-gray-500">{protocol.attendees}</td>
						<td class="px-4 py-3 text-gray-500">{protocol.creatorName ?? '–'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

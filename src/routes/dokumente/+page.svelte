<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search = $state('');
	let categoryFilter = $state('');

	const categoryLabels: Record<string, string> = {
		satzung: 'Satzung',
		bescheide: 'Bescheide',
		finanzen: 'Finanzen',
		sonstiges: 'Sonstiges'
	};

	const categoryColors: Record<string, string> = {
		satzung: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
		bescheide: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300',
		finanzen: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
		sonstiges: 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200'
	};

	let filtered = $derived(
		data.documents.filter((d) => {
			const term = search.toLowerCase();
			const matchesSearch =
				d.title.toLowerCase().includes(term) ||
				d.originalName.toLowerCase().includes(term);
			const matchesCategory = !categoryFilter || d.category === categoryFilter;
			return matchesSearch && matchesCategory;
		})
	);
</script>

<svelte:head>
	<title>Dokumente - Förderverein FF</title>
</svelte:head>

<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100">Dokumente</h1>
	{#if data.user?.role === 'vorstand'}
		<a
			href="/dokumente/neu"
			class="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
		>
			+ Dokument hochladen
		</a>
	{/if}
</div>

<div class="mb-4 flex flex-col gap-3 sm:flex-row">
	<input
		type="search"
		placeholder="Suchen..."
		bind:value={search}
		class="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none sm:max-w-xs"
	/>
	<select
		bind:value={categoryFilter}
		class="rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none sm:max-w-xs"
	>
		<option value="">Alle Kategorien</option>
		<option value="satzung">Satzung</option>
		<option value="bescheide">Bescheide</option>
		<option value="finanzen">Finanzen</option>
		<option value="sonstiges">Sonstiges</option>
	</select>
</div>

{#if filtered.length === 0}
	<p class="text-gray-500 dark:text-slate-400">Keine Dokumente gefunden.</p>
{:else}
	<!-- Mobile cards -->
	<div class="space-y-3 sm:hidden">
		{#each filtered as doc}
			<div class="rounded-lg bg-white dark:bg-slate-800 p-4 shadow">
				<div class="flex items-start justify-between">
					<div class="min-w-0 flex-1">
						<a href="/dokumente/{doc.id}" class="font-medium text-gray-900 dark:text-slate-100 hover:text-red-700 dark:hover:text-red-400 hover:underline">{doc.title}</a>
						<p class="truncate text-sm text-gray-500 dark:text-slate-400">{doc.originalName}</p>
						<div class="mt-1 flex items-center gap-2">
							<span class="rounded-full px-2 py-0.5 text-xs font-medium {categoryColors[doc.category]}">
								{categoryLabels[doc.category]}
							</span>
							<span class="text-xs text-gray-400 dark:text-slate-500">
								{new Date(doc.createdAt).toLocaleDateString('de-DE')}
							</span>
						</div>
					</div>
					<div class="ml-2 flex gap-1">
						<a
							href="/dokumente/{doc.id}/download"
							class="rounded bg-gray-100 dark:bg-slate-700 px-2 py-1 text-xs text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
						>
							Laden
						</a>
						{#if data.user?.role === 'vorstand'}
							<form method="POST" action="?/delete">
								<input type="hidden" name="id" value={doc.id} />
								<button
									type="submit"
									class="rounded bg-red-100 dark:bg-red-900/40 px-2 py-1 text-xs text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60"
									onclick={(e) => { if (!confirm('Dokument wirklich löschen?')) e.preventDefault(); }}
								>
									Löschen
								</button>
							</form>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Desktop table -->
	<div class="hidden overflow-x-auto rounded-lg bg-white dark:bg-slate-800 shadow sm:block">
		<table class="w-full text-left text-sm">
			<thead class="border-b bg-gray-50 dark:bg-slate-800/50 text-xs uppercase text-gray-500 dark:text-slate-400">
				<tr>
					<th class="px-4 py-3">Titel</th>
					<th class="px-4 py-3">Dateiname</th>
					<th class="px-4 py-3">Kategorie</th>
					<th class="px-4 py-3">Hochgeladen von</th>
					<th class="px-4 py-3">Datum</th>
					<th class="px-4 py-3">Aktionen</th>
				</tr>
			</thead>
			<tbody class="divide-y">
				{#each filtered as doc}
					<tr class="hover:bg-gray-50 dark:hover:bg-slate-700">
						<td class="px-4 py-3 font-medium">
							<a href="/dokumente/{doc.id}" class="text-gray-900 dark:text-slate-100 hover:text-red-700 dark:hover:text-red-400 hover:underline">{doc.title}</a>
						</td>
						<td class="px-4 py-3 text-gray-500 dark:text-slate-400">{doc.originalName}</td>
						<td class="px-4 py-3">
							<span class="rounded-full px-2 py-0.5 text-xs font-medium {categoryColors[doc.category]}">
								{categoryLabels[doc.category]}
							</span>
						</td>
						<td class="px-4 py-3 text-gray-500 dark:text-slate-400">{doc.uploaderName ?? '–'}</td>
						<td class="px-4 py-3 text-gray-500 dark:text-slate-400">
							{new Date(doc.createdAt).toLocaleDateString('de-DE')}
						</td>
						<td class="px-4 py-3">
							<div class="flex gap-2">
								<a
									href="/dokumente/{doc.id}/download"
									class="rounded bg-gray-100 dark:bg-slate-700 px-2 py-1 text-xs text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
								>
									Herunterladen
								</a>
								{#if data.user?.role === 'vorstand'}
									<form method="POST" action="?/delete">
										<input type="hidden" name="id" value={doc.id} />
										<button
											type="submit"
											class="rounded bg-red-100 dark:bg-red-900/40 px-2 py-1 text-xs text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60"
											onclick={(e) => { if (!confirm('Dokument wirklich löschen?')) e.preventDefault(); }}
										>
											Löschen
										</button>
									</form>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

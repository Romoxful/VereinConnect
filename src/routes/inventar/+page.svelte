<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchTerm = $state('');
	let categoryFilter = $state<string>('alle');
	let conditionFilter = $state<string>('alle');

	const conditionLabels: Record<string, string> = {
		neu: 'Neu',
		gut: 'Gut',
		befriedigend: 'Befriedigend',
		mangelhaft: 'Mangelhaft',
		defekt: 'Defekt'
	};

	const conditionColors: Record<string, string> = {
		neu: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
		gut: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
		befriedigend: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
		mangelhaft: 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300',
		defekt: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
	};

	let filtered = $derived(
		data.items.filter((item) => {
			const term = searchTerm.trim().toLowerCase();
			const matchesSearch =
				!term ||
				item.name.toLowerCase().includes(term) ||
				(item.description?.toLowerCase().includes(term) ?? false) ||
				(item.location?.toLowerCase().includes(term) ?? false);
			const matchesCategory =
				categoryFilter === 'alle' ||
				(categoryFilter === 'none' && item.categoryId === null) ||
				String(item.categoryId) === categoryFilter;
			const matchesCondition = conditionFilter === 'alle' || item.condition === conditionFilter;
			return matchesSearch && matchesCategory && matchesCondition;
		})
	);

	let totalValue = $derived(
		filtered.reduce((sum, item) => {
			const v = item.value ? parseFloat(item.value) : 0;
			return sum + (isNaN(v) ? 0 : v * item.quantity);
		}, 0)
	);
</script>

<svelte:head>
	<title>Inventar - Förderverein FF</title>
</svelte:head>

<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100">Inventar</h1>
	{#if data.user?.role === 'vorstand'}
		<div class="flex flex-wrap gap-2">
			<a
				href="/inventar/kategorien"
				class="inline-flex items-center rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
			>
				Kategorien
			</a>
			<a
				href="/inventar/neu"
				class="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
			>
				+ Neuer Artikel
			</a>
		</div>
	{/if}
</div>

<div class="mb-4 grid gap-3 sm:grid-cols-3">
	<div>
		<label for="searchTerm" class="block text-xs font-medium text-gray-500 dark:text-slate-400">Suche</label>
		<input
			id="searchTerm"
			type="search"
			bind:value={searchTerm}
			placeholder="Name, Beschreibung, Standort…"
			class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
		/>
	</div>
	<div>
		<label for="categoryFilter" class="block text-xs font-medium text-gray-500 dark:text-slate-400">Kategorie</label>
		<select
			id="categoryFilter"
			bind:value={categoryFilter}
			class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
		>
			<option value="alle">Alle</option>
			<option value="none">— Ohne Kategorie —</option>
			{#each data.categories as c}
				<option value={String(c.id)}>{c.name}</option>
			{/each}
		</select>
	</div>
	<div>
		<label for="conditionFilter" class="block text-xs font-medium text-gray-500 dark:text-slate-400">Zustand</label>
		<select
			id="conditionFilter"
			bind:value={conditionFilter}
			class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
		>
			<option value="alle">Alle</option>
			<option value="neu">Neu</option>
			<option value="gut">Gut</option>
			<option value="befriedigend">Befriedigend</option>
			<option value="mangelhaft">Mangelhaft</option>
			<option value="defekt">Defekt</option>
		</select>
	</div>
</div>

<div class="mb-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-slate-400">
	<span>Angezeigt: <strong class="text-gray-900 dark:text-slate-100">{filtered.length}</strong> von {data.items.length}</span>
	<span>Gesamtwert: <strong class="text-gray-900 dark:text-slate-100">{totalValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong></span>
</div>

{#if filtered.length === 0}
	<p class="text-gray-500 dark:text-slate-400">Keine Artikel gefunden.</p>
{:else}
	<div class="space-y-3">
		{#each filtered as item}
			<a
				href="/inventar/{item.id}"
				class="block rounded-lg bg-white dark:bg-slate-800 p-4 shadow hover:shadow-md transition-shadow"
			>
				<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
					<div class="min-w-0 flex-1">
						<h3 class="font-medium text-gray-900 dark:text-slate-100">{item.name}</h3>
						<div class="mt-1 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-slate-400">
							<span>Menge: {item.quantity}</span>
							{#if item.categoryName}
								<span>Kategorie: {item.categoryName}</span>
							{/if}
							{#if item.location}
								<span>Standort: {item.location}</span>
							{/if}
							{#if item.value}
								<span>Wert: {parseFloat(item.value).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
							{/if}
						</div>
					</div>
					<div class="flex shrink-0 flex-wrap gap-2">
						<span class="rounded-full px-2 py-0.5 text-xs font-medium {conditionColors[item.condition]}">
							{conditionLabels[item.condition]}
						</span>
					</div>
				</div>
			</a>
		{/each}
	</div>
{/if}

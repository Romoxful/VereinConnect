<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editing = $state(false);

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

	let item = $derived(data.item);
	let isVorstand = $derived(data.user?.role === 'vorstand');
	let totalValue = $derived.by(() => {
		if (!item.value) return null;
		const v = parseFloat(item.value);
		if (isNaN(v)) return null;
		return v * item.quantity;
	});
</script>

<svelte:head>
	<title>{item.name} - Inventar - Förderverein FF</title>
</svelte:head>

<div class="mb-6">
	<a href="/inventar" class="text-sm text-red-700 dark:text-red-400 hover:underline">&larr; Zurück</a>
</div>

{#if form?.error}
	<div class="mb-4 rounded bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">{form.error}</div>
{/if}

{#if editing && isVorstand}
	<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-slate-100">Artikel bearbeiten</h1>
	<form method="POST" action="?/update" class="max-w-2xl space-y-4">
		<div>
			<label for="name" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Name *</label>
			<input
				id="name"
				name="name"
				required
				value={item.name}
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			/>
		</div>

		<div>
			<label for="description" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Beschreibung</label>
			<textarea
				id="description"
				name="description"
				rows="3"
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			>{item.description ?? ''}</textarea>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="categoryId" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Kategorie</label>
				<select id="categoryId" name="categoryId"
					class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none">
					<option value="">— Ohne Kategorie —</option>
					{#each data.categories as c}
						<option value={c.id} selected={item.categoryId === c.id}>{c.name}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="quantity" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Menge *</label>
				<input id="quantity" name="quantity" type="number" min="1" step="1" required value={item.quantity}
					class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
			</div>

			<div>
				<label for="location" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Standort</label>
				<input id="location" name="location" value={item.location ?? ''}
					class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
			</div>

			<div>
				<label for="condition" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Zustand</label>
				<select id="condition" name="condition"
					class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none">
					<option value="neu" selected={item.condition === 'neu'}>Neu</option>
					<option value="gut" selected={item.condition === 'gut'}>Gut</option>
					<option value="befriedigend" selected={item.condition === 'befriedigend'}>Befriedigend</option>
					<option value="mangelhaft" selected={item.condition === 'mangelhaft'}>Mangelhaft</option>
					<option value="defekt" selected={item.condition === 'defekt'}>Defekt</option>
				</select>
			</div>

			<div>
				<label for="acquisitionDate" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Anschaffungsdatum</label>
				<input id="acquisitionDate" name="acquisitionDate" type="date" value={item.acquisitionDate ?? ''}
					class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
			</div>

			<div>
				<label for="value" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Wert (€ pro Stück)</label>
				<input id="value" name="value" type="number" min="0" step="0.01" value={item.value ?? ''}
					class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
			</div>
		</div>

		<div>
			<label for="notes" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Hinweise</label>
			<textarea id="notes" name="notes" rows="3"
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			>{item.notes ?? ''}</textarea>
		</div>

		<div class="flex gap-3">
			<button type="submit"
				class="rounded-lg bg-red-700 px-6 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none">
				Speichern
			</button>
			<button type="button"
				class="rounded-lg border border-gray-300 dark:border-slate-600 px-6 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
				onclick={() => (editing = false)}
			>
				Abbrechen
			</button>
		</div>
	</form>
{:else}
	<div class="max-w-2xl">
		<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100">{item.name}</h1>
				<div class="mt-2 flex flex-wrap gap-2">
					<span class="rounded-full px-2 py-0.5 text-xs font-medium {conditionColors[item.condition]}">
						{conditionLabels[item.condition]}
					</span>
					{#if item.categoryName}
						<span class="rounded-full bg-gray-100 dark:bg-slate-700 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-slate-300">
							{item.categoryName}
						</span>
					{/if}
				</div>
			</div>
			{#if isVorstand}
				<div class="flex shrink-0 gap-2">
					<button
						class="rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
						onclick={() => (editing = true)}
					>
						Bearbeiten
					</button>
					<form method="POST" action="?/delete">
						<button type="submit"
							class="rounded-lg bg-red-100 dark:bg-red-900/40 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60"
							onclick={(e) => { if (!confirm('Artikel wirklich löschen?')) e.preventDefault(); }}
						>
							Löschen
						</button>
					</form>
				</div>
			{/if}
		</div>

		<div class="rounded-lg bg-white dark:bg-slate-800 p-6 shadow">
			<div class="grid gap-4 border-b border-gray-200 dark:border-slate-700 pb-4 sm:grid-cols-2">
				<div>
					<p class="text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Menge</p>
					<p class="text-sm text-gray-900 dark:text-slate-100">{item.quantity}</p>
				</div>
				<div>
					<p class="text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Standort</p>
					<p class="text-sm text-gray-900 dark:text-slate-100">{item.location ?? '—'}</p>
				</div>
				<div>
					<p class="text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Anschaffungsdatum</p>
					<p class="text-sm text-gray-900 dark:text-slate-100">
						{item.acquisitionDate ? new Date(item.acquisitionDate).toLocaleDateString('de-DE') : '—'}
					</p>
				</div>
				<div>
					<p class="text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Wert pro Stück</p>
					<p class="text-sm text-gray-900 dark:text-slate-100">
						{item.value ? parseFloat(item.value).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : '—'}
					</p>
				</div>
				{#if totalValue !== null && item.quantity > 1}
					<div class="sm:col-span-2">
						<p class="text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Gesamtwert</p>
						<p class="text-sm text-gray-900 dark:text-slate-100">
							{totalValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
						</p>
					</div>
				{/if}
			</div>

			{#if item.description}
				<div class="mt-4">
					<p class="mb-2 text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Beschreibung</p>
					<p class="whitespace-pre-wrap text-sm text-gray-700 dark:text-slate-300">{item.description}</p>
				</div>
			{/if}

			{#if item.notes}
				<div class="mt-4">
					<p class="mb-2 text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Hinweise</p>
					<p class="whitespace-pre-wrap text-sm text-gray-700 dark:text-slate-300">{item.notes}</p>
				</div>
			{/if}

			<div class="mt-4 border-t border-gray-200 dark:border-slate-700 pt-3 text-xs text-gray-400 dark:text-slate-500">
				{#if item.creatorName}
					Erstellt von {item.creatorName} am {new Date(item.createdAt).toLocaleString('de-DE')}
				{:else}
					Erstellt: {new Date(item.createdAt).toLocaleString('de-DE')}
				{/if}
				{#if item.updatedAt !== item.createdAt}
					&middot; Aktualisiert: {new Date(item.updatedAt).toLocaleString('de-DE')}
				{/if}
			</div>
		</div>
	</div>
{/if}

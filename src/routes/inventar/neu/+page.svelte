<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Neuer Inventarartikel - Förderverein FF</title>
</svelte:head>

<div class="mb-6">
	<a href="/inventar" class="text-sm text-red-700 dark:text-red-400 hover:underline">&larr; Zurück</a>
</div>

<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-slate-100">Neuer Inventarartikel</h1>

{#if form?.error}
	<div class="mb-4 rounded bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">{form.error}</div>
{/if}

<form method="POST" class="max-w-2xl space-y-4">
	<div>
		<label for="name" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Name *</label>
		<input
			id="name"
			name="name"
			required
			value={form?.name ?? ''}
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
		>{form?.description ?? ''}</textarea>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div>
			<label for="categoryId" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Kategorie</label>
			<select
				id="categoryId"
				name="categoryId"
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			>
				<option value="">— Ohne Kategorie —</option>
				{#each data.categories as c}
					<option value={c.id} selected={String(form?.categoryId) === String(c.id)}>{c.name}</option>
				{/each}
			</select>
			{#if data.categories.length === 0}
				<p class="mt-1 text-xs text-gray-500 dark:text-slate-400">
					Noch keine Kategorien. <a href="/inventar/kategorien" class="text-red-700 dark:text-red-400 hover:underline">Jetzt anlegen</a>.
				</p>
			{/if}
		</div>

		<div>
			<label for="quantity" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Menge *</label>
			<input
				id="quantity"
				name="quantity"
				type="number"
				min="1"
				step="1"
				required
				value={form?.quantity ?? 1}
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			/>
		</div>

		<div>
			<label for="location" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Standort</label>
			<input
				id="location"
				name="location"
				value={form?.location ?? ''}
				placeholder="z. B. Lager, Vereinsheim"
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			/>
		</div>

		<div>
			<label for="condition" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Zustand</label>
			<select
				id="condition"
				name="condition"
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			>
				<option value="neu" selected={form?.condition === 'neu'}>Neu</option>
				<option value="gut" selected={!form?.condition || form?.condition === 'gut'}>Gut</option>
				<option value="befriedigend" selected={form?.condition === 'befriedigend'}>Befriedigend</option>
				<option value="mangelhaft" selected={form?.condition === 'mangelhaft'}>Mangelhaft</option>
				<option value="defekt" selected={form?.condition === 'defekt'}>Defekt</option>
			</select>
		</div>

		<div>
			<label for="acquisitionDate" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Anschaffungsdatum</label>
			<input
				id="acquisitionDate"
				name="acquisitionDate"
				type="date"
				value={form?.acquisitionDate ?? ''}
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			/>
		</div>

		<div>
			<label for="value" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Wert (€ pro Stück)</label>
			<input
				id="value"
				name="value"
				type="number"
				min="0"
				step="0.01"
				value={form?.value ?? ''}
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			/>
		</div>
	</div>

	<div>
		<label for="notes" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Hinweise</label>
		<textarea
			id="notes"
			name="notes"
			rows="3"
			class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
		>{form?.notes ?? ''}</textarea>
	</div>

	<button
		type="submit"
		class="rounded-lg bg-red-700 px-6 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
	>
		Speichern
	</button>
</form>

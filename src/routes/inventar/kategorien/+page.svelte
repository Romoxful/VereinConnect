<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editingId = $state<number | null>(null);

	let createFormName = $derived(form && 'name' in form ? (form.name ?? '') : '');
	let createFormDescription = $derived(
		form && 'description' in form ? (form.description ?? '') : ''
	);
</script>

<svelte:head>
	<title>Inventar-Kategorien - Förderverein FF</title>
</svelte:head>

<div class="mb-6">
	<a href="/inventar" class="text-sm text-red-700 dark:text-red-400 hover:underline">&larr; Zurück</a>
</div>

<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-slate-100">Inventar-Kategorien</h1>

{#if form?.error}
	<div class="mb-4 rounded bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">{form.error}</div>
{/if}

<div class="mb-8 max-w-2xl rounded-lg bg-white dark:bg-slate-800 p-6 shadow">
	<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Neue Kategorie</h2>
	<form method="POST" action="?/create" class="space-y-4">
		<div>
			<label for="new-name" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Name *</label>
			<input
				id="new-name"
				name="name"
				required
				value={createFormName}
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			/>
		</div>
		<div>
			<label for="new-description" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Beschreibung</label>
			<input
				id="new-description"
				name="description"
				value={createFormDescription}
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			/>
		</div>
		<button
			type="submit"
			class="rounded-lg bg-red-700 px-6 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
		>
			Kategorie anlegen
		</button>
	</form>
</div>

<div class="max-w-2xl">
	<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Vorhandene Kategorien</h2>
	{#if data.categories.length === 0}
		<p class="text-gray-500 dark:text-slate-400">Noch keine Kategorien angelegt.</p>
	{:else}
		<div class="space-y-3">
			{#each data.categories as cat}
				<div class="rounded-lg bg-white dark:bg-slate-800 p-4 shadow">
					{#if editingId === cat.id}
						<form method="POST" action="?/update" class="space-y-3">
							<input type="hidden" name="id" value={cat.id} />
							<div>
								<label for="edit-name-{cat.id}" class="block text-xs font-medium text-gray-500 dark:text-slate-400">Name</label>
								<input
									id="edit-name-{cat.id}"
									name="name"
									required
									value={cat.name}
									class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
								/>
							</div>
							<div>
								<label for="edit-description-{cat.id}" class="block text-xs font-medium text-gray-500 dark:text-slate-400">Beschreibung</label>
								<input
									id="edit-description-{cat.id}"
									name="description"
									value={cat.description ?? ''}
									class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
								/>
							</div>
							<div class="flex gap-2">
								<button type="submit" class="rounded-lg bg-red-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-800">Speichern</button>
								<button type="button" class="rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700" onclick={() => (editingId = null)}>Abbrechen</button>
							</div>
						</form>
					{:else}
						<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
							<div class="min-w-0 flex-1">
								<p class="font-medium text-gray-900 dark:text-slate-100">{cat.name}</p>
								{#if cat.description}
									<p class="text-sm text-gray-600 dark:text-slate-400">{cat.description}</p>
								{/if}
								<p class="mt-1 text-xs text-gray-400 dark:text-slate-500">{cat.itemCount} Artikel</p>
							</div>
							<div class="flex shrink-0 gap-2">
								<button
									class="rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
									onclick={() => (editingId = cat.id)}
								>
									Bearbeiten
								</button>
								<form method="POST" action="?/delete">
									<input type="hidden" name="id" value={cat.id} />
									<button type="submit"
										class="rounded-lg bg-red-100 dark:bg-red-900/40 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60"
										onclick={(e) => { if (!confirm('Kategorie wirklich löschen? Artikel in dieser Kategorie werden auf „ohne Kategorie“ gesetzt.')) e.preventDefault(); }}
									>
										Löschen
									</button>
								</form>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

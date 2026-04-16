<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Neue Veranstaltung - Förderverein FF</title>
</svelte:head>

<div class="mb-6">
	<a href="/veranstaltungen" class="text-sm text-red-700 dark:text-red-400 hover:underline">&larr; Zurück</a>
</div>

<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-slate-100">Neue Veranstaltung</h1>

{#if form?.error}
	<div class="mb-4 rounded bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">{form.error}</div>
{/if}

<form method="POST" class="max-w-lg space-y-4">
	<div>
		<label for="title" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Titel *</label>
		<input id="title" name="title" required value={form?.title ?? ''}
			class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
	</div>

	<div>
		<label for="description" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Beschreibung</label>
		<textarea id="description" name="description" rows="3"
			class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
		>{form?.description ?? ''}</textarea>
	</div>

	<div>
		<label for="location" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Ort</label>
		<input id="location" name="location" value={form?.location ?? ''}
			class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div>
			<label for="date" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Datum *</label>
			<input id="date" name="date" type="date" required value={form?.date ?? ''}
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
		</div>
		<div>
			<label for="time" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Uhrzeit</label>
			<input id="time" name="time" type="time" value={form?.time ?? ''}
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
		</div>
	</div>

	<button type="submit"
		class="rounded-lg bg-red-700 px-6 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none">
		Erstellen
	</button>
</form>

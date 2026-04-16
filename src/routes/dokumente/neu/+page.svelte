<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Dokument hochladen - Förderverein FF</title>
</svelte:head>

<div class="mb-6">
	<a href="/dokumente" class="text-sm text-red-700 dark:text-red-400 hover:underline">&larr; Zurück</a>
</div>

<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-slate-100">Dokument hochladen</h1>

{#if form?.error}
	<div class="mb-4 rounded bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">{form.error}</div>
{/if}

<form method="POST" enctype="multipart/form-data" class="max-w-lg space-y-4">
	<div>
		<label for="title" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Titel *</label>
		<input id="title" name="title" required value={form?.title ?? ''}
			class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
	</div>

	<div>
		<label for="category" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Kategorie</label>
		<select id="category" name="category"
			class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none">
			<option value="satzung" selected={form?.category === 'satzung'}>Satzung</option>
			<option value="bescheide" selected={form?.category === 'bescheide'}>Bescheide</option>
			<option value="finanzen" selected={form?.category === 'finanzen'}>Finanzen</option>
			<option value="sonstiges" selected={form?.category === 'sonstiges' || !form?.category}>Sonstiges</option>
		</select>
	</div>

	<div>
		<label for="file" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Datei * (max. 10 MB)</label>
		<input id="file" name="file" type="file" required
			accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
			class="mt-1 block w-full text-sm text-gray-500 dark:text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-red-50 dark:file:bg-red-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-red-700 dark:file:text-red-400 hover:file:bg-red-100 dark:hover:file:bg-red-900/60" />
		<p class="mt-1 text-xs text-gray-400 dark:text-slate-500">Erlaubt: PDF, DOCX, JPG, PNG, GIF, WebP</p>
	</div>

	<button type="submit"
		class="rounded-lg bg-red-700 px-6 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none">
		Hochladen
	</button>
</form>

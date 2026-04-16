<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let content = $state('');
	let showPreview = $state(false);
</script>

<svelte:head>
	<title>Neues Protokoll - Förderverein FF</title>
</svelte:head>

<div class="mb-6">
	<a href="/protokolle" class="text-sm text-red-700 hover:underline">&larr; Zurück</a>
</div>

<h1 class="mb-6 text-2xl font-bold text-gray-900">Neues Sitzungsprotokoll</h1>

{#if form?.error}
	<div data-testid="form-error" role="alert" class="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{form.error}</div>
{/if}

<form method="POST" class="max-w-2xl space-y-4">
	<div class="grid gap-4 sm:grid-cols-2">
		<div>
			<label for="title" class="block text-sm font-medium text-gray-700">Titel *</label>
			<input id="title" name="title" required value={form?.title ?? ''}
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
		</div>
		<div>
			<label for="date" class="block text-sm font-medium text-gray-700">Datum *</label>
			<input id="date" name="date" type="date" required value={form?.date ?? ''}
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
		</div>
	</div>

	<div>
		<label for="attendees" class="block text-sm font-medium text-gray-700">Teilnehmer *</label>
		<input id="attendees" name="attendees" required value={form?.attendees ?? ''}
			placeholder="z.B. Max Mustermann, Erika Musterfrau"
			class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
	</div>

	<div>
		<div class="flex items-center justify-between">
			<label for="content" class="block text-sm font-medium text-gray-700">Inhalt * (Markdown)</label>
			<button type="button"
				class="text-xs text-red-700 hover:underline"
				onclick={() => (showPreview = !showPreview)}
			>
				{showPreview ? 'Bearbeiten' : 'Vorschau'}
			</button>
		</div>
		{#if showPreview}
			<div class="mt-1 min-h-[200px] rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm whitespace-pre-wrap">
				{content || 'Keine Inhalte.'}
			</div>
		{:else}
			<textarea id="content" name="content" required rows="12"
				bind:value={content}
				placeholder="## Tagesordnung&#10;1. Begrüßung&#10;2. ...&#10;&#10;## Beschlüsse&#10;- ...&#10;&#10;## Nächste Schritte&#10;- ..."
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			></textarea>
		{/if}
		{#if showPreview}
			<input type="hidden" name="content" value={content} />
		{/if}
	</div>

	<button type="submit"
		class="rounded-lg bg-red-700 px-6 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none">
		Speichern
	</button>
</form>

<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editing = $state(false);
	let editContent = $state('');
	let showPreview = $state(false);

	function startEditing() {
		editContent = data.protocol.content;
		showPreview = false;
		editing = true;
	}
</script>

<svelte:head>
	<title>{data.protocol.title} - Förderverein FF</title>
</svelte:head>

<div class="mb-6">
	<a href="/protokolle" class="text-sm text-red-700 dark:text-red-400 hover:underline">&larr; Zurück</a>
</div>

{#if form?.error}
	<div class="mb-4 rounded bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">{form.error}</div>
{/if}

{#if editing}
	<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-slate-100">Protokoll bearbeiten</h1>
	<form method="POST" action="?/update" class="max-w-2xl space-y-4">
		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="title" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Titel *</label>
				<input id="title" name="title" required value={data.protocol.title}
					class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
			</div>
			<div>
				<label for="date" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Datum *</label>
				<input id="date" name="date" type="date" required value={data.protocol.date}
					class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
			</div>
		</div>

		<div>
			<label for="attendees" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Teilnehmer *</label>
			<input id="attendees" name="attendees" required value={data.protocol.attendees}
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
		</div>

		<div>
			<div class="flex items-center justify-between">
				<label for="content" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Inhalt * (Markdown)</label>
				<button type="button"
					class="text-xs text-red-700 dark:text-red-400 hover:underline"
					onclick={() => (showPreview = !showPreview)}
				>
					{showPreview ? 'Bearbeiten' : 'Vorschau'}
				</button>
			</div>
			{#if showPreview}
				<div class="mt-1 min-h-[200px] rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800/50 px-3 py-2 text-sm whitespace-pre-wrap">
					{editContent || 'Keine Inhalte.'}
				</div>
			{:else}
				<textarea id="content" name="content" required rows="12"
					bind:value={editContent}
					class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 font-mono text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
				></textarea>
			{/if}
			{#if showPreview}
				<input type="hidden" name="content" value={editContent} />
			{/if}
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
		<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100">{data.protocol.title}</h1>
			{#if data.user?.role === 'vorstand'}
				<div class="flex gap-2">
					<button
						class="rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
						onclick={startEditing}
					>
						Bearbeiten
					</button>
					<form method="POST" action="?/delete">
						<button type="submit"
							class="rounded-lg bg-red-100 dark:bg-red-900/40 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60"
							onclick={(e) => { if (!confirm('Protokoll wirklich löschen?')) e.preventDefault(); }}
						>
							Löschen
						</button>
					</form>
				</div>
			{/if}
		</div>

		<div class="rounded-lg bg-white dark:bg-slate-800 p-6 shadow">
			<div class="mb-4 grid gap-4 border-b border-gray-200 dark:border-slate-700 pb-4 sm:grid-cols-3">
				<div>
					<p class="text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Datum</p>
					<p class="text-sm text-gray-900 dark:text-slate-100">{new Date(data.protocol.date).toLocaleDateString('de-DE')}</p>
				</div>
				<div>
					<p class="text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Teilnehmer</p>
					<p class="text-sm text-gray-900 dark:text-slate-100">{data.protocol.attendees}</p>
				</div>
				<div>
					<p class="text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Erstellt von</p>
					<p class="text-sm text-gray-900 dark:text-slate-100">{data.protocol.creatorName ?? '–'}</p>
				</div>
			</div>

			<div class="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700 dark:text-slate-300">
				{data.protocol.content}
			</div>

			<div class="mt-4 border-t border-gray-200 dark:border-slate-700 pt-3 text-xs text-gray-400 dark:text-slate-500">
				Erstellt: {new Date(data.protocol.createdAt).toLocaleString('de-DE')}
				{#if data.protocol.updatedAt !== data.protocol.createdAt}
					&middot; Aktualisiert: {new Date(data.protocol.updatedAt).toLocaleString('de-DE')}
				{/if}
			</div>
		</div>
	</div>
{/if}

<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Neue Aufgabe - Förderverein FF</title>
</svelte:head>

<div class="mb-6">
	<a href="/aufgaben" class="text-sm text-red-700 dark:text-red-400 hover:underline">&larr; Zurück</a>
</div>

<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-slate-100">Neue Aufgabe</h1>

{#if form?.error}
	<div class="mb-4 rounded bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">{form.error}</div>
{/if}

<form method="POST" class="max-w-2xl space-y-4">
	<div>
		<label for="title" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Titel *</label>
		<input
			id="title"
			name="title"
			required
			value={form?.title ?? ''}
			class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
		/>
	</div>

	<div>
		<label for="description" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Beschreibung</label>
		<textarea
			id="description"
			name="description"
			rows="4"
			class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
		>{form?.description ?? ''}</textarea>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div>
			<label for="priority" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Priorität</label>
			<select
				id="priority"
				name="priority"
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			>
				<option value="niedrig" selected={form?.priority === 'niedrig'}>Niedrig</option>
				<option value="mittel" selected={!form?.priority || form?.priority === 'mittel'}>Mittel</option>
				<option value="hoch" selected={form?.priority === 'hoch'}>Hoch</option>
			</select>
		</div>

		<div>
			<label for="status" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Status</label>
			<select
				id="status"
				name="status"
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			>
				<option value="offen" selected={!form?.status || form?.status === 'offen'}>Offen</option>
				<option value="in_bearbeitung" selected={form?.status === 'in_bearbeitung'}>In Bearbeitung</option>
				<option value="erledigt" selected={form?.status === 'erledigt'}>Erledigt</option>
			</select>
		</div>

		<div>
			<label for="dueDate" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Fälligkeitsdatum</label>
			<input
				id="dueDate"
				name="dueDate"
				type="date"
				value={form?.dueDate ?? ''}
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			/>
		</div>

		<div>
			<label for="assignedTo" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Zugewiesen an</label>
			<select
				id="assignedTo"
				name="assignedTo"
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			>
				<option value="">— Nicht zugewiesen —</option>
				{#each data.users as u}
					<option value={u.id} selected={String(form?.assignedTo) === String(u.id)}>{u.name}</option>
				{/each}
			</select>
		</div>
	</div>

	<div>
		<label for="veranstaltungId" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Verknüpfte Veranstaltung (optional)</label>
		<select
			id="veranstaltungId"
			name="veranstaltungId"
			class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
		>
			<option value="">— Keine Veranstaltung —</option>
			{#each data.events as e}
				<option value={e.id} selected={String(form?.veranstaltungId) === String(e.id)}>
					{e.title} ({new Date(e.date).toLocaleDateString('de-DE')})
				</option>
			{/each}
		</select>
	</div>

	<button
		type="submit"
		class="rounded-lg bg-red-700 px-6 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
	>
		Speichern
	</button>
</form>

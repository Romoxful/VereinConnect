<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editing = $state(false);

	const today = new Date().toISOString().split('T')[0];

	const statusLabels: Record<string, string> = {
		offen: 'Offen',
		in_bearbeitung: 'In Bearbeitung',
		erledigt: 'Erledigt'
	};

	const statusColors: Record<string, string> = {
		offen: 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300',
		in_bearbeitung: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
		erledigt: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
	};

	const priorityLabels: Record<string, string> = {
		niedrig: 'Niedrig',
		mittel: 'Mittel',
		hoch: 'Hoch'
	};

	const priorityColors: Record<string, string> = {
		niedrig: 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300',
		mittel: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
		hoch: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
	};

	let t = $derived(data.task);
	let isVorstand = $derived(data.user?.role === 'vorstand');
	let isAssignee = $derived(data.user?.id === t.assignedTo);
	let canUpdateStatus = $derived(isVorstand || isAssignee);
	let overdue = $derived(!!t.dueDate && t.dueDate < today && t.status !== 'erledigt');
</script>

<svelte:head>
	<title>{t.title} - Förderverein FF</title>
</svelte:head>

<div class="mb-6">
	<a href="/aufgaben" class="text-sm text-red-700 dark:text-red-400 hover:underline">&larr; Zurück</a>
</div>

{#if form?.error}
	<div class="mb-4 rounded bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">{form.error}</div>
{/if}

{#if editing && isVorstand}
	<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-slate-100">Aufgabe bearbeiten</h1>
	<form method="POST" action="?/update" class="max-w-2xl space-y-4">
		<div>
			<label for="title" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Titel *</label>
			<input
				id="title"
				name="title"
				required
				value={t.title}
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
			>{t.description ?? ''}</textarea>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="priority" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Priorität</label>
				<select id="priority" name="priority"
					class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none">
					<option value="niedrig" selected={t.priority === 'niedrig'}>Niedrig</option>
					<option value="mittel" selected={t.priority === 'mittel'}>Mittel</option>
					<option value="hoch" selected={t.priority === 'hoch'}>Hoch</option>
				</select>
			</div>

			<div>
				<label for="status" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Status</label>
				<select id="status" name="status"
					class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none">
					<option value="offen" selected={t.status === 'offen'}>Offen</option>
					<option value="in_bearbeitung" selected={t.status === 'in_bearbeitung'}>In Bearbeitung</option>
					<option value="erledigt" selected={t.status === 'erledigt'}>Erledigt</option>
				</select>
			</div>

			<div>
				<label for="dueDate" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Fälligkeitsdatum</label>
				<input id="dueDate" name="dueDate" type="date" value={t.dueDate ?? ''}
					class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
			</div>

			<div>
				<label for="assignedTo" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Zugewiesen an</label>
				<select id="assignedTo" name="assignedTo"
					class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none">
					<option value="">— Nicht zugewiesen —</option>
					{#each data.users as u}
						<option value={u.id} selected={t.assignedTo === u.id}>{u.name}</option>
					{/each}
				</select>
			</div>
		</div>

		<div>
			<label for="veranstaltungId" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Verknüpfte Veranstaltung</label>
			<select id="veranstaltungId" name="veranstaltungId"
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none">
				<option value="">— Keine Veranstaltung —</option>
				{#each data.events as e}
					<option value={e.id} selected={t.veranstaltungId === e.id}>
						{e.title} ({new Date(e.date).toLocaleDateString('de-DE')})
					</option>
				{/each}
			</select>
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
				<div class="flex flex-wrap items-center gap-2">
					<h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100">{t.title}</h1>
					{#if overdue}
						<span class="rounded-full bg-red-100 dark:bg-red-900/40 px-2 py-0.5 text-xs font-medium text-red-800 dark:text-red-300">
							Überfällig
						</span>
					{/if}
				</div>
				<div class="mt-2 flex flex-wrap gap-2">
					<span class="rounded-full px-2 py-0.5 text-xs font-medium {priorityColors[t.priority]}">
						{priorityLabels[t.priority]}
					</span>
					<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusColors[t.status]}">
						{statusLabels[t.status]}
					</span>
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
							onclick={(e) => { if (!confirm('Aufgabe wirklich löschen?')) e.preventDefault(); }}
						>
							Löschen
						</button>
					</form>
				</div>
			{/if}
		</div>

		<div class="rounded-lg bg-white dark:bg-slate-800 p-6 shadow">
			<div class="mb-4 grid gap-4 border-b border-gray-200 dark:border-slate-700 pb-4 sm:grid-cols-2">
				<div>
					<p class="text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Fällig</p>
					<p class="text-sm text-gray-900 dark:text-slate-100 {overdue ? 'text-red-700 dark:text-red-400 font-medium' : ''}">
						{t.dueDate ? new Date(t.dueDate).toLocaleDateString('de-DE') : '—'}
					</p>
				</div>
				<div>
					<p class="text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Zugewiesen an</p>
					<p class="text-sm text-gray-900 dark:text-slate-100">{t.assigneeName ?? '—'}</p>
				</div>
				<div>
					<p class="text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Erstellt von</p>
					<p class="text-sm text-gray-900 dark:text-slate-100">{t.creatorName ?? '—'}</p>
				</div>
				<div>
					<p class="text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Veranstaltung</p>
					<p class="text-sm text-gray-900 dark:text-slate-100">
						{#if t.veranstaltungId && t.eventTitle}
							<a href="/veranstaltungen/{t.veranstaltungId}" class="text-red-700 dark:text-red-400 hover:underline">{t.eventTitle}</a>
						{:else}
							—
						{/if}
					</p>
				</div>
			</div>

			{#if t.description}
				<div class="mb-4">
					<p class="mb-2 text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Beschreibung</p>
					<p class="whitespace-pre-wrap text-sm text-gray-700 dark:text-slate-300">{t.description}</p>
				</div>
			{/if}

			{#if canUpdateStatus}
				<div class="border-t border-gray-200 dark:border-slate-700 pt-4">
					<p class="mb-2 text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Status ändern</p>
					<form method="POST" action="?/updateStatus" class="flex flex-wrap gap-2">
						<button type="submit" name="status" value="offen"
							disabled={t.status === 'offen'}
							class="rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-1.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
							Offen
						</button>
						<button type="submit" name="status" value="in_bearbeitung"
							disabled={t.status === 'in_bearbeitung'}
							class="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
							In Bearbeitung
						</button>
						<button type="submit" name="status" value="erledigt"
							disabled={t.status === 'erledigt'}
							class="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
							Erledigt
						</button>
					</form>
				</div>
			{/if}

			<div class="mt-4 border-t border-gray-200 dark:border-slate-700 pt-3 text-xs text-gray-400 dark:text-slate-500">
				Erstellt: {new Date(t.createdAt).toLocaleString('de-DE')}
				{#if t.updatedAt !== t.createdAt}
					&middot; Aktualisiert: {new Date(t.updatedAt).toLocaleString('de-DE')}
				{/if}
			</div>
		</div>
	</div>
{/if}

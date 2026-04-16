<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let confirmDelete = $state(false);
	let d = $derived(data.due);
	let isVorstand = $derived(data.user?.role === 'vorstand');

	const statusColors: Record<string, string> = {
		offen: 'bg-yellow-100 text-yellow-800',
		bezahlt: 'bg-green-100 text-green-800',
		'überfällig': 'bg-red-100 text-red-800'
	};

	const statusLabels: Record<string, string> = {
		offen: 'Offen',
		bezahlt: 'Bezahlt',
		'überfällig': 'Überfällig'
	};
</script>

<svelte:head>
	<title>Beitrag {d.year} - {d.memberLastName} - Förderverein FF</title>
</svelte:head>

<div class="mb-6">
	<a href="/beitraege" class="text-sm text-red-700 hover:underline">&larr; Zurück</a>
</div>

<h1 class="mb-6 text-2xl font-bold text-gray-900">
	Beitrag {d.year} — {d.memberFirstName} {d.memberLastName}
</h1>

{#if form?.error}
	<div class="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{form.error}</div>
{/if}

{#if isVorstand}
	{#if d.status !== 'bezahlt'}
		<form method="POST" action="?/markPaid" class="mb-6">
			<button type="submit"
				class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none">
				Als bezahlt markieren
			</button>
		</form>
	{/if}

	<form method="POST" action="?/update" class="max-w-lg space-y-4">
		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="amount" class="block text-sm font-medium text-gray-700">Betrag (€) *</label>
				<input id="amount" name="amount" type="number" step="0.01" min="0" required value={d.amount}
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
			</div>
			<div>
				<label for="year" class="block text-sm font-medium text-gray-700">Jahr *</label>
				<input id="year" name="year" type="number" min="2000" max="2100" required value={d.year}
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
			</div>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="dueDate" class="block text-sm font-medium text-gray-700">Fällig am *</label>
				<input id="dueDate" name="dueDate" type="date" required value={d.dueDate}
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
			</div>
			<div>
				<label for="status" class="block text-sm font-medium text-gray-700">Status</label>
				<select id="status" name="status"
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none">
					<option value="offen" selected={d.status === 'offen'}>Offen</option>
					<option value="bezahlt" selected={d.status === 'bezahlt'}>Bezahlt</option>
					<option value="überfällig" selected={d.status === 'überfällig'}>Überfällig</option>
				</select>
			</div>
		</div>

		<div>
			<label for="paidDate" class="block text-sm font-medium text-gray-700">Bezahlt am</label>
			<input id="paidDate" name="paidDate" type="date" value={d.paidDate ?? ''}
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
		</div>

		<div>
			<label for="notes" class="block text-sm font-medium text-gray-700">Notizen</label>
			<textarea id="notes" name="notes" rows="3"
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			>{d.notes ?? ''}</textarea>
		</div>

		<button type="submit"
			class="rounded-lg bg-red-700 px-6 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none">
			Speichern
		</button>
	</form>

	<div class="mt-8 border-t border-gray-200 pt-6">
		{#if !confirmDelete}
			<button
				onclick={() => (confirmDelete = true)}
				class="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50">
				Beitrag löschen
			</button>
		{:else}
			<div class="rounded-lg bg-red-50 p-4">
				<p class="mb-3 text-sm text-red-700">Beitrag wirklich löschen?</p>
				<form method="POST" action="?/delete" class="inline">
					<button type="submit" class="rounded-lg bg-red-700 px-4 py-2 text-sm text-white hover:bg-red-800">
						Ja, löschen
					</button>
				</form>
				<button
					onclick={() => (confirmDelete = false)}
					class="ml-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
					Abbrechen
				</button>
			</div>
		{/if}
	</div>
{:else}
	<!-- Read-only view -->
	<div class="max-w-lg space-y-3 rounded-lg bg-white p-6 shadow">
		<div class="grid gap-3 sm:grid-cols-2">
			<div>
				<p class="text-xs text-gray-500">Mitglied</p>
				<p class="font-medium">{d.memberFirstName} {d.memberLastName}</p>
			</div>
			<div>
				<p class="text-xs text-gray-500">Status</p>
				<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusColors[d.status]}">
					{statusLabels[d.status]}
				</span>
			</div>
		</div>
		<div class="grid gap-3 sm:grid-cols-2">
			<div>
				<p class="text-xs text-gray-500">Betrag</p>
				<p>{d.amount} €</p>
			</div>
			<div>
				<p class="text-xs text-gray-500">Jahr</p>
				<p>{d.year}</p>
			</div>
		</div>
		<div class="grid gap-3 sm:grid-cols-2">
			<div>
				<p class="text-xs text-gray-500">Fällig am</p>
				<p>{new Date(d.dueDate).toLocaleDateString('de-DE')}</p>
			</div>
			{#if d.paidDate}
				<div>
					<p class="text-xs text-gray-500">Bezahlt am</p>
					<p>{new Date(d.paidDate).toLocaleDateString('de-DE')}</p>
				</div>
			{/if}
		</div>
		{#if d.notes}
			<div>
				<p class="text-xs text-gray-500">Notizen</p>
				<p>{d.notes}</p>
			</div>
		{/if}
	</div>
{/if}

<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let confirmDelete = $state(false);
	let confirmDsgvoDelete = $state(false);
	let m = $derived(data.member);
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

	const consentLabels: Record<string, string> = {
		datenverarbeitung: 'Datenverarbeitung',
		newsletter: 'Newsletter',
		foto_freigabe: 'Foto-Freigabe'
	};
</script>

<svelte:head>
	<title>{m.firstName} {m.lastName} - Förderverein FF</title>
</svelte:head>

<div class="mb-6">
	<a href="/mitglieder" class="text-sm text-red-700 hover:underline">&larr; Zurück</a>
</div>

<h1 class="mb-6 text-2xl font-bold text-gray-900">{m.firstName} {m.lastName}</h1>

{#if form?.error}
	<div data-testid="form-error" role="alert" class="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{form.error}</div>
{/if}

{#if isVorstand}
	<form method="POST" action="?/update" class="max-w-lg space-y-4">
		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="firstName" class="block text-sm font-medium text-gray-700">Vorname *</label>
				<input id="firstName" name="firstName" required value={m.firstName}
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
			</div>
			<div>
				<label for="lastName" class="block text-sm font-medium text-gray-700">Nachname *</label>
				<input id="lastName" name="lastName" required value={m.lastName}
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
			</div>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="email" class="block text-sm font-medium text-gray-700">E-Mail</label>
				<input id="email" name="email" type="email" value={m.email ?? ''}
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
			</div>
			<div>
				<label for="phone" class="block text-sm font-medium text-gray-700">Telefon</label>
				<input id="phone" name="phone" value={m.phone ?? ''}
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
			</div>
		</div>

		<div>
			<label for="street" class="block text-sm font-medium text-gray-700">Straße</label>
			<input id="street" name="street" value={m.street ?? ''}
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="zip" class="block text-sm font-medium text-gray-700">PLZ</label>
				<input id="zip" name="zip" value={m.zip ?? ''}
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
			</div>
			<div>
				<label for="city" class="block text-sm font-medium text-gray-700">Ort</label>
				<input id="city" name="city" value={m.city ?? ''}
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
			</div>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="memberSince" class="block text-sm font-medium text-gray-700">Mitglied seit *</label>
				<input id="memberSince" name="memberSince" type="date" required value={m.memberSince}
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
			</div>
			<div>
				<label for="status" class="block text-sm font-medium text-gray-700">Status</label>
				<select id="status" name="status"
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none">
					<option value="aktiv" selected={m.status === 'aktiv'}>Aktiv</option>
					<option value="inaktiv" selected={m.status === 'inaktiv'}>Inaktiv</option>
					<option value="ausgetreten" selected={m.status === 'ausgetreten'}>Ausgetreten</option>
				</select>
			</div>
		</div>

		<div>
			<label for="notes" class="block text-sm font-medium text-gray-700">Notizen</label>
			<textarea id="notes" name="notes" rows="3"
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			>{m.notes ?? ''}</textarea>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit"
				class="rounded-lg bg-red-700 px-6 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none">
				Speichern
			</button>
		</div>
	</form>

	<!-- Consent Tracking (DSGVO) -->
	<div class="mt-8 border-t border-gray-200 pt-6">
		<h2 class="mb-4 text-lg font-semibold text-gray-900">DSGVO-Einwilligungen</h2>
		<form method="POST" action="?/updateConsents" class="max-w-lg space-y-3">
			{#each ['datenverarbeitung', 'newsletter', 'foto_freigabe'] as type}
				<label class="flex items-center gap-3">
					<input type="checkbox" name={type}
						checked={data.activeConsents[type]}
						class="h-4 w-4 rounded border-gray-300 text-red-700 focus:ring-red-500" />
					<span class="text-sm text-gray-700">{consentLabels[type]}</span>
				</label>
			{/each}
			<button type="submit"
				class="mt-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none">
				Einwilligungen speichern
			</button>
		</form>
	</div>

	<!-- Payment Status -->
	<div class="mt-8 border-t border-gray-200 pt-6">
		<h2 class="mb-4 text-lg font-semibold text-gray-900">Beiträge</h2>
		{#if data.memberDues.length === 0}
			<p class="text-sm text-gray-500">Keine Beiträge vorhanden.</p>
		{:else}
			<div class="space-y-2">
				{#each data.memberDues as due}
					<a href="/beitraege/{due.id}" class="flex items-center justify-between rounded-lg bg-white p-3 shadow hover:shadow-md transition-shadow">
						<div>
							<span class="font-medium text-gray-900">{due.year}</span>
							<span class="ml-2 text-sm text-gray-500">{due.amount} €</span>
						</div>
						<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusColors[due.status]}">
							{statusLabels[due.status]}
						</span>
					</a>
				{/each}
			</div>
		{/if}
	</div>

	<div class="mt-8 border-t border-gray-200 pt-6">
		{#if !confirmDelete}
			<button
				onclick={() => (confirmDelete = true)}
				class="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
			>
				Mitglied löschen
			</button>
		{:else}
			<div class="rounded-lg bg-red-50 p-4">
				<p class="mb-3 text-sm text-red-700">Mitglied wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.</p>
				<form method="POST" action="?/delete" class="inline">
					<button type="submit" class="rounded-lg bg-red-700 px-4 py-2 text-sm text-white hover:bg-red-800">
						Ja, löschen
					</button>
				</form>
				<button
					onclick={() => (confirmDelete = false)}
					class="ml-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
				>
					Abbrechen
				</button>
			</div>
		{/if}
	</div>

	<!-- DSGVO Actions -->
	<div class="mt-8 border-t border-gray-200 pt-6">
		<h2 class="mb-4 text-lg font-semibold text-gray-900">DSGVO</h2>
		<div class="flex flex-wrap gap-3">
			<a href="/api/mitglieder/{m.id}/export" download
				class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
				Daten exportieren (Art. 20)
			</a>
			{#if !confirmDsgvoDelete}
				<button
					onclick={() => (confirmDsgvoDelete = true)}
					class="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50">
					Alle Daten löschen (Art. 17)
				</button>
			{:else}
				<div class="w-full rounded-lg bg-red-50 p-4">
					<p class="mb-3 text-sm text-red-700">
						Wirklich alle Daten dieses Mitglieds unwiderruflich löschen?
						Dies umfasst das Mitglied, alle Beiträge und alle Einwilligungen.
					</p>
					<button
						onclick={async () => {
							const res = await fetch(`/api/mitglieder/${m.id}/delete`, { method: 'DELETE' });
							if (res.ok) window.location.href = '/mitglieder';
						}}
						class="rounded-lg bg-red-700 px-4 py-2 text-sm text-white hover:bg-red-800">
						Ja, alle Daten löschen
					</button>
					<button
						onclick={() => (confirmDsgvoDelete = false)}
						class="ml-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
						Abbrechen
					</button>
				</div>
			{/if}
		</div>
	</div>
{:else}
	<!-- Read-only view for regular members -->
	<div class="max-w-lg space-y-3 rounded-lg bg-white p-6 shadow">
		<div class="grid gap-3 sm:grid-cols-2">
			<div>
				<p class="text-xs text-gray-500">Vorname</p>
				<p class="font-medium">{m.firstName}</p>
			</div>
			<div>
				<p class="text-xs text-gray-500">Nachname</p>
				<p class="font-medium">{m.lastName}</p>
			</div>
		</div>
		{#if m.email}
			<div>
				<p class="text-xs text-gray-500">E-Mail</p>
				<p>{m.email}</p>
			</div>
		{/if}
		{#if m.phone}
			<div>
				<p class="text-xs text-gray-500">Telefon</p>
				<p>{m.phone}</p>
			</div>
		{/if}
		{#if m.street || m.zip || m.city}
			<div>
				<p class="text-xs text-gray-500">Adresse</p>
				<p>{m.street ?? ''}</p>
				<p>{m.zip ?? ''} {m.city ?? ''}</p>
			</div>
		{/if}
		<div>
			<p class="text-xs text-gray-500">Mitglied seit</p>
			<p>{new Date(m.memberSince).toLocaleDateString('de-DE')}</p>
		</div>
		<div>
			<p class="text-xs text-gray-500">Status</p>
			<p>{m.status}</p>
		</div>
		{#if m.notes}
			<div>
				<p class="text-xs text-gray-500">Notizen</p>
				<p>{m.notes}</p>
			</div>
		{/if}
	</div>

	<!-- Payment Status (read-only) -->
	{#if data.memberDues.length > 0}
		<h2 class="mt-8 mb-4 text-lg font-semibold text-gray-900">Beiträge</h2>
		<div class="space-y-2">
			{#each data.memberDues as due}
				<div class="flex items-center justify-between rounded-lg bg-white p-3 shadow">
					<div>
						<span class="font-medium text-gray-900">{due.year}</span>
						<span class="ml-2 text-sm text-gray-500">{due.amount} €</span>
					</div>
					<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusColors[due.status]}">
						{statusLabels[due.status]}
					</span>
				</div>
			{/each}
		</div>
	{/if}
{/if}

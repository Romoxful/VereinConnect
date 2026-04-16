<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Neues Mitglied - Förderverein FF</title>
</svelte:head>

<div class="mb-6">
	<a href="/mitglieder" class="text-sm text-red-700 hover:underline">&larr; Zurück</a>
</div>

<h1 class="mb-6 text-2xl font-bold text-gray-900">Neues Mitglied</h1>

{#if form?.error}
	<div data-testid="form-error" role="alert" class="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{form.error}</div>
{/if}

<form method="POST" class="max-w-lg space-y-4">
	<div class="grid gap-4 sm:grid-cols-2">
		<div>
			<label for="firstName" class="block text-sm font-medium text-gray-700">Vorname *</label>
			<input id="firstName" name="firstName" required value={form?.firstName ?? ''}
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
		</div>
		<div>
			<label for="lastName" class="block text-sm font-medium text-gray-700">Nachname *</label>
			<input id="lastName" name="lastName" required value={form?.lastName ?? ''}
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
		</div>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div>
			<label for="email" class="block text-sm font-medium text-gray-700">E-Mail</label>
			<input id="email" name="email" type="email" value={form?.email ?? ''}
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
		</div>
		<div>
			<label for="phone" class="block text-sm font-medium text-gray-700">Telefon</label>
			<input id="phone" name="phone" value={form?.phone ?? ''}
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
		</div>
	</div>

	<div>
		<label for="street" class="block text-sm font-medium text-gray-700">Straße</label>
		<input id="street" name="street" value={form?.street ?? ''}
			class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div>
			<label for="zip" class="block text-sm font-medium text-gray-700">PLZ</label>
			<input id="zip" name="zip" value={form?.zip ?? ''}
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
		</div>
		<div>
			<label for="city" class="block text-sm font-medium text-gray-700">Ort</label>
			<input id="city" name="city" value={form?.city ?? ''}
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
		</div>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div>
			<label for="memberSince" class="block text-sm font-medium text-gray-700">Mitglied seit *</label>
			<input id="memberSince" name="memberSince" type="date" required value={form?.memberSince ?? ''}
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
		</div>
		<div>
			<label for="status" class="block text-sm font-medium text-gray-700">Status</label>
			<select id="status" name="status"
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none">
				<option value="aktiv" selected={form?.status === 'aktiv' || !form?.status}>Aktiv</option>
				<option value="inaktiv" selected={form?.status === 'inaktiv'}>Inaktiv</option>
				<option value="ausgetreten" selected={form?.status === 'ausgetreten'}>Ausgetreten</option>
			</select>
		</div>
	</div>

	<div>
		<label for="notes" class="block text-sm font-medium text-gray-700">Notizen</label>
		<textarea id="notes" name="notes" rows="3"
			class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
		>{form?.notes ?? ''}</textarea>
	</div>

	<button type="submit"
		class="rounded-lg bg-red-700 px-6 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none">
		Speichern
	</button>
</form>

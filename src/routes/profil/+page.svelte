<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let p = $derived(data.profile);
</script>

<svelte:head>
	<title>Mein Profil - Förderverein FF</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-slate-100">Mein Profil</h1>

<section class="mb-10">
	<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Persönliche Daten</h2>

	{#if form?.profileError}
		<div class="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
			{form.profileError}
		</div>
	{/if}
	{#if form?.profileSuccess}
		<div
			class="mb-4 rounded bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300"
		>
			{form.profileSuccess}
		</div>
	{/if}

	<form method="POST" action="?/updateProfile" class="max-w-lg space-y-4">
		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-slate-300"
					>Vorname *</label
				>
				<input
					id="firstName"
					name="firstName"
					required
					value={p.firstName}
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none dark:border-slate-600"
				/>
			</div>
			<div>
				<label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-slate-300"
					>Nachname *</label
				>
				<input
					id="lastName"
					name="lastName"
					required
					value={p.lastName}
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none dark:border-slate-600"
				/>
			</div>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="email" class="block text-sm font-medium text-gray-700 dark:text-slate-300"
					>E-Mail *</label
				>
				<input
					id="email"
					name="email"
					type="email"
					required
					value={p.email}
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none dark:border-slate-600"
				/>
			</div>
			<div>
				<label for="phone" class="block text-sm font-medium text-gray-700 dark:text-slate-300"
					>Telefon</label
				>
				<input
					id="phone"
					name="phone"
					value={p.phone}
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none dark:border-slate-600"
				/>
			</div>
		</div>

		<div>
			<label for="street" class="block text-sm font-medium text-gray-700 dark:text-slate-300"
				>Straße</label
			>
			<input
				id="street"
				name="street"
				value={p.street}
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none dark:border-slate-600"
			/>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="zip" class="block text-sm font-medium text-gray-700 dark:text-slate-300"
					>PLZ</label
				>
				<input
					id="zip"
					name="zip"
					value={p.zip}
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none dark:border-slate-600"
				/>
			</div>
			<div>
				<label for="city" class="block text-sm font-medium text-gray-700 dark:text-slate-300"
					>Ort</label
				>
				<input
					id="city"
					name="city"
					value={p.city}
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none dark:border-slate-600"
				/>
			</div>
		</div>

		{#if !data.hasMember}
			<p class="text-xs text-gray-500 dark:text-slate-400">
				Adresse und Telefon werden nur gespeichert, sobald ein Mitgliedsprofil verknüpft ist.
			</p>
		{/if}

		<button
			type="submit"
			class="rounded-lg bg-red-700 px-6 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
		>
			Profil speichern
		</button>
	</form>
</section>

<section class="border-t border-gray-200 pt-8 dark:border-slate-700">
	<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Passwort ändern</h2>

	{#if form?.passwordError}
		<div class="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
			{form.passwordError}
		</div>
	{/if}
	{#if form?.passwordSuccess}
		<div
			class="mb-4 rounded bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300"
		>
			{form.passwordSuccess}
		</div>
	{/if}

	<form method="POST" action="?/changePassword" class="max-w-lg space-y-4">
		<div>
			<label
				for="currentPassword"
				class="block text-sm font-medium text-gray-700 dark:text-slate-300"
				>Aktuelles Passwort *</label
			>
			<input
				id="currentPassword"
				name="currentPassword"
				type="password"
				required
				autocomplete="current-password"
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none dark:border-slate-600"
			/>
		</div>
		<div>
			<label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-slate-300"
				>Neues Passwort *</label
			>
			<input
				id="newPassword"
				name="newPassword"
				type="password"
				required
				minlength="8"
				autocomplete="new-password"
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none dark:border-slate-600"
			/>
			<p class="mt-1 text-xs text-gray-500 dark:text-slate-400">Mindestens 8 Zeichen.</p>
		</div>
		<div>
			<label
				for="confirmPassword"
				class="block text-sm font-medium text-gray-700 dark:text-slate-300"
				>Neues Passwort bestätigen *</label
			>
			<input
				id="confirmPassword"
				name="confirmPassword"
				type="password"
				required
				minlength="8"
				autocomplete="new-password"
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none dark:border-slate-600"
			/>
		</div>

		<button
			type="submit"
			class="rounded-lg bg-red-700 px-6 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
		>
			Passwort ändern
		</button>
	</form>
</section>

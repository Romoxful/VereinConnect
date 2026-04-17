<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>E-Mail bestätigen - Förderverein FF</title>
</svelte:head>

<div class="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-8">
	<div class="mb-6 text-center">
		<h1 class="text-2xl font-bold text-red-700 dark:text-red-400">Förderverein FF</h1>
		<p class="mt-1 text-sm text-gray-500 dark:text-slate-400">Freiwillige Feuerwehr</p>
	</div>

	<div class="rounded-lg bg-white dark:bg-slate-800 p-6 shadow-md">
		<h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-slate-100">
			E-Mail-Bestätigung
		</h2>

		{#if data.status === 'verified'}
			<div
				class="rounded bg-green-50 dark:bg-green-950 p-4 text-sm text-green-700 dark:text-green-300"
				data-testid="verify-success"
			>
				<p class="font-medium">E-Mail-Adresse erfolgreich bestätigt.</p>
				<p class="mt-1">
					Vielen Dank! Ihr Antrag wird nun vom Vorstand geprüft. Sie erhalten eine
					Rückmeldung per E-Mail.
				</p>
			</div>
		{:else if data.status === 'already_used'}
			<div
				class="rounded bg-blue-50 dark:bg-blue-950 p-4 text-sm text-blue-700 dark:text-blue-300"
				data-testid="verify-already-used"
			>
				<p class="font-medium">Dieser Bestätigungslink wurde bereits verwendet.</p>
				<p class="mt-1">
					Ihre E-Mail-Adresse ist bereits bestätigt. Es ist keine weitere Aktion
					erforderlich.
				</p>
			</div>
		{:else if data.status === 'expired'}
			<div
				class="rounded bg-yellow-50 dark:bg-yellow-950 p-4 text-sm text-yellow-700 dark:text-yellow-300"
				data-testid="verify-expired"
			>
				<p class="font-medium">Dieser Bestätigungslink ist abgelaufen.</p>
				<p class="mt-1">
					Bestätigungslinks sind 24 Stunden gültig. Bitte stellen Sie einen neuen
					Aufnahmeantrag.
				</p>
				<a
					href="/aufnahme"
					class="mt-3 inline-block rounded-lg bg-red-700 px-4 py-2 text-xs font-medium text-white hover:bg-red-800"
				>
					Neuer Aufnahmeantrag
				</a>
			</div>
		{:else}
			<div
				class="rounded bg-red-50 dark:bg-red-950 p-4 text-sm text-red-600 dark:text-red-400"
				data-testid="verify-invalid"
			>
				<p class="font-medium">Ungültiger Bestätigungslink.</p>
				<p class="mt-1">
					Der Link ist fehlerhaft oder existiert nicht. Bitte überprüfen Sie die URL oder
					stellen Sie einen neuen Antrag.
				</p>
			</div>
		{/if}

		<div class="mt-6 flex justify-between text-sm">
			<a href="/aufnahme" class="text-gray-500 dark:text-slate-400 hover:underline">
				Zum Aufnahmeantrag
			</a>
			<a href="/login" class="text-red-700 dark:text-red-400 hover:underline">Zum Login</a>
		</div>
	</div>
</div>

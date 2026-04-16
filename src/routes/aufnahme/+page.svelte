<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Mitgliedsantrag - Förderverein FF</title>
</svelte:head>

<div class="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8">
	<div class="mb-6 text-center">
		<h1 class="text-2xl font-bold text-red-700 dark:text-red-400">Förderverein FF</h1>
		<p class="mt-1 text-sm text-gray-500 dark:text-slate-400">Freiwillige Feuerwehr</p>
	</div>

	<div class="rounded-lg bg-white dark:bg-slate-800 p-6 shadow-md">
		<h2 class="mb-2 text-xl font-semibold text-gray-900 dark:text-slate-100">Antrag auf Mitgliedschaft</h2>
		<p class="mb-6 text-sm text-gray-600 dark:text-slate-400">
			Schön, dass Sie Mitglied werden möchten. Bitte füllen Sie das Formular aus.
			Ihr Antrag wird vom Vorstand geprüft und Sie erhalten eine Rückmeldung per E-Mail.
		</p>

		{#if form?.success}
			<div class="rounded bg-green-50 dark:bg-green-950 p-4 text-sm text-green-700 dark:text-green-300">
				<p class="font-medium">Vielen Dank für Ihren Aufnahmeantrag!</p>
				<p class="mt-1">
					Wir haben Ihren Antrag erhalten. Der Vorstand wird ihn in Kürze prüfen und sich bei
					Ihnen melden.
				</p>
			</div>
		{:else}
			{#if form?.error}
				<div class="mb-4 rounded bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">{form.error}</div>
			{/if}

			<form method="POST" class="space-y-4">
				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Vorname *</label>
						<input id="firstName" name="firstName" required value={form?.firstName ?? ''}
							class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
					</div>
					<div>
						<label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Nachname *</label>
						<input id="lastName" name="lastName" required value={form?.lastName ?? ''}
							class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
					</div>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 dark:text-slate-300">E-Mail *</label>
						<input id="email" name="email" type="email" required value={form?.email ?? ''}
							class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
					</div>
					<div>
						<label for="phone" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Telefon</label>
						<input id="phone" name="phone" value={form?.phone ?? ''}
							class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
					</div>
				</div>

				<div>
					<label for="street" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Straße</label>
					<input id="street" name="street" value={form?.street ?? ''}
						class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label for="zip" class="block text-sm font-medium text-gray-700 dark:text-slate-300">PLZ</label>
						<input id="zip" name="zip" value={form?.zip ?? ''}
							class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
					</div>
					<div>
						<label for="city" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Ort</label>
						<input id="city" name="city" value={form?.city ?? ''}
							class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
					</div>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label for="birthDate" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Geburtsdatum</label>
						<input id="birthDate" name="birthDate" type="date" value={form?.birthDate ?? ''}
							class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
					</div>
					<div>
						<label for="profession" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Beruf</label>
						<input id="profession" name="profession" value={form?.profession ?? ''}
							class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
					</div>
				</div>

				<div>
					<label for="message" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Mitteilung</label>
					<textarea id="message" name="message" rows="4"
						placeholder="Gibt es etwas, das wir wissen sollten?"
						class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
					>{form?.message ?? ''}</textarea>
				</div>

				<div class="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-4">
					<label class="flex items-start gap-3">
						<input type="checkbox" name="consent" required checked={form?.consent ?? false}
							class="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 dark:border-slate-600 text-red-700 dark:text-red-400 focus:ring-red-500" />
						<span class="text-sm text-gray-700 dark:text-slate-300">
							Ich willige ein, dass die im Formular angegebenen personenbezogenen Daten
							zum Zweck der Bearbeitung meines Mitgliedsantrags und der anschließenden
							Vereinsverwaltung gespeichert und verarbeitet werden. Die Daten werden
							nicht an Dritte weitergegeben. Die Einwilligung kann jederzeit widerrufen
							werden. Weitere Informationen in der
							<a href="/datenschutz" class="text-red-700 dark:text-red-400 underline" target="_blank">Datenschutzerklärung</a>. *
						</span>
					</label>
				</div>

				<div class="flex items-center justify-between">
					<a href="/login" class="text-sm text-gray-500 dark:text-slate-400 hover:underline">Bereits Mitglied? Anmelden</a>
					<button type="submit"
						class="rounded-lg bg-red-700 px-6 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none">
						Antrag absenden
					</button>
				</div>
			</form>
		{/if}
	</div>

	<div class="mt-6 flex justify-center gap-4 text-xs text-gray-500 dark:text-slate-400">
		<a href="/datenschutz" class="hover:underline">Datenschutz</a>
		<a href="/impressum" class="hover:underline">Impressum</a>
	</div>
</div>

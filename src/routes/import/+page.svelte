<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isPreview = $derived(form && 'stage' in form && form.stage === 'preview');
	let isDone = $derived(form && 'stage' in form && form.stage === 'done');

	const FIELD_LABELS: Record<string, string> = {
		firstName: 'Vorname',
		lastName: 'Nachname',
		email: 'E-Mail',
		phone: 'Telefon',
		street: 'Straße',
		zip: 'PLZ',
		city: 'Ort',
		birthDate: 'Geburtsdatum',
		profession: 'Beruf',
		memberSince: 'Mitglied seit',
		status: 'Status',
		notes: 'Notizen'
	};
</script>

<svelte:head>
	<title>Import - Förderverein FF</title>
</svelte:head>

<div class="mb-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100">Daten-Import</h1>
	<p class="mt-1 text-sm text-gray-500 dark:text-slate-400">
		Mitglieder aus einer CSV-Datei importieren. Duplikate (nach E-Mail) werden übersprungen.
	</p>
</div>

{#if !data.canImport}
	<div class="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4 text-sm text-yellow-800 dark:text-yellow-300">
		Nur Vorstandsmitglieder können Daten importieren.
	</div>
{:else if isDone && form && 'stage' in form && form.stage === 'done'}
	<div class="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-sm text-green-800 dark:text-green-300">
		<p class="font-medium">Import abgeschlossen.</p>
		<ul class="mt-2 space-y-1">
			<li>Importiert: <strong>{form.imported}</strong></li>
			<li>Übersprungen (Duplikate): <strong>{form.skippedDuplicates}</strong></li>
			<li>Übersprungen (Fehler): <strong>{form.skippedErrors}</strong></li>
		</ul>
	</div>
	<div class="mt-4 flex gap-3">
		<a
			href="/mitglieder"
			class="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
		>
			Zur Mitgliederliste
		</a>
		<a
			href="/import"
			class="inline-flex items-center rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
		>
			Weiteren Import starten
		</a>
	</div>
{:else if isPreview && form && 'stage' in form && form.stage === 'preview'}
	{@const p = form.preview}
	{@const validRows = p.rows.filter((r) => r.data && r.errors.length === 0 && !r.duplicateEmail)}
	{@const dupeRows = p.rows.filter((r) => r.duplicateEmail)}
	{@const errorRows = p.rows.filter((r) => r.errors.length > 0)}

	<section class="mb-6 rounded-lg bg-white dark:bg-slate-800 p-4 shadow">
		<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-slate-100">Spaltenzuordnung</h2>
		<div class="grid gap-2 sm:grid-cols-2">
			{#each Object.keys(FIELD_LABELS) as field}
				<div class="flex items-center justify-between text-sm">
					<span class="text-gray-700 dark:text-slate-300">{FIELD_LABELS[field]}</span>
					{#if p.mapping[field]}
						<span class="rounded bg-green-100 dark:bg-green-900/40 px-2 py-0.5 text-xs text-green-800 dark:text-green-300">
							{p.mapping[field]}
						</span>
					{:else}
						<span class="rounded bg-gray-100 dark:bg-slate-700 px-2 py-0.5 text-xs text-gray-500 dark:text-slate-400">
							–
						</span>
					{/if}
				</div>
			{/each}
		</div>
		{#if p.unmappedHeaders.length > 0}
			<p class="mt-3 text-xs text-gray-500 dark:text-slate-400">
				Ignorierte Spalten: {p.unmappedHeaders.join(', ')}
			</p>
		{/if}
		{#if p.missingRequired.length > 0}
			<p class="mt-3 rounded bg-red-50 dark:bg-red-950 p-2 text-sm text-red-700 dark:text-red-400">
				Pflichtfelder fehlen: {p.missingRequired.map((f) => FIELD_LABELS[f] ?? f).join(', ')}
			</p>
		{/if}
	</section>

	<section class="mb-6 grid gap-3 sm:grid-cols-3">
		<div class="rounded-lg bg-green-50 dark:bg-green-950 p-3 text-sm">
			<p class="text-xs uppercase text-green-700 dark:text-green-400">Zu importieren</p>
			<p class="text-2xl font-bold text-green-800 dark:text-green-300">{validRows.length}</p>
		</div>
		<div class="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-3 text-sm">
			<p class="text-xs uppercase text-yellow-700 dark:text-yellow-400">Duplikate</p>
			<p class="text-2xl font-bold text-yellow-800 dark:text-yellow-300">{dupeRows.length}</p>
		</div>
		<div class="rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm">
			<p class="text-xs uppercase text-red-700 dark:text-red-400">Fehler</p>
			<p class="text-2xl font-bold text-red-800 dark:text-red-300">{errorRows.length}</p>
		</div>
	</section>

	<section class="mb-6 overflow-x-auto rounded-lg bg-white dark:bg-slate-800 shadow">
		<table class="w-full text-left text-sm">
			<thead class="border-b bg-gray-50 dark:bg-slate-800 text-xs uppercase text-gray-500 dark:text-slate-400">
				<tr>
					<th class="px-3 py-2">Zeile</th>
					<th class="px-3 py-2">Vorname</th>
					<th class="px-3 py-2">Nachname</th>
					<th class="px-3 py-2">E-Mail</th>
					<th class="px-3 py-2">Status</th>
					<th class="px-3 py-2">Hinweis</th>
				</tr>
			</thead>
			<tbody class="divide-y">
				{#each p.rows as row}
					<tr class:bg-red-50={row.errors.length > 0} class:dark:bg-red-950={row.errors.length > 0}
						class:bg-yellow-50={row.duplicateEmail} class:dark:bg-yellow-950={row.duplicateEmail}>
						<td class="px-3 py-2 text-gray-500 dark:text-slate-400">{row.rowNumber}</td>
						<td class="px-3 py-2">{row.data?.firstName ?? '–'}</td>
						<td class="px-3 py-2">{row.data?.lastName ?? '–'}</td>
						<td class="px-3 py-2 text-gray-500 dark:text-slate-400">{row.data?.email ?? '–'}</td>
						<td class="px-3 py-2 text-gray-500 dark:text-slate-400">{row.data?.status ?? '–'}</td>
						<td class="px-3 py-2 text-xs">
							{#if row.errors.length > 0}
								<span class="text-red-700 dark:text-red-400">{row.errors.join('; ')}</span>
							{:else if row.duplicateEmail}
								<span class="text-yellow-700 dark:text-yellow-400">Duplikat – wird übersprungen</span>
							{:else}
								<span class="text-green-700 dark:text-green-400">OK</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>

	<div class="flex flex-col gap-3 sm:flex-row">
		<form method="POST" action="?/import">
			<input type="hidden" name="csvText" value={form.csvText} />
			<button
				type="submit"
				disabled={validRows.length === 0 || p.missingRequired.length > 0}
				class="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{validRows.length} Mitglied{validRows.length === 1 ? '' : 'er'} importieren
			</button>
		</form>
		<a
			href="/import"
			class="inline-flex items-center rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
		>
			Abbrechen
		</a>
	</div>
{:else}
	<div class="rounded-lg bg-white dark:bg-slate-800 p-4 shadow">
		{#if form?.error}
			<div class="mb-4 rounded bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">
				{form.error}
			</div>
		{/if}

		<form method="POST" action="?/preview" enctype="multipart/form-data" class="space-y-4">
			<div>
				<label for="file" class="block text-sm font-medium text-gray-700 dark:text-slate-300">
					CSV-Datei
				</label>
				<input
					id="file"
					name="file"
					type="file"
					accept=".csv,text/csv"
					required
					class="mt-1 block w-full text-sm text-gray-700 dark:text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-red-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-red-800"
				/>
			</div>

			<button
				type="submit"
				class="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
			>
				Vorschau anzeigen
			</button>
		</form>

		<div class="mt-6 border-t border-gray-200 dark:border-slate-700 pt-4 text-sm text-gray-600 dark:text-slate-400">
			<p class="font-medium text-gray-700 dark:text-slate-300">Erwartetes Format</p>
			<p class="mt-2">
				Die erste Zeile muss Spaltennamen enthalten. Erkannt werden u.a.:
				<em>Vorname, Nachname, E-Mail, Telefon, Straße, PLZ, Ort, Geburtsdatum, Beruf, Mitglied seit, Status, Notizen</em>.
			</p>
			<p class="mt-2">
				Pflichtspalten: <strong>Vorname</strong> und <strong>Nachname</strong>. Datumsformate:
				<code>YYYY-MM-DD</code> oder <code>TT.MM.JJJJ</code>.
			</p>
		</div>
	</div>
{/if}

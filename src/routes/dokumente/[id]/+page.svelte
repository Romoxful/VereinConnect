<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const categoryLabels: Record<string, string> = {
		satzung: 'Satzung',
		bescheide: 'Bescheide',
		finanzen: 'Finanzen',
		sonstiges: 'Sonstiges'
	};

	const categoryColors: Record<string, string> = {
		satzung: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
		bescheide: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300',
		finanzen: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
		sonstiges: 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200'
	};

	function formatSize(bytes: number): string {
		if (!bytes) return '–';
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
	}
</script>

<svelte:head>
	<title>{data.document.title} - Förderverein FF</title>
</svelte:head>

<div class="mb-6">
	<a href="/dokumente" class="text-sm text-red-700 dark:text-red-400 hover:underline">&larr; Zurück</a>
</div>

{#if form?.error}
	<div class="mb-4 rounded bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">{form.error}</div>
{/if}

<div class="max-w-3xl">
	<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100">{data.document.title}</h1>
			<div class="mt-2 flex items-center gap-2">
				<span class="rounded-full px-2 py-0.5 text-xs font-medium {categoryColors[data.document.category]}">
					{categoryLabels[data.document.category]}
				</span>
				<span class="text-xs text-gray-400 dark:text-slate-500">
					{data.versions.length} {data.versions.length === 1 ? 'Version' : 'Versionen'}
				</span>
			</div>
		</div>
		<a
			href="/dokumente/{data.document.id}/download"
			class="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
		>
			Aktuelle Version herunterladen
		</a>
	</div>

	<div class="mb-6 rounded-lg bg-white dark:bg-slate-800 p-6 shadow">
		<div class="grid gap-4 sm:grid-cols-3">
			<div>
				<p class="text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Aktuelle Datei</p>
				<p class="text-sm text-gray-900 dark:text-slate-100 break-all">{data.document.originalName}</p>
			</div>
			<div>
				<p class="text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Hochgeladen von</p>
				<p class="text-sm text-gray-900 dark:text-slate-100">{data.document.uploaderName ?? '–'}</p>
			</div>
			<div>
				<p class="text-xs font-medium uppercase text-gray-400 dark:text-slate-500">Erstellt am</p>
				<p class="text-sm text-gray-900 dark:text-slate-100">
					{new Date(data.document.createdAt).toLocaleDateString('de-DE')}
				</p>
			</div>
		</div>
	</div>

	{#if data.user?.role === 'vorstand'}
		<div class="mb-6 rounded-lg bg-white dark:bg-slate-800 p-6 shadow">
			<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Neue Version hochladen</h2>
			<form method="POST" action="?/uploadVersion" enctype="multipart/form-data" class="space-y-4">
				<div>
					<label for="file" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Datei * (max. 10 MB)</label>
					<input id="file" name="file" type="file" required
						accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
						class="mt-1 block w-full text-sm text-gray-500 dark:text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-red-50 dark:file:bg-red-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-red-700 dark:file:text-red-400 hover:file:bg-red-100 dark:hover:file:bg-red-900/60" />
					<p class="mt-1 text-xs text-gray-400 dark:text-slate-500">Erlaubt: PDF, DOCX, JPG, PNG, GIF, WebP</p>
				</div>
				<button type="submit"
					class="rounded-lg bg-red-700 px-6 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none">
					Neue Version hochladen
				</button>
			</form>
		</div>
	{/if}

	<div class="rounded-lg bg-white dark:bg-slate-800 p-6 shadow">
		<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Versionshistorie</h2>
		{#if data.versions.length === 0}
			<p class="text-sm text-gray-500 dark:text-slate-400">Keine Versionen vorhanden.</p>
		{:else}
			<ul class="divide-y divide-gray-200 dark:divide-slate-700">
				{#each data.versions as v, i}
					<li class="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
						<div class="min-w-0">
							<div class="flex items-center gap-2">
								<span class="rounded bg-gray-100 dark:bg-slate-700 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:text-slate-200">
									v{v.versionNumber}
								</span>
								{#if i === 0}
									<span class="rounded bg-green-100 dark:bg-green-900/40 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
										Aktuell
									</span>
								{/if}
							</div>
							<p class="mt-1 text-sm text-gray-900 dark:text-slate-100 break-all">{v.originalName}</p>
							<p class="text-xs text-gray-400 dark:text-slate-500">
								{new Date(v.createdAt).toLocaleString('de-DE')} &middot; {formatSize(v.size)}
							</p>
						</div>
						<a
							href="/dokumente/{data.document.id}/download?version={v.versionNumber}"
							class="inline-flex shrink-0 items-center rounded bg-gray-100 dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
						>
							Herunterladen
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let isVorstand = $derived(data.user?.role === 'vorstand');

	const statusColors: Record<string, string> = {
		offen: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
		bezahlt: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
		'überfällig': 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
	};

	const statusLabels: Record<string, string> = {
		offen: 'Offen',
		bezahlt: 'Bezahlt',
		'überfällig': 'Überfällig'
	};
</script>

<svelte:head>
	<title>Beiträge - Förderverein FF</title>
</svelte:head>

<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100">Beiträge</h1>
	{#if isVorstand}
		<a href="/beitraege/neu"
			class="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none">
			+ Neuer Beitrag
		</a>
	{/if}
</div>

<!-- Filters -->
<form method="GET" class="mb-6 grid gap-3 sm:grid-cols-3">
	<select name="year"
		class="rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none">
		<option value="">Alle Jahre</option>
		{#each data.years as year}
			<option value={year} selected={data.filters.year === String(year)}>{year}</option>
		{/each}
	</select>

	<select name="status"
		class="rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none">
		<option value="">Alle Status</option>
		<option value="offen" selected={data.filters.status === 'offen'}>Offen</option>
		<option value="bezahlt" selected={data.filters.status === 'bezahlt'}>Bezahlt</option>
		<option value="überfällig" selected={data.filters.status === 'überfällig'}>Überfällig</option>
	</select>

	<select name="member"
		class="rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none">
		<option value="">Alle Mitglieder</option>
		{#each data.members as member}
			<option value={member.id} selected={data.filters.member === String(member.id)}>
				{member.lastName}, {member.firstName}
			</option>
		{/each}
	</select>

	<div class="flex gap-2 sm:col-span-3">
		<button type="submit"
			class="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800">
			Filtern
		</button>
		<a href="/beitraege"
			class="rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700">
			Zurücksetzen
		</a>
	</div>
</form>

{#if data.dues.length === 0}
	<div class="rounded-lg bg-white dark:bg-slate-800 p-8 text-center shadow">
		<p class="text-gray-500 dark:text-slate-400">Keine Beiträge gefunden.</p>
	</div>
{:else}
	<!-- Mobile cards -->
	<div class="space-y-3 sm:hidden">
		{#each data.dues as due}
			<a href="/beitraege/{due.id}" class="block rounded-lg bg-white dark:bg-slate-800 p-4 shadow hover:shadow-md transition-shadow">
				<div class="flex items-start justify-between">
					<div>
						<p class="font-medium text-gray-900 dark:text-slate-100">{due.memberLastName}, {due.memberFirstName}</p>
						<p class="text-sm text-gray-500 dark:text-slate-400">{due.year} &middot; {due.amount} €</p>
						<p class="text-xs text-gray-400 dark:text-slate-500">Fällig: {new Date(due.dueDate).toLocaleDateString('de-DE')}</p>
					</div>
					<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusColors[due.status]}">
						{statusLabels[due.status]}
					</span>
				</div>
			</a>
		{/each}
	</div>

	<!-- Desktop table -->
	<div class="hidden overflow-x-auto rounded-lg bg-white dark:bg-slate-800 shadow sm:block">
		<table class="w-full text-left text-sm">
			<thead class="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
				<tr>
					<th class="px-4 py-3 font-medium text-gray-700 dark:text-slate-300">Mitglied</th>
					<th class="px-4 py-3 font-medium text-gray-700 dark:text-slate-300">Jahr</th>
					<th class="px-4 py-3 font-medium text-gray-700 dark:text-slate-300">Betrag</th>
					<th class="px-4 py-3 font-medium text-gray-700 dark:text-slate-300">Fällig am</th>
					<th class="px-4 py-3 font-medium text-gray-700 dark:text-slate-300">Bezahlt am</th>
					<th class="px-4 py-3 font-medium text-gray-700 dark:text-slate-300">Status</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100 dark:divide-slate-700">
				{#each data.dues as due}
					<tr class="hover:bg-gray-50 dark:hover:bg-slate-700">
						<td class="px-4 py-3">
							<a href="/beitraege/{due.id}" class="text-red-700 dark:text-red-400 hover:underline">
								{due.memberLastName}, {due.memberFirstName}
							</a>
						</td>
						<td class="px-4 py-3">{due.year}</td>
						<td class="px-4 py-3">{due.amount} €</td>
						<td class="px-4 py-3">{new Date(due.dueDate).toLocaleDateString('de-DE')}</td>
						<td class="px-4 py-3">
							{#if due.paidDate}
								{new Date(due.paidDate).toLocaleDateString('de-DE')}
							{:else}
								—
							{/if}
						</td>
						<td class="px-4 py-3">
							<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusColors[due.status]}">
								{statusLabels[due.status]}
							</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

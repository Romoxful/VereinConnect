<script lang="ts">
	import { page } from '$app/state';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search = $state('');
	let tab = $derived((page.url.searchParams.get('tab') ?? 'alle') as
		| 'alle'
		| 'aktiv'
		| 'beantragt'
		| 'abgelehnt');

	let isVorstand = $derived(data.user?.role === 'vorstand');

	let pendingCount = $derived(data.members.filter((m) => m.status === 'beantragt').length);

	let filtered = $derived(
		data.members
			.filter((m) => {
				if (tab === 'alle')
					return m.status === 'aktiv' || m.status === 'inaktiv' || m.status === 'ausgetreten';
				return m.status === tab;
			})
			.filter((m) => {
				const term = search.toLowerCase();
				return (
					m.firstName.toLowerCase().includes(term) ||
					m.lastName.toLowerCase().includes(term) ||
					(m.email?.toLowerCase().includes(term) ?? false) ||
					(m.city?.toLowerCase().includes(term) ?? false)
				);
			})
	);

	const statusColors: Record<string, string> = {
		aktiv: 'bg-green-100 text-green-800',
		inaktiv: 'bg-yellow-100 text-yellow-800',
		ausgetreten: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
		beantragt: 'bg-blue-100 text-blue-800',
		abgelehnt: 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300'
	};

	const tabs: { id: 'alle' | 'aktiv' | 'beantragt' | 'abgelehnt'; label: string }[] = [
		{ id: 'alle', label: 'Alle Mitglieder' },
		{ id: 'beantragt', label: 'Aufnahmeanträge' },
		{ id: 'abgelehnt', label: 'Abgelehnt' }
	];
</script>

<svelte:head>
	<title>Mitglieder - Förderverein FF</title>
</svelte:head>

<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100">Mitglieder</h1>
	{#if isVorstand}
		<div class="flex flex-wrap gap-2">
			<a
				href="/api/mitglieder/export"
				class="inline-flex items-center rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
			>
				⬇ CSV-Export
			</a>
			<a
				href="/import"
				class="inline-flex items-center rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
			>
				⬆ CSV-Import
			</a>
			<a
				href="/mitglieder/neu"
				class="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
			>
				+ Neues Mitglied
			</a>
		</div>
	{/if}
</div>

{#if isVorstand}
	<div class="mb-4 flex flex-wrap gap-2 border-b border-gray-200 dark:border-slate-700">
		{#each tabs as t}
			<a
				href={t.id === 'alle' ? '/mitglieder' : `/mitglieder?tab=${t.id}`}
				class="relative px-3 py-2 text-sm font-medium {tab === t.id
					? 'border-b-2 border-red-700 text-red-700 dark:text-red-400'
					: 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}"
			>
				{t.label}
				{#if t.id === 'beantragt' && pendingCount > 0}
					<span
						class="ml-1 inline-flex items-center justify-center rounded-full bg-red-700 px-2 py-0.5 text-xs font-semibold text-white"
					>
						{pendingCount}
					</span>
				{/if}
			</a>
		{/each}
	</div>
{/if}

<div class="mb-4">
	<input
		type="search"
		placeholder="Suchen..."
		bind:value={search}
		class="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none sm:max-w-xs"
	/>
</div>

{#if filtered.length === 0}
	<p class="text-gray-500 dark:text-slate-400">
		{#if tab === 'beantragt'}
			Keine offenen Aufnahmeanträge.
		{:else if tab === 'abgelehnt'}
			Keine abgelehnten Anträge.
		{:else}
			Keine Mitglieder gefunden.
		{/if}
	</p>
{:else if tab === 'beantragt' && isVorstand}
	<!-- Application cards with accept/reject -->
	<div class="space-y-3">
		{#each filtered as applicant}
			<div class="rounded-lg bg-white dark:bg-slate-800 p-4 shadow">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div class="flex-1">
						<div class="flex items-center gap-2">
							<a
								href="/mitglieder/{applicant.id}"
								class="font-medium text-red-700 dark:text-red-400 hover:underline"
							>
								{applicant.lastName}, {applicant.firstName}
							</a>
							<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusColors.beantragt}">
								beantragt
							</span>
						</div>
						<div class="mt-1 text-sm text-gray-600 dark:text-slate-400">
							{#if applicant.email}<p>{applicant.email}</p>{/if}
							{#if applicant.phone}<p>{applicant.phone}</p>{/if}
							{#if applicant.street || applicant.zip || applicant.city}
								<p>
									{applicant.street ?? ''}{applicant.street ? ', ' : ''}{applicant.zip ?? ''}
									{applicant.city ?? ''}
								</p>
							{/if}
							{#if applicant.birthDate}
								<p>Geburtsdatum: {new Date(applicant.birthDate).toLocaleDateString('de-DE')}</p>
							{/if}
							{#if applicant.profession}<p>Beruf: {applicant.profession}</p>{/if}
							{#if applicant.notes}
								<p class="mt-2 border-l-2 border-gray-200 dark:border-slate-700 pl-3 text-gray-500 dark:text-slate-400 italic">
									„{applicant.notes}"
								</p>
							{/if}
							<p class="mt-2 text-xs text-gray-400 dark:text-slate-500">
								Eingegangen: {new Date(applicant.createdAt).toLocaleDateString('de-DE')}
							</p>
						</div>
					</div>
					<div class="flex shrink-0 gap-2">
						<form method="POST" action="?/accept">
							<input type="hidden" name="id" value={applicant.id} />
							<button
								type="submit"
								class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
							>
								Annehmen
							</button>
						</form>
						<form method="POST" action="?/reject">
							<input type="hidden" name="id" value={applicant.id} />
							<button
								type="submit"
								class="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
							>
								Ablehnen
							</button>
						</form>
					</div>
				</div>
			</div>
		{/each}
	</div>
{:else}
	<!-- Mobile cards -->
	<div class="space-y-3 sm:hidden">
		{#each filtered as member}
			<a href="/mitglieder/{member.id}" class="block rounded-lg bg-white dark:bg-slate-800 p-4 shadow">
				<div class="flex items-center justify-between">
					<div>
						<p class="font-medium text-gray-900 dark:text-slate-100">{member.lastName}, {member.firstName}</p>
						{#if member.email}
							<p class="text-sm text-gray-500 dark:text-slate-400">{member.email}</p>
						{/if}
						{#if member.city}
							<p class="text-sm text-gray-400 dark:text-slate-500">{member.city}</p>
						{/if}
					</div>
					<span
						class="rounded-full px-2 py-0.5 text-xs font-medium {statusColors[member.status]}"
					>
						{member.status}
					</span>
				</div>
			</a>
		{/each}
	</div>

	<!-- Desktop table -->
	<div class="hidden overflow-x-auto rounded-lg bg-white dark:bg-slate-800 shadow sm:block">
		<table class="w-full text-left text-sm">
			<thead class="border-b bg-gray-50 dark:bg-slate-800 text-xs uppercase text-gray-500 dark:text-slate-400">
				<tr>
					<th class="px-4 py-3">Name</th>
					<th class="px-4 py-3">E-Mail</th>
					<th class="px-4 py-3">Ort</th>
					<th class="px-4 py-3">Mitglied seit</th>
					<th class="px-4 py-3">Status</th>
				</tr>
			</thead>
			<tbody class="divide-y">
				{#each filtered as member}
					<tr class="hover:bg-gray-50 dark:hover:bg-slate-700">
						<td class="px-4 py-3">
							<a href="/mitglieder/{member.id}" class="font-medium text-red-700 dark:text-red-400 hover:underline">
								{member.lastName}, {member.firstName}
							</a>
						</td>
						<td class="px-4 py-3 text-gray-500 dark:text-slate-400">{member.email ?? '–'}</td>
						<td class="px-4 py-3 text-gray-500 dark:text-slate-400">{member.city ?? '–'}</td>
						<td class="px-4 py-3 text-gray-500 dark:text-slate-400">
							{new Date(member.memberSince).toLocaleDateString('de-DE')}
						</td>
						<td class="px-4 py-3">
							<span
								class="rounded-full px-2 py-0.5 text-xs font-medium {statusColors[member.status]}"
							>
								{member.status}
							</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

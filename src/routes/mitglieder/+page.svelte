<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search = $state('');

	let filtered = $derived(
		data.members.filter((m) => {
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
		ausgetreten: 'bg-red-100 text-red-800'
	};
</script>

<svelte:head>
	<title>Mitglieder - Förderverein FF</title>
</svelte:head>

<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
	<h1 class="text-2xl font-bold text-gray-900">Mitglieder</h1>
	{#if data.user?.role === 'vorstand'}
		<a
			href="/mitglieder/neu"
			class="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
		>
			+ Neues Mitglied
		</a>
	{/if}
</div>

<div class="mb-4">
	<input
		type="search"
		placeholder="Suchen..."
		bind:value={search}
		class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none sm:max-w-xs"
	/>
</div>

{#if filtered.length === 0}
	<p class="text-gray-500">Keine Mitglieder gefunden.</p>
{:else}
	<!-- Mobile cards -->
	<div class="space-y-3 sm:hidden">
		{#each filtered as member}
			<a href="/mitglieder/{member.id}" class="block rounded-lg bg-white p-4 shadow">
				<div class="flex items-center justify-between">
					<div>
						<p class="font-medium text-gray-900">{member.lastName}, {member.firstName}</p>
						{#if member.email}
							<p class="text-sm text-gray-500">{member.email}</p>
						{/if}
						{#if member.city}
							<p class="text-sm text-gray-400">{member.city}</p>
						{/if}
					</div>
					<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusColors[member.status]}">
						{member.status}
					</span>
				</div>
			</a>
		{/each}
	</div>

	<!-- Desktop table -->
	<div class="hidden overflow-x-auto rounded-lg bg-white shadow sm:block">
		<table class="w-full text-left text-sm">
			<thead class="border-b bg-gray-50 text-xs uppercase text-gray-500">
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
					<tr class="hover:bg-gray-50">
						<td class="px-4 py-3">
							<a href="/mitglieder/{member.id}" class="font-medium text-red-700 hover:underline">
								{member.lastName}, {member.firstName}
							</a>
						</td>
						<td class="px-4 py-3 text-gray-500">{member.email ?? '–'}</td>
						<td class="px-4 py-3 text-gray-500">{member.city ?? '–'}</td>
						<td class="px-4 py-3 text-gray-500">
							{new Date(member.memberSince).toLocaleDateString('de-DE')}
						</td>
						<td class="px-4 py-3">
							<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusColors[member.status]}">
								{member.status}
							</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

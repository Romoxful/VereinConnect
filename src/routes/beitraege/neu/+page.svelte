<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const currentYear = new Date().getFullYear();
</script>

<svelte:head>
	<title>Neuer Beitrag - Förderverein FF</title>
</svelte:head>

<div class="mb-6">
	<a href="/beitraege" class="text-sm text-red-700 dark:text-red-400 hover:underline">&larr; Zurück</a>
</div>

<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-slate-100">Neuer Beitrag</h1>

{#if form?.error}
	<div class="mb-4 rounded bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">{form.error}</div>
{/if}

<form method="POST" class="max-w-lg space-y-4">
	<div>
		<label for="memberId" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Mitglied *</label>
		<select id="memberId" name="memberId" required
			class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none">
			<option value="">— Mitglied wählen —</option>
			{#each data.members as member}
				<option value={member.id} selected={form?.memberId === member.id}>
					{member.lastName}, {member.firstName}
				</option>
			{/each}
		</select>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div>
			<label for="amount" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Betrag (€) *</label>
			<input id="amount" name="amount" type="number" step="0.01" min="0" required
				value={form?.amount ?? ''}
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
		</div>
		<div>
			<label for="year" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Jahr *</label>
			<input id="year" name="year" type="number" min="2000" max="2100" required
				value={form?.year ?? currentYear}
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
		</div>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div>
			<label for="dueDate" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Fällig am *</label>
			<input id="dueDate" name="dueDate" type="date" required
				value={form?.dueDate ?? ''}
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none" />
		</div>
		<div>
			<label for="status" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Status</label>
			<select id="status" name="status"
				class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none">
				<option value="offen">Offen</option>
				<option value="bezahlt">Bezahlt</option>
				<option value="überfällig">Überfällig</option>
			</select>
		</div>
	</div>

	<div>
		<label for="notes" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Notizen</label>
		<textarea id="notes" name="notes" rows="3"
			class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
		>{form?.notes ?? ''}</textarea>
	</div>

	<button type="submit"
		class="rounded-lg bg-red-700 px-6 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none">
		Beitrag anlegen
	</button>
</form>

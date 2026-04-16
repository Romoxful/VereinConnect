<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let statusFilter = $state<'alle' | 'offen' | 'in_bearbeitung' | 'erledigt'>('alle');
	let assigneeFilter = $state<string>('alle');

	const today = new Date().toISOString().split('T')[0];

	const statusLabels: Record<string, string> = {
		offen: 'Offen',
		in_bearbeitung: 'In Bearbeitung',
		erledigt: 'Erledigt'
	};

	const statusColors: Record<string, string> = {
		offen: 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300',
		in_bearbeitung: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
		erledigt: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
	};

	const priorityLabels: Record<string, string> = {
		niedrig: 'Niedrig',
		mittel: 'Mittel',
		hoch: 'Hoch'
	};

	const priorityColors: Record<string, string> = {
		niedrig: 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300',
		mittel: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
		hoch: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
	};

	function isOverdue(t: { dueDate: string | null; status: string }) {
		return !!t.dueDate && t.dueDate < today && t.status !== 'erledigt';
	}

	let filtered = $derived(
		data.tasks.filter((t) => {
			const matchesStatus = statusFilter === 'alle' || t.status === statusFilter;
			const matchesAssignee =
				assigneeFilter === 'alle' ||
				(assigneeFilter === 'unassigned' && t.assignedTo === null) ||
				String(t.assignedTo) === assigneeFilter;
			return matchesStatus && matchesAssignee;
		})
	);
</script>

<svelte:head>
	<title>Aufgaben - Förderverein FF</title>
</svelte:head>

<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100">Aufgaben</h1>
	{#if data.user?.role === 'vorstand'}
		<a
			href="/aufgaben/neu"
			class="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
		>
			+ Neue Aufgabe
		</a>
	{/if}
</div>

<div class="mb-4 flex flex-col gap-3 sm:flex-row">
	<div>
		<label for="statusFilter" class="block text-xs font-medium text-gray-500 dark:text-slate-400">Status</label>
		<select
			id="statusFilter"
			bind:value={statusFilter}
			class="mt-1 rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
		>
			<option value="alle">Alle</option>
			<option value="offen">Offen</option>
			<option value="in_bearbeitung">In Bearbeitung</option>
			<option value="erledigt">Erledigt</option>
		</select>
	</div>
	{#if data.user?.role === 'vorstand' && data.users.length > 0}
		<div>
			<label for="assigneeFilter" class="block text-xs font-medium text-gray-500 dark:text-slate-400">Zugewiesen an</label>
			<select
				id="assigneeFilter"
				bind:value={assigneeFilter}
				class="mt-1 rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
			>
				<option value="alle">Alle</option>
				<option value="unassigned">Nicht zugewiesen</option>
				{#each data.users as u}
					<option value={String(u.id)}>{u.name}</option>
				{/each}
			</select>
		</div>
	{/if}
</div>

{#if filtered.length === 0}
	<p class="text-gray-500 dark:text-slate-400">Keine Aufgaben gefunden.</p>
{:else}
	<div class="space-y-3">
		{#each filtered as task}
			{@const overdue = isOverdue(task)}
			<a
				href="/aufgaben/{task.id}"
				class="block rounded-lg bg-white dark:bg-slate-800 p-4 shadow hover:shadow-md transition-shadow {overdue ? 'border-l-4 border-red-600' : ''}"
			>
				<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
					<div class="min-w-0 flex-1">
						<div class="flex flex-wrap items-center gap-2">
							<h3 class="font-medium text-gray-900 dark:text-slate-100">{task.title}</h3>
							{#if overdue}
								<span class="rounded-full bg-red-100 dark:bg-red-900/40 px-2 py-0.5 text-xs font-medium text-red-800 dark:text-red-300">
									Überfällig
								</span>
							{/if}
						</div>
						<div class="mt-1 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-slate-400">
							{#if task.dueDate}
								<span>
									Fällig: {new Date(task.dueDate).toLocaleDateString('de-DE')}
								</span>
							{/if}
							<span>
								Zugewiesen: {task.assigneeName ?? '—'}
							</span>
							{#if task.eventTitle}
								<span>
									Veranstaltung: {task.eventTitle}
								</span>
							{/if}
						</div>
					</div>
					<div class="flex shrink-0 flex-wrap gap-2">
						<span class="rounded-full px-2 py-0.5 text-xs font-medium {priorityColors[task.priority]}">
							{priorityLabels[task.priority]}
						</span>
						<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusColors[task.status]}">
							{statusLabels[task.status]}
						</span>
					</div>
				</div>
			</a>
		{/each}
	</div>
{/if}

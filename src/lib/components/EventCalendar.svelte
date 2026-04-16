<script lang="ts">
	export type CalendarEvent = {
		id: number;
		title: string;
		date: string;
		time: string | null;
		location?: string | null;
		myRsvpStatus: 'zugesagt' | 'abgesagt' | 'vielleicht' | null;
	};

	let { events }: { events: CalendarEvent[] } = $props();

	const germanMonths = [
		'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
		'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
	];
	const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

	const today = new Date();
	const todayISO = toISODate(today);

	let view = $state<'month' | 'week'>('month');
	let cursor = $state(new Date(today.getFullYear(), today.getMonth(), today.getDate()));

	function toISODate(d: Date) {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}

	function addDays(d: Date, n: number) {
		return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
	}

	function startOfWeek(d: Date) {
		const offset = (d.getDay() + 6) % 7;
		return addDays(d, -offset);
	}

	function prev() {
		if (view === 'month') {
			cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
		} else {
			cursor = addDays(cursor, -7);
		}
	}

	function next() {
		if (view === 'month') {
			cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
		} else {
			cursor = addDays(cursor, 7);
		}
	}

	function goToday() {
		cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	}

	const eventsByDate = $derived(
		events.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
			(acc[e.date] ??= []).push(e);
			return acc;
		}, {})
	);

	const monthCells = $derived.by(() => {
		const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
		const start = startOfWeek(first);
		return Array.from({ length: 42 }, (_, i) => addDays(start, i));
	});

	const weekCells = $derived.by(() => {
		const start = startOfWeek(cursor);
		return Array.from({ length: 7 }, (_, i) => addDays(start, i));
	});

	const title = $derived.by(() => {
		if (view === 'month') {
			return `${germanMonths[cursor.getMonth()]} ${cursor.getFullYear()}`;
		}
		const start = startOfWeek(cursor);
		const end = addDays(start, 6);
		const startLabel = `${start.getDate()}. ${germanMonths[start.getMonth()]}`;
		const endLabel = `${end.getDate()}. ${germanMonths[end.getMonth()]} ${end.getFullYear()}`;
		return `${startLabel} – ${endLabel}`;
	});

	function pillClass(status: CalendarEvent['myRsvpStatus']) {
		if (status === 'zugesagt')
			return 'bg-green-100 text-green-900 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-200 dark:hover:bg-green-900/60 border-l-2 border-green-500';
		if (status === 'abgesagt')
			return 'bg-red-100 text-red-900 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-900/60 border-l-2 border-red-500';
		if (status === 'vielleicht')
			return 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-200 dark:hover:bg-yellow-900/60 border-l-2 border-yellow-500';
		return 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 border-l-2 border-gray-400 dark:border-slate-500';
	}

	function statusTitle(status: CalendarEvent['myRsvpStatus']) {
		if (status === 'zugesagt') return 'Zugesagt';
		if (status === 'abgesagt') return 'Abgesagt';
		if (status === 'vielleicht') return 'Vielleicht';
		return 'Keine Rückmeldung';
	}
</script>

<div class="rounded-lg bg-white dark:bg-slate-800 shadow">
	<!-- Controls -->
	<div class="flex flex-col gap-3 border-b border-gray-200 dark:border-slate-700 p-3 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={prev}
				aria-label="Zurück"
				class="rounded-md border border-gray-300 dark:border-slate-600 px-3 py-1.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
			>
				‹
			</button>
			<button
				type="button"
				onclick={goToday}
				class="rounded-md border border-gray-300 dark:border-slate-600 px-3 py-1.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
			>
				Heute
			</button>
			<button
				type="button"
				onclick={next}
				aria-label="Weiter"
				class="rounded-md border border-gray-300 dark:border-slate-600 px-3 py-1.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
			>
				›
			</button>
			<h2 class="ml-2 text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">
				{title}
			</h2>
		</div>
		<div class="inline-flex rounded-md border border-gray-300 dark:border-slate-600 text-sm">
			<button
				type="button"
				onclick={() => (view = 'month')}
				class="rounded-l-md px-3 py-1.5 {view === 'month'
					? 'bg-red-700 text-white dark:bg-red-800'
					: 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'}"
			>
				Monat
			</button>
			<button
				type="button"
				onclick={() => (view = 'week')}
				class="rounded-r-md px-3 py-1.5 {view === 'week'
					? 'bg-red-700 text-white dark:bg-red-800'
					: 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'}"
			>
				Woche
			</button>
		</div>
	</div>

	<!-- Weekday header -->
	<div class="grid grid-cols-7 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
		{#each weekdays as wd}
			<div class="px-2 py-2 text-center text-xs font-medium text-gray-600 dark:text-slate-400">
				{wd}
			</div>
		{/each}
	</div>

	<!-- Grid -->
	{#if view === 'month'}
		<div class="grid grid-cols-7">
			{#each monthCells as day}
				{@const iso = toISODate(day)}
				{@const inMonth = day.getMonth() === cursor.getMonth()}
				{@const dayEvents = eventsByDate[iso] ?? []}
				<div
					class="min-h-[5.5rem] border-b border-r border-gray-200 dark:border-slate-700 p-1.5 text-left {inMonth
						? 'bg-white dark:bg-slate-800'
						: 'bg-gray-50/60 dark:bg-slate-900/30'}"
				>
					<div class="mb-1 flex items-center justify-between">
						<span
							class="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs {iso === todayISO
								? 'bg-red-700 font-semibold text-white dark:bg-red-800'
								: inMonth
									? 'text-gray-900 dark:text-slate-200'
									: 'text-gray-400 dark:text-slate-500'}"
						>
							{day.getDate()}
						</span>
					</div>
					<div class="space-y-0.5">
						{#each dayEvents as ev (ev.id)}
							<a
								href="/veranstaltungen/{ev.id}"
								title="{ev.title}{ev.time ? ' um ' + ev.time : ''} – {statusTitle(ev.myRsvpStatus)}"
								class="block truncate rounded-sm px-1 py-0.5 text-[11px] leading-tight {pillClass(ev.myRsvpStatus)}"
							>
								{#if ev.time}<span class="font-medium">{ev.time}</span> {/if}{ev.title}
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="grid grid-cols-7">
			{#each weekCells as day}
				{@const iso = toISODate(day)}
				{@const dayEvents = eventsByDate[iso] ?? []}
				<div class="min-h-[16rem] border-r border-gray-200 dark:border-slate-700 p-2">
					<div class="mb-2 flex items-center gap-1.5">
						<span
							class="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm {iso === todayISO
								? 'bg-red-700 font-semibold text-white dark:bg-red-800'
								: 'text-gray-900 dark:text-slate-200'}"
						>
							{day.getDate()}
						</span>
						<span class="text-xs text-gray-500 dark:text-slate-400">
							{germanMonths[day.getMonth()].slice(0, 3)}
						</span>
					</div>
					<div class="space-y-1">
						{#each dayEvents as ev (ev.id)}
							<a
								href="/veranstaltungen/{ev.id}"
								title="{statusTitle(ev.myRsvpStatus)}"
								class="block rounded-sm px-1.5 py-1 text-xs leading-tight {pillClass(ev.myRsvpStatus)}"
							>
								{#if ev.time}<div class="font-medium">{ev.time}</div>{/if}
								<div class="truncate">{ev.title}</div>
								{#if ev.location}
									<div class="truncate text-[10px] opacity-75">{ev.location}</div>
								{/if}
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Legend -->
	<div class="flex flex-wrap items-center gap-3 border-t border-gray-200 dark:border-slate-700 px-3 py-2 text-xs text-gray-600 dark:text-slate-400">
		<span class="font-medium">Deine Rückmeldung:</span>
		<span class="inline-flex items-center gap-1">
			<span class="inline-block h-3 w-3 rounded-sm border-l-2 border-green-500 bg-green-100 dark:bg-green-900/40"></span>
			Zugesagt
		</span>
		<span class="inline-flex items-center gap-1">
			<span class="inline-block h-3 w-3 rounded-sm border-l-2 border-yellow-500 bg-yellow-100 dark:bg-yellow-900/40"></span>
			Vielleicht
		</span>
		<span class="inline-flex items-center gap-1">
			<span class="inline-block h-3 w-3 rounded-sm border-l-2 border-red-500 bg-red-100 dark:bg-red-900/40"></span>
			Abgesagt
		</span>
		<span class="inline-flex items-center gap-1">
			<span class="inline-block h-3 w-3 rounded-sm border-l-2 border-gray-400 bg-gray-100 dark:bg-slate-700"></span>
			Keine Rückmeldung
		</span>
	</div>
</div>

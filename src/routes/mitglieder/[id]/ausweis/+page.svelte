<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let m = $derived(data.member);

	const formatDate = (iso: string) =>
		iso ? new Date(iso).toLocaleDateString('de-DE') : '';

	const currentYear = new Date().getFullYear();
</script>

<svelte:head>
	<title>Mitgliedsausweis – {m.firstName} {m.lastName}</title>
</svelte:head>

<div class="mb-4 flex items-center justify-between print:hidden">
	<a href="/mitglieder/{m.id}" class="text-sm text-red-700 dark:text-red-400 hover:underline">
		&larr; Zurück
	</a>
	<button
		type="button"
		onclick={() => window.print()}
		class="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
	>
		Drucken
	</button>
</div>

<div class="flex justify-center">
	<div
		class="member-card relative w-[340px] overflow-hidden rounded-xl bg-gradient-to-br from-red-700 to-red-900 p-6 text-white shadow-2xl print:shadow-none"
	>
		<div class="mb-1 text-[11px] uppercase tracking-widest text-red-100">
			Förderverein Freiwillige Feuerwehr
		</div>
		<div class="mb-6 text-lg font-bold">Mitgliedsausweis</div>

		<div class="mb-1 text-[11px] uppercase tracking-wider text-red-100">Mitglied</div>
		<div class="mb-4 text-2xl font-bold">{m.firstName} {m.lastName}</div>

		<div class="grid grid-cols-2 gap-3 text-[11px]">
			<div>
				<div class="uppercase tracking-wider text-red-100">Mitglied seit</div>
				<div class="font-semibold text-sm">{formatDate(m.memberSince)}</div>
			</div>
			<div>
				<div class="uppercase tracking-wider text-red-100">Mitglieds-Nr.</div>
				<div class="font-semibold text-sm">{String(m.id).padStart(4, '0')}</div>
			</div>
			<div>
				<div class="uppercase tracking-wider text-red-100">Status</div>
				<div class="font-semibold text-sm capitalize">{m.status}</div>
			</div>
			<div>
				<div class="uppercase tracking-wider text-red-100">Gültig für</div>
				<div class="font-semibold text-sm">{currentYear}</div>
			</div>
		</div>

		<div class="absolute right-4 top-4 text-3xl">🚒</div>
	</div>
</div>

<style>
	@media print {
		:global(body) {
			background: white;
		}
		.member-card {
			box-shadow: none !important;
			break-inside: avoid;
		}
	}
</style>

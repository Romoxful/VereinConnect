<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();

	let menuOpen = $state(false);

	const navItems = [
		{ href: '/dashboard', label: 'Dashboard', icon: '📊' },
		{ href: '/mitglieder', label: 'Mitglieder', icon: '👥' },
		{ href: '/beitraege', label: 'Beiträge', icon: '💶' },
		{ href: '/veranstaltungen', label: 'Veranstaltungen', icon: '📅' },
		{ href: '/dokumente', label: 'Dokumente', icon: '📄' },
		{ href: '/protokolle', label: 'Protokolle', icon: '📝' }
	];
</script>

{#if data.user}
	<div class="min-h-screen bg-gray-50">
		<!-- Mobile header -->
		<header class="bg-red-700 text-white shadow-md">
			<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
				<a href="/dashboard" class="text-lg font-bold">Förderverein FF</a>
				<div class="flex items-center gap-3">
					<span class="hidden text-sm sm:inline">{data.user.name}</span>
					<span
						class="rounded-full bg-red-800 px-2 py-0.5 text-xs uppercase"
					>
						{data.user.role}
					</span>
					<button
						class="rounded p-1 hover:bg-red-600 sm:hidden"
						onclick={() => (menuOpen = !menuOpen)}
						aria-label="Menü"
					>
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{#if menuOpen}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							{:else}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
							{/if}
						</svg>
					</button>
				</div>
			</div>

			<!-- Mobile nav -->
			{#if menuOpen}
				<nav class="border-t border-red-600 px-4 py-2 sm:hidden">
					{#each navItems as item}
						<a
							href={item.disabled ? undefined : item.href}
							class="block rounded px-3 py-2 text-sm hover:bg-red-600"
							class:opacity-50={item.disabled}
							class:cursor-not-allowed={item.disabled}
							onclick={() => (menuOpen = false)}
						>
							{item.icon} {item.label}
							{#if item.disabled}
								<span class="text-xs">(Phase 2)</span>
							{/if}
						</a>
					{/each}
					<form method="POST" action="/logout" class="mt-2">
						<button class="block w-full rounded px-3 py-2 text-left text-sm hover:bg-red-600">
							Abmelden
						</button>
					</form>
					<div class="mt-2 border-t border-red-600 pt-2">
						<a href="/datenschutz" class="block rounded px-3 py-1.5 text-xs opacity-75 hover:bg-red-600" onclick={() => (menuOpen = false)}>Datenschutz</a>
						<a href="/impressum" class="block rounded px-3 py-1.5 text-xs opacity-75 hover:bg-red-600" onclick={() => (menuOpen = false)}>Impressum</a>
					</div>
				</nav>
			{/if}
		</header>

		<div class="mx-auto max-w-7xl sm:flex">
			<!-- Desktop sidebar -->
			<nav class="hidden w-56 shrink-0 border-r border-gray-200 bg-white p-4 sm:block">
				<ul class="space-y-1">
					{#each navItems as item}
						<li>
							<a
								href={item.disabled ? undefined : item.href}
								class="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
								class:opacity-50={item.disabled}
								class:cursor-not-allowed={item.disabled}
							>
								{item.icon} {item.label}
								{#if item.disabled}
									<span class="text-xs text-gray-400">(Phase 2)</span>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
				<div class="mt-6 border-t border-gray-200 pt-4">
					<form method="POST" action="/logout">
						<button class="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
							Abmelden
						</button>
					</form>
				</div>
				<div class="mt-4 border-t border-gray-200 pt-4">
					<a href="/datenschutz" class="block rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100">Datenschutz</a>
					<a href="/impressum" class="block rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100">Impressum</a>
				</div>
			</nav>

			<!-- Main content -->
			<main class="min-h-[calc(100vh-56px)] flex-1 p-4 sm:p-6">
				{@render children()}
			</main>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-gray-50">
		{@render children()}
	</div>
{/if}

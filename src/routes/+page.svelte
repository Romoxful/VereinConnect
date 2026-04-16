<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
</script>

<svelte:head>
	<title>Förderverein der Freiwilligen Feuerwehr</title>
	<meta
		name="description"
		content="Willkommen beim Förderverein der Freiwilligen Feuerwehr – wir unterstützen unsere Feuerwehr und das Gemeinschaftsleben vor Ort."
	/>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<!-- Top bar -->
	<header class="bg-red-700 text-white shadow-md dark:bg-red-900">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
			<a href="/" class="flex items-center gap-2 text-lg font-bold">
				<span class="text-2xl" aria-hidden="true">🚒</span>
				<span>Förderverein FF</span>
			</a>
			<nav class="flex items-center gap-2 sm:gap-3">
				<a
					href="/aufnahme"
					class="hidden rounded px-3 py-1.5 text-sm hover:bg-red-600 sm:inline-block"
				>
					Mitglied werden
				</a>
				<a
					href="/login"
					class="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:bg-slate-100 dark:text-red-800"
				>
					Anmelden
				</a>
				<ThemeToggle variant="header" />
			</nav>
		</div>
	</header>

	<main class="flex-1">
		<!-- Hero -->
		<section class="bg-gradient-to-b from-red-50 to-white dark:from-slate-800 dark:to-slate-900">
			<div class="mx-auto max-w-5xl px-4 py-12 text-center sm:py-20">
				<div class="mb-6 text-6xl sm:text-7xl" aria-hidden="true">🚒</div>
				<h1 class="text-3xl font-bold text-gray-900 sm:text-5xl dark:text-slate-100">
					Förderverein der Freiwilligen Feuerwehr
				</h1>
				<p class="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg dark:text-slate-300">
					Gemeinsam unterstützen wir unsere Feuerwehrleute, das Ehrenamt und
					das Gemeinschaftsleben in unserer Gemeinde.
				</p>
				<div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
					<a
						href="/aufnahme"
						class="w-full rounded-lg bg-red-700 px-6 py-3 text-sm font-medium text-white shadow hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none sm:w-auto"
					>
						Jetzt Mitglied werden
					</a>
					<a
						href="#ueber-uns"
						class="w-full rounded-lg border border-red-700 bg-white px-6 py-3 text-sm font-medium text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none sm:w-auto dark:border-red-400 dark:bg-transparent dark:text-red-400 dark:hover:bg-slate-800"
					>
						Mehr erfahren
					</a>
				</div>
			</div>
		</section>

		<!-- Über uns -->
		<section id="ueber-uns" class="scroll-mt-16 bg-white py-12 sm:py-16 dark:bg-slate-900">
			<div class="mx-auto max-w-5xl px-4">
				<h2 class="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-slate-100">
					Über unseren Verein
				</h2>
				<p class="mt-4 max-w-3xl text-gray-700 dark:text-slate-300">
					Der Förderverein der Freiwilligen Feuerwehr setzt sich dafür ein, die
					Arbeit der Feuerwehr ideell und materiell zu unterstützen. Wir fördern
					die Jugendarbeit, helfen bei der Beschaffung zusätzlicher Ausrüstung
					und sorgen dafür, dass das Miteinander im Ort lebendig bleibt.
				</p>

				<div class="mt-10 grid gap-6 sm:grid-cols-3">
					<div
						class="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-slate-700 dark:bg-slate-800"
					>
						<div class="text-3xl" aria-hidden="true">🤝</div>
						<h3 class="mt-3 text-lg font-semibold text-gray-900 dark:text-slate-100">
							Gemeinschaft
						</h3>
						<p class="mt-2 text-sm text-gray-600 dark:text-slate-400">
							Wir bringen Menschen zusammen, die sich für ihre Feuerwehr und
							ihren Ort engagieren.
						</p>
					</div>
					<div
						class="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-slate-700 dark:bg-slate-800"
					>
						<div class="text-3xl" aria-hidden="true">🎯</div>
						<h3 class="mt-3 text-lg font-semibold text-gray-900 dark:text-slate-100">
							Unser Zweck
						</h3>
						<p class="mt-2 text-sm text-gray-600 dark:text-slate-400">
							Ideelle und materielle Förderung der Freiwilligen Feuerwehr sowie
							Unterstützung der Jugend- und Nachwuchsarbeit.
						</p>
					</div>
					<div
						class="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-slate-700 dark:bg-slate-800"
					>
						<div class="text-3xl" aria-hidden="true">💪</div>
						<h3 class="mt-3 text-lg font-semibold text-gray-900 dark:text-slate-100">
							Ehrenamt stärken
						</h3>
						<p class="mt-2 text-sm text-gray-600 dark:text-slate-400">
							Wir schaffen den Rahmen, damit sich Ehrenamtliche auf ihre
							wichtige Arbeit konzentrieren können.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Mitglied werden -->
		<section class="bg-gray-50 py-12 sm:py-16 dark:bg-slate-800">
			<div class="mx-auto max-w-5xl px-4">
				<div
					class="rounded-lg bg-white p-8 shadow-sm sm:p-10 dark:bg-slate-900"
				>
					<div class="grid gap-8 sm:grid-cols-2 sm:items-center">
						<div>
							<h2 class="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-slate-100">
								Werden Sie Teil unseres Vereins
							</h2>
							<p class="mt-3 text-gray-700 dark:text-slate-300">
								Mit Ihrer Mitgliedschaft unterstützen Sie direkt die
								Freiwillige Feuerwehr vor Ort. Der Mitgliedsantrag ist in
								wenigen Minuten ausgefüllt – der Vorstand meldet sich
								anschließend bei Ihnen.
							</p>
							<ul class="mt-4 space-y-2 text-sm text-gray-700 dark:text-slate-300">
								<li class="flex items-start gap-2">
									<span class="text-red-700 dark:text-red-400" aria-hidden="true">✓</span>
									Einfacher Mitgliedsantrag online
								</li>
								<li class="flex items-start gap-2">
									<span class="text-red-700 dark:text-red-400" aria-hidden="true">✓</span>
									Digitaler Mitgliedsausweis für aktive Mitglieder
								</li>
								<li class="flex items-start gap-2">
									<span class="text-red-700 dark:text-red-400" aria-hidden="true">✓</span>
									Einladung zu Veranstaltungen und Vereinsleben
								</li>
							</ul>
						</div>
						<div class="flex flex-col gap-3">
							<a
								href="/aufnahme"
								class="block w-full rounded-lg bg-red-700 px-6 py-3 text-center text-sm font-medium text-white shadow hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
							>
								Mitgliedsantrag stellen
							</a>
							<a
								href="/login"
								class="block w-full rounded-lg border border-gray-300 bg-white px-6 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
							>
								Bereits Mitglied? Zum Login
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Kontakt -->
		<section class="bg-white py-12 sm:py-16 dark:bg-slate-900">
			<div class="mx-auto max-w-5xl px-4">
				<h2 class="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-slate-100">Kontakt</h2>
				<p class="mt-3 text-gray-700 dark:text-slate-300">
					Sie haben Fragen zum Verein oder zur Mitgliedschaft? Wir freuen uns
					auf Ihre Nachricht.
				</p>

				<div class="mt-8 grid gap-6 sm:grid-cols-2">
					<div
						class="rounded-lg border border-gray-200 p-6 dark:border-slate-700"
					>
						<h3 class="text-lg font-semibold text-gray-900 dark:text-slate-100">
							Postanschrift
						</h3>
						<address class="mt-2 text-sm not-italic text-gray-700 dark:text-slate-300">
							Förderverein der Freiwilligen Feuerwehr e.V.<br />
							[Straße und Hausnummer]<br />
							[PLZ Ort]
						</address>
					</div>
					<div
						class="rounded-lg border border-gray-200 p-6 dark:border-slate-700"
					>
						<h3 class="text-lg font-semibold text-gray-900 dark:text-slate-100">
							Direkter Kontakt
						</h3>
						<p class="mt-2 text-sm text-gray-700 dark:text-slate-300">
							Telefon: [Telefonnummer]<br />
							E-Mail: [E-Mail-Adresse]
						</p>
						<p class="mt-3 text-xs text-gray-500 dark:text-slate-400">
							Weitere Angaben finden Sie im
							<a href="/impressum" class="text-red-700 underline dark:text-red-400">Impressum</a>.
						</p>
					</div>
				</div>
			</div>
		</section>
	</main>

	<footer class="border-t border-gray-200 bg-gray-50 py-6 dark:border-slate-700 dark:bg-slate-800">
		<div
			class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-gray-500 sm:flex-row dark:text-slate-400"
		>
			<span>© {new Date().getFullYear()} Förderverein der Freiwilligen Feuerwehr e.V.</span>
			<div class="flex gap-4">
				<a href="/impressum" class="hover:underline">Impressum</a>
				<a href="/datenschutz" class="hover:underline">Datenschutz</a>
				<a href="/login" class="hover:underline">Anmelden</a>
			</div>
		</div>
	</footer>
</div>

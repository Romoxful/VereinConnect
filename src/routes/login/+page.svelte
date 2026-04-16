<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-sm">
		<div class="rounded-lg bg-white p-6 shadow-md">
			<div class="mb-6 text-center">
				<h1 class="text-2xl font-bold text-red-700">Förderverein FF</h1>
				<p class="mt-1 text-sm text-gray-500">Freiwillige Feuerwehr</p>
			</div>

			{#if form?.error}
				<div class="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
					{form.error}
				</div>
			{/if}

			<form method="POST" class="space-y-4">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700">E-Mail</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						value={form?.email ?? ''}
						class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700">Passwort</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
					/>
				</div>

				<button
					type="submit"
					class="w-full rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
				>
					Anmelden
				</button>
			</form>

			<p class="mt-4 text-center text-xs text-gray-400">
				Standard: admin@foerderverein.de / admin123
			</p>
		</div>
	</div>
</div>

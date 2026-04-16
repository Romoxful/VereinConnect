<script lang="ts">
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-sm">
		<div class="rounded-lg bg-white p-6 shadow-md">
			<div class="mb-6 text-center">
				<h1 class="text-2xl font-bold text-red-700">Neues Passwort vergeben</h1>
				<p class="mt-1 text-sm text-gray-500">Förderverein FF</p>
			</div>

			{#if !data.tokenValid || form?.tokenInvalid}
				<div class="mb-4 rounded bg-red-50 p-3 text-sm text-red-600" data-testid="token-error">
					{form?.error ?? data.tokenError ?? 'Dieser Link ist ungültig.'}
				</div>
				<div class="text-center">
					<a
						href="/passwort-zuruecksetzen"
						class="text-sm text-red-700 hover:text-red-800 hover:underline"
					>
						Neuen Link anfordern
					</a>
				</div>
			{:else}
				{#if form?.error}
					<div class="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
						{form.error}
					</div>
				{/if}

				<p class="mb-4 text-sm text-gray-600">
					Bitte vergeben Sie ein neues Passwort (mindestens 8 Zeichen).
				</p>

				<form method="POST" class="space-y-4">
					<div>
						<label for="password" class="block text-sm font-medium text-gray-700">
							Neues Passwort
						</label>
						<input
							id="password"
							name="password"
							type="password"
							minlength="8"
							required
							class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
						/>
					</div>

					<div>
						<label for="passwordConfirm" class="block text-sm font-medium text-gray-700">
							Passwort bestätigen
						</label>
						<input
							id="passwordConfirm"
							name="passwordConfirm"
							type="password"
							minlength="8"
							required
							class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
						/>
					</div>

					<button
						type="submit"
						class="w-full rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
					>
						Passwort speichern
					</button>
				</form>
			{/if}
		</div>
	</div>
</div>

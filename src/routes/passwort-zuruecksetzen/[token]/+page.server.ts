import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	validateResetToken,
	consumeResetTokenAndSetPassword
} from '$lib/server/password-reset.js';

function tokenErrorMessage(reason: 'not_found' | 'expired' | 'used'): string {
	if (reason === 'expired') {
		return 'Dieser Link ist abgelaufen. Bitte fordern Sie einen neuen Link an.';
	}
	if (reason === 'used') {
		return 'Dieser Link wurde bereits verwendet. Bitte fordern Sie einen neuen Link an.';
	}
	return 'Dieser Link ist ungültig. Bitte fordern Sie einen neuen Link an.';
}

export const load: PageServerLoad = async ({ params, locals }) => {
	if (locals.user) {
		redirect(302, '/dashboard');
	}
	const status = validateResetToken(params.token);
	if (!status.valid) {
		return { tokenValid: false as const, tokenError: tokenErrorMessage(status.reason) };
	}
	return { tokenValid: true as const };
};

export const actions: Actions = {
	default: async ({ request, params, cookies: _cookies }) => {
		const status = validateResetToken(params.token);
		if (!status.valid) {
			return fail(400, {
				error: tokenErrorMessage(status.reason),
				tokenInvalid: true
			});
		}

		const data = await request.formData();
		const password = data.get('password')?.toString() ?? '';
		const passwordConfirm = data.get('passwordConfirm')?.toString() ?? '';

		if (!password || !passwordConfirm) {
			return fail(400, { error: 'Bitte beide Felder ausfüllen.', tokenInvalid: false });
		}
		if (password.length < 8) {
			return fail(400, {
				error: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
				tokenInvalid: false
			});
		}
		if (password !== passwordConfirm) {
			return fail(400, {
				error: 'Die Passwörter stimmen nicht überein.',
				tokenInvalid: false
			});
		}

		const ok = consumeResetTokenAndSetPassword(params.token, password);
		if (!ok) {
			return fail(400, {
				error: 'Der Link ist nicht mehr gültig. Bitte fordern Sie einen neuen Link an.',
				tokenInvalid: true
			});
		}

		redirect(303, '/login?reset=1');
	}
};

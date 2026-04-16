import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { deleteSession } from '$lib/server/auth.js';

export const actions: Actions = {
	default: async ({ cookies }) => {
		const sessionId = cookies.get('session');
		if (sessionId) {
			deleteSession(sessionId);
			cookies.delete('session', { path: '/' });
		}
		redirect(302, '/login');
	}
};

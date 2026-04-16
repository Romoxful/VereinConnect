import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { users } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { verifyPassword, createSession } from '$lib/server/auth.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/dashboard');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email')?.toString() ?? '';
		const password = data.get('password')?.toString() ?? '';

		if (!email || !password) {
			return fail(400, { error: 'Bitte E-Mail und Passwort eingeben.', email });
		}

		const user = db.select().from(users).where(eq(users.email, email)).get();

		if (!user || !verifyPassword(password, user.passwordHash)) {
			return fail(400, { error: 'Ungültige Anmeldedaten.', email });
		}

		const sessionId = createSession(user.id);
		cookies.set('session', sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: false, // Set to true in production with HTTPS
			maxAge: 30 * 24 * 60 * 60 // 30 days
		});

		redirect(302, '/dashboard');
	}
};

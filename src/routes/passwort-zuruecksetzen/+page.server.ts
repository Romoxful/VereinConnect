import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { users } from '$lib/server/db/schema.js';
import { createPasswordResetToken } from '$lib/server/password-reset.js';
import { sendPasswordResetEmail } from '$lib/server/email.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/dashboard');
	}
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const data = await request.formData();
		const email = data.get('email')?.toString().trim() ?? '';

		if (!email) {
			return fail(400, { error: 'Bitte E-Mail-Adresse eingeben.', email });
		}

		const user = db.select().from(users).where(eq(users.email, email)).get();
		if (user) {
			const token = createPasswordResetToken(user.id);
			const resetUrl = `${url.origin}/passwort-zuruecksetzen/${token}`;
			sendPasswordResetEmail(user.email, resetUrl);
		}

		return { success: true };
	}
};

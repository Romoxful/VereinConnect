import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { users, members } from '$lib/server/db/schema.js';
import { eq, and, ne } from 'drizzle-orm';
import { verifyPassword, createPasswordHash } from '$lib/server/auth.js';

function splitName(name: string): { firstName: string; lastName: string } {
	const trimmed = name.trim();
	const idx = trimmed.indexOf(' ');
	if (idx === -1) return { firstName: trimmed, lastName: '' };
	return { firstName: trimmed.slice(0, idx), lastName: trimmed.slice(idx + 1).trim() };
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) error(401, 'Nicht angemeldet.');

	const user = db.select().from(users).where(eq(users.id, locals.user.id)).get();
	if (!user) error(404, 'Benutzer nicht gefunden.');

	const member = user.email
		? db.select().from(members).where(eq(members.email, user.email)).get()
		: undefined;

	const fallback = splitName(user.name);

	return {
		profile: {
			email: user.email,
			firstName: member?.firstName ?? fallback.firstName,
			lastName: member?.lastName ?? fallback.lastName,
			phone: member?.phone ?? '',
			street: member?.street ?? '',
			zip: member?.zip ?? '',
			city: member?.city ?? ''
		},
		hasMember: !!member
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { profileError: 'Nicht angemeldet.' });

		const data = await request.formData();
		const firstName = data.get('firstName')?.toString()?.trim() ?? '';
		const lastName = data.get('lastName')?.toString()?.trim() ?? '';
		const email = data.get('email')?.toString()?.trim() ?? '';
		const phone = data.get('phone')?.toString()?.trim() || null;
		const street = data.get('street')?.toString()?.trim() || null;
		const zip = data.get('zip')?.toString()?.trim() || null;
		const city = data.get('city')?.toString()?.trim() || null;

		if (!firstName || !lastName || !email) {
			return fail(400, {
				profileError: 'Vorname, Nachname und E-Mail sind Pflichtfelder.'
			});
		}

		const emailTaken = db
			.select()
			.from(users)
			.where(and(eq(users.email, email), ne(users.id, locals.user.id)))
			.get();
		if (emailTaken) {
			return fail(400, { profileError: 'Diese E-Mail wird bereits verwendet.' });
		}

		const currentUser = db.select().from(users).where(eq(users.id, locals.user.id)).get();
		if (!currentUser) return fail(404, { profileError: 'Benutzer nicht gefunden.' });

		const fullName = `${firstName} ${lastName}`.trim();
		const oldEmail = currentUser.email;

		db.update(users)
			.set({ name: fullName, email })
			.where(eq(users.id, locals.user.id))
			.run();

		if (oldEmail) {
			const linkedMember = db.select().from(members).where(eq(members.email, oldEmail)).get();
			if (linkedMember) {
				db.update(members)
					.set({ firstName, lastName, email, phone, street, zip, city })
					.where(eq(members.id, linkedMember.id))
					.run();
			}
		}

		return { profileSuccess: 'Profil wurde aktualisiert.' };
	},

	changePassword: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { passwordError: 'Nicht angemeldet.' });

		const data = await request.formData();
		const currentPassword = data.get('currentPassword')?.toString() ?? '';
		const newPassword = data.get('newPassword')?.toString() ?? '';
		const confirmPassword = data.get('confirmPassword')?.toString() ?? '';

		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { passwordError: 'Bitte alle Passwortfelder ausfüllen.' });
		}

		if (newPassword.length < 8) {
			return fail(400, {
				passwordError: 'Das neue Passwort muss mindestens 8 Zeichen lang sein.'
			});
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { passwordError: 'Die neuen Passwörter stimmen nicht überein.' });
		}

		const user = db.select().from(users).where(eq(users.id, locals.user.id)).get();
		if (!user) return fail(404, { passwordError: 'Benutzer nicht gefunden.' });

		if (!verifyPassword(currentPassword, user.passwordHash)) {
			return fail(400, { passwordError: 'Das aktuelle Passwort ist nicht korrekt.' });
		}

		const newHash = createPasswordHash(newPassword);
		db.update(users).set({ passwordHash: newHash }).where(eq(users.id, locals.user.id)).run();

		return { passwordSuccess: 'Passwort wurde erfolgreich geändert.' };
	}
};

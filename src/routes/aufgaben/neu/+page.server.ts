import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { tasks, users, events } from '$lib/server/db/schema.js';
import { asc, desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const userList = db
		.select({ id: users.id, name: users.name })
		.from(users)
		.orderBy(asc(users.name))
		.all();

	const eventList = db
		.select({ id: events.id, title: events.title, date: events.date })
		.from(events)
		.orderBy(desc(events.date))
		.all();

	return { users: userList, events: eventList };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();

		const title = data.get('title')?.toString()?.trim() ?? '';
		const description = data.get('description')?.toString()?.trim() || null;
		const priority = data.get('priority')?.toString() ?? 'mittel';
		const status = data.get('status')?.toString() ?? 'offen';
		const dueDate = data.get('dueDate')?.toString()?.trim() || null;
		const assignedToRaw = data.get('assignedTo')?.toString()?.trim();
		const veranstaltungIdRaw = data.get('veranstaltungId')?.toString()?.trim();

		const assignedTo = assignedToRaw ? Number(assignedToRaw) : null;
		const veranstaltungId = veranstaltungIdRaw ? Number(veranstaltungIdRaw) : null;

		const formState = { title, description, priority, status, dueDate, assignedTo, veranstaltungId };

		if (locals.user?.role !== 'vorstand') {
			return fail(403, { ...formState, error: 'Keine Berechtigung.' });
		}

		if (!title) {
			return fail(400, { ...formState, error: 'Titel ist ein Pflichtfeld.' });
		}

		if (!['niedrig', 'mittel', 'hoch'].includes(priority)) {
			return fail(400, { ...formState, error: 'Ungültige Priorität.' });
		}

		if (!['offen', 'in_bearbeitung', 'erledigt'].includes(status)) {
			return fail(400, { ...formState, error: 'Ungültiger Status.' });
		}

		db.insert(tasks)
			.values({
				title,
				description,
				status: status as 'offen' | 'in_bearbeitung' | 'erledigt',
				priority: priority as 'niedrig' | 'mittel' | 'hoch',
				dueDate,
				assignedTo,
				veranstaltungId,
				createdBy: locals.user?.id ?? null
			})
			.run();

		redirect(302, '/aufgaben');
	}
};

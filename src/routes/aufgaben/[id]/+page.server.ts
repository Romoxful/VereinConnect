import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { tasks, users, events } from '$lib/server/db/schema.js';
import { eq, asc, desc } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

export const load: PageServerLoad = async ({ params, locals }) => {
	const assignee = alias(users, 'assignee');
	const creator = alias(users, 'creator');

	const task = db
		.select({
			id: tasks.id,
			title: tasks.title,
			description: tasks.description,
			status: tasks.status,
			priority: tasks.priority,
			dueDate: tasks.dueDate,
			assignedTo: tasks.assignedTo,
			createdBy: tasks.createdBy,
			veranstaltungId: tasks.veranstaltungId,
			createdAt: tasks.createdAt,
			updatedAt: tasks.updatedAt,
			assigneeName: assignee.name,
			creatorName: creator.name,
			eventTitle: events.title
		})
		.from(tasks)
		.leftJoin(assignee, eq(tasks.assignedTo, assignee.id))
		.leftJoin(creator, eq(tasks.createdBy, creator.id))
		.leftJoin(events, eq(tasks.veranstaltungId, events.id))
		.where(eq(tasks.id, Number(params.id)))
		.get();

	if (!task) {
		error(404, 'Aufgabe nicht gefunden');
	}

	const isVorstand = locals.user?.role === 'vorstand';
	const isAssignee = locals.user?.id === task.assignedTo;
	const isCreator = locals.user?.id === task.createdBy;

	if (!isVorstand && !isAssignee && !isCreator) {
		error(403, 'Keine Berechtigung');
	}

	const userList = isVorstand
		? db.select({ id: users.id, name: users.name }).from(users).orderBy(asc(users.name)).all()
		: [];

	const eventList = isVorstand
		? db
				.select({ id: events.id, title: events.title, date: events.date })
				.from(events)
				.orderBy(desc(events.date))
				.all()
		: [];

	return { task, users: userList, events: eventList };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}

		const data = await request.formData();
		const title = data.get('title')?.toString()?.trim() ?? '';
		const description = data.get('description')?.toString()?.trim() || null;
		const status = data.get('status')?.toString() ?? 'offen';
		const priority = data.get('priority')?.toString() ?? 'mittel';
		const dueDate = data.get('dueDate')?.toString()?.trim() || null;
		const assignedToRaw = data.get('assignedTo')?.toString()?.trim();
		const veranstaltungIdRaw = data.get('veranstaltungId')?.toString()?.trim();

		const assignedTo = assignedToRaw ? Number(assignedToRaw) : null;
		const veranstaltungId = veranstaltungIdRaw ? Number(veranstaltungIdRaw) : null;

		if (!title) {
			return fail(400, { error: 'Titel ist ein Pflichtfeld.' });
		}
		if (!['niedrig', 'mittel', 'hoch'].includes(priority)) {
			return fail(400, { error: 'Ungültige Priorität.' });
		}
		if (!['offen', 'in_bearbeitung', 'erledigt'].includes(status)) {
			return fail(400, { error: 'Ungültiger Status.' });
		}

		db.update(tasks)
			.set({
				title,
				description,
				status: status as 'offen' | 'in_bearbeitung' | 'erledigt',
				priority: priority as 'niedrig' | 'mittel' | 'hoch',
				dueDate,
				assignedTo,
				veranstaltungId,
				updatedAt: new Date().toISOString()
			})
			.where(eq(tasks.id, Number(params.id)))
			.run();

		redirect(302, `/aufgaben/${params.id}`);
	},
	updateStatus: async ({ request, params, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Nicht angemeldet.' });
		}

		const existing = db.select().from(tasks).where(eq(tasks.id, Number(params.id))).get();
		if (!existing) {
			return fail(404, { error: 'Aufgabe nicht gefunden.' });
		}

		const isVorstand = locals.user.role === 'vorstand';
		const isAssignee = locals.user.id === existing.assignedTo;
		if (!isVorstand && !isAssignee) {
			return fail(403, { error: 'Keine Berechtigung.' });
		}

		const data = await request.formData();
		const status = data.get('status')?.toString() ?? '';
		if (!['offen', 'in_bearbeitung', 'erledigt'].includes(status)) {
			return fail(400, { error: 'Ungültiger Status.' });
		}

		db.update(tasks)
			.set({
				status: status as 'offen' | 'in_bearbeitung' | 'erledigt',
				updatedAt: new Date().toISOString()
			})
			.where(eq(tasks.id, Number(params.id)))
			.run();

		return { success: true };
	},
	delete: async ({ params, locals }) => {
		if (locals.user?.role !== 'vorstand') {
			return fail(403, { error: 'Keine Berechtigung.' });
		}
		db.delete(tasks).where(eq(tasks.id, Number(params.id))).run();
		redirect(302, '/aufgaben');
	}
};

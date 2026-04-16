import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { tasks, users, events } from '$lib/server/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

export const load: PageServerLoad = async ({ locals }) => {
	const assignee = alias(users, 'assignee');
	const creator = alias(users, 'creator');

	let rows = db
		.select({
			id: tasks.id,
			title: tasks.title,
			status: tasks.status,
			priority: tasks.priority,
			dueDate: tasks.dueDate,
			assignedTo: tasks.assignedTo,
			createdBy: tasks.createdBy,
			veranstaltungId: tasks.veranstaltungId,
			assigneeName: assignee.name,
			creatorName: creator.name,
			eventTitle: events.title
		})
		.from(tasks)
		.leftJoin(assignee, eq(tasks.assignedTo, assignee.id))
		.leftJoin(creator, eq(tasks.createdBy, creator.id))
		.leftJoin(events, eq(tasks.veranstaltungId, events.id))
		.orderBy(desc(tasks.createdAt))
		.all();

	if (locals.user?.role !== 'vorstand') {
		rows = rows.filter(
			(t) => t.assignedTo === locals.user?.id || t.createdBy === locals.user?.id
		);
	}

	const userList =
		locals.user?.role === 'vorstand'
			? db.select({ id: users.id, name: users.name }).from(users).orderBy(users.name).all()
			: [];

	return { tasks: rows, users: userList };
};

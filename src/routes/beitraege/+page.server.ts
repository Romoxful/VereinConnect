import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { dues, members } from '$lib/server/db/schema.js';
import { eq, sql, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const yearParam = url.searchParams.get('year');
	const statusParam = url.searchParams.get('status');
	const memberParam = url.searchParams.get('member');

	let query = db
		.select({
			id: dues.id,
			memberId: dues.memberId,
			amount: dues.amount,
			dueDate: dues.dueDate,
			paidDate: dues.paidDate,
			status: dues.status,
			year: dues.year,
			notes: dues.notes,
			createdAt: dues.createdAt,
			memberFirstName: members.firstName,
			memberLastName: members.lastName
		})
		.from(dues)
		.innerJoin(members, eq(dues.memberId, members.id))
		.$dynamic();

	const conditions: ReturnType<typeof eq>[] = [];

	if (yearParam) {
		conditions.push(eq(dues.year, Number(yearParam)));
	}
	if (statusParam && ['offen', 'bezahlt', 'überfällig'].includes(statusParam)) {
		conditions.push(eq(dues.status, statusParam as 'offen' | 'bezahlt' | 'überfällig'));
	}
	if (memberParam) {
		conditions.push(eq(dues.memberId, Number(memberParam)));
	}

	for (const condition of conditions) {
		query = query.where(condition);
	}

	const allDues = query.orderBy(desc(dues.year), members.lastName).all();

	const allMembers = db
		.select({ id: members.id, firstName: members.firstName, lastName: members.lastName })
		.from(members)
		.where(eq(members.status, 'aktiv'))
		.orderBy(members.lastName)
		.all();

	const years = db
		.selectDistinct({ year: dues.year })
		.from(dues)
		.orderBy(desc(dues.year))
		.all()
		.map((r) => r.year);

	const currentYear = new Date().getFullYear();
	if (!years.includes(currentYear)) {
		years.unshift(currentYear);
	}

	return {
		dues: allDues,
		members: allMembers,
		years,
		filters: {
			year: yearParam ?? '',
			status: statusParam ?? '',
			member: memberParam ?? ''
		}
	};
};

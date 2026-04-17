import type { PageServerLoad } from './$types';
import { verifyEmailToken } from '$lib/server/emailVerification.js';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token') ?? '';

	if (!token) {
		return { status: 'missing' as const };
	}

	const result = verifyEmailToken(token);
	return { status: result.status };
};

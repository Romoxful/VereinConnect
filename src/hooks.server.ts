import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { initDatabase } from '$lib/server/db/init.js';

// Initialize database tables on server start
initDatabase();

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('session');

	if (sessionId) {
		const result = validateSession(sessionId);
		if (result) {
			event.locals.user = result.user;
		} else {
			event.cookies.delete('session', { path: '/' });
		}
	}

	// Protect routes — redirect unauthenticated users to login
	const publicPaths = ['/login', '/api/health', '/datenschutz', '/impressum', '/aufnahme'];
	const isPublic = publicPaths.some((p) => event.url.pathname.startsWith(p));

	if (!isPublic && !event.locals.user) {
		if (event.url.pathname !== '/login') {
			return new Response(null, {
				status: 302,
				headers: { location: '/login' }
			});
		}
	}

	// Protect Vorstand-only routes
	const vorstandPaths = ['/mitglieder/neu', '/veranstaltungen/neu', '/dokumente/neu', '/protokolle/neu', '/beitraege/neu'];
	const isVorstandRoute = vorstandPaths.some((p) => event.url.pathname.startsWith(p));

	if (isVorstandRoute && event.locals.user?.role !== 'vorstand') {
		return new Response(null, {
			status: 302,
			headers: { location: '/dashboard' }
		});
	}

	return resolve(event);
};

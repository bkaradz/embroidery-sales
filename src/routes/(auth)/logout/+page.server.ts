import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { invalidateSession, sessionCookieName } from '$lib/server/routes/auth';

export const load = (async () => {
  
  return redirect(302, "/");
 
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async (event) => {
    if (!event.locals.session) {
			return fail(401);
		}
		await invalidateSession(event.locals.session.id);
		event.cookies.delete(sessionCookieName, { path: '/' });

    return redirect(302, "/");
  },
}
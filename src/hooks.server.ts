import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import * as auth from '$lib/server/routes/auth';
import type { ServerInit } from '@sveltejs/kit';
import { logger } from '$lib/utility/logger';

export const init: ServerInit = async () => {
  logger.info("Run Once");
};

const handleAuth: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get(auth.sessionCookieName);
  if (!sessionId) {
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  const { session, user } = await auth.validateSession(sessionId);
  if (session) {
    event.cookies.set(auth.sessionCookieName, session.id, {
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      expires: session.expiresAt,
      secure: !dev
    });
  } else {
    event.cookies.delete(auth.sessionCookieName, { path: '/' });
  }

  event.locals.user = user;
  event.locals.session = session;

  return resolve(event);
};

export const handle: Handle = handleAuth;

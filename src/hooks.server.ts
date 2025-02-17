import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import * as auth from '$lib/server/routes/auth';
import type { ServerInit } from '@sveltejs/kit';
import { logger } from '$lib/utility/logger';
import { db } from '$lib/server/db';

export const init: ServerInit = async () => {
  const open = db.$client.open
  if (open) {
    logger.info("Database is open");
  } else {
    logger.info("Database is not open");
  }
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

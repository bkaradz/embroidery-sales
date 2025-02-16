import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import { generateRandomString } from '@oslojs/crypto/random';
import { hash } from '@node-rs/argon2';
import * as table from '$lib/server/db/schema/schema';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';

export const sessionCookieName = 'auth-session';

function generateSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(userId: string): Promise<table.Session> {
  const token = generateSessionToken();
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: table.Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
  };
  await db.insert(table.session).values(session);
  return session;
}

export const getUserByUsername = async (userData: string) => {

  const returnData = await db.select().from(table.user).where(eq(table.user.username, userData))

  return returnData.at(0)

}

export const getUserById = async (userId: string) => {

  const returnData = await db.select({ id: table.user.id, fullName: table.user.fullName, username: table.user.username }).from(table.user).where(eq(table.user.id, userId))

  return returnData[0]

}

export type GetUserById = Awaited<ReturnType<typeof getUserById>>;

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export async function validateSession(sessionId: string) {
  const [result] = await db
    .select({
      // Adjust user table here to tweak returned data
      user: { id: table.user.id, username: table.user.username },
      session: table.session
    })
    .from(table.session)
    .innerJoin(table.user, eq(table.session.userId, table.user.id))
    .where(eq(table.session.id, sessionId));

  if (!result) {
    return { session: null, user: null };
  }
  const { session, user } = result;

  const sessionExpired = Date.now() >= session.expiresAt.getTime();
  if (sessionExpired) {
    await db.delete(table.session).where(eq(table.session.id, session.id));
    return { session: null, user: null };
  }

  const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
  if (renewSession) {
    session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
    await db
      .update(table.session)
      .set({ expiresAt: session.expiresAt })
      .where(eq(table.session.id, session.id));
  }

  return { session, user };
}

export function generateUserId(length = 21): string {
  return generateRandomString({ read: (bytes) => crypto.getRandomValues(bytes) }, alphabet, length);
}


export async function registerUser(fullName: string, username: string, password: string) {

  const userId = generateUserId();
  const passwordHash = await hash(password.trim(), {
    // recommended minimum parameters
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
  });

  const user = await db.insert(table.user).values({ id: userId, fullName, username, passwordHash }).returning({ insertedId: table.user.id });

  return user[0].insertedId

}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSession>>;

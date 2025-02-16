import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
// import { createSession, getUserByUsername, invalidateSession, sessionCookieName } from '$lib/server/routes/auth';
// import { verify } from '@node-rs/argon2';
// import { dev } from '$app/environment';
// import { z } from 'zod';
// import { message, superValidate } from 'sveltekit-superforms';
// import { zod } from 'sveltekit-superforms/adapters';
// import { redirect } from 'sveltekit-flash-message/server'

// const newUserLoginSchema = z.object({
//   username: z.string().min(3),
//   password: z.string().min(6),
// })

export const load = (async (event) => {

  // const form = await superValidate(zod(newUserLoginSchema))

  // if (event.locals.user) {
  //   return redirect(302, "/dashboard");
  // }
  return {};

}) satisfies PageServerLoad;

// export const actions = {
//   login: async (event) => {
//     const form = await superValidate(event, zod(newUserLoginSchema));

//     if (!form.valid) {
//       return fail(400, { form });
//     }

//     const existingUser = await getUserByUsername(form.data.username)
//     if (!existingUser) {
//       return message(form, { status: 'error', text: 'Incorrect username or password' });
//     }

//     const validPassword = await verify(existingUser.passwordHash, form.data.password.trim(), {
//       memoryCost: 19456,
//       timeCost: 2,
//       outputLen: 32,
//       parallelism: 1
//     });

//     if (!validPassword) {
//       return message(form, { status: 'error', text: 'Incorrect username or password' });
//     }

//     const session = await createSession(existingUser.id);
//     event.cookies.set(sessionCookieName, session.id, {
//       path: '/',
//       sameSite: 'lax',
//       httpOnly: true,
//       expires: session.expiresAt,
//       secure: !dev
//     });

//     return redirect('/dashboard', { type: 'success', message: `Welcome ${form.data.username}` }, event);

//   },
//   logout: async (event) => {
//     if (!event.locals.session) {
//       return fail(401);
//     }
//     await invalidateSession(event.locals.session.id);
//     event.cookies.delete(sessionCookieName, { path: '/' });

//     return redirect(302, "/");
//   },
// };
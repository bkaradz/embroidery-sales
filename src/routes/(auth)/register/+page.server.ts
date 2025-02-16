import { fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server'
import type { PageServerLoad } from './$types';
import { getUserByUsername, registerUser } from '$lib/server/routes/auth';
import { z } from "zod"
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';


const newUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  fullName: z.string().min(3),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path of error
});

export const load = (async (event) => {

  const form = await superValidate(zod(newUserSchema))

  if (event.locals.user) {
    return redirect(302, "/");
  }
  return { form };

}) satisfies PageServerLoad;

export const actions = {
  register: async (event) => {
    const form = await superValidate(event, zod(newUserSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const userExist = await getUserByUsername(form.data.username)

    if (userExist) {
      return message(form, { status: 'error', text: 'Username already exists user another username' });
    }
    await registerUser(form.data.fullName, form.data.username, form.data.password)

    return redirect('/dashboard', { type: 'success', message: `Please login using your new credentials` }, event);

  },
};
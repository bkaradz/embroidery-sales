import { logger } from '$lib/utility/logger';
import { expensesSchema } from '$lib/utility/schemas';
import { fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';


export const load = (async () => {

  const form = await superValidate(zod(expensesSchema))

  return { form };

}) satisfies PageServerLoad;

export const actions = {
  create: async (event) => {

    if (!event.locals.user) {
      return redirect(302, "/");
    }

    // const userId = event.locals.user.id

    const formData = await event.request.formData();

    const form = await superValidate(formData, zod(expensesSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      // await createCashRegister(userId, form.data)
      return message(form, { status: 'success', text: 'Cash register has been created' });
    } catch (error) {
      logger.error({ 'module': 'cash register create action', 'function': 'create', err: error })
      message(form, { status: 'fail', text: 'Cash register creation failed' });
      return fail(400, { form });
    }
  },
};
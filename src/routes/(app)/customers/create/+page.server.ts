import { createCustomers } from '$lib/server/routes/customers';
import { logger } from '$lib/utility/logger';
import { newCustomerSchema } from '$lib/utility/schemas';
import { fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';


export const load = (async () => {


  const form = await superValidate(zod(newCustomerSchema))

  return { form };

}) satisfies PageServerLoad;

export const actions = {
  create: async ({ request, locals }) => {

    if (!locals.user) {
      return redirect(302, "/");
    }

    const userId = locals.user.id

    const formData = await request.formData();

    const form = await superValidate(formData, zod(newCustomerSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      await createCustomers([{ ...form.data, userId }])
      return message(form, { status: 'success', text: 'Customer has been created' });
    } catch (error) {
      logger.error({ 'module': 'customer create action', 'function': 'create', err: error })
      message(form, { status: 'fail', text: 'Customer creation failed' });
      return fail(400, { form });
    }
  },
};
import { fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server'
import type { PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { productSchema } from '$lib/utility/schemas';
import { createProduct } from '$lib/server/routes/products';
import { logger } from '$lib/utility/logger';


export const load = (async () => {

  const form = await superValidate(zod(productSchema))

  return { form };

}) satisfies PageServerLoad;

export const actions = {
  create: async ({ request,  locals }) => {

    if (!locals.user) {
      return redirect(302, "/");
    }

    const userId = locals.user.id

    const formData = await request.formData();

    const form = await superValidate(formData, zod(productSchema));

    if (!form.valid) {
      return fail(400, { form });
    } 

    try {
      await createProduct(userId, form.data)
      return message(form, { status: 'success', text: 'Product has been created' });
    } catch (error) {
      logger.error({ 'module': 'product create action', 'function': 'create', err: error })
      message(form, { status: 'fail', text: 'SProduct creation failed' });
      return fail(400, { form });
    }
  },
};
import { getCustomerById, updateCustomer } from '$lib/server/routes/customers';
import { newCustomerSchema, type NewCustomer } from '$lib/utility/schemas';
import { fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';


export const load = (async (event) => {

  const customer = await getCustomerById(+event.params.id) as NewCustomer

  if (!customer) {
    return redirect('/customers', { type: 'error', message: `Customer not found` }, event);
  }

  const customerProcessed = Object.fromEntries(Object.entries(customer).filter(([, value]) => value !== null))

  const form = await superValidate(customerProcessed, zod(newCustomerSchema))

  return { form };

}) satisfies PageServerLoad;

export const actions = {
  edit: async (event) => {

    if (!event.locals.user) {
      return redirect(302, "/");
    }

    const userId = event.locals.user.id

    const formData = await event.request.formData();

    const form = await superValidate(formData, zod(newCustomerSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    await updateCustomer({ ...form.data, userId })

    return redirect('/customers', { type: 'success', message: `Customer has been updated` }, event);

  },
};
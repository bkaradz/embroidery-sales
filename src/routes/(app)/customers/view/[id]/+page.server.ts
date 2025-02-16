import { getCustomerById } from '$lib/server/routes/customers';
import { newCustomerSchema, type NewCustomer } from '$lib/utility/schemas';
import { fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {

  const customer = await getCustomerById(+event.params.id) as NewCustomer

  if (!customer) {
    redirect('/customers', { type: 'error', message: `Customer not found` }, event);
  }

  const customerProcessed = Object.fromEntries(Object.entries(customer).filter(([, value]) => value !== null))

  const form = await superValidate(customerProcessed, zod(newCustomerSchema))

  return { form };

}) satisfies PageServerLoad;

export const actions = {
  view: async ({ request, locals }) => {

    if (!locals.user) {
      return redirect(302, "/");
    }

    const formData = await request.formData();
    
    const form = await superValidate(formData, zod(newCustomerSchema));

    return fail(400, { form });
    
  },
};
import { getCustomers, updateCustomerIsDeleted } from '$lib/server/routes/customers';
import { redirect, type Actions } from '@sveltejs/kit';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  const customers = await getCustomers();
  return {
    customers
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  delete: async (event) => {
    const formData = await event.request.formData();


    if (!event.locals.user) {
      return redirect(302, "/");
    }

    const id = formData.get('id');
    const userId = event.locals.user.id

    if (!id) {
      flashRedirect('/customers', { type: 'error', message: `customer not id found` }, event);
    }

    await updateCustomerIsDeleted(+id, userId);  

    flashRedirect( { type: 'success', message: `Customer with id ${id} was deleted` }, event);
  }
};
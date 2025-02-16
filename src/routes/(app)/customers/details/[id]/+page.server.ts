import {  getCustomerWithOrders } from '$lib/server/routes/customers';
import type { PageServerLoad } from './$types';
import { redirect } from 'sveltekit-flash-message/server'


export const load = (async (event) => {

  const customerDetails = await getCustomerWithOrders(+event.params.id)

  return {
    customerDetails,
  };
}) satisfies PageServerLoad;

export const actions = {
  create: async ({ locals }) => {

    if (!locals.user) {
      return redirect(302, "/");
    }

    // const userId = locals.user.id

    // const formData = await request.formData();

  }
};
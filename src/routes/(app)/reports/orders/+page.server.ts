import { getOrders } from '$lib/server/routes/orders';
import type { PageServerLoad } from './$types';

export const load = (async () => {

  const orders = await getOrders()
  return {
    orders
  };
}) satisfies PageServerLoad;

export const actions = {
  create: async () => {

    // const data = await request.formData();
    // const formData = Object.fromEntries(data)


  },
};
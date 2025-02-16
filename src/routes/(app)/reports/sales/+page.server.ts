import { getSales } from '$lib/server/routes/orders';
import type { PageServerLoad } from './$types';

export const load = (async () => {

  const sales = await getSales()
  return {
    sales
  };
}) satisfies PageServerLoad;

export const actions = {
  create: async () => {

    // const data = await request.formData();
    // const formData = Object.fromEntries(data)


  },
};
import { getOrderDetails } from '$lib/server/routes/orders';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
  const orderDetails = await getOrderDetails(+event.params.orderId)

  return {
    orderDetails,
  };
}) satisfies PageServerLoad;


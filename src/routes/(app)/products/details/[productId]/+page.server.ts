import { getOrdersByProductId } from '$lib/server/routes/products';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
  const productOrders = await getOrdersByProductId(+event.params.productId)
  return { productOrders };
}) satisfies PageServerLoad;
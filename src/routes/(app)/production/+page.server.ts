import { getProductionOrders } from '$lib/server/routes/production';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  const salesBook = await getProductionOrders()
  return { salesBook };
}) satisfies PageServerLoad;
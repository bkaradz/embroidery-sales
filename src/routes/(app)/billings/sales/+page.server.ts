import { getSalesBook } from '$lib/server/routes/orders';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  const salesBook = await getSalesBook()
  return { salesBook };
}) satisfies PageServerLoad;
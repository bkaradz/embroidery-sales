import { auditCustomerById } from '$lib/server/routes/audits';
import { getCustomerWithOrders } from '$lib/server/routes/customers';
import type { PageServerLoad } from './$types';


export const load = (async (event) => {

  const customerDetails = await getCustomerWithOrders(+event.params.id)
  const customerAudit = await auditCustomerById(+event.params.id)

  return {
    customerDetails,
    customerAudit
  };
}) satisfies PageServerLoad;
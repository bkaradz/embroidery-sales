import { getCustomers } from '$lib/server/routes/customers';
import type { PageServerLoad } from './$types';


export const load = (async () => {

  // const audit = await auditTransaction()
  // const paymentsAudit = await auditPayments()
  // const customerAudit = await auditCustomer()

  const customers = await getCustomers()

  return {
    customers
  };
}) satisfies PageServerLoad;

export const actions = {
  create: async () => {

    // const data = await request.formData();
    // const formData = Object.fromEntries(data)


  },
};
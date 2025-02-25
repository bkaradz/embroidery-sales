import type { Customers } from '$lib/server/db/schema/schema';
import { getCreditsTotalsByCustomerId, type GetCreditsTotalsByCustomerId } from '$lib/server/routes/credits';
import { customerSelection, getCustomerById } from '$lib/server/routes/customers';
import { createNewOrder } from '$lib/server/routes/orders';
import { getPricingTiers } from '$lib/server/routes/pricing-tiers';
import { getProducts } from '$lib/server/routes/products';
import { type OrderStatus } from '$lib/utility/lists';
import { ordersSchema } from '$lib/utility/schemas';
import { redirect } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';


export const load = (async (event) => {

  const customerId = event.url.searchParams.get('customer')
  let selectedCustomer: Customers | undefined
  let credits: GetCreditsTotalsByCustomerId | undefined

  if (customerId) {
    [credits, selectedCustomer] = await Promise.all([
      getCreditsTotalsByCustomerId(+customerId),
      getCustomerById(+customerId)
    ]);
  }

  // Implement fetch selected customer
  const [customers, aggPricingTiers] = await Promise.all([
    customerSelection(), getPricingTiers()
  ]);

  return {
    products: getProducts(),
    aggPricingTiers,
    selectedCustomer,
    credits,
    customers,
  };
}) satisfies PageServerLoad;

export const actions = {
  create: async (event) => {

    if (!event.locals.user) {
      return redirect(302, "/");
    }

    const userId = event.locals.user.id

    const formData = await event.request.formData();

    const items = (JSON.parse(formData.getAll('items').at(0) as unknown as string)) as unknown as { productId: number, quantity: number }[];
    if (!items) redirect({ type: 'error', message: `Cart items are required` }, event);

    const customerId = formData.get('customerId') as unknown as number;
    if (!customerId) redirect({ type: 'error', message: `Customer id is required` }, event);

    const orderStatus = formData.get('orderStatus') as unknown as OrderStatus;
    if (!orderStatus) redirect({ type: 'error', message: `Order Status is required` }, event);

    const pricingTierId = formData.get('pricingTierId') as unknown as number;
    if (!pricingTierId) redirect({ type: 'error', message: `Pricing Tier Id is required` }, event);

    const purchaseOrderNumber = formData.get('purchaseOrderNumber') as unknown as string;

    const form = await superValidate({ items, customerId: +customerId, orderStatus, pricingTierId: +pricingTierId, purchaseOrderNumber }, zod(ordersSchema));

    if (!form.valid) {
      redirect({ type: 'error', message: `Order validation failed` }, event);
    }

    await createNewOrder({ ...form.data, userId })

    return { success: true }

  }
};
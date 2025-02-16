import { getViewOrders } from '$lib/server/routes/orders';
import { redirect, type Actions } from '@sveltejs/kit';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import { cancelOrder } from '$lib/server/routes/cancelOrder';

export const load = (async () => {
  const viewOrders = await getViewOrders()
  return { viewOrders };
}) satisfies PageServerLoad;

export const actions: Actions = {
  delete: async (event) => {
    const formData = await event.request.formData();

    if (!event.locals.user) {
      return redirect(302, "/");
    }

    const id = formData.get('id') as number | null;
    const cancellationReason = formData.get('cancellationReason') as string | null;
    const userId = event.locals.user.id

    if (!cancellationReason) {
      flashRedirect('/billings/orders', { type: 'error', message: `Reason for cancellation needed` }, event);
    }
    if (!id) {
      flashRedirect('/billings/orders', { type: 'error', message: `Order with id ${id} not found` }, event);
    }

    await cancelOrder(userId, +id, cancellationReason);

    flashRedirect({ type: 'success', message: `Order with id ${id} was canceled` }, event);
  },
  sales: async (event) => {
    const formData = await event.request.formData();

    if (!event.locals.user) {
      return redirect(302, "/");
    }

    const id = formData.get('id');
    // const userId = event.locals.user.id

    if (!id) {
      flashRedirect('/customers', { type: 'error', message: `customer not id found` }, event);
    }

    // await updateCustomerIsDeleted(+id, userId);  

    flashRedirect({ type: 'success', message: `Customer with id ${id} was deleted` }, event);
  },
  invoice: async (event) => {
    const formData = await event.request.formData();

    if (!event.locals.user) {
      return redirect(302, "/");
    }

    const id = formData.get('id');
    // const userId = event.locals.user.id

    if (!id) {
      flashRedirect('/customers', { type: 'error', message: `customer not id found` }, event);
    }

    // await updateCustomerIsDeleted(+id, userId);  

    flashRedirect({ type: 'success', message: `Customer with id ${id} was deleted` }, event);
  },
};
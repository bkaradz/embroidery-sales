import { getProducts, updateProductIsDeleted } from '$lib/server/routes/products';
import type { Actions } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';

export const load = (async () => {

  const products = await getProducts();

  return {
    products,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  delete: async (event) => {
    const formData = await event.request.formData();


    if (!event.locals.user) {
      return redirect(302, "/");
    }

    const id = formData.get('id');
    const userId = event.locals.user.id

    if (!id) {
      flashRedirect('/products', { type: 'error', message: `customer not id found` }, event);
    }

    await updateProductIsDeleted(+id, userId);

    flashRedirect({ type: 'success', message: `Product with id ${id} was deleted` }, event);
  }
};
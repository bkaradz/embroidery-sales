import { getInventoryByProductId } from '$lib/server/routes/inventory';
import { getProductById } from '$lib/server/routes/products';
import { productSchema, type ProductSchema } from '$lib/utility/schemas';
import { fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';


export const load = (async (event) => {

  const product = await getProductById(+event.params.id) as ProductSchema
  const inventory = await getInventoryByProductId(+event.params.id)

  if (!product) {
    return redirect('/products', { type: 'error', message: `Product not found` }, event);
  }

  if (!product.isEmbroidery && product.productCategory !== 'Services') {
    product.stockQuantity = inventory.quantityOnHand
  }

  const productProcessed = Object.fromEntries(Object.entries(product).filter(([, value]) => value !== null))

  const form = await superValidate(productProcessed, zod(productSchema))

  return { form };

}) satisfies PageServerLoad;

export const actions = {
  create: async (event) => {

    if (!event.locals.user) {
      return redirect(302, "/");
    }

    // const userId = event.locals.user.id

    const formData = await event.request.formData();

    const form = await superValidate(formData, zod(productSchema));

    return fail(400, { form });

  },
};
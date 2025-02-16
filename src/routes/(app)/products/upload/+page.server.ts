import { superValidate, fail, message, withFiles } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import parseCsv from '$lib/utility/parse-csv';
import { uploadProducts } from '$lib/server/routes/products';
import { redirect } from '@sveltejs/kit';
import { productArraySchema, type ProductArraySchema } from '$lib/utility/schemas';
import { productDataConversion, type ConProduct } from '$lib/utility/product-conversion';
import type { NewProducts } from '$lib/server/db/schema/schema';

const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Please upload a file.' })
});

export const load = (async () => {
  return {
    form: await superValidate(zod(fileUploadSchema))
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, locals }) => {

    if (!locals.user) {
      return redirect(302, "/");
    }

    const userId = locals.user.id

    const formData = await request.formData();

    const form = await superValidate(formData, zod(fileUploadSchema));

    if (!form.valid) return fail(400, withFiles({ form }));

    const file = formData.get('file');
    if (!(file instanceof File)) return fail(400, withFiles({ form }))

    const csvString = (await file.text()) as string;

    const productsArray = (await parseCsv(csvString)) as ConProduct[]

    const processedData = productsArray.map((product) => {
      return productDataConversion(userId, product);
    })

    const validatedResult = productArraySchema.safeParse(processedData);
    if (!validatedResult.success) {
      return message(form, { status: 'error', text: 'Products validation failed' });
    }


    const chunks = function (array: ProductArraySchema, size: number) {
      const results = [];
      while (array.length) {
        results.push(array.splice(0, size));
      }
      return results;
    };

    // await createProducts(userId, processedData)
    chunks(validatedResult.data, 1000).forEach(async (product) => {

      await uploadProducts(product as unknown as NewProducts[])
    })

    return message(form, { status: 'success', text: 'Products has been Uploaded' });

    // return withFiles({ form });

  }
};



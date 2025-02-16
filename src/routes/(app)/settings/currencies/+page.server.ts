import { createCurrencies } from '$lib/server/routes/currencies';
import { currenciesSchema } from '$lib/utility/schemas';
import { redirect } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions = {
  create: async (event) => {
    if (!event.locals.user) {
      return redirect(302, '/');
    }

    const userId = event.locals.user.id;

    const formData = await event.request.formData();

    const currencies = JSON.parse(
      formData.getAll('currencies').at(0) as unknown as string
    ) as unknown as {
      name: string;
      isDeleted: boolean;
      default: boolean;
    };

    if (!currencies) redirect({ type: 'error', message: `currencies are required` }, event);

    const currenciesDetails = JSON.parse(
      formData.getAll('currenciesDetails').at(0) as unknown as string
    ) as unknown as {
      code: string;
      name: string;
      symbol: string;
      exchangeRate: number;
    }[];

    if (!currenciesDetails)
      redirect({ type: 'error', message: `currenciesDetails are required` }, event);

    const form = await superValidate(
      {
        currencies,
        currenciesDetails
      },
      zod(currenciesSchema)
    );

    if (!form.valid) {
      redirect({ type: 'error', message: `Currencies validation failed` }, event);
    }

    await createCurrencies(userId, form.data);

    return { success: true };
  }
};

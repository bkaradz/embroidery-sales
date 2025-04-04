import { getUserById } from '$lib/server/routes/auth';
import { getDefaultCurrencies, getDefaultRates } from '$lib/server/routes/currencies';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {
  const user = event.locals.user

  if (!user) {
    return redirect(302, "/");
  }
  const [rates, userData, currencyResults] = await Promise.all([
    getDefaultRates(),
    getUserById(user.id),
    getDefaultCurrencies(),
  ])

  const currenciesNames = currencyResults.map((item) => {
    return { value: item.code, label: item.name }
  })

  return {
    user,
    userData,
    currenciesNames,
    converter: { defaultCurrency: "USD", currencies: rates }
  };
}) satisfies LayoutServerLoad;

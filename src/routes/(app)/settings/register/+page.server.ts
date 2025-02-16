import { createCashRegister, getTodaysCashRegister } from '$lib/server/routes/cashRegister';
import { getDefaultRates } from '$lib/server/routes/currencies';
import { fx } from '$lib/utility/convertCurrencies.js';
import type { CurrencyCode } from '$lib/utility/lists';
import { logger } from '$lib/utility/logger';
import { registerSchema } from '$lib/utility/schemas';
import { fail } from '@sveltejs/kit';
import Big from 'big.js';
import { redirect } from 'sveltekit-flash-message/server';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';


export const load = (async () => {

  const form = await superValidate(zod(registerSchema))

  return { form };

}) satisfies PageServerLoad;

export const actions = {
  create: async (event) => {

    const todaysCashRegister = await getTodaysCashRegister()
    if (todaysCashRegister.length >= 1) {
      return redirect("/payments", { type: 'error', message: `Today's cash register already exist!` }, event);
    }

    const rates = await getDefaultRates();

    if (!event.locals.user) {
      return redirect(302, "/");
    }

    const userId = event.locals.user.id

    const formData = await event.request.formData();

    const payment: { code: CurrencyCode, amount: number }[] = []

    const usd = formData.get("usd")
    if (usd) payment.push({ code: "USD", amount: +usd })

    const rand = formData.get("rand")
    if (rand) payment.push({ code: "ZAR", amount: +rand })

    const pula = formData.get("pula")
    if (pula) payment.push({ code: "BWP", amount: +pula })

    const zig = formData.get("zig")
    if (zig) payment.push({ code: "ZWG", amount: +zig })

    const openingBalance = formData.get("openingBalance")
    if (openingBalance === null || openingBalance === undefined) {
      redirect({ type: 'error', message: `Opening balance is needed` }, event);
    };


    let total = 0
    payment.forEach((value) => {
      const totalUSD = fx.convert({ defaultCurrency: "USD", currencies: rates }, value.amount, { from: value.code, to: 'USD' })
      if (typeof totalUSD === "number") {
        total = Number(Big(total).plus(totalUSD).toFixed(2))
      }
    })

    if (+openingBalance !== total) {
      redirect({ type: 'error', message: `Currencies not adding up to the openingBalance` }, event);
    };

    const form = await superValidate(formData, zod(registerSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      await createCashRegister(userId, form.data)
      return message(form, { status: 'success', text: 'Cash register has been created' });
    } catch (error) {
      logger.error({ 'module': 'cash register create action', 'function': 'create', err: error })
      message(form, { status: 'fail', text: 'Cash register creation failed' });
      return fail(400, { form });
    }
  },
};
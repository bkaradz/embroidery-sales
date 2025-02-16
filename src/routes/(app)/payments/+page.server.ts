import type { Customers, Orders } from '$lib/server/db/schema/schema';
import { getTodaysCashRegister } from '$lib/server/routes/cashRegister';
import { getCreditsTotalsByCustomerId, type GetCreditsTotalsByCustomerId } from '$lib/server/routes/credits';
import { getDefaultCurrencies } from '$lib/server/routes/currencies';
import { customerSelection, getCustomerById } from '$lib/server/routes/customers';
import { getUnpaidOrdersByCustomerId } from '$lib/server/routes/orders';
import { createPayments } from '$lib/server/routes/payments';
import { paymentsSchema, type PaymentsSchema } from '$lib/utility/schemas';
import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import type { CurrencyCode } from '$lib/utility/lists';


export const load = (async (event) => {
  let orders: Orders[] = []
  let selectedCustomer: Customers | undefined
  let credits: GetCreditsTotalsByCustomerId = { creditTotal: 0, creditsIds: [] }
  const customerId = event.url.searchParams.get('customer')
  if (customerId) {
    [orders, credits, selectedCustomer] = await Promise.all([
      await getUnpaidOrdersByCustomerId(+customerId),
      await getCreditsTotalsByCustomerId(+customerId),
      await getCustomerById(+customerId)
    ]);
  }

  const [customers, todaysCashRegister, currencies] = await Promise.all([
    await customerSelection(),
    await getTodaysCashRegister(),
    await getDefaultCurrencies()
  ]);

  type PaidCurrencies = { code: string, checked: boolean, amount: number, label: string }

  const currenciesMap = new Map<string, PaidCurrencies>()

  currencies.forEach((currency) => {
    const { code, name, } = currency
    currenciesMap.set(code, { code, amount: 0, checked: false, label: name })
  })

  return {
    selectedCustomer,
    orders,
    todaysCashRegister,
    credits,
    customers,
    currenciesMap
  };
}) satisfies PageServerLoad;

export const actions = {
  create: async (event) => {

    if (!event.locals.user) {
      return redirect(302, "/");
    }

    const userId = event.locals.user.id

    const formData = await event.request.formData();

    const customerId = formData.get('customerId') as unknown as number;
    if (!customerId) redirect({ type: 'error', message: `Customer id is required` }, event);

    type AmountPaidData = PaymentsSchema['amountPaidData']
    type CashData = {
      code: CurrencyCode;
      amount: number;
      checked: true;
      label: string;
    }[]

    let amountPaidData = (JSON.parse(formData.getAll('amountPaidData') as unknown as string)) as unknown as AmountPaidData;
    if (!amountPaidData) redirect({ type: 'error', message: `Amount Paid Data is required` }, event);

    if (amountPaidData.paymentMethod === 'Cash') {
      const cashData = JSON.parse(amountPaidData.cashData as unknown as string) as unknown as CashData
      amountPaidData = { ...amountPaidData, cashData }
    }

    const ordersPaidIds = (JSON.parse(formData.get('ordersPaidIds') as unknown as string)) as unknown as number[];
    if (!ordersPaidIds) redirect({ type: 'error', message: `Orders Paid Data is required` }, event);

    const creditsIds = (JSON.parse(formData.get('creditsIds') as unknown as string)) as unknown as number[];
    if (!creditsIds) redirect({ type: 'error', message: `Credits Data is required` }, event);

    const resultsData = { customerId: +customerId, ordersPaidIds, amountPaidData, creditsIds }

    const validation = paymentsSchema.safeParse(resultsData)

    if (!validation.success) {
      redirect({ type: 'error', message: `Cash register validation failed` }, event);
    }

    await createPayments(userId, validation.data)

    return { success: true }

  }
};
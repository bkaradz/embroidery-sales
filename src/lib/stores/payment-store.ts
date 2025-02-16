import { fx, type CurrencyConverter } from '$lib/utility/convert-currencies';
import Big from 'big.js';
import { writable } from 'svelte/store';


export type PaidCurrencies = { code: string, checked: boolean, amount: number, label: string }

const currenciesMap = new Map<string, PaidCurrencies>()

export type PaymentsData = { total: Big, currenciesSelected: number, paidCurrencies: PaidCurrencies[] }

const paymentsData: PaymentsData = { total: Big(0), currenciesSelected: 0, paidCurrencies: [] }

function payments() {
  const { subscribe, update, set } = writable({ currencies: currenciesMap, payments: paymentsData })


  // Initialize the currencies and payments
  function initRates(currenciesMap: Map<string, PaidCurrencies>) {
    set({
      currencies: currenciesMap,
      payments: { total: Big(0), currenciesSelected: 0, paidCurrencies: [] }
    })
  }

  function calculatePayments(converter: CurrencyConverter) {
    const paidCurrencies: PaidCurrencies[] = []
    update((payments) => {
      let total = Big(0)
      let currenciesSelected = 0
      payments.currencies.values().forEach((value) => {
        const totalUSD = fx.convert(converter, value.amount, { from: value.code, to: 'USD' })
        if (typeof (Big(totalUSD).toNumber()) === 'number') {
          total = Big(total).add(totalUSD)
        }
        if (value.checked) {
          currenciesSelected = currenciesSelected + 1
          paidCurrencies.push(value)
        }
      })
      payments.payments = { total, currenciesSelected, paidCurrencies }

      return payments
    })
  }

  function addPayment(converter: CurrencyConverter, key: string, amount: number) {
    update(payments => {
      const values = payments.currencies.get(key)
      if (values) {
        payments.currencies.set(key, { ...values, checked: true, amount })
      }
      return payments
    })
    calculatePayments(converter)
  }

  function removePayment(converter: CurrencyConverter, key: string) {
    update(payments => {
      const values = payments.currencies.get(key)
      if (values) {
        payments.currencies.set(key, { ...values, checked: false, amount: 0 })
      }
      return payments
    })
    calculatePayments(converter)
  }

  function reset(currenciesMap: Map<string, PaidCurrencies>) {
    set({
      currencies: currenciesMap,
      payments: { total: Big(0), currenciesSelected: 0, paidCurrencies: [] }
    })
  }

  return { subscribe, initRates, addPayment, removePayment, reset }
}

export const paymentStore = payments()

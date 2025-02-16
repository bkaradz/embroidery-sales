import { error } from '@sveltejs/kit';
import Big from 'big.js';
import type { Converter } from './schemas';

export type Currencies = { [currency: string]: { rate: number, symbol: string } };

export interface CurrencyConverter {
  defaultCurrency: string;
  currencies: Currencies
}

function currenciesFx() {

  // Convert an amount from one currency to another
  function convert(converter: CurrencyConverter, amount: number | Big, opt: { from?: string, to?: string }): Big {
    if (typeof (Big(amount).toNumber()) !== 'number') {
      error(404, { message: `The amount must be a valid number.` });
    }

    const { currencies, defaultCurrency } = converter;
    const fromCurrency = opt.from || defaultCurrency;
    const toCurrency = opt.to || defaultCurrency;

    if (!currencies[fromCurrency]) {
      error(404, { message: `Exchange rate for '${fromCurrency}' is not available.` });
    }

    if (!currencies[toCurrency]) {
      error(404, { message: `Exchange rate for '${toCurrency}' is not available.` });
    }

    // Convert amount to base currency (assumes rates are relative to a base currency)
    const baseAmount = Big(amount).div(currencies[fromCurrency].rate)

    // Convert from base currency to target currency
    return baseAmount.mul(currencies[toCurrency].rate)
  }

  // format currency
  function format(converter: CurrencyConverter, amount: number | Big, toCurrencyCode: string) {

    const { currencies } = converter;

    if (typeof (Big(amount).toNumber()) !== 'number') {
      return "NaN.";
    }

    const results = parseFloat(amount.toFixed(2));

    const formattedNumber = results.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    // Get the currency symbol or fallback to the currency code
    const currencySymbol = currencies[toCurrencyCode.toUpperCase()].symbol || toCurrencyCode.toUpperCase();

    // Combine the currency symbol with the formatted number
    return `${currencySymbol}${formattedNumber}`;

  }

  return { convert, format }
}


export const fx = currenciesFx()

export const formatCurrency = (converter: Converter, amount: number | Big, opt: { from?: string, to: string }) => {
  return fx.format(
    converter,
    fx.convert(converter, Number(amount.toFixed(2)), opt),
    opt.to
  )
}


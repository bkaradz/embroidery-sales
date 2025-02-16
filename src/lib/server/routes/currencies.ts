import { logger } from '$lib/utility/logger';
import type { CurrenciesSchema } from '$lib/utility/schemas';
import { db } from '../db';
import { currencies, currenciesDetails } from '../db/schema/schema';

export const createCurrencies = async (userId: string, data: CurrenciesSchema) => {
  try {
    await db.transaction(async (tx) => {

      // If default is true reset all defaults to false
      if (data.currencies.default) {
        await tx.update(currencies).set({ default: false });
      }

      const currenciesId = await tx.insert(currencies).values({ ...data.currencies, userId, isDeleted: false }).returning({ id: currencies.id });

      const newCurrenciesDetails = data.currenciesDetails.map((currency) => {
        return { ...currency, currenciesId: currenciesId[0].id };
      });

      await tx.insert(currenciesDetails).values(newCurrenciesDetails);


    })
    return { success: true }
  } catch (error) {
    logger.error({ 'module': 'currencies.ts', 'function': 'createCurrencies', err: error },)
    throw new Error("Currencies creation failed");
  }
};

export const getDefaultCurrencies = async () => {
  const results = await db.query.currencies.findMany({
    where: (currencies, { eq }) => eq(currencies.default, true),
    with: {
      currenciesDetails: true
    }
  });

  return results[0].currenciesDetails;
};

export const getCurrencies = async () => {
  return await db.query.currencies.findMany({
    where: (currencies, { eq }) => eq(currencies.isDeleted, false),
    with: {
      currenciesDetails: true
    }
  });
};

export const getDefaultRates = async () => {
  const currenciesResults = await getDefaultCurrencies();

  const currencies: { [currency: string]: { rate: number, symbol: string } } = {};

  currenciesResults.forEach((rate) => {
    currencies[rate.code] = { rate: rate.exchangeRate, symbol: rate.symbol };
  });

  return currencies;
};

export const getDefaultCurrencyByCode = async (code: string) => {

  const results = await db.query.currencies.findMany({
    where: (currencies, { eq }) => eq(currencies.default, true),
    with: {
      currenciesDetails: {
        where: (currenciesDetails, { eq }) => eq(currenciesDetails.code, code),
      }
    }
  });

  return results[0].currenciesDetails[0];

};

export const getCurrenciesById = async (id: number) => {
  return await db.query.currencies.findMany({
    where: (currencies, { eq }) => eq(currencies.id, id),
    with: {
      currenciesDetails: true
    }
  });
};

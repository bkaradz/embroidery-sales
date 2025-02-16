import { logger } from "$lib/utility/logger";
import { seed } from "drizzle-seed";
import { db } from '.';
import { resetSqliteDatabase } from '../utility/resetDatabase';
import * as schema from './schema/schema';

async function main() {

  await resetSqliteDatabase(db, schema);

  logger.info('Seeding started!');
  // const TODAYS_DATE = formatDate(new Date(), 'dd MMM yyyy HH:mm');

  // const currencies = {
  //   name: `Rates ${TODAYS_DATE}`,
  //   isDeleted: false,
  //   default: true
  // };

  const currenciesDetails = [
    { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1.0 },
    { code: 'ZAR', name: 'Rand', symbol: 'R', exchangeRate: 20.0 },
    { code: 'BWP', name: 'Pula', symbol: 'P', exchangeRate: 15.0 },
    { code: 'ZWG', name: 'ZiG', symbol: 'ZiG', exchangeRate: 50.0 }
  ];

  // const pricingTier = {
  //   name: `Tier ${TODAYS_DATE}`,
  //   isDeleted: false,
  //   default: true
  // };

  // const pricingTierDetails = [
  //   { minQuantity: 1, maxQuantity: 3, minimumPrice: 1.5, pricePer1000Stitches: 0.2 },
  //   { minQuantity: 4, maxQuantity: 20, minimumPrice: 1, pricePer1000Stitches: 0.18 },
  //   { minQuantity: 21, maxQuantity: 50, minimumPrice: 1, pricePer1000Stitches: 0.16 },
  //   { minQuantity: 51, maxQuantity: 100, minimumPrice: 0.95, pricePer1000Stitches: 0.15 },
  //   { minQuantity: 101, maxQuantity: null, minimumPrice: 0.9, pricePer1000Stitches: 0.14 }
  // ];

  await seed(db as any, schema).refine((funcs) => ({
    user: {
      count: 1
    },
    customers: {
      count: 500
    },
    currencies: {
      // columns: currencies
    },
    currenciesDetails: {
      columns: currenciesDetails
    },
    inventory: {
      column: {
        quantity_on_hand: funcs.int({ minValue: 1, maxValue: 200 }),
      }
    }
  }))
  logger.info('Seeding done!');
}
main();
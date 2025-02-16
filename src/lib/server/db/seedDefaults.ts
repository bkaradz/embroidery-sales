import type { NewAccounts } from '$lib/server/db/schema/schema';
import { formatDate } from 'date-fns';
import { db } from '.';
import { logger } from '../../utility/logger';
import { createAccounts } from '../routes/accounts';
import { registerUser } from '../routes/auth';
import { createCurrencies } from '../routes/currencies';
import { resetSqliteDatabase } from '../utility/resetDatabase';
import * as schema from './schema/schema';


const main = async () => {

  await resetSqliteDatabase(db, schema);

  logger.info('Seeding started!');
  const TODAYS_DATE = formatDate(new Date(), 'dd MMM yyyy HH:mm');
  // User
  const userId = await registerUser('Admin', 'adminone', 'adminone');
  logger.info("Done User");
  // Accounts
  const accData = [
    { name: 'Cash', type: 'asset' },
    { name: 'Accounts Receivable', type: 'asset' },
    { name: 'Sales Revenue', type: 'revenue' },
    { name: 'Accounts Payable', type: 'liability' },
    { name: 'Equity', type: 'equity' }
  ] as NewAccounts[];
  await createAccounts(accData);
  logger.info("Done Accounts");
  // Currency
  const currencies = {
    userId,
    name: `Rates ${TODAYS_DATE}`,
    isDeleted: false,
    default: true
  };

  const currenciesDetails = [
    { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1.0 },
  ];
  await createCurrencies(userId, { currencies, currenciesDetails });
  logger.info("Done Currencies");
  // pricingTier
  // const pricingTier = {
  //   userId,
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
  // await createNewPricingTier(userId, { pricingTier, pricingTierDetails });
  // logger.info("Done Pricing Tier");

};

main()
  .catch((e) => {
    logger.error({ err: e });
    process.exit(1);
  })
  .finally(async () => {
    logger.info('Seeding done!');
    process.exit(0);
  });

import type { NewAccounts, NewJournalEntries, NewTransaction } from '$lib/server/db/schema/schema';
import { format, formatDate } from 'date-fns';
import { db } from '.';
import { logger } from '../../utility/logger';
import type { OrdersSchema, ProductSchema } from '../../utility/schemas';
import {
  createAccounts,
  getAccountByName,
  getAllOrderForCustomer,
  getAllOrderItemForOrder,
  getCustomersOutstandingBalances
} from '../routes/accounts';
import { registerUser } from '../routes/auth';
import { createCurrencies, getDefaultCurrencyByCode } from '../routes/currencies';
import { createCustomers } from '../routes/customers';
import { createJournalEntries } from '../routes/journalEntries';
import { createNewOrder } from '../routes/orders';
import { createNewPricingTier } from '../routes/pricingTiers';
import { createProduct } from '../routes/products';
import { createTransaction } from '../routes/transactions';
import * as schema from './schema/schema';
import { customers } from './seed-data/customers';
import { resetSqliteDatabase } from '../utility/resetDatabase';


const main = async () => {

  await resetSqliteDatabase(db, schema);

  logger.info('Seeding started!');
  const TODAYS_DATE = formatDate(new Date(), 'dd MMM yyyy HH:mm');
  // User
  const userId = await registerUser('John Doe', 'johndoe', 'johndoe');
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
    { code: 'ZAR', name: 'Rand', symbol: 'R', exchangeRate: 20.0 },
    { code: 'BWP', name: 'Pula', symbol: 'P', exchangeRate: 15.0 },
    { code: 'ZWG', name: 'ZiG', symbol: 'ZiG', exchangeRate: 50.0 }
  ];
  await createCurrencies(userId, { currencies, currenciesDetails });
  logger.info("Done Currencies");
  // pricingTier
  const pricingTier = {
    userId,
    name: `Tier ${TODAYS_DATE}`,
    isDeleted: false,
    default: true
  };
  const pricingTierDetails = [
    { minQuantity: 1, maxQuantity: 3, minimumPrice: 1.5, pricePer1000Stitches: 0.2 },
    { minQuantity: 4, maxQuantity: 20, minimumPrice: 1, pricePer1000Stitches: 0.18 },
    { minQuantity: 21, maxQuantity: 50, minimumPrice: 1, pricePer1000Stitches: 0.16 },
    { minQuantity: 51, maxQuantity: 100, minimumPrice: 0.95, pricePer1000Stitches: 0.15 },
    { minQuantity: 101, maxQuantity: null, minimumPrice: 0.9, pricePer1000Stitches: 0.14 }
  ];
  await createNewPricingTier(userId, { pricingTier, pricingTierDetails });
  logger.info("Done Pricing Tier");

  const newCustomers = customers.map((customer) => {
    return {
      ...customer,
      userId
    };
  });

  const customersOutput = await createCustomers(newCustomers);
  logger.info("Done Customers");

  const productData = [
    {
      name: 'Specialized EMB service',
      basePrice: 1000,
      isEmbroidery: false,
      productCategory: 'Services'
    },
    {
      name: 'T-shirt',
      basePrice: 8.5,
      isEmbroidery: false,
      productCategory: 'Golf Shirts',
      stockQuantity: 100
    },
    { name: 'Cap', basePrice: 5, isEmbroidery: false, productCategory: 'Cap', stockQuantity: 50 },
    {
      name: 'Printed Mug',
      basePrice: 10,
      isEmbroidery: false,
      productCategory: 'Other',
      stockQuantity: 50
    },
    { name: 'Smiley Logo', stitches: 5000, isEmbroidery: true, productCategory: 'Embroidery' }
  ] as ProductSchema[];
  productData.forEach(async (product) => {
    await createProduct(userId, product);
  });
  logger.info("Done Products");

  const ordersData1 = {
    items: [{ productId: 1, quantity: 1 }],
    customerId: customersOutput.id,
    status: 'Pending',
    userId,
    pricingTierId: 1
  } as OrdersSchema;
  await createNewOrder(ordersData1);
  logger.info("Done Order1");

  const ordersData2 = {
    items: [
      { productId: 2, quantity: 10 },
      { productId: 5, quantity: 10 }
    ],
    customerId: customersOutput.id,
    status: 'Pending',
    userId,
    pricingTierId: 1
  } as OrdersSchema;
  await createNewOrder(ordersData2);
  logger.info("Done Order2");

  const currencyOutput = await getDefaultCurrencyByCode('USD');
  logger.info("Done Get Currency Code");

  const transactionData = [
    {
      totalAmountTransacted: 1000.0,
      paymentMethod: 'Bank',
      userId,
      date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      description: 'Product Sale in ZAR',
      type: "Sales",
      customerId: customersOutput.id,
      currencyId: currencyOutput.id
    }
  ] as NewTransaction[];
  const transactions = await createTransaction(transactionData);
  logger.info("Done Transaction");

  const accountsReceivable = await getAccountByName('Accounts Receivable');
  logger.info("Done Get Accounts Receivable");
  const salesRevenue = await getAccountByName('Sales Revenue');
  logger.info("Done Get Sales Revenue");

  const journalEntriesDebitData = [
    {
      transactionId: transactions.id,
      accountId: accountsReceivable.id,
      amount: 1000.0,
      entryType: 'Debit'
    }
  ] as NewJournalEntries[];
  await createJournalEntries(journalEntriesDebitData);
  logger.info("Done journal entries 1");

  const journalEntriesCreditData = [
    {
      transactionId: transactions.id,
      accountId: salesRevenue.id,
      amount: 1000.0,
      entryType: 'Credit'
    }
  ] as NewJournalEntries[];
  await createJournalEntries(journalEntriesCreditData);
  logger.info("Done journal entries 2");

  // const printAcc = await getSumAccountsReceivable('Accounts Receivable')
  // logger.info("main ~ printAcc:", printAcc)

  const printAllOrderForCustomer = await getAllOrderForCustomer('Christen Swyer');
  logger.info({
    module: 'printAllOrderForCustomer Christen Swyer :',
    message: printAllOrderForCustomer
  });

  const printAllOrderItemForOrder2 = await getAllOrderItemForOrder(2);
  logger.info({ module: 'printAllOrderItemForOrder id 2 :', message: printAllOrderItemForOrder2 });

  const printAllOrderItemForOrder1 = await getAllOrderItemForOrder(1);
  logger.info({ module: 'printAllOrderItemForOrder1 id 1 :', message: printAllOrderItemForOrder1 });

  const printCustomersOutstandingBalances = await getCustomersOutstandingBalances();
  logger.info({
    module: 'printCustomersOutstandingBalances:',
    message: printCustomersOutstandingBalances
  });
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

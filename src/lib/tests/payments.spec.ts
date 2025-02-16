import { beforeEach, describe, it } from 'vitest';


describe('Payments [createPayments]', () => {
  beforeEach(async () => {
    // Clear and seed the database before each test. Use a dedicated test database!
    // const TODAYS_DATE = formatDate(new Date(), 'dd MMM yyyy HH:mm');

    // // User
    // const userId = await registerUser('John Doe', 'johndoe', 'johndoe')
    // // Customer
    // await db.insert(customers).values({ userId, id: 1, fullName: 'Test Customer' }).execute();
    // // Currency
    // const currencies = {
    //   userId,
    //   name: `Rates ${TODAYS_DATE}`,
    //   isDeleted: false,
    //   default: true
    // };

    // const currenciesDetails = [
    //   { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1.0 },
    //   { code: 'ZAR', name: 'Rand', symbol: 'R', exchangeRate: 20.0 },
    //   { code: 'BWP', name: 'Pula', symbol: 'P', exchangeRate: 15.0 },
    //   { code: 'ZWG', name: 'ZiG', symbol: 'ZiG', exchangeRate: 50.0 }
    // ];
    // await createCurrencies(userId, { currencies, currenciesDetails });
    // // Price tiers
    // const pricingTier = { userId, name: `Tier ${TODAYS_DATE}`, isDeleted: false, default: true }

    // const pricingTierDetails = [
    //   { minQuantity: 1, maxQuantity: 3, pricePer1000Stitches: 0.2, minimumPrice: 1.5 },
    //   { minQuantity: 4, maxQuantity: 20, pricePer1000Stitches: 0.18, minimumPrice: 1 },
    //   { minQuantity: 21, maxQuantity: 50, pricePer1000Stitches: 0.16, minimumPrice: 1 },
    //   { minQuantity: 51, maxQuantity: 100, pricePer1000Stitches: 0.15, minimumPrice: 0.95 },
    //   { minQuantity: 101, maxQuantity: null, pricePer1000Stitches: 0.14, minimumPrice: 0.9 }
    // ]
    // await createNewPricingTier(userId, { pricingTier, pricingTierDetails })

    // // Products
    // const productData = [
    //   { name: 'Test Origination', basePrice: 7, isEmbroidery: false, productCategory: 'Services' }, // Without stockQuantity
    //   { name: 'Test G-shirt', basePrice: 8.5, isEmbroidery: false, productCategory: 'Golf Shirts', stockQuantity: 100 },
    //   { name: 'Test Cap', basePrice: 3, isEmbroidery: false, productCategory: 'Cap', stockQuantity: 50 },
    //   { name: 'Test Smiley Logo', stitches: 5000, isEmbroidery: true, productCategory: 'Embroidery' },
    // ] as ProductSchema[]
    // productData.forEach(async (product) => {
    //   await createProduct(userId, product)
    // })

    // // Accounts
    // const accData = [
    //   { name: 'Cash', type: 'asset' },
    //   { name: 'Accounts Receivable', type: 'asset' },
    //   { name: 'Sales Revenue', type: 'revenue' },
    //   { name: 'Accounts Payable', type: 'liability' },
    //   { name: 'Equity', type: 'equity' }
    // ] as NewAccounts[]
    // await createAccounts(accData)

    // await createCashRegister(userId, { openingBalance: 0 })

  });

  it('Should create orders successfully with customer and products', async () => {



    /**
     * Test payments
     * 1 - pay without credit 
     */

  });
});
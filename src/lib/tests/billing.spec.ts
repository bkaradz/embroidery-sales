import { db } from '$lib/server/db';
import { createAccounts } from '$lib/server/routes/accounts';
import { registerUser } from '$lib/server/routes/auth';
import { createCashRegister } from '$lib/server/routes/cashRegister';
import { createCurrencies } from '$lib/server/routes/currencies';
import { getInventory, getInventoryByProductId } from '$lib/server/routes/inventory';
import { createNewOrder, getOrderById, getUnpaidOrdersByCustomerId } from '$lib/server/routes/orders';
import { createNewPricingTier } from '$lib/server/routes/pricingTiers';
import { createProduct } from '$lib/server/routes/products';
import type { OrdersSchema, ProductSchema } from '$lib/utility/schemas';
import { formatDate } from 'date-fns';
import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import * as schema from '../server/db/schema/schema';
import { resetSqliteDatabase } from '../server/utility/resetDatabase';


describe('Billing [createNewOrder]', () => {
  beforeEach(async () => {
    // Clear and seed the database before each test. Use a dedicated test database!
    await resetSqliteDatabase(db, schema);

    const TODAYS_DATE = formatDate(new Date(), 'dd MMM yyyy HH:mm');

    // User
    const userId = await registerUser('John Doe', 'johndoe', 'johndoe')
    // Customer
    await db.insert(schema.customers).values({ userId, id: 1, fullName: 'Test Customer' }).execute();
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
    // Price tiers
    const pricingTier = { userId, name: `Tier ${TODAYS_DATE}`, isDeleted: false, default: true }

    const pricingTierDetails = [
      { minQuantity: 1, maxQuantity: 3, pricePer1000Stitches: 0.2, minimumPrice: 1.5 },
      { minQuantity: 4, maxQuantity: 20, pricePer1000Stitches: 0.18, minimumPrice: 1 },
      { minQuantity: 21, maxQuantity: 50, pricePer1000Stitches: 0.16, minimumPrice: 1 },
      { minQuantity: 51, maxQuantity: 100, pricePer1000Stitches: 0.15, minimumPrice: 0.95 },
      { minQuantity: 101, maxQuantity: null, pricePer1000Stitches: 0.14, minimumPrice: 0.9 }
    ]
    await createNewPricingTier(userId, { pricingTier, pricingTierDetails })

    // Products
    const productData = [
      { name: 'Test Origination', basePrice: 7, isEmbroidery: false, productCategory: 'Services' }, // Without stockQuantity
      { name: 'Test G-shirt', basePrice: 8.5, isEmbroidery: false, productCategory: 'Golf Shirts', stockQuantity: 100 },
      { name: 'Test Cap', basePrice: 3, isEmbroidery: false, productCategory: 'Cap', stockQuantity: 50 },
      { name: 'Test Smiley Logo', stitches: 5000, isEmbroidery: true, productCategory: 'Embroidery' },
    ] as ProductSchema[]
    productData.forEach(async (product) => {
      await createProduct(userId, product)
    })

    // Accounts
    const accData = [
      { name: 'Cash', type: 'asset' },
      { name: 'Accounts Receivable', type: 'asset' },
      { name: 'Sales Revenue', type: 'revenue' },
      { name: 'Accounts Payable', type: 'liability' },
      { name: 'Equity', type: 'equity' }
    ] as schema.NewAccounts[]
    await createAccounts(accData)

    await createCashRegister(userId, { openingBalance: 0 })

  });

  it('Should create orders successfully with customer and products', async () => {

    const userData = await db.select().from(schema.user).where(eq(schema.user.username, 'johndoe')).execute();
    const userId = userData[0].id;

    expect(userData.length).toBe(1);
    expect(typeof userData[0].id).toBe('string');

    // Order 1 Services
    const orderData = {
      customerId: 1,
      items: [
        { productId: 1, quantity: 1 },
      ],
      pricingTierId: 1,
      orderStatus: 'Sales Order',
      userId
    } as OrdersSchema
    const orderResults = await createNewOrder(orderData)

    expect(orderResults).toEqual({ success: true });

    // Order 2 Product
    const orderData2 = {
      customerId: 1,
      items: [
        { productId: 2, quantity: 1 },
        { productId: 3, quantity: 1 },
      ],
      pricingTierId: 1,
      orderStatus: 'Sales Order',
      userId
    } as OrdersSchema
    const orderResults2 = await createNewOrder(orderData2)

    expect(orderResults2).toEqual({ success: true });

    // Order 3 Embroidery
    const orderData3 = {
      customerId: 1,
      items: [
        { productId: 4, quantity: 1 },
      ],
      pricingTierId: 1,
      orderStatus: 'Sales Order',
      userId
    } as OrdersSchema
    const orderResults3 = await createNewOrder(orderData3)

    expect(orderResults3).toEqual({ success: true });

    // Verify data in the database
    const getUnpaidCustomerOrders = await getUnpaidOrdersByCustomerId(1)
    expect(getUnpaidCustomerOrders.length).toBe(3)

    const order1 = await getOrderById(1)
    expect(order1.length).toBe(1)
    expect(order1[0].totalAmount).toBe(7)
    expect(order1[0].totalPaid).toBe(0)
    expect(order1[0].paymentStatus).toBe('Unpaid')

    const order2 = await getOrderById(2)
    expect(order2.length).toBe(1)
    expect(order2[0].totalAmount).toBe(11.5)
    expect(order2[0].totalPaid).toBe(0)
    expect(order2[0].paymentStatus).toBe('Unpaid')

    const order3 = await getOrderById(3)
    expect(order3.length).toBe(1)
    expect(order3[0].totalAmount).toBe(1.5)
    expect(order3[0].totalPaid).toBe(0)
    expect(order3[0].paymentStatus).toBe('Unpaid')

    const inventory = await getInventory()
    expect(inventory.length).toBe(2)

    const inventory2 = await getInventoryByProductId(2)
    expect(inventory2.quantityOnHand).toBe(100)

    const inventory3 = await getInventoryByProductId(3)
    expect(inventory3.quantityOnHand).toBe(50)

  });
});
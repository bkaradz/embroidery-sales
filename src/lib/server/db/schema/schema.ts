import { relations, sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { productCategories } from '../../../utility/config-list';
import {
  accountsType,
  cashTransactionsType,
  creditsStatus,
  embroideryType,
  entryType,
  expensesCategories,
  garmentPlacement,
  goodsStatus,
  inventoryTransactionType,
  orderStatus,
  paymentMethods,
  paymentStatus,
  productionStatus,
  timeStatus,
  transactionPaymentMethods,
  transactionTypes
} from '../../../utility/lists';

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull().unique(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull()
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export const timestamp = {
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull().$onUpdate(() => sql`CURRENT_TIMESTAMP`)
};

export const customers = sqliteTable('customers', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  isDeleted: integer('is_Deleted', { mode: 'boolean' }).notNull().default(false),
  fullName: text('full_name').unique().notNull(),
  isCorporate: integer('is_corporate', { mode: 'boolean' }).notNull().default(false),
  tin: text('tin'),
  notes: text('notes'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  ...timestamp
},
  (t) => [index('customers_is_deleted_idx').on(t.isDeleted)]
);

export const customersRelations = relations(customers, ({ many }) => ({
  payments: many(payments),
  credits: many(credits),
  transaction: many(transaction),
  orders: many(orders)
}));

export type Customers = typeof customers.$inferSelect;
export type NewCustomers = typeof customers.$inferInsert;

export const products = sqliteTable('products', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  name: text('name').notNull().unique(),
  description: text('description'),
  productCategory: text('product_category', { enum: productCategories }).notNull().default('Embroidery'),
  basePrice: integer('base_price'), // -- Price per unit
  stitches: integer('stitches'),
  hash: text('hash'),
  isEmbroidery: integer('is_embroidery', { mode: 'boolean' }).notNull().default(true),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
  ...timestamp
},
  (t) => [
    index('products_is_deleted_idx').on(t.isDeleted),
    index('stitches_idx').on(t.stitches),
    index('is_embroidery_idx').on(t.isEmbroidery),
    index('hash_idx').on(t.hash)
  ]
);

export const productsRelations = relations(products, ({ many, one }) => ({
  orderItems: many(orderItems),
  inventory: one(inventory),
  inventoryTransactions: many(inventoryTransactions)
}));

export type Products = typeof products.$inferSelect;
export type NewProducts = typeof products.$inferInsert;

export const currencies = sqliteTable('currencies', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  name: text('name').notNull().unique(),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(true),
  default: integer('default', { mode: 'boolean' }).notNull().default(false),
  ...timestamp
});

export const currenciesRelations = relations(currencies, ({ many }) => ({
  currenciesDetails: many(currenciesDetails),
}));

export type Currencies = typeof currencies.$inferSelect;
export type NewCurrencies = typeof currencies.$inferInsert;

export const currenciesDetails = sqliteTable('currencies_details', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  currenciesId: integer('currencies_id').notNull().references(() => currencies.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  symbol: text('symbol').notNull(),
  exchangeRate: integer('exchange_rate').notNull()
});

export const currenciesDetailsRelations = relations(currenciesDetails, ({ one }) => ({
  currencies: one(currencies, { references: [currencies.id], fields: [currenciesDetails.currenciesId], })
}));

export type CurrenciesDetails = typeof currenciesDetails.$inferSelect;
export type NewCurrenciesDetails = typeof currenciesDetails.$inferInsert;

export const accounts = sqliteTable('accounts', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  type: text('type', { enum: accountsType }).notNull(), // an only be 'asset', 'liability', 'revenue', 'expense', or 'equity'
  ...timestamp
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  journalEntries: many(journalEntries)
}));

export type Accounts = typeof accounts.$inferSelect;
export type NewAccounts = typeof accounts.$inferInsert;

export const transaction = sqliteTable('transaction', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  customerId: integer('customer_id').references(() => customers.id), // is null if its expenses
  currencyId: integer('currency_id').references(() => currenciesDetails.id), // if it is null check cashTransactions
  date: text('date').default(sql`CURRENT_TIMESTAMP`).notNull(),
  description: text('description').notNull(),
  paymentMethod: text('payment_method', { enum: transactionPaymentMethods }).notNull(),
  type: text('type', { enum: transactionTypes }).notNull(),
  totalAmountTransacted: integer('total_amount_transacted').notNull()
});

export const transactionRelations = relations(transaction, ({ many, one }) => ({
  payments: many(payments),
  credits: one(credits),
  expenses: one(expenses),
  customers: one(customers, { references: [customers.id], fields: [transaction.customerId] }),
  cashTransactions: many(cashTransactions)
}));

export type Transaction = typeof transaction.$inferSelect;
export type NewTransaction = typeof transaction.$inferInsert;

export const journalEntries = sqliteTable('journal_entries', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  transactionId: integer('transaction_id').notNull().references(() => transaction.id),
  accountId: integer('account_id').notNull().references(() => accounts.id),
  amount: integer('amount').notNull(),
  entryType: text('entry_type', { enum: entryType }).notNull(), // Can only be 'Debit' or 'Credit'
  date: text('date').default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const journalEntriesRelations = relations(journalEntries, ({ one, many }) => ({
  transaction: one(transaction, { references: [transaction.id], fields: [journalEntries.transactionId] }),
  accounts: one(accounts, { references: [accounts.id], fields: [journalEntries.accountId] }),
  journalEntries: many(journalEntries)
}));

export type JournalEntries = typeof journalEntries.$inferSelect;
export type NewJournalEntries = typeof journalEntries.$inferInsert;

export const orders = sqliteTable('orders', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  pricingTierId: integer('pricing_tier_id').notNull().references(() => pricingTier.id),
  customerId: integer('customer_id').notNull().references(() => customers.id),
  orderDate: text('order_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
  validUntil: text('valid_until').default(sql`CURRENT_TIMESTAMP`).notNull(),
  totalAmount: integer('total_amount').notNull(), // Total amount for the order, calculated from order_items
  totalPaid: integer('total_paid').notNull().default(0), // Total paid for the order, calculated from payments
  orderStatus: text('order_status', { enum: orderStatus }).notNull().default('Quotation'), // Order status (e.g., 'Quotation', 'Pending', 'Completed', 'Canceled', 'Expired')
  status: text('status', { enum: timeStatus }).notNull().default('Pending'), // 'Pending', 'Expired', 'On Hold'
  paymentStatus: text('payment_status', { enum: paymentStatus }).notNull().default('Unpaid'), // Payment status (e.g.,'Not Applicable', 'Unpaid', 'Deposit Paid', 'Partially Paid', 'Paid')
  purchaseOrderNumber: text('purchase_order_number'),
  canceledBy: text('canceled_by').references(() => user.id),
  canceledAt: text('canceled_at'),
  cancellationReason: text('cancellation_reason'),
  ...timestamp
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customers: one(customers, { references: [customers.id], fields: [orders.customerId] }),
  orderItems: many(orderItems),
  pricingTier: one(pricingTier, { references: [pricingTier.id], fields: [orders.pricingTierId] }),
  payments: many(payments)
}));

export type Orders = typeof orders.$inferSelect;
export type NewOrders = typeof orders.$inferInsert;

export const orderItems = sqliteTable('order_items', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  stitches: integer('stitches'),
  unitPrice: integer('unit_price').notNull() // Final calculated price for the order item
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  orders: one(orders, { references: [orders.id], fields: [orderItems.orderId] }),
  products: one(products, { references: [products.id], fields: [orderItems.productId] })
}));

export type OrderItems = typeof orderItems.$inferSelect;
export type NewOrderItems = typeof orderItems.$inferInsert;

export const pricingTier = sqliteTable('pricing_tier', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  name: text('name').notNull(),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(true),
  default: integer('default', { mode: 'boolean' }).notNull().default(false),
  ...timestamp
});

export const pricingTierRelations = relations(pricingTier, ({ many }) => ({
  pricingTierDetails: many(pricingTierDetails),
  orders: many(orders)
}));

export type PricingTier = typeof pricingTier.$inferSelect;
export type NewPricingTier = typeof pricingTier.$inferInsert;

export const pricingTierDetails = sqliteTable('pricing_tier_details', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  pricingTierId: integer('pricing_tier_id').notNull().references(() => pricingTier.id),
  minQuantity: integer('min_quantity').notNull(), // Minimum quantity for this tier
  maxQuantity: integer('max_quantity'), // Maximum quantity for this tier (NULL if no upper limit)
  pricePer1000Stitches: integer('price_per_1000_stitches').notNull(), // Price per 1,000 stitches for this tier
  minimumPrice: integer('minimum_price').notNull() // Minimum unit price per item in this tier
});

export const pricingTierDetailsRelations = relations(pricingTierDetails, ({ one }) => ({
  pricingTier: one(pricingTier, { fields: [pricingTierDetails.pricingTierId], references: [pricingTier.id] })
}));

export type PricingTierDetails = typeof pricingTierDetails.$inferSelect;
export type NewPricingTierDetails = typeof pricingTierDetails.$inferInsert;

export const payments = sqliteTable('payments', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  customerId: integer('customer_id').references(() => customers.id),
  /**
   * Sum of amount of payments(1 or many) + credits(null or 1) for a transactionId = transaction.totalAmountTransacted
   * transaction and payments are read only once created, credits can be updated
   */
  transactionId: integer('transaction_id').notNull().references(() => transaction.id),
  orderId: integer('order_id').references(() => orders.id),
  amount: integer('amount').notNull(),
  paymentMethod: text('payment_method', { enum: paymentMethods }).notNull(), // e.g., 'cash', 'card', 'mobile', "bank"
  paymentDate: text('payment_date').default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  transaction: one(transaction, { fields: [payments.transactionId], references: [transaction.id] }),
  orders: one(orders, { references: [orders.id], fields: [payments.orderId] }),
  customers: one(customers, { references: [customers.id], fields: [payments.customerId] })
}));

export type Payments = typeof payments.$inferSelect;
export type NewPayments = typeof payments.$inferInsert;

export const inventory = sqliteTable('inventory', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  productId: integer('product_id').notNull().references(() => products.id),
  quantityOnHand: integer('quantity_on_hand').notNull()
});

export const inventoryRelations = relations(inventory, ({ one }) => ({
  products: one(products, { references: [products.id], fields: [inventory.productId] })
}));

export type Inventory = typeof inventory.$inferSelect;
export type NewInventory = typeof inventory.$inferInsert;

export const inventoryTransactions = sqliteTable('inventory_transactions', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  productId: integer('product_id').notNull().references(() => products.id),
  description: text('description').notNull(),
  /**
   * How quantity_change works:
   * Positive values: Indicate an increase in inventory (e.g., receiving new stock).
   * Negative values: Indicate a decrease in inventory (e.g., sales, returns to vendor).
   *  Zero values: Might be used for specific types of inventory events where the quantity doesn't change but you still want to record the event (e.g., a stock check).
   */
  quantityChange: integer('quantity_change').notNull(), // The change in quantity
  transactionType: text('transaction_type', { enum: inventoryTransactionType }).notNull(), // e.g., 'receipt', 'sale', 'adjustment'
  transactionDate: text('transaction_date').default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const inventoryTransactionsRelations = relations(inventoryTransactions, ({ one }) => ({
  products: one(products, { references: [products.id], fields: [inventoryTransactions.productId] })
}));

export type InventoryTransactions = typeof inventoryTransactions.$inferSelect;
export type NewInventoryTransactions = typeof inventoryTransactions.$inferInsert;

export const cashRegister = sqliteTable('cash_register', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  date: text('date').default(sql`CURRENT_TIMESTAMP`).notNull(),
  openingBalance: integer('opening_balance').notNull(),
  closingBalance: integer('closing_balance').notNull(),
  totalSales: integer('total_sales').notNull(),
  totalInflows: integer('total_inflows').notNull(), // Additional cash inflows (e.g., cash deposits)
  totalOutflows: integer('total_outflows').notNull() // Cash outflows (e.g., withdrawals or refunds)
});

export const cashRegisterRelations = relations(cashRegister, ({ many }) => ({
  cashTransactions: many(cashTransactions)
}));

export type CashRegister = typeof cashRegister.$inferSelect;
export type NewCashRegister = typeof cashRegister.$inferInsert;

export const cashTransactions = sqliteTable('cash_transactions', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  registerId: integer('register_id').notNull().references(() => cashRegister.id),
  transactionId: integer('transaction_id').notNull().references(() => transaction.id), // Link to a sale or refund transaction if applicable
  currencyId: integer('currency_id').notNull().references(() => currenciesDetails.id),
  transactionType: text('transaction_type', { enum: cashTransactionsType }).notNull(), // e.g., 'sale', 'refund', 'deposit', 'withdrawal'
  amount: integer('amount').notNull(),
  timestamp: text('timestamp').default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const cashTransactionsRelations = relations(cashTransactions, ({ one }) => ({
  cashRegister: one(cashRegister, { references: [cashRegister.id], fields: [cashTransactions.registerId] }),
  transaction: one(transaction, { references: [transaction.id], fields: [cashTransactions.transactionId] })
}));

export type CashTransactions = typeof cashTransactions.$inferSelect;
export type NewCashTransactions = typeof cashTransactions.$inferInsert;

export const credits = sqliteTable('credits', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  customerId: integer('customer_id').notNull().references(() => customers.id),
  /**
   * Sum of amount of payments(null or many) + credits(null or 1) for a transactionId = transaction.totalAmountTransacted
   * transaction and payments are read only once created, credits can be updated
   */
  transactionId: integer('transaction_id').notNull().references(() => transaction.id),
  amount: integer('amount').notNull(),
  status: text('status', { enum: creditsStatus }).notNull(),
  paymentMethod: text('payment_method', { enum: transactionPaymentMethods }).notNull(), // e.g., 'cash', 'card', 'mobile', "bank"
  expirationDate: text('expiration_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
  paymentDate: text('payment_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
  ...timestamp
});

export const creditsRelations = relations(credits, ({ one }) => ({
  transaction: one(transaction, { fields: [credits.transactionId], references: [transaction.id] }),
  customers: one(customers, { references: [customers.id], fields: [credits.customerId] })
}));

export type Credits = typeof credits.$inferSelect;
export type NewCredits = typeof credits.$inferInsert;

export const production = sqliteTable('production', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  orderItemsId: integer('order_items_id').notNull().references(() => orderItems.id),
  status: text('status', { enum: productionStatus }).notNull(),
  goodsStatus: text('goods_status', { enum: goodsStatus }).notNull(),
  embroideryType: text('embroidery_type', { enum: embroideryType }),
  garmentPlacement: text('garment_placement', { enum: garmentPlacement }),
  instructions: text('instructions')
});

export const productionRelations = relations(production, ({ one }) => ({
  orderItems: one(orderItems, { fields: [production.orderItemsId], references: [orderItems.id] }),
}));

export type Production = typeof production.$inferSelect;
export type NewProduction = typeof production.$inferInsert;

export const refunds = sqliteTable('refunds', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  customerId: integer('customer_id').notNull().references(() => customers.id),
  orderId: integer('order_id').references(() => orders.id), // No orderId if coming from credit
  transactionId: integer('transaction_id').notNull().references(() => transaction.id),
  amount: integer('amount').notNull(),
  refundDate: text('refund_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
  reason: text('reason')
});

export const refundsRelations = relations(refunds, ({ one }) => ({
  transaction: one(transaction, { fields: [refunds.transactionId], references: [transaction.id] }),
  customers: one(customers, { fields: [refunds.customerId], references: [customers.id] }),
  orders: one(orders, { fields: [refunds.orderId], references: [orders.id] }),
}));

export type Refunds = typeof refunds.$inferSelect;
export type NewRefunds = typeof refunds.$inferInsert;

export const expenses = sqliteTable('expenses', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  transactionId: integer('transaction_id').notNull().references(() => transaction.id),
  date: text('date').default(sql`CURRENT_TIMESTAMP`).notNull(),
  category: text('category', { enum: expensesCategories }).notNull(),
  description: text('description'),
  receipt: text('receipt').notNull(),
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  transaction: one(transaction, { fields: [expenses.transactionId], references: [transaction.id] }),
}));

export type Expenses = typeof expenses.$inferSelect;
export type NewExpenses = typeof expenses.$inferInsert;


/**
 * INSERT INTO `refunds` (`payment_id`, `order_id`, `amount`, `refund_date`, `reason`)
 * SELECT `id`, `order_id`, `amount`, CURRENT_TIMESTAMP, 'Order Canceled'
 * FROM `payments`
 * WHERE `order_id` = ?;
 */

/**
 *  CREATE TABLE `adjustment_logs` (
 *  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
 *  `reference_table` TEXT NOT NULL,
 *  `reference_id` INTEGER NOT NULL,
 *  `action` TEXT NOT NULL,
 *  `timestamp` TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
 *  `user_id` TEXT NOT NULL,
 *  `details` TEXT
 *  );
 * 
 * INSERT INTO `adjustment_logs` (`reference_table`, `reference_id`, `action`, `user_id`, `details`)
 * VALUES ('payments', ?, 'Canceled', ?, 'Payment canceled due to order cancellation');
 */

export const accountsType = ['asset', 'liability', 'revenue', 'expense', 'equity'] as const;

export const orderStatus = ['Quotation', 'Sales Order', 'Invoiced', 'Completed', 'Canceled'] as const;

export type OrderStatus = typeof orderStatus[number];

export const timeStatus = ['Pending', 'Expired', 'On Hold'] as const;

export type TimeStatus = typeof timeStatus[number];

export const paymentStatus = ['Unpaid', 'Partially Paid', 'Paid', 'Refunded', 'Not Applicable'] as const;

export type PaymentStatus = typeof paymentStatus[number];

export const currencyCode = ['USD', 'ZAR', 'BWP', 'ZWG'] as const;

export type CurrencyCode = typeof currencyCode[number];

export const currencyName = ['US Dollar', 'Rand', 'Pula', 'ZiG'] as const;

export type CurrencyName = typeof currencyName[number];

export const orderStatusPrint = ['Quotation', 'Sales Order', 'Invoice'] as const;

export type OrderStatusPrint = typeof orderStatusPrint[number];

export const productionStatus = ['Scheduled', 'In Process', 'Completed', 'On Hold', 'Cancelled'] as const;

export type ProductionStatus = typeof productionStatus[number];

export const goodsStatus = [
  'Awaiting Goods',
  'Awaiting Materials',
  'Received',
  'Awaiting Embroidery',
  'Embroidery',
  'Trimming',
  'Awaiting Collection',
  'Collected'
] as const;

export type GoodsStatus = typeof goodsStatus[number];

export const garmentPlacement = [
  'Front Left',
  'Front Right',
  'Upper Back',
  'Lower Back',
  'Right Sleeve',
  'Left Sleeve',
  'Cap Front',
  'Cap Back',
  'Cap Right Side',
  'Cap Left Side',
  'Trouser Front Left',
  'Trouser Front Right',
  'Trouser Back Left',
  'Trouser Back Right',
  'Name Tag',
  'Marked Position'
] as const;

export type GarmentPlacementUnion = typeof garmentPlacement[number];

export const embroideryType = ['Flat', 'Cap', 'Applique', 'Name Tag'] as const;

export type EmbroideryTypeUnion = typeof embroideryType[number];

export const transactionPaymentMethods = ['Cash', 'Card', 'Mobile', 'Bank'] as const;

export type TransactionPaymentMethodsUnion = typeof transactionPaymentMethods[number];

export const transactionTypes = ['Sales', 'Refund', 'Expense', 'Payment', 'Deposit', 'Withdrawal', 'Transfer', 'Adjustment', 'Discount', 'Tax', 'Interest', 'Fee'] as const;

export type TransactionTypesUnion = typeof transactionPaymentMethods[number];

export const paymentMethods = ['Cash', 'Card', 'Mobile', 'Bank', 'Credits'] as const;

export type PaymentMethodsUnion = typeof paymentMethods[number];

export const expensesCategories = ['Food', 'Travel', 'Supplies', 'Bank Fees', 'Benefits', 'Insurance', 'Interest', 'Legal Fees', 'License & Permits', 'Maintenance & Repairs', 'Office Supplies', 'Rent', 'Salaries & Wages', 'Shipping & Handling', 'Taxes', 'Utilities', 'Other'] as const;

export type ExpensesCategoriesUnion = typeof expensesCategories[number];

export const entryType = ['Debit', 'Credit'] as const;

export type EntryTypeUnion = typeof entryType[number];

export const inventoryTransactionType = ['Receipt', 'Sale', 'Adjustment', "Returns"] as const;

export type InventoryTransactionTypeUnion = typeof inventoryTransactionType[number];

export const cashTransactionsType = ['Sale', 'Refund', 'Deposit', 'Withdrawal'] as const;

export type CashTransactionsTypeUnion = typeof cashTransactionsType[number];

export const creditsStatus = ['Active', 'Used', 'Expired'] as const;

export type CreditsStatusUnion = typeof creditsStatus[number];
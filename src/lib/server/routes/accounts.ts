import { db } from '../db';
import {
  accounts,
  currenciesDetails,
  customers,
  journalEntries,
  orderItems,
  orders,
  products,
  transaction,
  type NewAccounts
} from '../db/schema/schema';
import { eq, sql } from 'drizzle-orm';

export const createAccounts = async (accData: NewAccounts[]) => {
  return await db.insert(accounts).values(accData).returning();
};

export const getAccountByName = async (name: string) => {
  const returnData = await db.select().from(accounts).where(eq(accounts.name, name));

  return returnData[0];
};

export const getSumAccountsReceivable = async (name: string) => {
  const statement = sql`
    SELECT 
        a.name AS account_name,
        SUM(
            CASE 
                WHEN j.currency_id = c.id THEN j.amount * c.exchange_rate 
            END
        ) AS balance_in_usd
    FROM ${journalEntries} j
    JOIN ${accounts} a ON j.account_id = a.id
    JOIN ${currenciesDetails} c ON j.currency_id = c.id
    WHERE a.name = ${name}
    GROUP BY a.name;
  `;

  const returnData = await db.all(statement);

  return returnData;
};

export const getAllOrderForCustomer = async (name: string) => {
  const statement = sql`
    SELECT o.id, o.created_at, o.total_amount, o.status 
    FROM ${orders} o 
    JOIN ${customers} c ON o.customer_id = c.id
    WHERE c.full_name = ${name};
  `;

  const returnData = await db.all(statement);

  return returnData;
};

export const getAllOrderItemForOrder = async (orderId: number) => {
  const statement = sql`
    SELECT p.name, oi.quantity, oi.unit_price, (unit_price * quantity) AS total_price
    FROM ${orderItems} oi
    JOIN ${products} p ON oi.product_id = p.id
    WHERE oi.order_id = ${orderId};
  `;

  const returnData = await db.all(statement);

  return returnData;
};

export const getCustomersOutstandingBalances = async () => {
  const statement = sql`
    SELECT 
    c.full_name AS customer_name,
    SUM(CASE WHEN j.entry_type = 'Debit' THEN j.amount ELSE -j.amount END) AS balance
    FROM ${customers} c
    JOIN ${transaction} t ON c.id = t.customer_id
    JOIN ${journalEntries} j ON t.id = j.transaction_id
    JOIN ${accounts} a ON j.account_id = a.id
    WHERE a.name = 'Accounts Receivable'
    GROUP BY c.full_name;
  `;

  const returnData = await db.all(statement);

  return returnData;
};

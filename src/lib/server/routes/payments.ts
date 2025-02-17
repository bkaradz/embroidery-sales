import { logger } from '$lib/utility/logger';
import type { PaymentsSchema } from '$lib/utility/schemas';
import { error } from '@sveltejs/kit';
import type Database from 'better-sqlite3';
import Big from 'big.js';
import { addYears, format, formatDate } from 'date-fns';
import { eq, inArray, sql, type ExtractTablesWithRelations } from 'drizzle-orm';
import type { SQLiteTransaction } from 'drizzle-orm/sqlite-core';
import { db } from '../db';
import type { NewCredits, NewOrders, NewPayments, NewTransaction } from '../db/schema/schema';
import {
  accounts,
  cashRegister,
  cashTransactions,
  credits,
  currenciesDetails,
  customers,
  inventory,
  inventoryTransactions,
  journalEntries,
  orderItems,
  orders,
  payments,
  products,
  transaction
} from '../db/schema/schema';

const CREDIT_DEFAULT_EXPIRATION_YEARS = formatDate(addYears(new Date(), 1), 'yyyy-MM-dd HH:mm:ss');
const TODAYS_DATE = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

export const createPayments = async (userId: string, paymentsData: PaymentsSchema) => {
  try {

    await db.transaction(async (tx) => {
      const { customerId, ordersPaidIds, amountPaidData, creditsIds } = paymentsData;
      const { amountPaid } = amountPaidData;

      const inventoryOrdersPaidIds = structuredClone(ordersPaidIds);
      // 1 Check that the customer exist
      const customer = await tx.select().from(customers).where(eq(customers.id, customerId));
      if (!customer) {
        tx.rollback();
        error(404, { message: `Customer ${customerId} not found` });
      }

      /**
       * credits + payments = transactions
       * credits can be updated
       * payments and transactions are read only once they are created
       * a transaction can have 0 or many payments
       * a transaction can have 0 or 1 credits
       * each payment can reference 1 order
       * each order can have 1 or more payments, until order amount = SUM payments with that orderId
       *
       * if creditsIds exist we first allocate payments on orders from credits,
       * payments should reference the transactionId on credit, when a payment is made
       * the credit must be updated, subtracted buy the amount on payment.
       * if the credits are finished then check the remaining cash from amountPaid
       * if a balance is remaining after subtracting SUM credit from amountPaid
       * create a transaction for the balance and continue making payments if orders still exist
       * if orders no longer exist but balance is remaining create a credit for the balance
       */
      let remainingPaymentAmount = Big(amountPaid);

      // 2. Apply Credits until all credits are finished
      remainingPaymentAmount = await handleCredits(
        customerId,
        tx,
        userId,
        TODAYS_DATE,
        creditsIds,
        ordersPaidIds,
        remainingPaymentAmount
      );

      await handleTransaction(tx, userId, TODAYS_DATE, paymentsData, remainingPaymentAmount);

      // 6. Inventory Transactions for Non-Embroidery where Applicable
      await updateInventory(tx, userId, TODAYS_DATE, inventoryOrdersPaidIds);
    });

    return { success: true };
  } catch (error) {
    logger.error({ module: 'payments.ts', function: 'createPayments', err: error });
    throw new Error('Payment failed');
  }
};

type Tx = SQLiteTransaction<
  'sync',
  Database.RunResult,
  typeof import('$lib/server/db/schema/schema'),
  ExtractTablesWithRelations<
    typeof import('$lib/server/db/schema/schema')
  >
>;

async function applyPayment(tx: Tx, paymentData: NewPayments) {
  await tx.insert(payments).values(paymentData);
}

async function updateOrder(tx: Tx, orderId: number, updates: Partial<NewOrders>) {
  await tx.update(orders).set(updates).where(eq(orders.id, orderId));
}

async function updateCredits(tx: Tx, creditId: number, updates: Partial<NewCredits>) {
  await tx.update(credits).set(updates).where(eq(credits.id, creditId));
}

async function handleCredits(
  customerId: number,
  tx: Tx,
  userId: string,
  TODAYS_DATE: string,
  creditsIds: number[],
  ordersPaidIds: number[],
  remainingPaymentAmount: Big
) {
  // Credit handling logic
  if (creditsIds && creditsIds.length > 0) {
    const creditsToUse = await tx
      .select()
      .from(credits)
      .where(inArray(credits.id, creditsIds))
      .execute();
    let remainingCreditAmount = Big(0);
    let creditBalance = Big(0);

    await Promise.all(
      creditsToUse.map(async (credit) => {
        // Orders to be called every time credit loop runs, to get current data, some of the orders removed when fully paid
        const ordersToUse = await tx
          .select()
          .from(orders)
          .where(inArray(orders.id, ordersPaidIds))
          .execute();
        const { amount, transactionId } = credit;
        remainingPaymentAmount = remainingPaymentAmount.minus(amount);

        await Promise.all(
          ordersToUse.map(async (order) => {
            const { totalAmount, totalPaid, id } = order;

            remainingCreditAmount = Big(amount);
            creditBalance = remainingCreditAmount.minus(Big(totalAmount).minus(totalPaid));

            if (creditBalance.gte(0)) {
              // order fully paid continue next order loop when done if statement
              // create payment
              await applyPayment(tx, {
                userId,
                customerId,
                transactionId,
                orderId: id,
                amount: totalAmount - totalPaid,
                paymentMethod: 'Credits',
                paymentDate: TODAYS_DATE
              });
              // update order
              await updateOrder(tx, id, { totalPaid: totalAmount, paymentStatus: 'Paid' });
              // Update credits
              await updateCredits(tx, credit.id, { amount: Number(creditBalance.toFixed(2)) });
              // remove id from ordersPaidIds
              const index = ordersPaidIds.indexOf(id);
              if (index > -1) {
                // only splice array when item is found
                ordersPaidIds.splice(index, 1); // 2nd parameter means remove one item only
              }
              remainingCreditAmount = creditBalance;
            }

            if (creditBalance.lt(0) && remainingCreditAmount.gt(0)) {
              // We have exhausted this credits record
              // create payment
              await applyPayment(tx, {
                userId,
                customerId,
                transactionId,
                orderId: id,
                amount: Number(remainingCreditAmount.toFixed(2)),
                paymentMethod: 'Credits',
                paymentDate: TODAYS_DATE
              });
              // update order
              await updateOrder(tx, id, {
                totalPaid: Number(Big(totalPaid).plus(remainingCreditAmount).toFixed(2)),
                paymentStatus: 'Partially Paid'
              });
              // Update credits
              await updateCredits(tx, credit.id, {
                amount: Number(0),
                status: 'Used'
              });
              // remove id from ordersPaidIds
              const index = creditsIds.indexOf(credit.id);
              if (index > -1) {
                // only splice array when item is found
                creditsIds.splice(index, 1); // 2nd parameter means remove one item only
              }
              remainingCreditAmount = Big(0);
              // continue credit
            }
          })
        );
      })
    );
  }
  return remainingPaymentAmount;
}

async function handleTransaction(
  tx: Tx,
  userId: string,
  TODAYS_DATE: string,
  paymentsData: PaymentsSchema,
  remainingPaymentAmount: Big
) {
  // Transaction creation logic
  const { customerId, ordersPaidIds, amountPaidData } = paymentsData;
  const { amountPaid, paymentMethod } = amountPaidData;

  const currency = await tx
    .select()
    .from(currenciesDetails)
    .where(eq(currenciesDetails.code, 'USD'))
    .execute();
  if (currency.length === 0) {
    tx.rollback();
    error(404, { message: 'Currencies USD not found' });
  }
  const currencyId = currency[0].id;

  // 3. Create the Transaction
  if (remainingPaymentAmount.gt(0)) {
    const NewTransactionData = {
      userId,
      date: TODAYS_DATE,
      description: `Payment of ${remainingPaymentAmount.toFixed(2)} ${paymentMethod} received for customer id ${customerId}`,
      type: "Sales",
      paymentMethod,
      currencyId: paymentMethod === 'Cash' ? null : currencyId, //
      customerId,
      totalAmountTransacted: Number(remainingPaymentAmount.toFixed(2))
    } as NewTransaction;
    const transactionResult = await tx.insert(transaction).values(NewTransactionData).returning();

    if (!transactionResult[0]) {
      tx.rollback();
      error(404, { message: 'Transaction creation failed' });
    }
    const transactionId = transactionResult[0].id;

    if (ordersPaidIds.length === 0) {
      // Customer just did a deposit, create a credit

      await tx.insert(credits).values({
        userId,
        customerId,
        transactionId,
        amount: Number(remainingPaymentAmount.toFixed(2)),
        status: 'Active',
        expirationDate: CREDIT_DEFAULT_EXPIRATION_YEARS,
        paymentMethod: paymentMethod,
        paymentDate: TODAYS_DATE
      });
    }

    if (ordersPaidIds.length > 0) {
      // iterate orders creating payments and updating orders paymentStatus and totalPaid
      const { remainingPaymentAmountLocal } = await newOrdersPayments(
        customerId,
        tx,
        userId,
        TODAYS_DATE,
        paymentMethod,
        ordersPaidIds,
        transactionId,
        remainingPaymentAmount
      );
      /**
       * if tempAmountPaid > 0. The remaining balance is more than zero
       * Customer just did a deposit, create payment without orderId
       */

      if (remainingPaymentAmountLocal.gt(0)) {
        // Customer just did a deposit, create a credit
        const oneYear = format(addYears(new Date(), 1), 'yyyy-MM-dd HH:mm:ss');
        await tx.insert(credits).values({
          userId,
          customerId,
          transactionId,
          amount: Number(remainingPaymentAmountLocal.toFixed(2)),
          status: 'Active',
          expirationDate: oneYear,
          paymentMethod: paymentMethod,
          paymentDate: TODAYS_DATE
        });
      }
    }

    // 4. Handle Cash Transactions and Register
    // Get todays cash register if it does not exist throw
    await handleCashTransactions(
      tx,
      userId,
      TODAYS_DATE,
      amountPaidData,
      transactionId,
      ordersPaidIds
    );

    // 5. Journal Entries (Simple Cash Account)
    const cashAccount = await tx.select().from(accounts).where(eq(accounts.name, 'Cash')).execute();
    if (cashAccount.length === 0) {
      tx.rollback();
      error(404, { message: 'Cash account not found' });
    }
    const cashAccountId = cashAccount[0].id;

    await tx.insert(journalEntries).values({
      transactionId,
      accountId: cashAccountId,
      amount: amountPaid,
      entryType: 'Credit', // Cash received is a credit to the cash account
      date: TODAYS_DATE
    });

    // debiting accounts receivable
    const accountsReceivable = await tx
      .select()
      .from(accounts)
      .where(eq(accounts.name, 'Accounts Receivable'))
      .execute();
    if (accountsReceivable.length === 0) {
      tx.rollback();
      error(404, { message: 'Accounts receivable not found' });
    }
    const accountsReceivableId = accountsReceivable[0].id;

    await tx.insert(journalEntries).values({
      transactionId,
      accountId: accountsReceivableId,
      amount: amountPaid,
      entryType: 'Debit', // Reducing accounts receivable
      date: TODAYS_DATE
    });


  }
}

async function handleCashTransactions(
  tx: Tx,
  userId: string,
  TODAYS_DATE: string,
  amountPaidData: PaymentsSchema['amountPaidData'],
  transactionId: number,
  ordersPaidIds: number[]
) {
  // Cash transactions logic
  const { amountPaid, paymentMethod } = amountPaidData;
  const todaysRegister = await tx
    .select()
    .from(cashRegister)
    .where(eq(sql`Date(cash_register.date)`, sql`Date('now')`))
    .execute();
  if (todaysRegister.length === 0) {
    tx.rollback();
    error(404, { message: 'Todays cash register not found' });
  }
  const { id, closingBalance, totalInflows } = todaysRegister[0];

  if (paymentMethod === 'Cash') {
    await Promise.all(
      amountPaidData.cashData.map(async (cashItem) => {
        const currency = await tx
          .select()
          .from(currenciesDetails)
          .where(eq(currenciesDetails.code, cashItem.code))
          .execute();
        if (currency.length === 0) {
          tx.rollback();
          error(404, { message: `Currency code: ${cashItem.code} not found` });
        }
        const currencyId = currency[0].id;

        await tx.insert(cashTransactions).values({
          registerId: id,
          userId,
          transactionType: ordersPaidIds.length === 0 ? 'Deposit' : 'Sale',
          amount: cashItem.amount,
          currencyId,
          transactionId,
          timestamp: TODAYS_DATE
        });
      })
    );

    // Update cash register
    await tx
      .update(cashRegister)
      .set({
        closingBalance: Number(Big(closingBalance).plus(amountPaid).toFixed(2)),
        totalInflows: Number(Big(totalInflows).plus(amountPaid).toFixed(2))
      })
      .where(eq(cashRegister.id, id));
  }
}

async function updateInventory(
  tx: Tx,
  userId: string,
  TODAYS_DATE: string,
  inventoryOrdersPaidIds: number[]
) {
  if (inventoryOrdersPaidIds.length > 0) {
    // remove partially paid order
    const getOrders = await tx
      .select()
      .from(orders)
      .where(inArray(orders.id, inventoryOrdersPaidIds))
      .execute();
    // need paid orders only
    const filteredOrders = getOrders.filter((order) => order.paymentStatus === 'Paid');
    const orderList = filteredOrders.map((order) => order.id);

    const getOrderItems = await tx
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderList))
      .execute();

    await Promise.all(
      getOrderItems.map(async (orderItem) => {
        const product = await tx
          .select()
          .from(products)
          .where(eq(products.id, orderItem.productId))
          .execute();
        if (product.length === 0) {
          tx.rollback();
          error(404, { message: `Product ${orderItem.productId} not found` });
        }

        const { id, isEmbroidery, productCategory } = product[0];

        const productId = id;

        if (!isEmbroidery && productCategory !== 'Services') {
          // Check if it's NOT embroidery

          const { productId, quantityOnHand } = await createInventory();

          await tx.insert(inventoryTransactions).values({
            userId,
            productId,
            description: `Decrement due to Sales for Order ID ${orderItem.orderId}`,
            quantityChange: -orderItem.quantity, // Decrement quantity
            transactionType: 'Sale',
            transactionDate: TODAYS_DATE
          });
          await tx
            .update(inventory)
            .set({
              quantityOnHand: quantityOnHand - orderItem.quantity
            })
            .where(eq(inventory.productId, productId));
        }

        async function createInventory() {
          const existingInventory = await tx
            .select()
            .from(inventory)
            .where(eq(inventory.productId, orderItem.productId))
            .execute();

          if (existingInventory.length === 0) {
            // if inventory is not found create one
            const results = await tx
              .insert(inventory)
              .values({
                userId,
                productId,
                quantityOnHand: 1000
              })
              .returning();
            return results[0];
          }
          return existingInventory[0];
        }
        // 
      })
    );
  }
}

async function newOrdersPayments(
  customerId: number,
  tx: Tx,
  userId: string,
  TODAYS_DATE: string,
  paymentMethod: PaymentsSchema['amountPaidData']['paymentMethod'],
  ordersPaidIds: number[],
  transactionId: number,
  remainingPaymentAmount: Big
) {
  let remainingPaymentAmountLocal = remainingPaymentAmount;
  let balance = Big(0);

  await Promise.all(
    ordersPaidIds.map(async (orderId) => {
      const order = await tx.select().from(orders).where(eq(orders.id, orderId)).execute();
      if (!order[0]) {
        tx.rollback();
        error(404, { message: `Order ${orderId} not found` });
      }
      const { totalAmount, totalPaid, id } = order[0];
      balance = remainingPaymentAmountLocal.minus(Big(totalAmount).minus(totalPaid));

      if (balance.gte(0)) {
        // create payment
        await applyPayment(tx, {
          userId,
          customerId,
          transactionId,
          orderId: id,
          amount: totalAmount - totalPaid,
          paymentMethod: paymentMethod,
          paymentDate: TODAYS_DATE
        });
        // update order
        await updateOrder(tx, id, { totalPaid: totalAmount, paymentStatus: 'Paid' });
        remainingPaymentAmountLocal = balance;
      }

      if (balance.lt(0) && remainingPaymentAmountLocal.gt(0)) {
        // create payment
        await applyPayment(tx, {
          userId,
          customerId,
          transactionId,
          orderId: id,
          amount: Number(remainingPaymentAmountLocal.toFixed(2)),
          paymentMethod: paymentMethod,
          paymentDate: TODAYS_DATE
        });
        // update order
        await updateOrder(tx, id, {
          totalPaid: Number(Big(totalPaid).plus(remainingPaymentAmountLocal).toFixed(2)),
          paymentStatus: 'Partially Paid'
        });
        remainingPaymentAmountLocal = Big(0);
      }
    })
  );
  return { remainingPaymentAmountLocal };
}

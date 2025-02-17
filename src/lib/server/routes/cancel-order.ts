import { error } from "@sveltejs/kit";
import { db } from "../db";
import { accounts, credits, inventory, inventoryTransactions, journalEntries, orders, payments, transaction, type NewCredits, type NewOrders, type NewPayments } from "../db/schema/schema";
import { addYears, formatDate } from "date-fns";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import type Database from "better-sqlite3";
import { eq, type ExtractTablesWithRelations } from "drizzle-orm";
import { logger } from "$lib/utility/logger";

const TODAYS_DATE = formatDate(new Date(), 'dd MMM yyyy HH:mm');
const CREDIT_DEFAULT_EXPIRATION_YEARS = formatDate(addYears(new Date(), 1), 'yyyy-MM-dd HH:mm:ss');

export const cancelOrder = async (userId: string, orderId: number, cancellationReason: string) => {

  const order = await db.query.orders.findFirst({
    where: (orders, { eq }) => eq(orders.id, orderId),
  })

  if (!order) {
    error(404, { message: `Order ${orderId} not found` });
  }

  const { paymentStatus, orderStatus } = order

  if (orderStatus === "Canceled") {
    error(404, { message: `Order was canceled` });
  }
  if (paymentStatus === "Not Applicable") {
    error(404, { message: `Order was canceled` });
  }
  if (paymentStatus === "Refunded") {
    error(404, { message: `Order was refunded` });
  }

  try {
    await db.transaction(async (tx) => {

      if (paymentStatus === "Unpaid") {
        /**
         * set paymentStatus: to 'Not Applicable' and orderStatus: to 'Cancelled'
         * inventory had not yet been moved so do nothing
         */
        // await tx.update(orders).set({
        //   paymentStatus: "Not Applicable",
        //   orderStatus: "Canceled",
        //   canceledAt: TODAYS_DATE,
        //   canceledBy: userId,
        //   cancellationReason
        // }).where(eq(orders.id, orderId))
        await updateOrder(tx, orderId, {
          paymentStatus: "Not Applicable",
          orderStatus: "Canceled",
          canceledAt: TODAYS_DATE,
          canceledBy: userId,
          cancellationReason
        });
      }

      const transData = await tx.query.payments.findMany({
        where: (payments, { eq }) => eq(payments.orderId, orderId),
        with: {
          transaction: true
        }
      })

      if (paymentStatus === "Partially Paid" || paymentStatus === 'Paid') {
        /**
         * reverse transaction and payments, optional create new transaction for that amount
         * create new transaction with credit
         * reverse journal entries
         * update Order paymentStatus: to 'Refunded', orderStatus: to 'Cancelled' and totalPaid to 0
         * reverse inventory
         */
        await Promise.all(
          transData.map(async (payment) => {
            const { amount, customerId } = payment
            const { id, currencyId, paymentMethod } = payment.transaction

            if (!customerId) {
              tx.rollback();
              error(404, { message: 'Customer not found' });
            }

            // reverse transaction
            const cancelledTransaction = await tx.insert(transaction).values({
              userId,
              customerId,
              currencyId,
              date: TODAYS_DATE,
              description: `Reversal of ${amount} for Payment ID ${payment.id} and Transaction ID ${id} and Order ID ${orderId} - Order Canceled`,
              type: "Refund",
              paymentMethod,
              totalAmountTransacted: -amount
            }).returning()

            const reverseTransactionId = cancelledTransaction[0].id

            // reverse payments
            await createPayment(tx, {
              userId,
              customerId,
              transactionId: reverseTransactionId,
              orderId: id,
              amount: -amount,
              paymentMethod: paymentMethod,
              paymentDate: TODAYS_DATE
            });

            // reverse journal entries
            // Journal Entries (Simple Cash Account)
            const cashAccount = await tx.select().from(accounts).where(eq(accounts.name, 'Cash')).execute();
            if (cashAccount.length === 0) {
              tx.rollback();
              error(404, { message: 'Cash account not found' });
            }
            const cashAccountId = cashAccount[0].id;

            await tx.insert(journalEntries).values({
              transactionId: reverseTransactionId,
              accountId: cashAccountId,
              amount: amount,
              entryType: 'Debit', // Cash received is a credit to the cash account
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
              transactionId: reverseTransactionId,
              accountId: accountsReceivableId,
              amount: amount,
              entryType: 'Credit', // Reducing accounts receivable
              date: TODAYS_DATE
            });

            // create new transaction with credit
            const newTransaction = await tx.insert(transaction).values({
              userId,
              date: TODAYS_DATE,
              description: `Refund of ${amount}, ${paymentMethod} received for Order Id ${orderId}`,
              type: "Refund",
              paymentMethod,
              currencyId: paymentMethod === 'Cash' ? null : currencyId, //
              customerId,
              totalAmountTransacted: amount
            }).returning();

            const newTransactionId = newTransaction[0].id

            await tx.insert(credits).values({
              userId,
              customerId,
              transactionId: newTransactionId,
              amount: amount,
              status: 'Active',
              expirationDate: CREDIT_DEFAULT_EXPIRATION_YEARS,
              paymentMethod: paymentMethod,
              paymentDate: TODAYS_DATE
            });

            // Create journal entries
            // Journal Entries (Simple Cash Account)
            await tx.insert(journalEntries).values({
              transactionId: newTransactionId,
              accountId: cashAccountId,
              amount,
              entryType: 'Credit', // Cash received is a credit to the cash account
              date: TODAYS_DATE
            });

            // debiting accounts receivable
            await tx.insert(journalEntries).values({
              transactionId: newTransactionId,
              accountId: accountsReceivableId,
              amount,
              entryType: 'Debit', // Reducing accounts receivable
              date: TODAYS_DATE
            });

            // update Order paymentStatus: to 'Refunded', orderStatus: to 'Cancelled' and totalPaid to 0
            await updateOrder(tx, orderId, { totalPaid: 0, paymentStatus: 'Refunded', orderStatus: 'Canceled' });

            // reverse inventory
            const orderItemsList = await tx.query.orderItems.findMany({
              where: (orderItems, { eq }) => eq(orderItems.orderId, orderId),
              with: {
                products: true
              }
            })

            await Promise.all(
              orderItemsList.map(async (orderItem) => {
                const { products, productId, quantity } = orderItem
                const { isEmbroidery, productCategory } = products

                if (!isEmbroidery && productCategory !== 'Services') {
                  // Check if it's NOT embroidery

                  const { productId, quantityOnHand } = await createInventory();

                  await tx.insert(inventoryTransactions).values({
                    userId,
                    productId,
                    description: `Reversal due to order cancellation for Order ID ${orderId}`,
                    quantityChange: quantity, // Decrement quantity
                    transactionType: 'Returns',
                    transactionDate: TODAYS_DATE
                  });
                  await tx
                    .update(inventory)
                    .set({
                      quantityOnHand: quantityOnHand + quantity
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
              })
            )
          })
        )
      }
    })
    return { success: true }
  } catch (error) {
    logger.error({ 'module': 'cancelOrders.ts', 'function': 'cancelOrders', err: error },)
    throw new Error("Order cancellation failed");
  }



}

export type CancelOrder = Awaited<ReturnType<typeof cancelOrder>>;

type Tx = SQLiteTransaction<
  'sync',
  Database.RunResult,
  typeof import('$lib/server/db/schema/schema'),
  ExtractTablesWithRelations<
    typeof import('$lib/server/db/schema/schema')
  >
>;

async function createPayment(tx: Tx, paymentData: NewPayments) {
  await tx.insert(payments).values(paymentData);
}

async function updateOrder(tx: Tx, orderId: number, updates: Partial<NewOrders>) {
  await tx.update(orders).set(updates).where(eq(orders.id, orderId));
}

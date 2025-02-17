import type { ExpensesSchema } from "$lib/utility/schemas";
import { error } from "@sveltejs/kit";
import { eq, type ExtractTablesWithRelations } from "drizzle-orm";
import { db } from "../db";
import { currenciesDetails, type NewPayments, type NewTransaction, payments, transaction } from "../db/schema/schema";
import { formatDate } from "date-fns";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import type Database from "better-sqlite3";

const TODAYS_DATE = formatDate(new Date(), 'dd MMM yyyy HH:mm');

export const createExpense = async (userId: string, expensesData: ExpensesSchema) => {

  const { amount, category, currency, paymentMethod, receipt, description } = expensesData

  try {

    await db.transaction(async (tx) => {

      // create transaction
      const currencyR = await tx
        .select()
        .from(currenciesDetails)
        .where(eq(currenciesDetails.code, currency))
        .execute();
      if (currency.length === 0) {
        tx.rollback();
        error(404, { message: 'Currencies USD not found' });
      }
      const currencyId = currencyR[0].id;

      // 3. Create the Transaction
      const NewTransactionData: NewTransaction = {
        userId,
        date: TODAYS_DATE,
        description: `Expense of ${amount.toFixed(2)} ${paymentMethod} for ${receipt}, Description: ${description}`,
        type: "Expense",
        paymentMethod,
        currencyId,
        totalAmountTransacted: Number(amount.toFixed(2))
      };
      const transactionResult = await tx.insert(transaction).values(NewTransactionData).returning();

      if (!transactionResult[0]) {
        tx.rollback();
        error(404, { message: 'Transaction creation failed' });
      }
      const transactionId = transactionResult[0].id;

      // create payment 
      await applyPayment(tx, {
        userId,
        transactionId,
        amount: Number(amount.toFixed(2)),
        paymentMethod: paymentMethod,
        paymentDate: TODAYS_DATE
      });

      // if payment is cash create cash transaction also

      // create expense


    })

    return { success: true };

  } catch (error) {

  }


  return {}
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
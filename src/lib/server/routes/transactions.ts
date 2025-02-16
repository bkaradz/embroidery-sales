import { db } from "../db"
import { transaction, type NewTransaction } from "../db/schema/schema"

export const createTransaction = async (transactionsData: NewTransaction[]) => {

  const output = await db.insert(transaction).values(transactionsData).returning()
  return output[0]

}

// export const auditTransaction = async () => {

//   const statement = sql`
//     SELECT t.id AS transactionId,
//           t.total_amount_transacted AS transaction_amount,
//           COALESCE(SUM(p.amount), 0) AS total_payments,
//           COALESCE(c.amount, 0) AS credit_amount,
//           CASE WHEN ABS(t.total_amount_transacted - COALESCE(SUM(p.amount), 0) + COALESCE(c.amount, 0) ) < 0.0001 THEN 'Balanced' ELSE 'Unbalanced' END AS status
//       FROM ${transaction} t
//           LEFT JOIN
//           ${payments} p ON t.id = p.transaction_id
//           LEFT JOIN
//           ${credits} c ON t.id = c.transaction_id
//     GROUP BY t.id,
//               t.total_amount_transacted,
//               c.amount;
//     `
//   return db.all(statement)
// }

export const getTransWithPaymentsCredits = async () => {

  return await db.query.transaction.findMany({
    with: {
      payments: true,
      credits: true
    }
  })
};




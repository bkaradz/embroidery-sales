import { and, eq } from "drizzle-orm"
import { db } from "../db"
import { credits } from "../db/schema/schema"
import Big from "big.js"


export const getCreditsByCustomerId = async (customerId: number) => {

  return await db.select().from(credits).where(and(eq(credits.customerId, customerId), eq(credits.status, 'Active')))

}

export const getCreditsTotalsByCustomerId = async (customerId: number) => {

  const creditsData = await db.select().from(credits).where(and(eq(credits.customerId, customerId), eq(credits.status, 'Active')))

  const creditsIds: number[] = [];
  let creditTotal = 0;
  if (creditsData.length >= 1) {
    for (const credit of creditsData) {
      creditTotal = Number(Big(creditTotal).plus(credit.amount).toFixed(2));
      creditsIds.push(credit.id);
    }
  }

  return { creditTotal, creditsIds }

}

export type GetCreditsTotalsByCustomerId = Awaited<ReturnType<typeof getCreditsTotalsByCustomerId>>;
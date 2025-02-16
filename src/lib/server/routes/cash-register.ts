import type { RegisterSchema } from "$lib/utility/schemas"
import { format } from "date-fns"
import { db } from "../db"
import { cashRegister, type NewCashRegister } from "../db/schema/schema"
import { eq, sql } from "drizzle-orm"
import { error } from "@sveltejs/kit"

export const createCashRegister = async (userId: string, cashRegisterData: RegisterSchema) => {

  const todaysCashRegister = await getTodaysCashRegister()
  if (todaysCashRegister.length >= 1) {
    error(404, { message: `Today's cash register already exist!` });
  }

  const values = {
    date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    userId,
    openingBalance: cashRegisterData.openingBalance,
    closingBalance: 0,
    totalSales: 0,
    totalInflows: 0, 
    totalOutflows: 0, 
  } as NewCashRegister

  const output = await db.insert(cashRegister).values(values).returning()
  return output.at(0)
}

export const getTodaysCashRegister = async () => {

  return db.select().from(cashRegister).where(eq(sql`Date(cash_register.date)`, sql`Date('now')`)).execute()
  
}
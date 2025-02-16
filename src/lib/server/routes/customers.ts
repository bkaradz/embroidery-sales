import { error } from "@sveltejs/kit";
import { db } from "../db";
import { customers, type NewCustomers } from "../db/schema/schema";
import { and, eq, sql } from "drizzle-orm";

export const createCustomers = async (customersData: NewCustomers[]) => {

  const output = await db.insert(customers).values(customersData).returning()
  return output[0]
}

export const getCustomerByName = async (customersData: string) => {

  const returnData = await db.select().from(customers).where(eq(customers.fullName, customersData))

  return returnData[0]

}

export const getCustomerById = async (id: number) => {

  const returnData = await db.select().from(customers).where(eq(customers.id, id))

  return returnData[0]

}

export const getCustomers = async () => {
  return await db.select().from(customers).where(eq(customers.isDeleted, false))
};

export const updateCustomerIsDeleted = async (id: number, userId: string) => {
  return await db.update(customers).set({ isDeleted: true, userId }).where(eq(customers.id, id))
};

export const updateCustomer = async (data: NewCustomers) => {

  if (!data.id) {
    error(404, { message: `Customer id not found` });
  }

  return await db.update(customers).set(data).where(eq(customers.id, data.id))
};


export const getCustomerWithOrders = async (id: number) => {

  return await db.query.customers.findMany({
    where: (customers, { eq }) => (and(eq(customers.id, id), eq(customers.isDeleted, false))),
    with: {
      orders: true
    }
  })
};

export const customerSelection = async () => {
  return await db.select({ value: customers.id, label: sql`CONCAT(${customers.fullName}, ' (', ${customers.id}, ')')` }).from(customers).where(eq(customers.isDeleted, false))
};




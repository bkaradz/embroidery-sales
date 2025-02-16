import { eq } from "drizzle-orm"
import { db } from "../db"
import { inventory } from "../db/schema/schema"

export const getInventoryByProductId = async (id: number) => {

  const returnData = await db.select().from(inventory).where(eq(inventory.productId, id))

  return returnData[0]

}

export const getInventory = async () => {

  return await db.select().from(inventory)

}
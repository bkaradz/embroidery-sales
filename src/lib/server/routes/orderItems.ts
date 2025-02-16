import { sql } from "drizzle-orm"
import { db } from "../db"
import { orderItems, pricingTierDetails, products, type NewOrderItems } from "../db/schema/schema"

export const createOrderItems = async (orderItemsData: NewOrderItems[]) => {

  return await db.insert(orderItems).values(orderItemsData).returning()

}

// To remove the the quantity and productId coz they are already there ib orderItem
export const updateOrderItemTotals = async (quantity: number, productId: number, orderItemId: number) => {

  const statement = sql`
    WITH selected_pricing AS (
      SELECT price_per_1000_stitches, minimum_price
      FROM ${pricingTierDetails}
      WHERE pricing_tier_id = 1
        AND min_quantity <= ${quantity}
        AND (max_quantity IS NULL OR max_quantity >= ${quantity})
      ORDER BY min_quantity DESC
      LIMIT 1
    )
    UPDATE ${orderItems}
    SET 
        stitches = (SELECT stitches FROM ${products} WHERE id = ${productId}),
        unit_price = ${quantity} * CASE
            WHEN ((SELECT stitches FROM ${products} WHERE id = ${productId}) / 1000.0 * (SELECT price_per_1000_stitches FROM selected_pricing)) < (SELECT minimum_price FROM selected_pricing)
            THEN (SELECT minimum_price FROM selected_pricing)
            ELSE ((SELECT stitches FROM ${products} WHERE id = ${productId}) / 1000.0 * (SELECT price_per_1000_stitches FROM selected_pricing))
        END
    WHERE id = ${orderItemId};`

  const returnData = await db.run(statement)

  return returnData

}
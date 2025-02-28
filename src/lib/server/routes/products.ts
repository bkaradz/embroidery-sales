import { eq } from "drizzle-orm";
import { db } from "../db"
import { error } from '@sveltejs/kit';
import { inventory, products, type NewProducts } from "../db/schema/schema"
import type { ProductSchema } from "$lib/utility/schemas";
import { logger } from "$lib/utility/logger";

export const uploadProducts = async (productsData: NewProducts[]) => {

  try {

    productsData.forEach(async (product, index) => {

      const { name, ...restData } = product

      await db.insert(products).values({ ...product }).onConflictDoUpdate({
        target: products.name,
        set: restData
      })
    })

    return { success: true }
  } catch (error) {
    logger.error({ 'module': 'products.ts', 'function': 'uploadProducts', err: error },)
    throw new Error("Products Upload failed");
  }

}

export const createProduct = async (userId: string, productData: ProductSchema) => {
  try {
    await db.transaction(async (tx) => {
      const { stockQuantity, ...restProductData } = productData


      const product = await tx.insert(products).values({ ...restProductData, userId }).returning()

      if (product.length === 0) error(404, { message: `Product was not created` });
      const isEmbroidery = product[0].isEmbroidery
      const productId = product[0].id

      if (!isEmbroidery && stockQuantity) {
        await tx.insert(inventory).values({
          userId,
          productId,
          quantityOnHand: Number(stockQuantity),
        })
      }
    })
    return { success: true }
  } catch (error) {
    logger.error({ 'module': 'products.ts', 'function': 'createProduct', err: error },)
    throw new Error("Product creation failed");
  }
}

export const getProducts = async () => {

  return await db.select({
    id: products.id,
    name: products.name,
    isEmbroidery: products.isEmbroidery,
    basePrice: products.basePrice,
    productCategory: products.productCategory,
    stitches: products.stitches,
  }).from(products).where(eq(products.isDeleted, false))

}

export type GetProducts = Awaited<ReturnType<typeof getProducts>>

export const getProductById = async (id: number) => {

  const returnData = await db.select().from(products).where(eq(products.id, id))

  return returnData[0]

}
export const getOrdersByProductId = async (productId: number) => {

  const orderResults = await db.query.orderItems.findMany({
    where: (orderItems, { eq }) => (eq(orderItems.productId, productId)),
    with: {
      products: true,
      orders: true
    }
  })

  return orderResults.filter((orderItem) => (orderItem.orders.orderStatus !== "Canceled" && orderItem.orders.orderStatus !== "Quotation"))

}

export const updateProduct = async (data: NewProducts) => {

  if (!data.id) {
    error(404, { message: `Product id not found` });
  }

  return await db.update(products).set(data).where(eq(products.id, data.id))
};

export const updateProductIsDeleted = async (id: number, userId: string) => {
  return await db.update(products).set({ isDeleted: true, userId }).where(eq(products.id, id))
};
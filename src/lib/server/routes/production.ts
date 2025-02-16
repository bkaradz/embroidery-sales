import { db } from "../db"

export const getProductionOrders = async () => {

  const results = await db.query.orderItems.findMany({
    where: (orderItems, { isNotNull }) => (isNotNull(orderItems.stitches)),
    with: {
      orders: {
        with: {
          customers: true
        }
      },
      products: true,
    }
  })

  return results.map((item) => {
    const { id, orderId, orders, products, quantity, stitches, } = item
    const { customers, orderDate, } = orders
    const { name } = products
    const { fullName } = customers
    const productionId = `${orderId}-${id}`

    return {
      orderDate,
      customerName: fullName,
      productName: name,
      stitches,
      quantity,
      productionId
    }
  })

}

export type GetProductionOrdersResult = Awaited<ReturnType<typeof getProductionOrders>>;
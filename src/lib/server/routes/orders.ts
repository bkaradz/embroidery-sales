import { calculateCart } from "$lib/utility/calculate-cart";
import type { CartItem, OrdersSchema } from "$lib/utility/schemas";
import { error } from "@sveltejs/kit";
import Big from "big.js";
import { add, format } from "date-fns";
import { and, eq, inArray, ne } from "drizzle-orm";
import { db } from "../db";
import { customers, orderItems, orders, production, products, type NewOrderItems, type NewOrders, type NewProduction, type OrderItems, type Products } from "../db/schema/schema";
import { getCustomerById } from "./customers";
import { getPricingTiersById } from "./pricing-tiers";


export const createNewOrder = async ({ items, userId, customerId, pricingTierId, purchaseOrderNumber, status = 'Pending', orderStatus = 'Quotation' }: OrdersSchema) => {

  // get customer
  const customer = await getCustomerById(customerId)
  if (!customer) error(404, { message: `Customer ${customerId} not found` });

  // get products
  const productMap = new Map<number, number>()
  items.forEach((product) => productMap.set(product.productId, product.quantity))
  const productIds = Array.from(productMap.keys())
  const productData = await db.select().from(products).where(inArray(products.id, productIds))

  const productArray: CartItem[] = []

  productData.forEach((product) => {
    const quantity = productMap.get(product.id)
    if (!quantity) error(404, { message: `Quantity not found` });

    productArray.push({ ...product, quantity, total: 0, unitPrice: 0 })
  })

  // get pricing tier used
  const pricingTier = await getPricingTiersById(pricingTierId)
  const pricingTierDetails = pricingTier[0].pricingTierDetails

  // calculate the prices for the cart
  const cartCalculations = calculateCart(pricingTierDetails, productArray)

  await db.transaction(async (tx) => {
    const orderData = {
      userId,
      pricingTierId,
      orderDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      validUntil: format(add(new Date(), { days: 7 }), 'yyyy-MM-dd HH:mm:ss'),
      customerId,
      totalAmount: Number(cartCalculations.subtotal.toFixed(2)),
      balanceRemaining: Number(cartCalculations.subtotal.toFixed(2)),
      purchaseOrderNumber,
      status,
      orderStatus,
      paymentStatus: 'Unpaid',
    } as NewOrders
    const id = await tx.insert(orders).values(orderData).returning({ id: orders.id });

    await Promise.all(cartCalculations.items.map(async (item) => {

      const orderItem = {
        orderId: id[0].id,
        productId: item.id,
        quantity: item.quantity,
        stitches: item.stitches,
        unitPrice: Number(item.unitPrice.toFixed(2)),
      } as NewOrderItems

      if (item.stitches && orderStatus !== 'Quotation') {
        // Create Production record
        const results = await tx.insert(orderItems).values(orderItem).returning();

        const orderItemsId = results[0].id

        const productionRecord = {
          orderItemsId,
          goodsStatus: 'Received',
          status: 'Scheduled'
        } as NewProduction

        await tx.insert(production).values(productionRecord)

      } else {
        await tx.insert(orderItems).values(orderItem);
      }
    }))
  });

  return { success: true }

}

export type CreateNewOrderResult = Awaited<ReturnType<typeof createNewOrder>>;

export const getUnpaidOrdersByCustomerId = async (customerId: number) => {

  return await db.select().from(orders).where(
    and(eq(orders.customerId, customerId), ne(orders.paymentStatus, 'Paid'))
  )

}

export type GetUnpaidOrdersByCustomerIdResult = Awaited<ReturnType<typeof getUnpaidOrdersByCustomerId>>;


export const getSalesBook = async () => {

  const results = await db.query.orderItems.findMany({
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
    const { id, orderId, orders, products, quantity, stitches, unitPrice } = item
    const total = Number(Big(unitPrice).mul(quantity).toFixed(2))
    const { totalAmount, totalPaid, customers, status, orderStatus, orderDate, paymentStatus } = orders
    const { name } = products
    const { fullName } = customers
    const balanceRemaining = Number(Big(totalAmount).minus(totalPaid).toFixed(2))
    return {
      customerName: fullName,
      productName: name,
      orderDate,
      orderStatus,
      paymentStatus,
      status,
      stitches,
      quantity,
      unitPrice,
      total,
      orderTotal: totalAmount,
      totalPaid,
      balanceRemaining,
      orderItemId: id,
      orderId
    }
  })

}

export type GetSalesBookResult = Awaited<ReturnType<typeof getSalesBook>>;

export const getSales = async () => {

  const results = await db.query.orderItems.findMany({
    with: {
      products: true,
      orders: {
        with: {
          customers: true
        }
      },
    }
  })

  return results.filter((item) => item.orders.orderStatus === "Sales Order" || item.orders.orderStatus === "Invoiced")

  // return filteredItems.map((item) => {
  //   const { id, orderId, orders, products, quantity, stitches, unitPrice } = item
  //   const total = Number(Big(unitPrice).mul(quantity).toFixed(2))
  //   const { totalAmount, totalPaid, customers, status, orderStatus, orderDate, paymentStatus } = orders
  //   const { name } = products
  //   const { fullName } = customers
  //   const balanceRemaining = Number(Big(totalAmount).minus(totalPaid).toFixed(2))
  //   return {
  //     customerName: fullName,
  //     productName: name,
  //     orderDate: formatDate(new Date(orderDate), 'dd/MM/yyyy'),
  //     orderStatus,
  //     paymentStatus,
  //     status,
  //     stitches,
  //     quantity,
  //     unitPrice,
  //     total,
  //     orderTotal: totalAmount,
  //     totalPaid,
  //     balanceRemaining,
  //     orderItemId: id,
  //     orderId
  //   }
  // })

}

export type GetSalesResult = Awaited<ReturnType<typeof getSales>>;

export const getViewOrders = async () => {

  const results = await db.query.orders.findMany({
    with: {
      customers: true,
    }
  })

  return results.map((order) => {
    const { id, orderDate, customers, totalAmount, totalPaid, orderStatus, status, paymentStatus, validUntil } = order
    const balanceRemaining = Number(Big(totalAmount).minus(totalPaid).toFixed(2))
    return {
      orderId: id,
      orderDate,
      validUntil,
      fullName: customers.fullName,
      orderTotal: totalAmount,
      totalPaid,
      balanceRemaining,
      orderStatus,
      status,
      paymentStatus,
    }
  })

}

export type GetViewOrdersResult = Awaited<ReturnType<typeof getViewOrders>>;


export const getOrders = async () => {

  return await db.query.orders.findMany({
    with: {
      customers: true,
    }
  })

  // return results.map((order) => {

  // return { fullName: customers.fullName, id, totalAmount, totalPaid, orderStatus, status, paymentStatus, orderDate: formatDate(new Date(orderDate), 'dd/MM/yyyy') }
  // })

}

export type GetOrdersResult = Awaited<ReturnType<typeof getOrders>>;

export const getOrderDetails = async (orderId: number) => {

  const [orderData, orderItemsData] = await Promise.all([
    await (db.select().from(orders).where(eq(orders.id, orderId))),
    await db.select().from(orderItems).where(eq(orderItems.orderId, orderId))
  ]);

  if (!orderData.length) error(404, { message: `Order ${orderId} not found` });

  const orderItemsMap = new Map<number, OrderItems>()
  orderItemsData.forEach((item) => orderItemsMap.set(item.productId, item))
  const productsIds = Array.from(orderItemsMap.keys())

  const [customerData, productsData] = await Promise.all([
    await db.select().from(customers).where(eq(customers.id, orderData[0].customerId)),
    await db.select().from(products).where(inArray(products.id, productsIds))
  ]);

  const productsMap = new Map<number, Products>()
  productsData.forEach((product) => productsMap.set(product.id, product))

  let subtotal = Big(0)

  const bodyDataList: [string, string, number, string, string][] = []
  const bodyDataObject: { productName: string, productCategory: string, quantity: number, unitPrice: string, total: string }[] = []

  orderItemsMap.values().forEach((item) => {
    const productName = productsMap.get(item.productId)?.name as string;
    const productCategory = productsMap.get(item.productId)?.productCategory as string;
    const unitPrice = Big(item.unitPrice).toFixed(2)
    const total = Big(item.unitPrice).mul(item.quantity).toFixed(2);
    subtotal = subtotal.add(total)
    bodyDataList.push([productName, productCategory, item.quantity, unitPrice, total]);
    bodyDataObject.push({ productName, productCategory, quantity: item.quantity, unitPrice, total })
  });

  const tax = subtotal.mul(0)
  const grandTotal = subtotal.plus(tax)

  const orderTotals = { subtotal: subtotal.toFixed(2), tax: tax.toFixed(2), grandTotal: grandTotal.toFixed(2) }

  return {
    customerData: customerData[0],
    orderData: orderData[0],
    orderItemsMap,
    productsMap,
    bodyDataList,
    bodyDataObject,
    orderTotals
  }

}

export type GetOrderDetails = Awaited<ReturnType<typeof getOrderDetails>>;

export const getOrderById = async (orderId: number) => {

  return await db.select().from(orders).where(eq(orders.id, orderId))

}
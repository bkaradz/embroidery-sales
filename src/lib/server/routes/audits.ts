import Big from "big.js";
import { db } from "../db";

export const auditTransaction = async () => {

  const results = await db.query.transaction.findMany({
    with: {
      payments: true,
      credits: true
    }
  })

  return results.map((trans) => {

    const { id, credits, payments, totalAmountTransacted } = trans

    const paymentsSum = payments.reduce((previous, current) => previous.add(current.amount), Big(0))

    const credit = credits ? Big(credits.amount) : Big(0)

    const total = paymentsSum.plus(credit)

    const status = total.eq(totalAmountTransacted) ? "Balanced" : "Unbalanced"

    return {
      transactionId: id,
      transactionAmount: totalAmountTransacted,
      totalPayments: Number(paymentsSum.toFixed(2)),
      creditAmount: Number(credit.toFixed(2)),
      status
    }
  })

};

export const auditCustomer = async () => {

  const results = await db.query.customers.findMany({
    with: {
      payments: true,
      credits: true,
      transaction: true,
      orders: {
        where: (orders, { ne, and }) => (and(ne(orders.orderStatus, "Quotation"), ne(orders.orderStatus, "Canceled"))),
      }
    }
  })

  const customerTotals = results.map((customer) => {

    const { id, fullName, credits, payments, transaction, orders } = customer
    const paymentsSum = payments.reduce((previous, current) => previous.add(current.amount), Big(0))
    const creditsSum = credits.reduce((previous, current) => previous.add(current.amount), Big(0))
    const transactionSum = transaction.reduce((previous, current) => previous.add(current.totalAmountTransacted), Big(0))
    const ordersSum = orders.reduce((previous, current) => {
      return {
        totalAmount: previous.totalAmount.add(current.totalAmount),
        totalPaid: previous.totalPaid.add(current.totalPaid),
        balanceRemaining: previous.totalAmount.add(current.totalAmount).minus(previous.totalPaid.add(current.totalPaid))
      }

    }, { totalAmount: Big(0), totalPaid: Big(0), balanceRemaining: Big(0) })

    return {
      customerId: id,
      customerName: fullName,
      transactionSum,
      paymentsSum,
      creditsSum,
      ordersSum,
      numberOfOrders: orders.length
    }

  })

  const filterCustomers = customerTotals.filter((customer) => customer.ordersSum.totalAmount.gt(0))

  return filterCustomers

};
export const auditCustomerById = async (customerId: number) => {

  const results = await db.query.customers.findMany({
    where: (customers, { eq }) => (eq(customers.id, customerId)),
    with: {
      payments: true,
      credits: true,
      transaction: true,
      orders: {
        where: (orders, { ne, and }) => (and(ne(orders.orderStatus, "Quotation"), ne(orders.orderStatus, "Canceled"))),
      }
    }
  })

  const customerTotals = results.map((customer) => {

    const { id, fullName, credits, payments, transaction, orders } = customer
    const paymentsSum = payments.reduce((previous, current) => previous.add(current.amount), Big(0))
    const creditsSum = credits.reduce((previous, current) => previous.add(current.amount), Big(0))
    const transactionSum = transaction.reduce((previous, current) => previous.add(current.totalAmountTransacted), Big(0))
    const ordersSum = orders.reduce((previous, current) => {
      return {
        totalAmount: previous.totalAmount.add(current.totalAmount),
        totalPaid: previous.totalPaid.add(current.totalPaid),
        balanceRemaining: previous.totalAmount.add(current.totalAmount).minus(previous.totalPaid.add(current.totalPaid))
      }

    }, { totalAmount: Big(0), totalPaid: Big(0), balanceRemaining: Big(0) })

    return {
      customerId: id,
      customerName: fullName,
      transactionSum,
      paymentsSum,
      creditsSum,
      ordersSum,
      numberOfOrders: orders.length
    }

  })

  const filterCustomers = customerTotals.filter((customer) => customer.ordersSum.totalAmount.gt(0))

  return filterCustomers

};

export const auditPayments = async () => {

  const results = await db.query.orders.findMany({
    // where: (orders, { eq }) => (eq(orders.paymentStatus, 'Paid')),
    with: {
      payments: true
    }
  })

  return results.map((order) => {

    const { paymentStatus, totalAmount, totalPaid, payments, id } = order

    const paymentsSum = payments.reduce((previous, current) => Big(current.amount).plus(previous), Big(0))

    if (paymentStatus === 'Paid') {

      const status = paymentsSum.eq(totalAmount) ? "Balanced" : "Unbalanced"

      return {
        orderId: id,
        paymentStatus,
        totalAmount,
        totalPaid,
        paymentsSum: Number(paymentsSum.toFixed(2)),
        status
      }
    }

    if (paymentStatus === 'Partially Paid') {

      const status = paymentsSum.eq(totalPaid) ? "Balanced" : "Unbalanced"

      return {
        orderId: id,
        paymentStatus,
        totalAmount,
        totalPaid,
        paymentsSum: Number(paymentsSum.toFixed(2)),
        status
      }
    }

    if (paymentStatus === 'Unpaid') {

      const status = paymentsSum.eq(0) ? "Balanced" : "Unbalanced"

      return {
        orderId: id,
        paymentStatus,
        totalAmount,
        totalPaid,
        paymentsSum: Number(paymentsSum.toFixed(2)),
        status
      }
    }

    if (paymentStatus === 'Refunded') {

      // Because we don't know at which stage it was refunded
      const status = "Unknown"

      return {
        orderId: id,
        paymentStatus,
        totalAmount,
        totalPaid,
        paymentsSum: Number(paymentsSum.toFixed(2)),
        status
      }
    }
  })
};

export const totalOwedByCustomers = async () => {

  const results = await db.query.customers.findMany({
    // where: (orders, { eq }) => (eq(orders.paymentStatus, 'Paid')),
    with: {
      orders: {
        where: (orders, { ne, and }) => (and(ne(orders.orderStatus, "Quotation"), ne(orders.orderStatus, "Canceled"))),
      },
      credits: true,
    }
  })

  return results.map((customer) => {
    const { id, fullName, phone, orders, credits } = customer

    const creditsSum = credits.reduce((previous, current) => previous.add(current.amount), Big(0))

    const totalAmountOwed = orders.reduce((previous, current) => previous.add(Big(current.totalAmount).minus(current.totalPaid)), Big(0))

    return { customerId: id, customerName: fullName, phone, creditsSum, totalAmountOwed }

  })

}

export const totalOwedByCustomersById = async (customerId: number) => {

  const results = await db.query.customers.findMany({
    where: (customers, { eq }) => (eq(customers.id, customerId)),
    with: {
      orders: {
        where: (orders, { ne, and }) => (and(ne(orders.orderStatus, "Quotation"), ne(orders.orderStatus, "Canceled"))),
      },
      credits: true,
    }
  })

  return results.map((customer) => {
    const { id, fullName, phone, orders, credits } = customer

    const creditsSum = credits.reduce((previous, current) => previous.add(current.amount), Big(0))

    const totalAmountOwed = orders.reduce((previous, current) => previous.add(Big(current.totalAmount).minus(current.totalPaid)), Big(0))

    const balance = totalAmountOwed.minus(creditsSum)

    return { customerId: id, customerName: fullName, phone, creditsSum, totalAmountOwed, balance }

  })

}

/**
 *  SELECT COALESCE(SUM(balanceRemaining), 0) AS total_amount_owed
    FROM orders
    WHERE customer_id = <customer_id>
    AND order_status NOT IN ('Cancelled', 'Quotation');
 */

/**
 * 
    SELECT 
    product_id,
    SUM(quantity_change) AS quantity_on_hand
    FROM inventory_transactions
    WHERE product_id = 200
    GROUP BY product_id;
 */
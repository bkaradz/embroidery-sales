
export const generateOrderNumber = (orderId: number, prefix = '') => {

  const NUMBER_OF_DIGITS = 6

  // const prefix = '' // INV for invoice
  // const numberOfZero = 
  const numberOfZero = (xZero: number) => {
    const zeros = []
    for (let index = 0; index < xZero; index++) {
      zeros.push(0)
    }
    return zeros.join('')
  }

  const orderIdToString = orderId.toString()

  const leadingZeros = numberOfZero(NUMBER_OF_DIGITS - orderIdToString.length)

  return [prefix, leadingZeros, orderIdToString].join('')

}
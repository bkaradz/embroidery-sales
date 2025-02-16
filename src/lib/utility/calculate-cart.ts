import type { PricingTierDetails } from "$lib/server/db/schema/schema";
import Big from 'big.js';
import type { CartItem } from "./schemas";
import { error } from "@sveltejs/kit";

export function calculateCart(pricingTierDetailsData: PricingTierDetails[], cartProducts: CartItem[]) {
  let quantity = 0;
  let unitPrice = Big(0);
  let total = Big(0);
  const totalAmount: Big[] = [];
  let submitValues: { productId: number; quantity: number; }[] = [];

  // sort price tiers by min_quantity before you iterate map function
  const sortedPricingTier = pricingTierDetailsData.sort((a, b) => a.minQuantity - b.minQuantity);

  const items = cartProducts.map((cartItem) => {

    quantity = cartItem.quantity;
    if (!quantity) error(404, { message: `Quantity not found` });

    if (!cartItem.isEmbroidery) {

      if (!cartItem.basePrice) error(404, { message: `Base price not found` });
      unitPrice = Big(cartItem.basePrice);
      total = Big(unitPrice).mul(quantity)

      totalAmount.push(total);
      return { ...cartItem, total, unitPrice };

    } else {

      const stitches = cartItem.stitches;
      if (!stitches) error(404, { message: `Stitches not found` });

      // get price tier from quantity
      const selectPricingTier = (quantity: number) => {
        return sortedPricingTier.find(
          (item) => item.minQuantity <= quantity &&
            (item.maxQuantity === null || item.maxQuantity >= quantity)
        );
      };

      const pricingTier = selectPricingTier(quantity);

      // calculate unit price from price tier
      if (!pricingTier) error(404, { message: `Pricing tier not found` });
      const priceForStitches = Big(stitches).div(1000).mul(pricingTier.pricePer1000Stitches);

      // minimum price for embroidery in this pricing tier
      const minimumPrice = Big(pricingTier.minimumPrice);

      // unit price for embroidery in this pricing tier
      const unitPrice = Big(Math.max(Number(priceForStitches), Number(minimumPrice)));

      // calculate total
      total = Big(unitPrice).mul(quantity);

      totalAmount.push(Big(total.toFixed(2)));
      return { ...cartItem, total, unitPrice };

    }
  });
  const subtotal = totalAmount.reduce((accumulator, currentValue) => (Big(accumulator).plus(currentValue)), Big(0));
  const totalQuantity = items.reduce((accumulator, currentValue) => accumulator + currentValue.quantity, 0);
  const totalProducts = items.length;
  const tax = Big(subtotal).mul(0);
  const grandTotal = Big(subtotal).plus(tax);

  submitValues = items.map((item) => {
    return {
      productId: item.id,
      quantity: item.quantity
    };
  });

  return { items, subtotal, tax, grandTotal, totalProducts, totalQuantity, submitValues };
}
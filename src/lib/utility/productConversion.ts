import type { NewProducts } from "$lib/server/db/schema/schema";

export type ConProduct = Omit<NewProducts, 'stitches'> & { stitches: number | string }

export function productDataConversion(userId: string, product: ConProduct) {

  let dataResult: NewProducts = { name: '', userId };

  if (typeof product?.stitches === "number" || (typeof product?.stitches === "string" && product?.stitches.length !== 0)) {

    if (product?.stitches) dataResult = { ...dataResult, stitches: +product.stitches };
    if (product?.description) dataResult = { ...dataResult, description: product.description.trim() };
    dataResult = { ...dataResult, productCategory: 'Embroidery' };
    dataResult = { ...dataResult, isEmbroidery: true };
    dataResult = { ...dataResult, userId };
    if (product?.name) dataResult = { ...dataResult, name: product.name.trim() };

  } else {

    if (product?.description) dataResult = { ...dataResult, description: product.description.trim() };

    if (product?.productCategory === 'Embroidery' || product?.productCategory === undefined) {
      dataResult = { ...dataResult, productCategory: 'Other' };
    } else {
      dataResult = { ...dataResult, productCategory: product.productCategory };
    }

    dataResult = { ...dataResult, isEmbroidery: false };
    dataResult = { ...dataResult, userId };
    if (product?.name) dataResult = { ...dataResult, name: product.name.trim() };
    if (product?.basePrice) {
      const unitPrice = +product.basePrice;

      if (unitPrice > 0) {
        dataResult = { ...dataResult, basePrice: unitPrice };
      } else {
        dataResult = { ...dataResult, basePrice: 0 };
      }
    }
  }
  return dataResult;
}
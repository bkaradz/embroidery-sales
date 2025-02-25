import type { Products } from '$lib/server/db/schema/schema';
import { z } from 'zod';
import { currencyCode, currencyName, expensesCategories, orderStatus, timeStatus, transactionPaymentMethods } from './lists';
import { productCategories } from './config-list';
import type { GetProducts } from '$lib/server/routes/products';

export const productSchema = z
  .object({
    basePrice: z.number().optional(),
    stockQuantity: z.number().optional(),
    isEmbroidery: z.boolean().default(true),
    productCategory: z.enum(productCategories).default('Threads'),
    stitches: z.number().optional(),
    hash: z.string().optional(),
    id: z.number().optional(),
    userId: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    isDeleted: z.boolean().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (data.productCategory === 'Embroidery' && !data.isEmbroidery) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `isEmbroidery must be true`,
        path: ['isEmbroidery']
      });
    }
    if (data.productCategory !== 'Embroidery' && data.isEmbroidery) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `isEmbroidery must be false`,
        path: ['isEmbroidery']
      });
    }
    if (data.productCategory === 'Embroidery' && !data.stitches) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Stitches are required`,
        path: ['stitches']
      });
    }
    if (data.productCategory !== 'Embroidery' && !data.basePrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unit price is required`,
        path: ['basePrice']
      });
    }
    if (!(data.isEmbroidery || data.productCategory === 'Services') && !data.stockQuantity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Stock quantity is required`,
        path: ['stockQuantity']
      });
    }
  });

export type ProductSchema = z.infer<typeof productSchema>;

export const productArraySchema = z.array(productSchema);

export type ProductArraySchema = z.infer<typeof productArraySchema>;

export const paymentsSchema = z.object({
  customerId: z.number(),
  ordersPaidIds: z.array(z.number()),
  creditsIds: z.array(z.number()),
  amountPaidData: z.discriminatedUnion('paymentMethod', [
    z.object({
      paymentMethod: z.literal('Cash'),
      ordersTotal: z.number(),
      amountPaid: z.number(),
      cashData: z.array(
        z.object({
          code: z.enum(currencyCode),
          amount: z.number(),
          checked: z.literal(true),
          label: z.string()
        })
      )
    }),
    z.object({
      paymentMethod: z.literal('Bank'),
      bank: z.enum(['bancABC', 'stewartBank']),
      ordersTotal: z.number(),
      amountPaid: z.number(),
      referenceNumber: z.string(),
      bankMobileCardPaidAmount: z.number()
    }),
    z.object({
      paymentMethod: z.literal('Mobile'),
      mobile: z.enum(['ecoCash', 'oneMoney']),
      ordersTotal: z.number(),
      amountPaid: z.number(),
      referenceNumber: z.string(),
      bankMobileCardPaidAmount: z.number()
    }),
    z.object({
      paymentMethod: z.literal('Card'),
      ordersTotal: z.number(),
      amountPaid: z.number(),
      referenceNumber: z.string(),
      bankMobileCardPaidAmount: z.number()
    })
  ])
});

export type PaymentsSchema = z.infer<typeof paymentsSchema>;

export const registerSchema = z.object({
  openingBalance: z.number(),
  usd: z.number().optional(),
  rand: z.number().optional(),
  pula: z.number().optional(),
  zig: z.number().optional()
});

export type RegisterSchema = z.infer<typeof registerSchema>;

export const expensesSchema = z.object({
  category: z.enum(expensesCategories),
  currency: z.enum(currencyName),
  paymentMethod: z.enum(transactionPaymentMethods),
  description: z.string().optional(),
  amount: z.number().gt(0),
  receipt: z.string().nonempty()
});

export type ExpensesSchema = z.infer<typeof expensesSchema>;

export type CartItem = Products & { quantity: number; total: number; unitPrice: number };

export const newCustomerSchema = z.object({
  id: z.number().optional(),
  userId: z.string().optional(),
  isDeleted: z.boolean().default(false),
  fullName: z.string().min(5),
  isCorporate: z.boolean().default(false),
  phone: z.string().min(5),
  email: z.string().email().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  tin: z.string().optional()
});

export type NewCustomer = z.infer<typeof newCustomerSchema>;

export const ordersSchema = z.object({
  customerId: z.number(),
  orderStatus: z.enum(orderStatus),
  pricingTierId: z.number(),
  purchaseOrderNumber: z.string().optional(),
  userId: z.string().optional(),
  status: z.enum(timeStatus).optional(),
  items: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number()
    })
  )
});

export type OrdersSchema = z.infer<typeof ordersSchema>;

export const pricingTierSchema = z.object({
  pricingTier: z.object({
    id: z.number().optional(),
    userId: z.string().optional(),
    isDeleted: z.boolean().optional(),
    name: z.string(),
    default: z.boolean()
  }),
  pricingTierDetails: z.array(
    z.object({
      id: z.number().optional(),
      minQuantity: z.number(),
      maxQuantity: z.number().or(z.null()),
      minimumPrice: z.number(),
      pricePer1000Stitches: z.number()
    })
  )
});

export type PricingTierSchema = z.infer<typeof pricingTierSchema>;

export const currenciesSchema = z.object({
  currencies: z.object({
    id: z.number().optional(),
    userId: z.string().optional(),
    isDeleted: z.boolean().optional(),
    name: z.string(),
    default: z.boolean()
  }),
  currenciesDetails: z.array(
    z.object({
      id: z.number().optional(),
      code: z.string(),
      name: z.string(),
      symbol: z.string(),
      exchangeRate: z.number(),
    })
  )
});

export type CurrenciesSchema = z.infer<typeof currenciesSchema>;

export type NewProduct = Omit<GetProducts[0], 'basePrice'> & { basePrice: number | string | null };

export type Converter = {
  defaultCurrency: string;
  currencies: {
    [currency: string]: {
      rate: number;
      symbol: string;
    };
  };
}
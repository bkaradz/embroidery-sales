import { logger } from '$lib/utility/logger';
import type { PricingTierSchema } from '$lib/utility/schemas';
import { db } from '../db';
import { pricingTier, pricingTierDetails } from '../db/schema/schema';

export const createNewPricingTier = async (userId: string, data: PricingTierSchema) => {
  try {
    await db.transaction(async (tx) => {
      // If default is true reset all defaults to false
      if (data.pricingTier.default) {
        await tx.update(pricingTier).set({ default: false });
      }

      const tierId = await tx.insert(pricingTier).values({ ...data.pricingTier, userId, isDeleted: false }).returning({ id: pricingTier.id });

      const newPricingTierDetails = data.pricingTierDetails.map((tier) => {
        return { ...tier, pricingTierId: tierId[0].id };
      });

      await tx.insert(pricingTierDetails).values(newPricingTierDetails);
    })
    return { success: true }
  } catch (error) {
    logger.error({ 'module': 'pricingTier.ts', 'function': 'createNewPricingTier', err: error },)
    throw new Error("Pricing Tier creation failed");
  }
};

export const getDefaultPricingTiers = async () => {
  const results = await db.query.pricingTier.findMany({
    where: (pricingTier, { eq }) => eq(pricingTier.default, true),
    with: {
      pricingTierDetails: true
    }
  });

  return results[0].pricingTierDetails;
};

export const getPricingTiers = async () => {
  return await db.query.pricingTier.findMany({
    where: (pricingTier, { eq }) => eq(pricingTier.isDeleted, false),
    with: {
      pricingTierDetails: true
    }
  });
};

export const getPricingTiersById = async (id: number) => {
  return await db.query.pricingTier.findMany({
    where: (pricingTier, { eq }) => eq(pricingTier.id, id),
    with: {
      pricingTierDetails: true
    }
  });
};
